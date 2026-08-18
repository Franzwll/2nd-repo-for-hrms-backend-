<?php
/**
 * Local SMTP inbox for development.
 * - SMTP sink on  127.0.0.1:2525  (accepts any mail, stores .eml files)
 * - Web inbox on  http://127.0.0.1:8025
 *
 * Usage:  php scripts/smtp-inbox.php
 */

$host = '127.0.0.1';
$smtpPort = 2525;
$httpPort = 8025;
$maildrop = dirname(__DIR__) . '/storage/maildrop';

if (!is_dir($maildrop)) {
    mkdir($maildrop, 0777, true);
}

$smtp = stream_socket_server("tcp://{$host}:{$smtpPort}", $errno, $errstr);
if (!$smtp) {
    fwrite(STDERR, "SMTP bind failed: {$errstr}\n");
    exit(1);
}

$http = stream_socket_server("tcp://{$host}:{$httpPort}", $errno, $errstr);
if (!$http) {
    fwrite(STDERR, "HTTP bind failed: {$errstr}\n");
    exit(1);
}

fwrite(STDOUT, "SMTP inbox listening on {$host}:{$smtpPort}\n");
fwrite(STDOUT, "Web inbox at http://{$host}:{$httpPort}\n");

$clients = [];
$nextId = 1;

while (true) {
    $read = [$smtp, $http];
    foreach ($clients as $c) {
        $read[] = $c['sock'];
    }
    $write = null;
    $except = null;

    $ready = @stream_select($read, $write, $except, 1);
    if ($ready === false) {
        continue;
    }

    foreach ($read as $r) {
        if ($r === $smtp) {
            $conn = stream_socket_accept($smtp, 0);
            if ($conn) {
                stream_set_blocking($conn, false);
                $clients[$nextId] = [
                    'sock' => $conn,
                    'type' => 'smtp',
                    'buf' => '',
                    'inData' => false,
                    'from' => null,
                    'recipients' => [],
                    'data' => '',
                ];
                fwrite($conn, "220 localhost SMTP inbox ready\r\n");
                $nextId++;
            }
            continue;
        }

        if ($r === $http) {
            $conn = stream_socket_accept($http, 0);
            if ($conn) {
                stream_set_blocking($conn, false);
                $clients[$nextId] = ['sock' => $conn, 'type' => 'http', 'buf' => ''];
                $nextId++;
            }
            continue;
        }

        $id = null;
        foreach ($clients as $k => $c) {
            if ($c['sock'] === $r) {
                $id = $k;
                break;
            }
        }
        if ($id === null) {
            continue;
        }

        $chunk = fread($r, 8192);
        if ($chunk === false || $chunk === '') {
            fclose($r);
            unset($clients[$id]);
            continue;
        }

        $clients[$id]['buf'] .= $chunk;

        if ($clients[$id]['type'] === 'http') {
            if (strpos($clients[$id]['buf'], "\r\n\r\n") !== false) {
                $request = $clients[$id]['buf'];
                $first = strtok($request, "\r\n");
                $path = trim(explode(' ', $first)[1] ?? '/');
                $body = httpResponse($path, $maildrop);
                fwrite($r, $body);
                fclose($r);
                unset($clients[$id]);
            }
            continue;
        }

        while (($pos = strpos($clients[$id]['buf'], "\n")) !== false) {
            $line = substr($clients[$id]['buf'], 0, $pos);
            $clients[$id]['buf'] = substr($clients[$id]['buf'], $pos + 1);
            $line = rtrim($line, "\r");

            $ok = handleSmtpLine($clients[$id], $line, $maildrop);
            if (!$ok) {
                break;
            }
        }
    }
}

function handleSmtpLine(array &$c, string $line, string $maildrop): bool
{
    if ($c['inData']) {
        if ($line === '.') {
            saveMessage($maildrop, $c['from'], $c['recipients'], $c['data']);
            fwrite($c['sock'], "250 OK queued\r\n");
            $c['inData'] = false;
            $c['data'] = '';
            $c['from'] = null;
            $c['recipients'] = [];
        } else {
            $c['data'] .= $line . "\r\n";
        }
        return true;
    }

    $cmd = strtoupper(strtok($line, ' '));
    $arg = trim(substr($line, strlen($cmd)));

    switch ($cmd) {
        case 'EHLO':
        case 'HELO':
            fwrite($c['sock'], "250-localhost Hello\r\n");
            fwrite($c['sock'], "250 SIZE 52428800\r\n");
            break;
        case 'MAIL':
            $c['from'] = $arg;
            fwrite($c['sock'], "250 OK\r\n");
            break;
        case 'RCPT':
            $c['recipients'][] = $arg;
            fwrite($c['sock'], "250 OK\r\n");
            break;
        case 'DATA':
            $c['inData'] = true;
            $c['data'] = '';
            fwrite($c['sock'], "354 End data with <CR><LF>.<CR><LF>\r\n");
            break;
        case 'RSET':
            $c['from'] = null;
            $c['recipients'] = [];
            $c['inData'] = false;
            $c['data'] = '';
            fwrite($c['sock'], "250 OK\r\n");
            break;
        case 'NOOP':
            fwrite($c['sock'], "250 OK\r\n");
            break;
        case 'QUIT':
            fwrite($c['sock'], "221 Bye\r\n");
            return false;
        default:
            fwrite($c['sock'], "250 OK\r\n");
    }

    return true;
}

function saveMessage(string $maildrop, ?string $from, array $recipients, string $data): void
{
    $eml = "X-SMTP-Inbox-From: " . ($from ?? '') . "\r\n"
        . "X-SMTP-Inbox-To: " . implode(', ', $recipients) . "\r\n"
        . "X-SMTP-Inbox-Date: " . date(DATE_RFC2822) . "\r\n"
        . $data;

    $file = $maildrop . '/msg_' . date('Ymd_His') . '_' . substr((string) random_int(1000, 9999), 0, 4) . '.eml';
    file_put_contents($file, $eml);
}

function httpResponse(string $path, string $maildrop): string
{
    $files = glob($maildrop . '/*.eml') ?: [];
    usort($files, fn ($a, $b) => filemtime($b) - filemtime($a));

    if (preg_match('#^/raw\?f=([^&]+)#', $path, $m)) {
        $name = basename(urldecode($m[1]));
        $file = $maildrop . '/' . $name;
        if (is_file($file)) {
            $content = htmlspecialchars(file_get_contents($file));
            return "HTTP/1.1 200 OK\r\nContent-Type: text/plain; charset=utf-8\r\nContent-Length: "
                . strlen($content) . "\r\nConnection: close\r\n\r\n" . $content;
        }
        return "HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\nConnection: close\r\n\r\nNot found";
    }

    $rows = '';
    foreach ($files as $f) {
        $eml = file_get_contents($f);
        $subject = headerValue($eml, 'Subject', '(no subject)');
        $from = headerValue($eml, 'X-SMTP-Inbox-From', '(unknown)');
        $to = headerValue($eml, 'X-SMTP-Inbox-To', '(unknown)');
        $date = headerValue($eml, 'X-SMTP-Inbox-Date', '');
        $size = number_format(strlen($eml));
        $name = basename($f);
        $rows .= "<tr>"
            . "<td>" . e($date) . "</td>"
            . "<td>" . e($from) . "</td>"
            . "<td>" . e($to) . "</td>"
            . "<td>" . e($subject) . "</td>"
            . "<td>" . $size . " bytes</td>"
            . "<td><a href=\"/raw?f=" . urlencode($name) . "\">view raw</a></td>"
            . "</tr>\n";
    }

    $body = "<!DOCTYPE html><html><head><meta charset=\"utf-8\"><title>Local SMTP Inbox</title>"
        . "<style>body{font-family:system-ui,sans-serif;margin:24px;color:#1f2937}h1{font-size:20px}"
        . "table{border-collapse:collapse;width:100%;font-size:13px}th,td{border:1px solid #e5e7eb;padding:6px 10px;text-align:left}"
        . "th{background:#f3f4f6}a{color:#520c19}</style></head><body>"
        . "<h1>Local SMTP Inbox (" . count($files) . " messages)</h1>"
        . ($files ? "<table><tr><th>Received</th><th>From</th><th>To</th><th>Subject</th><th>Size</th><th></th></tr>"
            . $rows . "</table>" : "<p>No messages yet. Trigger a login to receive an OTP email.</p>")
        . "</body></html>";

    return "HTTP/1.1 200 OK\r\nContent-Type: text/html; charset=utf-8\r\nContent-Length: "
        . strlen($body) . "\r\nConnection: close\r\n\r\n" . $body;
}

function headerValue(string $eml, string $name, string $default): string
{
    if (preg_match('/^' . preg_quote($name, '/') . ': ?(.*)$/mi', $eml, $m)) {
        return trim($m[1]);
    }
    return $default;
}

function e(string $s): string
{
    return htmlspecialchars($s, ENT_QUOTES, 'UTF-8');
}
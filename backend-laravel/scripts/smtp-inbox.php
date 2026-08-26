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

    if (preg_match('#^/html\?f=([^&]+)#', $path, $m)) {
        $name = basename(urldecode($m[1]));
        $file = $maildrop . '/' . $name;
        if (is_file($file)) {
            $raw = file_get_contents($file);
            $parts = preg_split("/\r?\n\r?\n/", $raw, 2);
            $body = $parts[1] ?? $raw;
            if (stripos($raw, 'Content-Transfer-Encoding: quoted-printable') !== false) {
                $body = quoted_printable_decode($body);
            }
            return "HTTP/1.1 200 OK\r\nContent-Type: text/html; charset=utf-8\r\nContent-Length: "
                . strlen($body) . "\r\nConnection: close\r\n\r\n" . $body;
        }
        return "HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\nConnection: close\r\n\r\nNot found";
    }

    if (preg_match('#^/raw\?f=([^&]+)#', $path, $m)) {
        $name = basename(urldecode($m[1]));
        $file = $maildrop . '/' . $name;
        if (is_file($file)) {
            $content = file_get_contents($file);
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
        $name = basename($f);

        // Extract OTP
        $otp = '—';
        if (preg_match('/>(\d{6})</', $eml, $otpMatch) || preg_match('/\b(\d{6})\b/', $eml, $otpMatch)) {
            $otp = $otpMatch[1];
        }

        $rows .= "<tr>"
            . "<td style=\"white-space:nowrap;\">" . e($date) . "</td>"
            . "<td>" . e($to) . "</td>"
            . "<td>" . e($subject) . "</td>"
            . "<td><span style=\"background:#520c19;color:#fff;padding:4px 10px;border-radius:6px;font-size:16px;font-weight:bold;letter-spacing:2px;font-family:monospace;\">" . e($otp) . "</span></td>"
            . "<td>"
            . "<a href=\"/html?f=" . urlencode($name) . "\" target=\"_blank\" style=\"margin-right:12px;font-weight:600;\">Preview Email</a>"
            . "<a href=\"/raw?f=" . urlencode($name) . "\" style=\"color:#6b7280;\">Raw</a>"
            . "</td>"
            . "</tr>\n";
    }

    $body = "<!DOCTYPE html><html><head><meta charset=\"utf-8\"><title>Local SMTP Inbox</title>"
        . "<meta http-equiv=\"refresh\" content=\"5\">"
        . "<style>body{font-family:system-ui,-apple-system,sans-serif;margin:32px;background:#f9fafb;color:#1f2937}"
        . "h1{font-size:22px;color:#111827;display:flex;align-items:center;gap:12px;}"
        . ".badge{background:#e0e7ff;color:#3730a3;font-size:12px;padding:2px 8px;border-radius:12px;font-weight:normal}"
        . "table{border-collapse:separate;border-spacing:0;width:100%;background:#fff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.05);}"
        . "th,td{padding:12px 16px;text-align:left;border-bottom:1px solid #f3f4f6}"
        . "th{background:#f9fafb;font-weight:600;font-size:13px;color:#4b5563;border-bottom:1px solid #e5e7eb;}"
        . "tr:last-child td{border-bottom:none}"
        . "a{color:#520c19;text-decoration:none}a:hover{text-decoration:underline}"
        . ".auto-refresh{font-size:12px;color:#6b7280;margin-top:8px;}</style></head><body>"
        . "<h1>📬 Local SMTP Inbox <span class=\"badge\">" . count($files) . " messages</span></h1>"
        . "<p class=\"auto-refresh\">Auto-refreshes every 5 seconds.</p>"
        . ($files ? "<table style=\"margin-top:16px;\"><tr><th>Received</th><th>To</th><th>Subject</th><th>OTP Code</th><th>Actions</th></tr>"
            . $rows . "</table>" : "<p style=\"padding:24px;background:#fff;border-radius:8px;border:1px solid #e5e7eb;\">No messages yet. Trigger a login to receive an OTP email.</p>")
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
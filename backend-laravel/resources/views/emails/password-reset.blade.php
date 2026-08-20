<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Reset Your Password</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:480px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.12);border:1px solid #e5e7eb;">
          <tr>
            <td style="background:linear-gradient(135deg,#520c19 0%,#7a1226 60%,#8f1a2e 100%);padding:24px 24px;text-align:center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="vertical-align:middle;">
                    <img src="{{ $message->embed(resource_path('views/emails/oxford-mark-white.png')) }}" alt="Oxford Suites Makati" width="72" style="display:inline-block;width:72px;height:auto;vertical-align:middle;" />
                  </td>
                </tr>
                <tr>
                  <td align="center" style="vertical-align:middle;">
                    <p style="margin:12px 0 0;color:#ffffff;font-size:19px;font-weight:bold;letter-spacing:0.12em;text-transform:uppercase;">Oxford Suites</p>
                    <p style="margin:2px 0 0;color:#d4af37;font-size:12px;letter-spacing:0.35em;font-weight:bold;text-transform:uppercase;">Makati</p>
                    <p style="margin:8px 0 0;color:#e8c9a0;font-size:10px;letter-spacing:0.25em;font-weight:bold;text-transform:uppercase;">Account Security</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 28px 12px;text-align:center;">
              <h1 style="margin:0 0 8px;font-size:18px;color:#1f2937;">Reset your password</h1>
              <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.6;">Hello {{ $name }}, we received a request to reset the password for your HRMS account. Click the button below to choose a new one. This link expires in <strong>{{ $expiresInMinutes }} minutes</strong>.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 28px;text-align:center;">
              <a href="{{ $resetUrl }}" style="display:inline-block;background-color:#520c19;color:#ffffff;font-size:15px;font-weight:bold;letter-spacing:0.06em;text-decoration:none;border-radius:10px;padding:14px 34px;">Reset Password</a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff7ed;border:1px solid #fde68a;border-radius:10px;">
                <tr>
                  <td style="padding:14px 16px;text-align:center;">
                    <p style="margin:0;font-size:13px;color:#92400e;line-height:1.6;text-align:center;">
                      <strong>Didn't request this?</strong> If you didn't ask to reset your password, you can safely ignore this email. Your password will not change unless you click the link above. Report anything suspicious to HR.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f9fafb;border-top:1px solid #eef0f2;padding:18px 28px;">
              <p style="margin:0;font-size:11px;color:#9ca3af;line-height:1.6;text-align:center;">
                This is an automated message from the Oxford Suites Makati HRMS portal.<br/>
                If the button above does not work, copy and paste this link into your browser: {{ $resetUrl }}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
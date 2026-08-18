<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>OTP Verification</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:480px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.06);">
          <tr>
            <td style="background-color:#520c19;padding:24px;text-align:center;">
              <p style="margin:0;color:#ffffff;font-size:16px;font-weight:bold;letter-spacing:0.08em;">Oxford Suites Makati</p>
              <p style="margin:4px 0 0;color:#d4af37;font-size:11px;letter-spacing:0.2em;font-weight:bold;">HRMS PORTAL</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 28px 8px;">
              <h1 style="margin:0 0 8px;font-size:18px;color:#1f2937;">Your verification code</h1>
              <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.5;">Hello {{ $name }}, use the code below to finish signing in. It expires in {{ $expiresInMinutes }} minutes.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 28px;">
              <div style="text-align:center;background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:18px;font-size:32px;font-weight:bold;letter-spacing:0.35em;color:#520c19;font-family:'Courier New',monospace;">{{ $code }}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 24px;">
              <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.5;">If you did not request this code, ignore this email and notify HR immediately. Never share your code with anyone.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
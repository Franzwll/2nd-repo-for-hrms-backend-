<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Interview Cancelled &mdash; Oxford Suites Makati</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:520px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.12);border:1px solid #e5e7eb;">
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
                    <p style="margin:8px 0 0;color:#e8c9a0;font-size:10px;letter-spacing:0.25em;font-weight:bold;text-transform:uppercase;">Interview Schedule Update</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 28px 12px;text-align:left;">
              <h1 style="margin:0 0 12px;font-size:20px;color:#1f2937;">Dear {{ $applicantName }},</h1>
              <p style="margin:0 0 16px;font-size:14px;color:#4b5563;line-height:1.6;">
                We regret to inform you that your interview for the position of <strong>{{ $position }}</strong> at Oxford Suites Makati has been <strong>cancelled</strong>.
              </p>
              @if(!empty($interviewDate))
              <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:16px;margin:16px 0;">
                <p style="margin:0 0 8px;font-size:13px;font-weight:bold;color:#991b1b;text-transform:uppercase;letter-spacing:0.05em;">Cancelled Schedule</p>
                <p style="margin:4px 0;font-size:13px;color:#b91c1c;"><strong>Date:</strong> {{ $interviewDate }}</p>
                @if(!empty($interviewTime))
                <p style="margin:4px 0;font-size:13px;color:#b91c1c;"><strong>Time:</strong> {{ $interviewTime }}</p>
                @endif
                @if(!empty($interviewMode))
                <p style="margin:4px 0;font-size:13px;color:#b91c1c;"><strong>Mode:</strong> {{ $interviewMode }}</p>
                @endif
              </div>
              @endif
              <p style="margin:16px 0 0;font-size:14px;color:#4b5563;line-height:1.6;">
                This cancellation does not affect the status of your application. Our HR team may reach out to you to arrange a new schedule. We apologize for any inconvenience.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 28px 24px;">
              <p style="margin:0;font-size:14px;color:#4b5563;line-height:1.6;">
                Warm regards,<br/>
                <strong>HR Talent Acquisition Team</strong><br/>
                Oxford Suites Makati
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f9fafb;border-top:1px solid #eef0f2;padding:18px 28px;">
              <p style="margin:0;font-size:11px;color:#9ca3af;line-height:1.6;text-align:center;">
                This is an automated notification sent from the Oxford Suites Makati HRMS.<br/>
                Oxford Suites Makati &bull; 518 P. Burgos St., Makati, Metro Manila, Philippines
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>

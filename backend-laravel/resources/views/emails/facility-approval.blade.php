<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Interview Facility Confirmed &mdash; Oxford Suites Makati</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:520px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.12);border:1px solid #e5e7eb;">
          <tr>
            <td style="background:linear-gradient(135deg,#520c19 0%,#7a1226 60%,#8f1a2e 100%);padding:24px 24px;text-align:center;">
              <p style="margin:0;color:#ffffff;font-size:19px;font-weight:bold;letter-spacing:0.12em;text-transform:uppercase;">Oxford Suites</p>
              <p style="margin:2px 0 0;color:#d4af37;font-size:12px;letter-spacing:0.35em;font-weight:bold;text-transform:uppercase;">Makati</p>
              <p style="margin:8px 0 0;color:#e8c9a0;font-size:10px;letter-spacing:0.25em;font-weight:bold;text-transform:uppercase;">Facility Request Confirmed</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 28px 12px;text-align:left;">
              <h1 style="margin:0 0 12px;font-size:20px;color:#1f2937;">Dear {{ $applicantName }},</h1>
              <p style="margin:0 0 16px;font-size:14px;color:#4b5563;line-height:1.6;">
                Good news! Your request to use the interview facility for the position of <strong>{{ $position }}</strong> at Oxford Suites Makati has been approved. Your interview is confirmed.
              </p>
              <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px;margin:16px 0;">
                <p style="margin:0 0 8px;font-size:13px;font-weight:bold;color:#166534;text-transform:uppercase;letter-spacing:0.05em;">Confirmed Interview Details</p>
                <p style="margin:0 0 4px;font-size:13px;color:#14532d;line-height:1.5;"><strong>Facility:</strong> {{ $facilityName }}</p>
                <p style="margin:0 0 4px;font-size:13px;color:#14532d;line-height:1.5;"><strong>Date:</strong> {{ $interviewDate }}</p>
                <p style="margin:0 0 4px;font-size:13px;color:#14532d;line-height:1.5;"><strong>Time:</strong> {{ $interviewTime }}</p>
                @if(!empty($facilityLocation))
                <p style="margin:8px 0 0;font-size:12px;color:#166534;line-height:1.5;">Location: {{ $facilityLocation }}</p>
                @endif
              </div>
              <p style="margin:16px 0 0;font-size:13px;color:#4b5563;line-height:1.6;">
                Please arrive 15 minutes before your scheduled time. For on-site interviews, proceed to the HR Office at Oxford Suites Makati. Should you have any questions, simply reply to this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 24px;text-align:left;">
              <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
                This is an automated message from the Oxford Suites Makati recruitment system. Please do not share this confirmation with others.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>

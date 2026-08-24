<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>You have been invited to Clearlist</title>
</head>
<body style="margin:0;background:#f5f7fb;color:#0f172a;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
        <div style="border:1px solid #e2e8f0;border-radius:20px;background:#ffffff;padding:32px;">
            <p style="margin:0;color:#4f46e5;font-size:12px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">
                Clearlist
            </p>
            <h1 style="margin:24px 0 12px;font-size:28px;line-height:1.2;">
                You have been invited.
            </h1>
            <p style="margin:0;color:#64748b;font-size:16px;line-height:1.6;">
                {{ $inviterName }} invited you to create a Clearlist account and make room for what matters.
            </p>
            <p style="margin:28px 0;">
                <a href="{{ $registrationUrl }}" style="display:inline-block;border-radius:10px;background:#4f46e5;padding:13px 18px;color:#ffffff;font-weight:700;text-decoration:none;">
                    Accept invitation
                </a>
            </p>
            <p style="margin:0;color:#94a3b8;font-size:13px;line-height:1.5;">
                This invitation expires in 7 days and can only be used once. If you did not expect this email, you can ignore it.
            </p>
        </div>
    </div>
</body>
</html>

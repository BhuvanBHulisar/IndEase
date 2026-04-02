import nodemailer from 'nodemailer';

const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'originode7@gmail.com';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

export const sendExpertWelcomeEmail = async ({ name, email, password }) => {
    const appUrl = process.env.CLIENT_URL?.split(',')[0]?.trim() || 'http://localhost:5173';
    await transporter.sendMail({
        from: `"origiNode Support" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Welcome to origiNode — Your Expert Account is Ready',
        text: `Hello ${name},\n\nYour service expert account has been created on origiNode.\n\nLogin Credentials:\nEmail: ${email}\nPassword: ${password}\n\nLogin here: ${appUrl}/provider/login\n\nIMPORTANT — Before you can receive payments:\n1. Login to your account\n2. You will be prompted to add your bank details\n3. All earnings will be transferred to your bank account\n\nIf you need help, contact us at ${SUPPORT_EMAIL}\n\n– Team origiNode`,
        html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#3b82f6,#6366f1);padding:36px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:800;letter-spacing:-0.5px;">origiNode</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Industrial Service Platform</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <h2 style="margin:0 0 8px;color:#1e293b;font-size:20px;">Welcome, ${name}!</h2>
            <p style="margin:0 0 24px;color:#64748b;font-size:15px;line-height:1.6;">Your service expert account has been created. Here are your login credentials:</p>
            
            <div style="background:#fff7ed; border:1px solid #fed7aa; border-radius:8px; padding:16px; margin-bottom:24px;">
              <h3 style="margin:0 0 8px;color:#9a3412;font-size:14px;font-weight:800;">IMPORTANT: MANDATORY ACTION REQUIRED</h3>
              <p style="margin:0;color:#c2410c;font-size:13px;line-height:1.5;">
                To receive job payments and your monthly salary, you MUST complete your profile:
                <br/>• Login to your account
                <br/>• You will be prompted to add your bank details
                <br/>• All earnings will be transferred to this account
              </p>
            </div>

            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;border-radius:8px;margin-bottom:28px;">
              <tr><td style="padding:20px 24px;">
                <p style="margin:0 0 10px;font-size:14px;color:#64748b;">
                  <span style="font-weight:700;color:#1e293b;">Email:</span>&nbsp;&nbsp;${email}
                </p>
                <p style="margin:0;font-size:14px;color:#64748b;">
                  <span style="font-weight:700;color:#1e293b;">Password:</span>&nbsp;&nbsp;<span style="font-family:monospace;background:#e2e8f0;padding:2px 8px;border-radius:4px;">${password}</span>
                </p>
              </td></tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
              <tr><td align="center">
                <a href="${appUrl}/provider/login" style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#6366f1);color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:8px;font-weight:700;font-size:15px;">Login to Your Account</a>
              </td></tr>
            </table>
            <p style="margin:0;color:#94a3b8;font-size:13px;line-height:1.6;">If you need help, contact us at <a href="mailto:${SUPPORT_EMAIL}" style="color:#3b82f6;text-decoration:none;">${SUPPORT_EMAIL}</a></p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #e2e8f0;text-align:center;">
            <p style="margin:0;color:#94a3b8;font-size:12px;">&copy; 2026 origiNode Systems. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
    });
};

export const sendExpertRemovalEmail = async ({ name, email, reason }) => {
    await transporter.sendMail({
        from: `"origiNode Support" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Your origiNode Expert Account Has Been Removed',
        text: `Hello ${name},\n\nYour account has been removed from the origiNode platform.\nReason: ${reason}\n\nIf you believe this is a mistake, contact ${SUPPORT_EMAIL}\n\n– Team origiNode`,
        html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#ef4444;padding:36px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;">Account Removed</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <p style="margin:0 0 16px;color:#1e293b;font-size:16px;">Hello ${name},</p>
            <p style="margin:0 0 24px;color:#64748b;font-size:15px;line-height:1.6;">
              Your account has been removed from the origiNode platform.
            </p>
            <div style="background:#fef2f2;border-left:4px solid #ef4444;padding:16px;margin-bottom:24px;">
              <p style="margin:0;color:#991b1b;font-size:14px;font-weight:700;">Reason for Removal:</p>
              <p style="margin:4px 0 0;color:#b91c1c;font-size:15px;">${reason}</p>
            </div>
            <p style="margin:0;color:#64748b;font-size:14px;line-height:1.6;">
              If you believe this is a mistake, please contact <a href="mailto:${SUPPORT_EMAIL}" style="color:#3b82f6;text-decoration:none;">${SUPPORT_EMAIL}</a>.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #e2e8f0;text-align:center;">
            <p style="margin:0;color:#94a3b8;font-size:12px;">&copy; 2026 origiNode Systems. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
    });
};

export const sendSupportEmail = async ({ name, email, subject, message }) => {
    await transporter.sendMail({
        from: `"origiNode Support" <${process.env.SMTP_USER}>`,
        to: SUPPORT_EMAIL,
        replyTo: email,
        subject: `Support Request - ${subject}`,
        text: `User: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#3b82f6,#6366f1);padding:28px 40px;text-align:center;">
            <h2 style="margin:0;color:#ffffff;font-size:20px;font-weight:800;">New Support Request</h2>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">Subject: ${subject}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;border-radius:8px;margin-bottom:24px;">
              <tr><td style="padding:16px 20px;">
                <p style="margin:0 0 8px;font-size:14px;color:#64748b;"><span style="font-weight:700;color:#1e293b;">Name:</span> ${name}</p>
                <p style="margin:0;font-size:14px;color:#64748b;"><span style="font-weight:700;color:#1e293b;">Email:</span> <a href="mailto:${email}" style="color:#3b82f6;">${email}</a></p>
              </td></tr>
            </table>
            <h4 style="margin:0 0 12px;color:#1e293b;font-size:14px;font-weight:700;">Message:</h4>
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px 20px;">
              <p style="margin:0;color:#475569;font-size:14px;line-height:1.7;white-space:pre-wrap;">${message}</p>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 40px;border-top:1px solid #e2e8f0;text-align:center;">
            <p style="margin:0;color:#94a3b8;font-size:12px;">origiNode Support System &copy; 2026</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
    });
};

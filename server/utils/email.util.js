import nodemailer from 'nodemailer';

/**
 * Configure Transporter
 */
const createTransporter = async () => {
    if (process.env.NODE_ENV === 'production') {
        // Production: Resend/SMTP
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    } else {
        // Development: Ethereal
        const testAccount = await nodemailer.createTestAccount();
        return nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
    }
};

/**
 * Send Verification Email
 */
export const sendVerificationEmail = async (email, token) => {
    const transporter = await createTransporter();
    const url = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    const info = await transporter.sendMail({
        from: '"origiNode Industrial" <noreply@originode.com>',
        to: email,
        subject: "Industrial Identity: Verify Your Email",
        html: `<p>Please verify your email by clicking <a href="${url}">here</a>.</p>`,
    });

    if (process.env.NODE_ENV !== 'production') {
        console.log("[Email] Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
};

/**
 * Send Password Reset Email
 */
export const sendPasswordResetEmail = async (email, token) => {
    const transporter = await createTransporter();
    const url = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

    const info = await transporter.sendMail({
        from: '"origiNode Industrial" <security@originode.com>',
        to: email,
        subject: "Industrial Integrity: Password Reset",
        html: `<p>Reset your industrial credentials by clicking <a href="${url}">here</a>.</p>`,
    });

    if (process.env.NODE_ENV !== 'production') {
        console.log("[Email] Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
};

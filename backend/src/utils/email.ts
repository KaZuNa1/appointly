import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendVerificationEmailParams {
  email: string;
  fullName: string;
  verificationToken: string;
}

export const sendVerificationEmail = async ({
  email,
  fullName,
  verificationToken
}: SendVerificationEmailParams): Promise<void> => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .header h1 {
            color: white;
            margin: 0;
            font-size: 28px;
          }
          .content {
            background: #f9fafb;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .button {
            display: inline-block;
            padding: 14px 32px;
            background: #667eea;
            color: white !important;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            margin: 20px 0;
            transition: background 0.3s ease;
          }
          .button:hover {
            background: #5568d3;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 14px;
            color: #6b7280;
          }
          .warning {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 12px;
            margin: 20px 0;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Appointly</h1>
        </div>
        <div class="content">
          <h2>Сайн байна уу, ${fullName}!</h2>
          <p>Appointly-д бүртгүүлсэнд баярлалаа. Имэйл хаягаа баталгаажуулахын тулд доорх товчийг дарна уу:</p>

          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">Имэйл баталгаажуулах</a>
          </div>

          <div class="warning">
            <strong>⏰ Анхаар:</strong> Энэ холбоос 30 минутын дараа хүчингүй болно.
          </div>

          <p>Хэрэв та бүртгэл үүсгээгүй бол энэ имэйлийг үл хэрэгсэх боломжтой.</p>

          <div class="footer">
            <p><strong>Эсвэл доорх холбоосыг хуулж шууд хандах боломжтой:</strong></p>
            <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
            <p style="margin-top: 20px;">Хүндэтгэсэн,<br><strong>Appointly Баг</strong></p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await resend.emails.send({
      from: 'Appointly <onboarding@resend.dev>', // Use verified domain in production
      to: email,
      subject: 'Appointly - Имэйл хаягаа баталгаажуулна уу',
      html: emailHtml
    });

    console.log(`✅ Verification email sent to ${email}`);
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    throw new Error('Имэйл илгээхэд алдаа гарлаа');
  }
};

interface SendPasswordResetEmailParams {
  email: string;
  fullName: string;
  resetToken: string;
}

export const sendPasswordResetEmail = async ({
  email,
  fullName,
  resetToken
}: SendPasswordResetEmailParams): Promise<void> => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .header h1 {
            color: white;
            margin: 0;
            font-size: 28px;
          }
          .content {
            background: #f9fafb;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .button {
            display: inline-block;
            padding: 14px 32px;
            background: #ef4444;
            color: white !important;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            margin: 20px 0;
            transition: background 0.3s ease;
          }
          .button:hover {
            background: #dc2626;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 14px;
            color: #6b7280;
          }
          .warning {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 12px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .security-notice {
            background: #fee2e2;
            border-left: 4px solid #ef4444;
            padding: 12px;
            margin: 20px 0;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Appointly</h1>
        </div>
        <div class="content">
          <h2>Сайн байна уу, ${fullName}!</h2>
          <p>Таны нууц үг сэргээх хүсэлт илгээгдсэн байна. Нууц үгээ шинэчлэхийн тулд доорх товчийг дарна уу:</p>

          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Нууц үг сэргээх</a>
          </div>

          <div class="warning">
            <strong>⏰ Анхаар:</strong> Энэ холбоос 30 минутын дараа хүчингүй болно.
          </div>

          <div class="security-notice">
            <strong>🔒 Аюулгүй байдал:</strong> Хэрэв та энэ хүсэлтийг илгээгээгүй бол энэ имэйлийг үл хэрэгсэж, нууц үгээ солихгүй байна уу. Таны данс аюулгүй байна.
          </div>

          <div class="footer">
            <p><strong>Эсвэл доорх холбоосыг хуулж шууд хандах боломжтой:</strong></p>
            <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
            <p style="margin-top: 20px;">Хүндэтгэсэн,<br><strong>Appointly Баг</strong></p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await resend.emails.send({
      from: 'Appointly <onboarding@resend.dev>',
      to: email,
      subject: 'Appointly - Нууц үг сэргээх',
      html: emailHtml
    });

    console.log(`✅ Password reset email sent to ${email}`);
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    throw new Error('Имэйл илгээхэд алдаа гарлаа');
  }
};

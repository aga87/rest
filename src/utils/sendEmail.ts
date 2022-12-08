import nodemailer from 'nodemailer';
import { logger } from '../startup/logger';

export const sendEmail = async ({
  to,
  subject,
  // text,
  html
}: {
  to: string;
  subject: string;
  // text: string;
  html: string;
}) => {
  try {
    // Generate test SMTP service account from ethereal.email
    let testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: testAccount.smtp.port,
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass // generated ethereal password
      }
    });

    let info = await transporter.sendMail({
      from: 'noreply@app-name.com',
      to,
      subject,
      // text,
      html
    });

    // (Preview only available when sending through an Ethereal account)
    logger.info(
      `Message ${
        info.messageId
      } sent. Preview URL: ${nodemailer.getTestMessageUrl(info)}`
    );
  } catch (error) {
    logger.error(error);
    return error;
  }
};

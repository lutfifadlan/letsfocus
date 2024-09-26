import Plunk from '@plunk/node';
import { User } from '@/lib/models';

const plunk = new Plunk(process.env.PLUNK_API_KEY!);

export async function sendVerificationEmail(user: InstanceType<typeof User>) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/api/emails/verify-email?token=${user._id}`;
  const logoUrl = 'https://getsyncpulse.com/icon.png'; // Replace with your actual logo URL
  const appName = 'Syncpulse'; // Replace with your actual app name
  const privacyPolicyUrl = `${process.env.NEXTAUTH_URL}/privacy-policy`; // Replace with your actual privacy policy URL
  const termsOfServiceUrl = `${process.env.NEXTAUTH_URL}/terms-of-service`; // Replace with your actual terms of service URL

  const emailData = {
    to: user.email,
    subject: 'Verify your email',
    body: `
     <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
          <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">
        </head>
        <body>
          <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
            <div style="text-align: center; margin-bottom: 20px; display: flex; justify-content: center; align-items: center;">
              <img src="${logoUrl}" alt="${appName} Logo" style="max-width: 50px; margin-right: 10px;"/>
              <h1 style="color: #1a202c; margin: 0;">${appName}</h1>
            </div>
            <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #1a202c;">Verify your email</h2>
              <p style="color: #4a5568;">Please verify your email by clicking the following link:</p>
              <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; margin: 20px 0; font-size: 16px; color: #ffffff; background-color: #000000; border-radius: 5px; text-decoration: none;">Verify Email</a>
              <p style="color: #4a5568;">If you did not request this, please ignore this email.</p>
            </div>
            <div style="text-align: center; margin-top: 20px; color: #4a5568;">
              <p>&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
              <p>
                <a href="${privacyPolicyUrl}" style="color: #1a202c; text-decoration: underline;">Privacy Policy</a> | 
                <a href="${termsOfServiceUrl}" style="color: #1a202c; text-decoration: underline;">Terms of Service</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  await plunk.emails.send(emailData);
}
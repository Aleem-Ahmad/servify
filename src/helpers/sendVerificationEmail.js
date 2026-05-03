import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import VerificationEmail from "@/emails/VerificationEmail";

export async function sendVerificationEmail(email, username, verifyCode) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Render React Email to HTML
    const emailHtml = await render(VerificationEmail({ otp: verifyCode }));

    const mailOptions = {
      from: `"Servify Verification" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Servify | Verify Your Email",
      html: emailHtml,
    };

    await transporter.sendMail(mailOptions);
    
    return { success: true, message: "Verification email sent successfully." };
  } catch (error) {
    console.error("Error sending verification email:", error);
    return { success: false, message: "Failed to send verification email." };
  }
}

import { resend } from "@/lib/resend";
import VerificationEmail from "@/emails/VerificationEmail";

export async function sendVerificationEmail(email, username, verifyCode) {
  try {
    // This allows you to easily change the sender in .env.local
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    
    const { data, error } = await resend.emails.send({
      from: `Servify <${fromEmail}>`,
      to: email,
      subject: 'Servify | Verify Your Email',
      react: VerificationEmail({ otp: verifyCode }),
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, message: error.message || "Failed to send verification email via Resend." };
    }

    return { success: true, message: "Verification email sent successfully." };
  } catch (error) {
    console.error("Error sending verification email (Resend):", error);
    return { success: false, message: "Failed to send verification email." };
  }
}

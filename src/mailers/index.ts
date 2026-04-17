import { transporter } from "./transporter";
import { verifyEmailTemplate } from "./templates/verifyEmail";
import { signInTemplate } from "./templates/signIn";
import { resetPasswordTemplate } from "./templates/resetPassword";



export async function sendVerificationEmail(to: string, otp: string) {
  await transporter.sendMail({
    from: `"My App" <${process.env.GMAIL_USER}>`,
    to,
    subject: "Confirmare cont",
    html: verifyEmailTemplate(otp, 10),
  });
}

export async function sendSignInEmail(to: string, otp: string) {
  await transporter.sendMail({
    from: `"My App" <${process.env.GMAIL_USER}>`,
    to,
    subject: "Cod autentificare",
    html: signInTemplate(otp, 10),
  });
}

export async function sendResetPasswordEmail(to: string, otp: string) {
  await transporter.sendMail({
    from: `"My App" <${process.env.GMAIL_USER}>`,
    to,
    subject: "Resetare parolă",
    html: resetPasswordTemplate(otp, 10),
  });
}
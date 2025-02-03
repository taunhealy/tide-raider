import { Resend } from "resend";
import sgMail from "@sendgrid/mail";

const resend = new Resend(process.env.RESEND_API_KEY);

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    const { data } = await resend.emails.send({
      from: "Tide Raider <ads@tideraider.com>",
      to,
      subject,
      html,
    });
    return { success: true, data };
  } catch (error) {
    console.error("Email error:", error);
    throw error;
  }
}

export async function sendTrialStartEmail(email: string, endDate: Date) {
  const msg = {
    to: email,
    from: "noreply@tideraider.com",
    subject: "Welcome to Your Tide Raider Trial!",
    html: `
      <h1>Welcome to Tide Raider!</h1>
      <p>Your 14-day trial has started. You now have full access to all features until ${endDate.toLocaleDateString()}.</p>
      <p>Enjoy discovering new surf spots and tracking conditions!</p>
    `,
  };

  await sgMail.send(msg);
}

export async function sendTrialEndingSoonEmail(
  email: string,
  daysLeft: number
) {
  const msg = {
    to: email,
    from: "noreply@tideraider.com",
    subject: "Your Tide Raider Trial is Ending Soon",
    html: `
      <h1>Trial Ending Soon</h1>
      <p>Your trial will end in ${daysLeft} days. Subscribe now to maintain access to all features!</p>
      <a href="${process.env.NEXT_PUBLIC_BASE_URL}/pricing">Subscribe Now</a>
    `,
  };

  await sgMail.send(msg);
}

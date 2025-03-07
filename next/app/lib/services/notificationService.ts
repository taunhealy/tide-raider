import { AlertConfig } from "@/app/components/alerts/AlertConfiguration";
import { AlertMatch } from "@/lib/services/alertMatchingService";

export async function sendAlertNotification(
  alertMatch: AlertMatch,
  alertConfig: AlertConfig
): Promise<boolean> {
  try {
    // Prepare notification message
    const message = createNotificationMessage(alertMatch);

    // Send notifications based on user preference
    if (
      alertConfig.notificationMethod === "email" ||
      alertConfig.notificationMethod === "both"
    ) {
      await sendEmail(alertConfig.contactInfo, alertMatch.alertName, message);
    }

    if (
      alertConfig.notificationMethod === "whatsapp" ||
      alertConfig.notificationMethod === "both"
    ) {
      await sendWhatsApp(alertConfig.contactInfo, message);
    }

    return true;
  } catch (error) {
    console.error("Failed to send notification:", error);
    return false;
  }
}

function createNotificationMessage(alertMatch: AlertMatch): string {
  const { alertName, region, timestamp, matchedProperties } = alertMatch;

  // Format timestamp
  const date = new Date(timestamp);
  const formattedDate = date.toLocaleDateString();
  const formattedTime = date.toLocaleTimeString();

  // Create message
  let message = `🎯 Alert Match: ${alertName}\n`;
  message += `📍 Region: ${region}\n`;
  message += `🕒 Time: ${formattedDate} ${formattedTime}\n\n`;
  message += `Matched Conditions:\n`;

  // Add each matched property
  matchedProperties.forEach((prop) => {
    const propertyName = formatPropertyName(prop.property);
    message += `- ${propertyName}: Log value ${prop.logValue} matches forecast ${prop.forecastValue}\n`;
  });

  message += `\nYour logged conditions matched the forecast within your specified accuracy ranges.`;

  return message;
}

function formatPropertyName(property: string): string {
  // Convert camelCase to Title Case with spaces
  const formatted = property.replace(/([A-Z])/g, " $1");
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

async function sendEmail(
  email: string,
  subject: string,
  message: string
): Promise<void> {
  // This would connect to your email service provider
  // For example, using SendGrid, Mailgun, AWS SES, etc.
  console.log(`Sending email to ${email}`);
  console.log(`Subject: ${subject}`);
  console.log(`Message: ${message}`);

  // Example implementation with a hypothetical email API
  // const response = await fetch('https://your-email-api.com/send', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ to: email, subject, message })
  // });
  // return response.ok;

  // For now, we'll just simulate success
  return Promise.resolve();
}

async function sendWhatsApp(
  phoneNumber: string,
  message: string
): Promise<void> {
  // This would connect to WhatsApp Business API or a service like Twilio
  console.log(`Sending WhatsApp to ${phoneNumber}`);
  console.log(`Message: ${message}`);

  // Example implementation with a hypothetical WhatsApp API
  // const response = await fetch('https://your-whatsapp-api.com/send', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ to: phoneNumber, message })
  // });
  // return response.ok;

  // For now, we'll just simulate success
  return Promise.resolve();
}

/**
 * Gmail API REST Client for Google Workspace
 * Supports sending emails directly via Google's official Gmail API
 */

export interface GmailSendParams {
  accessToken: string;
  toEmail: string;
  userName: string;
  senderEmail?: string;
}

export interface GmailSendResult {
  success: boolean;
  messageId?: string;
  threadId?: string;
  error?: string;
}

/**
 * Creates RFC 2822 compliant email message string
 */
function createWelcomeEmailRfc2822(toEmail: string, userName: string, senderEmail = 'roshanlokhande43@gmail.com'): string {
  const cleanName = userName || toEmail.split('@')[0] || 'Fitness Champion';
  const subject = `Welcome to Health-Meta, ${cleanName}! 🥗⚡`;

  const htmlBody = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f17; color: #f1f5f9; padding: 32px 20px; border-radius: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #1e293b;">
  <div style="text-align: center; margin-bottom: 24px;">
    <div style="display: inline-block; background: linear-gradient(135deg, #0066FF, #0052cc); padding: 12px; border-radius: 16px; margin-bottom: 10px;">
      <span style="font-size: 28px;">🥗⚡</span>
    </div>
    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 900;">Welcome to Health-Meta!</h1>
    <p style="color: #94a3b8; font-size: 13px; margin-top: 4px;">Precision Metabolic Intelligence & Daily Nutrition</p>
  </div>
  
  <div style="background-color: #111827; border: 1px solid #1f2937; border-radius: 14px; padding: 20px; margin-bottom: 20px;">
    <h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">Hello ${cleanName} 👋,</h2>
    <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1; margin-bottom: 12px;">
      Aapka <strong>Health-Meta</strong> par hardik swagat hai! Aapka account (<strong style="color: #38bdf8;">${toEmail}</strong>) successfully activate ho chuka hai.
    </p>
    <p style="font-size: 13px; line-height: 1.6; color: #94a3b8; margin: 0;">
      We're thrilled to have you onboard! Start tracking meals with our clinical AI scanner, calculate your exact TDEE calories, and maintain your streak.
    </p>
  </div>

  <div style="background-color: #0f172a; border-radius: 10px; padding: 14px; margin-bottom: 20px; border-left: 4px solid #10b981;">
    <p style="margin: 0; font-size: 12px; color: #e2e8f0; line-height: 1.5;">
      ✅ <strong>Status:</strong> Active &amp; Verified<br/>
      👤 <strong>User:</strong> ${cleanName}<br/>
      📧 <strong>Recipient:</strong> ${toEmail}<br/>
      ✉️ <strong>Dispatched From:</strong> ${senderEmail} (Roshan Lokhande)<br/>
      ⏰ <strong>Time:</strong> ${new Date().toLocaleString()}
    </p>
  </div>

  <div style="text-align: center; border-top: 1px solid #1e293b; padding-top: 16px; color: #64748b; font-size: 11px;">
    Warm regards,<br/>
    <strong style="color: #ffffff;">Roshan Lokhande</strong><br/>
    Founder, Health-Meta • <a href="mailto:${senderEmail}" style="color: #38bdf8; text-decoration: none;">${senderEmail}</a>
  </div>
</div>
  `.trim();

  // Construct RFC 2822 message
  const lines = [
    `From: Roshan Lokhande <${senderEmail}>`,
    `To: ${toEmail}`,
    `Reply-To: ${senderEmail}`,
    `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    htmlBody,
  ];

  return lines.join('\r\n');
}

/**
 * Base64 URL safe encoder
 */
function base64UrlEncode(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Send email using the Google Gmail REST API v1
 */
export async function sendWelcomeEmailViaGmailApi({
  accessToken,
  toEmail,
  userName,
  senderEmail = 'roshanlokhande43@gmail.com',
}: GmailSendParams): Promise<GmailSendResult> {
  try {
    const rawRfc = createWelcomeEmailRfc2822(toEmail, userName, senderEmail);
    const rawBase64Url = base64UrlEncode(rawRfc);

    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw: rawBase64Url,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn('Gmail API response failed:', response.status, errorText);
      return {
        success: false,
        error: `Gmail API error (${response.status}): ${errorText}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      messageId: data.id,
      threadId: data.threadId,
    };
  } catch (err: any) {
    console.error('sendWelcomeEmailViaGmailApi exception:', err);
    return {
      success: false,
      error: err?.message || 'Failed to send via Gmail API',
    };
  }
}

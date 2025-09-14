import { parts as signatureParts } from './emailSegments/signature'

interface AdminAccessEmailProps {
  email: string
  requestReason: string
  adminLink: string
  requestTime: string
}

// Safe signature rendering to avoid build issues
function renderSignature(): string {
  try {
    return signatureParts
      .filter((part) => part && part.length > 0)
      .map((part) => `<div style="font-family:arial,sans-serif">${part}</div>`)
      .join('')
  } catch (error) {
    // Fallback signature if there are any import issues
    return `
      <div style="font-family:arial,sans-serif">Trillium Smith</div>
      <div style="font-family:arial,sans-serif">Trillium Massage</div>
      <div style="font-family:arial,sans-serif"><a href="https://trilliummassage.la">trilliummassage.la</a></div>
    `
  }
}

export default function AdminAccessEmail({
  email,
  requestReason,
  adminLink,
  requestTime,
}: AdminAccessEmailProps) {
  const SUBJECT = 'Admin Access Link - Massage Booking System'

  const body = `
    <div dir="ltr">
      <div style="font-family:arial,sans-serif">
        <h2>Admin Access Request</h2>
        <p>A request for admin access was made with the following details:</p>
        
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Reason:</strong> ${requestReason}</p>
        <p><strong>Time:</strong> ${requestTime}</p>
        
        <div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-left: 4px solid #007bff;">
          <h3>🔒 Secure Admin Access Link</h3>
          <p>Click the link below to access the admin panel. This link is valid for 4 hours:</p>
          <p><a href="${adminLink}" style="color: #007bff; text-decoration: none; font-weight: bold;">${adminLink}</a></p>
        </div>
        
        <div style="margin: 20px 0; padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107;">
          <h4>⚠️ Security Notice</h4>
          <ul>
            <li>This link provides full admin access to your massage booking system</li>
            <li>Do not share this link with anyone</li>
            <li>The session will expire automatically after 30 days</li>
            <li>You can logout manually at any time</li>
          </ul>
        </div>
        
        <p style="margin-top: 30px; color: #666; font-size: 14px;">
          If you did not request this access, please ignore this email and consider reviewing your admin security settings.
        </p>
        
        <br>
        ${renderSignature()}
      </div>
    </div>
  `

  return { subject: SUBJECT, body }
}

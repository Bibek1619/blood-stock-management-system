/**
 * Notification Service
 * Handles SMS and Email notifications
 * 
 * TODO: Integrate with actual SMS/Email providers:
 * - SMS: Twilio, AWS SNS, Vonage
 * - Email: SendGrid, AWS SES, Mailgun
 */

interface NotificationData {
  name: string;
  phone: string;
  email?: string;
  isVerified: boolean;
}

/**
 * Send thank you notification after blood donation
 */
export const sendDonationThankYou = async (donor: NotificationData): Promise<void> => {
  const claimAccountUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/claim-account`;
  
  console.log('📧 Sending donation thank you notification...');
  console.log(`To: ${donor.name} (${donor.phone})`);
  
  if (!donor.isVerified) {
    // For walk-in donors, include claim account link
    const message = `
🩸 Thank you for donating blood, ${donor.name}!

Your donation will save lives. 

🎁 Claim your account to:
✓ Track donation history
✓ Get event notifications
✓ Download certificates
✓ See your impact

👉 Claim now: ${claimAccountUrl}
Phone: ${donor.phone}

- Blood Donation Center
    `.trim();
    
    console.log('SMS Message:', message);
    
    // TODO: Send actual SMS
    // await sendSMS(donor.phone, message);
    
    if (donor.email && !donor.email.includes('@walkin.local')) {
      console.log('Email:', donor.email);
      // TODO: Send actual email
      // await sendEmail(donor.email, 'Thank You for Donating Blood!', message);
    }
  } else {
    // For verified web donors
    const message = `
🩸 Thank you for donating blood, ${donor.name}!

Your donation has been recorded. View your donation history in your dashboard.

- Blood Donation Center
    `.trim();
    
    console.log('SMS Message:', message);
    // TODO: Send actual SMS/Email
  }
  
  console.log('✅ Notification sent successfully');
};

/**
 * Send event notification to donors
 */
export const sendEventNotification = async (
  donors: NotificationData[],
  event: { title: string; date: string; location: string }
): Promise<void> => {
  const eventUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/events`;
  
  console.log(`📧 Sending event notification to ${donors.length} donors...`);
  
  for (const donor of donors) {
    const message = `
🩸 Blood Donation Event

${event.title}
📅 ${event.date}
📍 ${event.location}

We need your help! Register now: ${eventUrl}

${!donor.isVerified ? `\n🎁 Claim your account: ${process.env.FRONTEND_URL}/claim-account` : ''}

- Blood Donation Center
    `.trim();
    
    console.log(`Sending to: ${donor.name} (${donor.phone})`);
    // TODO: Send actual SMS/Email
  }
  
  console.log('✅ Event notifications sent');
};

/**
 * Send blood shortage alert
 */
export const sendBloodShortageAlert = async (
  bloodType: string,
  donors: NotificationData[]
): Promise<void> => {
  console.log(`🚨 Sending blood shortage alert for ${bloodType} to ${donors.length} donors...`);
  
  for (const donor of donors) {
    const message = `
🚨 URGENT: ${bloodType} Blood Needed!

We have a critical shortage of ${bloodType} blood.

Your donation can save lives TODAY!

📍 Visit us at: [Your Address]
⏰ Hours: [Your Hours]

${!donor.isVerified ? `\n🎁 Claim account: ${process.env.FRONTEND_URL}/claim-account` : ''}

- Blood Donation Center
    `.trim();
    
    console.log(`Sending to: ${donor.name} (${donor.phone})`);
    // TODO: Send actual SMS/Email
  }
  
  console.log('✅ Shortage alerts sent');
};

/**
 * Send verification code for account claiming
 */
export const sendVerificationCode = async (
  phoneOrEmail: string,
  code: string
): Promise<void> => {
  const message = `
Your verification code is: ${code}

This code will expire in 10 minutes.

- Blood Donation Center
  `.trim();
  
  console.log(`📧 Sending verification code to: ${phoneOrEmail}`);
  console.log(`Code: ${code}`);
  
  // TODO: Send actual SMS/Email based on format
  // if (phoneOrEmail.includes('@')) {
  //   await sendEmail(phoneOrEmail, 'Verification Code', message);
  // } else {
  //   await sendSMS(phoneOrEmail, message);
  // }
  
  console.log('✅ Verification code sent');
};

/**
 * Helper: Send SMS (implement with your provider)
 */
const sendSMS = async (phone: string, message: string): Promise<void> => {
  // TODO: Implement with Twilio, AWS SNS, etc.
  console.log(`[SMS] To: ${phone}`);
  console.log(`[SMS] Message: ${message}`);
};

/**
 * Helper: Send Email (implement with your provider)
 */
const sendEmail = async (email: string, subject: string, body: string): Promise<void> => {
  // TODO: Implement with SendGrid, AWS SES, etc.
  console.log(`[EMAIL] To: ${email}`);
  console.log(`[EMAIL] Subject: ${subject}`);
  console.log(`[EMAIL] Body: ${body}`);
};

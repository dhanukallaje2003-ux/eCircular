const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS?.replace(/\s/g, '') || ''
  }
});

const sendCircularNotification = async (users, circular) => {
  try {
    // Get only user emails (not admin)
    const emailList = users
      .filter(u => u.role === 'user' && u.email)
      .map(u => u.email);

    if (emailList.length === 0) {
      console.log('No users to notify');
      return;
    }

    // Fix document type - handle both camelCase and snake_case
    const docType = circular.documentType || circular.document_type || 'Circular';
    const targetGroup = circular.targetGroup || circular.target_group || 'All';

    // Send email to each user
    for (const email of emailList) {
      await transporter.sendMail({
        from: `"eCircular" <${process.env.EMAIL_USER}>`,        to: email,
        subject: `📢 New ${docType}: ${circular.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #4361ee; margin: 0;">◉ eCircular</h1>
              <p style="color: #718096;">Official Notification</p>
            </div>

            <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #2d3748; margin: 0 0 12px 0;">📢 New ${docType} Published</h2>
              <h3 style="color: #4361ee; margin: 0 0 8px 0;">${circular.title}</h3>
              <p style="color: #718096; margin: 0;">
                <strong>Type:</strong> ${docType} &nbsp;|&nbsp;
                <strong>Priority:</strong> <span style="color: #c62828;">${circular.priority}</span> &nbsp;|&nbsp;
                <strong>For:</strong> ${targetGroup}
              </p>
            </div>

            <p style="color: #4a5568;">
              A new ${docType.toLowerCase()} has been published.
              Please login to the Circular Management System to view the complete details.
            </p>

            <div style="text-align: center; margin: 24px 0;">
              <a href="http://localhost:3000/login"
                style="background: #4361ee; color: white; padding: 12px 32px;
                       border-radius: 8px; text-decoration: none; font-weight: bold;">
                View Circular
              </a>
            </div>

            <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; text-align: center;">
              <p style="color: #a0aec0; font-size: 12px;">
                This is an automated notification from eCircular.<br/>
                Please do not reply to this email.
              </p>
            </div>

          </div>
        `
      });

      console.log(`✅ Email sent to: ${email}`);
    }

    console.log(`✅ Notifications sent to ${emailList.length} users`);

  } catch (error) {
    console.error('Email error:', error);
  }
};

module.exports = { sendCircularNotification };

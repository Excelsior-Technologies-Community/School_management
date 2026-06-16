const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function for School Admin onboarding
const sendOnboardingEmail = async (toEmail, adminName, schoolName, token) => {
  const setupLink = `${process.env.FRONTEND_URL}/setup-password?token=${token}`;

  const mailOptions = {
    from: `"System Administration" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `Action Required: Activate Account for ${schoolName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #1e3a8a;">Welcome to the Platform, ${adminName}!</h2>
        <p style="color: #334155; font-size: 16px;">
          A new institutional account has been successfully generated for you as the primary system administrator for <strong>${schoolName}</strong>.
        </p>
        <p style="color: #334155; font-size: 14px; margin-bottom: 25px;">
          To complete your onboarding registration profile and configure your private login password details, click the confirmation button below:
        </p>
        <div style="text-align: center; margin-bottom: 30px;">
          <a href="${setupLink}" target="_blank" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Initialize Account Password
          </a>
        </div>
        <p style="color: #64748b; font-size: 12px;">
          If the button above does not load, copy and paste the following web address URL link into your browser window:<br/>
          <a href="${setupLink}">${setupLink}</a>
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;"/>
        <p style="color: #94a3b8; font-size: 11px; text-align: center;">
          Security Alert Notice: This individual link activation authorization profile token will expire upon submission.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Function for adding general campus staff members
const sendStaffOnboardingEmail = async (toEmail, staffName, schoolName, roleName, token) => {
  const setupLink = `${process.env.FRONTEND_URL}/setup-password?token=${token}`;

  const mailOptions = {
    from: `"School Administration" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `Invitation to join ${schoolName} as ${roleName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #2563eb;">Hello ${staffName},</h2>
        <p style="color: #334155; font-size: 16px;">
          You have been invited by the administration of <strong>${schoolName}</strong> to join their digital campus platform as a <strong>${roleName}</strong>.
        </p>
        <p style="color: #334155; font-size: 14px; margin-bottom: 25px;">
          To claim your workspace profile dashboard access, click the button below to initialize your secure account password:
        </p>
        <div style="text-align: center; margin-bottom: 30px;">
          <a href="${setupLink}" target="_blank" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Setup Account Password
          </a>
        </div>
        <p style="color: #64748b; font-size: 12px;">
          If the button above does not load, copy and paste the following web address URL link into your browser window:<br/>
          <a href="${setupLink}">${setupLink}</a>
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;"/>
        <p style="color: #94a3b8; font-size: 11px; text-align: center;">
          Security Alert Notice: This individual link activation authorization profile token will expire upon submission.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// NEW: Function for student onboarding notification templates
const sendStudentOnboardingEmail = async (toEmail, studentName, schoolName, token) => {
  const setupLink = `${process.env.FRONTEND_URL}/setup-password?token=${token}`;

  const mailOptions = {
    from: `"Campus Student Portal" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `Welcome to ${schoolName} - Activate your Student Workspace`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #10b981;">Welcome to your Student Portal, ${studentName}!</h2>
        <p style="color: #334155; font-size: 16px;">
          Your official academic workspace profile has been created at <strong>${schoolName}</strong>. Once activated, you can track assignments, view timetables, and monitor grades.
        </p>
        <p style="color: #334155; font-size: 14px; margin-bottom: 25px;">
          To complete your onboarding registration setup and initialize your student password, click the button below:
        </p>
        <div style="text-align: center; margin-bottom: 30px;">
          <a href="${setupLink}" target="_blank" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Activate Student Account
          </a>
        </div>
        <p style="color: #64748b; font-size: 12px;">
          If the button above does not work, copy and paste the following web address link into your browser window:<br/>
          <a href="${setupLink}">${setupLink}</a>
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;"/>
        <p style="color: #94a3b8; font-size: 11px; text-align: center;">
          Security Alert Notice: For privacy security compliance, this onboarding token link will automatically expire upon successful password submission.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Export ALL utilities together dynamically
module.exports = { 
  sendOnboardingEmail, 
  sendStaffOnboardingEmail,
  sendStudentOnboardingEmail 
};
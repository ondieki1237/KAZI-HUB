import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Log email configuration on startup
console.log('Email configuration:', {
  user: process.env.EMAIL_USER ? 'configured' : 'missing',
  pass: process.env.EMAIL_PASS ? 'configured' : 'missing'
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify transporter configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error('Email transporter verification failed:', error);
  } else {
    console.log('Email transporter is ready to send messages');
  }
});

export const sendVerificationEmail = async (email, code) => {
  console.log('Attempting to send verification email to:', email);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verify Your Email - KAZI-HUB',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Welcome to KAZI-HUB!</h2>
        <p>Thank you for signing up. To complete your registration, please use the following verification code:</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
          <h1 style="color: #3498db; margin: 0; letter-spacing: 5px;">${code}</h1>
        </div>
        <p>This code will expire in 15 minutes.</p>
        <p>If you didn't request this verification, please ignore this email.</p>
      </div>
    `
  };

  try {
    console.log('Sending verification email with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    await transporter.sendMail(mailOptions);
    console.log('Verification email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending verification email:', {
      error: error.message,
      stack: error.stack,
      code: error.code,
      command: error.command
    });
    return false;
  }
};

export const sendPasswordResetEmail = async (email, resetToken) => {
  const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Reset Your Password - KAZI-HUB',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Password Reset Request</h2>
        <p>You requested to reset your password. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" 
             style="background-color: #3498db; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this password reset, please ignore this email.</p>
        <p style="color: #7f8c8d; font-size: 12px;">If the button doesn't work, copy and paste this link in your browser:</p>
        <p style="color: #7f8c8d; font-size: 12px;">${resetLink}</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};

export const sendWelcomeEmail = async (email, name) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Welcome to KAZI-HUB - Your Gateway to Professional Opportunities!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c3e50; margin-bottom: 10px;">Welcome to KAZI-HUB! 🎉</h1>
          <p style="color: #7f8c8d; font-size: 16px;">Where Talent Meets Opportunity</p>
        </div>

        <div style="background-color: #f8f9fa; padding: 25px; border-radius: 10px; margin-bottom: 30px;">
          <h2 style="color: #3498db; margin-bottom: 15px;">Dear ${name},</h2>
          <p style="color: #2c3e50; line-height: 1.6;">
            Thank you for joining KAZI-HUB! We're thrilled to have you as part of our growing community of professionals.
            Your journey to finding great opportunities or talented workers starts here.
          </p>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="color: #2c3e50; margin-bottom: 15px;">What KAZI-HUB Offers You:</h3>
          <ul style="color: #2c3e50; line-height: 1.6; padding-left: 20px;">
            <li>Access to a wide range of job opportunities and skilled professionals</li>
            <li>Secure and efficient hiring process</li>
            <li>Real-time chat with potential employers/workers</li>
            <li>Professional profile building tools</li>
            <li>Integrated payment system for secure transactions</li>
          </ul>
        </div>

        <div style="background-color: #e8f4f8; padding: 20px; border-radius: 10px; margin-bottom: 30px;">
          <h3 style="color: #3498db; margin-bottom: 15px;">Getting Started:</h3>
          <ol style="color: #2c3e50; line-height: 1.6;">
            <li>Complete your profile</li>
            <li>Browse available jobs or post your requirements</li>
            <li>Connect with potential matches</li>
            <li>Start your professional journey!</li>
          </ol>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #7f8c8d; font-size: 14px;">
            Need help? Our support team is always here for you.<br>
            Contact us at support@kazihub.com
          </p>
          <div style="margin-top: 20px;">
            <a href="${process.env.CLIENT_URL}/login" 
               style="background-color: #3498db; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Get Started
            </a>
          </div>
        </div>

        <div style="margin-top: 30px; text-align: center; color: #7f8c8d; font-size: 12px;">
          <p>© ${new Date().getFullYear()} KAZI-HUB. All rights reserved.</p>
        </div>
      </div>
    `
  };

  try {
    console.log('Sending welcome email to:', email);
    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};

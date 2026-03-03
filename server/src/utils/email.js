import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Generate a random 6-digit OTP
 */
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP to email
 */
export const sendOTPEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Email Verification - MotorWala",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #333; text-align: center;">Email Verification</h2>
          <p style="color: #666; font-size: 16px;">Hello,</p>
          <p style="color: #666; font-size: 16px;">Thank you for signing up with MotorWala. To verify your email address, please use the following OTP:</p>
          
          <div style="background-color: #f0f0f0; padding: 20px; text-align: center; border-radius: 5px; margin: 30px 0;">
            <p style="margin: 0; font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 5px;">${otp}</p>
          </div>
          
          <p style="color: #666; font-size: 14px;"><strong>Note:</strong> This OTP is valid for 10 minutes only.</p>
          <p style="color: #666; font-size: 14px;">If you didn't request this verification, please ignore this email.</p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">© 2025 MotorWala. All rights reserved.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: "OTP sent successfully" };
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send OTP email");
  }
};

/**
 * Send welcome email after successful verification
 */
export const sendWelcomeEmail = async (email, name) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Welcome to MotorWala!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #333; text-align: center;">Welcome to MotorWala!</h2>
          <p style="color: #666; font-size: 16px;">Hello ${name},</p>
          <p style="color: #666; font-size: 16px;">Your email has been verified successfully! Your account is now active and ready to use.</p>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">You can now:</p>
          <ul style="color: #666; font-size: 14px;">
            <li>Browse vehicles</li>
            <li>Create listings</li>
            <li>Connect with other users</li>
          </ul>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">© 2025 MotorWala. All rights reserved.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: "Welcome email sent" };
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw new Error("Failed to send welcome email");
  }
};

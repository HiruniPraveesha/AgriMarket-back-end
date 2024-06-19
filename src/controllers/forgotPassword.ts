


/*last

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'hirunipraveesha18@gmail.com', // your email
    pass: 'kmcixcgcspcmbfnr', // your email password
  },
});

// Function to generate a 4-digit OTP
const generateOtp = () => {
  return crypto.randomInt(1000, 9999).toString();
};

// Send OTP endpoint
export const sendOTP = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // Check if the user exists by email
    const user = await prisma.buyers.findUnique({ where: { email } });

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Generate OTP and set expiration time
    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiration

    // Update user with OTP and expiration time
    await prisma.buyers.update({
      where: { buyer_id: user.buyer_id },
      data: { otp, otpExpiresAt },
    });

    // Send OTP email
    await transporter.sendMail({
        from: 'hirunipraveesha18@gmail.com',
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}`,
    });

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ error: "An error occurred while sending OTP" });
  }
};

// Verify OTP and reset password endpoint
export const resetPassword = async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ error: 'Email, OTP, and new password are required' });
  }

  try {
    // Check if the user exists and OTP is valid
    const user = await prisma.buyers.findUnique({ where: { email } });

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    if (user.otp !== otp || !user.otpExpiresAt || new Date() > user.otpExpiresAt) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Hash the new password before storing it
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password and clear OTP fields
    await prisma.buyers.update({
      where: { buyer_id: user.buyer_id },
      data: {
        password: hashedPassword,
        otp: null,
        otpExpiresAt: null,
      },
    });

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ error: "An error occurred while resetting the password" });
  }
};
*/

/*import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'your_email@gmail.com',
    pass: 'your_email_password'
  }
});

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    // Check if user exists in either sellers or buyers table
    let user = await prisma.sellers.findUnique({ where: { email } });
    let userType = 'seller';

    if (!user) {
      user = await prisma.buyers.findUnique({ where: { email } });
      userType = 'buyer';
    }

    if (!user) return res.status(404).send('User not found');

    const token = jwt.sign({ userId: user.seller_id || user.buyer_id, userType }, 'your_secret_key', { expiresIn: '1h' });

    await prisma.passwordResetToken.create({
      data: {
        userId: user.seller_id || user.buyer_id,
        token,
        expiresAt: new Date(Date.now() + 3600000), // 1 hour
        userType
      }
    });

    const mailOptions = {
      from: 'your_email@gmail.com',
      to: user.email,
      subject: 'Password Reset',
      text: `You requested a password reset. Click the link to reset your password: http://localhost:3000/reset-password?token=${token}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) return res.status(500).send('Email sending failed');
      res.send('Password reset email sent');
    });
  } catch (error) {
    res.status(500).send('Server error');
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  try {
    const decoded: any = jwt.verify(token, 'your_secret_key');
    const { userId, userType } = decoded;

    const passwordResetToken = await prisma.passwordResetToken.findUnique({ where: { token } });
    if (!passwordResetToken) return res.status(400).send('Invalid token');

    const hashedPassword = bcrypt.hashSync(newPassword, 8);

    if (userType === 'seller') {
      await prisma.seller.update({
        where: { seller_id: userId },
        data: { password: hashedPassword }
      });
    } else if (userType === 'buyer') {
      await prisma.buyer.update({
        where: { buyer_id: userId },
        data: { password: hashedPassword }
      });
    }

    await prisma.passwordResetToken.delete({ where: { token } });

    res.send('Password has been reset');
  } catch (error) {
    res.status(400).send('Invalid or expired token');
  }
};*/

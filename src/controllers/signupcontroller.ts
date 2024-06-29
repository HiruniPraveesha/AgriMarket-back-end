import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

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

// Cleanup incomplete registrations older than 10min
async function cleanupIncompleteRegistrations() {
  const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000);
  await prisma.buyers.deleteMany({
    where: {
      AND: [
        { password: '' },
        { otpExpireAt: { lte: tenMinAgo } }
      ]
    }
  });
}

// Schedule cleanup every tenMin
setInterval(cleanupIncompleteRegistrations, 10 * 60 * 1000);

// Send OTP endpoint
export async function sendOtp(req: Request, res: Response) {
  const { email, contactNo } = req.body;

  if (!email || !contactNo) {
    return res.status(400).json({ error: 'Email and contact number are required' });
  }

  try {
    // Check if the user exists by email or contact number
    const userByEmail = await prisma.buyers.findUnique({ where: { email } });
    const userByContactNo = await prisma.buyers.findUnique({ where: { contactNo } });

    if ((userByEmail && userByEmail.password) || (userByContactNo && userByContactNo.password)) {
      return res.status(400).json({ error: 'User already registered with this email or phone number' });
    }

    // Generate OTP and set expiration time
    const otp = generateOtp();
    const otpExpireAt = new Date(Date.now() + 5 * 60 * 1000); // 10 minutes expiration

    if (userByEmail || userByContactNo) {
      // User exists but not registered, update OTP
      await prisma.buyers.update({
        where: userByEmail ? { email } : { contactNo },
        data: { otp, otpExpireAt, contactNo },
      });
    } else {
      // User does not exist, create new user with email, OTP, and expiration time
      await prisma.buyers.create({
        data: { email, otp, otpExpireAt, name: '', address: '', password: '', contactNo },
      });
    }
    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #007bff; border-radius: 5px; text-align: center">
        <h2 style="color: #007bff;">Agrimarket OTP for Buyer Registration</h2>
        <p>Your OTP for email verification is: <br><br><strong style="font-size: 25px;">${otp}</strong><br><br>It is valid for 5 minutes.</p>
        <p style="margin-top: 30px;">Thank you for registering as a buyer on Agrimarket!</p>
      </div>
    `;

    // Send OTP email
    transporter.sendMail({
      from: 'hirunipraveesha18@gmail.com',
      to: email,
      subject: 'Agrimarket OTP for Buyer Registration',
      html: htmlTemplate, // Use HTML format for email content
    }, (err, info) => {
      if (err) {
        console.error("Error sending OTP email:", err);
        return res.status(500).json({ error: "Failed to send OTP email" });
      }
      console.log("OTP email sent:", info.response);
      res.status(200).json({ message: 'OTP sent successfully' });
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ error: "An error occurred while sending OTP" });
  }
}

// Sign up endpoint with OTP verification
export async function signUp(req: Request, res: Response) {
  const { name, email, address, contactNo, password, otp } = req.body;

  try {
    if (!name || !email || !address || !contactNo || !password || !otp) {
      return res.status(400).json({ error: 'Please fill all the details' });
    }

    // Check if the user exists
    const existingUser = await prisma.buyers.findUnique({ where: { email } });

    if (!existingUser) {
      return res.status(400).json({ error: 'User does not exist' });
    }

    // Check if the user is already registered
    if (existingUser.password) {
      return res.status(400).json({ error: 'User is already registered' });
    }

    // Check if the OTP is valid
    if (
      existingUser.otp !== otp || 
      !existingUser.otpExpireAt || 
      new Date() > existingUser.otpExpireAt
    ) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Check if the contact number is already registered with another user
    const userByContactNo = await prisma.buyers.findUnique({ where: { contactNo } });
    if (userByContactNo && userByContactNo.email !== email) {
      return res.status(400).json({ error: 'Contact number already registered with another user' });
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user details and clear OTP fields
    await prisma.buyers.update({
      where: { email },
      data: {
        name,
        address,
        contactNo,
        password: hashedPassword,
        otp: null,
        otpExpireAt: null
      },
    });

    return res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "An error occurred while creating the user" });
  }
}




import { Request, Response } from "express";
import { PrismaClient, buyers, sellers } from "@prisma/client";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

type User = buyers | sellers | null;

const generateOTP = () => Math.floor(1000 + Math.random() * 9000);

export const forgotPassword = async (req: Request, res: Response) => {
  const { email, userType } = req.body;

  let user: User = null;

  if (userType === "buyer") {
    user = await prisma.buyers.findUnique({ where: { email } });
  } else if (userType === "seller") {
    user = await prisma.sellers.findUnique({ where: { email } });
  }

  if (!user) {
    return res.status(404).json({ success: false, message: "Email not found" });
  }

  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

  if (userType === "buyer" && "buyer_id" in user) {
    await prisma.buyers.update({
      where: { email },
      data: {
        otp: otp.toString(),
        otpExpiresAt: otpExpiry,
      },
    });
  } else if (userType === "seller" && "seller_id" in user) {
    await prisma.sellers.update({
      where: { email },
      data: {
        OTP: otp.toString(),
        otpExpiresAt: otpExpiry,
      },
    });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'hirunipraveesha18@gmail.com', // your email
      pass: 'kmcixcgcspcmbfnr', // your email password
    },
  });

  const htmlTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #007bff; border-radius: 5px; text-align: center">
      <h2 style="color: #007bff;">Password Reset OTP</h2>
      <p>Your OTP for password reset is: <br><br><strong style="font-size: 25px;">${otp}</strong><br><br>It is valid for 10 minutes.</p>
      <p style="margin-top: 30px;">Please use this OTP to reset your password.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: 'hirunipraveesha18@gmail.com',
      to: email,
      subject: 'Password Reset OTP',
      html: htmlTemplate,
    });

    res.json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    console.error("Error sending OTP email:", error);
    res.status(500).json({ error: "Failed to send OTP email" });
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  const { email, otp, userType } = req.body;
  let user: User = null;

  if (userType === "buyer") {
    user = await prisma.buyers.findUnique({ where: { email, otp } });
  } else if (userType === "seller") {
    user = await prisma.sellers.findUnique({ where: { email, OTP: otp } });
  }

  if (!user || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
    return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
  }

  res.json({ success: true, message: "OTP verified" });
};

export const resetPassword = async (req: Request, res: Response) => {
  const { email, password, otp, userType } = req.body;
  let user: User = null;
  let errors: string[] = [];

  if (userType === "buyer") {
    user = await prisma.buyers.findUnique({ where: { email, otp } });
    if (password.length < 7) errors.push("Password must be at least 7 characters long.");
    if (!/[a-z]/.test(password)) errors.push("Password must include at least one lowercase letter.");
    if (!/[A-Z]/.test(password)) errors.push("Password must include at least one uppercase letter.");
    if (!/\d/.test(password)) errors.push("Password must include at least one number.");
    if (!/[@!#]/.test(password)) errors.push("Password must include at least one special character (@, !, #).");
  } else if (userType === "seller") {
    user = await prisma.sellers.findUnique({ where: { email, OTP: otp } });
    const sellerPasswordPattern = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[@#$]).{8,}$/;
    if (!sellerPasswordPattern.test(password)) errors.push("Password must be at least 8 characters long and include at least one letter, one number, and one special character (@, #, $).");
  }

  if (!user || !user.otpExpiresAt || user.otpExpiresAt < new Date() || errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.length ? errors.join(' ') : "Invalid or expired OTP" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  if (userType === "buyer" && "buyer_id" in user) {
    await prisma.buyers.update({
      where: { email },
      data: { password: hashedPassword, otp: null, otpExpiresAt: null },
    });
  } else if (userType === "seller" && "seller_id" in user) {
    await prisma.sellers.update({
      where: { email },
      data: { password: hashedPassword, OTP: null, otpExpiresAt: null },
    });
  }

  res.json({ success: true, message: "Password reset successfully" });
};

export const resendOTP = async (req: Request, res: Response) => {
  const { email, userType } = req.body;
  let user: User = null;

  if (userType === "buyer") {
    user = await prisma.buyers.findUnique({ where: { email } });
  } else if (userType === "seller") {
    user = await prisma.sellers.findUnique({ where: { email } });
  }

  if (!user) {
    return res.status(404).json({ success: false, message: "Email not found" });
  }

  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

  if (userType === "buyer" && "buyer_id" in user) {
    await prisma.buyers.update({
      where: { email },
      data: {
        otp: otp.toString(),
        otpExpiresAt: otpExpiry,
      },
    });
  } else if (userType === "seller" && "seller_id" in user) {
    await prisma.sellers.update({
      where: { email },
      data: {
        OTP: otp.toString(),
        otpExpiresAt: otpExpiry,
      },
    });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'hirunipraveesha18@gmail.com', // your email
      pass: 'kmcixcgcspcmbfnr', // your email password
    },
  });

  const htmlTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #007bff; border-radius: 5px; text-align: center">
      <h2 style="color: #007bff;">Password Reset OTP</h2>
      <p>Your OTP for password reset is: <br><br><strong style="font-size: 25px;">${otp}</strong><br><br>It is valid for 10 minutes.</p>
      <p style="margin-top: 30px;">Please use this OTP to reset your password.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: 'hirunipraveesha18@gmail.com',
      to: email,
      subject: 'Password Reset OTP',
      html: htmlTemplate,
    });

    res.json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    console.error("Error sending OTP email:", error);
    res.status(500).json({ error: "Failed to send OTP email" });
  }
};


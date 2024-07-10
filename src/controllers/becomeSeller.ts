
import { Request, Response } from "express";
import nodemailer from "nodemailer";
import { PrismaClient } from "@prisma/client"; 
import bcrypt from "bcrypt";
import { SellerSessionData } from "../middlewares/sessionConfig"; // Assuming SellerSessionData is defined here
const prisma = new PrismaClient();
type SellerSession = {
  emailVerified: boolean;
  email: string;
  OTP: string;
  otpExpiresAt: Date;
  password?: string; // Ensure this matches SellerSessionData definition
};

export async function becomeSeller(req: Request, res: Response) {
  const { email, otp, password, action } = req.body;

  try {
    if (!email || !action) {
      
      return res
        .status(400)
        .json({ status: 400, error: "Invalid input format" });
    }

    if (action === "sendOtp") {
      const existingSeller = await prisma.sellers.findUnique({
        where: { email },
      });

      if (existingSeller) {
        return res.status(400).json({ status: 400, error: "Email is already registered." });
      }
      // Check if seller already exists in session
      // if (req.session.seller && req.session.seller.email === email) {
      //   return res
      //     .status(400)
      //     .json({ status: 400, error: "OTP already sent to this email." });
      // }

      const OTP = generateOTP();
      const otpExpiresAt = new Date(Date.now() + 5 * 60000); // 5 minutes from now
      await sendOTP(email, OTP);

      // Store session data
      req.session.seller = {
        email,
        OTP,
        otpExpiresAt,
        //password: password ? await bcrypt.hash(password, 10) : undefined,
      } as SellerSessionData; // Ensure SellerSessionData type is used here

      return res
        .status(201)
        .json({ status: 201, message: "OTP sent successfully" });
    } else if (action === "verifyOtp") {
      if (!otp) {
        return res.status(400).json({ status: 400, error: "OTP is required" });
      }

      const sellerSession = req.session.seller as SellerSession | undefined;

      if (
        !sellerSession ||
        sellerSession.OTP !== otp ||
        !sellerSession.otpExpiresAt ||
        sellerSession.otpExpiresAt < new Date()
      ) {
        return res
          .status(401)
          .json({ status: 401, error: "Invalid or expired OTP" });
      }

      // Ensure req.session.seller is defined and initialize emailVerified
      if (!sellerSession.emailVerified) {
        sellerSession.emailVerified = true;
      }

      return res
        .status(200)
        .json({ status: 200, message: "OTP verified successfully" });
    } else if (action === "completeRegistration") {
      
      const sellerSession = req.session.seller as SellerSession | undefined;

      if (!sellerSession || !sellerSession.emailVerified || !password) {
        return res.status(400).json({ status: 400, error: "Incomplete registration data" });
      }

      // Example: Log the completion of registration
      console.log("Seller registration completed:", sellerSession);
      sellerSession.password = await bcrypt.hash(password, 10);
      

      return res
        .status(200)
        .json({ status: 200, message: "Registration process completed" });
    } else {
      return res.status(400).json({ status: 400, error: "Invalid action" });
    }
    
  } catch (error) {
    console.error("Error becoming seller:", error);
    return res
      .status(500)
      .json({ status: 500, error: "Internal Server Error" });
  }
}
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOTP(email: string, otp: string) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "hirunipraveesha18@gmail.com", // your email
        pass: "kmcixcgcspcmbfnr", // your email password
      },
      tls: { rejectUnauthorized: false },
    });

    const htmlTemplate = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ccc; border-radius: 5px; text-align: center">
                <h2 style="color: #007bff;">Agrimarket OTP for Seller Registration</h2>
                <p>Your OTP for email verification is: <br><br><strong style="font-size:25px">${otp}</strong><br><br>. It is valid for 5 minutes.</p>
                <p style="margin-top: 30px;">Thank you for registering as a seller on Agrimarket!</p>
            </div>
        `;

    const info = await transporter.sendMail({
      from: "hirunipraveesha18@gmail.com", // Replace with your email address
      to: email,
      subject: "Agrimarket OTP for Seller Registration",
      html: htmlTemplate,
    });

    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw new Error("Failed to send OTP. Please try again.");
  }
}
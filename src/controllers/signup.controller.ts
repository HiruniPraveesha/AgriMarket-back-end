import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function signUp(req: Request, res: Response) {
    const { name, email, line1, line2, city, contactNo, password } = req.body;

    try {

        if(!name || !email || !contactNo ){
           return res.status(400).json({ error: 'Please fill all the details'});
        }

        const existingUser = await prisma.buyers.findUnique({
            where: { contactNo }
        });

        if(existingUser){
            return res.status(400).json({ error: 'User already exist'});
        }

        const hashedPassword = await bcrypt.hash(password, 10); 

        const OTP = generateOTP();
        await sendOTP(email, OTP);

        await prisma.buyers.create({
            data: {
                name,
                email,
                line1,
                line2,
                city,
                contactNo,
                password: hashedPassword

            },
        });

        return res.status(201).json({  message: 'Registration successful'});
        
    } catch (error) {
        
        console.error("Error creating user:", error);
        res.status(500).json({ error: "An error occurred while creating user" });
    }
}
function generateOTP() {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    return otp;
}

async function sendOTP(email: string, otp: string){
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'hirunipraveesha18@gmail.com',
            pass: 'kmcixcgcspcmbfnr'
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    const htmlTemplate = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ccc; border-radius: 5px; text-align: center">
            <h2 style="color: #007bff;">Agrimarket OTP for Seller Registration</h2>
            <p>Your OTP for email verification is: <br><br><strong style="font-size:25px">${otp}</strong><br><br>. It is valid for 5 minutes.</p>
            <p style="margin-top: 30px;">Thank you for registering as a seller on Agrimarket!</p>
        </div>
    `;

    const info = await transporter.sendMail({
        from : 'hirunipraveesha18@gmail.com',
        to: email,
        subject: 'Agrimarket OTP for Seller Registration',
        html: htmlTemplate
    });

    console.log('Message sent: %s', info.messageId);
} 

export async function verifyOTP(req: Request, res: Response) {
    const { email, otp } = req.body;

    try {
        
        const user = await prisma.buyers.findUnique({
            where: { email }
        });

        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        
        if (generateOTP !== otp) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        
        return res.status(200).json({ message: 'OTP verified successfully' });
    } catch (error) {
        console.error("Error verifying OTP:", error);
        res.status(500).json({ error: "An error occurred while verifying OTP" });
    }
}


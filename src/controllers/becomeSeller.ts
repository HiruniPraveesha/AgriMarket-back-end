// Salon registration in mobile app

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

export async function becomeSeller(req: Request, res: Response){
    const {email} = req.body;

    try{

        if (!email){
            return res.status(400).json({ status: 400, error:'Invlid input format'});
        }

        const existingSeller = await prisma.sellers.findUnique({
            where: {email}
        });

        if(existingSeller){
            return res.status(401).json({ status: 400, error: 'Seller with this contact already exisits'});
        }

        const OTP = generateOTP();
        await sendOTP(email, OTP);

        await prisma.sellers.create({
            data : {
                
                email,
                OTP
            },
        });

        

        return res.status(201).json({ status: 201, message: 'OTP sent successfully'});
    }
    catch (error: unknown) {
        if (error instanceof Error) {
          res.status(400).json({ error: error.message });
        } else {
          res.status(500).json({ error: 'Internal Server Error' });
        }
      }
    finally{
        await prisma.$disconnect();
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

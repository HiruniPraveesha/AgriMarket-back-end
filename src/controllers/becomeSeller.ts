
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';
import cron from 'node-cron';

const prisma = new PrismaClient();

async function cleanupIncompleteRegistrations() {
    try {
        const thresholdDate = new Date();
        thresholdDate.setMinutes(thresholdDate.getMinutes() - 6); // Set the threshold to 6 minutes ago

        await prisma.sellers.deleteMany({
            where: {
                emailVerified: false,
            },
        });

        console.log('Incomplete registrations cleaned up');
    } catch (error) {
        console.error('Error cleaning up incomplete registrations:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}


// Schedule cleanup task to run every 6 minutes
cron.schedule('*/6 * * * *', cleanupIncompleteRegistrations);

export async function becomeSeller(req: Request, res: Response) {
    const { email, otp, password, action } = req.body;

    try {
        if (!email || !action) {
            return res.status(400).json({ status: 400, error: 'Invalid input format' });
        }

        if (action === 'sendOtp') {
            const existingSeller = await prisma.sellers.findUnique({
                where: { email }
            });

            const currentTime = new Date();
            const resendDelay = 60 * 1000; // 60 seconds

            if (existingSeller) {
                if (existingSeller.emailVerified) {
                    return res.status(401).json({ status: 401, error: 'Seller with this email already exists' });
                }

                if (existingSeller.otpExpiresAt && currentTime.getTime() < new Date(existingSeller.otpExpiresAt).getTime()) {
                    return res.status(429).json({ status: 429, error: 'OTP can only be resent after 60 seconds' });
                }

                const OTP = generateOTP();
                const otpExpiresAt = new Date(Date.now() + 5 * 60000); // 5 minutes from now
                await sendOTP(email, OTP);

                await prisma.sellers.update({
                    where: { email },
                    data: {
                        OTP,
                        otpExpiresAt: new Date(Date.now() + resendDelay) // Set the new OTP expiration time
                    }
                });

                return res.status(201).json({ status: 201, message: 'OTP sent successfully' });
            } else {
                const OTP = generateOTP();
                const otpExpiresAt = new Date(Date.now() + 5 * 60000); // 5 minutes from now
                await sendOTP(email, OTP);

                await prisma.sellers.create({
                    data: {
                        email,
                        OTP,
                        otpExpiresAt: new Date(Date.now() + resendDelay), // Set the new OTP expiration time
                        emailVerified: false
                    },
                });

                return res.status(201).json({ status: 201, message: 'OTP sent successfully' });
            }
        } else if (action === 'verifyOtp') {
            if (!otp) {
                return res.status(400).json({ status: 400, error: 'OTP is required' });
            }

            const existingSeller = await prisma.sellers.findUnique({
                where: { email }
            });

            if (!existingSeller || existingSeller.OTP !== otp || !existingSeller.otpExpiresAt || existingSeller.otpExpiresAt < new Date()) {
                return res.status(401).json({ status: 401, error: 'Invalid or expired OTP' });
            }

            await prisma.sellers.update({
                where: { email },
                data: {
                    emailVerified: true,
                    OTP: null,
                    otpExpiresAt: null
                }
            });

            return res.status(200).json({ status: 200, message: 'OTP verified successfully' });
            
        } else if (action === 'completeRegistration') {
            if (!otp || !password) {
                return res.status(400).json({ status: 400, error: 'OTP and password are required' });
            }

            const existingSeller = await prisma.sellers.findUnique({
                where: { email }
            });

            if (!existingSeller || !existingSeller.emailVerified) {
                return res.status(401).json({ status: 401, error: 'Email not verified or OTP is invalid/expired' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            await prisma.sellers.update({
                where: { email },
                data: {
                    password: hashedPassword
                }
            });

            return res.status(201).json({ status: 201, message: 'Account created successfully' });
        } else {
            return res.status(400).json({ status: 400, error: 'Invalid action' });
        }
    } catch (error) {
        console.error('Error becoming seller:', error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    } finally {
        await prisma.$disconnect();
    }
}

function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOTP(email: string, otp: string) {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'hirunipraveesha18@gmail.com',
                pass: 'kmcixcgcspcmbfnr' // Replace with your actual app-specific password
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
            from: 'hirunipraveesha18@gmail.com',
            to: email,
            subject: 'Agrimarket OTP for Seller Registration',
            html: htmlTemplate
        });

        console.log('Message sent: %s', info.messageId);
    } catch (error) {
        console.error('Error sending OTP:', error);
        throw new Error('Failed to send OTP. Please try again.');
    }
}

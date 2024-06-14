import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function completeSellerRegistration(req: Request, res: Response) {
    const { email, store_name, line1, line2, city, district, contactNo, password, OTP } = req.body;

    try {
        if (!email || !store_name || !line1 || !city || !district || !contactNo || !password || !OTP) {
            return res.status(400).json({ status: 400, error: 'Invalid input format' });
        }

        const existingSeller = await prisma.sellers.findUnique({
            where: { email }
        });

        if (!existingSeller || existingSeller.OTP !== OTP) {
            return res.status(401).json({ status: 401, error: 'Invalid OTP or seller not registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10); 

        await prisma.sellers.update({
            where: { email },
            data: {
                store_name,
                line1,
                line2,
                city,
                district,
                contactNo,
                password : hashedPassword,
                emailVerified: true 
            }
        });

        return res.status(200).json({ status: 200, message: 'Seller registration completed successfully' });
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } finally {
        await prisma.$disconnect();
    }
}

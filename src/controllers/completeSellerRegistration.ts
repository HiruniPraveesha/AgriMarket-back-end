
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { SellerSessionData } from "../middlewares/sessionConfig";

const prisma = new PrismaClient();

export async function completeSellerRegistration(req: Request, res: Response) {
    const { storeName, addressLine1, addressLine2, district, phoneNumber, email: enteredEmail } = req.body;

    try {
        // Ensure session exists
        if (!req.session) {
            return res.status(401).json({ status: 401, error: 'Session does not exist' });
        }

        // Retrieve session data
        const sessionData = req.session.seller as SellerSessionData;
        console.log('Session Data:', sessionData)

        // Check if session data is valid and complete
        if (!sessionData.email || !sessionData.OTP || !sessionData.otpExpiresAt || !sessionData.password)  {
            return res.status(401).json({ status: 401, error: 'Incomplete or invalid session data' });
        }

        // Verify entered email matches the stored email in session
        if (enteredEmail !== sessionData.email) {
            return res.status(400).json({ status: 400, error: 'Entered email does not match the verified email' });
        }

        // Check if all required fields are provided
        if (!storeName || !addressLine1 || !district || !phoneNumber || !addressLine2) {
            return res.status(400).json({ status: 400, error: 'Invalid input format' });
        }

        // Check if phoneNumber is already in use by another seller
        const sellerWithPhoneNumber = await prisma.sellers.findFirst({
            where: {
                contactNo: phoneNumber,
                NOT: { email: sessionData.email }
            }
        });

        if (sellerWithPhoneNumber) {
            return res.status(400).json({ status: 400, error: 'Phone number is already in use by another seller' });
        }

        // Hash the password for storage
        const hashedPassword = await bcrypt.hash(sessionData.password, 10);

        // Create a new seller record
        const newSeller = await prisma.sellers.create({
            data: {
                store_name: storeName,
                line1: addressLine1,
                line2: addressLine2,
                district,
                password: hashedPassword,
                contactNo: phoneNumber,
                email: sessionData.email,
                emailVerified: true, // Ensure emailVerified is set to true
            }
        });

        // Clear session data after successful registration
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
            }
        });

        return res.status(200).json({
            status: 200,
            message: 'Seller registration completed successfully',
            data: {
                seller_id: newSeller.seller_id,
                storeName: newSeller.store_name,
                email: newSeller.email,
                contactNo: newSeller.contactNo,
                district: newSeller.district,
                line1: newSeller.line1,
                line2: newSeller.line2,
                emailVerified: newSeller.emailVerified,
            }
        });
    } catch (error) {
        console.error('Error completing seller registration:', error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
}

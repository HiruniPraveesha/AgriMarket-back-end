import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/jwtUtils';

const prisma = new PrismaClient();

export async function signin(req: Request, res: Response) {
    const { email, contactNo, password } = req.body;

    try {
        if ((!email && !contactNo) || !password) {
            return res.status(400).json({ error: 'Invalid input format' });
        }

        // Define the query based on provided input
        const query = email ? { email } : { contactNo };

        // Search for a buyer or a seller with the given email or contact number
        const [buyer, seller] = await prisma.$transaction([
            prisma.buyers.findFirst({
                where: query
            }),
            prisma.sellers.findFirst({
                where: query
            })
        ]);

        if (!buyer && !seller) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Select the found user
        const user = buyer || seller;
        const userType = buyer ? 'buyer' : 'seller';
        

        // Ensure the user is not null before proceeding
        if (!user || !user.password) {
            return res.status(404).json({ error: 'User not found or invalid user data' });
        }

        // Validate the password
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        // Generate token
        const userId = buyer ? buyer.buyer_id : seller?.seller_id;

        // Ensure userId is defined
        if (userId === undefined) {
            return res.status(500).json({ error: "User ID is undefined" });
        }

        // Generate token
        const token = generateToken({ id: userId, email: user.email });

        const responseMessage = {
            message: 'Sign in successful',
            token,
            userType
        };

        if (userType === 'buyer') {
            return res.status(202).json({ ...responseMessage, message: 'Buyer sign in successful' });
        } else {
            console.log("seller");
            return res.status(201).json({ ...responseMessage, message: 'Seller sign in successful' });
        }


    } catch (error) {
        console.error("Error signing in user:", error);
        res.status(500).json({ error: "An error occurred while signing in user" });
    }
}

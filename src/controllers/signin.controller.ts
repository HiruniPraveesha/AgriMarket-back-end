

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/jwtUtils';

const prisma = new PrismaClient();

export async function signin(req: Request, res: Response) {
    const { email, contactNo, password, userType } = req.body;

    try {
        if ((!email && !contactNo) || !password || !userType) {
            return res.status(400).json({ error: 'Invalid input format' });
        }

        const query = email ? { email } : { contactNo };

        let user;
        let userId;

        if (userType === 'buyer') {
            user = await prisma.buyers.findFirst({
                where: query
            });
            userId = user?.buyer_id;
        } else if (userType === 'seller') {
            user = await prisma.sellers.findFirst({
                where: query
            });
            userId = user?.seller_id;
        } else {
            return res.status(400).json({ error: 'Invalid user type' });
        }

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!user.password) {
            return res.status(404).json({ error: 'User not found or invalid user data' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        if (userId === undefined) {
            return res.status(500).json({ error: "User ID is undefined" });
        }

        const token = generateToken({ id: userId, email: user.email });

        const responseMessage = {
            message: 'Sign in successful',
            token,
            userType
        };

        return res.status(userType === 'buyer' ? 202 : 201).json(responseMessage);

    } catch (error) {
        console.error("Error signing in user:", error);
        res.status(500).json({ error: "An error occurred while signing in user" });
    }
}


import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { userInfo } from 'os';
import { generateToken } from '../utils/jwtUtils';

const prisma = new PrismaClient();


export async function signin(req: Request, res: Response) {
    const { email, contactNo, password } = req.body;

    try {
        if (!email && !contactNo || !password) {
            return res.status(400).json({ error: 'Invalid input format' });
        }

        const existingUser = await prisma.buyers.findFirst({
            where: {
                OR: [
                    { contactNo },
                    { email }
                ]
            }
        });

        if (!existingUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        const passwordMatch = await bcrypt.compare(password, existingUser.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid password' });
        }
       const token = generateToken({ id: existingUser.buyer_id, email: existingUser.email });
        return res.status(200).json({ status: 200, message: 'Email verified successfully', token });
  
        return res.status(200).json({ message: 'Sign in successful', user: existingUser,token });

    } catch (error) {
        console.error("Error signing in user:", error);
        res.status(500).json({ error: "An error occurred while signing in user" });
    }
}

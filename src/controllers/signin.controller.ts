import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function signin(req: Request, res: Response) {
    const { email, contactNo, password } = req.body;

    try {
        if (!email && !contactNo || !password) {
            return res.status(400).json({ error: 'Invalid input format' });
        }

        const existingUser = await prisma.users.findFirst({
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

        // Compare the provided password with the hashed password stored in the database
        const passwordMatch = await bcrypt.compare(password, existingUser.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        // If the password matches, sign in successful
        return res.status(200).json({ message: 'Sign in successful', user: existingUser });

    } catch (error) {
        console.error("Error signing in user:", error);
        res.status(500).json({ error: "An error occurred while signing in user" });
    }
}

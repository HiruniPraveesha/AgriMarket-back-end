import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function signUp(req: Request, res: Response) {
    const { name, email, line1, line2, city, contactNo, password } = req.body;

    try {

        if(!name || !email || !line1 || !line2 || !city || !contactNo || !password ){
           return res.status(400).json({ error: 'Invalid input format'});
        }

        const existingUser = await prisma.users.findUnique({
            where: { contactNo }
        });

        if(existingUser){
            return res.status(400).json({ error: 'User already exist'});
        }

        const hashedPassword = await bcrypt.hash(password, 10); 

        await prisma.users.create({
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
        // If there's an error during user creation, send an error response
        console.error("Error creating user:", error);
        res.status(500).json({ error: "An error occurred while creating user" });
    }
}

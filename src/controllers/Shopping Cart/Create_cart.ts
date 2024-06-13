import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function CreateCart(req: Request, res: Response) {
    const { buyerId } = req.body;

    if (!buyerId) {
        return res.status(400).json({ error: "Invalid or missing buyerId" });
    } else {
        try {
            await prisma.cart.create({
                data: {
                    buyerId: Number(buyerId)
                }
            });

            return res.status(200).json({ message: 'Cart created successfully' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}

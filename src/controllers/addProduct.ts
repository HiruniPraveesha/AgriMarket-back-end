import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function addProduct(req: Request, res: Response) {
    const {
        name,
        price,
        description,
        image,
        categoryId,
        sellerId
    } = req.body;

    try {
        // Check if all required fields are provided
        if (!name || !price || !description || !image || !categoryId || !sellerId) {
            return res.status(400).json({ status: 400, error: 'Invalid input format' });
        }

        // Check if the seller exists
        const existingSeller = await prisma.sellers.findUnique({
            where: { seller_id: sellerId }
        });

        if (!existingSeller) {
            return res.status(404).json({ status: 404, error: 'Seller not found' });
        }

        // Create the product in the database
        const product = await prisma.product.create({
            data: {
                name,
                price: parseFloat(price),
                description,
                image,
                categoryId: parseInt(categoryId),
                sellerId: parseInt(sellerId)
            }
        });

        return res.status(201).json({ status: 201, message: 'Product added successfully', data: product });
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

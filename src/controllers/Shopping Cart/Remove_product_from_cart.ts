import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function RemoveProductFromCart(req: Request, res: Response) {
    const { buyerId, productId } = req.body;

    // Parse buyerId and productId to integers
    const parsedBuyerId = parseInt(buyerId, 10);
    const parsedProductId = parseInt(productId, 10);

    if (isNaN(parsedBuyerId) || isNaN(parsedProductId)) {
        return res.status(400).json({ error: "Invalid or missing buyerId or productId" });
    } else {
        try {
            // Find the cartProduct entry to delete
            const cartProduct = await prisma.cartProduct.findUnique({
                where: {
                    buyerId_productId: {
                        buyerId: parsedBuyerId,
                        productId: parsedProductId
                    }
                }
            });

            if (!cartProduct) {
                return res.status(404).json({ error: 'Product not found in cart' });
            }

            // Delete the cartProduct entry
            await prisma.cartProduct.delete({
                where: {
                    buyerId_productId: {
                        buyerId: parsedBuyerId,
                        productId: parsedProductId
                    }
                }
            });

            return res.status(200).json({ message: "Product removed from cart successfully" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}

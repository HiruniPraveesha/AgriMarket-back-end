import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function AddProductToCart(req: Request, res: Response) {
    const { buyerId, productId, qty } = req.body;

    // Parse buyerId, productId, and qty to integers
    const parsedBuyerId = parseInt(buyerId, 10);
    const parsedProductId = parseInt(productId, 10);
    const parsedQty = parseInt(qty, 10);

    if (isNaN(parsedBuyerId) || isNaN(parsedProductId) || isNaN(parsedQty)) {
        return res.status(400).json({ error: "Invalid or missing buyerId, productId, or qty" });
    } else {
        try {
            // Ensure there is a cart for the buyer
            let cart = await prisma.cart.findUnique({
                where: { buyerId: parsedBuyerId },
            });

            if (!cart) {
                cart = await prisma.cart.create({
                    data: { buyerId: parsedBuyerId },
                });
            }

            // Create or update the cartProduct entry
            const cartProduct = await prisma.cartProduct.upsert({
                where: {
                    buyerId_productId: {
                        buyerId: parsedBuyerId,
                        productId: parsedProductId,
                    },
                },
                update: {
                    qty: {
                        increment: parsedQty,
                    },
                },
                create: {
                    buyerId: parsedBuyerId,
                    productId: parsedProductId,
                    qty: parsedQty,
                },
            });

            return res.status(200).json({ message: "Product added to cart successfully", data: cartProduct });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}

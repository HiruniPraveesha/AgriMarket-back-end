import { Request, Response, NextFunction } from 'express';
import { PrismaClient, cart } from '@prisma/client';

const prisma = new PrismaClient();

export async function CreateCart(req: Request, res: Response) {
    const { buyerId } = req.body;

    if (!buyerId) {
        return res.status(400).json({ error: "Invalid or missing buyerId" });
    }

    try {
        const existingCart: cart | null = await prisma.cart.findFirst({
            where: { buyerId: Number(buyerId) },
        });

        if (existingCart) {
            return res.status(200).json({ message: 'Cart already exists', cartId: existingCart.buyerId });
        }

        const newCart: cart = await prisma.cart.create({
            data: {
                buyerId: Number(buyerId),
            },
        });

        return res.status(200).json({ message: 'Cart created successfully', cartId: newCart.buyerId });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
  }
}
export const getCartProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const products = await prisma.cartProduct.findMany({
        // include: {
        //   images: true,
        // }
      });
      res.status(200).json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      next(new Error('Internal Server Error'));
    }
  };
  



export async function ClearCart(req: Request, res: Response) {
    const { buyerId } = req.body;

    // Parse buyerId to integer
    const parsedBuyerId = parseInt(buyerId, 10);

    if (isNaN(parsedBuyerId)) {
        return res.status(400).json({ error: "Invalid or missing buyerId" });
    } else {
        try {
            const cartProducts = await prisma.cartProduct.findMany({
                where: {
                    buyerId: parsedBuyerId
                }
            });

            if (cartProducts.length === 0) {
                return res.status(404).json({ error: 'No products found in cart' });
            }

            await prisma.cartProduct.deleteMany({
                where: {
                    buyerId: parsedBuyerId
                }
            });

            return res.status(200).json({ message: "All products removed from cart successfully" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export async function RemoveProductFromCart(req: Request, res: Response) {
    const { buyerId, productId } = req.body;

    // Parse buyerId and productId to integers
    const parsedBuyerId = parseInt(buyerId, 10);
    const parsedProductId = parseInt(productId, 10);

    if (isNaN(parsedBuyerId) || isNaN(parsedProductId)) {
        return res.status(400).json({ error: "Invalid or missing buyerId or productId" });
    } else {
        try {
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
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getSellerProductsByCategory = async (req: Request, res: Response) => {
  const { sellerId, categoryId } = req.params;

  try {
    const products = await prisma.product.findMany({
      where: {
        sellerId: parseInt(sellerId),
        categoryId: parseInt(categoryId),
      },
    });

    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching products.' });
  }
};

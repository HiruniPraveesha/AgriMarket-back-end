// controllers/productController.ts

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getProductsBySellerId1 = async (req: Request, res: Response) => {
  const sellerId = parseInt(req.params.sellerId);

  try {
    const products = await prisma.product.findMany({
      where: {
        sellerId: sellerId,
      },
      select: {
        product_id: true,
        name: true,
        categoryId: true,
      },
    });

    res.status(200).json(products);
  } catch (error: any) {
    console.error('Error fetching products by seller ID:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

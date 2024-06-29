import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllProducts1 = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      select: {
        product_id: true,  
        name: true,
        sellerId : true
      },
    });
    return res.status(200).json(products);
  } catch (error: any) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

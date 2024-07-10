import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getSellerNameById = async (req: Request, res: Response) => {
  const { sellerId } = req.params;

  try {
    const seller = await prisma.sellers.findUnique({
      where: {
        seller_id: parseInt(sellerId, 10),
      },
      select: {
        store_name: true,
      },
    });

    if (!seller) {
      return res.status(404).json({ error: 'Seller not found' });
    }

    res.json({ store_name: seller.store_name });
  } catch (error) {
    console.error('Error fetching seller name:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

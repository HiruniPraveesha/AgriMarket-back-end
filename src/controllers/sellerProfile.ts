
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get seller details including products and ratings
export const getSellerDetails = async (req: Request, res: Response) => {

  try {
    const sellerId = Number(req.query.sellerId);
    const seller = await prisma.sellers.findUnique({
      where: { seller_id: sellerId },
      include: {
        products: {
          include: {
            reviews: {
              select: {
                rating: true // Include only the stars field
              }
            }
          }
        },
      },
    });
    if (seller) {
      res.status(200).json(seller);
    } else {
      res.status(404).json({ message: 'Seller not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
};

// Get seller products including ratings
export const getSellerProducts = async (req: Request, res: Response) => {
  try {
    const sellerId = Number(req.query.sellerId);
    const products = await prisma.product.findMany({
      where: { sellerId: sellerId },
      include: {
        reviews: {
          select: {
            rating: true // Include only the stars field
          }
        }
      }
    });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
};

export default { getSellerDetails, getSellerProducts };

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

import { Request, Response } from 'express';

export const getAllProductsData = async () => {
    try {
      const products = await prisma.product.findMany({
        include: {
          seller: {
            select: {
              store_name: true
            }
          }
        }
      });
      return products;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Internal Server Error');
    }
  };

export const getAllProducts = async (req: Request, res: Response) => {
    try {
      const products = await getAllProductsData();
      console.log(products)
      res.status(200).json({
        "data":products
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
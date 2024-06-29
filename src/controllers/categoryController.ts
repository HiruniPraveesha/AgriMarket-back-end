import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllCategories1 = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      select: {
        category_id: true,  
        name: true,
        },
    });
    return res.status(200).json(categories);
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

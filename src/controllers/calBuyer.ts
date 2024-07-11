import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getCalendarEvents = async (req: Request, res: Response) => {
  try {
    const events = await prisma.calendarEvents.findMany({
      select: {
        event_id: true,
        category: {
          select :{
            category_id : true,
            name : true,
          }
        },
        product: {
          select: {
            product_id: true,
            name: true,
          },
        },
        note: true,
        start: true,
        seller: {
          select: {
            seller_id: true,
            store_name: true,
          },
        },
      },
     
    });
    return res.status(200).json(events);
  } catch (error: any) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};


export const getSellers = async (req: Request, res: Response) => {
  try {
    const sellers = await prisma.sellers.findMany({select: {
      seller_id :true,
      store_name: true, 
    },});
    res.json(sellers);
  } catch (error) {
    console.error("Error fetching sellers:", error);
    res.status(500).json({ error: "Failed to fetch sellers" });
  }
};
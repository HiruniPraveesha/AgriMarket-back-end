import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getCalendarEvents = async (req: Request, res: Response) => {
  try {
    const events = await prisma.calendarEvents.findMany({
      select: {
        event_id: true,
        categoryId: true,
        productId: true,
        productName: true,
        note: true,
        start: true,
        seller: {
          select: {
            seller_id: true,
            store_name: true, // Assuming 'name' is the field in the Seller model
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

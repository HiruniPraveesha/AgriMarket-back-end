import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getAllNotifications(req: Request, res: Response) {
  try {
    const notifications = await prisma.notifications.findMany({
      select: {
        N_id: true,
        message: true,
        timestamp: true,
        Status: true,
        sellerId: true,
        productid: true,
      },
    });
    return res.status(200).json(notifications);
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

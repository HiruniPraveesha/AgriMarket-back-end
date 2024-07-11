import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getPastOrders(req: Request, res: Response) {
  const { buyerId } = req.query;

  if (!buyerId || typeof buyerId !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing buyerId' });
  }

  try {
    const pastOrders = await prisma.orders.findMany({
      where: {
        buyerId: Number(buyerId),
      },
      include: {
        orderProducts: {
          include: {
            product: {
              select: {
                name: true,
                quantity: true,
                seller: {
                  select: {
                    line1: true,
                    line2: true,
                    district: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const orders = pastOrders.map(order => ({
      orderId: order.id,
      orderedDate: order.createdAt,
      products: order.orderProducts.map(op => ({
        name: op.product.name,
        quantity: op.quantity,
      })),
      totalAmount: order.totalAmount,
      deliveryAddress: order.deliveryAddress,
      pickupAddress: order.deliveryAddress === 'Pickup from store'
        ? `${order.orderProducts[0].product.seller.line1}, ${order.orderProducts[0].product.seller.line2}, ${order.orderProducts[0].product.seller.district}`
        : null,
    }));

    return res.status(200).json({ orders });
  } catch (error) {
    console.error('Error fetching past orders:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
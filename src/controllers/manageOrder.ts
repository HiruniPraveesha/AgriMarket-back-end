import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function CreateOrder(req: Request, res: Response) {
    const { sellerId, buyerId, productId, Amount  } = req.body;

    if (!sellerId || !buyerId || !productId || !Amount) {
        return res.status(400).json({ error: "Invalid or missing sellerId, buyerId, or productId" });
    }

    try {
        const newOrder = await prisma.orders.create({
            data: {
                sellerId: Number(sellerId),
                buyerId: Number(buyerId),
                productId: Number(productId),
                Amount: Number(Amount)
            },
        });

        return res.status(201).json({ message: 'Order created successfully', orderId: newOrder.order_id });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export const getOrderDataByProduct = async (req: Request, res: Response) => {
    try {
      const orders = await prisma.orders.groupBy({
        by: ['productId'],
        _sum: {
          Amount: true,
        },
        _count: {
          _all: true,
        },
      });
  
      // Sort orders by _count._all in descending order
      orders.sort((a, b) => b._count._all - a._count._all);
  
      // Take only the top 4 products
      const topProducts = orders.slice(0, 4);
  
      const productDetails = await Promise.all(
        topProducts.map(async (order) => {
          const product = await prisma.product.findUnique({
            where: { product_id: order.productId },
          });
          return {
            ...order,
            productName: product?.name || `Product Name ${order.productId}`, // Fallback name if product not found
          };
        })
      );
  
      res.json(productDetails);
    } catch (error) {
      console.error('Failed to fetch order data', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
export const getOrderDetails = async (req: Request, res: Response, next: NextFunction) => {
    const { orderId } = req.params;

    if (!orderId) {
        return res.status(400).json({ error: "Invalid or missing orderId" });
    }

    try {
        const order = await prisma.orders.findUnique({
            where: {
                order_id: Number(orderId),
            },
            include: {
                seller: true,
                buyer: true,
            },
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.status(200).json(order);
    } catch (error) {
        console.error('Error fetching order details:', error);
        next(new Error('Internal Server Error'));
    }
};

export const getCustomerCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const uniqueBuyers = await prisma.orders.groupBy({
            by: ['buyerId'],
            _count: true,
        });

        const customerCount = uniqueBuyers.length;


        res.status(200).json({ customerCount });
    } catch (error) {
        console.error('Error fetching customer count:', error);
        next(new Error('Internal Server Error'));
    }
};

export const getOrderCountBySellerId = async (req: Request, res: Response) => {
    const { sellerId } = req.params;
  
    if (!sellerId) {
      return res.status(400).json({ error: 'Missing sellerId parameter' });
    }
  
    try {
      const count = await prisma.orders.count({
        where: {
          sellerId: Number(sellerId),
        },
      });
      res.status(200).json({ orderCount: count });
    } catch (error) {
      console.error('Error fetching order count:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  interface SalesSummary {
    [productName: string]: number;
  }
  
  export const getProductSales = async (req: Request, res: Response) => {
    const { sellerId } = req.params;
  
    try {
      const salesData = await prisma.orders.findMany({
        where: { sellerId: Number(sellerId) },
        include: { product: true },
      });
  
      const salesSummary: SalesSummary = salesData.reduce((acc: SalesSummary, order) => {
        const productName = order.product.name;
        if (!acc[productName]) {
          acc[productName] = 0;
        }
        acc[productName] += order.product.price;
        return acc;
      }, {});
  
      const result = Object.keys(salesSummary).map((key) => ({
        name: key,
        value: salesSummary[key],
      }));
  
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  
  export const getOrders = async (req: Request, res: Response) => {
    const { sellerId } = req.params;

    if (!sellerId) {
        return res.status(400).json({ error: 'Missing sellerId parameter' });
    }

    try {
        const orders = await prisma.orders.findMany({
            where: {
                sellerId: Number(sellerId),
            },
            include: {
                buyer: {
                    select: {
                        email: true,
                    },
                },
                product: {
                    select: {
                        name: true,
                        price: true,
                    },
                },
            },
        });

        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getOrdersByDate = async (req: Request, res: Response) => {
    try {
      const orders = await prisma.orders.findMany({
        select: {
          createdAt: true,
        },
      });
  
      res.json(orders);
    } catch (error) {
      console.error('Failed to fetch orders', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
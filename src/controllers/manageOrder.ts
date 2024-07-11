import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();




export const getOrdersDataByMonth = async (req: Request, res: Response) => {
  const { sellerId } = req.query;

  try {
    if (!sellerId) {
      return res.status(400).json({ error: "Seller ID is required" });
    }

    const result = await prisma.orders.groupBy({
      by: ['createdAt'],
      _count: {
        id: true, // Count the number of orders
      },
      where: {
        orderProducts: {
          some: {
            product: {
              sellerId: Number(sellerId),
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const data = result.map((item) => ({
      month: item.createdAt.toISOString().substring(0, 7), // Extract YYYY-MM
      orders: item._count.id, // The count of orders
    }));

    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


export const getOrderDataByProduct = async (req: Request, res: Response) => {
  try {
    const orderProducts = await prisma.orderProduct.groupBy({
      by: ['productId'],
      _sum: {
        amount: true,
      },
      _count: {
        _all: true,
      },
    });

    // Sort orderProducts by _count._all in descending order
    orderProducts.sort((a, b) => b._count._all - a._count._all);

    // Take only the top 4 products
    const topProducts = orderProducts.slice(0, 4);

    const productDetails = await Promise.all(
      topProducts.map(async (orderProduct) => {
        const product = await prisma.product.findUnique({
          where: { product_id: orderProduct.productId },
        });
        return {
          ...orderProduct,
          productName: product?.name || `Product Name ${orderProduct.productId}`, // Fallback name if product not found
        };
      })
    );

    res.json(productDetails);
  } catch (error) {
    console.error('Failed to fetch order data', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// export const getOrderDetails = async (req: Request, res: Response, next: NextFunction) => {
//     const { orderId } = req.params;

//     if (!orderId) {
//         return res.status(400).json({ error: "Invalid or missing orderId" });
//     }

//     try {
//         const order = await prisma.orders.findUnique({
//             where: {
//                 order_id: Number(orderId),
//             },
//             include: {
//                 seller: true,
//                 buyer: true,
//             },
//         });

//         if (!order) {
//             return res.status(404).json({ error: 'Order not found' });
//         }

//         res.status(200).json(order);
//     } catch (error) {
//         console.error('Error fetching order details:', error);
//         next(new Error('Internal Server Error'));
//     }
// };

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
        orderProducts: {
          some: {
            product: {
              sellerId: Number(sellerId),
            },
          },
        },
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

// Fetch product sales for a specific seller
export const getProductSales = async (req: Request, res: Response) => {
  const { sellerId } = req.params;

  if (!sellerId) {
    return res.status(400).json({ error: 'Missing sellerId parameter' });
  }

  try {
    const salesData = await prisma.orderProduct.findMany({
      where: {
        product: {
          sellerId: Number(sellerId),
        },
      },
      include: {
        product: true,
      },
    });

    const salesSummary: SalesSummary = salesData.reduce((acc: SalesSummary, orderProduct) => {
      const productName = orderProduct.product.name;
      if (!acc[productName]) {
        acc[productName] = 0;
      }
      acc[productName] += orderProduct.amount;
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

// Fetch all orders for a specific seller
export const getOrders = async (req: Request, res: Response) => {
  const { sellerId } = req.params;

  if (!sellerId) {
    return res.status(400).json({ error: 'Missing sellerId parameter' });
  }

  try {
    const orders = await prisma.orders.findMany({
      where: {
        orderProducts: {
          some: {
            product: {
              sellerId: Number(sellerId),
            },
          },
        },
      },
      include: {
        buyer: {
          select: {
            email: true,
          },
        },
        orderProducts: {
          include: {
            product: {
              select: {
                name: true,
                price: true,
              },
            },
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

// Fetch orders by their creation date
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

// Fetch the count of orders grouped by month for a specific seller
export const getOrdersByMonth = async (req: Request, res: Response) => {
  const { sellerId } = req.query;

  if (!sellerId) {
    return res.status(400).json({ error: 'Missing sellerId parameter' });
  }

  try {
    const result = await prisma.orders.groupBy({
      by: ['createdAt'],
      _count: {
        id: true,
      },
      where: {
        orderProducts: {
          some: {
            product: {
              sellerId: Number(sellerId),
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const data = result.map((item) => ({
      month: item.createdAt.toISOString().substring(0, 7), // Extract YYYY-MM
      orders: item._count.id,
    }));

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching monthly order data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Fetch monthly order data for a specific seller
export const getMonthlyOrderData = async (req: Request, res: Response) => {
  const { sellerId } = req.params;

  if (!sellerId) {
    return res.status(400).json({ error: 'Missing sellerId parameter' });
  }

  try {
    const monthlyOrderData = await prisma.orders.groupBy({
      by: ['createdAt'],
      _count: {
        id: true,
      },
      where: {
        orderProducts: {
          some: {
            product: {
              sellerId: Number(sellerId),
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const result = monthlyOrderData.map((item) => ({
      month: item.createdAt.toISOString().substring(0, 7), // Extract YYYY-MM
      orders: item._count.id,
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching monthly order data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
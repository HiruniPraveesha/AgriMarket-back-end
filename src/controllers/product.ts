import { PrismaClient } from '@prisma/client';
import { Request, Response, NextFunction} from 'express';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

interface MulterS3File extends Express.Multer.File {
  location: string;
}

const s3 = new S3Client({
  region: 'eu-north-1', // Update with your AWS region
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME || '',
    acl: 'public-read',
    key: function (_req, file, cb) {
      const ext = path.extname(file.originalname);
      const uniqueSuffix = `${Math.random().toString(36).substring(2, 15)}`;
      cb(null, `${Date.now().toString()}-${uniqueSuffix}${ext}`);
    },
    
  }),
});


const addProduct = async (req: Request, res: Response) => {
  console.log('Request body:', req.body);
  console.log('Files:', req.files);

  const { name, price, description, categoryId, sellerName, quantity, quantityLimit } = req.body;

  try {
    // Verify seller existence by name
    const seller = await prisma.sellers.findFirst({
      where: {
        store_name: sellerName,
      },
    });

    if (!seller) {
      return res.status(404).json({ error: 'Seller not found' });
    }

    const sellerId = seller.seller_id;

    // Check if files and 'image' fields exist in the request
    const files = req.files as { [fieldname: string]: Express.MulterS3.File[] } | undefined;
    if (!files || !files['image1'] || !files['image2'] || !files['image3'] || !files['image4']) {
      return res.status(400).json({ error: 'Four image files are required' });
    }

    // Get the locations of the uploaded images
    const image1 = files['image1'][0].location;
    const image2 = files['image2'][0].location;
    const image3 = files['image3'][0].location;
    const image4 = files['image4'][0].location;

    // Validate and convert categoryId to an integer
    const categoryIdInt = parseInt(categoryId, 10);
    if (isNaN(categoryIdInt)) {
      return res.status(400).json({ error: 'Invalid categoryId' });
    }

    // Create the product using Prisma
    const product = await prisma.product.create({
      data: {
        name,
        price: parseFloat(price),
        description,
        image1,
        image2,
        image3,
        image4,
        quantity: parseInt(quantity, 10),
        quantityLimit: parseInt(quantityLimit, 10),
        category: {
          connect: { category_id: categoryIdInt },
        },
        seller: {
          connect: { seller_id: sellerId },
        },
      },
      include: {
        category: true, // Include the category details in the response
      },
    });

    res.status(200).json({ message: 'Product added successfully', product });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const uploadMiddleware = upload.fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
  { name: 'image4', maxCount: 1 }
]);

export { addProduct, uploadMiddleware };

export const getAllProductsData = async () => {
    try {
      const products = await prisma.product.findMany({
        include: {
          seller: {
            select: {
              seller_id:true,
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

  export const getProductById = async (req: Request, res: Response) => {
    const { productId } = req.params;
  
    try {
      const product = await prisma.product.findUnique({
        where: {
          product_id: parseInt(productId),
        },
        include: {
          category: true, // Include category details
          seller: true,   // Include seller details
          reviews: true,  // Include reviews related to the product
        },
      });
  
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
  
      res.status(200).json(product);
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };


//getMoreProducts
export const getMoreProducts = async (req: Request, res: Response) => {
  const { productId } = req.params;
  const limit = parseInt(req.query.limit as string) || undefined;

  try {
    // Fetch the current product details
    const currentProduct = await prisma.product.findUnique({
      where: {
        product_id: parseInt(productId),
      },
    });

    if (!currentProduct) {
      return res.status(404).json({ error: 'Current product not found' });
    }

    // Fetch other products in the same category excluding the current one
    const moreProducts = await prisma.product.findMany({
      where: {
        product_id: {
          not: parseInt(productId),
        },
        categoryId: currentProduct.categoryId,
      },
      include: {
        seller: true, // Include seller details if needed
      },
      take: limit,
    });

    res.status(200).json(moreProducts);
  } catch (error) {
    console.error('Error fetching more products:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


  export const getProductsByCategoryId = async (req: Request, res: Response) => {
    const { categoryId } = req.params;
  
    try {
      const products = await prisma.product.findMany({
        where: {
          categoryId: parseInt(categoryId),
        },
        include: {
          seller: true,   // Include seller details
          reviews: true,  // Include reviews related to the product
          category: true  // Include category details
        },
      });
  
      if (products.length === 0) {
        return res.status(404).json({ error: 'No products found for this category' });
      }
  
      res.status(200).json(products);
    } catch (error) {
      console.error('Error fetching products by category:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  export const getProductsBySellerId = async (req: Request, res: Response) => {
    const { sellerId } = req.params;
  
    try {
      const products = await prisma.product.findMany({
        where: {
          sellerId: parseInt(sellerId),
        },
        include: {
          category: true,   // Include category details
          seller: true,     // Include seller details
          reviews: true,    // Include reviews related to the product
          notifications: true, // Include notifications related to the product
        },
      });
  
      if (products.length === 0) {
        return res.status(404).json({ error: 'No products found for this seller' });
      }
  
      const productsWithStoreName = products.map(product => ({
        ...product,
        store_name: product.seller.store_name,
      }));
  
      res.status(200).json(productsWithStoreName);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { price, description } = req.body; // Only update price and description
  
    try {
      const updatedProduct = await prisma.product.update({
        where: { product_id: parseInt(id) },
        data: {
          price: parseFloat(price),
          description,
        },
      });
  
      res.status(200).json({ success: true, msg: "Product updated successfully", updatedProduct });
    } catch (error) {
      console.error('Error updating product:', error);
      next(new Error('Internal Server Error'));
    }
  };
  
  // export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  //   const { id } = req.params;
  
  //   try {
  //     await prisma.product.delete({
  //       where: { product_id: parseInt(id) }
  //     });
  
  //     res.status(200).json({ success: true, msg: "Product deleted successfully" });
  //   } catch (error) {
  //     console.error('Error deleting product:', error);
  //     next(new Error('Internal Server Error'));
  //   }
  // };
  export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
  
    try {
      const productId = parseInt(id);
  
      // Delete related records
      await prisma.notifications.deleteMany({
        where: { productId },
      });
  
      await prisma.orderProduct.deleteMany({
        where: { productId },
      });
  
      await prisma.reviewAndRating.deleteMany({
        where: { productId },
      });
  
      // Assuming there's a `productImage` model to be deleted

      // Delete the product
      await prisma.product.delete({
        where: { product_id: productId },
      });
  
      res.status(200).json({ success: true, msg: 'Product deleted successfully' });
    } catch (error) {
      console.error('Error deleting product:', error);
      next(new Error('Internal Server Error'));
    }
  };
  
  export const getProductsCount = async (req: Request, res: Response) => {
    try {
      const productsCount = await prisma.product.count();
      res.json({ count: productsCount });
    } catch (error) {
      console.error('Error fetching products count:', error);
      res.status(500).json({ error: 'Failed to fetch count' });
    }
  };
  
  export const getProductCountBySellerId = async (req: Request, res: Response) => {
    const { sellerId } = req.params;
  
    if (!sellerId) {
      return res.status(400).json({ error: 'Missing sellerId parameter' });
    }
  
    try {
      const count = await prisma.product.count({
        where: {
          sellerId: Number(sellerId),
        },
      });
      res.status(200).json({ productCount: count });
    } catch (error) {
      console.error('Error fetching product count:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  export const getSellersOrderCount = async (req: Request, res: Response) => {
    try {
      // First, fetch all sellers and their products
      const sellersWithProducts = await prisma.sellers.findMany({
        select: {
          seller_id: true,
          store_name: true,
          products: {
            select: {
              product_id: true,
            },
          },
        },
      });
  
      // Count orders for each seller based on their product IDs
      const sellersOrderCount = await Promise.all(
        sellersWithProducts.map(async (seller) => {
          const productIds = seller.products.map((product) => product.product_id);
  
          const orderCount = await prisma.orderProduct.count({
            where: {
              productId: { in: productIds },
            },
          });
  
          return {
            seller_id: seller.seller_id,
            store_name: seller.store_name,
            order_count: orderCount,
          };
        })
      );
  
      // Sort the sellers by order count in descending order
      sellersOrderCount.sort((a, b) => b.order_count - a.order_count);
  
      res.status(200).json(sellersOrderCount);
    } catch (error) {
      console.error('Error fetching sellers order count:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
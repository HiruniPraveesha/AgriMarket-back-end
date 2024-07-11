import { PrismaClient } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

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
    key: function (_req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now().toString()}${ext}`);
    },
  }),
});

interface MulterS3File extends Express.Multer.File {
  location: string;
}

async function addProduct(req: Request, res: Response) {
  const { name, price, description, categoryId, sellerId, quantity, quantityLimit } = req.body;

  try {
    // Verify seller existence
    const seller = await prisma.sellers.findUnique({
      where: {
        seller_id: parseInt(sellerId),
      },
    });

    if (!seller) {
      return res.status(404).json({ error: 'Seller not found' });
    }

    // Check if files and 'image' field exist in the request
    const files = req.files as { [fieldname: string]: MulterS3File[] } | undefined;
    if (!files || !files['image']) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    // Get the location of the uploaded image
    const images = files['image'][0].location; // Assuming 'image' is the field name in the form

    // Create the product using Prisma
    const product = await prisma.product.create({
      data: {
        name,
        price: parseFloat(price),
        description,
        // images,
        quantity: parseInt(quantity, 10),
        quantityLimit: parseInt(quantityLimit, 10),
        category: {
          connect: { category_id: parseInt(categoryId, 10) },
        },
        seller: {
          connect: { seller_id: parseInt(sellerId, 10) },
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
}

const uploadMiddleware = upload.fields([{ name: 'image', maxCount: 1 }]);

export { addProduct, uploadMiddleware };


//old==================================================================================================
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
  
  export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
  
    try {
      // Delete related records
      await prisma.notifications.deleteMany({
        where: { productid: parseInt(id) },
      });
  
      await prisma.cartProduct.deleteMany({
        where: { productId: parseInt(id) },
      });
  
      await prisma.reviewAndRating.deleteMany({
        where: { productId: parseInt(id) },
      });
  
      await prisma.productImage.deleteMany({
        where: { productId: parseInt(id) },
      });
  
      await prisma.orders.deleteMany({
        where: { productId: parseInt(id) },
      });
  
      // Delete the product
      await prisma.product.delete({
        where: { product_id: parseInt(id) },
      });
  
      res.status(200).json({ success: true, msg: "Product deleted successfully" });
    } catch (error) {
      console.error('Error deleting product:', error);
      next(new Error('Internal Server Error'));
    }
  };
  

  export const getProductsCount = async(req: Request, res: Response) => {
    try{
        const productsCount = await prisma.product.count();
        res.json({count: productsCount})
    } catch (error){
        res.status(500).json({error:'Failed to fetch count'});
    }
}


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
    console.error('Error fetching order count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSellersOrderCount = async (req: Request, res: Response) => {
  try {
    const sellersOrderCount = await prisma.sellers.findMany({
      select: {
        seller_id: true,
        store_name: true,
        _count: {
          select: { orders: true },
        },
      },
      orderBy: {
        orders: {
          _count: 'desc',
        },
      },
    });

    res.status(200).json(sellersOrderCount);
  } catch (error) {
    console.error('Error fetching sellers order count:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

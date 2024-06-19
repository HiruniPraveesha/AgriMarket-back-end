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

  export const getMoreProducts = async (req: Request, res: Response) => {
    const { productId } = req.params;
  
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
  
      // Fetch other products excluding the current one
      const moreProducts = await prisma.product.findMany({
        where: {
          product_id: {
            not: parseInt(productId),
          },
        },
        take: 4, // Adjust as per your requirement
        include: {
          seller: true, // Include seller details if needed
        },
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
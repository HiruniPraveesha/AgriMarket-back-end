import { PrismaClient } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads'); // Destination folder for uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Unique filename
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5 MB max file size
  },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }

    cb(new Error('Only images (jpeg, jpg, png) are allowed'));
  }
}).array('images', 4); // 'images' is the field name in the form, 4 is max number of files

export const addProduct = (req: Request, res: Response, next: NextFunction) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      console.error('Multer error:', err);
      return res.status(400).json({ error: 'File upload error' });
    } else if (err) {
      // An unknown error occurred
      console.error('Unknown error:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    const { categoryId, name, price, description, sellerId, quantity, quantityLimit } = req.body;
    const images = (req.files as Express.Multer.File[]) || [];

    try {
      // const existingProduct = await prisma.product.findUnique({
      //   where: { name }
      // });

      // if (existingProduct) {
      //   return res.status(409).json({ error: 'Product already exists' });
      // }

      // Read file contents and convert to binary
      const imageBinaries = await Promise.all(
        images.map(async (image) => {
          const imageData = await fs.promises.readFile(image.path);
          return imageData;
        })
      );

      // Create product in the database
      const newProduct = await prisma.product.create({
        data: {
          categoryId: parseInt(categoryId),
          name,
          price: parseFloat(price),
          description,
          sellerId: parseInt(sellerId),
          quantity: parseInt(quantity),
          quantityLimit: parseInt(quantityLimit),
          images: {
            create: imageBinaries.map((imageData) => ({ image: imageData }))
          }
        }
      });

      res.status(201).json({ success: true, msg: "Successfully inserted product", newProduct });
    } catch (error) {
      console.error('Error adding product:', error);
      next(new Error('Internal Server Error'));
    }
  });
};

// CRUD Operations
export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await prisma.product.findMany({
      // include: {
      //   images: true,
      // }
    });
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    next(new Error('Internal Server Error'));
  }
};

// export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
//   const { id } = req.body;
//   try {
//     const product = await prisma.product.findUnique({
//       where: { product_id: parseInt(id) },
//       // include: {
//       //   images: true,
//       // }
//     });

//     if (!product) {
//       return res.status(404).json({ error: 'Product not found' });
//     }

//     res.status(200).json(product);
//   } catch (error) {
//     console.error('Error fetching product:', error);
//     next(new Error('Internal Server Error'));
//   }
// };

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { categoryId, name, price, description, sellerId, quantity, quantityLimit } = req.body;

  try {
    const updatedProduct = await prisma.product.update({
      where: { product_id: parseInt(id) },
      data: {
        categoryId: parseInt(categoryId),
        name,
        price: parseFloat(price),
        description,
        sellerId: parseInt(sellerId),
        quantity: parseInt(quantity),
        quantityLimit: parseInt(quantityLimit)
      }
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
    await prisma.product.delete({
      where: { product_id: parseInt(id) }
    });

    res.status(200).json({ success: true, msg: "Product deleted successfully" });
  } catch (error) {
    console.error('Error deleting product:', error);
    next(new Error('Internal Server Error'));
  }
};

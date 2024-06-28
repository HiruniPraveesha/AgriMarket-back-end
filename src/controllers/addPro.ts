/*import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import { S3Client } from '@aws-sdk/client-s3';

const prisma = new PrismaClient();

// Configure AWS SDK
const s3 = new S3Client({
    region: 'eu-north-1',
    credentials: {
      accessKeyId: 'AKIAQ3EGQZ5RAJLUOWAH',
      secretAccessKey:'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',
    },
  });
// Set up multer for file upload to S3
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'agrimarketbucket',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      cb(null, 'products/' + Date.now().toString() + path.extname(file.originalname)); // Customize key name as per your requirement
    },
  }),
});

export const addProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, price, description, categoryId, sellerId, quantity, quantityLimit } = req.body;

    // Save image URL from AWS S3
    const imageUrl = req.file ? (req.file as any).location : undefined;

    // Create product in database
    const product = await prisma.product.create({
      data: {
        name,
        price: parseFloat(price),
        description,
        image: imageUrl,
        categoryId: parseInt(categoryId),
        sellerId: parseInt(sellerId),
        quantity: parseInt(quantity),
        quantityLimit: parseInt(quantityLimit),
      },
    });

    res.status(201).json({ message: 'Product added successfully', product });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Failed to add product' });
  }
};

// Middleware for handling file upload
export const uploadImage = upload.single('image');
*/
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
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

export const createNotification = async (req: Request, res: Response) => {
  const { message, sellerId, productId, categoryId } = req.body;
  const file = req.file;

  try {
    // Validate required fields
    if (!message || !sellerId || !productId || !categoryId) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }

    // Parse numeric fields
    const parsedSellerId = parseInt(sellerId);
    const parsedProductId = parseInt(productId);
    const parsedCategoryId = parseInt(categoryId);

    // Check if files and 'image' fields exist in the request
    const file = req.files as { [fieldname: string]: Express.MulterS3.File[] } | undefined;
    if (file) {
      const image1 = file['image1'][0].location;
    }

    const newNotification = await prisma.notifications.create({
      data : {
        message: String(message),
        sellerId: parsedSellerId,
        productId: parsedProductId,
        categoryId: parsedCategoryId,
        timestamp: new Date(),
      
      },
    });
    res.status(200).json({ message: 'Notification added successfully' });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Internal server error' });
  }

  const uploadMiddleware = upload.fields([
    { name: 'image1', maxCount: 1 }
  ]);

};

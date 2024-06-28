

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { S3Client } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const s3 = new S3Client({
  region: 'eu-north-1',
  credentials: {
    accessKeyId: 'AKIAQ3EGQZ5RAJLUOWAH',
    secretAccessKey:'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',
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

async function verifyBank(req: Request, res: Response) {
  const { sellerId, bankName, accountHolder, bankCode, accountNumber } = req.body;

  
  try {
    const parsedSellerId = parseInt(sellerId, 10);

    if (isNaN(parsedSellerId)) {
      return res.status(400).json({ error: 'Invalid seller ID' });
    }

    const seller = await prisma.sellers.findUnique({
      where: { seller_id: parsedSellerId },
    });
    if (!seller) {
      return res.status(404).json({ error: 'Seller not found' });
    }

    const files = req.files as { [fieldname: string]: MulterS3File[] } | undefined;

    if (!files || !files['idFrontPhoto'] || !files['idBackPhoto'] || !files['bankBookPhoto']) {
      return res.status(400).json({ error: 'All photo files are required' });
    }

    const idFrontPhoto = files['idFrontPhoto'][0].location;
    const idBackPhoto = files['idBackPhoto'][0].location;
    const bankBookPhoto = files['bankBookPhoto'][0].location;

    const bankVerification = await prisma.sellerBankVerification.create({
      data: {
        seller: { connect: { seller_id: parsedSellerId } },
        idFrontPhoto,
        idBackPhoto,
        bankBookPhoto,
        bankName,
        accountHolder,
        bankCode,
        accountNumber,
      }
    });

    res.status(200).json({ message: 'Bank details verified and stored successfully', bankVerification });
  } catch (error) {
    console.error('Error verifying bank details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

const uploadMiddleware = upload.fields([
  { name: 'idFrontPhoto', maxCount: 1 },
  { name: 'idBackPhoto', maxCount: 1 },
  { name: 'bankBookPhoto', maxCount: 1 },
]);

export { verifyBank, uploadMiddleware };

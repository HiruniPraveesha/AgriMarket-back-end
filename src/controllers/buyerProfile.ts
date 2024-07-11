

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import aws from 'aws-sdk';
import multer from 'multer';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Initialize AWS SDK
const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST /api/buyer/profile/photo/:buyerId
export const uploadProfilePhoto = upload.single('profilePhoto');

// PUT /api/buyer/profile/photo/:buyerId
export const updateProfilePhoto = async (req: Request, res: Response): Promise<void> => {
  const buyerId = parseInt(req.params.buyerId);

  try {
    let imageUrl: string | undefined;

    // Check if profile photo was uploaded
    if (req.file) {
      const fileContent = req.file.buffer;

      // Upload image to AWS S3
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME || '',
        Key: `buyer-profile-photos/${uuidv4()}.jpg`,
        Body: fileContent,
        ACL: 'public-read',
        ContentType: 'image/jpeg',
      };

      const uploadResult = await s3.upload(params).promise();
      imageUrl = uploadResult.Location;
    }

    // Update profile photo URL if uploaded
    const updatedBuyer = await prisma.buyers.update({
      where: { buyer_id: buyerId },
      data: {
        profilePhoto: imageUrl,
      },
    });

    res.json(updatedBuyer);
  } catch (error) {
    console.error('Error updating profile photo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PUT /api/buyer/email/:buyerId
export const updateEmail = async (req: Request, res: Response): Promise<void> => {
  const buyerId = parseInt(req.params.buyerId);
  const { email } = req.body;

  try {
    const updatedBuyer = await prisma.buyers.update({
      where: { buyer_id: buyerId },
      data: {
        email,
      },
    });

    res.json(updatedBuyer);
  } catch (error) {
    console.error('Error updating email:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PUT /api/buyer/contact/:buyerId
export const updateContactNumber = async (req: Request, res: Response): Promise<void> => {
  const buyerId = parseInt(req.params.buyerId);
  const { contactNo } = req.body;

  try {
    const updatedBuyer = await prisma.buyers.update({
      where: { buyer_id: buyerId },
      data: {
        contactNo,
      },
    });

    res.json(updatedBuyer);
  } catch (error) {
    console.error('Error updating contact number:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
// PUT /api/buyer/city/:buyerId
export const updateCity = async (req: Request, res: Response): Promise<void> => {
  const buyerId = parseInt(req.params.buyerId);
  const { city } = req.body;

  try {
    // Check if the address already exists for the buyer
    const existingAddress = await prisma.buyerAddress.findFirst({
      where: {
        buyerId,
      },
    });

    if (existingAddress) {
      // Update the existing address
      const updatedAddress = await prisma.buyerAddress.updateMany({
        where: { buyerId },
        data: {
          city,
        },
      });
      res.json(updatedAddress);
    } else {
      // Create a new address
      const newAddress = await prisma.buyerAddress.create({
        data: {
          buyerId,
          line1: '',
          line2: '',
          postalCode: 0,
          city,
        },
      });
      res.json(newAddress);
    }
  } catch (error) {
    console.error('Error updating city:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
};

// PUT /api/buyer/address/:buyerId
export const updateAddress = async (req: Request, res: Response): Promise<void> => {
  const buyerId = parseInt(req.params.buyerId);
  const { addressLine1, addressLine2, postalCode, city } = req.body;

  try {
    // Check if the address already exists for the buyer
    const existingAddress = await prisma.buyerAddress.findFirst({
      where: {
        buyerId,
      },
    });

    if (existingAddress) {
      // Update the existing address
      const updatedAddress = await prisma.buyerAddress.updateMany({
        where: { buyerId },
        data: {
          city,
          line1: addressLine1,
          line2: addressLine2,
          postalCode: parseInt(postalCode),
        },
      });
      res.json(updatedAddress);
    } else {
      // Create a new address
      const newAddress = await prisma.buyerAddress.create({
        data: {
          buyerId,
          city:'',
          line1: addressLine1,
          line2: addressLine2,
          postalCode: parseInt(postalCode),
        },
      });
      res.json(newAddress);
    }
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
};
// PUT /api/buyer/password/:buyerId
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  const buyerId = parseInt(req.params.buyerId);
  const { currentPassword, newPassword } = req.body;

  try {
    // Fetch current buyer record
    const buyer = await prisma.buyers.findUnique({
      where: { buyer_id: buyerId },
    });

    if (!buyer) {
      res.status(404).json({ error: 'Buyer not found' });
      return;
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, buyer.password);

    if (!isPasswordValid) {
      res.status(401).json({ error: 'Current password is incorrect' });
      return;
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update buyer's password
    await prisma.buyers.update({
      where: { buyer_id: buyerId },
      data: {
        password: hashedPassword,
      },
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/buyer/:buyerId
export const getBuyerDetails = async (req: Request, res: Response): Promise<void> => {
  const buyerId = parseInt(req.params.buyerId);

  try {
    const buyer = await prisma.buyers.findUnique({
      where: { buyer_id: buyerId },
      select: {
        email: true,
        contactNo: true,
        profilePhoto: true,
      },
    });

    if (!buyer) {
      res.status(404).json({ error: 'Buyer not found' });
      return;
    }

    res.json(buyer);
  } catch (error) {
    console.error('Error fetching buyer details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};




export const getBuyerAddress = async (req: Request, res: Response): Promise<void> => {
  const buyerId = parseInt(req.params.buyerId);

  try {
    // Fetch buyer's address details
    const buyerAddress = await prisma.buyerAddress.findFirst({
      where: {
        buyerId,
      },
    });

    if (!buyerAddress) {
      res.status(404).json({ error: 'Buyer address not found' });
      return;
    }

    res.json(buyerAddress);
  } catch (error) {
    console.error('Error fetching buyer address:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}


// Export controller functions
export default {
  uploadProfilePhoto,
  updateProfilePhoto,
  updateEmail,
  updateContactNumber,
  updateCity,
  updateAddress,
  changePassword,
  getBuyerDetails,
  getBuyerAddress,
};

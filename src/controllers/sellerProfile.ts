
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Get seller details including products and ratings
export const getSellerDetails = async (req: Request, res: Response) => {

  try {
    const sellerId = Number(req.query.sellerId);
    const seller = await prisma.sellers.findUnique({
      where: { seller_id: sellerId },
      include: {
        products: {
          include: {
            reviews: {
              select: {
                rating: true // Include only the stars field
              }
            }
          }
        },
      },
    });
    if (seller) {
      res.status(200).json(seller);
    } else {
      res.status(404).json({ message: 'Seller not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
};

// Get seller products including ratings
export const getSellerProducts = async (req: Request, res: Response) => {
  try {
    const sellerId = Number(req.query.sellerId);
    const products = await prisma.product.findMany({
      where: { sellerId: sellerId },
      include: {
        reviews: {
          select: {
            rating: true // Include only the stars field
          }
        }
      }
    });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
};


export async function ChangeContactNumber(req: Request, res: Response) {
  const { id, newContactNumber } = req.body;

  if (!id || !newContactNumber) {
      return res.status(400).json({ error: 'Invalid or missing parameters' });
  }

  try {
      const updatedUser = await prisma.sellers.update({
          where: {
              seller_id: parseInt(id),
          },
          data: {
              contactNo: newContactNumber,
          },
      });

      return res.status(200).json({ message: 'User Contact Number updated successfully', user: updatedUser });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function ChangePassword(req: Request, res: Response) {
  const { id, currentPassword, newPassword, confirmPassword } = req.body;

  if (!id || !currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'Invalid or missing parameters' });
  }

  if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'New password and confirm password do not match' });
  }

  try {
      const user = await prisma.sellers.findUnique({
          where: {
              seller_id: parseInt(id),
          },
      });

      if (!user) {
          return res.status(404).json({ error: 'User not found' });
      }

      if (!user.password) {
          return res.status(400).json({ error: 'Password not set for this user' });
      }

      // Debugging: log the user and password details
      console.log('User found:', user);
      console.log('Stored password (hashed):', user.password);
      console.log('Current password (plain):', currentPassword);

      const passwordMatch = await bcrypt.compare(currentPassword, user.password);

      // Debugging: log the result of the password comparison
      console.log('Password match:', passwordMatch);

      if (!passwordMatch) {
          return res.status(400).json({ error: 'Current password is incorrect' });
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      const updatedUser = await prisma.sellers.update({
          where: {
              seller_id: parseInt(id),
          },
          data: {
              password: hashedNewPassword,
          },
      });

      return res.status(200).json({ message: 'User password updated successfully', user: updatedUser });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
  }
}




export default { getSellerDetails, getSellerProducts };


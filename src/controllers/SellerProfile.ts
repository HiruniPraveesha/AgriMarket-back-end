import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function GetSellerDetails(req: Request, res: Response) {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'Invalid or missing user ID' });
    }

    try {
        const user = await prisma.sellers.findUnique({
            where: {
                seller_id: Number(id),
            },
            select: {
                store_name: true,
                contactNo: true,
                email: true,
                password: true,
                line1: true,
                line2: true,
                city: true,
                district: true,
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.status(200).json({ data: user });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}


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

        const passwordMatch = await bcrypt.compare(currentPassword, String(user.password));

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

export async function ChangeCity(req: Request, res: Response) {
    const { id, newCity } = req.body;

    if (!id || !newCity) {
        return res.status(400).json({ error: 'Invalid or missing parameters' });
    }

    try {
        const updatedAddress = await prisma.sellers.updateMany({
            where: {
                seller_id: parseInt(id),
            },
            data: {
                city: newCity,
            },
        });

        if (updatedAddress.count === 0) {
            return res.status(404).json({ error: 'Address not found for the specified buyer' });
        }

        return res.status(200).json({ message: 'User city updated successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export async function ChangeDistrict(req: Request, res: Response) {
    const { id, newDistrict } = req.body;

    if (!id || !newDistrict) {
        return res.status(400).json({ error: 'Invalid or missing parameters' });
    }

    try {
        const updatedAddress = await prisma.sellers.updateMany({
            where: {
                seller_id: parseInt(id),
            },
            data: {
                city: newDistrict,
            },
        });

        if (updatedAddress.count === 0) {
            return res.status(404).json({ error: 'Address not found for the specified buyer' });
        }

        return res.status(200).json({ message: 'User district updated successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export async function ChangeAddress(req: Request, res: Response) {
    const { id, newAddressLine1, newAddressLine2 } = req.body;

    if (!id || typeof id !== 'string' || !newAddressLine1 || typeof newAddressLine1 !== 'string' || !newAddressLine2 || typeof newAddressLine2 !== 'string') {
        return res.status(400).json({ error: 'Invalid or missing parameters' });
    }

    try {
        // Find the seller with the given id
        const seller = await prisma.sellers.findUnique({
            where: {
                seller_id: parseInt(id),
            },
        });

        if (!seller) {
            return res.status(404).json({ error: 'Seller not found' });
        }

        // Update the seller's address lines
        const updatedSeller = await prisma.sellers.update({
            where: {
                seller_id: seller.seller_id,
            },
            data: {
                line1: newAddressLine1,
                line2: newAddressLine2,
            },
        });

        return res.status(200).json({ message: 'Seller address updated successfully', address: updatedSeller });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}


import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function GetUserName(req: Request, res: Response) {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Invalid or missing user ID' });
    }

    try {
        const user = await prisma.users.findUnique({
            where: {
                id: parseInt(id),
            },
            select: {
                name: true,
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.status(200).json({ name: user.name });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export async function ChangeUserName(req: Request, res: Response) {
    const { id, newName } = req.body;

    if (!id || typeof id !== 'string' || !newName || typeof newName !== 'string') {
        return res.status(400).json({ error: 'Invalid or missing parameters' });
    }

    try {
        const updatedUser = await prisma.users.update({
            where: {
                id: parseInt(id),
            },
            data: {
                name: newName,
            },
        });

        return res.status(200).json({ message: 'User name updated successfully', user: updatedUser });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export async function GetContactNumber(req: Request, res: Response) {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Invalid or missing user ID' });
    }

    try {
        const user = await prisma.users.findUnique({
            where: {
                id: parseInt(id),
            },
            select: {
                contactNo: true, 
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.status(200).json({ contactNumber: user.contactNo });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}


export async function ChangeContactNumber(req: Request, res: Response) {
    const { id, newContactNumber } = req.body;

    if (!id || typeof id !== 'string' || !newContactNumber || typeof newContactNumber !== 'string') {
        return res.status(400).json({ error: 'Invalid or missing parameters' });
    }

    try {
        const updatedUser = await prisma.users.update({
            where: {
                id: parseInt(id),
            },
            data: {
                contactNo: newContactNumber,
            },
        });

        return res.status(200).json({ message: 'User contact number updated successfully', user: updatedUser });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export async function ChangePassword(req: Request, res: Response) {
    const { id, currentPassword, newPassword, confirmPassword } = req.body;

    if (!id || typeof id !== 'string' || !currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ error: 'Invalid or missing parameters' });
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json({ error: 'New password and confirm password do not match' });
    }

    try {
        const user = await prisma.users.findUnique({
            where: {
                id: parseInt(id),
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const passwordMatch = await bcrypt.compare(currentPassword, user.password);

        if (!passwordMatch) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        const updatedUser = await prisma.users.update({
            where: {
                id: parseInt(id),
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

export async function GetCity(req: Request, res: Response) {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Invalid or missing user ID' });
    }

    try {
        const user = await prisma.users.findUnique({
            where: {
                id: parseInt(id),
            },
            select: {
                city: true, 
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.status(200).json({ city: user.city });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export async function ChangeCity(req: Request, res: Response) {
    const { id, newCity } = req.body;

    if (!id || typeof id !== 'string' || !newCity || typeof newCity !== 'string') {
        return res.status(400).json({ error: 'Invalid or missing parameters' });
    }

    try {
        const updatedUser = await prisma.users.update({
            where: {
                id: parseInt(id),
            },
            data: {
                city: newCity,
            },
        });

        return res.status(200).json({ message: 'User city updated successfully', user: updatedUser });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export async function GetAddress(req: Request, res: Response) {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Invalid or missing user ID' });
    }

    try {
        const user = await prisma.users.findUnique({
            where: {
                id: parseInt(id),
            },
            select: {
                line1: true,
                line2: true,
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.status(200).json({ addressLine1: user.line1, addressLine2: user.line2 });
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
        const updatedUser = await prisma.users.update({
            where: {
                id: parseInt(id),
            },
            data: {
                line1: newAddressLine1,
                line2: newAddressLine2,
            },
        });

        return res.status(200).json({ message: 'User address updated successfully', user: updatedUser });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}










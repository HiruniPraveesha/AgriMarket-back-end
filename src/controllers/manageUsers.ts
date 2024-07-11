import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllBuyers = async (req: Request, res: Response) => {
    try {
        const buyers = await prisma.buyers.findMany();
        res.json({ data: buyers });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch buyers' });
    }
};

export const getBuyerById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const buyer = await prisma.buyers.findUnique({
            where: { buyer_id: parseInt(id) },
        });
        if (buyer) {
            res.json({ data: buyer });
        } else {
            res.status(404).json({ error: 'Buyer not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch buyer' });
    }
};

// export const createBuyer = async (req: Request, res: Response) => {
//     const { name, email, address, contactNo, password } = req.body;
//     try {
//         const newBuyer = await prisma.buyers.create({
//             data: { name, email, address, contactNo, password },
//         });
//         res.status(201).json({ data: newBuyer });
//     } catch (error) {
//         res.status(500).json({ error: 'Failed to create buyer' });
//     }
// };

// export const updateBuyer = async (req: Request, res: Response) => {
//     const { id } = req.params;
//     const { name, email, address, contactNo, password } = req.body;
//     try {
//         const updatedBuyer = await prisma.buyers.update({
//             where: { buyer_id: parseInt(id) },
//             data: { name, email, address, contactNo, password },
//         });
//         res.json({ data: updatedBuyer });
//     } catch (error) {
//         res.status(500).json({ error: 'Failed to update buyer' });
//     }
// };

export const deleteBuyer = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {

        
        await prisma.buyerAddress.deleteMany({ where: { buyerId: parseInt(id) } });

        await prisma.wallet.deleteMany({ where: { buyerId: parseInt(id) } });

        await prisma.reviewAndRating.deleteMany({ where: { buyerId: parseInt(id) } });
        
        await prisma.orders.deleteMany({ where: { buyerId: parseInt(id) } });

        await prisma.buyers.delete({
            where: { buyer_id: parseInt(id) },
        });

        res.json({ message: 'Buyer deleted successfully' });
    } catch (error) {
        console.error('Error deleting buyer:', error);
        res.status(500).json({ error: 'Failed to delete buyer' });
    }
};



export const getAllSellers = async (req: Request, res: Response) => {
    try {
        const sellers = await prisma.sellers.findMany();
        res.json({ data: sellers });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch buyers' });
    }
};

export const getSellersCount = async(req: Request, res: Response) => {
    try{
        const sellersCount = await prisma.sellers.count();
        res.json({count: sellersCount})
    } catch (error){
        res.status(500).json({error:'Failed to fetch count'});
    }
}
export const getBuyersCount = async(req: Request, res: Response) => {
    try{
        const buyersCount = await prisma.buyers.count();
        res.json({count: buyersCount})
    } catch (error){
        res.status(500).json({error:'Failed to fetch count'});
    }
}
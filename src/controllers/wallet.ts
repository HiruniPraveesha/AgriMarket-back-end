import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GetWalletBalance(req: Request, res: Response) {
    const { userId } = req.params;

    if (!userId || isNaN(parseInt(userId))) {
        return res.status(400).json({ error: 'Invalid or missing user ID' });
    }

    try {
        const wallet = await prisma.wallet.findFirst({
            where: {
                wallet_id: parseInt(userId), // Change 'buyerId' to 'wallet_id'
            },
            select: {
                walletBal: true,
            },
        });

        if (!wallet) {
            return res.status(404).json({ error: 'Wallet not found for this user' });
        }

        return res.status(200).json({ walletBalance: wallet.walletBal });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export async function RechargeWallet(req: Request, res: Response) {
    const { userId, rechargeAmount } = req.body;

    if (!userId || isNaN(parseInt(userId)) || !rechargeAmount || isNaN(parseFloat(rechargeAmount))) {
        return res.status(400).json({ error: 'Invalid or missing parameters' });
    }

    try {
        const wallet = await prisma.wallet.findUnique({
            where: {
                wallet_id: parseInt(userId),
            },
        });

        if (!wallet) {
            return res.status(404).json({ error: 'Wallet not found' });
        }

        const newBalance = wallet.walletBal + parseFloat(rechargeAmount);

        const updatedWallet = await prisma.wallet.update({
            where: {
                wallet_id: parseInt(userId),
            },
            data: {
                walletBal: newBalance,
            },
        });

        return res.status(200).json({ message: 'Wallet recharged successfully', wallet: updatedWallet });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}


export async function CreateWallet(req: Request, res: Response) {
    const { userId, walletBal, rechargeAmt } = req.body;

    if (!userId || isNaN(parseInt(userId)) || !walletBal || isNaN(parseFloat(walletBal)) || !rechargeAmt || isNaN(parseFloat(rechargeAmt))) {
        return res.status(400).json({ error: 'Invalid or missing parameters' });
    }

    try {
        const createdWallet = await prisma.wallet.create({
            data: {
                buyerId: parseInt(userId),
                walletBal: parseFloat(walletBal),
                ReachargeAmt: parseFloat(rechargeAmt),
            },
        });

        return res.status(201).json({ message: 'Wallet created successfully', wallet: createdWallet });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

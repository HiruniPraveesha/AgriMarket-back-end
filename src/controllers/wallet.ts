import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GetBuyerDetails(req: Request, res: Response) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Invalid or missing user ID" });
  }

  try {
    const user = await prisma.buyers.findUnique({
      where: {
        buyer_id: Number(id),
      },
      select: {
        name: true,
        email: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ data: user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function GetWalletBalance(req: Request, res: Response) {
  const { buyerId } = req.query;

  if (!buyerId || typeof buyerId !== "string") {
    return res.status(400).json({ error: "Invalid or missing user ID" });
  }

  try {
    const wallet = await prisma.wallet.findUnique({
      where: {
        buyerId: parseInt(buyerId, 10), // Convert buyerId to number
      },
      select: {
        pointBalance: true, // Select the correct field name
      },
    });

    if (!wallet) {
      return res.status(200).json({ data: { pointBalance: null } }); // Return null if wallet does not exist
    }

    return res.status(200).json({ data: wallet });
  } catch (error) {
    console.error("Error retrieving wallet balance:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function CreateWallet(req: Request, res: Response) {
  const { buyerId } = req.body;

  if (!buyerId) {
    return res.status(400).json({ error: "Invalid or missing buyerId" });
  }

  try {
    // Check if the wallet already exists for the buyer
    const existingWallet = await prisma.wallet.findFirst({
      where: { buyerId: Number(buyerId) },
    });

    if (existingWallet) {
      return res.status(200).json({
        message: "Wallet already exists",
        walletId: existingWallet.buyerId,
      });
    }

    // Create a new wallet entry
    const newWallet = await prisma.wallet.create({
      data: {
        buyer: { connect: { buyer_id: Number(buyerId) } },
        pointBalance: 100,
      },
    });

    return res.status(201).json({
      message: "Wallet created successfully",
      walletId: newWallet.buyerId,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getRewardHistory(req: Request, res: Response) {
  const { buyerId } = req.query;

  if (!buyerId || typeof buyerId !== "string") {
    return res.status(400).json({ error: "Invalid or missing buyerId" });
  }

  try {
    const rewardHistory = await prisma.orders.findMany({
      where: {
        buyerId: Number(buyerId),
      },
      orderBy: {
        createdAt: "desc", // Order by the createdAt field in descending order
      },
      take: 20, // Limit the results to the past 20 entries
      select: {
        id: true,
        rewardPoints: true,
        createdAt: true,
      },
    });

    const rewardHistoryWithOrderId = rewardHistory.map((history) => ({
      order_id: history.id,
      rewardPoints: history.rewardPoints,
      createdAt: history.createdAt,
    }));

    return res.status(200).json({ rewardHistory: rewardHistoryWithOrderId });
  } catch (error) {
    console.error("Error fetching reward history:", error);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
}

export async function usedRewardPointsHistory(req: Request, res: Response) {
  const { buyerId } = req.query;

  if (!buyerId || typeof buyerId !== "string") {
    return res.status(400).json({ error: "Invalid or missing buyerId" });
  }

  try {
    const usedRewardHistory = await prisma.orders.findMany({
      where: {
        buyerId: Number(buyerId),
        usedrewardPoints:{
          gt:0,
        }
      },
      orderBy: {
        createdAt: "desc", // Order by createdAt in descending order
      },
      take: 20,
      select: {
        id: true,
        usedrewardPoints: true,
        createdAt: true,
      },
    });

    // Map to the desired response format
    const rewardHistoryWithOrderId = usedRewardHistory.map((history) => ({
      order_id: history.id,
      rewardPoints: history.usedrewardPoints, // Ensure correct field name from schema
      createdAt: history.createdAt,
    }));

    return res.status(200).json({ usedRewardHistory: rewardHistoryWithOrderId });
  } catch (error) {
    console.error("Error fetching used reward points history:", error);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
}
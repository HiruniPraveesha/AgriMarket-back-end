import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GetCart(req: Request, res: Response) {
    const {buyerId} = req.body;

    if(!buyerId){
        return res.status(400).json({error: "invalid or missing buyerId"})
    }
    else{
        try{
            const viewCart = await prisma.cartProduct.findMany({
                where: {
                    buyerId : Number(buyerId)
                },
                select: {
                    product: {
                        select:{
                            name: true,
                            price: true
                        }
                    }
                }
            });
            return res.status(200).json({data: viewCart});
        }catch(error){
                console.error(error);
                return res.status(500).json({ error: 'Internal server error' });
            }
    }
    
}
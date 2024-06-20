import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function AddShippingDetails(req: Request, res: Response){
    const {buyerId, line1,line2, city, postalCode} = req.params;

    try{
        if(!buyerId || !line1 || !line2 || !city || !postalCode){
            return res.status(400).json({ error: "Buyer Id not found" });
        }
        else{
            const shippingData = await prisma.buyerAddress.create({
                data:{
                    buyerId: Number(buyerId),
                    line1: line1,
                    line2: line2,
                    city: city,
                    postalCode: Number(postalCode)
                }
            });
            return res.status(200).json({message: "Create succcessful", data: shippingData});
        }
    }catch(error){
        console.log(error);
    }
}
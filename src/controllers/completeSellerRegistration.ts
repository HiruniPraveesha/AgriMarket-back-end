
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function completeSellerRegistration(req: Request, res: Response) {
    const { email, storeName, addressLine1, addressLine2, district, phoneNumber } = req.body;

    try {
        // Check if all required fields are provided
        if (!email || !storeName || !addressLine1 || !district || !phoneNumber || !addressLine2) {
            return res.status(400).json({ status: 400, error: 'Invalid input format' });
        }

        // Check if seller already exists with the provided email
        let existingSeller = await prisma.sellers.findUnique({
            where: { email }
        });
        if (!existingSeller) {
            return res.status(404).json({ status: 404, error: 'Seller not found with the provided email' });
        }

        // Check if phoneNumber is already in use by another seller
        const sellerWithPhoneNumber = await prisma.sellers.findFirst({
            where: {
                contactNo: phoneNumber,
                NOT: {
                    email: existingSeller.email // Exclude the current seller's email from the check
                }
            }
        });

        if (sellerWithPhoneNumber) {
            return res.status(400).json({ status: 400, error: 'Phone number is already in use by another seller' });
        }

        // Update the seller's details
        existingSeller = await prisma.sellers.update({
            where: { email },
            data: {
                store_name: storeName,
                line1: addressLine1,
                line2: addressLine2,
                district,
                contactNo: phoneNumber,
                emailVerified: existingSeller.email !== email ? false : existingSeller.emailVerified,
                // other fields update as needed
            }
        });

        return res.status(200).json({
            status: 200,
            message: 'Seller registration completed successfully',
            data: {
                seller_id: existingSeller.seller_id, // Include the seller_id in the response
                storeName: existingSeller.store_name,
                email: existingSeller.email,
                contactNo: existingSeller.contactNo,
                district: existingSeller.district,
                line1: existingSeller.line1,
                line2: existingSeller.line2,
                emailVerified: existingSeller.emailVerified,
            }
        });
    } catch (error) {
        console.error('Error completing seller registration:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await prisma.$disconnect();
    }
}


// import { Request, Response } from 'express';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// export async function completeSellerRegistration(req: Request, res: Response) {
//     const { email, storeName, addressLine1, addressLine2, district, phoneNumber } = req.body;

//     try {
//         // Check if all required fields are provided
//         if (!email || !storeName || !addressLine1 || !district || !phoneNumber || !addressLine2) {
//             return res.status(400).json({ status: 400, error: 'Invalid input format' });
//         }

//         // Check if seller already exists with the provided email
//         let existingSeller = await prisma.sellers.findUnique({
//             where: { email }
//         });
//         if (!existingSeller) {
//             return res.status(404).json({ status: 404, error: 'Seller not found with the provided email' });
//         }

//         // Check if phoneNumber is already in use by another seller
//         const sellerWithPhoneNumber = await prisma.sellers.findFirst({
//             where: {
//                 contactNo: phoneNumber,
//                 NOT: {
//                     email: existingSeller.email // Exclude the current seller's email from the check
//                 }
//             }
//         });

//         if (sellerWithPhoneNumber) {
//             return res.status(400).json({ status: 400, error: 'Phone number is already in use by another seller' });
//         }

//         // Update the seller's details
//         existingSeller = await prisma.sellers.update({
//             where: { email },
//             data: {
//                 store_name: storeName,
//                 line1: addressLine1,
//                 line2: addressLine2,
//                 district,
//                 contactNo: phoneNumber,
//                 emailVerified: existingSeller.email !== email ? false : existingSeller.emailVerified,
//                 // other fields update as needed
//             }
//         });

//         return res.status(200).json({
//             status: 200,
//             message: 'Seller registration completed successfully',
//             data: {
//                 id: existingSeller.seller_id, // include sellerId in the response
//                 email: existingSeller.email,
//                 storeName: existingSeller.store_name,
//                 addressLine1: existingSeller.line1,
//                 addressLine2: existingSeller.line2,
//                 district: existingSeller.district,
//                 phoneNumber: existingSeller.contactNo,
//             }
//         });
//     } catch (error) {
//         console.error('Error completing seller registration:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     } finally {
//         await prisma.$disconnect();
//     }
// }
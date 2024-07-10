// import { Request, Response } from 'express';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// export const getProductsAndSellerCities = async (req: Request, res: Response) => {
//   try {
//     const products = await prisma.product.findMany({
//       include: {
//         seller: {
//           include: {
//             sellerCity: true, 
//           },
//         },
//         category: true, // Include the category information
//       },
//     });

//     const data = products.map(product => ({
//       product_id: product.product_id,
//       product_name: product.name,
//       seller_id: product.seller.seller_id,
//       store_name: product.seller.store_name,
//       city_name: product.seller.sellerCity.city_name,
//       lat: product.seller.sellerCity.lat,
//       lng: product.seller.sellerCity.lng,
//       category_id: product.categoryId,
//       category_name: product.category.name, 
//     }));

//     return res.status(200).json(data);
//   } catch (error: any) {
//     console.error('Error fetching products and seller cities:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };

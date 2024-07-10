

// // Import necessary modules and PrismaClient
// import { Request, Response } from 'express';
// import { PrismaClient } from '@prisma/client';
// import fuzzball from 'fuzzball';

// const prisma = new PrismaClient();

// export const searchProducts = async (req: Request, res: Response): Promise<void> => {
//   const { category, searchQuery } = req.query;

//   try {
//     // Fetch all products initially to perform fuzzy matching
//     const allProducts = await prisma.product.findMany({
//       include: {
//         category: true,
//         seller: true,
//       },
//     });

//     let filteredProducts = allProducts;

//     // Filter by product name if search query is provided
//     if (searchQuery) {
//       const normalizedSearchQuery = searchQuery.toString().trim().toLowerCase();

//       // Perform fuzzy matching
//       filteredProducts = allProducts.filter(product =>
//         fuzzball.partial_ratio(normalizedSearchQuery, product.name.toLowerCase()) > 70
//       );
//     }

//     // If category is provided, filter the already filtered products by category
//     if (category && category !== 'All Categories') {
//       const normalizedCategory = category.toString().trim().toLowerCase();
//       filteredProducts = filteredProducts.filter(product =>
//         product.category && product.category.name &&
//         product.category.name.toLowerCase().includes(normalizedCategory)
//       );
//     }

//     // Return the filtered products as JSON response
//     res.status(200).json(filteredProducts);
//   } catch (error) {
//     console.error('Error searching products:', error);

//     // Type guard to check if error is an instance of Error
//     if (error instanceof Error) {
//       res.status(500).json({ error: `Error searching products: ${error.message}` });
//     } else {
//       res.status(500).json({ error: 'An unknown error occurred' });
//     }
//   } finally {
//     await prisma.$disconnect(); // Disconnect Prisma client
//   }
// };

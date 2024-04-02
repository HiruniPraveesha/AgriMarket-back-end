import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function addProduct(req: Request, res: Response) {
    const { name, price, image, categoryId, sellerId } = req.body;

    try {
        // Check if all required fields are provided
        if (!name || !price || !image || !categoryId || !sellerId) {
            return res.status(400).json({ error: 'Invalid input format' });
        }

        // Check if the category exists
        const existingCategory = await prisma.category.findUnique({
            where: { id: categoryId }
        });

        if (!existingCategory) {
            return res.status(400).json({ error: 'Category not found' });
        }

        // Check if the seller exists
        const existingSeller = await prisma.sellers.findUnique({
            where: { seller_id: sellerId }
        });

        if (!existingSeller) {
            return res.status(400).json({ error: 'Seller not found' });
        }

        // Create the product
        const newProduct = await prisma.product.create({
            data: {
                name,
                price: parseFloat(price),
                image,
                categoryId: parseInt(categoryId),
                sellerId: parseInt(sellerId)
            }
        });
         return res.status(201).json({ message: 'Product added successfully', product: newProduct });

    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({ error: "An error occurred while adding product" });
    }
}


        // Function to fetch category names
        export const getAllCategoryNames = async () => {
            try {
              const categories = await prisma.category.findMany({
                select: {
                  name: true,
                },
              });
              return categories.map(category => category.name);
            } catch (error) {
              console.error('Error fetching category names:', error);
              throw new Error('Internal Server Error');
        }
          };
        // Express route handler
        export const getAllCategories = async (req: Request, res: Response) => {
            try {
              const categoryNames = await getAllCategoryNames();
              res.json(categoryNames);
            } catch (error) {
              console.error('Error fetching category names:', error);
              res.status(500).json({ error: 'Internal Server Error' });
            }
          };
        
          // Function to create a new category
        export const createCategory = async (name: string) => {
            try {
              const newCategory = await prisma.category.create({
                data: {
                  name: name,
                },
              });
              return newCategory;
            } catch (error) {
              console.error('Error creating category:', error);
              throw new Error('Internal Server Error');
            }
          };
        
        // Function to update a category by ID
        export const updateCategoryById = async (id: number, name: string) => {
            try {
              const updatedCategory = await prisma.category.update({
                where: {
                  id: id,
                },
                data: {
                  name: name,
                },
              });
              return updatedCategory;
            } catch (error) {
              console.error('Error updating category:', error);
              throw new Error('Internal Server Error');
            }
          };
        
        
          // Function to delete a category by ID
        export const deleteCategoryById = async (id: number) => {
            try {
              const deletedCategory = await prisma.category.delete({
                where: {
                  id: id,
                },
              });
              return deletedCategory;
            } catch (error) {
              console.error('Error deleting category:', error);
              throw new Error('Internal Server Error');
            }
          };
        
          
        
        


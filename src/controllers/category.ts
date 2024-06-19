// categoryController.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Function to fetch all categories
// categoryController.ts

import { Request, Response } from 'express';



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
    throw new Error('Internal Server Error');
  }
};

// Express route handler
export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categoryNames = await getAllCategoryNames();
    console.log(categoryNames)
    res.status(200).json({
      "data":categoryNames
    });
  } catch (error) {
    console.error('Error fetching category names:', error);
    res.status(500).json({ error: 'Internal Server Error' });
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
    throw new Error('Internal Server Error');
  }
};

// Function to update a category by ID
export const updateCategoryById = async (id: number, name: string) => {
  try {
    const updatedCategory = await prisma.category.update({
      where: {
        category_id: id,
      },
      data: {
        name: name,
      },
    });
    return updatedCategory;
  } catch (error) {
    console.error('Error updating category:', error);
    throw new Error('Internal Server Error');
  }
};

// Function to delete a category by ID
export const deleteCategoryById = async (id: number) => {
  try {
    const deletedCategory = await prisma.category.delete({
      where: {
        category_id: id,
      },
    });
    return deletedCategory;
  } catch (error) {
    console.error('Error deleting category:', error);
    throw new Error('Internal Server Error');
  }
};

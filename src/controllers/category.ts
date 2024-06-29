// categoryController.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Function to fetch all categories
// categoryController.ts

import { Request, Response } from 'express';



// Function to fetch all categories with id and name
export const getAllCategories = async () => {
  try {
    const categories = await prisma.category.findMany({
      select: {
        category_id: true,
        name: true,
      },
    });
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Internal Server Error');
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

// Function to get category name by ID
export const getCategoryNameById = async (id: number) => {
  try {
    const category = await prisma.category.findUnique({
      where: {
        category_id: id,
      },
      select: {
        name: true,
      },
    });
    if (!category) {
      throw new Error('Category not found');
    }
    return category.name;
  } catch (error) {
    console.error('Error fetching category name by ID:', error);
    throw new Error('Internal Server Error');
  }
};

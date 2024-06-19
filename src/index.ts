import express from 'express';
import cors from 'cors';
import { Request, Response } from 'express';

import { getProductById } from './controllers/product';
import { getMoreProducts } from './controllers/product';

import {
  getAllCategories,
  createCategory,
  updateCategoryById,
  deleteCategoryById
} from './controllers/category';

import { getAllProducts } from './controllers/product';
import { getProductsByCategoryId } from './controllers/product';
import * as reviewAndRatingController from './controllers/reviewsAndRating';

const app = express();
app.use(cors());
app.use(express.json());

// Routes for category management
app.get('/categories', getAllCategories);
app.post('/categories', async (req, res) => {
  const { name } = req.body;
  try {
    const newCategory = await createCategory(name);
    res.json(newCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.put('/categories/:id', async (req, res) => {
  const categoryId = parseInt(req.params.id);
  const newName = req.body.name;
  try {
    const updatedCategory = await updateCategoryById(categoryId, newName);
    res.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.delete('/categories/:id', async (req: Request, res: Response) => {
  const categoryId = parseInt(req.params.id);
  try {
    const deletedCategory = await deleteCategoryById(categoryId);
    res.json(deletedCategory);
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Routes for product management
app.get('/products', getAllProducts);

app.get('/product/:productId', getProductById);
app.get('/products/more/:productId', getMoreProducts);
app.get('/products/category/:categoryId', getProductsByCategoryId);

// Routes
app.get('/reviews', reviewAndRatingController.getAllReviews);
app.get('/reviews/:productId', reviewAndRatingController.getReviewsByProductId);
app.post('/reviews', reviewAndRatingController.createReview);
app.put('/reviews/:id', reviewAndRatingController.updateReviewById);
app.delete('/reviews/:id', reviewAndRatingController.deleteReviewById);
app.get('/reviews/:productId/ratingTotals', reviewAndRatingController.getRatingTotalsByProductId);
app.get('/reviews/count/:productId', reviewAndRatingController.getReviewCountByProductId);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
 
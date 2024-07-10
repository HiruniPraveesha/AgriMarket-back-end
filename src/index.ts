import express from 'express';
import cors from 'cors';
import { Request, Response } from 'express';

import dotenv from 'dotenv';
import * as reviewAndRatingController from './controllers/reviewsAndRating';

import {
   getAllCategories,
  getCategoryNameById,
  getCategoryIdByName
} from './controllers/category';

import { 
  getProductById, 
  getMoreProducts, 
  getProductsBySellerId, 
  getAllProducts, 
  getProductsByCategoryId,  
  deleteProduct, 
  updateProduct,
  addProduct, 
  uploadMiddleware
} from './controllers/product';

import { signin } from './controllers/signincontroller';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes for category managemen

app.get('/categories', async (req: Request, res: Response) => {
  try {
    const categories = await getAllCategories();
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/categories/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  try {
    const categoryName = await getCategoryNameById(id);
    res.status(200).json({ name: categoryName });
  } catch (error) {
    console.error('Error fetching category name by ID:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



// Routes for product management
app.get('/products', getAllProducts);
app.get('/product/:productId', getProductById);
app.get('/products/more/:productId', getMoreProducts);
app.get('/products/category/:categoryId', getProductsByCategoryId);
app.get('/products/seller/:sellerId', getProductsBySellerId); 
app.put('/products/:id', updateProduct);
app.delete('/products/:id', deleteProduct);
app.post('/add-product', uploadMiddleware, addProduct);


// Routes for review
app.get('/reviews', reviewAndRatingController.getAllReviews);
app.get('/reviews/:productId', reviewAndRatingController.getReviewsByProductId);
app.post('/reviews', reviewAndRatingController.createReview);
app.put('/reviews/:id', reviewAndRatingController.updateReviewById);
app.delete('/reviews/:id', reviewAndRatingController.deleteReviewById);
app.get('/reviews/:productId/ratingTotals', reviewAndRatingController.getRatingTotalsByProductId);
app.get('/reviews/count/:productId', reviewAndRatingController.getReviewCountByProductId);


app.post('/signin', signin);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
 
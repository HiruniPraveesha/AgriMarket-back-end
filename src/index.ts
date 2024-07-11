import express from 'express';
import { Sequelize } from 'sequelize';
import SequelizeStore from 'connect-session-sequelize';
import { SellerSessionData } from './middlewares/sessionConfig';
import session from 'express-session';
import cors from 'cors';
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();

import { signin } from './controllers/signincontroller';
import dotenv from 'dotenv';
import * as reviewAndRatingController from './controllers/reviewsAndRating';
import { sendOtp, signUp } from './controllers/signupcontroller';
import { authenticateToken } from './middlewares/secrets';
import { becomeSeller } from './controllers/becomeSeller';
import { completeSellerRegistration } from './controllers/completeSellerRegistration';
// import { uploadMiddleware1, verifyBank } from './controllers/verifyBank';
import { getSellerDetails, getSellerProducts } from './controllers/sellerProfile';
import { getAllCategories1 } from './controllers/categoryController';
import { getAllProducts1 } from './controllers/productController';
import { getAllNotifications } from './controllers/Notification';
// import { getProductsAndSellerCities } from './controllers/seller-city';
import { getCalendarEvents } from './controllers/calendarController';
import { verifyBank, uploadMiddleware2 } from './controllers/verifyBank';
import { forgotPassword, verifyOTP, resetPassword, resendOTP } from './controllers/forgotPassword';
import { getSellerNameById } from './controllers/seller';

import {
   getAllCategories,
  createCategory,
  updateCategoryById,
  deleteCategoryById,
  getCategoryNameById
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



dotenv.config();

const prisma = new PrismaClient();
const app = express();

// Initialize Sequelize using DATABASE_URL from the environment variables
const sequelize = new Sequelize(process.env.DATABASE_URL as string);

const SessionStore = SequelizeStore(session.Store);
const store = new SessionStore({ db: sequelize });

app.use(session({
  secret: process.env.JWT_SECRET as string,
  store: store,
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 30 * 60 * 1000, // 30 minutes
    httpOnly: true,
    secure: false,
    sameSite: 'strict',
  },
}));

declare module 'express-session' {
  interface SessionData {
    seller?: SellerSessionData;
  }
}

app.use(cors({
  origin: 'http://localhost:5175', // Replace with your frontend URL
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
store.sync();

// Your routes and other configurations...

// Routes for category management
app.get('/categories', async (req: Request, res: Response) => {
  try {
    const categories = await getAllCategories();
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to get category name by ID
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
app.get('/products/seller/:sellerId', getProductsBySellerId); 
app.put('/products/:id', updateProduct);
app.delete('/products/:id', deleteProduct);

// Routes
app.post('/add-product', uploadMiddleware, addProduct);
// Routes
app.get('/reviews', reviewAndRatingController.getAllReviews);
app.get('/reviews/:productId', reviewAndRatingController.getReviewsByProductId);
app.post('/reviews', reviewAndRatingController.createReview);
app.put('/reviews/:id', reviewAndRatingController.updateReviewById);
app.delete('/reviews/:id', reviewAndRatingController.deleteReviewById);
app.get('/reviews/:productId/ratingTotals', reviewAndRatingController.getRatingTotalsByProductId);
app.get('/reviews/count/:productId', reviewAndRatingController.getReviewCountByProductId);
app.post('/verify-bank/:sellerId', uploadMiddleware2, verifyBank);
app.get('/sellers/:sellerId', getSellerNameById);

app.get('/protected-route', authenticateToken, (_req, res) => {
  res.json({ message: "This is a protected route" });
});
app.post('/signin', signin);
app.post('/become-seller', becomeSeller);
app.post('/send-otp', sendOtp); 
app.post('/signup', signUp);
//  app.post('/api/verify-bank/:sellerId', uploadMiddleware, verifyBank);
app.post('/api/forgot-password', forgotPassword);
app.post('/api/verify-otp', verifyOTP);
app.post("/resend-otp", resendOTP);
app.post('/api/reset-password', resetPassword);
app.post('/completeSellerRegistration', completeSellerRegistration);
app.get('/api/seller/details', getSellerDetails);
app.get('/api/seller/products', getSellerProducts);

app.get('/Category', getAllCategories1);
app.get('/Product', getAllProducts1);
app.get('/Notification', getAllNotifications);
// app.get('/products-seller-cities', getProductsAndSellerCities);
app.get('/CalendarBuyer', getCalendarEvents); 

//search
app.get('/api/search', async (req, res) => {
  const { keyword, category } = req.query;

  try {
    let results;

    // Ensure keyword and category are strings
    const keywordString = typeof keyword === 'string' ? keyword : undefined;
    const categoryString = typeof category === 'string' ? category : undefined;

    if (categoryString && keywordString) {
      results = await prisma.product.findMany({
        where: {
          AND: [
            {
              name: {
                contains: keywordString,
              },
            },
            {
              category: {
                name: {
                  contains: categoryString,
                },
              },
            },
          ],
        },
      });
    } else if (keywordString) {
      results = await prisma.product.findMany({
        where: {
          name: {
            contains: keywordString,
          },
        },
      });
    } else if (categoryString) {
      results = await prisma.product.findMany({
        where: {
          category: {
            name: {
              contains: categoryString,
            },
          },
        },
      });
    } else {
      results = await prisma.product.findMany();
    }

    res.json(results);
  } catch (error) {
    console.error('Error fetching search results:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
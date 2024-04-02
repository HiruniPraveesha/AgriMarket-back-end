import express from 'express';
import cors from 'cors';
import { signUp } from './controllers/signup.controller';
import { signin } from './controllers/signin.controller';
import { becomeSeller } from './controllers/becomeSeller';
import { forgotPassword } from './controllers/forgotPassword';
import { completeSellerRegistration } from './controllers/completeSellerRegistration';
import { addProduct } from './controllers/addProducts';
import { Request, Response } from 'express';
import { getAllCategories,createCategory, updateCategoryById, deleteCategoryById } from './controllers/addProducts';

const app = express();
app.use(cors());
app.use(express.json());

// Define routes
app.post('/becomeSeller', becomeSeller);
app.post('/signup', signUp);
app.post('/signin', signin);
app.post('/forgotPassword', forgotPassword);
app.post('/completeSellerRegistration', completeSellerRegistration);

// Define route for adding products
app.post('/api/products', addProduct);

const PORT = process.env.PORT || 8000;
//puni
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
  const newName = req.body.name; // Assuming the new name is sent in the request body
  try {
    const updatedCategory = await updateCategoryById(categoryId, newName);
    res.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// app.put('/categories/:id', updateCategoryById);
const handleDeleteCategoryById = async (req: Request, res: Response) => {
  const categoryId = parseInt(req.params.id);
  try {
    const deletedCategory = await deleteCategoryById(categoryId);
    res.json(deletedCategory);
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Route to delete a category by ID
app.delete('/categories/:id', handleDeleteCategoryById);
//puni
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;

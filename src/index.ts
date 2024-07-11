import express from 'express';
import cors from 'cors';
// import { signUp } from './controllers/signup.controller';
import { signin } from './controllers/signin.controller';
import { becomeSeller } from './controllers/becomeSeller';
// import { forgotPassword } from './controllers/forgotPassword';
import { completeSellerRegistration } from './controllers/completeSellerRegistration';
import { getAllCategories,createCategory, updateCategoryById, deleteCategoryById } from './controllers/category';
import { Request, Response } from 'express';
// import { addProduct } from './controllers/addProduct';
import { addProduct } from './controllers/addProduct';
import { getProducts } from './controllers/addProduct';
// import { getProductById } from './controllers/addProduct';
import { getCartProducts, RemoveProductFromCart } from './controllers/ShoppingCart';
import { ClearCart } from './controllers/ShoppingCart';
import { CreateCart } from './controllers/ShoppingCart';
import { getProductById } from './controllers/product';
import { GetDeliveryDetails, GetSellerAddress, placeOrder } from './controllers/checkout';
import { getPastOrders } from './controllers/order-history';
import { CreateWallet, GetBuyerDetails, getRewardHistory, GetWalletBalance, usedRewardPointsHistory } from './controllers/wallet';



const app = express();
app.use(cors());

app.use(express.json());

app.post('/becomeSeller', becomeSeller),
// app.post('/signup', signUp);
app.post('/signin', signin);
// app.post('/forgotPassword', forgotPassword);
app.post('/completeSellerRegistration', completeSellerRegistration)
app.get('/categories', getAllCategories);
app.get('/getProducts', getProducts)
app.get('/getCartProducts', getCartProducts)
app.post('/getProductById', getProductById);
// app.post('/addProduct', addProduct)
app.delete('/removeProduct', RemoveProductFromCart)
app.delete('/removeAllProducts', ClearCart);
app.post('/createCart', CreateCart);
app.post('/addProduct', addProduct);
app.post('/placeOrder', placeOrder)

app.get('/product/:productId', getProductById);
app.get('/get-delivery-details', GetDeliveryDetails);
app.get('/order-history', getPastOrders);
app.get('/get-buyer-details', GetBuyerDetails);
app.get('/seller-address', GetSellerAddress);
app.post('/createWallet', CreateWallet);
app.get('/get-wallet-balance', GetWalletBalance);
app.get('/reward-history', getRewardHistory),
app.get('/used-reward-points', usedRewardPointsHistory)


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




const PORT = process.env.PORT || 8000;
const JWT_SECRET = process.env.JWT_SECRET;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
  
  export default app;
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
import { addProduct, uploadMiddleware } from './controllers/product';
import { getProducts } from './controllers/addProduct';
// import { getProductById } from './controllers/addProduct';
import { getCartProducts, RemoveProductFromCart } from './controllers/ShoppingCart';
import { ClearCart } from './controllers/ShoppingCart';
import { CreateCart } from './controllers/ShoppingCart';
import { getProductById ,getAllProductsData, getAllProducts, getProductsCount, deleteProduct, getProductCountBySellerId, getSellersOrderCount} from './controllers/product';
import { CreateOrder } from './controllers/manageOrder';
import { getProductSales, getOrderDetails,getOrdersByDate, getCustomerCount, getOrderCountBySellerId, getOrders, getOrderDataByProduct } from './controllers/manageOrder';
import { getAllBuyers, getAllSellers, deleteBuyer, getBuyersCount, getSellersCount } from './controllers/manageusers';
import { ChangeAddress, ChangeContactNumber, ChangePassword, GetSellerDetails } from './controllers/SellerProfile';

const app = express();
app.use(cors());

app.use(express.json());

app.post('/becomeSeller', becomeSeller),
// app.post('/signup', signUp);
app.post('/signin', signin);
// app.post('/forgotPassword', forgotPassword);
app.post('/completeSellerRegistration', completeSellerRegistration)
app.get('/categories', getAllCategories);
app.get('/getProducts', getProducts);

app.get('/getCartProducts', getCartProducts)
app.post('/getProductById', getProductById);
// app.post('/addProduct', addProduct)
app.delete('/removeProduct', RemoveProductFromCart)
app.delete('/removeAllProducts', ClearCart);
app.post('/createCart', CreateCart);
app.post('/addProduct',uploadMiddleware, addProduct);

app.get('/product/:productId', getProductById);
app.delete('/admin/deleteBuyer/:id', deleteBuyer)

app.post('/orders', CreateOrder);
app.get('/orders/:orderId', getOrderDetails);
app.get('/orders/customers/count', getCustomerCount);
app.get('/orders/count/:sellerId', getOrderCountBySellerId);
app.get('/orders/sales/:sellerId', getProductSales);
app.get('/orders/seller/:sellerId', getOrders); 
app.get('/seller/productCount/:sellerId', getProductCountBySellerId);

app.get('/admin/getAllBuyers', getAllBuyers);
app.get('/admin/getAllSellers', getAllSellers);
app.get('/get-seller-details', GetSellerDetails);
app.put('/change-contact-number', ChangeContactNumber);
app.put('/change-password',ChangePassword);
app.put('/change-address', ChangeAddress);
app.get('/admin/getAllProductsData', getAllProducts);
app.get('/admin/getSellersCount', getSellersCount);
app.get('/admin/getBuyersCount' , getBuyersCount);
app.get('/admin/getProductsCount', getProductsCount);
app.get('/admin/getOrdersDataByProduct', getOrderDataByProduct)
app.get('/admin/getOrdersByDate', getOrdersByDate);
app.delete('/admin/deleteProduct/:id', deleteProduct);
app.get('/admin/getSellersOrderCount', getSellersOrderCount);


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




const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
  
  export default app;
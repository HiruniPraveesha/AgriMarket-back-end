import express from 'express';
import cors from 'cors';
import { signUp } from './controllers/signup.controller';
import { signin } from './controllers/signin.controller';
import { becomeSeller } from './controllers/becomeSeller';
import { forgotPassword } from './controllers/forgotPassword';
import { completeSellerRegistration } from './controllers/completeSellerRegistration';
import { ChangeAddress, ChangeCity, ChangeContactNumber, ChangePassword, ChangeUserName, GetUserDetails } from './controllers/BuyerProfile/BuyerProfile';
import { CreateWallet, GetWalletBalance, RechargeWallet } from './controllers/wallet';
import { AddProductToCart } from './controllers/Shopping Cart/Add_product_to_cart';
import { GetCart } from './controllers/Shopping Cart/show-cart';
import { RemoveProductFromCart } from './controllers/Shopping Cart/Remove_product_from_cart';
import { CreateCart } from './controllers/Shopping Cart/Create_cart';
import { AddShippingDetails } from './Checkout/Checkout';

const app = express();
app.use(cors());

app.use(express.json());

app.post('/becomeSeller', becomeSeller),
app.post('/signup', signUp);
app.post('/signin', signin);
app.post('/forgotPassword', forgotPassword);
app.post('/completeSellerRegistration', completeSellerRegistration);
app.get('/getUserDetails', GetUserDetails);
app.put('/changeUserName', ChangeUserName);
app.post('/changeContactNumber', ChangeContactNumber);
app.post('/changePassword', ChangePassword),
app.post('/changeCity', ChangeCity),
app.post('/changeAddress', ChangeAddress),
app.post('/create-wallet', CreateWallet),
app.get('/wallet-balance/:userId', GetWalletBalance),
app.post('/recharge-wallet', RechargeWallet),
app.post('/add-product-to-cart', AddProductToCart),
app.post('/create-cart', CreateCart),
app.get('/show-cart', GetCart),
app.post('/remove-product-from-cart', RemoveProductFromCart),
app.post('/add-delivery-address', AddShippingDetails)


const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
  
  export default app;
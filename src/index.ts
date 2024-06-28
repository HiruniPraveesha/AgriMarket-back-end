

import express from 'express';
import cors from 'cors';
import { searchProducts } from './controllers/searchController';
import { sendOtp, signUp } from './controllers/signup.controller';
import { authenticateToken } from './middlewares/secrets';
import { becomeSeller } from './controllers/becomeSeller';
//import { forgotPassword, resetPassword } from './controllers/forgotPassword';
import { completeSellerRegistration } from './controllers/completeSellerRegistration';
import { uploadMiddleware, verifyBank } from './controllers/verifyBank';
import { getSellerDetails, getSellerProducts } from './controllers/sellerProfile';



const app = express();
app.use(cors());
app.use(express.json());


app.get('/protected-route', authenticateToken, (_req, res) => {
  res.json({ message: "This is a protected route" });
});

app.post('/become-seller', becomeSeller);
app.post('/send-otp', sendOtp);  // OTP for signupBuyer
app.post('/signup', signUp);
//app.post('/signin', signin);
//app.post('/forgot-password', forgotPassword);
//app.post('/resetPassword/:token', resetPassword);
app.post('/api/verify-bank', uploadMiddleware, verifyBank);
app.post('/completeSellerRegistration', completeSellerRegistration);
app.get('/api/seller/details', getSellerDetails);
app.get('/api/seller/products', getSellerProducts);
app.get('/search',searchProducts);


const PORT = process.env.PORT || 8001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;

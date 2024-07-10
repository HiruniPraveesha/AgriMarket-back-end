
import express from 'express';
import { Sequelize } from 'sequelize';
import SequelizeStore from 'connect-session-sequelize';
import { SellerSessionData } from './middlewares/sessionConfig';
import session from 'express-session';
import cors from 'cors';
import { sendOtp, signUp } from './controllers/signup.controller';
import { authenticateToken } from './middlewares/secrets';
import { becomeSeller } from './controllers/becomeSeller';
import { completeSellerRegistration } from './controllers/completeSellerRegistration';
import { uploadMiddleware, verifyBank } from './controllers/verifyBank';
import { getSellerDetails, getSellerProducts } from './controllers/sellerProfile';
import { forgotPassword, verifyOTP, resetPassword, resendOTP } from './controllers/forgotPassword';
import {signin} from './controllers/signinRemember';

import { uploadProfilePhoto,
  updateProfilePhoto,
  updateEmail,
  updateContactNumber,
  updateCity,
  updateAddress,
  changePassword,
  getBuyerDetails,
  getBuyerAddress,} from './controllers/buyerProfile';



const app = express();

const sequelize = new Sequelize('mysql://prisma:123qwe@T@localhost:3306/backend_agri');
const SessionStore = SequelizeStore(session.Store);
const store = new SessionStore({ db: sequelize });


app.use(session({
    secret: 'bsjkdfawoefsdfoasf2kj2owoe2o3o2n3ro23owesc0czmxpvqqr1e5',
    store: store,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 30 * 60 * 1000,httpOnly: true,
      secure: false,
      sameSite: 'strict'
     } // 30 minutes
}));
declare module 'express-session' {
  interface SessionData {
      seller?: SellerSessionData;
      
  }
}



app.use(cors({
  origin: 'http://localhost:5173', // Replace with your frontend URL
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
store.sync();

app.get('/protected-route', authenticateToken, (_req, res) => {
  res.json({ message: "This is a protected route" });
});
app.post('/signIn',signin);
app.post('/api/become-seller', becomeSeller);
app.post('/send-otp', sendOtp);  // OTP for signupBuyer
app.post('/signup', signUp);
app.post('/api/forgot-password', forgotPassword);
app.post('/api/verify-otp', verifyOTP);
app.post("/resend-otp", resendOTP);
app.post('/api/reset-password', resetPassword);
app.post('/api/verify-bank/:sellerId', uploadMiddleware, verifyBank);
app.post('/api/completeSellerRegistration', completeSellerRegistration);
app.get('/api/seller/details', getSellerDetails);
app.get('/api/seller/products', getSellerProducts);
app.put('/buyer/profile/photo/:buyerId', uploadProfilePhoto, updateProfilePhoto);
app.put('/buyer/email/:buyerId', updateEmail);
app.put('/buyer/contact/:buyerId', updateContactNumber);
app.put('/buyer/city/:buyerId', updateCity);
app.put('/buyer/address/:buyerId', updateAddress);
app.put('/buyer/password/:buyerId', changePassword);
app.get('/buyer/:buyerId', getBuyerDetails);
app.get('/buyer/address/:buyerId', getBuyerAddress);


const PORT = process.env.PORT || 8001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;




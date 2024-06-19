/*import express from 'express';
import cors from 'cors';
//import { signUp } from './controllers/signup.controller';
import { sendOtp,signUp } from './controllers/signup.controller';
import { signInController } from './controllers/signin.controller'
import { authenticateToken } from './middlewares/secrets';
import { becomeSeller } from './controllers/becomeSeller';
import { sendOTP, resetPassword } from './controllers/forgotPassword';
import { completeSellerRegistration } from './controllers/completeSellerRegistration';

const app = express();
app.use(cors());
app.use(express.json());
app.get('/protected-route', authenticateToken, (_req, res) => {
  res.json({ message: "This is a protected route" });
});
app.post('/becomeSeller', becomeSeller),
app.post('/send-otp', sendOtp)
app.post('/signup', signUp);
app.post('/signin', signInController);
app.post('/send-OTP', sendOTP);
app.post('/reset-password', resetPassword);
app.post('/completeSellerRegistration', completeSellerRegistration)

const PORT = process.env.PORT || 8001;
const JWT_SECRET = process.env.JWT_SECRET;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
  
  export default app;*/


import express from 'express';
import cors from 'cors';
import { sendOtp, signUp } from './controllers/signup.controller';
import { signin } from './controllers/signin.controller';
import { authenticateToken } from './middlewares/secrets';
import { becomeSeller } from './controllers/becomeSeller';
//import { sendOTP, resetPassword ,verifyOTP} from './controllers/forgotPassword';
import { completeSellerRegistration } from './controllers/completeSellerRegistration';


const app = express();
app.use(cors());
app.use(express.json());


app.get('/protected-route', authenticateToken, (_req, res) => {
  res.json({ message: "This is a protected route" });
});

app.post('/become-seller', becomeSeller);
app.post('/send-otp', sendOtp);  // OTP for signupBuyer
app.post('/signup', signUp);
app.post('/signin', signin);
//app.post('/send-OTP', sendOTP);  // OTP for reset password
//app.post('/verify-otp',verifyOTP);
//app.post('/reset-password', resetPassword);
app.post('/completeSellerRegistration', completeSellerRegistration);

const PORT = process.env.PORT || 8001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;

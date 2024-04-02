import express from 'express';
import cors from 'cors';
import { signUp } from './controllers/signup.controller';
import { signin } from './controllers/signin.controller';
import { becomeSeller } from './controllers/becomeSeller';
import { forgotPassword } from './controllers/forgotPassword';
import { completeSellerRegistration } from './controllers/completeSellerRegistration';
import { ChangeAddress, ChangeCity, ChangeContactNumber, ChangePassword, ChangeUserName, GetAddress, GetCity, GetContactNumber, GetUserName } from './controllers/BuyerProfile/BuyerProfile';
import { CreateWallet, GetWalletBalance, RechargeWallet } from './controllers/wallet';

const app = express();
app.use(cors());

app.use(express.json());

app.post('/becomeSeller', becomeSeller),
app.post('/signup', signUp);
app.post('/signin', signin);
app.post('/forgotPassword', forgotPassword);
app.post('/completeSellerRegistration', completeSellerRegistration);
app.get('/getUserName', GetUserName);
app.post('/changeUserName', ChangeUserName);
app.get('/getContactNumber', GetContactNumber);
app.post('/changeContactNumber', ChangeContactNumber);
app.post('/changePassword', ChangePassword),
app.get('/getCity', GetCity),
app.post('/changeCity', ChangeCity),
app.get('/getAddress', GetAddress),
app.post('/changeAddress', ChangeAddress),
app.post('/create-wallet', CreateWallet),
app.get('/wallet-balance/:userId', GetWalletBalance),
app.post('/recharge-wallet', RechargeWallet)


const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
  
  export default app;
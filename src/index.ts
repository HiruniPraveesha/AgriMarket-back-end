import express from 'express';
import cors from 'cors';
import { signUp } from './controllers/signup.controller';
import { signin } from './controllers/signin.controller';
import { becomeSeller } from './controllers/becomeSeller';
import { forgotPassword } from './controllers/forgotPassword';
import { completeSellerRegistration } from './controllers/completeSellerRegistration';

const app = express();
app.use(cors());

app.use(express.json());

app.post('/becomeSeller', becomeSeller),
app.post('/signup', signUp);
app.post('/signin', signin);
app.post('/forgotPassword', forgotPassword);
app.post('/completeSellerRegistration', completeSellerRegistration)

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
  
  export default app;
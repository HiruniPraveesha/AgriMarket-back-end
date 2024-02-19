import express from 'express';
import { signUp } from './controllers/signup.controller';
import { signin } from './controllers/signin.controller';

const app = express();

app.use(express.json());

app.post('/signup', signUp);
app.post('/signin', signin);


const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
  
  export default app;
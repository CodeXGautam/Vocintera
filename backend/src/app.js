import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { registerUser, loginUser, refreshAccessToken } from './controllers/userController.js';


const app = express();

app.use(cors({
  origin:'http://localhost:3000',
  credentials: true,
  exposedHeaders: ['set-cookie']
}));


app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Expose-Headers', 'set-cookie');
  next();
});

app.use(cookieParser());           
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.post('/api/v1/register', registerUser);
app.post('/api/v1/login', loginUser);
app.post('/api/v1/refresh-token', refreshAccessToken);


export default app;
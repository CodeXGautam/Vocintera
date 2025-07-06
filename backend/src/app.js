import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { registerUser, loginUser, refreshAccessToken, logoutUser,getCurrentUser, googleAuthCode } from './controllers/userController.js';
import { verifyJwt } from './middleware/auth.middleware.js';
import { createInterview, getInterviewInfo, cleanupAllUsersInterviews, getInterviewStats } from './controllers/interviewController.js';
import { getGeminiResponse, startInterview, endInterview } from './controllers/responseController.js';
import { evaluateInterview, getUserEvaluations, getInterviewEvaluation } from './controllers/evaluationController.js';
import { uploadResume, uploadAvatar } from './controllers/userController.js';
import { upload } from './middleware/multer.js';

const app = express();

app.use(cors({
  origin:['https://vocintera.onrender.com', 'http://localhost:3000'],
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
app.get('/api/v1/getUser',verifyJwt, getCurrentUser);
app.get('/api/v1/logout',verifyJwt, logoutUser);
app.post('/api/v1/auth/google-auth-code', googleAuthCode);
app.post('/api/v1/createInterview', verifyJwt, upload.single('resume'), uploadResume, createInterview);
app.get('/api/v1/getInterviewInfo', verifyJwt, getInterviewInfo);
app.get('/api/v1/interview/stats', verifyJwt, getInterviewStats);

// Admin routes for cleanup (you can add admin middleware later)
app.post('/api/v1/admin/cleanup-interviews', verifyJwt, cleanupAllUsersInterviews);
app.post('/api/v1/uploadAvatar', verifyJwt, upload.single('avatar'), uploadAvatar);
app.post('/api/v1/gemini/get-response', verifyJwt, getGeminiResponse);
app.post('/api/v1/gemini/start-interview', verifyJwt, startInterview);
app.post('/api/v1/gemini/end-interview', verifyJwt, endInterview);

// Evaluation routes
app.post('/api/v1/evaluation/:interviewId', verifyJwt, evaluateInterview);
app.get('/api/v1/evaluation/statistics', verifyJwt, getUserEvaluations);
app.get('/api/v1/evaluation/:interviewId', verifyJwt, getInterviewEvaluation);

export default app;
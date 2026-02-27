import express from 'express';
import marketRoutes from './routes/market.routes';
import cors from 'cors';

const app = express();

app.use(cors({ origin: ['http://localhost:5173', 'https://your-app.vercel.app'] }));
app.use(express.json());

app.use("/api/market", marketRoutes);

export default app;
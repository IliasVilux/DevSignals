import express from 'express';
import marketRoutes from './routes/market.routes';

const app = express();

app.use(express.json());

app.use("/api/market", marketRoutes);

export default app;
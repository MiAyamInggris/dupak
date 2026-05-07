import express from 'express';
import cors from 'cors';
import calculateRouter from './routes/calculate';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'] }));
app.use(express.json({ limit: '5mb' }));

app.use('/api/calculate', calculateRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'dupak-api', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`DUPAK API server running on http://localhost:${PORT}`);
});

export default app;

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import auth from './routes/auth';
import bookRoutes from './routes/books';
import borrowingRoutes from './routes/borrowings';
import dotenv from 'dotenv';

dotenv.config();

const app = new Hono();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));

app.use(logger());

app.get('/', (c) => c.json({ message: 'Library API' }));

app.route('/api/auth', auth);
app.route('/api/books', bookRoutes);
app.route('/api/borrowings', borrowingRoutes);

const port = parseInt(process.env.PORT || '3000');

console.log(`Server running on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};

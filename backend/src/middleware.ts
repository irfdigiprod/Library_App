import jwt from 'jsonwebtoken';
import type { MiddlewareHandler } from 'hono';
import type { Context } from './types';

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: number; email: string; role: string };
    c.set('user', decoded);
    await next();
  } catch {
    return c.json({ error: 'Invalid token' }, 401);
  }
};

export const adminMiddleware: MiddlewareHandler = async (c, next) => {
  const user = c.get('user');
  
  if (!user || user.role !== 'admin') {
    return c.json({ error: 'Forbidden' }, 403);
  }

  await next();
};

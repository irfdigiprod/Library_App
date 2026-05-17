import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { users } from '../schema';
import { authMiddleware } from '../middleware';

const auth = new Hono();

auth.post('/register', async (c) => {
  try {
    const { name, email, password } = await c.req.json();

    if (!name || !email || !password) {
      return c.json({ error: 'All fields are required' }, 400);
    }

    if (password.length < 6) {
      return c.json({ error: 'Password must be at least 6 characters' }, 400);
    }

    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (existingUser.length > 0) {
      return c.json({ error: 'Email already registered' }, 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [newUser] = await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
    }).$returningId();

    const token = jwt.sign(
      { userId: newUser.id, email, role: 'member' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return c.json({
      message: 'Registration successful',
      token,
      user: { id: newUser.id, name, email, role: 'member' }
    }, 201);
  } catch (error) {
    return c.json({ error: 'Registration failed' }, 500);
  }
});

auth.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return c.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    return c.json({ error: 'Login failed' }, 500);
  }
});

auth.get('/me', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const [userData] = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    }).from(users).where(eq(users.id, user!.userId)).limit(1);

    if (!userData) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json(userData);
  } catch (error) {
    return c.json({ error: 'Failed to fetch user' }, 500);
  }
});

export default auth;

import { Hono } from 'hono';
import { eq, like, sql } from 'drizzle-orm';
import { db } from '../db';
import { books, borrowings } from '../schema';
import { authMiddleware, adminMiddleware } from '../middleware';

const bookRoutes = new Hono();

bookRoutes.get('/', async (c) => {
  try {
    const search = c.req.query('search') || '';
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '10');
    const offset = (page - 1) * limit;

    const whereCondition = search 
      ? like(books.title, `%${search}%`).or(like(books.author, `%${search}%`))
      : sql`1=1`;

    const [allBooks, [countResult]] = await Promise.all([
      db.select().from(books).where(whereCondition).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(books).where(whereCondition),
    ]);

    return c.json({
      books: allBooks,
      total: countResult?.count || 0,
      page,
      totalPages: Math.ceil((countResult?.count || 0) / limit),
    });
  } catch (error) {
    return c.json({ error: 'Failed to fetch books' }, 500);
  }
});

bookRoutes.get('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const [book] = await db.select().from(books).where(eq(books.id, id)).limit(1);

    if (!book) {
      return c.json({ error: 'Book not found' }, 404);
    }

    return c.json(book);
  } catch (error) {
    return c.json({ error: 'Failed to fetch book' }, 500);
  }
});

bookRoutes.post('/', authMiddleware, adminMiddleware, async (c) => {
  try {
    const { title, author, isbn, description, totalCopies } = await c.req.json();

    if (!title || !author || !isbn) {
      return c.json({ error: 'Title, author, and ISBN are required' }, 400);
    }

    const [newBook] = await db.insert(books).values({
      title,
      author,
      isbn,
      description,
      totalCopies: totalCopies || 1,
      availableCopies: totalCopies || 1,
    }).$returningId();

    return c.json({ message: 'Book created', book: { id: newBook.id, ...await c.req.json() } }, 201);
  } catch (error) {
    return c.json({ error: 'Failed to create book' }, 500);
  }
});

bookRoutes.put('/:id', authMiddleware, adminMiddleware, async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const updates = await c.req.json();

    const [existingBook] = await db.select().from(books).where(eq(books.id, id)).limit(1);

    if (!existingBook) {
      return c.json({ error: 'Book not found' }, 404);
    }

    await db.update(books).set(updates).where(eq(books.id, id));

    return c.json({ message: 'Book updated' });
  } catch (error) {
    return c.json({ error: 'Failed to update book' }, 500);
  }
});

bookRoutes.delete('/:id', authMiddleware, adminMiddleware, async (c) => {
  try {
    const id = parseInt(c.req.param('id'));

    const [existingBook] = await db.select().from(books).where(eq(books.id, id)).limit(1);

    if (!existingBook) {
      return c.json({ error: 'Book not found' }, 404);
    }

    await db.delete(books).where(eq(books.id, id));

    return c.json({ message: 'Book deleted' });
  } catch (error) {
    return c.json({ error: 'Failed to delete book' }, 500);
  }
});

export default bookRoutes;

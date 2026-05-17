import { Hono } from 'hono';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db';
import { borrowings, books, users } from '../schema';
import { authMiddleware } from '../middleware';

const borrowingRoutes = new Hono();

borrowingRoutes.post('/', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const { bookId } = await c.req.json();

    if (!bookId) {
      return c.json({ error: 'Book ID is required' }, 400);
    }

    const [book] = await db.select().from(books).where(eq(books.id, bookId)).limit(1);

    if (!book) {
      return c.json({ error: 'Book not found' }, 404);
    }

    if (book.availableCopies <= 0) {
      return c.json({ error: 'Book is not available' }, 400);
    }

    const existingBorrow = await db.select().from(borrowings).where(
      and(
        eq(borrowings.userId, user!.userId),
        eq(borrowings.bookId, bookId),
        eq(borrowings.status, 'borrowed')
      )
    ).limit(1);

    if (existingBorrow.length > 0) {
      return c.json({ error: 'You already borrowed this book' }, 400);
    }

    const [newBorrowing] = await db.insert(borrowings).values({
      userId: user!.userId,
      bookId,
    }).$returningId();

    await db.update(books)
      .set({ availableCopies: book.availableCopies - 1 })
      .where(eq(books.id, bookId));

    return c.json({ message: 'Book borrowed successfully', borrowingId: newBorrowing.id }, 201);
  } catch (error) {
    return c.json({ error: 'Failed to borrow book' }, 500);
  }
});

borrowingRoutes.post('/:id/return', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const id = parseInt(c.req.param('id'));

    const [borrowing] = await db.select().from(borrowings).where(
      and(
        eq(borrowings.id, id),
        eq(borrowings.userId, user!.userId)
      )
    ).limit(1);

    if (!borrowing) {
      return c.json({ error: 'Borrowing not found' }, 404);
    }

    if (borrowing.status === 'returned') {
      return c.json({ error: 'Book already returned' }, 400);
    }

    const [book] = await db.select().from(books).where(eq(books.id, borrowing.bookId)).limit(1);

    await db.update(borrowings)
      .set({ 
        status: 'returned',
        actualReturnDate: new Date()
      })
      .where(eq(borrowings.id, id));

    await db.update(books)
      .set({ availableCopies: book.availableCopies + 1 })
      .where(eq(books.id, borrowing.bookId));

    return c.json({ message: 'Book returned successfully' });
  } catch (error: any) {
    console.error('Return error:', error);
    return c.json({ error: 'Failed to return book: ' + error.message }, 500);
  }
});

borrowingRoutes.get('/my', authMiddleware, async (c) => {
  try {
    const user = c.get('user');

    const myBorrowings = await db.select({
      id: borrowings.id,
      borrowDate: borrowings.borrowDate,
      returnDate: borrowings.returnDate,
      actualReturnDate: borrowings.actualReturnDate,
      status: borrowings.status,
      book: {
        id: books.id,
        title: books.title,
        author: books.author,
        isbn: books.isbn,
      }
    })
    .from(borrowings)
    .innerJoin(books, eq(borrowings.bookId, books.id))
    .where(eq(borrowings.userId, user!.userId))
    .orderBy(desc(borrowings.borrowDate));

    return c.json(myBorrowings);
  } catch (error) {
    return c.json({ error: 'Failed to fetch borrowings' }, 500);
  }
});

borrowingRoutes.get('/', authMiddleware, async (c) => {
  try {
    const allBorrowings = await db.select({
      id: borrowings.id,
      borrowDate: borrowings.borrowDate,
      returnDate: borrowings.returnDate,
      actualReturnDate: borrowings.actualReturnDate,
      status: borrowings.status,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
      book: {
        id: books.id,
        title: books.title,
        author: books.author,
      }
    })
    .from(borrowings)
    .innerJoin(books, eq(borrowings.bookId, books.id))
    .innerJoin(users, eq(borrowings.userId, users.id))
    .orderBy(desc(borrowings.borrowDate));

    return c.json(allBorrowings);
  } catch (error) {
    return c.json({ error: 'Failed to fetch borrowings' }, 500);
  }
});

export default borrowingRoutes;

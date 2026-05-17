import { mysqlTable, varchar, int, datetime, boolean, text } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const users = mysqlTable('users', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).default('member'),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const books = mysqlTable('books', {
  id: int('id').primaryKey().autoincrement(),
  title: varchar('title', { length: 255 }).notNull(),
  author: varchar('author', { length: 255 }).notNull(),
  isbn: varchar('isbn', { length: 20 }).notNull().unique(),
  description: text('description'),
  totalCopies: int('total_copies').default(1),
  availableCopies: int('available_copies').default(1),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const borrowings = mysqlTable('borrowings', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull(),
  bookId: int('book_id').notNull(),
  borrowDate: datetime('borrow_date').default(sql`CURRENT_TIMESTAMP`),
  returnDate: datetime('return_date'),
  actualReturnDate: datetime('actual_return_date'),
  status: varchar('status', { length: 50 }).default('borrowed'),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Book = typeof books.$inferSelect;
export type NewBook = typeof books.$inferInsert;
export type Borrowing = typeof borrowings.$inferSelect;
export type NewBorrowing = typeof borrowings.$inferInsert;

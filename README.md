# Library App

Aplikasi perpustakaan digital dengan frontend SvelteKit dan backend Bun + Drizzle + MySQL.

## Fitur

- ✅ Registrasi dan login pengguna
- ✅ Manajemen buku (CRUD untuk admin)
- ✅ Peminjaman dan pengembalian buku
- ✅ Dashboard pengguna
- ✅ Responsif di semua ukuran layar
- ✅ Pencarian buku
- ✅ Pagination

## Tech Stack

**Backend:**
- Bun runtime
- Hono web framework
- Drizzle ORM
- MySQL database
- JWT authentication
- bcrypt untuk password hashing

**Frontend:**
- SvelteKit
- TypeScript
- CSS murni (tanpa framework)

## Setup

### Prerequisites

- Bun
- MySQL server

### Backend Setup

1. Masuk ke folder backend:
```bash
cd backend
```

2. Install dependencies:
```bash
bun install
```

3. Buat database MySQL:
```sql
CREATE DATABASE library_db;
```

4. Konfigurasi environment:
Edit file `backend/.env` sesuai konfigurasi MySQL Anda:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=library_db
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
PORT=3000
```

5. Jalankan migrasi database:
```bash
bun run db:push
```

6. Start backend server:
```bash
bun run dev
```

Backend akan berjalan di `http://localhost:3000`

### Frontend Setup

1. Masuk ke folder frontend:
```bash
cd frontend
```

2. Install dependencies:
```bash
bun install
```

3. Start development server:
```bash
bun run dev
```

Frontend akan berjalan di `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Registrasi pengguna baru
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (requires auth)

### Books
- `GET /api/books` - Get all books (with search & pagination)
- `GET /api/books/:id` - Get book by ID
- `POST /api/books` - Create book (admin only)
- `PUT /api/books/:id` - Update book (admin only)
- `DELETE /api/books/:id` - Delete book (admin only)

### Borrowings
- `POST /api/borrowings` - Borrow a book
- `POST /api/borrowings/:id/return` - Return a book
- `GET /api/borrowings/my` - Get my borrowings
- `GET /api/borrowings` - Get all borrowings (admin only)

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── books.ts
│   │   │   └── borrowings.ts
│   │   ├── db.ts
│   │   ├── schema.ts
│   │   ├── middleware.ts
│   │   ├── types.ts
│   │   └── index.ts
│   ├── drizzle.config.ts
│   └── package.json
└── frontend/
    ├── src/
    │   └── routes/
    │       ├── +layout.svelte
    │       ├── +page.svelte
    │       ├── login/+page.svelte
    │       ├── register/+page.svelte
    │       ├── dashboard/+page.svelte
    │       ├── books/+page.svelte
    │       ├── my-borrowings/+page.svelte
    │       └── admin/books/+page.svelte
    └── package.json
```

## User Roles

- **Member**: Dapat meminjam dan mengembalikan buku
- **Admin**: Dapat mengelola buku (tambah, edit, hapus)

## License

MIT

<script lang="ts">
	import { onMount } from 'svelte';

	let books: any[] = [];
	let loading = true;
	let search = '';
	let page = 1;
	let totalPages = 1;
	let total = 0;
	let message = '';
	let messageType = '';

	onMount(async () => {
		await loadBooks();
	});

	async function loadBooks() {
		loading = true;
		try {
			const res = await fetch(`/api/books?search=${encodeURIComponent(search)}&page=${page}&limit=12`);
			const data = await res.json();
			books = data.books || [];
			totalPages = data.totalPages || 1;
			total = data.total || 0;
		} catch (e) {
			console.error('Failed to fetch books:', e);
		} finally {
			loading = false;
		}
	}

	function handleSearch() {
		page = 1;
		loadBooks();
	}

	async function borrowBook(bookId: number) {
		message = '';
		try {
			const token = localStorage.getItem('token');
			if (!token) {
				message = 'Please login to borrow books';
				messageType = 'error';
				return;
			}

			const res = await fetch('/api/borrowings', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`,
				},
				body: JSON.stringify({ bookId }),
			});

			const data = await res.json();

			if (!res.ok) {
				message = data.error || 'Failed to borrow book';
				messageType = 'error';
				return;
			}

			message = 'Book borrowed successfully!';
			messageType = 'success';
			await loadBooks();
		} catch (e) {
			message = 'An error occurred';
			messageType = 'error';
		}
	}

	function nextPage() {
		if (page < totalPages) {
			page++;
			loadBooks();
		}
	}

	function prevPage() {
		if (page > 1) {
			page--;
			loadBooks();
		}
	}
</script>

<svelte:head>
	<title>Books - Library App</title>
</svelte:head>

<div class="books-page">
	<h1>Books</h1>

	{#if message}
		<div class="message {messageType}">{message}</div>
	{/if}

	<div class="search-bar">
		<input
			type="text"
			bind:value={search}
			placeholder="Search by title or author..."
			on:input={handleSearch}
		/>
	</div>

	{#if loading}
		<p>Loading...</p>
	{:else if books.length === 0}
		<p class="empty-state">No books found.</p>
	{:else}
		<p class="results-count">{total} book{total !== 1 ? 's' : ''} found</p>
		<div class="book-grid">
			{#each books as book}
				<div class="book-card">
					<h3>{book.title}</h3>
					<p class="author">by {book.author}</p>
					<p class="isbn">ISBN: {book.isbn}</p>
					{#if book.description}
						<p class="description">{book.description.substring(0, 150)}...</p>
					{/if}
					<div class="book-footer">
						<span class="availability">
							{book.availableCopies > 0 
								? `${book.availableCopies}/${book.totalCopies} available` 
								: 'Not available'}
						</span>
						{#if book.availableCopies > 0}
							<button class="btn-borrow" on:click={() => borrowBook(book.id)}>
								Borrow
							</button>
						{/if}
					</div>
				</div>
			{/each}
		</div>

		<div class="pagination">
			<button 
				on:click={prevPage} 
				disabled={page === 1}
				class="btn-pagination"
			>
				← Previous
			</button>
			<span>Page {page} of {totalPages}</span>
			<button 
				on:click={nextPage} 
				disabled={page === totalPages}
				class="btn-pagination"
			>
				Next →
			</button>
		</div>
	{/if}
</div>

<style>
	.books-page {
		padding: 1rem 0;
	}

	h1 {
		color: #2c3e50;
		margin-bottom: 1.5rem;
	}

	.message {
		padding: 0.75rem;
		border-radius: 6px;
		margin-bottom: 1rem;
		text-align: center;
	}

	.message.success {
		background: #d4edda;
		color: #155724;
	}

	.message.error {
		background: #f8d7da;
		color: #721c24;
	}

	.search-bar {
		margin-bottom: 1.5rem;
	}

	.search-bar input {
		width: 100%;
		padding: 0.75rem 1rem;
		border: 2px solid #e1e8ed;
		border-radius: 8px;
		font-size: 1rem;
		transition: border-color 0.2s;
	}

	.search-bar input:focus {
		outline: none;
		border-color: #3498db;
	}

	.results-count {
		color: #7f8c8d;
		margin-bottom: 1rem;
	}

	.book-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.book-card {
		background: white;
		padding: 1.5rem;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		transition: transform 0.2s;
	}

	.book-card:hover {
		transform: translateY(-4px);
	}

	.book-card h3 {
		color: #2c3e50;
		margin-bottom: 0.5rem;
	}

	.author {
		color: #7f8c8d;
		margin-bottom: 0.5rem;
	}

	.isbn {
		color: #95a5a6;
		font-size: 0.9rem;
		margin-bottom: 0.5rem;
	}

	.description {
		color: #555;
		line-height: 1.5;
		margin-bottom: 1rem;
	}

	.book-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-top: 1rem;
		border-top: 1px solid #eee;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.availability {
		color: #27ae60;
		font-weight: 500;
		font-size: 0.9rem;
	}

	.btn-borrow {
		background: #3498db;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		cursor: pointer;
		font-weight: 500;
		transition: background 0.2s;
	}

	.btn-borrow:hover {
		background: #2980b9;
	}

	.pagination {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1rem;
		padding: 1rem 0;
	}

	.btn-pagination {
		background: white;
		border: 2px solid #e1e8ed;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-pagination:hover:not(:disabled) {
		border-color: #3498db;
		color: #3498db;
	}

	.btn-pagination:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.empty-state {
		text-align: center;
		color: #7f8c8d;
		padding: 3rem 0;
	}

	@media (max-width: 768px) {
		.book-grid {
			grid-template-columns: 1fr;
		}

		.book-footer {
			flex-direction: column;
			align-items: flex-start;
		}

		.btn-borrow {
			width: 100%;
		}
	}
</style>

<script lang="ts">
	import { onMount } from 'svelte';

	let books: any[] = [];
	let loading = true;

	onMount(async () => {
		try {
			const res = await fetch('/api/books?limit=6');
			const data = await res.json();
			books = data.books || [];
		} catch (e) {
			console.error('Failed to fetch books:', e);
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>Library App</title>
</svelte:head>

<div class="hero">
	<h1>Welcome to Library App</h1>
	<p>Discover, borrow, and manage books with ease</p>
	<div class="hero-buttons">
		<a href="/register" class="btn btn-primary">Get Started</a>
		<a href="/login" class="btn btn-secondary">Login</a>
	</div>
</div>

<section class="featured-books">
	<h2>Featured Books</h2>
	{#if loading}
		<p>Loading...</p>
	{:else if books.length === 0}
		<p>No books available yet.</p>
	{:else}
		<div class="book-grid">
			{#each books as book}
				<div class="book-card">
					<h3>{book.title}</h3>
					<p class="author">by {book.author}</p>
					<p class="isbn">ISBN: {book.isbn}</p>
					{#if book.description}
						<p class="description">{book.description.substring(0, 100)}...</p>
					{/if}
					<div class="book-footer">
						<span class="availability">
							{book.availableCopies > 0 
								? `${book.availableCopies} available` 
								: 'Not available'}
						</span>
					</div>
				</div>
			{/each}
		</div>
	{/if}
	<a href="/books" class="view-all">View All Books →</a>
</section>

<style>
	.hero {
		text-align: center;
		padding: 4rem 1rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border-radius: 12px;
		margin-bottom: 3rem;
	}

	.hero h1 {
		font-size: 2.5rem;
		margin-bottom: 1rem;
	}

	.hero p {
		font-size: 1.2rem;
		margin-bottom: 2rem;
		opacity: 0.9;
	}

	.hero-buttons {
		display: flex;
		gap: 1rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	.btn {
		padding: 0.75rem 2rem;
		border-radius: 8px;
		text-decoration: none;
		font-weight: 500;
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
	}

	.btn-primary {
		background: white;
		color: #667eea;
	}

	.btn-secondary {
		background: transparent;
		color: white;
		border: 2px solid white;
	}

	.featured-books {
		text-align: center;
	}

	.featured-books h2 {
		font-size: 2rem;
		margin-bottom: 2rem;
		color: #2c3e50;
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
		transition: transform 0.2s, box-shadow 0.2s;
		text-align: left;
	}

	.book-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
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
		margin-bottom: 1rem;
		line-height: 1.5;
	}

	.book-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-top: 1rem;
		border-top: 1px solid #eee;
	}

	.availability {
		color: #27ae60;
		font-weight: 500;
	}

	.availability:has(text:contains('Not')) {
		color: #e74c3c;
	}

	.view-all {
		display: inline-block;
		color: #3498db;
		text-decoration: none;
		font-weight: 500;
		margin-top: 1rem;
	}

	.view-all:hover {
		text-decoration: underline;
	}

	@media (max-width: 768px) {
		.hero {
			padding: 2rem 1rem;
		}

		.hero h1 {
			font-size: 1.8rem;
		}

		.hero p {
			font-size: 1rem;
		}

		.book-grid {
			grid-template-columns: 1fr;
		}
	}
</style>

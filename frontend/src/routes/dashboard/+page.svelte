<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let user: any = null;
	let stats = { totalBooks: 0, borrowedBooks: 0, availableBooks: 0 };
	let recentBorrowings: any[] = [];
	let loading = true;

	onMount(async () => {
		const stored = localStorage.getItem('user');
		if (!stored) {
			goto('/login');
			return;
		}

		user = JSON.parse(stored);
		await loadData();
	});

	async function loadData() {
		try {
			const token = localStorage.getItem('token');
			const headers = { 'Authorization': `Bearer ${token}` };

			const [booksRes, borrowingsRes] = await Promise.all([
				fetch('/api/books?limit=100', { headers }),
				fetch('/api/borrowings/my', { headers }),
			]);

			const booksData = await booksRes.json();
			const borrowingsData = await borrowingsRes.json();

			stats = {
				totalBooks: booksData.total || 0,
				borrowedBooks: borrowingsData.filter((b: any) => b.status === 'borrowed').length,
				availableBooks: booksData.books?.filter((b: any) => b.availableCopies > 0).length || 0,
			};

			recentBorrowings = borrowingsData.slice(0, 5);
		} catch (e) {
			console.error('Failed to load data:', e);
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Dashboard - Library App</title>
</svelte:head>

<div class="dashboard">
	<h1>Dashboard</h1>
	<p class="welcome">Welcome back, {user?.name}!</p>

	{#if loading}
		<p>Loading...</p>
	{:else}
		<div class="stats-grid">
			<div class="stat-card">
				<div class="stat-icon">📚</div>
				<div class="stat-value">{stats.totalBooks}</div>
				<div class="stat-label">Total Books</div>
			</div>
			<div class="stat-card borrowed">
				<div class="stat-icon">📖</div>
				<div class="stat-value">{stats.borrowedBooks}</div>
				<div class="stat-label">Borrowed Books</div>
			</div>
			<div class="stat-card available">
				<div class="stat-icon">✅</div>
				<div class="stat-value">{stats.availableBooks}</div>
				<div class="stat-label">Available Books</div>
			</div>
		</div>

		<section class="recent-borrowings">
			<h2>Recent Borrowings</h2>
			{#if recentBorrowings.length === 0}
				<p class="empty-state">No borrowings yet. <a href="/books">Browse books</a> to get started!</p>
			{:else}
				<div class="table-container">
					<table>
						<thead>
							<tr>
								<th>Book</th>
								<th>Borrow Date</th>
								<th>Status</th>
							</tr>
						</thead>
						<tbody>
							{#each recentBorrowings as borrowing}
								<tr>
									<td>{borrowing.book.title}</td>
									<td>{new Date(borrowing.borrowDate).toLocaleDateString()}</td>
									<td>
										<span class="status {borrowing.status}">
											{borrowing.status}
										</span>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
				<a href="/my-borrowings" class="view-all">View All Borrowings →</a>
			{/if}
		</section>
	{/if}
</div>

<style>
	.dashboard {
		padding: 1rem 0;
	}

	h1 {
		color: #2c3e50;
		margin-bottom: 0.5rem;
	}

	.welcome {
		color: #7f8c8d;
		margin-bottom: 2rem;
		font-size: 1.1rem;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1.5rem;
		margin-bottom: 3rem;
	}

	.stat-card {
		background: white;
		padding: 1.5rem;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		text-align: center;
	}

	.stat-icon {
		font-size: 2rem;
		margin-bottom: 0.5rem;
	}

	.stat-value {
		font-size: 2rem;
		font-weight: bold;
		color: #2c3e50;
	}

	.stat-label {
		color: #7f8c8d;
		margin-top: 0.25rem;
	}

	.recent-borrowings {
		background: white;
		padding: 1.5rem;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.recent-borrowings h2 {
		color: #2c3e50;
		margin-bottom: 1.5rem;
	}

	.table-container {
		overflow-x: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	th, td {
		padding: 0.75rem;
		text-align: left;
		border-bottom: 1px solid #eee;
	}

	th {
		color: #2c3e50;
		font-weight: 600;
	}

	.status {
		padding: 0.25rem 0.75rem;
		border-radius: 20px;
		font-size: 0.875rem;
		font-weight: 500;
	}

	.status.borrowed {
		background: #fff3cd;
		color: #856404;
	}

	.status.returned {
		background: #d4edda;
		color: #155724;
	}

	.empty-state {
		color: #7f8c8d;
		text-align: center;
		padding: 2rem;
	}

	.empty-state a {
		color: #3498db;
		text-decoration: none;
	}

	.view-all {
		display: inline-block;
		color: #3498db;
		text-decoration: none;
		font-weight: 500;
		margin-top: 1rem;
	}

	@media (max-width: 768px) {
		.stats-grid {
			grid-template-columns: 1fr;
		}

		.stat-card {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 1rem;
		}

		.stat-icon {
			margin-bottom: 0;
		}

		.stat-value {
			font-size: 1.5rem;
		}
	}
</style>

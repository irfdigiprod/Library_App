<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let borrowings: any[] = [];
	let loading = true;
	let message = '';
	let messageType = '';

	onMount(async () => {
		const token = localStorage.getItem('token');
		if (!token) {
			goto('/login');
			return;
		}
		await loadBorrowings();
	});

	async function loadBorrowings() {
		try {
			const token = localStorage.getItem('token');
			const res = await fetch('/api/borrowings/my', {
				headers: { 'Authorization': `Bearer ${token}` },
			});
			borrowings = await res.json();
		} catch (e) {
			console.error('Failed to fetch borrowings:', e);
		} finally {
			loading = false;
		}
	}

	async function returnBook(borrowingId: number) {
		message = '';
		try {
			const token = localStorage.getItem('token');
			const res = await fetch(`/api/borrowings/${borrowingId}/return`, {
				method: 'POST',
				headers: { 'Authorization': `Bearer ${token}` },
			});

			const data = await res.json();

			if (!res.ok) {
				message = data.error || 'Failed to return book';
				messageType = 'error';
				return;
			}

			message = 'Book returned successfully!';
			messageType = 'success';
			await loadBorrowings();
		} catch (e) {
			message = 'An error occurred';
			messageType = 'error';
		}
	}
</script>

<svelte:head>
	<title>My Borrowings - Library App</title>
</svelte:head>

<div class="borrowings-page">
	<h1>My Borrowings</h1>

	{#if message}
		<div class="message {messageType}">{message}</div>
	{/if}

	{#if loading}
		<p>Loading...</p>
	{:else if borrowings.length === 0}
		<p class="empty-state">You haven't borrowed any books yet. <a href="/books">Browse books</a> to get started!</p>
	{:else}
		<div class="borrowings-list">
			{#each borrowings as borrowing}
				<div class="borrowing-card">
					<div class="borrowing-info">
						<h3>{borrowing.book.title}</h3>
						<p class="author">by {borrowing.book.author}</p>
						<p class="details">
							Borrowed: {new Date(borrowing.borrowDate).toLocaleDateString()}
							{#if borrowing.actualReturnDate}
								| Returned: {new Date(borrowing.actualReturnDate).toLocaleDateString()}
							{/if}
						</p>
					</div>
					<div class="borrowing-actions">
						<span class="status {borrowing.status}">{borrowing.status}</span>
						{#if borrowing.status === 'borrowed'}
							<button class="btn-return" on:click={() => returnBook(borrowing.id)}>
								Return Book
							</button>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.borrowings-page {
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

	.borrowings-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.borrowing-card {
		background: white;
		padding: 1.5rem;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.borrowing-info h3 {
		color: #2c3e50;
		margin-bottom: 0.25rem;
	}

	.author {
		color: #7f8c8d;
		margin-bottom: 0.5rem;
	}

	.details {
		color: #95a5a6;
		font-size: 0.9rem;
	}

	.borrowing-actions {
		display: flex;
		align-items: center;
		gap: 1rem;
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

	.btn-return {
		background: #27ae60;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		cursor: pointer;
		font-weight: 500;
		transition: background 0.2s;
	}

	.btn-return:hover {
		background: #219a52;
	}

	.empty-state {
		text-align: center;
		color: #7f8c8d;
		padding: 3rem 0;
	}

	.empty-state a {
		color: #3498db;
		text-decoration: none;
	}

	@media (max-width: 768px) {
		.borrowing-card {
			flex-direction: column;
			align-items: flex-start;
		}

		.borrowing-actions {
			width: 100%;
			justify-content: space-between;
		}

		.btn-return {
			width: 100%;
		}
	}
</style>

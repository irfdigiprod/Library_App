<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let user: any = null;
	let books: any[] = [];
	let loading = true;
	let showModal = false;
	let editingBook: any = null;
	let form = { title: '', author: '', isbn: '', description: '', totalCopies: 1 };
	let message = '';
	let messageType = '';

	onMount(async () => {
		const stored = localStorage.getItem('user');
		if (!stored) {
			goto('/login');
			return;
		}

		user = JSON.parse(stored);

		if (user.role !== 'admin') {
			goto('/dashboard');
			return;
		}

		await loadBooks();
	});

	async function loadBooks() {
		try {
			const token = localStorage.getItem('token');
			const res = await fetch('/api/books?limit=100', {
				headers: { 'Authorization': `Bearer ${token}` },
			});
			const data = await res.json();
			books = data.books || [];
		} catch (e) {
			console.error('Failed to fetch books:', e);
		} finally {
			loading = false;
		}
	}

	function openAddModal() {
		editingBook = null;
		form = { title: '', author: '', isbn: '', description: '', totalCopies: 1 };
		showModal = true;
	}

	function openEditModal(book: any) {
		editingBook = book;
		form = {
			title: book.title,
			author: book.author,
			isbn: book.isbn,
			description: book.description || '',
			totalCopies: book.totalCopies,
		};
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		editingBook = null;
	}

	async function handleSubmit() {
		message = '';
		try {
			const token = localStorage.getItem('token');
			const url = editingBook ? `/api/books/${editingBook.id}` : '/api/books';
			const method = editingBook ? 'PUT' : 'POST';

			const res = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`,
				},
				body: JSON.stringify(form),
			});

			const data = await res.json();

			if (!res.ok) {
				message = data.error || 'Operation failed';
				messageType = 'error';
				return;
			}

			message = editingBook ? 'Book updated successfully' : 'Book added successfully';
			messageType = 'success';
			closeModal();
			await loadBooks();
		} catch (e) {
			message = 'An error occurred';
			messageType = 'error';
		}
	}

	async function deleteBook(bookId: number) {
		if (!confirm('Are you sure you want to delete this book?')) return;

		message = '';
		try {
			const token = localStorage.getItem('token');
			const res = await fetch(`/api/books/${bookId}`, {
				method: 'DELETE',
				headers: { 'Authorization': `Bearer ${token}` },
			});

			const data = await res.json();

			if (!res.ok) {
				message = data.error || 'Failed to delete book';
				messageType = 'error';
				return;
			}

			message = 'Book deleted successfully';
			messageType = 'success';
			await loadBooks();
		} catch (e) {
			message = 'An error occurred';
			messageType = 'error';
		}
	}
</script>

<svelte:head>
	<title>Manage Books - Library App</title>
</svelte:head>

<div class="admin-page">
	<div class="page-header">
		<h1>Manage Books</h1>
		<button class="btn-add" on:click={openAddModal}>+ Add Book</button>
	</div>

	{#if message}
		<div class="message {messageType}">{message}</div>
	{/if}

	{#if loading}
		<p>Loading...</p>
	{:else if books.length === 0}
		<p class="empty-state">No books yet. Add your first book!</p>
	{:else}
		<div class="table-container">
			<table>
				<thead>
					<tr>
						<th>Title</th>
						<th>Author</th>
						<th>ISBN</th>
						<th>Copies</th>
						<th>Available</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each books as book}
						<tr>
							<td>{book.title}</td>
							<td>{book.author}</td>
							<td>{book.isbn}</td>
							<td>{book.totalCopies}</td>
							<td>{book.availableCopies}</td>
							<td class="actions">
								<button class="btn-edit" on:click={() => openEditModal(book)}>Edit</button>
								<button class="btn-delete" on:click={() => deleteBook(book.id)}>Delete</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

{#if showModal}
	<div class="modal-overlay" on:click={closeModal}>
		<div class="modal" on:click|stopPropagation={() => {}}>
			<h2>{editingBook ? 'Edit Book' : 'Add Book'}</h2>
			<form on:submit|preventDefault={handleSubmit}>
				<div class="form-group">
					<label for="title">Title</label>
					<input id="title" type="text" bind:value={form.title} required />
				</div>
				<div class="form-group">
					<label for="author">Author</label>
					<input id="author" type="text" bind:value={form.author} required />
				</div>
				<div class="form-group">
					<label for="isbn">ISBN</label>
					<input id="isbn" type="text" bind:value={form.isbn} required />
				</div>
				<div class="form-group">
					<label for="description">Description</label>
					<textarea id="description" bind:value={form.description} rows="3"></textarea>
				</div>
				<div class="form-group">
					<label for="totalCopies">Total Copies</label>
					<input id="totalCopies" type="number" bind:value={form.totalCopies} min="1" required />
				</div>
				<div class="modal-actions">
					<button type="button" class="btn-cancel" on:click={closeModal}>Cancel</button>
					<button type="submit" class="btn-save">{editingBook ? 'Update' : 'Add'} Book</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<style>
	.admin-page {
		padding: 1rem 0;
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
		flex-wrap: wrap;
		gap: 1rem;
	}

	h1 {
		color: #2c3e50;
	}

	.btn-add {
		background: #27ae60;
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 6px;
		cursor: pointer;
		font-weight: 500;
		transition: background 0.2s;
	}

	.btn-add:hover {
		background: #219a52;
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

	.table-container {
		overflow-x: auto;
		background: white;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
		background: #f8f9fa;
	}

	.actions {
		display: flex;
		gap: 0.5rem;
	}

	.btn-edit {
		background: #3498db;
		color: white;
		border: none;
		padding: 0.375rem 0.75rem;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.875rem;
	}

	.btn-delete {
		background: #e74c3c;
		color: white;
		border: none;
		padding: 0.375rem 0.75rem;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.875rem;
	}

	.empty-state {
		text-align: center;
		color: #7f8c8d;
		padding: 3rem 0;
	}

	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		z-index: 1000;
	}

	.modal {
		background: white;
		padding: 2rem;
		border-radius: 12px;
		width: 100%;
		max-width: 500px;
		max-height: 90vh;
		overflow-y: auto;
	}

	.modal h2 {
		color: #2c3e50;
		margin-bottom: 1.5rem;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
		color: #2c3e50;
		font-weight: 500;
	}

	input, textarea {
		width: 100%;
		padding: 0.75rem;
		border: 2px solid #e1e8ed;
		border-radius: 6px;
		font-size: 1rem;
	}

	input:focus, textarea:focus {
		outline: none;
		border-color: #3498db;
	}

	.modal-actions {
		display: flex;
		gap: 1rem;
		justify-content: flex-end;
		margin-top: 1.5rem;
	}

	.btn-cancel {
		background: #95a5a6;
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 6px;
		cursor: pointer;
	}

	.btn-save {
		background: #3498db;
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 6px;
		cursor: pointer;
	}

	@media (max-width: 768px) {
		.page-header {
			flex-direction: column;
			align-items: flex-start;
		}

		.btn-add {
			width: 100%;
		}

		.actions {
			flex-direction: column;
		}

		.btn-edit, .btn-delete {
			width: 100%;
		}
	}
</style>

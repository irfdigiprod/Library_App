<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let user: any = null;
	let menuOpen = false;

	onMount(() => {
		const stored = localStorage.getItem('user');
		if (stored) {
			user = JSON.parse(stored);
		}
	});

	function logout() {
		localStorage.removeItem('token');
		localStorage.removeItem('user');
		user = null;
		menuOpen = false;
		goto('/login');
	}

	function toggleMenu() {
		menuOpen = !menuOpen;
	}
</script>

<div class="app">
	<nav class="navbar">
		<div class="nav-container">
			<a href="/" class="nav-brand">📚 Library</a>
			<button class="nav-toggle" on:click={toggleMenu} aria-label="Toggle menu">
				☰
			</button>
			<div class="nav-menu" class:active={menuOpen}>
				{#if user}
					<a href="/dashboard" on:click={() => menuOpen = false}>Dashboard</a>
					<a href="/books" on:click={() => menuOpen = false}>Books</a>
					<a href="/my-borrowings" on:click={() => menuOpen = false}>My Borrowings</a>
					{#if user.role === 'admin'}
						<a href="/admin/books" on:click={() => menuOpen = false}>Manage Books</a>
					{/if}
					<span class="nav-user">{user.name}</span>
					<button class="btn-logout" on:click={logout}>Logout</button>
				{:else}
					<a href="/login" on:click={() => menuOpen = false}>Login</a>
					<a href="/register" class="btn-primary" on:click={() => menuOpen = false}>Register</a>
				{/if}
			</div>
		</div>
	</nav>
	<main class="main-content">
		<slot />
	</main>
	<footer class="footer">
		<p>&copy; 2026 Library App. All rights reserved.</p>
	</footer>
</div>

<style>
	:global(*) {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	:global(body) {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		background: #f5f7fa;
		color: #333;
	}

	.app {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.navbar {
		background: #2c3e50;
		color: white;
		padding: 1rem;
		position: sticky;
		top: 0;
		z-index: 100;
	}

	.nav-container {
		max-width: 1200px;
		margin: 0 auto;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.nav-brand {
		font-size: 1.5rem;
		font-weight: bold;
		color: white;
		text-decoration: none;
	}

	.nav-menu {
		display: flex;
		gap: 1rem;
		align-items: center;
	}

	.nav-menu a {
		color: white;
		text-decoration: none;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		transition: background 0.2s;
	}

	.nav-menu a:hover {
		background: rgba(255, 255, 255, 0.1);
	}

	.nav-toggle {
		display: none;
		background: none;
		border: none;
		color: white;
		font-size: 1.5rem;
		cursor: pointer;
	}

	.nav-user {
		padding: 0.5rem 1rem;
		color: #3498db;
		font-weight: 500;
	}

	.btn-logout {
		background: #e74c3c;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		cursor: pointer;
		transition: background 0.2s;
	}

	.btn-logout:hover {
		background: #c0392b;
	}

	.btn-primary {
		background: #3498db;
	}

	.btn-primary:hover {
		background: #2980b9;
	}

	.main-content {
		flex: 1;
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem 1rem;
		width: 100%;
	}

	.footer {
		background: #2c3e50;
		color: white;
		text-align: center;
		padding: 1rem;
		margin-top: auto;
	}

	@media (max-width: 768px) {
		.nav-toggle {
			display: block;
		}

		.nav-menu {
			display: none;
			position: absolute;
			top: 100%;
			left: 0;
			right: 0;
			background: #2c3e50;
			flex-direction: column;
			padding: 1rem;
			gap: 0.5rem;
		}

		.nav-menu.active {
			display: flex;
		}

		.nav-menu a {
			width: 100%;
			text-align: center;
		}

		.main-content {
			padding: 1rem;
		}
	}
</style>

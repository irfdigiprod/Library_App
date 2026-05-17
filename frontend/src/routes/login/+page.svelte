<script lang="ts">
	import { goto } from '$app/navigation';

	let email = '';
	let password = '';
	let error = '';
	let loading = false;

	async function handleSubmit() {
		error = '';

		if (!email || !password) {
			error = 'Email and password are required';
			return;
		}

		loading = true;

		try {
			const res = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password }),
			});

			const data = await res.json();

			if (!res.ok) {
				error = data.error || 'Login failed';
				return;
			}

			localStorage.setItem('token', data.token);
			localStorage.setItem('user', JSON.stringify(data.user));
			goto('/dashboard');
		} catch (e) {
			error = 'An error occurred. Please try again.';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Login - Library App</title>
</svelte:head>

<div class="auth-container">
	<div class="auth-card">
		<h1>Welcome Back</h1>
		<p class="subtitle">Login to your account</p>

		{#if error}
			<div class="error">{error}</div>
		{/if}

		<form on:submit|preventDefault={handleSubmit}>
			<div class="form-group">
				<label for="email">Email</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					placeholder="Enter your email"
					required
				/>
			</div>

			<div class="form-group">
				<label for="password">Password</label>
				<input
					id="password"
					type="password"
					bind:value={password}
					placeholder="Enter password"
					required
				/>
			</div>

			<button type="submit" class="btn-submit" disabled={loading}>
				{loading ? 'Logging in...' : 'Login'}
			</button>
		</form>

		<p class="auth-link">
			Don't have an account? <a href="/register">Register here</a>
		</p>
	</div>
</div>

<style>
	.auth-container {
		min-height: 80vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem 1rem;
	}

	.auth-card {
		background: white;
		padding: 2.5rem;
		border-radius: 12px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
		width: 100%;
		max-width: 450px;
	}

	h1 {
		color: #2c3e50;
		margin-bottom: 0.5rem;
		text-align: center;
	}

	.subtitle {
		color: #7f8c8d;
		text-align: center;
		margin-bottom: 2rem;
	}

	.error {
		background: #fee;
		color: #e74c3c;
		padding: 0.75rem;
		border-radius: 6px;
		margin-bottom: 1rem;
		text-align: center;
	}

	.form-group {
		margin-bottom: 1.25rem;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
		color: #2c3e50;
		font-weight: 500;
	}

	input {
		width: 100%;
		padding: 0.75rem;
		border: 2px solid #e1e8ed;
		border-radius: 6px;
		font-size: 1rem;
		transition: border-color 0.2s;
	}

	input:focus {
		outline: none;
		border-color: #3498db;
	}

	.btn-submit {
		width: 100%;
		padding: 0.875rem;
		background: #3498db;
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.2s;
		margin-top: 0.5rem;
	}

	.btn-submit:hover:not(:disabled) {
		background: #2980b9;
	}

	.btn-submit:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.auth-link {
		text-align: center;
		margin-top: 1.5rem;
		color: #7f8c8d;
	}

	.auth-link a {
		color: #3498db;
		text-decoration: none;
		font-weight: 500;
	}

	.auth-link a:hover {
		text-decoration: underline;
	}

	@media (max-width: 480px) {
		.auth-card {
			padding: 1.5rem;
		}

		h1 {
			font-size: 1.5rem;
		}
	}
</style>

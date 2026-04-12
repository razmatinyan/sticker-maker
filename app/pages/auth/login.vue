<script setup lang="ts">
definePageMeta({
	layout: 'auth',
	middleware: 'guest',
})

const { signIn } = useAuth()

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const error = ref('')

async function handleSubmit() {
	error.value = ''
	isLoading.value = true

	try {
		await signIn(email.value, password.value)
	} catch (e: any) {
		error.value = e.message ?? 'Something went wrong'
	} finally {
		isLoading.value = false
	}
}
</script>

<template>
	<div class="space-y-5">
		<!-- Header -->
		<div class="space-y-1 text-center">
			<h1 class="text-xl font-medium tracking-heading">Welcome back</h1>
			<p class="text-sm text-muted-foreground">
				Sign in to your Stickr account
			</p>
		</div>

		<!-- Error -->
		<div
			v-if="error"
			class="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2"
		>
			{{ error }}
		</div>

		<!-- Form -->
		<form class="space-y-4" @submit.prevent="handleSubmit">
			<div class="space-y-2">
				<Label for="email">Email</Label>
				<Input
					id="email"
					v-model="email"
					type="email"
					placeholder="you@example.com"
					required
					autocomplete="email"
				/>
			</div>

			<div class="space-y-2">
				<Label for="password">Password</Label>
				<Input
					id="password"
					v-model="password"
					type="password"
					placeholder="••••••••"
					required
					autocomplete="current-password"
				/>
			</div>

			<Button type="submit" class="w-full" :disabled="isLoading">
				<span v-if="isLoading" class="flex items-center gap-2">
					<svg
						class="w-4 h-4 animate-spin"
						viewBox="0 0 24 24"
						fill="none"
					>
						<circle
							class="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							stroke-width="4"
						/>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
						/>
					</svg>
					Signing in...
				</span>
				<span v-else>Sign in</span>
			</Button>
		</form>

		<!-- Divider -->
		<Separator />

		<!-- Register link -->
		<p class="text-center text-sm text-muted-foreground">
			Don't have an account?
			<NuxtLink
				to="/auth/register"
				class="text-framer-blue hover:underline ml-1"
			>
				Sign up free
			</NuxtLink>
		</p>
	</div>
</template>

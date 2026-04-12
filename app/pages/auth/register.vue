<script setup lang="ts">
definePageMeta({
	layout: 'auth',
	middleware: 'guest',
})

const { signUp } = useAuth()

const fullName = ref('')
const email = ref('')
const password = ref('')
const isLoading = ref(false)
const error = ref('')
const isSuccess = ref(false)

async function handleSubmit() {
	error.value = ''
	isLoading.value = true

	try {
		await signUp(email.value, password.value, fullName.value)
		isSuccess.value = true
	} catch (e: any) {
		error.value = e.message ?? 'Something went wrong'
	} finally {
		isLoading.value = false
	}
}
</script>

<template>
	<div class="space-y-5">
		<!-- Success state -->
		<div v-if="isSuccess" class="text-center space-y-3">
			<div
				class="w-12 h-12 rounded-full bg-framer-blue/10 flex items-center justify-center mx-auto"
			>
				<svg
					class="w-6 h-6 text-framer-blue"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M5 13l4 4L19 7"
					/>
				</svg>
			</div>
			<h2 class="text-lg font-medium">Check your email</h2>
			<p class="text-sm text-muted-foreground">
				We sent a confirmation link to <strong>{{ email }}</strong>
			</p>
			<NuxtLink to="/auth/login">
				<Button variant="outline" class="w-full mt-2">
					Back to login
				</Button>
			</NuxtLink>
		</div>

		<!-- Form -->
		<template v-else>
			<div class="space-y-1 text-center">
				<h1 class="text-xl font-medium tracking-heading">
					Create account
				</h1>
				<p class="text-sm text-muted-foreground">
					Start creating stickers for free
				</p>
			</div>

			<div
				v-if="error"
				class="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2"
			>
				{{ error }}
			</div>

			<form class="space-y-4" @submit.prevent="handleSubmit">
				<div class="space-y-2">
					<Label for="fullName">Full name</Label>
					<Input
						id="fullName"
						v-model="fullName"
						type="text"
						placeholder="John Doe"
						required
						autocomplete="name"
					/>
				</div>

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
						minlength="8"
						required
						autocomplete="new-password"
					/>
					<p class="text-xs text-muted-foreground">
						Minimum 8 characters
					</p>
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
						Creating account...
					</span>
					<span v-else>Create account</span>
				</Button>
			</form>

			<Separator />

			<p class="text-center text-sm text-muted-foreground">
				Already have an account?
				<NuxtLink
					to="/auth/login"
					class="text-framer-blue hover:underline ml-1"
				>
					Sign in
				</NuxtLink>
			</p>
		</template>
	</div>
</template>

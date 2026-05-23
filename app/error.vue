<script setup lang="ts">
const props = defineProps<{ error: any }>()
const handle = useError()

const isNotFound = computed(() => props.error?.statusCode === 404)

function goHome() {
	handle.clearError({ redirect: '/' })
}

function goBack() {
	handle.clearError()
	history.back()
}
</script>

<template>
	<div
		class="min-h-screen bg-background flex items-center justify-center p-8 relative overflow-hidden"
	>
		<!-- Background atmosphere -->
		<div class="fixed inset-0 pointer-events-none overflow-hidden">
			<div class="glow-orb glow-orb--1" />
			<div class="glow-orb glow-orb--2" />
			<div class="noise-overlay" />
		</div>

		<div class="relative text-center space-y-6 max-w-md z-10">
			<!-- Icon -->
			<div
				class="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
				style="
					background: linear-gradient(
						135deg,
						rgba(99, 102, 241, 0.15),
						rgba(139, 92, 246, 0.15)
					);
				"
			>
				<Icon
					:name="
						isNotFound
							? 'ri:ghost-line'
							: 'ri:error-warning-line'
					"
					class="w-8 h-8 text-accent-violet"
				/>
			</div>

			<!-- Message -->
			<div class="space-y-2">
				<h1
					class="text-5xl font-bold tracking-display text-foreground font-display gradient-text"
				>
					{{ props.error?.statusCode ?? '?' }}
				</h1>
				<p class="text-lg font-semibold font-display">
					{{
						isNotFound
							? 'Page not found'
							: 'Something went wrong'
					}}
				</p>
				<p class="text-sm text-muted-foreground">
					{{
						isNotFound
							? "The page you're looking for doesn't exist or has been moved."
							: props.error?.message ??
								'An unexpected error occurred.'
					}}
				</p>
			</div>

			<!-- Actions -->
			<div class="flex gap-3 justify-center">
				<Button variant="outline" @click="goBack">
					<Icon
						name="ri:arrow-left-line"
						class="w-4 h-4 mr-2"
					/>
					Go back
				</Button>
				<Button
					class="gradient-btn rounded-lg"
					@click="goHome"
				>
					<Icon name="ri:home-line" class="w-4 h-4 mr-2" />
					<span>Home</span>
				</Button>
			</div>
		</div>
	</div>
</template>
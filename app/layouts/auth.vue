<script setup lang="ts"></script>

<template>
	<div
		class="min-h-screen bg-background flex items-center justify-center p-4"
	>
		<!-- Background glow effect -->
		<div class="fixed inset-0 overflow-hidden pointer-events-none">
			<div class="auth-glow" />
		</div>

		<!-- Card -->
		<div class="relative w-full max-w-sm">
			<!-- Logo -->
			<div class="flex items-center justify-center gap-2 mb-8">
				<div
					class="w-8 h-8 rounded-lg bg-framer-blue flex items-center justify-center"
				>
					<span class="text-white text-sm font-bold">S</span>
				</div>
				<span
					class="text-foreground font-medium text-lg tracking-heading"
				>
					Stickr
				</span>
			</div>

			<!-- Page content (login or register form) -->
			<div class="glass-card p-6">
				<slot />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts"></script>

<template>
	<div
		class="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden"
	>
		<!-- Background atmosphere -->
		<div class="fixed inset-0 overflow-hidden pointer-events-none">
			<div class="glow-orb glow-orb--1" style="top: 15%; left: 30%" />
			<div class="glow-orb glow-orb--2" style="bottom: 20%; right: 25%" />
			<div class="noise-overlay" />
		</div>

		<!-- Card -->
		<div class="relative w-full max-w-sm z-10">
			<!-- Logo -->
			<div class="flex items-center justify-center gap-2.5 mb-8">
				<div
					class="w-9 h-9 rounded-xl flex items-center justify-center"
					style="
						background: linear-gradient(
							135deg,
							hsl(239 84% 67%),
							hsl(258 90% 66%)
						);
						box-shadow: 0 2px 12px rgba(99, 102, 241, 0.35);
					"
				>
					<span class="text-white text-sm font-bold">S</span>
				</div>
				<span
					class="text-foreground font-semibold text-lg tracking-heading font-display"
				>
					Stickr
				</span>
			</div>

			<!-- Page content (login or register form) -->
			<div class="glass-surface p-7">
				<slot />
			</div>
		</div>
	</div>
</template>

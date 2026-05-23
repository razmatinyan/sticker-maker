<script setup lang="ts"></script>

<template>
	<div class="flex min-h-screen bg-background relative overflow-hidden">
		<!-- Background atmosphere -->
		<div class="fixed inset-0 pointer-events-none overflow-hidden z-0">
			<div class="glow-orb glow-orb--1" />
			<div class="glow-orb glow-orb--2" />
			<div class="noise-overlay" />
		</div>

		<AppSidebar />

		<div class="flex flex-col flex-1 relative z-10" style="margin-left: 220px">
			<main class="flex-1 p-8 animate-fade-in">
				<slot />
			</main>
		</div>
	</div>
</template>

<script setup lang="ts"></script>

<template>
	<div class="flex min-h-screen bg-background relative overflow-hidden">
		<!-- Background atmosphere (subtle for editor) -->
		<div class="fixed inset-0 pointer-events-none overflow-hidden z-0">
			<div class="glow-orb glow-orb--1" style="opacity: 0.06" />
			<div class="noise-overlay" />
		</div>

		<!-- Sidebar -->
		<AppSidebar />

		<!-- Editor fills remaining space -->
		<div class="flex flex-col flex-1 relative z-10" style="margin-left: 220px">
			<slot />
		</div>
	</div>
</template>

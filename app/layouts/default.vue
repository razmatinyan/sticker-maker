<script setup lang="ts"></script>

<template>
	<div class="flex min-h-screen bg-background">
		<AppSidebar />
		<div class="flex flex-col flex-1" style="margin-left: 220px">
			<header class="topbar" />
			<main class="flex-1 p-6 animate-fade-in">
				<slot />
			</main>
		</div>
	</div>
</template>

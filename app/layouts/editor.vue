<script setup lang="ts"></script>

<template>
	<div class="flex min-h-screen bg-background">
		<!-- Sidebar -->
		<AppSidebar />

		<!-- Editor fills remaining space -->
		<div class="flex flex-col flex-1" style="margin-left: 220px">
			<slot />
		</div>
	</div>
</template>

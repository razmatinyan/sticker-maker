<script setup lang="ts">
import 'vue-sonner/style.css'
import { Toaster } from '@/components/ui/sonner'

useHead({
	htmlAttrs: {
		class: 'dark',
	},
})
</script>

<template>
	<NuxtLayout>
		<NuxtPage />
	</NuxtLayout>
	<Toaster rich-colors position="bottom-right" />
</template>

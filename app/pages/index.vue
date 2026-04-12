<script setup lang="ts">
const user = useSupabaseUser()

// Redirect based on auth state
if (user.value) {
	await navigateTo('/dashboard')
} else {
	await navigateTo('/auth/login')
}
</script>

<template>
	<div />
</template>

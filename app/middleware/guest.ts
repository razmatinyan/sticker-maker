export default defineNuxtRouteMiddleware(() => {
	const user = useSupabaseUser()

	// If already logged in → redirect to dashboard
	if (user.value) {
		return navigateTo('/dashboard')
	}
})

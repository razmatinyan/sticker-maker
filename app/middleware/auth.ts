export default defineNuxtRouteMiddleware(to => {
	const user = useSupabaseUser()

	// If not logged in → redirect to login
	if (!user.value) {
		return navigateTo('/auth/login')
	}
})

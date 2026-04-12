export function useAuth() {
	const supabase = useSupabaseClient()
	const user = useSupabaseUser()
	const router = useRouter()

	// ── Sign Up ──────────────────────────────────────────────
	async function signUp(email: string, password: string, fullName: string) {
		const { error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: { full_name: fullName },
			},
		})
		if (error) throw error
	}

	// ── Sign In ──────────────────────────────────────────────
	async function signIn(email: string, password: string) {
		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		})
		if (error) throw error
		await router.push('/dashboard')
	}

	// ── Sign Out ─────────────────────────────────────────────
	async function signOut() {
		const { error } = await supabase.auth.signOut()
		if (error) throw error
		await router.push('/auth/login')
	}

	// ── Get Profile ──────────────────────────────────────────
	async function getProfile() {
		if (!user.value) return null

		const { data, error } = await supabase
			.from('profiles')
			.select('*')
			.eq('id', user.value.id)
			.single()

		if (error) throw error
		return data
	}

	return {
		user,
		signUp,
		signIn,
		signOut,
		getProfile,
		isAuthenticated: computed(() => !!user.value),
	}
}

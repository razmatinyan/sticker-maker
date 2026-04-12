export function useDashboard() {
	const supabase = useSupabaseClient()
	const user = useSupabaseUser()

	const stats = ref({
		totalStickers: 0,
		totalPacks: 0,
		aiCredits: 0,
	})

	const recentStickers = ref<any[]>([])
	const isLoading = ref(true)

	async function fetchDashboardData() {
		const userId = getUserId(user.value)
		if (!userId) {
			isLoading.value = false
			return
		}
		isLoading.value = true

		const [stickersRes, packsRes, profileRes, recentRes] =
			await Promise.all([
				supabase
					.from('stickers')
					.select('*', { count: 'exact', head: true })
					.eq('user_id', userId),

				supabase
					.from('sticker_packs')
					.select('*', { count: 'exact', head: true })
					.eq('user_id', userId),

				supabase
					.from('profiles')
					.select('ai_credits')
					.eq('id', userId)
					.single(),

				supabase
					.from('stickers')
					.select('*')
					.eq('user_id', userId)
					.order('created_at', { ascending: false })
					.limit(8),
			])

		stats.value = {
			totalStickers: stickersRes.count ?? 0,
			totalPacks: packsRes.count ?? 0,
			aiCredits: profileRes.data?.ai_credits ?? 0,
		}

		recentStickers.value = recentRes.data ?? []
		isLoading.value = false
	}

	return { stats, recentStickers, isLoading, fetchDashboardData }
}

import { defineStore } from 'pinia'
import type { Profile } from '~~/app/types/index'

export const useProfileStore = defineStore('profile', () => {
	const profile = ref<Profile | null>(null)
	const isLoading = ref(false)

	async function fetchProfile() {
		const supabase = useSupabaseClient()
		const user = useSupabaseUser()

		if (!user.value) return

		isLoading.value = true

		const { data, error } = await supabase
			.from('profiles')
			.select('*')
			.eq('id', user.value.id)
			.single()

		if (!error) profile.value = data
		isLoading.value = false
	}

	function clearProfile() {
		profile.value = null
	}

	return { profile, isLoading, fetchProfile, clearProfile }
})

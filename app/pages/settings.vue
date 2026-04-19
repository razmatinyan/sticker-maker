<script setup lang="ts">
definePageMeta({
	layout: 'default',
	middleware: 'auth',
})

useHead({ title: 'Settings — Stickr' })

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const isLoading = ref(true)
const isSaving = ref(false)
const profile = ref<any>(null)
const fullName = ref('')
const username = ref('')

async function fetchProfile() {
	const userId = getUserId(user.value)
	if (!userId) return

	const { data } = await supabase
		.from('profiles')
		.select('*')
		.eq('id', userId)
		.single()

	profile.value = data
	fullName.value = data?.full_name ?? ''
	username.value = data?.username ?? ''
	isLoading.value = false
}

async function saveProfile() {
	const userId = getUserId(user.value)
	if (!userId) return

	isSaving.value = true

	const { error: dbError } = await supabase
		.from('profiles')
		.update({
			full_name: fullName.value.trim(),
			username: username.value.trim() || null,
		})
		.eq('id', userId)

	isSaving.value = false

	if (dbError) {
		console.log(dbError.message)
	} else {
		console.log('Profile saved!')
	}
}

async function handleSignOut() {
	const { signOut } = useAuth()
	await signOut()
}

watch(
	user,
	u => {
		if (u) fetchProfile()
	},
	{ immediate: true },
)
</script>

<template>
	<div class="max-w-2xl space-y-6">
		<div>
			<h1 class="text-2xl font-medium tracking-heading">Settings</h1>
			<p class="text-muted-foreground text-sm mt-1">
				Manage your account and preferences.
			</p>
		</div>

		<div v-if="isLoading">
			<Skeleton class="h-64 rounded-xl" />
		</div>

		<template v-else>
			<!-- Profile -->
			<div class="glass-card p-5 space-y-4">
				<p class="text-sm font-medium">Profile</p>

				<!-- Avatar -->
				<div class="flex items-center gap-4">
					<Avatar class="w-14 h-14">
						<AvatarFallback
							class="text-lg bg-framer-blue text-white"
						>
							{{
								(fullName || user?.email || 'U')
									.charAt(0)
									.toUpperCase()
							}}
						</AvatarFallback>
					</Avatar>
					<div>
						<p class="text-sm font-medium">
							{{ fullName || 'No name set' }}
						</p>
						<p class="text-xs text-muted-foreground">
							{{ user?.email }}
						</p>
					</div>
				</div>

				<Separator />

				<div class="space-y-3">
					<div class="space-y-2">
						<Label for="full-name">Full Name</Label>
						<Input
							id="full-name"
							v-model="fullName"
							placeholder="John Doe"
						/>
					</div>

					<div class="space-y-2">
						<Label for="username">Username</Label>
						<Input
							id="username"
							v-model="username"
							placeholder="johndoe"
						/>
					</div>

					<Button :disabled="isSaving" @click="saveProfile">
						<Icon
							v-if="isSaving"
							name="ri:loader-4-line"
							class="w-4 h-4 mr-2 animate-spin"
						/>
						Save Changes
					</Button>
				</div>
			</div>

			<!-- Account -->
			<div class="glass-card p-5 space-y-3">
				<p class="text-sm font-medium">Account</p>
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm">Email</p>
						<p class="text-xs text-muted-foreground">
							{{ user?.email }}
						</p>
					</div>
				</div>

				<Separator />

				<Button
					variant="destructive"
					class="w-full"
					@click="handleSignOut"
				>
					<Icon name="ri:logout-box-line" class="w-4 h-4 mr-2" />
					Sign Out
				</Button>
			</div>
		</template>
	</div>
</template>

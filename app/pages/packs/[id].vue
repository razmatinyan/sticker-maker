<script setup lang="ts">
definePageMeta({
	layout: 'default',
	middleware: 'auth',
})

const route = useRoute()
const supabase = useSupabaseClient()
const user = useSupabaseUser()

const pack = ref<any>(null)
const stickers = ref<any[]>([])
const isLoading = ref(true)
const isDeleting = ref<string | null>(null)
const showAdd = ref(false)
const showPushModal = ref(false)

useHead(computed(() => ({ title: `${pack.value?.name ?? 'Pack'} — Stickr` })))

async function fetchPack() {
	const userId = getUserId(user.value)
	if (!userId) return

	isLoading.value = true

	const [packRes, stickersRes] = await Promise.all([
		supabase
			.from('sticker_packs')
			.select('*')
			.eq('id', route.params.id)
			.eq('user_id', userId)
			.single(),

		supabase
			.from('stickers')
			.select('*')
			.eq('pack_id', route.params.id)
			.order('created_at', { ascending: false }),
	])

	if (packRes.error) return navigateTo('/packs')

	pack.value = packRes.data
	stickers.value = stickersRes.data ?? []
	isLoading.value = false
}

async function removeFromPack(stickerId: string) {
	isDeleting.value = stickerId
	await supabase
		.from('stickers')
		.update({ pack_id: null })
		.eq('id', stickerId)

	stickers.value = stickers.value.filter(s => s.id !== stickerId)
	isDeleting.value = null
}

watch(
	user,
	u => {
		if (u) fetchPack()
	},
	{ immediate: true },
)
</script>

<template>
	<div class="space-y-6 max-w-5xl">
		<!-- Back button -->
		<div class="flex items-center gap-3">
			<NuxtLink to="/packs">
				<Button variant="ghost" size="sm" class="gap-2">
					<Icon name="ri:arrow-left-line" class="w-4 h-4" />
					Packs
				</Button>
			</NuxtLink>
		</div>

		<!-- Loading -->
		<div v-if="isLoading" class="space-y-4">
			<Skeleton class="h-8 w-48" />
			<div class="grid grid-cols-4 sm:grid-cols-8 gap-3">
				<Skeleton
					v-for="i in 8"
					:key="i"
					class="aspect-square rounded-xl"
				/>
			</div>
		</div>

		<!-- Pack not found -->
		<div v-else-if="!pack" class="glass-card p-12 text-center">
			<p class="text-muted-foreground">Pack not found.</p>
			<NuxtLink to="/packs">
				<Button variant="outline" class="mt-4">Back to Packs</Button>
			</NuxtLink>
		</div>

		<!-- Pack loaded — ALL pack.* access is inside this block -->
		<template v-else>
			<div class="flex items-start justify-between">
				<div>
					<div class="flex items-center gap-2">
						<h1 class="text-2xl font-medium tracking-heading">
							{{ pack.name }}
						</h1>
						<Badge
							v-if="pack.is_telegram_pack"
							variant="secondary"
							class="text-xs"
						>
							<Icon
								name="ri:telegram-line"
								class="w-3 h-3 mr-1"
							/>
							Telegram
						</Badge>
					</div>
					<p
						v-if="pack.description"
						class="text-muted-foreground text-sm mt-1"
					>
						{{ pack.description }}
					</p>
					<p class="text-muted-foreground text-sm mt-1">
						{{ stickers.length }} sticker{{
							stickers.length !== 1 ? 's' : ''
						}}
					</p>
				</div>

				<div class="flex gap-2">
					<Button
						v-if="pack.is_telegram_pack"
						variant="outline"
						size="sm"
						:disabled="stickers.length === 0"
						@click="showPushModal = true"
					>
						<Icon
							name="ri:telegram-line"
							class="w-3.5 h-3.5 mr-1.5 text-sky-400"
						/>
						Push to Telegram
					</Button>
				</div>
			</div>

			<!-- Empty pack -->
			<div
				v-if="stickers.length === 0"
				class="glass-card p-12 flex flex-col items-center gap-3 text-center"
			>
				<Icon
					name="ri:folder-line"
					class="w-10 h-10 text-muted-foreground"
				/>
				<div>
					<p class="font-medium text-sm">This pack is empty</p>
					<p class="text-xs text-muted-foreground mt-1">
						Save stickers to this pack from the editor
					</p>
				</div>
				<NuxtLink to="/editor">
					<Button size="sm">
						<Icon name="ri:magic-line" class="w-3.5 h-3.5 mr-1.5" />
						Open Editor
					</Button>
				</NuxtLink>
			</div>

			<!-- Stickers grid -->
			<div
				v-else
				class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3"
			>
				<div
					v-for="sticker in stickers"
					:key="sticker.id"
					class="group relative aspect-square rounded-xl overflow-hidden glass-card transition-all duration-150"
					:class="{ 'opacity-50': isDeleting === sticker.id }"
				>
					<img
						v-if="sticker.thumbnail_path"
						:src="sticker.thumbnail_path"
						alt="Sticker"
						class="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform duration-150"
					/>
					<div
						class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center"
					>
						<button
							class="w-7 h-7 rounded-lg bg-destructive/90 flex items-center justify-center text-white hover:bg-destructive"
							@click="removeFromPack(sticker.id)"
						>
							<Icon name="ri:close-line" class="w-3.5 h-3.5" />
						</button>
					</div>
				</div>
			</div>
		</template>

		<!-- Push modal -->
		<PacksPushToTelegramModal
			v-if="pack"
			v-model:open="showPushModal"
			:pack="pack"
			:stickers="stickers"
		/>
	</div>
</template>

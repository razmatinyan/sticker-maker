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
	<div class="space-y-5 max-w-6xl">
		<!-- Back -->
		<NuxtLink
			to="/packs"
			class="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors stagger-item"
			style="--stagger-index: 0"
		>
			<Icon name="ri:arrow-left-line" class="w-3.5 h-3.5" />
			<span>Back to Packs</span>
		</NuxtLink>

		<!-- Loading -->
		<div v-if="isLoading" class="space-y-4">
			<Skeleton class="h-8 w-48" />
			<div class="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-3">
				<Skeleton
					v-for="i in 6"
					:key="i"
					class="aspect-square rounded-xl"
				/>
			</div>
		</div>

		<!-- Pack not found -->
		<div v-else-if="!pack" class="glass-surface p-12 text-center">
			<p class="text-muted-foreground">Pack not found.</p>
			<NuxtLink to="/packs">
				<Button variant="outline" class="mt-4">Back to Packs</Button>
			</NuxtLink>
		</div>

		<!-- Pack loaded -->
		<template v-else>
			<!-- Header -->
			<div
				class="flex items-start justify-between stagger-item"
				style="--stagger-index: 1"
			>
				<div>
					<div class="flex items-center gap-3">
						<div
							class="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-violet-500/20 to-purple-500/20"
						>
							<Icon
								name="ri:folder-line"
								class="w-5 h-5 text-accent-violet"
							/>
						</div>
						<div>
							<h1
								class="text-2xl font-bold tracking-heading font-display"
							>
								{{ pack.name }}
							</h1>
							<p class="text-sm text-muted-foreground mt-0.5">
								{{ stickers.length }} sticker{{
									stickers.length !== 1 ? 's' : ''
								}}
								<template v-if="pack.description">
									· {{ pack.description }}
								</template>
							</p>
						</div>
					</div>
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
							class="w-3.5 h-3.5 mr-1.5"
							style="color: rgb(56, 189, 248)"
						/>
						Push to Telegram
					</Button>

					<NuxtLink to="/editor">
						<Button
							size="sm"
							class="gradient-btn rounded-lg text-sm"
						>
							<Icon
								name="ri:add-line"
								class="w-3.5 h-3.5 mr-1.5"
							/>
							<span>Add Sticker</span>
						</Button>
					</NuxtLink>
				</div>
			</div>

			<!-- Telegram badge -->
			<Badge
				v-if="pack.is_telegram_pack"
				variant="secondary"
				class="text-xs stagger-item"
				style="
					--stagger-index: 2;
					background: rgba(56, 189, 248, 0.1);
					color: rgb(56, 189, 248);
					border-color: rgba(56, 189, 248, 0.2);
				"
			>
				<Icon name="ri:telegram-line" class="w-3 h-3 mr-1" />
				Telegram Pack
				<template v-if="pack.telegram_pack_name">
					· @{{ pack.telegram_pack_name }}
				</template>
			</Badge>

			<!-- Empty pack -->
			<div
				v-if="stickers.length === 0"
				class="glass-surface p-16 flex flex-col items-center gap-4 text-center stagger-item"
				style="--stagger-index: 2"
			>
				<div
					class="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-violet-500/20 to-purple-500/20"
				>
					<Icon
						name="ri:folder-line"
						class="w-7 h-7 text-accent-violet"
					/>
				</div>
				<div>
					<p class="font-semibold">This pack is empty</p>
					<p class="text-sm text-muted-foreground mt-1">
						Save stickers to this pack from the editor
					</p>
				</div>
				<NuxtLink to="/editor">
					<Button
						class="gradient-btn rounded-lg px-4 py-2 text-sm"
					>
						<Icon
							name="ri:magic-line"
							class="w-4 h-4 mr-2"
						/>
						<span>Open Editor</span>
					</Button>
				</NuxtLink>
			</div>

			<!-- Stickers grid -->
			<div
				v-else
				class="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-3"
			>
				<div
					v-for="(sticker, index) in stickers"
					:key="sticker.id"
					class="group relative aspect-square rounded-xl overflow-hidden glass-card cursor-pointer stagger-item"
					:class="{ 'opacity-50': isDeleting === sticker.id }"
					:style="{ '--stagger-index': index + 3 }"
				>
					<img
						v-if="sticker.thumbnail_path"
						:src="sticker.thumbnail_path"
						alt="Sticker"
						class="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform duration-200"
					/>
					<div
						v-else
						class="w-full h-full flex items-center justify-center"
						style="background: rgba(255, 255, 255, 0.03)"
					>
						<Icon
							name="ri:image-line"
							class="w-6 h-6 text-muted-foreground"
						/>
					</div>

					<!-- Remove overlay -->
					<div
						class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center"
					>
						<button
							class="w-7 h-7 rounded-lg bg-destructive/90 flex items-center justify-center text-white hover:bg-destructive transition-colors"
							@click="removeFromPack(sticker.id)"
						>
							<Icon
								name="ri:close-line"
								class="w-3.5 h-3.5"
							/>
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

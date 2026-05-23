<script setup lang="ts">
definePageMeta({
	layout: 'default',
	middleware: 'auth',
})

useHead({ title: 'Sticker Packs — Stickr' })

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const packs = ref<any[]>([])
const isLoading = ref(true)
const showNew = ref(false)

async function fetchPacks() {
	const userId = getUserId(user.value)
	if (!userId) return

	isLoading.value = true

	const { data, error } = await supabase
		.from('sticker_packs')
		.select('*, stickers(id, thumbnail_path)')
		.eq('user_id', userId)
		.order('created_at', { ascending: false })

	if (!error) packs.value = data ?? []
	isLoading.value = false
}

async function deletePack(id: string) {
	await supabase.from('sticker_packs').delete().eq('id', id)
	packs.value = packs.value.filter(p => p.id !== id)
}

watch(
	user,
	u => {
		if (u) fetchPacks()
	},
	{ immediate: true },
)
</script>

<template>
	<div class="space-y-5 max-w-6xl">
		<!-- Header -->
		<div
			class="flex items-center justify-between stagger-item"
			style="--stagger-index: 0"
		>
			<div>
				<h1 class="text-2xl font-bold tracking-heading font-display">
					Sticker Packs
				</h1>
				<p class="text-muted-foreground text-sm mt-1">
					{{ packs.length }}
					pack{{ packs.length !== 1 ? 's' : '' }}
				</p>
			</div>
			<Button
				size="sm"
				class="gradient-btn rounded-lg text-sm"
				@click="showNew = true"
			>
				<Icon name="ri:add-line" class="w-3.5 h-3.5 mr-1.5" />
				<span>New Pack</span>
			</Button>
		</div>

		<!-- Loading -->
		<div
			v-if="isLoading"
			class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
		>
			<Skeleton v-for="i in 6" :key="i" class="h-44 rounded-xl" />
		</div>

		<!-- Empty -->
		<div
			v-else-if="packs.length === 0"
			class="glass-surface p-16 flex flex-col items-center gap-4 text-center stagger-item"
			style="--stagger-index: 1"
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
				<p class="font-semibold">No packs yet</p>
				<p class="text-sm text-muted-foreground mt-1">
					Group your stickers into packs
				</p>
			</div>
			<Button
				class="gradient-btn rounded-lg px-4 py-2 text-sm"
				@click="showNew = true"
			>
				<Icon name="ri:add-line" class="w-4 h-4 mr-2" />
				<span>Create Pack</span>
			</Button>
		</div>

		<!-- Packs grid -->
		<div
			v-else
			class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
		>
			<NuxtLink
				v-for="(pack, index) in packs"
				:key="pack.id"
				:to="`/packs/${pack.id}`"
				class="glass-card p-4 space-y-3 group stagger-item"
				:style="{ '--stagger-index': index + 1 }"
			>
				<!-- Sticker preview grid -->
				<div class="grid grid-cols-4 gap-1.5 h-20">
					<template v-if="pack.stickers?.length">
						<div
							v-for="s in pack.stickers.slice(0, 4)"
							:key="s.id"
							class="rounded-lg overflow-hidden"
							style="background: rgba(255, 255, 255, 0.04)"
						>
							<img
								v-if="s.thumbnail_path"
								:src="s.thumbnail_path"
								alt=""
								class="w-full h-full object-contain p-0.5"
							/>
						</div>
						<!-- Fill empty slots -->
						<div
							v-for="i in Math.max(
								0,
								4 - pack.stickers.slice(0, 4).length,
							)"
							:key="`empty-${i}`"
							class="rounded-lg"
							style="background: rgba(255, 255, 255, 0.03)"
						/>
					</template>
					<template v-else>
						<div
							v-for="i in 4"
							:key="i"
							class="rounded-lg"
							style="background: rgba(255, 255, 255, 0.03)"
						/>
					</template>
				</div>

				<!-- Pack info -->
				<div class="flex items-start justify-between">
					<div class="min-w-0">
						<p class="font-semibold text-sm truncate">
							{{ pack.name }}
						</p>
						<p class="text-xs text-muted-foreground mt-0.5">
							{{ pack.stickers?.length ?? 0 }} sticker{{
								pack.stickers?.length !== 1 ? 's' : ''
							}}
						</p>
					</div>

					<!-- Telegram badge -->
					<Badge
						v-if="pack.is_telegram_pack"
						variant="secondary"
						class="text-[10px] shrink-0 ml-2"
						style="background: rgba(56, 189, 248, 0.1); color: rgb(56, 189, 248); border-color: rgba(56, 189, 248, 0.2)"
					>
						<Icon
							name="ri:telegram-line"
							class="w-3 h-3 mr-1"
						/>
						TG
					</Badge>
				</div>

				<!-- Actions on hover -->
				<div
					class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
				>
					<Button
						variant="destructive"
						size="sm"
						class="flex-1 h-7 text-xs"
						@click.prevent="deletePack(pack.id)"
					>
						<Icon
							name="ri:delete-bin-line"
							class="w-3 h-3 mr-1"
						/>
						Delete
					</Button>
				</div>
			</NuxtLink>
		</div>

		<!-- New Pack Modal -->
		<PacksNewModal
			:open="showNew"
			@update:open="showNew = $event"
			@created="fetchPacks"
		/>
	</div>
</template>
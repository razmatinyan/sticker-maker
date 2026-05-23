<script setup lang="ts">
definePageMeta({
	layout: 'default',
	middleware: 'auth',
})

useHead({ title: 'Dashboard — Stickr' })

const user = useSupabaseUser()

const { stats, recentStickers, isLoading, fetchDashboardData } = useDashboard()

watch(
	user,
	newUser => {
		if (newUser) fetchDashboardData()
	},
	{ immediate: true },
)

const timeOfDay = useTimeOfDay()

const statCards = computed(() => [
	{
		label: 'Total Stickers',
		value: stats.value.totalStickers,
		icon: 'ri:emoji-sticker-line',
		gradient: 'from-indigo-500 to-violet-500',
		glow: 'rgba(99, 102, 241, 0.2)',
	},
	{
		label: 'Sticker Packs',
		value: stats.value.totalPacks,
		icon: 'ri:folder-line',
		gradient: 'from-violet-500 to-purple-500',
		glow: 'rgba(139, 92, 246, 0.2)',
	},
	{
		label: 'AI Credits',
		value: stats.value.aiCredits,
		icon: 'ri:sparkling-line',
		gradient: 'from-amber-400 to-orange-500',
		glow: 'rgba(251, 191, 36, 0.2)',
	},
])

const quickActions = [
	{
		title: 'Create Sticker',
		description: 'Open the canvas editor',
		icon: 'ri:magic-line',
		href: '/editor',
		gradient: 'from-indigo-500 to-violet-500',
	},
	{
		title: 'New Pack',
		description: 'Group stickers together',
		icon: 'ri:folder-add-line',
		href: '/packs',
		gradient: 'from-violet-500 to-purple-500',
	},
	{
		title: 'AI Generate',
		description: 'Create from a text prompt',
		icon: 'ri:sparkling-line',
		href: '/editor?mode=ai',
		gradient: 'from-amber-400 to-orange-500',
	},
	{
		title: 'Telegram',
		description: 'Connect your account',
		icon: 'ri:telegram-line',
		href: '/telegram',
		gradient: 'from-sky-400 to-blue-500',
	},
]
</script>

<template>
	<div class="space-y-6 max-w-6xl">
		<!-- ── Header ──────────────────────────────────────────── -->
		<div
			class="stagger-item"
			style="--stagger-index: 0"
		>
			<h1 class="text-3xl font-bold tracking-display font-display">
				Good {{ timeOfDay }},
				<span class="gradient-text">
					{{ user?.user_metadata?.full_name?.split(' ')[0] ?? 'there' }}
				</span>
			</h1>
			<p class="text-muted-foreground text-sm mt-1.5">
				Here's an overview of your sticker workspace.
			</p>
		</div>

		<!-- ── Stat Cards ──────────────────────────────────────── -->
		<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
			<template v-if="isLoading">
				<div v-for="i in 3" :key="i" class="glass-surface p-5 space-y-3">
					<Skeleton class="h-10 w-10 rounded-xl" />
					<Skeleton class="h-8 w-20" />
					<Skeleton class="h-4 w-28" />
				</div>
			</template>

			<template v-else>
				<div
					v-for="(card, index) in statCards"
					:key="card.label"
					class="glass-card p-5 space-y-3 stagger-item"
					:style="{ '--stagger-index': index + 1 }"
				>
					<div
						class="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br"
						:class="card.gradient"
						:style="{ boxShadow: `0 4px 14px ${card.glow}` }"
					>
						<Icon
							:name="card.icon"
							class="w-5 h-5 text-white"
						/>
					</div>
					<p class="text-3xl font-bold tabular-nums font-display">
						{{ card.value }}
					</p>
					<p class="text-xs text-muted-foreground font-medium">
						{{ card.label }}
					</p>
				</div>
			</template>
		</div>

		<!-- ── Quick Actions ───────────────────────────────────── -->
		<div
			class="space-y-3 stagger-item"
			:style="{ '--stagger-index': 4 }"
		>
			<h2
				class="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
			>
				Quick Actions
			</h2>
			<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
				<NuxtLink
					v-for="(action, index) in quickActions"
					:key="action.href"
					:to="action.href"
					class="glass-card p-4 flex flex-col gap-3 group"
				>
					<div
						class="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br"
						:class="action.gradient"
						style="box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3)"
					>
						<Icon
							:name="action.icon"
							class="w-4 h-4 text-white transition-transform duration-200 group-hover:scale-110"
						/>
					</div>
					<div>
						<p class="text-sm font-semibold">{{ action.title }}</p>
						<p class="text-xs text-muted-foreground mt-0.5">
							{{ action.description }}
						</p>
					</div>
					<Icon
						name="ri:arrow-right-line"
						class="w-3.5 h-3.5 text-muted-foreground mt-auto opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-0.5"
					/>
				</NuxtLink>
			</div>
		</div>

		<!-- ── Recent Stickers ─────────────────────────────────── -->
		<div
			class="space-y-3 stagger-item"
			:style="{ '--stagger-index': 5 }"
		>
			<div class="flex items-center justify-between">
				<h2
					class="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
				>
					Recent Stickers
				</h2>
				<NuxtLink
					to="/stickers"
					class="text-xs text-accent-indigo hover:text-accent-violet transition-colors"
				>
					View all
				</NuxtLink>
			</div>

			<!-- Loading -->
			<div v-if="isLoading" class="grid grid-cols-4 sm:grid-cols-6 gap-3">
				<Skeleton
					v-for="i in 6"
					:key="i"
					class="aspect-square rounded-xl"
				/>
			</div>

			<!-- Empty state -->
			<div
				v-else-if="recentStickers.length === 0"
				class="glass-surface p-12 flex flex-col items-center gap-4 text-center"
			>
				<div
					class="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-indigo-500/20 to-violet-500/20"
				>
					<Icon
						name="ri:emoji-sticker-line"
						class="w-7 h-7 text-accent-violet"
					/>
				</div>
				<div>
					<p class="text-sm font-semibold">No stickers yet</p>
					<p class="text-xs text-muted-foreground mt-1">
						Create your first sticker to get started
					</p>
				</div>
				<NuxtLink to="/editor">
					<Button size="sm" class="gradient-btn rounded-lg px-4 py-2 text-sm">
						<Icon name="ri:add-line" class="w-3.5 h-3.5 mr-1.5" />
						<span>Create Sticker</span>
					</Button>
				</NuxtLink>
			</div>

			<!-- Sticker grid -->
			<div v-else class="grid grid-cols-4 sm:grid-cols-6 gap-3">
				<div
					v-for="(sticker, index) in recentStickers"
					:key="sticker.id"
					class="glass-card aspect-square rounded-xl overflow-hidden cursor-pointer group stagger-item"
					:style="{ '--stagger-index': index + 6 }"
				>
					<img
						v-if="sticker.thumbnail_path"
						:src="sticker.thumbnail_path"
						:alt="'Sticker'"
						class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
					/>
					<div
						v-else
						class="w-full h-full flex items-center justify-center"
						style="background: rgba(255, 255, 255, 0.03)"
					>
						<Icon
							name="ri:image-line"
							class="w-5 h-5 text-muted-foreground"
						/>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

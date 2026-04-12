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
		color: 'text-framer-blue',
		bg: 'bg-framer-blue/10',
	},
	{
		label: 'Sticker Packs',
		value: stats.value.totalPacks,
		icon: 'ri:folder-line',
		color: 'text-violet-400',
		bg: 'bg-violet-400/10',
	},
	{
		label: 'AI Credits',
		value: stats.value.aiCredits,
		icon: 'ri:sparkling-line',
		color: 'text-amber-400',
		bg: 'bg-amber-400/10',
	},
])

const quickActions = [
	{
		title: 'Create Sticker',
		description: 'Open the canvas editor',
		icon: 'ri:magic-line',
		href: '/editor',
		color: 'text-framer-blue',
		bg: 'bg-framer-blue/10',
	},
	{
		title: 'New Pack',
		description: 'Group stickers together',
		icon: 'ri:folder-add-line',
		href: '/packs/new',
		color: 'text-violet-400',
		bg: 'bg-violet-400/10',
	},
	{
		title: 'AI Generate',
		description: 'Create from a text prompt',
		icon: 'ri:sparkling-line',
		href: '/editor?mode=ai',
		color: 'text-amber-400',
		bg: 'bg-amber-400/10',
	},
	{
		title: 'Telegram',
		description: 'Connect your account',
		icon: 'ri:telegram-line',
		href: '/telegram',
		color: 'text-sky-400',
		bg: 'bg-sky-400/10',
	},
]
</script>

<template>
	<div class="space-y-8 max-w-5xl">
		<!-- ── Header ──────────────────────────────────────────── -->
		<div>
			<h1 class="text-2xl font-medium tracking-heading">
				Good {{ timeOfDay }},
				{{ user?.user_metadata?.full_name?.split(' ')[0] ?? 'there' }}
			</h1>
			<p class="text-muted-foreground text-sm mt-1">
				Here's an overview of your sticker workspace.
			</p>
		</div>

		<!-- ── Stat Cards ──────────────────────────────────────── -->
		<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
			<template v-if="isLoading">
				<div v-for="i in 3" :key="i" class="glass-card p-5 space-y-3">
					<Skeleton class="h-8 w-8 rounded-lg" />
					<Skeleton class="h-7 w-16" />
					<Skeleton class="h-4 w-24" />
				</div>
			</template>

			<template v-else>
				<div
					v-for="card in statCards"
					:key="card.label"
					class="glass-card p-5 space-y-3"
				>
					<div
						:class="[
							'w-8 h-8 rounded-lg flex items-center justify-center',
							card.bg,
						]"
					>
						<Icon
							:name="card.icon"
							:class="['w-4 h-4', card.color]"
						/>
					</div>
					<p class="text-2xl font-medium tabular-nums">
						{{ card.value }}
					</p>
					<p class="text-xs text-muted-foreground">
						{{ card.label }}
					</p>
				</div>
			</template>
		</div>

		<!-- ── Quick Actions ───────────────────────────────────── -->
		<div class="space-y-3">
			<h2
				class="text-sm font-medium text-muted-foreground uppercase tracking-wider"
			>
				Quick Actions
			</h2>
			<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
				<NuxtLink
					v-for="action in quickActions"
					:key="action.href"
					:to="action.href"
					class="glass-card p-4 flex flex-col gap-3 hover:bg-white/5 transition-all duration-150 cursor-pointer group"
				>
					<div
						:class="[
							'w-8 h-8 rounded-lg flex items-center justify-center',
							action.bg,
						]"
					>
						<Icon
							:name="action.icon"
							:class="[
								'w-4 h-4 transition-transform duration-150 group-hover:scale-110',
								action.color,
							]"
						/>
					</div>
					<div>
						<p class="text-sm font-medium">{{ action.title }}</p>
						<p class="text-xs text-muted-foreground mt-0.5">
							{{ action.description }}
						</p>
					</div>
				</NuxtLink>
			</div>
		</div>

		<!-- ── Recent Stickers ─────────────────────────────────── -->
		<div class="space-y-3">
			<div class="flex items-center justify-between">
				<h2
					class="text-sm font-medium text-muted-foreground uppercase tracking-wider"
				>
					Recent Stickers
				</h2>
				<NuxtLink
					to="/stickers"
					class="text-xs text-framer-blue hover:underline"
				>
					View all
				</NuxtLink>
			</div>

			<!-- Loading -->
			<div v-if="isLoading" class="grid grid-cols-4 sm:grid-cols-8 gap-3">
				<Skeleton
					v-for="i in 8"
					:key="i"
					class="aspect-square rounded-xl"
				/>
			</div>

			<!-- Empty state -->
			<div
				v-else-if="recentStickers.length === 0"
				class="glass-card p-10 flex flex-col items-center gap-3 text-center"
			>
				<div
					class="w-12 h-12 rounded-xl bg-muted flex items-center justify-center"
				>
					<Icon
						name="ri:emoji-sticker-line"
						class="w-6 h-6 text-muted-foreground"
					/>
				</div>
				<div>
					<p class="text-sm font-medium">No stickers yet</p>
					<p class="text-xs text-muted-foreground mt-1">
						Create your first sticker to get started
					</p>
				</div>
				<NuxtLink to="/editor">
					<Button size="sm" class="mt-1">
						<Icon name="ri:add-line" class="w-3.5 h-3.5 mr-1.5" />
						Create Sticker
					</Button>
				</NuxtLink>
			</div>

			<!-- Sticker grid -->
			<div v-else class="grid grid-cols-4 sm:grid-cols-8 gap-3">
				<div
					v-for="sticker in recentStickers"
					:key="sticker.id"
					class="glass-card aspect-square rounded-xl overflow-hidden cursor-pointer hover:ring-1 hover:ring-framer-blue/40 transition-all duration-150 group"
				>
					<img
						v-if="sticker.thumbnail_path"
						:src="sticker.thumbnail_path"
						:alt="'Sticker'"
						class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-150"
					/>
					<div
						v-else
						class="w-full h-full flex items-center justify-center bg-muted"
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

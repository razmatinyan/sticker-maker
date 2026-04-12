<script setup lang="ts">
// Remove ALL lucide imports — no imports needed with @nuxt/icon

const route = useRoute()
const { user, signOut } = useAuth()

const navigation = [
	{
		label: 'Explore',
		items: [
			{
				title: 'Dashboard',
				icon: 'ri:dashboard-line',
				href: '/dashboard',
			},
			{ title: 'Editor', icon: 'ri:magic-line', href: '/editor' },
		],
	},
	{
		label: 'Library',
		items: [
			{
				title: 'My Stickers',
				icon: 'ri:emoji-sticker-line',
				href: '/stickers',
			},
			{ title: 'Packs', icon: 'ri:folder-line', href: '/packs' },
		],
	},
	{
		label: 'Integrations',
		items: [
			{ title: 'Telegram', icon: 'ri:telegram-line', href: '/telegram' },
		],
	},
]

function isActive(href: string) {
	return route.path === href || route.path.startsWith(href + '/')
}
</script>

<template>
	<aside class="sidebar">
		<!-- Header -->
		<div class="sidebar-header">
			<div class="sidebar-logo">
				<div class="sidebar-logo-icon"><span>S</span></div>
				<span class="sidebar-logo-text">Stickr</span>
			</div>
			<button class="sidebar-search">
				<Icon
					name="ri:search-line"
					class="w-3.5 h-3.5 text-muted-foreground"
				/>
				<span class="text-muted-foreground text-xs">Search</span>
				<kbd class="sidebar-search-kbd">⌘K</kbd>
			</button>
		</div>

		<!-- Nav -->
		<ScrollArea class="sidebar-nav-area">
			<nav class="sidebar-nav">
				<div
					v-for="section in navigation"
					:key="section.label"
					class="sidebar-section"
				>
					<p class="sidebar-section-label">{{ section.label }}</p>
					<ul class="sidebar-section-items">
						<li v-for="item in section.items" :key="item.href">
							<NuxtLink
								:to="item.href"
								class="sidebar-nav-item"
								:class="{
									'sidebar-nav-item--active': isActive(
										item.href,
									),
								}"
							>
								<Icon
									:name="item.icon"
									class="w-4 h-4 shrink-0"
								/>
								<span>{{ item.title }}</span>
							</NuxtLink>
						</li>
					</ul>
				</div>
			</nav>
		</ScrollArea>

		<!-- Footer -->
		<div class="sidebar-footer">
			<NuxtLink to="/settings" class="sidebar-footer-btn">
				<Icon
					name="ri:settings-line"
					class="w-4 h-4 text-muted-foreground"
				/>
			</NuxtLink>

			<NuxtLink to="/editor" class="sidebar-footer-cta">
				<Icon name="ri:add-line" class="w-3.5 h-3.5" />
				<span>New Sticker</span>
			</NuxtLink>

			<DropdownMenu>
				<DropdownMenuTrigger as-child>
					<button class="sidebar-avatar">
						<Avatar class="w-7 h-7">
							<AvatarImage
								v-if="user?.user_metadata?.avatar_url"
								:src="user.user_metadata.avatar_url"
								:alt="user.user_metadata?.full_name ?? 'User'"
							/>
							<AvatarFallback
								class="text-xs bg-framer-blue text-white"
							>
								{{
									(
										user?.user_metadata?.full_name ??
										user?.email ??
										'U'
									)
										.charAt(0)
										.toUpperCase()
								}}
							</AvatarFallback>
						</Avatar>
					</button>
				</DropdownMenuTrigger>

				<DropdownMenuContent side="top" align="end" class="w-48 mb-1">
					<div
						class="px-2 py-1.5 text-xs text-muted-foreground truncate"
					>
						{{ user?.email }}
					</div>
					<DropdownMenuSeparator />
					<DropdownMenuItem as-child>
						<NuxtLink to="/settings" class="cursor-pointer">
							<Icon
								name="ri:settings-line"
								class="w-4 h-4 mr-2"
							/>
							Settings
						</NuxtLink>
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						class="text-destructive cursor-pointer"
						@click="signOut"
					>
						Sign out
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	</aside>
</template>

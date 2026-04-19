<script setup lang="ts">
const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{
	'update:open': [value: boolean]
	created: []
}>()

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const name = ref('')
const description = ref('')
const isTelegram = ref(false)
const isLoading = ref(false)

async function handleCreate() {
	if (!name.value.trim()) return

	const userId = getUserId(user.value)
	if (!userId) return

	isLoading.value = true

	const { error: dbError } = await supabase.from('sticker_packs').insert({
		user_id: userId,
		name: name.value.trim(),
		description: description.value.trim() || null,
		is_telegram_pack: isTelegram.value,
	})

	if (dbError) {
		console.log(dbError.message)
		isLoading.value = false
		return
	}

	emit('created')
	emit('update:open', false)
	name.value = ''
	description.value = ''
	isTelegram.value = false
	isLoading.value = false
}

function close() {
	emit('update:open', false)
}
</script>

<template>
	<Dialog :open="open" @update:open="close">
		<DialogContent class="sm:max-w-sm">
			<DialogHeader>
				<DialogTitle>New Sticker Pack</DialogTitle>
				<DialogDescription>
					Group your stickers into a pack.
				</DialogDescription>
			</DialogHeader>

			<div class="space-y-4">
				<div
					v-if="error"
					class="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2"
				>
					{{ error }}
				</div>

				<div class="space-y-2">
					<Label for="pack-name">Pack name</Label>
					<Input
						id="pack-name"
						v-model="name"
						placeholder="My awesome pack"
						@keydown.enter="handleCreate"
					/>
				</div>

				<div class="space-y-2">
					<Label for="pack-desc">Description (optional)</Label>
					<Input
						id="pack-desc"
						v-model="description"
						placeholder="A short description..."
					/>
				</div>

				<!-- Telegram toggle -->
				<div
					class="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-muted/50 transition-colors"
					@click="isTelegram = !isTelegram"
				>
					<div
						class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
						:class="isTelegram ? 'bg-sky-400/10' : 'bg-muted'"
					>
						<Icon
							name="ri:telegram-line"
							class="w-4 h-4"
							:class="
								isTelegram
									? 'text-sky-400'
									: 'text-muted-foreground'
							"
						/>
					</div>
					<div class="flex-1 min-w-0">
						<p class="text-sm font-medium">Telegram Pack</p>
						<p class="text-xs text-muted-foreground">
							Optimized for Telegram (512×512px WebP)
						</p>
					</div>
					<div
						class="w-9 h-5 rounded-full transition-colors duration-150 shrink-0"
						:class="isTelegram ? 'bg-framer-blue' : 'bg-muted'"
					>
						<div
							class="w-4 h-4 rounded-full bg-white mt-0.5 transition-transform duration-150"
							:class="
								isTelegram ? 'translate-x-4' : 'translate-x-0.5'
							"
						/>
					</div>
				</div>

				<div class="flex gap-2 pt-1">
					<Button variant="outline" class="flex-1" @click="close">
						Cancel
					</Button>
					<Button
						class="flex-1"
						:disabled="!name.trim() || isLoading"
						@click="handleCreate"
					>
						<Icon
							v-if="isLoading"
							name="ri:loader-4-line"
							class="w-4 h-4 mr-2 animate-spin"
						/>
						Create Pack
					</Button>
				</div>
			</div>
		</DialogContent>
	</Dialog>
</template>

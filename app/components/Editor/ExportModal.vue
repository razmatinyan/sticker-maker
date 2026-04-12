<script setup lang="ts">
const props = defineProps<{
	open: boolean
	previewUrl: string
	isExporting: boolean
	progress: number
}>()

const emit = defineEmits<{
	'update:open': [value: boolean]
	download: [format: 'png' | 'webp']
	save: [resolve: (id: string | null) => void, reject: (e: any) => void]
}>()

const user = useSupabaseUser()
const format = ref<'png' | 'webp'>('png')
const isSaved = ref(false)
const isSaving = ref(false)
const saveError = ref('')

watch(
	() => props.open,
	val => {
		if (!val) {
			isSaved.value = false
			saveError.value = ''
			isSaving.value = false
			format.value = 'png'
		}
	},
)

function handleDownload() {
	emit('download', format.value)
	emit('update:open', false)
}

async function handleSave() {
	saveError.value = ''
	isSaving.value = true

	try {
		await new Promise<string | null>((resolve, reject) => {
			emit('save', resolve, reject)
		})
		isSaved.value = true
		setTimeout(() => emit('update:open', false), 1500)
	} catch (e: any) {
		saveError.value = e.message ?? 'Save failed'
	} finally {
		isSaving.value = false
	}
}
</script>

<template>
	<Dialog :open="open" @update:open="emit('update:open', $event)">
		<DialogContent class="sm:max-w-md">
			<DialogHeader>
				<DialogTitle>Export Sticker</DialogTitle>
				<DialogDescription class="text-sm text-muted-foreground">
					Download your sticker or save it to your library.
				</DialogDescription>
			</DialogHeader>

			<!-- Preview -->
			<div class="flex justify-center py-2">
				<div
					class="w-32 h-32 rounded-xl overflow-hidden ring-framer bg-muted flex items-center justify-center"
				>
					<img
						v-if="previewUrl"
						:src="previewUrl"
						alt="Sticker preview"
						class="w-full h-full object-contain"
					/>
					<Icon
						v-else
						name="ri:image-line"
						class="w-8 h-8 text-muted-foreground"
					/>
				</div>
			</div>

			<Tabs default-value="download">
				<TabsList class="w-full">
					<TabsTrigger value="download" class="flex-1">
						<Icon
							name="ri:download-line"
							class="w-3.5 h-3.5 mr-1.5"
						/>
						Download
					</TabsTrigger>
					<TabsTrigger value="save" class="flex-1" :disabled="!user">
						<Icon
							name="ri:bookmark-line"
							class="w-3.5 h-3.5 mr-1.5"
						/>
						Save to Library
					</TabsTrigger>
				</TabsList>

				<!-- Download -->
				<TabsContent value="download" class="space-y-4 mt-4">
					<div class="space-y-2">
						<p class="text-xs text-muted-foreground">Format</p>
						<div class="flex gap-2">
							<button
								v-for="f in ['png', 'webp']"
								:key="f"
								class="flex-1 py-2 rounded-lg text-sm border transition-all duration-150"
								:class="
									format === f
										? 'border-framer-blue bg-framer-blue/10 text-framer-blue'
										: 'border-border text-muted-foreground hover:border-muted-foreground'
								"
								@click="format = f as any"
							>
								.{{ f.toUpperCase() }}
							</button>
						</div>
					</div>

					<div
						class="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3"
					>
						<p v-if="format === 'png'">
							PNG — Lossless, transparent background. Best for
							Telegram.
						</p>
						<p v-else>
							WebP — Smaller file size, transparent background.
						</p>
					</div>

					<Button class="w-full" @click="handleDownload">
						<Icon name="ri:download-line" class="w-4 h-4 mr-2" />
						Download .{{ format.toUpperCase() }}
					</Button>
				</TabsContent>

				<!-- Save to library -->
				<TabsContent value="save" class="space-y-4 mt-4">
					<div v-if="!user" class="text-center py-4 space-y-2">
						<Icon
							name="ri:lock-line"
							class="w-8 h-8 text-muted-foreground mx-auto"
						/>
						<p class="text-sm text-muted-foreground">
							Sign in to save stickers
						</p>
						<NuxtLink to="/auth/login">
							<Button variant="outline" size="sm">Sign In</Button>
						</NuxtLink>
					</div>

					<template v-else>
						<!-- Success -->
						<div v-if="isSaved" class="text-center py-4 space-y-2">
							<div
								class="w-10 h-10 rounded-full bg-framer-blue/10 flex items-center justify-center mx-auto"
							>
								<Icon
									name="ri:check-line"
									class="w-5 h-5 text-framer-blue"
								/>
							</div>
							<p class="text-sm font-medium">Saved to library!</p>
						</div>

						<template v-else>
							<!-- Progress bar -->
							<div v-if="isExporting" class="space-y-2">
								<div
									class="h-1.5 bg-muted rounded-full overflow-hidden"
								>
									<div
										class="h-full bg-framer-blue rounded-full transition-all duration-300"
										:style="{ width: `${progress || 10}%` }"
									/>
								</div>
								<p
									class="text-xs text-center text-muted-foreground"
								>
									Uploading...
								</p>
							</div>

							<p
								v-if="saveError"
								class="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2"
							>
								{{ saveError }}
							</p>

							<p class="text-xs text-muted-foreground">
								Saved at 1024×1024px and available in your
								sticker library.
							</p>

							<Button
								class="w-full"
								:disabled="isExporting"
								@click="handleSave"
							>
								<Icon
									name="ri:bookmark-line"
									class="w-4 h-4 mr-2"
								/>
								Save to Library
							</Button>
						</template>
					</template>
				</TabsContent>
			</Tabs>
		</DialogContent>
	</Dialog>
</template>

<script setup lang="ts">
const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{
	'update:open': [value: boolean]
	generated: [dataUrl: string]
}>()

const { isGenerating, error, generateImage } = useAiGeneration()

const prompt = ref('')
const result = ref('')
const suggestions = [
	'A cute cat wearing sunglasses',
	'Pizza slice with a happy face',
	'Rocket ship flying through stars',
	'Kawaii avocado smiling',
	'Fire dragon breathing flames',
	'Cactus wearing a cowboy hat',
]

async function handleGenerate() {
	if (!prompt.value.trim()) return
	error.value = ''
	result.value = ''

	try {
		result.value = await generateImage(prompt.value)
	} catch {}
}

function handleUseImage() {
	if (!result.value) return
	emit('generated', result.value)
	emit('update:open', false)
	prompt.value = ''
	result.value = ''
}

function close() {
	emit('update:open', false)
	prompt.value = ''
	result.value = ''
	error.value = ''
}
</script>

<template>
	<Dialog :open="open" @update:open="close">
		<DialogContent class="sm:max-w-lg">
			<DialogHeader>
				<DialogTitle class="flex items-center gap-2">
					<Icon
						name="ri:sparkling-line"
						class="w-4 h-4 text-amber-400"
					/>
					AI Sticker Generator
				</DialogTitle>
				<DialogDescription>
					Describe your sticker and AI will generate it for you.
				</DialogDescription>
			</DialogHeader>

			<div class="space-y-4">
				<!-- Prompt input -->
				<div class="space-y-2">
					<div class="flex gap-2">
						<Input
							v-model="prompt"
							placeholder="A cute cat wearing sunglasses..."
							class="flex-1"
							:disabled="isGenerating"
							@keydown.enter="handleGenerate"
						/>
						<Button
							:disabled="isGenerating || !prompt.trim()"
							@click="handleGenerate"
						>
							<Icon
								v-if="isGenerating"
								name="ri:loader-4-line"
								class="w-4 h-4 animate-spin"
							/>
							<span v-else>Generate</span>
						</Button>
					</div>

					<!-- Error -->
					<p v-if="error" class="text-xs text-destructive">
						{{ error }}
					</p>
				</div>

				<!-- Suggestions -->
				<div v-if="!result && !isGenerating" class="space-y-2">
					<p class="text-xs text-muted-foreground">Suggestions</p>
					<div class="flex flex-wrap gap-2">
						<button
							v-for="s in suggestions"
							:key="s"
							class="text-xs px-2.5 py-1 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-colors cursor-pointer"
							@click="prompt = s"
						>
							{{ s }}
						</button>
					</div>
				</div>

				<!-- Generating state -->
				<div
					v-if="isGenerating"
					class="flex flex-col items-center gap-3 py-8"
				>
					<div
						class="w-12 h-12 rounded-xl bg-amber-400/10 flex items-center justify-center"
					>
						<Icon
							name="ri:sparkling-line"
							class="w-6 h-6 text-amber-400 animate-pulse"
						/>
					</div>
					<p class="text-sm text-muted-foreground">
						Generating your sticker...
					</p>
					<p class="text-xs text-muted-foreground">
						This takes ~15 seconds
					</p>
				</div>

				<!-- Result -->
				<div v-if="result && !isGenerating" class="space-y-3">
					<div
						class="rounded-xl overflow-hidden bg-muted aspect-square max-w-48 mx-auto"
					>
						<img
							:src="result"
							alt="Generated sticker"
							class="w-full h-full object-contain"
						/>
					</div>

					<div class="flex gap-2">
						<Button
							variant="outline"
							class="flex-1"
							@click="handleGenerate"
						>
							<Icon name="ri:refresh-line" class="w-4 h-4 mr-2" />
							Regenerate
						</Button>
						<Button class="flex-1" @click="handleUseImage">
							<Icon name="ri:check-line" class="w-4 h-4 mr-2" />
							Use This
						</Button>
					</div>
				</div>
			</div>
		</DialogContent>
	</Dialog>
</template>

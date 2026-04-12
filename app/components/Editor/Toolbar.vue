<script setup lang="ts">
const store = useEditorStore()
const { isRemoving, removeBackground } = useBackgroundRemoval()
const emit = defineEmits<{
	upload: [file: File]
	addText: []
	openAi: []
	openExport: []
	imageProcessed: [dataUrl: string]
}>()

const tools = [
	{ id: 'select', icon: 'ri:cursor-line', label: 'Select' },
	{ id: 'draw', icon: 'ri:pencil-line', label: 'Draw' },
	{ id: 'eraser', icon: 'ri:eraser-line', label: 'Eraser' },
]

// File upload trigger
const fileInput = ref<HTMLInputElement>()

function triggerUpload() {
	fileInput.value?.click()
}

function onFileChange(e: Event) {
	const file = (e.target as HTMLInputElement).files?.[0]
	if (file) emit('upload', file)
}

async function handleRemoveBg() {
	// Find the last image layer
	const imageLayer = [...store.layers]
		.reverse()
		.find(l => l.type === 'image') as any

	if (!imageLayer?.imageEl) return

	// Get image as dataUrl from the img element
	const canvas = document.createElement('canvas')
	canvas.width = imageLayer.imageEl.naturalWidth
	canvas.height = imageLayer.imageEl.naturalHeight
	canvas.getContext('2d')?.drawImage(imageLayer.imageEl, 0, 0)
	const dataUrl = canvas.toDataURL('image/png')

	try {
		const result = await removeBackground(dataUrl)
		emit('imageProcessed', result)
	} catch {}
}
</script>

<template>
	<div class="editor-toolbar">
		<!-- Upload -->
		<input
			ref="fileInput"
			type="file"
			accept="image/*"
			class="hidden"
			@change="onFileChange"
		/>
		<Tooltip>
			<TooltipTrigger as-child>
				<button class="toolbar-btn" @click="triggerUpload">
					<Icon name="ri:upload-line" class="w-4 h-4" />
				</button>
			</TooltipTrigger>
			<TooltipContent side="right">Upload Image</TooltipContent>
		</Tooltip>

		<Separator class="my-1" />

		<Tooltip>
			<TooltipTrigger as-child>
				<button
					class="toolbar-btn"
					:disabled="isRemoving"
					@click="handleRemoveBg"
				>
					<Icon
						v-if="isRemoving"
						name="ri:loader-4-line"
						class="w-4 h-4 animate-spin"
					/>
					<Icon v-else name="ri:scissors-cut-line" class="w-4 h-4" />
				</button>
			</TooltipTrigger>
			<TooltipContent side="right">Remove Background</TooltipContent>
		</Tooltip>

		<!-- Draw tools -->
		<Tooltip v-for="tool in tools" :key="tool.id">
			<TooltipTrigger as-child>
				<button
					class="toolbar-btn"
					:class="{
						'toolbar-btn--active': store.activeTool === tool.id,
					}"
					@click="store.activeTool = tool.id as any"
				>
					<Icon :name="tool.icon" class="w-4 h-4" />
				</button>
			</TooltipTrigger>
			<TooltipContent side="right">{{ tool.label }}</TooltipContent>
		</Tooltip>

		<Separator class="my-1" />

		<!-- Text -->
		<Tooltip>
			<TooltipTrigger as-child>
				<button class="toolbar-btn" @click="emit('addText')">
					<Icon name="ri:text" class="w-4 h-4" />
				</button>
			</TooltipTrigger>
			<TooltipContent side="right">Add Text</TooltipContent>
		</Tooltip>

		<!-- AI Generate -->
		<Tooltip>
			<TooltipTrigger as-child>
				<button class="toolbar-btn" @click="emit('openAi')">
					<Icon name="ri:sparkling-line" class="w-4 h-4" />
				</button>
			</TooltipTrigger>
			<TooltipContent side="right">AI Generate</TooltipContent>
		</Tooltip>

		<Separator class="my-1" />

		<!-- Undo / Redo -->
		<Tooltip>
			<TooltipTrigger as-child>
				<button
					class="toolbar-btn"
					:disabled="!store.canUndo"
					@click="store.undo()"
				>
					<Icon name="ri:arrow-go-back-line" class="w-4 h-4" />
				</button>
			</TooltipTrigger>
			<TooltipContent side="right">Undo</TooltipContent>
		</Tooltip>

		<Tooltip>
			<TooltipTrigger as-child>
				<button
					class="toolbar-btn"
					:disabled="!store.canRedo"
					@click="store.redo()"
				>
					<Icon name="ri:arrow-go-forward-line" class="w-4 h-4" />
				</button>
			</TooltipTrigger>
			<TooltipContent side="right">Redo</TooltipContent>
		</Tooltip>

		<Separator class="my-1" />

		<!-- Clear -->
		<Tooltip>
			<TooltipTrigger as-child>
				<button
					class="toolbar-btn text-destructive hover:bg-destructive/10"
					@click="store.clearCanvas()"
				>
					<Icon name="ri:delete-bin-line" class="w-4 h-4" />
				</button>
			</TooltipTrigger>
			<TooltipContent side="right">Clear Canvas</TooltipContent>
		</Tooltip>

		<!-- Spacer -->
		<div class="flex-1" />

		<!-- Export -->
		<Tooltip>
			<TooltipTrigger as-child>
				<button
					class="toolbar-btn toolbar-btn--export"
					@click="emit('openExport')"
				>
					<Icon name="ri:download-line" class="w-4 h-4" />
				</button>
			</TooltipTrigger>
			<TooltipContent side="right">Export</TooltipContent>
		</Tooltip>
	</div>
</template>

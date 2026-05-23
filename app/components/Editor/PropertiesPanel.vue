<script setup lang="ts">
const store = useEditorStore()

const selectedLayer = computed(() =>
	store.layers.find(l => l.id === store.selectedId),
)

const selectedTextLayer = computed(() =>
	selectedLayer.value?.type === 'text' ? selectedLayer.value : null,
)

// Reversed layers for display (top layer first)
const displayLayers = computed(() => [...store.layers].reverse())

// Live-update text as user types
function updateText(e: Event) {
	if (!selectedTextLayer.value) return
	store.updateLayer(selectedTextLayer.value.id, {
		text: (e.target as HTMLInputElement).value,
	} as any)
}

function updateFontSize(e: Event) {
	if (!selectedTextLayer.value) return
	store.updateLayer(selectedTextLayer.value.id, {
		fontSize: Number((e.target as HTMLInputElement).value),
	} as any)
}

function updateFill(e: Event) {
	if (!selectedTextLayer.value) return
	store.updateLayer(selectedTextLayer.value.id, {
		fill: (e.target as HTMLInputElement).value,
	} as any)
}

function toggleBold() {
	if (!selectedTextLayer.value) return
	const current = selectedTextLayer.value.fontStyle ?? 'normal'
	const isBold = current.includes('bold')
	const isItalic = current.includes('italic')
	const newStyle =
		[!isBold ? 'bold' : '', isItalic ? 'italic' : '']
			.filter(Boolean)
			.join(' ') || 'normal'
	store.updateLayer(selectedTextLayer.value.id, {
		fontStyle: newStyle,
	} as any)
}

function toggleItalic() {
	if (!selectedTextLayer.value) return
	const current = selectedTextLayer.value.fontStyle ?? 'normal'
	const isBold = current.includes('bold')
	const isItalic = current.includes('italic')
	const newStyle =
		[isBold ? 'bold' : '', !isItalic ? 'italic' : '']
			.filter(Boolean)
			.join(' ') || 'normal'
	store.updateLayer(selectedTextLayer.value.id, {
		fontStyle: newStyle,
	} as any)
}

function getLayerIcon(type: string) {
	if (type === 'image') return 'ri:image-line'
	if (type === 'text') return 'ri:text'
	if (type === 'line') return 'ri:pencil-line'
	return 'ri:shape-line'
}

function getLayerLabel(layer: any) {
	if (layer.type === 'text') return layer.text?.slice(0, 16) || 'Text'
	if (layer.type === 'image') return 'Image'
	if (layer.type === 'line') return 'Drawing'
	return 'Layer'
}
</script>

<template>
	<div class="properties-panel">
		<!-- ── Selected text layer properties ─────────────── -->
		<template v-if="selectedTextLayer">
			<p class="panel-label">Text Properties</p>

			<div class="space-y-3">
				<!-- Text content -->
				<div class="space-y-1.5">
					<p class="text-xs text-muted-foreground">Content</p>
					<textarea
						:value="selectedTextLayer.text"
						rows="3"
						class="w-full text-sm bg-muted rounded-md px-2 py-1.5 border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-accent-violet/50 resize-none"
						@input="updateText"
					/>
				</div>

				<!-- Font size -->
				<div class="space-y-1.5">
					<p class="text-xs text-muted-foreground">
						Size — {{ selectedTextLayer.fontSize }}px
					</p>
					<input
						:value="selectedTextLayer.fontSize"
						type="range"
						min="10"
						max="120"
						class="w-full accent-violet-500"
						@input="updateFontSize"
					/>
				</div>

				<!-- Color -->
				<div class="space-y-1.5">
					<p class="text-xs text-muted-foreground">Color</p>
					<input
						:value="selectedTextLayer.fill"
						type="color"
						class="w-full h-8 rounded-md cursor-pointer bg-transparent border border-border"
						@input="updateFill"
					/>
				</div>

				<!-- Bold / Italic -->
				<div class="space-y-1.5">
					<p class="text-xs text-muted-foreground">Style</p>
					<div class="flex gap-2">
						<button
							class="toolbar-btn flex-1"
							:class="{
								'toolbar-btn--active':
									selectedTextLayer.fontStyle?.includes(
										'bold',
									),
							}"
							@click="toggleBold"
						>
							<Icon name="ri:bold" class="w-4 h-4" />
						</button>
						<button
							class="toolbar-btn flex-1"
							:class="{
								'toolbar-btn--active':
									selectedTextLayer.fontStyle?.includes(
										'italic',
									),
							}"
							@click="toggleItalic"
						>
							<Icon name="ri:italic" class="w-4 h-4" />
						</button>
					</div>
				</div>
			</div>
		</template>

		<!-- ── Selected IMAGE layer ──────────────────────── -->
		<template v-else-if="selectedLayer?.type === 'image'">
			<p class="panel-label">Image</p>
			<p class="text-xs text-muted-foreground px-1 leading-relaxed">
				Drag to move. Use handles to resize or rotate.
			</p>
		</template>

		<!-- ── Draw settings (no selection) ──────────────── -->
		<template v-else-if="store.activeTool === 'draw'">
			<p class="panel-label">Brush</p>
			<div class="space-y-3">
				<div class="space-y-1.5">
					<p class="text-xs text-muted-foreground">Color</p>
					<input
						v-model="store.drawColor"
						type="color"
						class="w-full h-8 rounded-md cursor-pointer bg-transparent border border-border"
					/>
				</div>
				<div class="space-y-1.5">
					<p class="text-xs text-muted-foreground">
						Size — {{ store.drawSize }}px
					</p>
					<input
						v-model="store.drawSize"
						type="range"
						min="1"
						max="50"
						class="w-full accent-violet-500"
					/>
				</div>
			</div>
		</template>

		<!-- ── Eraser settings ──────────────────────────── -->
		<template v-else-if="store.activeTool === 'eraser'">
			<p class="panel-label">Eraser</p>
			<div class="space-y-3">
				<div class="space-y-1.5">
					<p class="text-xs text-muted-foreground">
						Size — {{ store.drawSize }}px
					</p>
					<input
						v-model="store.drawSize"
						type="range"
						min="1"
						max="50"
						class="w-full accent-violet-500"
					/>
				</div>
			</div>
		</template>

		<!-- ── No selection / default ──────────────────── -->
		<template v-else>
			<p class="panel-label">Properties</p>
			<p class="text-xs text-muted-foreground px-1 leading-relaxed">
				Select a layer or choose a tool to see its options.
			</p>
		</template>

		<!-- ── Delete selected layer (one button, only when selected) -->
		<template v-if="selectedLayer">
			<Separator class="my-3" />
			<button
				class="toolbar-btn w-full text-destructive hover:bg-destructive/10 text-xs gap-2"
				@click="store.removeLayer(selectedLayer.id)"
			>
				<Icon name="ri:delete-bin-line" class="w-3.5 h-3.5" />
				Delete Layer
			</button>
		</template>

		<!-- ── Layers list ──────────────────────────────── -->
		<Separator class="my-4" />
		<p class="panel-label">Layers</p>

		<div v-if="displayLayers.length === 0" class="px-1">
			<p class="text-xs text-muted-foreground leading-relaxed">
				No layers yet. Upload an image, add text, or draw.
			</p>
		</div>

		<div v-else class="flex flex-col gap-0.5">
			<button
				v-for="layer in displayLayers"
				:key="layer.id"
				class="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-all duration-150 w-full text-left"
				:class="
					store.selectedId === layer.id
						? 'bg-white/8 text-foreground'
						: 'text-muted-foreground hover:bg-white/4 hover:text-foreground'
				"
				@click="store.selectedId = layer.id"
			>
				<Icon
					:name="getLayerIcon(layer.type)"
					class="w-3.5 h-3.5 shrink-0"
				/>
				<span class="truncate">{{ getLayerLabel(layer) }}</span>
			</button>
		</div>
	</div>
</template>

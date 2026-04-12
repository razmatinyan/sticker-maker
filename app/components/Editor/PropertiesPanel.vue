<script setup lang="ts">
const store = useEditorStore()

const selectedLayer = computed(() =>
	store.layers.find(l => l.id === store.selectedId),
)

const selectedTextLayer = computed(() =>
	selectedLayer.value?.type === 'text' ? selectedLayer.value : null,
)

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
</script>

<template>
	<div class="properties-panel">
		<!-- ── Selected text layer ────────────────────────────── -->
		<template v-if="selectedTextLayer">
			<p class="panel-label">Text</p>

			<div class="space-y-3">
				<!-- Text content -->
				<div class="space-y-1.5">
					<p class="text-xs text-muted-foreground">Content</p>
					<textarea
						:value="selectedTextLayer.text"
						rows="3"
						class="w-full text-sm bg-muted rounded-md px-2 py-1.5 border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-framer-blue/50 resize-none"
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
						class="w-full accent-framer-blue"
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

			<Separator class="my-3" />

			<!-- Delete layer -->
			<button
				class="toolbar-btn w-full text-destructive hover:bg-destructive/10 text-xs gap-2"
				@click="store.removeLayer(selectedTextLayer.id)"
			>
				<Icon name="ri:delete-bin-line" class="w-3.5 h-3.5" />
				Delete Layer
			</button>
		</template>

		<!-- ── Selected IMAGE layer ──────────────────────────── -->
		<template v-else-if="selectedLayer?.type === 'image'">
			<p class="panel-label">Image</p>
			<p class="text-xs text-muted-foreground px-1 leading-relaxed">
				Drag to move. Use handles to resize or rotate.
			</p>
		</template>

		<!-- ── Draw settings (no selection) ──────────────────── -->
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
						class="w-full accent-framer-blue"
					/>
				</div>
			</div>
		</template>

		<!-- ── No selection ───────────────────────────────────── -->
		<template v-else>
			<p class="panel-label">Properties</p>
			<p class="text-xs text-muted-foreground px-1 leading-relaxed">
				Click a text layer to edit it, or select a tool to see its
				options.
			</p>
		</template>

		<!-- ── Delete button — shown for ANY selected layer ───── -->
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
	</div>
</template>

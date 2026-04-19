<script setup lang="ts">
definePageMeta({
	layout: 'editor',
})

useHead({ title: 'Editor — Stickr' })

const store = useEditorStore()
const {
	stageRef,
	loadImageToCanvas,
	addTextLayer,
	handleDrawStart,
	handleDrawMove,
	handleDrawEnd,
	exportCanvas,
	handleStageClick,
} = useCanvas()

function loadFromDataUrl(dataUrl: string) {
	const img = new window.Image()
	img.onload = () => {
		const scale = Math.min(
			store.canvasSize.width / img.width,
			store.canvasSize.height / img.height,
		)
		store.addLayer({
			id: crypto.randomUUID(),
			type: 'image',
			x: (store.canvasSize.width - img.width * scale) / 2,
			y: (store.canvasSize.height - img.height * scale) / 2,
			width: img.width * scale,
			height: img.height * scale,
			draggable: true,
			imageEl: img,
		})
	}
	img.src = dataUrl
}

const transformerRef = ref()

function onTransformEnd(e: any) {
	const node = e.target
	store.updateLayer(node.id(), {
		x: node.x(),
		y: node.y(),
		scaleX: node.scaleX(),
		scaleY: node.scaleY(),
		rotation: node.rotation(),
	} as any)
}

function exportWithoutTransformer(callback: (stage: any) => void) {
	const stage = stageRef.value?.getNode()
	const transformer = transformerRef.value?.getNode()
	if (!stage) return

	// Step 1 — hide transformer
	const previousNodes = transformer?.nodes() ?? []
	transformer?.nodes([])
	transformer?.getLayer()?.batchDraw()

	// Step 2 — export (transformer is now hidden)
	callback(stage)

	// Step 3 — restore transformer
	if (previousNodes.length) {
		transformer?.nodes(previousNodes)
		transformer?.getLayer()?.batchDraw()
	}
}

// Update transformer whenever selection changes
watch(
	() => store.selectedId,
	newId => {
		if (!import.meta.client) return
		nextTick(() => {
			const transformer = transformerRef.value?.getNode() // ← getNode()
			if (!transformer) return

			if (!newId) {
				transformer.nodes([])
				transformer.getLayer()?.batchDraw()
				return
			}

			const stage = stageRef.value?.getNode() // ← getNode()
			const node = stage?.findOne(`#${newId}`)
			if (node) {
				transformer.nodes([node])
				transformer.getLayer()?.batchDraw()
			}
		})
	},
)

const showExportModal = ref(false)
const showAiModal = ref(false)

// Cursor style based on active tool
const canvasCursor = computed(() => {
	if (store.activeTool === 'draw') return 'crosshair'
	if (store.activeTool === 'eraser') return 'cell'
	return 'default'
})

const previewDataUrl = ref('')

const { isExporting, progress, exportPackAsZip } = useExport()
const supabase = useSupabaseClient()
const user = useSupabaseUser()

// Generate preview when modal opens
function openExportModal() {
	exportWithoutTransformer(stage => {
		previewDataUrl.value = stage.toDataURL({
			mimeType: 'image/png',
			pixelRatio: 1,
		})
	})
	showExportModal.value = true
}

// Download file
function handleDownload(format: 'png' | 'webp') {
	exportWithoutTransformer(stage => {
		const dataUrl = stage.toDataURL({
			mimeType: `image/${format}`,
			pixelRatio: 2,
		})
		const link = document.createElement('a')
		link.href = dataUrl
		link.download = `sticker-${Date.now()}.${format}`
		link.click()
	})
}

// Save to Supabase
async function handleSaveToLibrary(packId?: string): Promise<string | null> {
	if (!user.value) return null

	const userId = getUserId(user.value)
	if (!userId) throw new Error('Not authenticated')

	let mainDataUrl = ''
	let thumbDataUrl = ''

	exportWithoutTransformer(stage => {
		mainDataUrl = stage.toDataURL({ mimeType: 'image/png', pixelRatio: 2 })
		thumbDataUrl = stage.toDataURL({
			mimeType: 'image/webp',
			pixelRatio: 0.25,
		})
	})

	if (!mainDataUrl) throw new Error('Canvas is empty')

	const toBlob = (url: string, mime: string) => {
		const binary = atob(url.split(',')[1])
		const arr = new Uint8Array(binary.length)
		for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i)
		return new Blob([arr], { type: mime })
	}

	const stickerId = crypto.randomUUID()
	const filePath = `${userId}/${stickerId}.png`
	const thumbPath = `${userId}/${stickerId}_thumb.webp`

	const { error: uploadError } = await supabase.storage
		.from('stickers')
		.upload(filePath, toBlob(mainDataUrl, 'image/png'), {
			contentType: 'image/png',
		})

	if (uploadError) throw uploadError

	await supabase.storage
		.from('thumbnails')
		.upload(thumbPath, toBlob(thumbDataUrl, 'image/webp'), {
			contentType: 'image/webp',
		})

	const { data: stickerPublicUrl } = supabase.storage
		.from('stickers')
		.getPublicUrl(filePath)

	const { data: thumbPublicUrl } = supabase.storage
		.from('thumbnails')
		.getPublicUrl(thumbPath)

	const { data, error: dbError } = await supabase
		.from('stickers')
		.insert({
			user_id: userId,
			pack_id: packId ?? null, // ← assign to pack
			processed_path: stickerPublicUrl.publicUrl,
			thumbnail_path: thumbPublicUrl.publicUrl,
			source: 'upload',
			width: 512,
			height: 512,
		})
		.select()
		.single()

	if (dbError) throw dbError
	return data.id
}

async function onSaveRequested(
	packId: string | null,
	resolve: (id: string | null) => void,
	reject: (e: any) => void,
) {
	try {
		const id = await handleSaveToLibrary(packId ?? undefined)
		resolve(id)
	} catch (e) {
		reject(e)
	}
}

const userPacks = ref<any[]>([])
const selectedPackId = ref<string | null>(null)

async function fetchPacks() {
	const userId = getUserId(user.value)
	if (!userId) return

	const { data } = await supabase
		.from('sticker_packs')
		.select('id, name')
		.eq('user_id', userId)
		.order('created_at', { ascending: false })

	userPacks.value = data ?? []
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
	<div class="editor-layout">
		<!-- Toolbar (left) -->
		<TooltipProvider>
			<EditorToolbar
				@upload="loadImageToCanvas"
				@add-text="addTextLayer"
				@open-ai="showAiModal = true"
				@open-export="showExportModal = true"
				@image-processed="loadFromDataUrl"
			/>
		</TooltipProvider>

		<!-- Canvas (center) -->
		<div class="editor-canvas-area">
			<div class="editor-canvas-wrapper">
				<!-- Canvas label -->
				<p class="text-xs text-muted-foreground mb-2 text-center">
					512 × 512
				</p>

				<!-- Konva stage — client only to avoid SSR issues -->
				<ClientOnly>
					<div
						class="editor-canvas-frame"
						:style="{ cursor: canvasCursor }"
					>
						<v-stage
							ref="stageRef"
							:config="store.canvasSize"
							@mousedown="handleDrawStart"
							@mousemove="handleDrawMove"
							@mouseup="handleDrawEnd"
							@click="handleStageClick"
						>
							<v-layer>
								<template
									v-for="layer in store.layers"
									:key="layer.id"
								>
									<v-image
										v-if="layer.type === 'image'"
										:config="{
											id: layer.id,
											x: layer.x,
											y: layer.y,
											width: layer.width,
											height: layer.height,
											image: layer.imageEl,
											draggable:
												store.activeTool === 'select',
											scaleX: layer.scaleX ?? 1,
											scaleY: layer.scaleY ?? 1,
											rotation: layer.rotation ?? 0,
										}"
										@click="store.selectedId = layer.id"
										@dragend="
											store.updateLayer(layer.id, {
												x: $event.target.x(),
												y: $event.target.y(),
											})
										"
									/>

									<v-text
										v-else-if="layer.type === 'text'"
										:config="{
											id: layer.id,
											x: layer.x,
											y: layer.y,
											text: layer.text,
											fontSize: layer.fontSize,
											fill: layer.fill,
											fontStyle: layer.fontStyle,
											draggable:
												store.activeTool === 'select',
											scaleX: layer.scaleX ?? 1,
											scaleY: layer.scaleY ?? 1,
											rotation: layer.rotation ?? 0,
										}"
										@click="store.selectedId = layer.id"
										@dragend="
											store.updateLayer(layer.id, {
												x: $event.target.x(),
												y: $event.target.y(),
											})
										"
									/>

									<v-line
										v-else-if="layer.type === 'line'"
										:config="{
											id: layer.id,
											points: layer.points,
											stroke: layer.stroke,
											strokeWidth: layer.strokeWidth,
											lineCap: layer.lineCap,
											lineJoin: layer.lineJoin,
											tension: layer.tension,
											globalCompositeOperation:
												layer.globalCompositeOperation,
										}"
									/>
								</template>

								<!-- Transformer in SAME layer as content -->
								<v-transformer
									ref="transformerRef"
									:config="{
										rotateEnabled: true,
										borderStroke: 'rgba(0, 153, 255, 0.8)',
										borderStrokeWidth: 1,
										anchorFill: '#0099ff',
										anchorStroke: '#ffffff',
										anchorStrokeWidth: 1,
										anchorSize: 8,
										anchorCornerRadius: 2,
										rotateAnchorOffset: 20,
										padding: 4,
										keepRatio: true,
									}"
									@transformend="onTransformEnd"
								/>
							</v-layer>
						</v-stage>
					</div>

					<template #fallback>
						<div
							class="editor-canvas-frame flex items-center justify-center"
						>
							<p class="text-muted-foreground text-sm">
								Loading canvas...
							</p>
						</div>
					</template>
				</ClientOnly>
			</div>
		</div>

		<!-- Properties panel (right) -->
		<EditorPropertiesPanel />

		<!-- Export Modal (Step 9) -->
		<EditorExportModal
			v-model:open="showExportModal"
			:preview-url="previewDataUrl"
			:is-exporting="isExporting"
			:progress="progress"
			:packs="userPacks"
			:selected-pack-id="selectedPackId"
			@update:selected-pack-id="selectedPackId = $event"
			@download="handleDownload"
			@save="onSaveRequested"
		/>

		<!-- AI Modal (Step 10) -->
		<EditorAiModal
			v-model:open="showAiModal"
			@generated="loadFromDataUrl"
		/>
	</div>
</template>

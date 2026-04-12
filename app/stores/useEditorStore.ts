import { defineStore } from 'pinia'

export type ToolType = 'select' | 'draw' | 'text' | 'eraser'

export interface TextLayer {
	id: string
	type: 'text'
	text: string
	x: number
	y: number
	fontSize: number
	fill: string
	fontStyle: string
	draggable: boolean
	scaleX?: number
	scaleY?: number
	rotation?: number
}

export interface ImageLayer {
	id: string
	type: 'image'
	x: number
	y: number
	width: number
	height: number
	draggable: boolean
	imageEl?: HTMLImageElement
	scaleX?: number
	scaleY?: number
	rotation?: number
}

export interface DrawLayer {
	id: string
	type: 'line'
	points: number[]
	stroke: string
	strokeWidth: number
	lineCap: string
	lineJoin: string
	tension: number
	globalCompositeOperation: string
}

export type Layer = TextLayer | ImageLayer | DrawLayer

export const useEditorStore = defineStore('editor', () => {
	const layers = ref<Layer[]>([])
	const selectedId = ref<string | null>(null)
	const activeTool = ref<ToolType>('select')
	const canvasSize = ref({ width: 512, height: 512 })
	const drawColor = ref('#ffffff')
	const drawSize = ref(8)
	const isDrawing = ref(false)
	const textColor = ref('#ffffff')
	const textSize = ref(32)
	const textBold = ref(false)
	const textItalic = ref(false)
	const history = ref<Layer[][]>([])
	const historyIndex = ref(-1)

	// ── Image element cache — never serialized ────────────────
	const imageCache = new Map<string, HTMLImageElement>()

	function setImageEl(id: string, el: HTMLImageElement) {
		imageCache.set(id, el)
	}

	function getImageEl(id: string): HTMLImageElement | undefined {
		return imageCache.get(id)
	}

	// ── Restore imageEl refs after undo/redo ──────────────────
	function restoreImageRefs(restoredLayers: Layer[]): Layer[] {
		return restoredLayers.map(layer => {
			if (layer.type === 'image') {
				return {
					...layer,
					imageEl: imageCache.get(layer.id),
				}
			}
			return layer
		})
	}

	function addLayer(layer: Layer) {
		saveHistory()

		// Cache imageEl before storing
		if (layer.type === 'image' && layer.imageEl) {
			imageCache.set(layer.id, layer.imageEl)
		}

		layers.value.push(layer)
		selectedId.value = layer.id
	}

	function updateLayer(id: string, attrs: Partial<Layer>) {
		const idx = layers.value.findIndex(l => l.id === id)
		if (idx !== -1) {
			// Cache imageEl if being updated
			if ((attrs as any).imageEl) {
				imageCache.set(id, (attrs as any).imageEl)
			}
			layers.value[idx] = { ...layers.value[idx], ...attrs } as Layer
		}
	}

	function removeLayer(id: string) {
		saveHistory()
		layers.value = layers.value.filter(l => l.id !== id)
		selectedId.value = null
		// Keep imageCache entry — needed if user undoes the delete
	}

	function clearCanvas() {
		saveHistory()
		layers.value = []
		selectedId.value = null
	}

	function saveHistory() {
		// Strip imageEl before serializing — it can't be JSON stringified
		const serializable = layers.value.map(layer => {
			if (layer.type === 'image') {
				const { imageEl, ...rest } = layer as ImageLayer
				return rest
			}
			return layer
		})

		history.value = history.value.slice(0, historyIndex.value + 1)
		history.value.push(JSON.parse(JSON.stringify(serializable)))
		historyIndex.value = history.value.length - 1
	}

	function undo() {
		if (historyIndex.value <= 0) return
		historyIndex.value--
		const restored = JSON.parse(
			JSON.stringify(history.value[historyIndex.value]),
		)
		layers.value = restoreImageRefs(restored)
	}

	function redo() {
		if (historyIndex.value >= history.value.length - 1) return
		historyIndex.value++
		const restored = JSON.parse(
			JSON.stringify(history.value[historyIndex.value]),
		)
		layers.value = restoreImageRefs(restored)
	}

	const canUndo = computed(() => historyIndex.value > 0)
	const canRedo = computed(
		() => historyIndex.value < history.value.length - 1,
	)

	return {
		layers,
		selectedId,
		activeTool,
		canvasSize,
		drawColor,
		drawSize,
		isDrawing,
		textColor,
		textSize,
		textBold,
		textItalic,
		history,
		historyIndex,
		canUndo,
		canRedo,
		imageCache,
		setImageEl,
		getImageEl,
		addLayer,
		updateLayer,
		removeLayer,
		clearCanvas,
		saveHistory,
		undo,
		redo,
	}
})

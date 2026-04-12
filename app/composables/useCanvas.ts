import type { KonvaEventObject } from 'konva/lib/Node'

export function useCanvas() {
	const store = useEditorStore()
	const stageRef = ref()

	// ── Upload image to canvas ────────────────────────────────
	function loadImageToCanvas(file: File) {
		const reader = new FileReader()
		reader.onload = e => {
			const img = new window.Image()
			img.onload = () => {
				// Scale image to fit canvas while maintaining ratio
				const scale = Math.min(
					store.canvasSize.width / img.width,
					store.canvasSize.height / img.height,
				)
				const w = img.width * scale
				const h = img.height * scale

				store.addLayer({
					id: crypto.randomUUID(),
					type: 'image',
					x: (store.canvasSize.width - w) / 2,
					y: (store.canvasSize.height - h) / 2,
					width: w,
					height: h,
					draggable: true,
					imageEl: img,
				})
			}
			img.src = e.target?.result as string
		}
		reader.readAsDataURL(file)
	}

	// ── Add text layer ────────────────────────────────────────
	function addTextLayer() {
		store.addLayer({
			id: crypto.randomUUID(),
			type: 'text',
			text: 'Edit me',
			x: store.canvasSize.width / 2 - 60,
			y: store.canvasSize.height / 2 - 20,
			fontSize: store.textSize,
			fill: store.textColor,
			fontStyle:
				[store.textBold ? 'bold' : '', store.textItalic ? 'italic' : '']
					.filter(Boolean)
					.join(' ') || 'normal',
			draggable: true,
		})
	}

	// ── Draw tool handlers ────────────────────────────────────
	function handleDrawStart(e: KonvaEventObject<MouseEvent | TouchEvent>) {
		if (store.activeTool !== 'draw' && store.activeTool !== 'eraser') return
		store.isDrawing = true

		const pos = e.target.getStage()?.getPointerPosition()
		if (!pos) return

		store.addLayer({
			id: crypto.randomUUID(),
			type: 'line',
			points: [pos.x, pos.y],
			stroke: store.activeTool === 'eraser' ? '#000000' : store.drawColor,
			strokeWidth: store.drawSize,
			lineCap: 'round',
			lineJoin: 'round',
			tension: 0.5,
			globalCompositeOperation:
				store.activeTool === 'eraser'
					? 'destination-out'
					: 'source-over',
		})
	}

	function handleDrawMove(e: KonvaEventObject<MouseEvent | TouchEvent>) {
		if (!store.isDrawing) return

		const pos = e.target.getStage()?.getPointerPosition()
		if (!pos) return

		const last = store.layers[store.layers.length - 1]
		if (last?.type !== 'line') return

		store.updateLayer(last.id, {
			points: [...(last as any).points, pos.x, pos.y],
		})
	}

	function handleDrawEnd() {
		store.isDrawing = false
	}

	// ── Export canvas as base64 ───────────────────────────────
	function exportCanvas(format: 'png' | 'webp' = 'png'): string {
		const stage = stageRef.value?.getStage()
		if (!stage) return ''
		return stage.toDataURL({ mimeType: `image/${format}`, pixelRatio: 2 })
	}

	// ── Deselect on empty click ───────────────────────────────
	function handleStageClick(e: KonvaEventObject<MouseEvent>) {
		// Deselect if clicking empty canvas or in draw mode
		if (
			e.target === e.target.getStage() ||
			store.activeTool === 'draw' ||
			store.activeTool === 'eraser'
		) {
			store.selectedId = null
		}
	}

	return {
		stageRef,
		loadImageToCanvas,
		addTextLayer,
		handleDrawStart,
		handleDrawMove,
		handleDrawEnd,
		exportCanvas,
		handleStageClick,
	}
}

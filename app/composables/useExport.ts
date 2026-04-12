import JSZip from 'jszip'
import { saveAs } from 'file-saver'

export function useExport() {
	const supabase = useSupabaseClient()
	const user = useSupabaseUser()
	const isExporting = ref(false)
	const progress = ref(0)

	// ── Single sticker export ─────────────────────────────────
	async function exportSingle(
		stageRef: any,
		format: 'png' | 'webp' = 'png',
		save = true,
	): Promise<string> {
		const stage = stageRef.value?.getStage()
		if (!stage) throw new Error('Canvas not ready')

		const dataUrl = stage.toDataURL({
			mimeType: `image/${format}`,
			pixelRatio: 2, // Export at 2x for crisp quality
		})

		if (save) {
			saveAs(dataUrl, `sticker-${Date.now()}.${format}`)
		}

		return dataUrl
	}

	// ── Save sticker to Supabase ──────────────────────────────
	async function saveToSupabase(
		stageRef: any,
		packId?: string,
	): Promise<string | null> {
		const userId = getUserId(user.value)
		if (!userId) return null

		const stage = stageRef.value?.getStage()
		if (!stage) return null

		isExporting.value = true

		try {
			// Get canvas as blob
			const dataUrl = stage.toDataURL({
				mimeType: 'image/png',
				pixelRatio: 2,
			})
			const blob = dataUrlToBlob(dataUrl)
			const stickerId = crypto.randomUUID()
			const filePath = `${userId}/${stickerId}.png`
			const thumbPath = `${userId}/${stickerId}_thumb.webp`

			// Upload processed sticker
			const { error: uploadError } = await supabase.storage
				.from('stickers')
				.upload(filePath, blob, { contentType: 'image/png' })

			if (uploadError) throw uploadError

			// Upload thumbnail (smaller version)
			const thumbDataUrl = stage.toDataURL({
				mimeType: 'image/webp',
				pixelRatio: 0.25, // 25% size for thumbnail
			})
			const thumbBlob = dataUrlToBlob(thumbDataUrl)

			await supabase.storage
				.from('thumbnails')
				.upload(thumbPath, thumbBlob, { contentType: 'image/webp' })

			// Get public URLs
			const { data: stickerUrl } = supabase.storage
				.from('stickers')
				.getPublicUrl(filePath)

			const { data: thumbUrl } = supabase.storage
				.from('thumbnails')
				.getPublicUrl(thumbPath)

			// Save sticker record to database
			const { data, error: dbError } = await supabase
				.from('stickers')
				.insert({
					user_id: userId,
					pack_id: packId ?? null,
					processed_path: stickerUrl.publicUrl,
					thumbnail_path: thumbUrl.publicUrl,
					source: 'upload',
					width: 512,
					height: 512,
				})
				.select()
				.single()

			if (dbError) throw dbError
			return data.id
		} finally {
			isExporting.value = false
		}
	}

	// ── Export pack as ZIP ────────────────────────────────────
	async function exportPackAsZip(stickers: any[], packName = 'sticker-pack') {
		isExporting.value = true
		progress.value = 0

		try {
			const zip = new JSZip()
			const total = stickers.length

			for (const [i, sticker] of stickers.entries()) {
				const url = sticker.processed_path
				const response = await fetch(url)
				const blob = await response.blob()
				const ext = blob.type.includes('webp') ? 'webp' : 'png'

				zip.file(`sticker-${i + 1}.${ext}`, blob)
				progress.value = Math.round(((i + 1) / total) * 100)
			}

			const content = await zip.generateAsync({ type: 'blob' })
			saveAs(content, `${packName}.zip`)
		} finally {
			isExporting.value = false
			progress.value = 0
		}
	}

	// ── Helper ────────────────────────────────────────────────
	function dataUrlToBlob(dataUrl: string): Blob {
		const [header, data] = dataUrl.split(',')
		const mime = header?.match(/:(.*?);/)?.[1] ?? 'image/png'
		const binary = atob(data || '')
		const array = new Uint8Array(binary.length)
		for (let i = 0; i < binary.length; i++) {
			array[i] = binary.charCodeAt(i)
		}
		return new Blob([array], { type: mime })
	}

	return {
		isExporting,
		progress,
		exportSingle,
		saveToSupabase,
		exportPackAsZip,
	}
}

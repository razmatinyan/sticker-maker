export function useBackgroundRemoval() {
	const isRemoving = ref(false)
	const error = ref('')

	async function removeBackground(imageDataUrl: string): Promise<string> {
		isRemoving.value = true
		error.value = ''

		try {
			// Convert base64 dataUrl to blob
			const blob = dataUrlToBlob(imageDataUrl)
			const formData = new FormData()
			formData.append('image', blob, 'image.png')

			const response = await $fetch<{ image: string }>(
				'/api/remove-background',
				{
					method: 'POST',
					body: formData,
				},
			)

			return response.image
		} catch (e: any) {
			error.value =
				e.data?.message ?? e.message ?? 'Background removal failed'
			throw e
		} finally {
			isRemoving.value = false
		}
	}

	function dataUrlToBlob(dataUrl: string): Blob {
		const [header, data] = dataUrl.split(',')
		const mime = header.match(/:(.*?);/)?.[1] ?? 'image/png'
		const binary = atob(data)
		const array = new Uint8Array(binary.length)
		for (let i = 0; i < binary.length; i++) {
			array[i] = binary.charCodeAt(i)
		}
		return new Blob([array], { type: mime })
	}

	return { isRemoving, error, removeBackground }
}

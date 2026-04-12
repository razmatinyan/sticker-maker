export function useAiGeneration() {
	const isGenerating = ref(false)
	const error = ref('')

	async function generateImage(prompt: string): Promise<string> {
		if (!prompt.trim()) throw new Error('Prompt is required')

		isGenerating.value = true
		error.value = ''

		try {
			const response = await $fetch<{ image: string }>(
				'/api/ai-generate',
				{
					method: 'POST',
					body: { prompt },
				},
			)

			return response.image
		} catch (e: any) {
			error.value = e.data?.message ?? e.message ?? 'Generation failed'
			throw e
		} finally {
			isGenerating.value = false
		}
	}

	return { isGenerating, error, generateImage }
}

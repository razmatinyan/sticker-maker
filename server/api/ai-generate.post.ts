export default defineEventHandler(async event => {
	const config = useRuntimeConfig()
	const body = await readBody(event)

	if (!body.prompt?.trim()) {
		throw createError({ statusCode: 400, message: 'Prompt is required' })
	}

	// Enhance prompt for sticker style automatically
	const enhancedPrompt = `${body.prompt.trim()}, sticker art style, clean white background, bold outlines, vibrant colors, cute, high quality`

	const response = await fetch(
		'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
				Authorization: `Bearer ${config.stabilityApiKey}`,
			},
			body: JSON.stringify({
				text_prompts: [
					{ text: enhancedPrompt, weight: 1 },
					{ text: 'blurry, ugly, text, watermark', weight: -1 }, // negative prompt
				],
				cfg_scale: 7,
				height: 1024,
				width: 1024,
				samples: 1,
				steps: 30,
			}),
		},
	)

	if (!response.ok) {
		const error = await response.text()
		throw createError({
			statusCode: response.status,
			message: `AI generation failed: ${error}`,
		})
	}

	const data = await response.json()
	const image = data.artifacts?.[0]

	if (!image) {
		throw createError({ statusCode: 500, message: 'No image returned' })
	}

	return {
		image: `data:image/png;base64,${image.base64}`,
	}
})

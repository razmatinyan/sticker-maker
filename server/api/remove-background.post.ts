export default defineEventHandler(async event => {
	const config = useRuntimeConfig()

	// Read multipart form data
	const formData = await readMultipartFormData(event)
	if (!formData?.length) {
		throw createError({ statusCode: 400, message: 'No image provided' })
	}

	const imageFile = formData.find(f => f.name === 'image')
	if (!imageFile) {
		throw createError({ statusCode: 400, message: 'Image field missing' })
	}

	// Forward to remove.bg
	const removeBgForm = new FormData()
	removeBgForm.append(
		'image_file',
		new Blob([imageFile.data], { type: imageFile.type ?? 'image/png' }),
		'image.png',
	)
	removeBgForm.append('size', 'auto')

	const response = await fetch('https://api.remove.bg/v1.0/removebg', {
		method: 'POST',
		headers: { 'X-Api-Key': config.removeBgApiKey },
		body: removeBgForm,
	})

	if (!response.ok) {
		const error = await response.text()
		throw createError({
			statusCode: response.status,
			message: `Background removal failed: ${error}`,
		})
	}

	// Return image as base64
	const buffer = await response.arrayBuffer()
	const base64 = Buffer.from(buffer).toString('base64')

	return {
		image: `data:image/png;base64,${base64}`,
	}
})

import sharp from 'sharp'

export default defineEventHandler(async event => {
	const { botToken, telegramUserId, packName, stickerUrl } =
		await readBody(event)

	if (!botToken || !telegramUserId || !packName || !stickerUrl) {
		throw createError({
			statusCode: 400,
			message: 'Missing required fields',
		})
	}

	const imgRes = await fetch(stickerUrl)
	const imgBuffer = Buffer.from(await imgRes.arrayBuffer())

	const resized = await sharp(imgBuffer)
		.resize(512, 512, {
			fit: 'contain',
			background: { r: 0, g: 0, b: 0, alpha: 0 },
		})
		.png()
		.toBuffer()

	const form = new FormData()
	form.append('user_id', telegramUserId)
	form.append('sticker_format', 'static')
	form.append(
		'sticker',
		new Blob([resized], { type: 'image/png' }),
		'sticker.png',
	)

	const uploadRes = await fetch(
		`https://api.telegram.org/bot${botToken}/uploadStickerFile`,
		{ method: 'POST', body: form },
	)
	const uploadData = await uploadRes.json()
	if (!uploadData.ok) {
		throw createError({ statusCode: 400, message: uploadData.description })
	}

	const addRes = await fetch(
		`https://api.telegram.org/bot${botToken}/addStickerToSet`,
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				user_id: parseInt(telegramUserId),
				name: packName,
				stickers: [
					{
						sticker: uploadData.result.file_id,
						emoji_list: ['🎨'],
						format: 'static',
					},
				],
			}),
		},
	)

	const addData = await addRes.json()
	if (!addData.ok) {
		throw createError({ statusCode: 400, message: addData.description })
	}

	return { ok: true }
})

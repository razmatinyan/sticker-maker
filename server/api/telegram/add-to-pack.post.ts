export default defineEventHandler(async (event) => {
    const { botToken, telegramUserId, packName, stickerUrl } = await readBody(event)

    if (!botToken || !telegramUserId || !packName || !stickerUrl) {
        throw createError({ statusCode: 400, message: 'Missing required fields' })
    }

    const imgRes = await fetch(stickerUrl)
    const imgBlob = await imgRes.blob()

    const form = new FormData()
    form.append('user_id', telegramUserId)
    form.append('sticker_format', 'static')
    form.append('sticker', imgBlob, 'sticker.png')

    const uploadRes = await fetch(
        `https://api.telegram.org/bot${botToken}/uploadStickerFile`,
        { method: 'POST', body: form }
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
                stickers: [{
                    sticker: uploadData.result.file_id,
                    emoji_list: ['🎨'],
                    format: 'static',
                }],
            }),
        }
    )

    const addData = await addRes.json()
    if (!addData.ok) {
        throw createError({ statusCode: 400, message: addData.description })
    }

    return { ok: true }
})
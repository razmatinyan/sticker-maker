export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { botToken, telegramUserId, packName, packTitle, stickers } = body

    if (!botToken || !telegramUserId || !packName || !stickers?.length) {
        throw createError({ statusCode: 400, message: 'Missing required fields' })
    }

    // Step 1 — Upload first sticker file to Telegram
    const firstSticker = stickers[0]
    const stickerFileId = await uploadStickerFile(botToken, telegramUserId, firstSticker.url)

    // Step 2 — Create the sticker set
    const createRes = await fetch(
        `https://api.telegram.org/bot${botToken}/createNewStickerSet`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: parseInt(telegramUserId),
                name: `${packName}_by_${(await getBotUsername(botToken))}`,
                title: packTitle,
                sticker_format: 'static',
                stickers: [{
                    sticker: stickerFileId,
                    emoji_list: ['🎨'],
                    format: 'static',
                }],
            }),
        }
    )

    const createData = await createRes.json()

    if (!createData.ok) {
        throw createError({
            statusCode: 400,
            message: `Telegram error: ${createData.description}`,
        })
    }

    // Step 3 — Add remaining stickers
    for (let i = 1; i < stickers.length; i++) {
        const fileId = await uploadStickerFile(botToken, telegramUserId, stickers[i].url)
        await fetch(
            `https://api.telegram.org/bot${botToken}/addStickerToSet`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: parseInt(telegramUserId),
                    name: createData.name ?? `${packName}_by_${await getBotUsername(botToken)}`,
                    stickers: [{
                        sticker: fileId,
                        emoji_list: ['🎨'],
                        format: 'static',
                    }],
                }),
            }
        )
    }

    return {
        ok: true,
        packName: `${packName}_by_${await getBotUsername(botToken)}`,
    }
})

// ── Helpers ───────────────────────────────────────────────────────
async function uploadStickerFile(
    botToken: string,
    telegramUserId: string,
    imageUrl: string
): Promise<string> {
    // Fetch the image
    const imgRes = await fetch(imageUrl)
    const imgBlob = await imgRes.blob()

    // Upload to Telegram
    const form = new FormData()
    form.append('user_id', telegramUserId)
    form.append('sticker_format', 'static')
    form.append('sticker', imgBlob, 'sticker.png')

    const res = await fetch(
        `https://api.telegram.org/bot${botToken}/uploadStickerFile`,
        { method: 'POST', body: form }
    )
    const data = await res.json()

    if (!data.ok) throw new Error(`Upload failed: ${data.description}`)
    return data.result.file_id
}

async function getBotUsername(botToken: string): Promise<string> {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/getMe`)
    const data = await res.json()
    return data.result?.username ?? 'bot'
}
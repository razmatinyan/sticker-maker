export default defineEventHandler(async (event) => {
    const { botToken } = await readBody(event)

    if (!botToken?.trim()) {
        throw createError({ statusCode: 400, message: 'Bot token is required' })
    }

    const response = await fetch(
        `https://api.telegram.org/bot${botToken}/getMe`
    )
    const data = await response.json()

    return { ok: data.ok, bot: data.result }
})
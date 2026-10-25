require("dotenv").config()
const app = require("./src/app")
const connectToDB = require("./src/config/database")
const { setupTelegramWebhook, telegramWebhookMiddleware } = require("./src/bot/telegram.bot")
const { getModelConfig } = require("./src/services/gemini.service")

connectToDB()

if (telegramWebhookMiddleware) {
    app.use("/telegram/webhook", telegramWebhookMiddleware)
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`)
    const { primary, fallback } = getModelConfig()
    console.log(`Gemini primary model: ${primary}; fallback: ${fallback || "disabled"}`)
    await setupTelegramWebhook()
})

const { GoogleGenAI } = require("@google/genai")
const { setTimeout: delay } = require("node:timers/promises")

// Retry here so the final ApiError keeps its status and original cause.
const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY,
    httpOptions: { timeout: 60000 }
})

const RETRYABLE_STATUSES = new Set([ 408, 429, 500, 502, 503, 504 ])
const MAX_ATTEMPTS = 4

class AiServiceUnavailableError extends Error {
    constructor(cause) {
        super("The AI service is temporarily busy. Please try again in 30 seconds.", { cause })
        this.name = "AiServiceUnavailableError"
    }
}

async function generateContent(parameters) {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
        try {
            return await ai.models.generateContent({
                ...parameters,
                model: process.env.GEMINI_MODEL?.trim() || "gemini-3-flash-preview"
            })
        } catch (error) {
            const status = Number(error?.status)
            if (!RETRYABLE_STATUSES.has(status)) {
                throw error
            }

            if (attempt === MAX_ATTEMPTS) {
                throw new AiServiceUnavailableError(error)
            }

            // Exponential backoff with jitter avoids synchronized retry bursts.
            const waitMs = 1000 * (2 ** (attempt - 1)) + Math.floor(Math.random() * 500)
            console.warn(`Gemini returned ${status}; retrying (${attempt + 1}/${MAX_ATTEMPTS}) in ${waitMs} ms.`)
            await delay(waitMs)
        }
    }
}

module.exports = { generateContent, AiServiceUnavailableError }

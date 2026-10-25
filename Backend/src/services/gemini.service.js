const { GoogleGenAI, ThinkingLevel } = require("@google/genai")
const { setTimeout: delay } = require("node:timers/promises")

// Retry here so the final ApiError keeps its status and original cause.
const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY,
    // The SDK also sends this as Google's server deadline. A 60s deadline can
    // cut off larger reports before generation completes.
    httpOptions: { timeout: 120000 }
})

const RETRYABLE_STATUSES = new Set([ 408, 429, 500, 502, 503, 504 ])
const MAX_ATTEMPTS = 4

function getModelConfig() {
    const primary = process.env.GEMINI_MODEL?.trim() || "gemini-3.8-flash"
    // An explicitly empty value disables fallback. Never request it twice when
    // the primary and fallback are configured to the same model.
    const configuredFallback = (process.env.GEMINI_FALLBACK_MODEL ?? "gemini-3.5-flash-lite").trim()
    const fallback = configuredFallback && configuredFallback !== primary ? configuredFallback : null
    return { primary, fallback }
}

class AiServiceUnavailableError extends Error {
    constructor(cause) {
        super("The AI service is temporarily busy. Please try again in 30 seconds.", { cause })
        this.name = "AiServiceUnavailableError"
    }
}

async function generateContent(parameters) {
    const { primary, fallback } = getModelConfig()
    let model = primary

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
        try {
            console.info(`Gemini ${model}: attempt ${attempt}/${MAX_ATTEMPTS}.`)
            const config = { ...parameters.config }
            if (/^gemini-3[.-]/.test(model) && !config.thinkingConfig) {
                config.thinkingConfig = { thinkingLevel: ThinkingLevel.LOW }
            }
            return await ai.models.generateContent({
                ...parameters,
                model,
                config
            })
        } catch (error) {
            // This client owns the timeout; respect caller cancellations.
            if (parameters.config?.abortSignal?.aborted) {
                throw error
            }
            const status = error?.name === "AbortError" ? 504 : Number(error?.status)
            if (!RETRYABLE_STATUSES.has(status)) {
                throw error
            }

            if (attempt === MAX_ATTEMPTS) {
                const unavailable = new AiServiceUnavailableError(error)
                unavailable.model = model
                throw unavailable
            }

            const failedModel = model
            // Quota/rate limits need backoff on the same model. Capacity and
            // timeout errors can recover by using a different Gemini model.
            if (status !== 429 && model === primary && fallback) {
                model = fallback
            }

            // Exponential backoff with jitter avoids synchronized retry bursts.
            const waitMs = 1000 * (2 ** (attempt - 1)) + Math.floor(Math.random() * 500)
            console.warn(`Gemini ${failedModel} returned ${status}; ${model !== failedModel ? "switching to" : "retrying"} ${model} (${attempt + 1}/${MAX_ATTEMPTS}) in ${waitMs} ms.`)
            await delay(waitMs)
        }
    }
}

module.exports = { generateContent, getModelConfig, AiServiceUnavailableError }

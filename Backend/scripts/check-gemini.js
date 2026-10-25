const path = require("node:path")
require("dotenv").config({ path: path.join(__dirname, "../.env"), quiet: true })

async function main() {
    if (!process.env.GOOGLE_GENAI_API_KEY) {
        console.error("GOOGLE_GENAI_API_KEY is missing.")
        process.exitCode = 1
        return
    }

    const { GoogleGenAI, ThinkingLevel } = require("@google/genai")
    const { getModelConfig } = require("../src/services/gemini.service")
    const { primary, fallback } = getModelConfig()
    const client = new GoogleGenAI({
        apiKey: process.env.GOOGLE_GENAI_API_KEY,
        httpOptions: { timeout: 30000 }
    })

    for (const model of [ primary, fallback ].filter(Boolean)) {
        const started = Date.now()
        try {
            const response = await client.models.generateContent({
                model,
                contents: 'Return a JSON object with the single property "ok" set to true.',
                config: {
                    responseMimeType: "application/json",
                    responseSchema: { type: "object", properties: { ok: { type: "boolean" } }, required: [ "ok" ] },
                    ...(/^gemini-3[.-]/.test(model) ? { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } } : {})
                }
            })
            if (JSON.parse(response.text).ok !== true) {
                throw new Error("Unexpected structured output")
            }
            console.log(`${model}: OK (${Date.now() - started} ms)`)
        } catch (error) {
            // Never print raw SDK errors, request headers, or the API key.
            console.error(`${model}: FAILED (${Date.now() - started} ms), HTTP ${error?.status || "unknown"}, ${error?.name || "Error"}`)
            process.exitCode = 1
        }
    }
}

main().catch(() => {
    console.error("Gemini diagnostic could not complete.")
    process.exitCode = 1
})

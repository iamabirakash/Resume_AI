const assert = require("node:assert/strict")
const { test } = require("node:test")

process.env.GOOGLE_GENAI_API_KEY = "test-key-no-network"
process.env.GEMINI_MODEL = "gemini-3.8-flash"
process.env.GEMINI_FALLBACK_MODEL = "gemini-3.5-flash-lite"

const { generateContent, getModelConfig } = require("../src/services/gemini.service")
const auth = require("../src/middlewares/auth.middleware")
const reportModel = require("../src/models/interviewReport.model")
const originalFetch = global.fetch

const apiError = (status) => new Response(JSON.stringify({
    error: { code: status, message: "Test provider error", status: "UNAVAILABLE" }
}), { status, headers: { "Content-Type": "application/json" } })

const apiSuccess = () => new Response(JSON.stringify({
    candidates: [{ content: { parts: [{ text: JSON.stringify({
        title: "Backend developer",
        matchScore: 80,
        technicalQuestions: [],
        behavioralQuestions: [],
        skillGaps: [],
        preparationPlan: []
    }) }] } }]
}), { headers: { "Content-Type": "application/json" } })

test("report API recovers from overload and returns a retry message when overload persists", async (t) => {
    t.mock.method(auth, "authUser", (req, res, next) => {
        req.user = { id: "test-user" }
        next()
    })
    const saved = t.mock.method(reportModel, "create", async (report) => ({ ...report, _id: "saved-report" }))
    t.mock.method(console, "warn", () => {})
    t.mock.method(console, "info", () => {})
    const app = require("../src/app")
    const server = app.listen(0, "127.0.0.1")
    await new Promise((resolve) => server.once("listening", resolve))
    t.after(() => new Promise((resolve, reject) => server.close((err) => err ? reject(err) : resolve())))

    const submit = () => originalFetch(`http://127.0.0.1:${server.address().port}/api/interview/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription: "Node.js developer", selfDescription: "Backend engineer" })
    })

    await t.test("503/504 switch to fallback and create exactly one report", async (t) => {
        const requests = []
        t.mock.method(global, "fetch", async (url, options) => {
            requests.push({ url, body: options.body })
            return requests.length <= 2 ? apiError(requests.length === 1 ? 503 : 504) : apiSuccess()
        })
        const response = await submit()
        assert.equal(response.status, 201)
        assert.equal((await response.json()).interviewReport._id, "saved-report")
        assert.equal(requests.length, 3)
        assert.ok(String(requests[0].url).includes("models/gemini-3.8-flash:generateContent"))
        assert.ok(requests.slice(1).every(({ url }) => String(url).includes("models/gemini-3.5-flash-lite:generateContent")))
        assert.equal(new Set(requests.map(({ body }) => body)).size, 1)
        const body = JSON.parse(requests[0].body)
        assert.equal(body.generationConfig.thinkingConfig.thinkingLevel, "LOW")
        assert.equal(body.generationConfig.responseMimeType, "application/json")
        const schema = body.generationConfig.responseJsonSchema || body.generationConfig.responseSchema
        assert.ok(schema.properties.technicalQuestions)
        assert.equal(saved.mock.callCount(), 1)
    })

    await t.test("persistent 503 is bounded and exposes no provider details", async (t) => {
        const fetchMock = t.mock.method(global, "fetch", async () => apiError(503))
        const response = await submit()
        assert.equal(fetchMock.mock.callCount(), 4)
        assert.ok(String(fetchMock.mock.calls[0].arguments[0]).includes("models/gemini-3.8-flash:"))
        assert.ok(fetchMock.mock.calls.slice(1).every(({ arguments: args }) => String(args[0]).includes("models/gemini-3.5-flash-lite:")))
        assert.equal(response.status, 503)
        assert.equal(response.headers.get("Retry-After"), "30")
        assert.deepEqual(await response.json(), {
            message: "The AI service is temporarily busy. Please try again in 30 seconds.",
            code: "AI_TEMPORARILY_UNAVAILABLE"
        })
        assert.equal(saved.mock.callCount(), 1)
    })
})

test("permanent request/auth/model errors are not retried or sent to fallback", async (t) => {
    t.mock.method(console, "info", () => {})
    for (const status of [400, 401, 402, 403, 404]) {
        await t.test(`HTTP ${status}`, async (t) => {
            const fetchMock = t.mock.method(global, "fetch", async () => apiError(status))
            await assert.rejects(generateContent({ contents: "test" }), (err) => err.status === status)
            assert.equal(fetchMock.mock.callCount(), 1)
        })
    }
})

test("a temporary rate limit is retried", async (t) => {
    t.mock.method(console, "warn", () => {})
    t.mock.method(console, "info", () => {})
    let attempts = 0
    const fetchMock = t.mock.method(global, "fetch", async () => ++attempts === 1 ? apiError(429) : apiSuccess())
    const response = await generateContent({ contents: "test" })
    assert.equal(JSON.parse(response.text).title, "Backend developer")
    assert.equal(attempts, 2)
    assert.ok(fetchMock.mock.calls.every(({ arguments: args }) => String(args[0]).includes("models/gemini-3.8-flash:")))
})

test("model defaults, explicit overrides, and disabling duplicate/empty fallback", (t) => {
    t.after(() => {
        process.env.GEMINI_MODEL = "gemini-3.8-flash"
        process.env.GEMINI_FALLBACK_MODEL = "gemini-3.5-flash-lite"
    })
    delete process.env.GEMINI_MODEL
    delete process.env.GEMINI_FALLBACK_MODEL
    assert.deepEqual(getModelConfig(), { primary: "gemini-3.8-flash", fallback: "gemini-3.5-flash-lite" })
    process.env.GEMINI_MODEL = " gemini-3.6-flash "
    process.env.GEMINI_FALLBACK_MODEL = " gemini-3.1-flash-lite "
    assert.deepEqual(getModelConfig(), { primary: "gemini-3.6-flash", fallback: "gemini-3.1-flash-lite" })
    process.env.GEMINI_FALLBACK_MODEL = "gemini-3.6-flash"
    assert.equal(getModelConfig().fallback, null)
    process.env.GEMINI_FALLBACK_MODEL = ""
    assert.equal(getModelConfig().fallback, null)
})

test("disabled fallback retries the selected model and preserves caller config", async (t) => {
    process.env.GEMINI_FALLBACK_MODEL = ""
    t.after(() => { process.env.GEMINI_FALLBACK_MODEL = "gemini-3.5-flash-lite" })
    t.mock.method(console, "warn", () => {})
    t.mock.method(console, "info", () => {})
    const requests = []
    t.mock.method(global, "fetch", async (url, options) => {
        requests.push({ url, options })
        return requests.length === 1 ? apiError(503) : apiSuccess()
    })
    await generateContent({ contents: "test", config: { thinkingConfig: { thinkingLevel: "MEDIUM" } } })
    assert.equal(requests.length, 2)
    assert.ok(requests.every(({ url }) => String(url).includes("models/gemini-3.8-flash:")))
    assert.equal(JSON.parse(requests[1].options.body).generationConfig.thinkingConfig.thinkingLevel, "MEDIUM")
    assert.equal(requests[0].options.headers.get("x-server-timeout"), "120")
})

test("a client deadline switches to fallback instead of returning a generic 500", async (t) => {
    t.mock.method(console, "warn", () => {})
    t.mock.method(console, "info", () => {})
    let attempts = 0
    const fetchMock = t.mock.method(global, "fetch", async () => {
        if (++attempts === 1) {
            throw new DOMException("The operation was aborted", "AbortError")
        }
        return apiSuccess()
    })
    await generateContent({ contents: "test" })
    assert.equal(attempts, 2)
    assert.ok(String(fetchMock.mock.calls[1].arguments[0]).includes("models/gemini-3.5-flash-lite:"))
})

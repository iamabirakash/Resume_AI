const assert = require("node:assert/strict")
const { test } = require("node:test")

process.env.GOOGLE_GENAI_API_KEY = "test-key-no-network"
process.env.GEMINI_MODEL = "test-model"

const { generateContent } = require("../src/services/gemini.service")
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
    const app = require("../src/app")
    const server = app.listen(0, "127.0.0.1")
    await new Promise((resolve) => server.once("listening", resolve))
    t.after(() => new Promise((resolve, reject) => server.close((err) => err ? reject(err) : resolve())))

    const submit = () => originalFetch(`http://127.0.0.1:${server.address().port}/api/interview/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription: "Node.js developer", selfDescription: "Backend engineer" })
    })

    await t.test("two 503 responses followed by success create exactly one report", async (t) => {
        const requests = []
        t.mock.method(global, "fetch", async (url, options) => {
            requests.push({ url, body: options.body })
            return requests.length <= 2 ? apiError(503) : apiSuccess()
        })
        const response = await submit()
        assert.equal(response.status, 201)
        assert.equal((await response.json()).interviewReport._id, "saved-report")
        assert.equal(requests.length, 3)
        assert.ok(requests.every(({ url }) => String(url).includes("models/test-model:generateContent")))
        assert.equal(new Set(requests.map(({ body }) => body)).size, 1)
        assert.equal(saved.mock.callCount(), 1)
    })

    await t.test("persistent 503 is bounded and exposes no provider details", async (t) => {
        const fetchMock = t.mock.method(global, "fetch", async () => apiError(503))
        const response = await submit()
        assert.equal(fetchMock.mock.callCount(), 4)
        assert.equal(response.status, 503)
        assert.equal(response.headers.get("Retry-After"), "30")
        assert.deepEqual(await response.json(), {
            message: "The AI service is temporarily busy. Please try again in 30 seconds.",
            code: "AI_TEMPORARILY_UNAVAILABLE"
        })
        assert.equal(saved.mock.callCount(), 1)
    })
})

test("invalid credentials are not retried and keep the provider status", async (t) => {
    const fetchMock = t.mock.method(global, "fetch", async () => apiError(403))
    await assert.rejects(generateContent({ contents: "test" }), (err) => err.status === 403)
    assert.equal(fetchMock.mock.callCount(), 1)
})

test("a temporary rate limit is retried", async (t) => {
    t.mock.method(console, "warn", () => {})
    let attempts = 0
    t.mock.method(global, "fetch", async () => ++attempts === 1 ? apiError(429) : apiSuccess())
    const response = await generateContent({ contents: "test" })
    assert.equal(JSON.parse(response.text).title, "Backend developer")
    assert.equal(attempts, 2)
})

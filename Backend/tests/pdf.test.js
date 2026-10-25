const assert = require("node:assert/strict")
const { test } = require("node:test")
const { PDFParse } = require("pdf-parse")
const { extractPdfText } = require("../src/services/pdf.service")

// A real PDF with an unembedded standard font, which needs PDF.js font data.
function createResumePdf() {
    const stream = "BT /F1 12 Tf 72 720 Td (Resume: Node.js developer) Tj ET\n"
    const objects = [
        "<< /Type /Catalog /Pages 2 0 R >>",
        "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
        "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
        `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}endstream`
    ]
    let pdf = "%PDF-1.4\n"
    const offsets = [0]
    objects.forEach((object, index) => {
        offsets.push(Buffer.byteLength(pdf))
        pdf += `${index + 1} 0 obj\n${object}\nendobj\n`
    })
    const xrefOffset = Buffer.byteLength(pdf)
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
    pdf += offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("")
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`
    return Buffer.from(pdf)
}

test("standard-font resume extracts text without font warnings and cleans up", async (t) => {
    const warnings = []
    t.mock.method(console, "log", (...args) => warnings.push(args.join(" ")))
    t.mock.method(console, "warn", (...args) => warnings.push(args.join(" ")))
    const getText = PDFParse.prototype.getText
    t.mock.method(PDFParse.prototype, "getText", function (...args) {
        // Enable warnings to ensure this test does not merely silence them.
        this.options.verbosity = 1
        return getText.apply(this, args)
    })
    const destroy = t.mock.method(PDFParse.prototype, "destroy")
    const text = await extractPdfText(createResumePdf())
    assert.match(text, /Resume: Node.js developer/)
    assert.equal(destroy.mock.callCount(), 1)
    assert.ok(!warnings.some((warning) => /standardFontDataUrl|Unable to load font/.test(warning)), warnings.join("\n"))
})

test("malformed PDFs still release the parser", async (t) => {
    const destroy = t.mock.method(PDFParse.prototype, "destroy")
    await assert.rejects(extractPdfText(Buffer.from("not a PDF")))
    assert.equal(destroy.mock.callCount(), 1)
})

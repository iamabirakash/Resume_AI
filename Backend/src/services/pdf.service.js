const { PDFParse } = require("pdf-parse")
const { createRequire } = require("node:module")
const path = require("node:path")

// Resolve from pdf-parse so this also works when pdfjs-dist is nested by npm.
const requireFromPdfParse = createRequire(require.resolve("pdf-parse"))
const pdfjsDirectory = path.dirname(requireFromPdfParse.resolve("pdfjs-dist/package.json"))
const standardFontDataUrl = path.join(pdfjsDirectory, "standard_fonts") + "/"

async function extractPdfText(buffer) {
    const parser = new PDFParse({
        data: Uint8Array.from(buffer),
        standardFontDataUrl
    })

    try {
        const result = await parser.getText()
        return result.text || ""
    } finally {
        await parser.destroy()
    }
}

module.exports = { extractPdfText }

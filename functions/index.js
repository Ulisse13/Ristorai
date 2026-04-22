const { onRequest } = require("firebase-functions/v2/https")
const { GoogleGenerativeAI } = require("@google/generative-ai")

exports.ocrFattura = onRequest({ cors: true }, async (req, res) => {
  if (req.method !== "POST") return res.status(405).send("Method not allowed")

  const { base64, mediaType } = req.body
  if (!base64 || !mediaType) return res.status(400).send("Missing base64 or mediaType")

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64,
          mimeType: mediaType
        }
      },
      "Sei un sistema OCR per fatture italiane. Estrai questi dati dalla fattura e rispondi SOLO con JSON valido senza markdown: {\"fornitore\":\"...\",\"numero\":\"...\",\"data\":\"YYYY-MM-DD\",\"totale\":0.00,\"iva\":0.00}. Se un campo non e presente usa stringa vuota o 0. La data deve essere in formato YYYY-MM-DD."
    ])

    const raw = result.response.text()
    const clean = raw.replace(/^[\s\S]*?(\{[\s\S]*\})[\s\S]*$/, "$1").trim()
    const parsed = JSON.parse(clean)
    res.json(parsed)
  } catch (e) {
    console.error("OCR error:", e)
    res.status(500).json({ error: "OCR fallito" })
  }
})

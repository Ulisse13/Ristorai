export const config = { api: { bodyParser: { sizeLimit: '10mb' } } }

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  if (req.method === "OPTIONS") return res.status(200).end()
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })

  try {
    const { base64, prompt } = req.body

    if (!base64) return res.status(400).json({ error: "base64 mancante" })
    if (!prompt) return res.status(400).json({ error: "prompt mancante" })

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 4096,
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: "image/jpeg", data: base64 } },
            { type: "text", text: prompt }
          ]
        }]
      })
    })

    const data = await response.json()
    if (data.error) return res.status(400).json({ error: data.error.message || data.error.type || "Errore Claude" })

    const text = data.content?.[0]?.text || ""
    return res.status(200).json({ text })

  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

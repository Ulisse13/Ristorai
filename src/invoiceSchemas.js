// invoiceSchemas.js
// Rileva automaticamente lo schema di una fattura e aggiunge contesto al prompt AI

export function detectInvoiceSchema(text) {
  const t = text.toLowerCase()
  const schemas = []

  // SCHEMA D — Vini UM=PAC, cartoni CART.6/AST.CT.6, sconto su riga separata
  if (/\bpac\b/.test(t) && /cart\.\d|ast\.ct\.\d/.test(t) && /%\s*\d+[,.]?\d*/.test(t)) {
    schemas.push("D")
  }

  // SCHEMA C — Vini UM=Pezzi, prezzo già per bottiglia
  if (/pezzi\s+[\d,.]+\s+[\d,.]+/.test(t) && !/\bpac\b/.test(t)) {
    schemas.push("C")
  }

  // SCHEMA A — Colonna Sconto esplicita sulla stessa riga
  if (/\bsconto\b/.test(t) && /\b(kg|lt|nr|n\.)\b/.test(t)) {
    schemas.push("A")
  }

  // SCHEMA B — Default: prezzo già netto
  if (schemas.length === 0) schemas.push("B")

  return schemas
}

export function schemaHint(schemas) {
  const hints = []
  if (schemas.includes("D")) hints.push("SCHEMA D rilevato: vini in cartoni PAC con CART.6/AST.CT.6. Sconto sulla riga sopra come '% X,00'. prezzoUnitario = (Prezzo × (1-sconto/100)) / 6.")
  if (schemas.includes("C")) hints.push("SCHEMA C rilevato: vini con UM=Pezzi. Prezzo già per bottiglia. Usalo direttamente.")
  if (schemas.includes("A")) hints.push("SCHEMA A rilevato: colonna Sconto esplicita. prezzoUnitario = Prezzo × (1-Sconto/100). IVA (4,5,10,22) in ultima colonna — NON è sconto.")
  if (schemas.includes("B")) hints.push("SCHEMA B rilevato: prezzi già netti. Usa Prezzo direttamente. IVA (4,5,10,22) in ultima colonna — NON è sconto.")
  return hints.length > 0 ? "\n" + hints.join("\n") + "\n" : ""
}

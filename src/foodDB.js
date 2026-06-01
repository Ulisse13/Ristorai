// ─────────────────────────────────────────────────────────────────────────────
// foodDB.js — Database unificato prodotti per Ristorai
// Importa tutti i database e esporta lookupFood(nome)
// ─────────────────────────────────────────────────────────────────────────────

import { CARNI_DB }        from "./foodDB_carni"
import { PESCE_DB }        from "./foodDB_pesce"
import { FRUTTAVERDURA_DB } from "./foodDB_fruttaverdura"
import { FRESCHI_DB }      from "./foodDB_freschi"
import { SURGELATI_DB }    from "./foodDB_surgelati"
import { DISPENSA_DB }     from "./foodDB_dispensa"

// ── Mappa categoria → DB ────────────────────────────────────────────────────
const ALL_DB = [
  { cat: "Carni",            db: CARNI_DB },
  { cat: "Pesce",            db: PESCE_DB },
  { cat: "Frutta e Verdura", db: FRUTTAVERDURA_DB },
  { cat: "Freschi",          db: FRESCHI_DB },
  { cat: "Surgelati",        db: SURGELATI_DB },
  { cat: "Dispensa",         db: DISPENSA_DB },
]

// ── Risolvi unità base per ogni prodotto ────────────────────────────────────
// Regole in ordine di priorità: keywords > sotto1 > cat
function resolveUnit(cat, sotto1, sotto2, keywords) {
  const kws = (keywords || []).join(" ").toLowerCase()

  // Uova intere → pz | ovoprodotti (tuorlo, albume, misto) → kg
  if (sotto2 === "Uova" || kws.match(/\buova\b|\buovo\b/)) return "pz"
  if (sotto2 === "Ovoprodotti" || kws.match(/tuorlo|albume|misto.?uovo|ovoprodotto|uova pastorizzate/)) return "kg"

  // Latte e bevande liquide → l
  if (/\blatte\b/.test(kws) && !kws.includes("cioccolato al latte")) return "l"
  if (/panna/.test(kws)) return "l"
  if (/kefir/.test(kws)) return "l"

  // Dispensa: liquidi → l
  if (cat === "Dispensa") {
    if (sotto1 === "Bevande analcoliche" || sotto1 === "Bevande alcoliche" || sotto1 === "Superalcolici") return "l"
    if (sotto2 === "Olio" || sotto2 === "Aceto") return "l"
    if (/\bolio\b|aceto|salsa di soia|worcest|tabasco|sriracha|ketchup|worcest/.test(kws)) return "l"
    if (/\bacqua\b|birra|vino|liquore|grappa|amaro|rum|gin |vodka|whisky|whiskey/.test(kws)) return "l"
    // Detersivi liquidi → l
    if (sotto1 === "Detersivi" && /liquid|gel|detergente|ammorbident|candegg|sgrassat/.test(kws)) return "l"
    return "kg"
  }

  // Freschi: latticini liquidi
  if (cat === "Freschi" && sotto1 === "Latticini") {
    if (/\blatte\b|panna|kefir/.test(kws)) return "l"
    return "kg"
  }

  // Tutto il resto → kg
  return "kg"
}

// ── Indice: keyword → { cat, sotto1, sotto2, unit } ─────────────────────────
const INDEX = {}

// Estrae keywords da un entry che usa formato testo/nome (es. Dispensa)
function extractKeywordsFromTesto(entry) {
  const keys = []
  // Aggiungi il nome principale
  if (entry.nome) keys.push(entry.nome.toLowerCase().trim())
  // Estrai alias dal campo testo: "alias: a, b, c | altre info"
  if (entry.testo) {
    const aliasMatch = entry.testo.match(/alias:\s*([^|]+)/i)
    if (aliasMatch) {
      aliasMatch[1].split(",").forEach(a => {
        const clean = a.toLowerCase().replace(/\|.*/,'').trim()
        if (clean.length >= 2) keys.push(clean)
      })
    }
    // Aggiungi anche le prime parole del testo
    const firstWords = entry.testo.split(/[,|]/)[0].toLowerCase().trim()
    if (firstWords.length >= 2 && !keys.includes(firstWords)) keys.push(firstWords)
  }
  return keys
}

for (const { cat, db } of ALL_DB) {
  for (const entry of db) {
    // Supporta sia formato keywords[] che formato nome+testo
    const keywords = entry.keywords
      ? entry.keywords
      : extractKeywordsFromTesto(entry)

    const unit = entry.unit || resolveUnit(cat, entry.sotto1, entry.sotto2, keywords)

    for (const kw of keywords) {
      const key = kw.toLowerCase().trim()
      if (key && key.length >= 2 && !INDEX[key]) {
        INDEX[key] = {
          cat,
          sotto1: entry.sotto1 || "",
          sotto2: entry.sotto2 || "",
          unit
        }
      }
    }
  }
}

// ── Normalizza stringa ───────────────────────────────────────────────────────
function norm(s) {
  return s.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ").trim()
}

/**
 * Cerca un prodotto nel database.
 * @param {string} nome - Nome del prodotto dalla fattura
 * @returns {{ cat, sotto1, sotto2, unit } | null}
 */
function lookupFoodBase(n) {
  if (INDEX[n]) return INDEX[n]
  const keys = Object.keys(INDEX).sort((a, b) => b.length - a.length)
  for (const kw of keys) {
    if (n.includes(kw) && kw.length >= 4) return INDEX[kw]
  }
  const words = n.split(" ").filter(w => w.length >= 4)
  let best = null, bestScore = 0
  for (const [kw, data] of Object.entries(INDEX)) {
    let score = 0
    for (const word of words) {
      if (kw.includes(word)) score += word.length
      else if (word.includes(kw) && kw.length >= 5) score += kw.length * 0.8
    }
    if (score > bestScore) { bestScore = score; best = data }
  }
  return bestScore >= 5 ? best : null
}

export function lookupFood(nome) {
  if (!nome || nome.length < 2) return null

  const n = norm(nome)

  // Override surgelati: solo parole chiave chiare (non S finale di parole)
  if (/surgelat|gelo|frozen|\biqf\b|glassato|abbattut|\babb\b|\d[kKgGlLpP][sScC]\b|\b[sScC]\s*$/.test(n)) {
    const surgelatiKeys = Object.keys(INDEX)
      .filter(k => INDEX[k].cat === "Surgelati")
      .sort((a, b) => b.length - a.length)
    for (const kw of surgelatiKeys) {
      if (n.includes(kw) && kw.length >= 4) return INDEX[kw]
    }
    const baseMatch = lookupFoodBase(n)
    if (baseMatch) return { ...baseMatch, cat: "Surgelati" }
  }

  return lookupFoodBase(n)
}

export function getSotto1ByCat(cat) {
  const { db } = ALL_DB.find(d => d.cat === cat) || {}
  if (!db) return []
  const set = new Set(db.map(e => e.sotto1).filter(Boolean))
  return [...set]
}

export function getSotto2ByCat(cat, sotto1) {
  const { db } = ALL_DB.find(d => d.cat === cat) || {}
  if (!db) return []
  const set = new Set(
    db.filter(e => e.sotto1 === sotto1).map(e => e.sotto2).filter(Boolean)
  )
  return [...set]
}

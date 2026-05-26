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

for (const { cat, db } of ALL_DB) {
  for (const entry of db) {
    const unit = resolveUnit(cat, entry.sotto1, entry.sotto2, entry.keywords)
    for (const kw of entry.keywords) {
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
export function lookupFood(nome) {
  if (!nome || nome.length < 2) return null

  const n = norm(nome)

  // 1. Match esatto
  if (INDEX[n]) return INDEX[n]

  // 2. Match per keyword contenuta nel nome (dal più lungo al più corto)
  const keys = Object.keys(INDEX).sort((a, b) => b.length - a.length)
  for (const kw of keys) {
    if (n.includes(kw) && kw.length >= 4) return INDEX[kw]
  }

  // 3. Match parziale — ogni parola del nome cerca nel dizionario
  const words = n.split(" ").filter(w => w.length >= 4)
  let best = null
  let bestScore = 0

  for (const [kw, data] of Object.entries(INDEX)) {
    let score = 0
    for (const word of words) {
      if (kw.includes(word)) score += word.length
      else if (word.includes(kw) && kw.length >= 5) score += kw.length * 0.8
    }
    if (score > bestScore) { bestScore = score; best = data }
  }

  if (bestScore >= 5) return best
  return null
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

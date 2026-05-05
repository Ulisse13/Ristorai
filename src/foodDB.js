// ─────────────────────────────────────────────────────────────────────────────
// foodDB.js — Database unificato prodotti per Ristorai
// Importa tutti i database e esporta lookupFood(nome)
// ─────────────────────────────────────────────────────────────────────────────

import { CARNI_DB }        from "./foodDB_carni"
import { PESCE_DB }        from "./foodDB_pesce"
import { FRUTTAVERDURA_DB } from "./foodDB_fruttaverdura"
import { FRESCHI_DB }      from "./foodDB_freschi"
import { SURGELATI_DB }    from "./foodDB_surgelati"
import { SCATOLAME_DB }    from "./foodDB_scatolame"
import { BEVANDE_DB }      from "./foodDB_bevande"
import { DETERSIVI_DB }    from "./foodDB_detersivi"

// ── Mappa categoria → DB ────────────────────────────────────────────────────
const ALL_DB = [
  { cat: "Carni",           db: CARNI_DB },
  { cat: "Pesce",           db: PESCE_DB },
  { cat: "Frutta e Verdura", db: FRUTTAVERDURA_DB },
  { cat: "Freschi",         db: FRESCHI_DB },
  { cat: "Surgelati",       db: SURGELATI_DB },
  { cat: "Scatolame",       db: SCATOLAME_DB },
  { cat: "Bevande",         db: BEVANDE_DB },
  { cat: "Detersivi",       db: DETERSIVI_DB },
]

// ── Indice piatto keyword → { cat, sotto1, sotto2 } ─────────────────────────
const INDEX = {}

for (const { cat, db } of ALL_DB) {
  for (const entry of db) {
    for (const kw of entry.keywords) {
      const key = kw.toLowerCase().trim()
      if (key && key.length >= 2 && !INDEX[key]) {
        INDEX[key] = { cat, sotto1: entry.sotto1 || "", sotto2: entry.sotto2 || "" }
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
 * Cerca un prodotto nel database e restituisce categoria e sottocategorie.
 * @param {string} nome - Nome del prodotto dalla fattura
 * @returns {{ cat: string, sotto1: string, sotto2: string } | null}
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

/**
 * Restituisce tutte le sotto1 uniche per una categoria
 * @param {string} cat
 * @returns {string[]}
 */
export function getSotto1ByCat(cat) {
  const { db } = ALL_DB.find(d => d.cat === cat) || {}
  if (!db) return []
  const set = new Set(db.map(e => e.sotto1).filter(Boolean))
  return [...set]
}

/**
 * Restituisce tutte le sotto2 uniche per una categoria e sotto1
 * @param {string} cat
 * @param {string} sotto1
 * @returns {string[]}
 */
export function getSotto2ByCat(cat, sotto1) {
  const { db } = ALL_DB.find(d => d.cat === cat) || {}
  if (!db) return []
  const set = new Set(
    db.filter(e => e.sotto1 === sotto1).map(e => e.sotto2).filter(Boolean)
  )
  return [...set]
}

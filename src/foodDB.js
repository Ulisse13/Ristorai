// ─────────────────────────────────────────────────────────────────────────────
// foodDB.js — Database unificato prodotti per Ristorai
// ─────────────────────────────────────────────────────────────────────────────

import { CARNI_DB }         from "./foodDB_carni"
import { PESCE_DB }         from "./foodDB_pesce"
import { FRUTTAVERDURA_DB } from "./foodDB_fruttaverdura"
import { FRESCHI_DB }       from "./foodDB_freschi"
import { SURGELATI_DB }     from "./foodDB_surgelati"
import { DISPENSA_DB }      from "./foodDB_dispensa"

const ALL_DB = [
  { cat: "Carni",            db: CARNI_DB },
  { cat: "Pesce",            db: PESCE_DB },
  { cat: "Frutta e Verdura", db: FRUTTAVERDURA_DB },
  { cat: "Freschi",          db: FRESCHI_DB },
  { cat: "Surgelati",        db: SURGELATI_DB },
  { cat: "Dispensa",         db: DISPENSA_DB },
]

// ── Rileva unità base dal prodotto ───────────────────────────────────────────
function resolveUnit(cat, sotto1, sotto2, keywords) {
  const kws = (keywords || []).join(" ").toLowerCase()

  // ── FRESCHI ─────────────────────────────────────────────────────────────
  if (sotto2 === "Uova" || kws.match(/\buova\b|\buovo\b/)) return "pz"
  if (sotto2 === "Ovoprodotti" || kws.match(/tuorlo|albume|misto.?uovo|ovoprodotto|uova pastorizzate/)) return "kg"
  if (/\blatte\b/.test(kws) && !kws.includes("cioccolato al latte")) return "l"
  if (/\bpanna\b/.test(kws)) return "l"
  if (/\bkefir\b/.test(kws)) return "l"
  if (cat === "Freschi" && sotto1 === "Latticini") {
    if (/\blatte\b|panna|kefir/.test(kws)) return "l"
    return "kg"
  }

  // ── DISPENSA ─────────────────────────────────────────────────────────────
  if (cat === "Dispensa") {

    // Bevande → l
    if (sotto1 === "Bevande analcoliche" || sotto1 === "Bevande alcoliche" || sotto1 === "Superalcolici") return "l"
    if (/\bacqua\b|birra|\bvino\b|liquore|grappa|amaro|\brum\b|\bgin\b|\bvodka\b|whisky|whiskey|cognac|brandy|sciroppo|succo|the\b|tè\b/.test(kws)) return "l"

    // Condimenti liquidi → l
    if (/\bolio\b|aceto|salsa di soia|worcest|tabasco|sriracha|ketchup|maionese|mirin|ponzu|tahini/.test(kws)) return "l"

    // Detersivi liquidi → l
    if (sotto1 === "Detersivi" && /liquid|gel|detergente|ammorbident|candegg|sgrassat/.test(kws)) return "l"

    // Packaging liquido → l
    // PET, BOTT(iglia) → probabile liquido
    if (/\bpet\b|\bbott\b/.test(kws)) return "l"

    // Tutto il resto Dispensa → kg
    return "kg"
  }

  return "kg"
}

// ── Indice keyword → { cat, sotto1, sotto2, unit } ──────────────────────────
const INDEX = {}

for (const { cat, db } of ALL_DB) {
  for (const entry of db) {
    // Supporta sia struttura nuova (nome) che vecchia (keywords)
    const unit = entry.keywords
      ? resolveUnit(cat, entry.sotto1, entry.sotto2, entry.keywords)
      : resolveUnit(cat, entry.sotto1, entry.sotto2, [entry.nome || "", entry.testo || ""])

    if (entry.nome) {
      // Nuova struttura: usa nome come chiave primaria
      const key = entry.nome.toLowerCase().trim()
      if (key && key.length >= 2 && !INDEX[key]) {
        INDEX[key] = { cat, sotto1: entry.sotto1 || "", sotto2: entry.sotto2 || "", unit, testo: entry.testo || "" }
      }
    } else if (entry.keywords) {
      // Vecchia struttura: usa keywords array
      for (const kw of entry.keywords) {
        const key = kw.toLowerCase().trim()
        if (key && key.length >= 2 && !INDEX[key]) {
          INDEX[key] = { cat, sotto1: entry.sotto1 || "", sotto2: entry.sotto2 || "", unit }
        }
      }
    }
  }
}

// ── Normalizza stringa ───────────────────────────────────────────────────────
function norm(s) {
  return s.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s/]/g, " ")
    .replace(/\s+/g, " ").trim()
}

// ── Rileva surgelato/congelato ovunque nel nome ──────────────────────────────
// Parole complete + S/C isolate alla fine (convenzione MARR/Selecta)
// F isolata alla fine = fresco → NON surgelato
function isSurgelato(n) {
  // Parole complete ovunque nel nome
  if (/\b(iqf|gelo|frozen|ultra.?frozen|superfrozen|surgelato|surgelata|surgelati|surgelate|congelato|congelata|congelati|congelate|abbattuto|abbattuta|glass|glassato|glassata)\b/.test(n)) return true
  // IQF può essere attaccato a numeri/unità (es. 6kgIQF)
  if (/(iqf|gelo|frozen|superfrozen|surgelat|congelat|abbattut|glassato|glassata)/.test(n)) return true
  // S o C isolate come ultima parola (convenzione MARR/Selecta)
  if (/\b[sc]$/.test(n.trim())) return true
  // S o C attaccati a unità di misura (es. 2,5kgS, 3pzC, 5kgS)
  // Escludi cls (centilitri), mls (millilitri), pcs (pezzi) che finiscono con s legittimamente
  if (/\d(kg|g|pz|lt|l)[sc]$/.test(n.trim())) return true
  // -18 indica conservazione a temperatura di surgelazione
  if (/-18/.test(n)) return true
  return false
}

// ── Rileva stato prodotto dal nome ───────────────────────────────────────────
// Usato per arricchire il risultato con info di stato
function detectStato(n) {
  const stato = {}

  // Temperatura
  if (/\bf\b/.test(n) || /\bfresco\b|\bfresca\b|\bfreschi\b|\bfresche\b/.test(n)) stato.temp = "fresco"
  else if (isSurgelato(n)) stato.temp = "surgelato"

  // Pulizia pesce
  if (/\bpul\b|\bpulito\b|\bpulita\b|\bpuliti\b|\bpulite\b|\bmondato\b|\bsgusciato\b|\bdecorticato\b/.test(n)) stato.pulizia = "pulito"
  else if (/\bsporco\b|\bsporca\b|\bsporchi\b|\bsporche\b/.test(n)) stato.pulizia = "sporco"
  else if (/\bintero\b|\bintera\b|\binteri\b|\bintere\b/.test(n)) stato.pulizia = "intero"

  // Taglio pesce
  if (/\bfilett[oi]\b/.test(n)) stato.taglio = "filetto"
  else if (/\bfiloni?\b/.test(n)) stato.taglio = "filone"
  else if (/\btranci[oa]\b/.test(n)) stato.taglio = "trancio"
  else if (/\bcode?\b/.test(n)) stato.taglio = "code"
  else if (/\btubi\b/.test(n)) stato.taglio = "tubi"
  else if (/\banelli\b/.test(n)) stato.taglio = "anelli"

  // Osso carni
  if (/\bc\/o\b|con osso/.test(n)) stato.osso = "con osso"
  else if (/\bs\/o\b|senza osso|disossato/.test(n)) stato.osso = "senza osso"

  // Packaging
  if (/\batm\b/.test(n)) stato.pack = "ATM"
  else if (/\bs\/v\b|sottovuoto/.test(n)) stato.pack = "S/V"
  else if (/\bconf\b/.test(n)) stato.pack = "CONF"
  else if (/\blatta\b/.test(n)) stato.pack = "LATTA"
  else if (/\bbarattolo\b/.test(n)) stato.pack = "BARATTOLO"
  else if (/\bvaso\b|\bvasetto\b/.test(n)) stato.pack = "VASO"
  else if (/\bpet\b/.test(n)) stato.pack = "PET"
  else if (/\bbott\b|\bbottigli/.test(n)) stato.pack = "BOTTIGLIA"

  // Lavorazione
  if (/\bnat\b|\bnaturale\b/.test(n)) stato.lavorazione = "naturale"
  else if (/\bpronto\b|\bpronta\b|\bpronti\b|\bpronte\b/.test(n)) stato.lavorazione = "pronto"
  else if (/\bprecotto\b|\bprecotta\b|\bprecotti\b|\bprecotte\b/.test(n)) stato.lavorazione = "precotto"
  else if (/\bcotto\b|\bcotta\b/.test(n)) stato.lavorazione = "cotto"
  else if (/\baffumicat/.test(n)) stato.lavorazione = "affumicato"
  else if (/\bmarinato\b|\bmarinata\b/.test(n)) stato.lavorazione = "marinato"

  // ── FRESCHI ────────────────────────────────────────────────────────────────

  // Formaggi — formato
  if (/forma intera/.test(n)) stato.formato = "forma intera"
  else if (/mezza forma/.test(n)) stato.formato = "mezza forma"
  else if (/\bspicchio\b/.test(n)) stato.formato = "spicchio"
  else if (/grattugiato|grattuggiato/.test(n)) stato.formato = "grattugiato"
  else if (/a fette/.test(n)) stato.formato = "a fette"
  else if (/\bcubetti\b/.test(n)) stato.formato = "cubetti"

  // Formaggi — stagionatura
  const mesiMatch = n.match(/\b(\d+)\s*mesi\b/)
  if (mesiMatch) stato.stagionatura = mesiMatch[1] + " mesi"
  else if (/stravecchio/.test(n)) stato.stagionatura = "stravecchio"
  else if (/stagionato|stagionata/.test(n)) stato.stagionatura = "stagionato"
  else if (/semistagionato/.test(n)) stato.stagionatura = "semistagionato"

  // Certificazioni
  if (/\bdop\b/.test(n)) stato.cert = "DOP"
  else if (/\bigp\b/.test(n)) stato.cert = "IGP"
  if (/\bbio\b/.test(n)) stato.bio = true

  // Latticini — tipo
  if (/\buht\b/.test(n)) stato.tipo = "UHT"
  else if (/da cucina/.test(n)) stato.tipo = "da cucina"
  else if (/da montare/.test(n)) stato.tipo = "da montare"
  else if (/\bacida\b/.test(n)) stato.tipo = "acida"
  else if (/chiarificat/.test(n)) stato.tipo = "chiarificato"
  else if (/demi.?sel/.test(n)) stato.tipo = "demi-sel"
  else if (/\bscremato\b/.test(n)) stato.tipo = "scremato"

  // ── SURGELATI — tipo prodotto ───────────────────────────────────────────────
  if (stato.temp === "surgelato" || /\bgelato\b|\bsorbetto\b|\bsemifreddo\b|\bgranita\b/.test(n)) {
    // Dolci — anche senza indicatori gelo nel nome
    if (/\bgelato\b|\bsorbetto\b|\bsemifreddo\b|\bgranita\b/.test(n)) stato.tipo_surg = "dolce"
    // Impanati — include abbreviazioni tipo crocc
    else if (/\bimpanato\b|\bpanato\b|\bcrocc\b|\bcroccante\b|\bin pastella\b|\btempura\b/.test(n)) stato.tipo_surg = "impanato"
    // Preparati
    else if (/\blasagne\b|\bcannelloni\b|\barancin[oi]\b|\bcrocchett/.test(n)) stato.tipo_surg = "preparato"
    else if (/\bpizza\b|\bbastoncini\b|\bbauletti\b/.test(n)) stato.tipo_surg = "preparato"
    // Blocco
    else if (/\bblocco\b/.test(n)) stato.tipo_surg = "blocco"
    // Mix verdure
    else if (/mix verdure|misto verdure/.test(n)) stato.tipo_surg = "mix verdure"
    // -18
    if (/-18/.test(n)) stato.conservazione = "-18"
  }

  // ── FRUTTA E VERDURA ───────────────────────────────────────────────────────
  if (/\bserra\b/.test(n)) stato.coltivazione = "serra"
  if (/\bnovell[oa]\b/.test(n)) stato.tipo = "novella"

  // ── SALUMI ─────────────────────────────────────────────────────────────────
  if (/\bcrudo\b|\bcruda\b/.test(n)) stato.salume = "crudo"
  else if (/\bcotto\b|\bcotta\b/.test(n)) stato.salume = "cotto"

  // Salumi — formato
  if (/\baffettato\b|a fette/.test(n)) stato.taglio_salume = "affettato"
  else if (/\bmet[aà]\b/.test(n)) stato.taglio_salume = "metà"

  // Uova — allevamento e calibro
  if (/a terra/.test(n)) stato.allevamento = "a terra"
  else if (/free range/.test(n)) stato.allevamento = "free range"
  const calibroUova = n.match(/\b(xl|xtra large|large|\bl\b|medium|\bm\b|small|\bs\b)\b/)
  if (calibroUova && /uov/.test(n)) stato.calibro = calibroUova[1].toUpperCase()

  return stato
}

// ── Indice testo: keyword testo → { cat, sotto1, sotto2, unit, nome } ─────────
// Usato per matching su abbreviazioni e nomi strani (es. gamb.indop, B.A., ecc.)
const TEXT_INDEX = {}
for (const { cat, db } of ALL_DB) {
  for (const entry of db) {
    if (!entry.testo) continue
    const unit = entry.keywords
      ? resolveUnit(cat, entry.sotto1, entry.sotto2, entry.keywords)
      : resolveUnit(cat, entry.sotto1, entry.sotto2, [entry.nome || "", entry.testo || ""])
    // Estrai alias espliciti (dopo "alias:") — split PRIMA di norm per preservare virgole
    const aliasMatch = (entry.testo || "").match(/alias:\s*([^|]+)/i)
    if (aliasMatch) {
      // Split per virgola PRIMA di norm — altrimenti norm rimuove le virgole
      const rawAliases = aliasMatch[1].split(",")
      for (const rawAlias of rawAliases) {
        const alias = norm(rawAlias.trim())
        if (alias.length >= 5 && !TEXT_INDEX[alias]) {
          TEXT_INDEX[alias] = { cat, sotto1: entry.sotto1 || "", sotto2: entry.sotto2 || "", unit, nomeBase: entry.nome || "" }
        }
        // Aggiungi anche prima parola se >= 6 caratteri
        const firstWord = alias.split(" ")[0]
        if (firstWord.length >= 6 && !TEXT_INDEX[firstWord]) {
          TEXT_INDEX[firstWord] = { cat, sotto1: entry.sotto1 || "", sotto2: entry.sotto2 || "", unit, nomeBase: entry.nome || "" }
        }
      }
    }
  }
}

// ── Lookup base ──────────────────────────────────────────────────────────────
function lookupFoodBase(n) {
  // 1. Match esatto su nome
  if (INDEX[n]) return INDEX[n]

  // 2. INDEX e TEXT_INDEX cercano insieme — vince il match più lungo
  // Questo evita che parole corte (es. "pasta", "limone", "tartufo") in INDEX
  // battano frasi più specifiche in TEXT_INDEX (es. "pasta gialla", "lipton ice tea limone")
  let bestMatch = null
  let bestLen = 0

  for (const [kw, data] of Object.entries(INDEX)) {
    if (kw.length >= 4 && n.includes(kw) && kw.length > bestLen) {
      bestMatch = data
      bestLen = kw.length
    }
  }

  for (const [tw, data] of Object.entries(TEXT_INDEX)) {
    if (tw.length >= 4 && n.includes(tw) && tw.length > bestLen) {
      bestMatch = data
      bestLen = tw.length
    }
  }

  if (bestMatch) return bestMatch

  // 3. Match parziale su nome (word scoring)
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
  if (bestScore >= 5) return best

  return null
}

// ── Lookup principale ────────────────────────────────────────────────────────
export function lookupFood(nome) {
  if (!nome || nome.length < 2) return null

  const n = norm(nome)
  const stato = detectStato(n)

  // ── REGOLA SURGELATI ────────────────────────────────────────────────────
  // Se il nome contiene indicatori di gelo/surgelato/abbattuto/ultra frozen/IQF ecc.
  // → forza categoria Surgelati indipendentemente dal DB di provenienza
  if (stato.temp === "surgelato") {
    // Cerca prima nel DB surgelati per sotto1/sotto2 corretto
    const surgelatiKeys = Object.keys(INDEX)
      .filter(k => INDEX[k].cat === "Surgelati")
      .sort((a, b) => b.length - a.length)
    for (const kw of surgelatiKeys) {
      if (n.includes(kw) && kw.length >= 4) return { ...INDEX[kw], stato }
    }
    // Non trovato in surgelati → cerca in tutti i DB e forza Surgelati
    const baseMatch = lookupFoodBase(n)
    if (baseMatch) return { ...baseMatch, cat: "Surgelati", stato }
    // Nessun match → restituisce solo la categoria Surgelati
    return { cat: "Surgelati", sotto1: "", sotto2: "", unit: "kg", stato }
  }

  const result = lookupFoodBase(n)
  if (!result) return null
  return { ...result, stato }
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
  const set = new Set(db.filter(e => e.sotto1 === sotto1).map(e => e.sotto2).filter(Boolean))
  return [...set]
}

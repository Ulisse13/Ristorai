import { useState, useEffect, useRef, Component } from "react"


function simFornitore(a, b) {
  const na = normFornitore(a)
  const nb = normFornitore(b)
  if (!na || !nb) return 0
  if (na === nb) return 1
  const aw = na.split(/\s+/).filter(w => w.length >= 3)
  const bw = nb.split(/\s+/).filter(w => w.length >= 3)
  if (!aw.length || !bw.length) return 0
  const common = aw.filter(w => bw.includes(w))
  const union = new Set([...aw, ...bw]).size
  return common.length / union
}

function cleanJSON(str) {
  let s = str.trim()
  // Trova il JSON completo contando le parentesi
  let depth = 0, end = 0, inStr = false, escape = false
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (escape) { escape = false; continue }
    if (c === "\\") { escape = true; continue }
    if (c === '"' && !escape) { inStr = !inStr; continue }
    if (inStr) continue
    if (c === "{") depth++
    else if (c === "}") { depth--; if (depth === 0) { end = i; break } }
  }
  s = end > 0 ? s.slice(0, end + 1) : s
  // Rimuovi newline non escaped dentro le stringhe JSON
  s = s.replace(/("(?:[^"\\]|\\.)*")|([\n\r\t])/g, (m, str) => str ? str : " ")
  // Prova a parsare, se fallisce rimuovi l ultimo elemento incompleto
  try { JSON.parse(s); return s } catch(e) {
    const lastComma = s.lastIndexOf(",")
    if (lastComma > 0) {
      const trimmed = s.slice(0, lastComma)
      const open = (trimmed.match(/\[/g) || []).length - (trimmed.match(/\]/g) || []).length
      const close = "]".repeat(open) + "}" 
      try { const fixed = trimmed + close; JSON.parse(fixed); return fixed } catch(e2) {}
    }
    return s
  }
}
import { lookupFood } from "./foodDB"


// Normalizza nome per matching: rimuove solo formato numerico (30pz, 5kg, 3l)
// mantiene stato/lavorazione (fresco, arrostito, affumicato, ecc.)
function normNameForMatch(s) {
  if (!s) return ""
  return s.toLowerCase()
    .replace(/\b\d+[.,]?\d*\s*(kg|g|l|lt|litri|ml|pz|pezzi|conf|cf|cassa|cartone|bottiglie|buste|scatole)\b/gi, "")
    .replace(/\./g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function normFornitore(s) {
  if (!s) return ""
  return s.toLowerCase()
    .replace(/(s\.r\.l\.s?|srls?|s\.n\.c\.|snc|s\.p\.a\.|spa|s\.a\.s\.|sas|s\.s\.|ss|ltd|gmbh|inc|corp|soc\.?\s*coop|coop|societa|società)/gi, "")
    .replace(/[.\-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}


// Determina se mostrare il riquadro "Contenuto confezione"
function needsConfezione(cat, sotto1, unita) {
  const u = (unita || "").toLowerCase()
  // Se l'unità è già kg o l non serve mai il riquadro
  if (["kg","l","litri","g","ml"].includes(u)) return false
  // Categorie sempre disabilitate
  if (cat === "Carni") return false
  if (cat === "Pesce") return false
  // Freschi: dipende dalla sotto1
  if (cat === "Freschi") {
    if (sotto1 === "Formaggi Nobili") return false
    if (sotto1 === "Salumi") return false
    return true // Latticini, Altri Freschi
  }
  // Dispensa: disabilita solo Detersivi
  if (cat === "Dispensa") {
    if (sotto1 === "Detersivi") return false
    return true
  }
  // Frutta e Verdura, Surgelati → sempre abilitato
  return true
}

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { err: null } }
  static getDerivedStateFromError(e) { return { err: e } }
  render() {
    if (this.state.err) return (
      <div style={{padding:20,background:"#1a0000",minHeight:"100vh",color:"#ff6666",fontFamily:"monospace",fontSize:12}}>
        <b style={{color:"#ff4444",fontSize:15}}>ERRORE</b><br/><br/>
        {String(this.state.err)}<br/><br/>
        <span style={{fontSize:10,color:"#ff8888"}}>{String(this.state.err?.stack||"").slice(0,400)}</span>
      </div>
    )
    return this.props.children
  }
}
import { db, auth, googleProvider } from "./firebase"
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore"
import {
  onAuthStateChanged, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signInWithPopup,
  signOut, sendPasswordResetEmail, deleteUser,
  reauthenticateWithCredential, EmailAuthProvider, GoogleAuthProvider
} from "firebase/auth"

const formatEuro = n => "€ " + Number(n).toFixed(2).replace(".", ",")
const formatPct = n => (n * 100).toFixed(1) + "%"
const formatDate = s => new Date(s).toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" })
const FC_COLOR = (a, t) => a <= t ? "#4ade80" : a <= t * 1.1 ? "#e8a838" : "#f87171"
const uid = () => Math.random().toString(36).slice(2, 7)

// Navigazione back button mobile
let _navBackHandler = null

// Global error handler for mobile debug
if (typeof window !== "undefined") {
  window.onerror = (msg, src, line, col, err) => {
    document.body.innerHTML = "<div style='padding:20px;background:#1a0000;color:#ff6666;font-family:monospace;font-size:12px'><b style=\"color:#ff4444;font-size:14px\">ERRORE MOBILE</b><br><br>" + msg + "<br><br>Riga: " + line + "<br><br>" + (err && err.stack ? err.stack.slice(0,300) : "") + "</div>"
    return false
  }
  window.addEventListener("unhandledrejection", e => {
    document.body.innerHTML = "<div style='padding:20px;background:#1a0000;color:#ff6666;font-family:monospace;font-size:12px'><b style=\"color:#ff4444;font-size:14px\">PROMISE ERROR</b><br><br>" + String(e.reason) + "<br><br>" + (e.reason && e.reason.stack ? e.reason.stack.slice(0,300) : "") + "</div>"
  })
}


const STYLE = {
  bg: "#0d0d0f", surf: "#141417", el: "#1c1c21", ov: "#242429",
  bd: "1px solid #2a2a31", bds: "1px solid #1f1f25",
  ac: "#e8a838", acg: "rgba(232,168,56,0.12)", acd: "#b8832a",
  green: "#4ade80", gd: "rgba(74,222,128,0.12)",
  red: "#f87171", rd: "rgba(248,113,113,0.12)",
  t1: "#f0efe8", t2: "#9998a0", t3: "#5a5963",
  r: "8px", r2: "12px",
}

const row = (extra) => ({ display: "flex", alignItems: "center", gap: 8, ...extra })
const col = (extra) => ({ display: "flex", flexDirection: "column", gap: 4, ...extra })
const card = (extra) => ({ background: STYLE.surf, border: STYLE.bds, borderRadius: STYLE.r2, ...extra })
const btn = (variant, extra) => {
  const base = { display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: STYLE.r, fontFamily: "inherit", fontSize: 12.5, fontWeight: 500, cursor: "pointer", border: "1px solid transparent", lineHeight: 1, whiteSpace: "nowrap" }
  const v = { p: { background: STYLE.ac, color: "#0d0d0f", borderColor: STYLE.ac }, s: { background: STYLE.el, color: STYLE.t1, borderColor: STYLE.bd.replace("1px solid ", "") }, g: { background: "transparent", color: STYLE.t2 } }
  return { ...base, ...(v[variant] || v.s), ...extra }
}
const inp = (extra) => ({ width: "100%", padding: "8px 11px", background: STYLE.el, border: STYLE.bd, borderRadius: STYLE.r, color: STYLE.t1, fontFamily: "inherit", fontSize: 13.5, outline: "none", boxSizing: "border-box", ...extra })
const badge = (color, extra) => {
  const colors = { g: { background: STYLE.gd, color: STYLE.green, borderColor: "rgba(74,222,128,0.25)" }, r: { background: STYLE.rd, color: STYLE.red, borderColor: "rgba(248,113,113,0.25)" }, a: { background: STYLE.acg, color: STYLE.ac, borderColor: STYLE.acd }, n: { background: STYLE.el, color: STYLE.t2, borderColor: "#2a2a31" } }
  return { display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 8px", borderRadius: 999, fontSize: 10.5, fontWeight: 600, border: "1px solid transparent", whiteSpace: "nowrap", ...(colors[color] || colors.n), ...extra }
}

function Fld({ label, children }) {
  return <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}><label style={{ fontSize: 11.5, fontWeight: 500, color: STYLE.t2 }}>{label}</label>{children}</div>
}

const SOTTO1_ORDER = {
  "Carni":            ["Bovino", "Maiale", "Agnello", "Pollo", "Tacchino", "Anatra", "Coniglio", "Selvaggina"],
  "Pesce":            ["Orata", "Branzino", "Salmone", "Pesce Spada", "Tonno", "Ricciola", "Dentice", "Cernia", "Ombrina", "Alghe", "Crostacei", "Molluschi", "Altri Pesci"],
  "Freschi":          ["Formaggi Nobili", "Latticini", "Salumi", "Altri Freschi"],
  "Frutta e Verdura": ["Frutta", "Verdure", "Erbe aromatiche"],
  "Surgelati":        ["Carni", "Pesce", "Verdure", "Gelati e Dolci", "Preparati"],
  "Dispensa":         ["Conserve", "Condimenti", "Secchi", "Bevande analcoliche", "Bevande alcoliche", "Superalcolici", "Detersivi"],
}

function Dashboard({ ings, dishes, invs, isMobile, setPage }) {
  const [selIng, setSelIng] = useState(null)

  const now = new Date()
  const thisMonth = now.toISOString().slice(0,7)
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth()-1, 1)
  const lastMonth = lastMonthDate.toISOString().slice(0,7)
  const thisMonthName = now.toLocaleString("it-IT", { month: "long" })
  const lastMonthName = lastMonthDate.toLocaleString("it-IT", { month: "long" })

  // KPI
  const foodDishes = dishes.filter(d => d.fc > 0)
  const avgFC = foodDishes.length > 0
    ? Math.round(foodDishes.reduce((s,d) => s + d.fc, 0) / foodDishes.length * 1000) / 10
    : 0
  const overTarget = foodDishes.filter(d => d.fc > (d.target || 0.30))
  const ingsConAumento = ings.filter(i => i.prezzi && i.prezzi.some(p => p.prevPrice && p.price > p.prevPrice))

  // Risparmio potenziale
  const risparmio = ings
    .filter(i => i.prezzi && i.prezzi.length > 1)
    .map(i => ({
      ...i,
      delta: Math.round((i.prezzi[i.prezzi.length-1].price - i.prezzi[0].price) * 100) / 100
    }))
    .filter(i => i.delta > 0)
    .sort((a,b) => b.delta - a.delta)
    .slice(0, 5)

  // Spesa per fornitore questo mese vs scorso
  const spesaMap = {}
  invs.forEach(inv => {
    if (!inv.sup || !inv.date) return
    const month = inv.date.slice(0,7)
    const sup = inv.sup.trim()
    if (!spesaMap[sup]) spesaMap[sup] = { thisMonth: 0, lastMonth: 0 }
    if (month === thisMonth) spesaMap[sup].thisMonth += inv.total || 0
    if (month === lastMonth) spesaMap[sup].lastMonth += inv.total || 0
  })
  const fornSpesa = Object.entries(spesaMap)
    .map(([sup, v]) => ({ sup, ...v }))
    .filter(f => f.thisMonth > 0 || f.lastMonth > 0)
    .sort((a,b) => b.thisMonth - a.thisMonth)
    .slice(0, 6)

  // Storico prezzi per ingrediente da fatture
  function getPriceHistory(ing) {
    if (!ing) return []
    const normN = s => s.toLowerCase().replace(/\s+/g," ").trim()
    const ingNorm = normN(ing.name)
    const history = []
    invs.forEach(inv => {
      if (!inv.prodotti || !inv.date) return
      inv.prodotti.forEach(p => {
        if (!p.nome || !p.prezzoUnitario) return
        if (normN(p.nome) === ingNorm) {
          history.push({ date: inv.date, price: p.prezzoUnitario, sup: inv.sup })
        }
      })
    })
    return history.sort((a,b) => a.date.localeCompare(b.date))
  }

  const selectedIng = selIng ? ings.find(i => i.id === selIng) : null
  const priceHistory = getPriceHistory(selectedIng)

  // Sparkline SVG
  function Sparkline({ data, width, height }) {
    if (!data || data.length < 2) return null
    const prices = data.map(d => d.price)
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    const range = max - min || 1
    const pts = data.map((d, i) => {
      const x = (i / (data.length - 1)) * (width - 8) + 4
      const y = (height - 8) - ((d.price - min) / range) * (height - 8) + 4
      return `${x},${y}`
    }).join(" ")
    return (
      <svg width={width} height={height} style={{ display: "block" }}>
        <polyline points={pts} fill="none" stroke={STYLE.ac} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * (width - 8) + 4
          const y = (height - 8) - ((d.price - min) / range) * (height - 8) + 4
          return <circle key={i} cx={x} cy={y} r="3" fill={STYLE.ac} />
        })}
      </svg>
    )
  }

  const SectionTitle = ({ label, sub }) => (
    <div style={{ marginBottom: 12, marginTop: 28, paddingBottom: 8, borderBottom: STYLE.bds }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: STYLE.t1 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: STYLE.t3, marginTop: 2 }}>{sub}</div>}
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: "'Georgia',serif", fontSize: 20, color: STYLE.t1 }}>Dashboard</div>
        <div style={{ fontSize: 12, color: STYLE.t3 }}>{ings.length} ingredienti · {dishes.length} piatti · {invs.length} fatture</div>
      </div>

      {/* KPI rapidi */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 10 }}>
        {/* Ingredienti - informativo */}
        <div style={card({ padding: "14px 16px" })}>
          <div style={{ fontSize: 10, color: STYLE.t3, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, fontWeight: 700 }}>Ingredienti</div>
          <div style={{ fontFamily: "'Georgia',serif", fontSize: 26, color: STYLE.ac, lineHeight: 1 }}>{ings.length}</div>
          <div style={{ fontSize: 10, color: STYLE.t3, marginTop: 4 }}>in magazzino</div>
        </div>
        {/* Food cost medio - informativo */}
        <div style={card({ padding: "14px 16px" })}>
          <div style={{ fontSize: 10, color: STYLE.t3, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, fontWeight: 700 }}>Food cost medio</div>
          <div style={{ fontFamily: "'Georgia',serif", fontSize: 26, color: avgFC > 35 ? STYLE.red : avgFC > 0 ? STYLE.green : STYLE.t2, lineHeight: 1 }}>{avgFC > 0 ? avgFC + "%" : "—"}</div>
          <div style={{ fontSize: 10, color: STYLE.t3, marginTop: 4 }}>{avgFC > 35 ? "alto" : avgFC > 0 ? "nella norma" : "nessun piatto"}</div>
        </div>
        {/* Piatti da rivedere - cliccabile se > 0 */}
        <div
          onClick={() => overTarget.length > 0 && setPage("dishes")}
          style={card({ padding: "14px 16px", cursor: overTarget.length > 0 ? "pointer" : "default", position: "relative", overflow: "hidden",
            ...(overTarget.length > 0 ? { borderColor: "rgba(248,113,113,0.3)" } : {}) })}>
          {overTarget.length > 0 && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg," + STYLE.red + ",transparent)" }} />}
          <div style={{ fontSize: 10, color: STYLE.t3, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, fontWeight: 700 }}>Piatti da rivedere</div>
          <div style={{ fontFamily: "'Georgia',serif", fontSize: 26, color: overTarget.length > 0 ? STYLE.red : STYLE.green, lineHeight: 1 }}>{overTarget.length}</div>
          <div style={{ fontSize: 10, color: overTarget.length > 0 ? STYLE.red : STYLE.t3, marginTop: 4 }}>
            {overTarget.length > 0 ? "→ tocca per vedere" : "tutto ok"}
          </div>
        </div>
        {/* Prezzi aumentati - cliccabile se > 0 */}
        <div
          onClick={() => ingsConAumento.length > 0 && setPage("ing")}
          style={card({ padding: "14px 16px", cursor: ingsConAumento.length > 0 ? "pointer" : "default", position: "relative", overflow: "hidden",
            ...(ingsConAumento.length > 0 ? { borderColor: "rgba(248,113,113,0.3)" } : {}) })}>
          {ingsConAumento.length > 0 && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg," + STYLE.red + ",transparent)" }} />}
          <div style={{ fontSize: 10, color: STYLE.t3, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, fontWeight: 700 }}>Prezzi aumentati</div>
          <div style={{ fontFamily: "'Georgia',serif", fontSize: 26, color: ingsConAumento.length > 0 ? STYLE.red : STYLE.green, lineHeight: 1 }}>{ingsConAumento.length}</div>
          <div style={{ fontSize: 10, color: ingsConAumento.length > 0 ? STYLE.red : STYLE.t3, marginTop: 4 }}>
            {ingsConAumento.length > 0 ? "→ tocca per vedere" : "nessun aumento"}
          </div>
        </div>
      </div>

      {/* Alert piatti da rivedere */}
      {overTarget.length > 0 && (
        <>
          <SectionTitle label="Piatti da rivedere" sub="Food cost sopra target — rivedi prezzo di vendita o ricetta" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {overTarget.slice(0,5).map(d => (
              <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: STYLE.rd, border: "1px solid rgba(248,113,113,0.2)", borderRadius: STYLE.r }}>
                <div>
                  <div style={{ fontSize: 13, color: STYLE.t1, fontWeight: 600 }}>{d.name}</div>
                  <div style={{ fontSize: 11, color: STYLE.t3 }}>target {d.target ? (d.target*100).toFixed(0) : 30}% · vendita {d.price > 0 ? formatEuro(d.price) : "—"} · costo {d.cost > 0 ? formatEuro(d.cost) : "—"}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 15, color: STYLE.red, fontWeight: 700 }}>{(d.fc*100).toFixed(1)}%</div>
                  <div style={{ fontSize: 10, color: STYLE.t3 }}>food cost</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Risparmio potenziale */}
      {risparmio.length > 0 && (
        <>
          <SectionTitle label="Risparmio potenziale" sub="Ingredienti dove esiste un fornitore più economico nella tua classifica" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {risparmio.map(ing => (
              <div key={ing.id} style={{ padding: "10px 14px", background: STYLE.surf, border: STYLE.bds, borderRadius: STYLE.r }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: STYLE.t1, fontWeight: 600 }}>{ing.name}</span>
                  <span style={{ fontSize: 14, color: STYLE.green, fontWeight: 700 }}>-{formatEuro(ing.delta)}/{ing.unit}</span>
                </div>
                <div style={{ fontSize: 11, color: STYLE.t3 }}>
                  <span style={{ color: STYLE.green, fontWeight: 600 }}>{ing.prezzi[0].sup}</span> {formatEuro(ing.prezzi[0].price)}/{ing.unit}
                  <span style={{ margin: "0 6px" }}>vs</span>
                  <span style={{ color: STYLE.red, fontWeight: 600 }}>{ing.prezzi[ing.prezzi.length-1].sup}</span> {formatEuro(ing.prezzi[ing.prezzi.length-1].price)}/{ing.unit}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Andamento prezzi per ingrediente */}
      {ings.length > 0 && invs.length > 0 && (
        <>
          <SectionTitle label="Andamento prezzi" sub="Seleziona un ingrediente per vedere lo storico dalle fatture" />
          <select style={{ ...inp({ appearance: "none", cursor: "pointer" }), maxWidth: 320, marginBottom: 12 }}
            value={selIng || ""}
            onChange={e => setSelIng(e.target.value || null)}>
            <option value="">— scegli ingrediente —</option>
            {[...ings].sort((a,b) => a.name.localeCompare(b.name,"it")).map(i => (
              <option key={i.id} value={i.id}>{i.name}</option>
            ))}
          </select>
          {selectedIng && priceHistory.length > 1 ? (
            <div style={card({ padding: 16 })}>
              <div style={{ fontSize: 13, fontWeight: 600, color: STYLE.t1, marginBottom: 12 }}>{selectedIng.name}</div>
              <Sparkline data={priceHistory} width={isMobile ? 280 : 420} height={64} />
              <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 14 }}>
                {priceHistory.slice(-6).reverse().map((h, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "3px 0", borderBottom: i < 5 ? STYLE.bds : "none" }}>
                    <span style={{ color: STYLE.t3 }}>{formatDate(h.date)}</span>
                    <span style={{ color: STYLE.t2 }}>{h.sup}</span>
                    <span style={{ color: STYLE.ac, fontWeight: 600 }}>{formatEuro(h.price)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : selectedIng ? (
            <div style={{ fontSize: 12, color: STYLE.t3, padding: "16px 0" }}>Nessuno storico sufficiente — scansiona altre fatture per vedere l'andamento</div>
          ) : null}
        </>
      )}

      {/* Spesa per fornitore */}
      {fornSpesa.length > 0 && (
        <>
          <SectionTitle label="Spesa per fornitore" sub={thisMonthName + " vs " + lastMonthName} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {fornSpesa.map((f, i) => {
              const delta = f.thisMonth - f.lastMonth
              const pct = f.lastMonth > 0 ? Math.round((delta / f.lastMonth) * 100) : null
              const maxVal = Math.max(f.thisMonth, f.lastMonth)
              return (
                <div key={i} style={card({ padding: "12px 14px" })}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: STYLE.t1 }}>{f.sup}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {pct !== null && (
                        <span style={{ fontSize: 11, color: pct > 0 ? STYLE.red : STYLE.green, fontWeight: 600 }}>
                          {pct > 0 ? "+" : ""}{pct}%
                        </span>
                      )}
                      <span style={{ fontSize: 15, fontWeight: 700, color: STYLE.ac }}>{formatEuro(f.thisMonth)}</span>
                    </div>
                  </div>
                  {f.lastMonth > 0 && (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: STYLE.t3, marginBottom: 4 }}>
                        <span>{lastMonthName}: {formatEuro(f.lastMonth)}</span>
                        <span>{thisMonthName}: {formatEuro(f.thisMonth)}</span>
                      </div>
                      <div style={{ position: "relative", height: 6, background: STYLE.el, borderRadius: 999, overflow: "hidden" }}>
                        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: (f.lastMonth / maxVal * 100) + "%", background: STYLE.t3, borderRadius: 999, opacity: 0.4 }} />
                        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: (f.thisMonth / maxVal * 100) + "%", background: delta > 0 ? STYLE.red : STYLE.green, borderRadius: 999 }} />
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      {ings.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0", color: STYLE.t3, fontSize: 13 }}>
          Inizia scansionando una fattura per popolare la dashboard
        </div>
      )}
    </div>
  )
}

function Ingredients({ ings, setIngs, invs, isMobile, setNavBack, clearNavBack, pushHistory }) {
  const CATS = ["Carni", "Pesce", "Freschi", "Frutta e Verdura", "Surgelati", "Dispensa"]
  const [selSotto1, setSelSotto1] = useState(null)
  // Trova prezzi per fornitore per un ingrediente
  function prezziPerFornitore(ing) {
    const normN = s => s.toLowerCase().replace(/\./g, "").replace(/\s+/g, " ").trim()
    const ingNorm = normN(ing.name)
    const seen = new Map()
    for (const inv of invs) {
      if (!inv.prodotti) continue
      for (const p of inv.prodotti) {
        if (!p.nome || !p.prezzoUnitario) continue
        if (p.categoria && ing.cat && p.categoria !== ing.cat) continue
        const pNorm = normN(p.nome)
        if (pNorm !== ingNorm) {
          const aWords = ingNorm.split(/\s+/).filter(w => w.length >= 4)
          const bWords = pNorm.split(/\s+/).filter(w => w.length >= 4)
          if (!aWords.length || !bWords.length) continue
          const common = aWords.filter(w => bWords.includes(w))
          const union = new Set([...aWords, ...bWords]).size
          if (common.length / union < 0.7 || common.length < 2) continue
        }
        const normSup = normFornitore(inv.sup) || inv.sup
        const existing = seen.get(normSup)
        if (!existing || p.prezzoUnitario < existing.price) {
          seen.set(normSup, { sup: normSup, price: p.prezzoUnitario, date: inv.date })
        }
      }
    }
    return [...seen.values()].sort((a, b) => a.price - b.price)
  }

  const [selCat, setSelCat]     = useState(null) // null = category view
  const [open, setOpen]         = useState(false)
  const [delTarget, setDelTarget] = useState(null)
  const [edit, setEdit]         = useState(null)
  const [form, setForm]         = useState({ name: "", cat: "Carni", unit: "kg", cur: "", confPrice: "", confWeight: "" })
  const [err, setErr]           = useState({})

  const ingsByCat = cat => ings.filter(i => i.cat === cat)

  // Categorie con navigazione a livelli (sotto1 cards)
  const CATS_WITH_SOTTO1 = ["Carni", "Pesce", "Frutta e Verdura", "Freschi", "Surgelati", "Dispensa"]
  // Categorie con lista piatta (no sotto1)
  const CATS_FLAT = []

  function openAdd() {
    setEdit(null)
    setForm({ name: "", cat: selCat || "Carni", sotto1: "", sotto2: "", unit: "kg", cur: "", confPrice: "", confWeight: "" })
    setErr({})
    setOpen(true)
  }

  function openEdit(ing) {
    setEdit(ing)
    setForm({
      name: ing.name, cat: ing.cat, sotto1: ing.sotto1 || "", sotto2: ing.sotto2 || "", unit: ing.unit,
      cur: String(ing.cur),
      prezzi: ing.prezzi && ing.prezzi.length > 0
        ? [...ing.prezzi]
        : [{ sup: ing.fornitore || "Fornitore", price: ing.cur, date: new Date().toISOString().slice(0,10) }],
      confPrice: ing.confPrice ? String(ing.confPrice) : "",
      confWeight: ing.confWeight ? String(ing.confWeight) : ""
    })
    setErr({})
    setOpen(true)
  }

  function save() {
    const e = {}
    if (!form.name.trim()) e.name = "Obbligatorio"
    if (form.unit === "confezione") {
      if (!form.confPrice || +form.confPrice <= 0) e.confPrice = "Prezzo > 0"
      if (!form.confWeight || +form.confWeight <= 0) e.confWeight = "Peso/volume > 0"
    } else {
      if (!form.cur || +form.cur <= 0) e.cur = "Prezzo > 0"
    }
    if (Object.keys(e).length) { setErr(e); return }

    let cur, unitBase
    if (form.unit === "confezione") {
      // calcola prezzo per kg o litro dalla confezione
      cur = Math.round((+form.confPrice / +form.confWeight) * 100) / 100
      unitBase = "kg" // default  -  utente pu   cambiarlo in futuro
    } else {
      cur = +form.cur
      // Normalizza unit  : salva sempre in kg o l per coerenza con food cost
      if (form.unit === "litri") unitBase = "l"
      else if (form.unit === "g") { unitBase = "kg"; cur = Math.round(cur * 1000 * 100) / 100 }
      else if (form.unit === "ml") { unitBase = "l"; cur = Math.round(cur * 1000 * 100) / 100 }
      else unitBase = form.unit
    }

    // Calcola prezzi finali
    let finalPrezzi, finalCur, finalAvg
    if (edit && form.prezzi && form.prezzi.length > 0) {
      // Modifica: usa array prezzi dal form, riordina e aggiorna cur
      finalPrezzi = [...form.prezzi].sort((a, b) => a.price - b.price).slice(0, 5)
      finalCur = finalPrezzi[0].price
      finalAvg = edit.avg !== finalCur
        ? Math.round(((edit.avg * 0.7) + (finalCur * 0.3)) * 100) / 100
        : edit.avg
    } else {
      // Nuovo: crea array con prezzo manuale
      finalCur = cur
      finalAvg = cur
      finalPrezzi = cur > 0 ? [{ sup: "Manuale", price: cur, date: new Date().toISOString().slice(0,10) }] : []
    }
    const d = {
      name: form.name.trim(), cat: form.cat,
      sotto1: form.sotto1 || "", sotto2: form.sotto2 || "",
      unit: unitBase, cur: finalCur, avg: finalAvg,
      prev: edit ? edit.cur : finalCur,
      prezzi: finalPrezzi,
      ...(form.unit === "confezione" ? { confPrice: +form.confPrice, confWeight: +form.confWeight } : {}),

    }
    if (edit) {
      setIngs(prev => {
        // Cerca duplicato: stesso nome + categoria + sottocategoria
        const nameNorm = normNameForMatch(d.name)
        const duplicate = prev.find(i =>
          i.id !== edit.id &&
          normNameForMatch(i.name) === nameNorm &&
          i.cat === d.cat &&
          (i.sotto1 || "") === (d.sotto1 || "")
        )
        if (duplicate) {
          // Merge prezzi: unisci i due array, tieni il minimo per fornitore, max 5
          const allPrezzi = [...(d.prezzi || []), ...(duplicate.prezzi || [])]
          const supMap = new Map()
          allPrezzi.forEach(p => {
            const key = normFornitore(p.sup)
            if (!supMap.has(key) || p.price < supMap.get(key).price) {
              supMap.set(key, p)
            }
          })
          const mergedPrezzi = [...supMap.values()].sort((a, b) => a.price - b.price).slice(0, 5)
          const bestPrice = mergedPrezzi[0]?.price || duplicate.cur
          return prev
            .filter(i => i.id !== edit.id) // rimuovi il vecchio
            .map(i => i.id === duplicate.id ? {
              ...i, ...d,
              id: duplicate.id,
              prezzi: mergedPrezzi,
              cur: bestPrice,
              avg: Math.round(((duplicate.avg * 0.7) + (bestPrice * 0.3)) * 100) / 100
            } : i)
        }
        return prev.map(i => i.id === edit.id ? { ...i, ...d } : i)
      })
    } else {
      setIngs(prev => [...prev, { ...d, id: "i" + uid() }])
    }
    setOpen(false)
  }

  function doDelete() {
    setIngs(prev => prev.filter(i => i.id !== delTarget.id))
    setDelTarget(null)
  }

  // Back button: naviga tra i livelli magazzino
  useEffect(() => {
    if (!selCat) { clearNavBack?.(); return }
    setNavBack?.(() => {
      if (selSotto1) setSelSotto1(null)
      else setSelCat(null)
    })
    return () => { clearNavBack?.() }
  }, [selCat, selSotto1])

  //  -  -  CATEGORY VIEW  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  - 
  if (!selCat) return (
    <div>
      <div style={row({ justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", alignItems: "flex-start" })}>
        <div>
          <div style={{ fontFamily: "'Georgia',serif", fontSize: 20, color: STYLE.t1 }}>Magazzino</div>
          <div style={{ fontSize: 12, color: STYLE.t3 }}>{ings.length} ingredienti totali</div>
        </div>
        <button style={btn("p")} onClick={openAdd}>+ Aggiungi ingrediente</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 12 }}>
        {CATS.map(cat => {
          const count = ingsByCat(cat).length
          const spiked = recentAlerts.filter(r => r.cat === cat).length
          return (
            <div key={cat} onClick={() => { pushHistory?.(); setSelCat(cat) }}
              style={{ ...card({ padding: "20px 16px", cursor: "pointer", position: "relative", overflow: "hidden" }),
                transition: "transform 0.1s", borderColor: spiked > 0 ? "rgba(248,113,113,0.3)" : "#1f1f25" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: spiked > 0 ? "linear-gradient(90deg," + STYLE.red + ",transparent)" : "linear-gradient(90deg," + STYLE.ac + ",transparent)", opacity: 0.4 }} />
              <div style={{ fontFamily: "'Georgia',serif", fontSize: 16, color: STYLE.t1, marginBottom: 4 }}>{cat}</div>
              <div style={{ fontSize: 12, color: STYLE.t3 }}>{count} ingredient{count !== 1 ? "i" : "e"}</div>
              {spiked > 0 && <div style={{ fontSize: 10, color: STYLE.red, marginTop: 4 }}>' {spiked} prezzi aumentati</div>}
            </div>
          )
        })}
      </div>

      {/* Add modal */}
      {open && (
        <div onClick={e => e.target === e.currentTarget && setOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 9999 }}>
          <div style={{ background: STYLE.surf, border: STYLE.bd, borderRadius: 16, width: "100%", maxWidth: 480, maxHeight: "90vh", overflow: "auto" }}>
            <div style={row({ justifyContent: "space-between", padding: "18px 22px 0" })}>
              <span style={{ fontFamily: "'Georgia',serif", fontSize: 18, color: STYLE.t1 }}>{edit ? "Modifica ingrediente" : "Nuovo ingrediente"}</span>
              <button onClick={() => setOpen(false)} style={{ background: STYLE.el, border: STYLE.bd, borderRadius: STYLE.r, width: 28, height: 28, cursor: "pointer", color: STYLE.t3 }}>x</button>
            </div>
            <div style={{ padding: "16px 22px" }}>
              <Fld label="Nome *">
                <input style={inp()} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="es. Petto di pollo" />
                {err.name && <span style={{ fontSize: 11, color: STYLE.red }}>{err.name}</span>}
              </Fld>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Fld label="Categoria">
                  <select style={inp({ appearance: "none", cursor: "pointer" })} value={form.cat} onChange={e => setForm(f => ({ ...f, cat: e.target.value }))}>
                    {CATS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </Fld>
                <Fld label="Unit   di misura">
                  <select style={inp({ appearance: "none", cursor: "pointer" })} value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}>
                    {["kg", "litri", "confezione", "bottiglia"].map(u => <option key={u}>{u}</option>)}
                  </select>
                </Fld>
              </div>
              {SOTTO1_ORDER[form.cat] && (
                <Fld label="Sottocategoria">
                  <select style={inp({ appearance: "none", cursor: "pointer" })} value={form.sotto1 || ""} onChange={e => setForm(f => ({ ...f, sotto1: e.target.value }))}>
                    <option value="">— seleziona —</option>
                    {SOTTO1_ORDER[form.cat].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Fld>
              )}
              {edit && form.prezzi && form.prezzi.length > 0 ? (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <label style={{ fontSize: 11.5, fontWeight: 500, color: STYLE.t2 }}>Prezzi per fornitore</label>
                    <span style={{ fontSize: 10, color: STYLE.t3 }}>Miglior prezzo: <strong style={{ color: STYLE.green }}>{form.prezzi.length > 0 ? formatEuro(Math.min(...form.prezzi.map(p=>p.price))) : "—"}/{form.unit}</strong></span>
                  </div>
                  {/* Intestazione */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 90px 28px", gap: 6, padding: "4px 8px", background: STYLE.el, borderRadius: "6px 6px 0 0" }}>
                    <span style={{ fontSize: 9, color: STYLE.ac, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Fornitore</span>
                    <span style={{ fontSize: 9, color: STYLE.ac, textAlign: "right" }}>Prezzo/{form.unit}</span>
                    <span></span>
                  </div>
                  <div style={{ border: STYLE.bd, borderTop: "none", borderRadius: "0 0 6px 6px", overflow: "hidden", marginBottom: 8 }}>
                    {[...form.prezzi].sort((a,b) => a.price - b.price).map((p, i) => (
                      <div key={p.sup} style={{ display: "grid", gridTemplateColumns: "1fr 90px 28px", gap: 6, padding: "8px 8px", borderBottom: i < form.prezzi.length-1 ? STYLE.bds : "none", alignItems: "center", background: i === 0 ? "rgba(74,222,128,0.05)" : "transparent" }}>
                        <span style={{ fontSize: 12, color: i === 0 ? STYLE.green : STYLE.red, fontWeight: i === 0 ? 700 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {i === 0 ? "" : ""}{p.sup}
                        </span>
                        <input type="number" step="0.01" min="0"
                          style={{ ...inp({ padding: "4px 8px", fontSize: 12, textAlign: "right" }), width: "100%" }}
                          value={p.price}
                          onChange={e => {
                            const val = parseFloat(e.target.value) || 0
                            const newPrezzi = form.prezzi.map(x => x.sup === p.sup ? { ...x, price: val, prevPrice: x.price } : x)
                            setForm(f => ({ ...f, prezzi: newPrezzi }))
                          }}
                        />
                        {form.prezzi.length > 1 && (
                          <button
                            onClick={() => setForm(f => ({ ...f, prezzi: f.prezzi.filter(x => x.sup !== p.sup) }))}
                            style={{ background: "none", border: "none", color: STYLE.t3, cursor: "pointer", fontSize: 14, padding: 0, textAlign: "center" }}></button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : form.unit !== "confezione" ? (
                <Fld label={"Prezzo (v/" + form.unit + ") *"}>
                  <input style={inp()} type="number" step="0.01" value={form.cur} onChange={e => setForm(f => ({ ...f, cur: e.target.value }))} placeholder="0.00" />
                  {err.cur && <span style={{ fontSize: 11, color: STYLE.red }}>{err.cur}</span>}
                </Fld>
              ) : (
                <>
                  <div style={{ background: STYLE.acg, border: "1px solid " + STYLE.acd, borderRadius: STYLE.r, padding: "10px 12px", marginBottom: 12, fontSize: 12, color: STYLE.t2 }}>
                    Inserisci il prezzo della confezione e il peso/volume netto  -  il prezzo per kg/litro verr   calcolato automaticamente.
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <Fld label="Prezzo confezione (v) *">
                      <input style={inp()} type="number" step="0.01" value={form.confPrice} onChange={e => setForm(f => ({ ...f, confPrice: e.target.value }))} placeholder="0.00" />
                      {err.confPrice && <span style={{ fontSize: 11, color: STYLE.red }}>{err.confPrice}</span>}
                    </Fld>
                    <Fld label="Peso/volume netto (kg o l) *">
                      <input style={inp()} type="number" step="0.001" value={form.confWeight} onChange={e => setForm(f => ({ ...f, confWeight: e.target.value }))} placeholder="es. 0.750" />
                      {err.confWeight && <span style={{ fontSize: 11, color: STYLE.red }}>{err.confWeight}</span>}
                    </Fld>
                  </div>
                  {form.confPrice && form.confWeight && +form.confWeight > 0 && (
                    <div style={{ background: STYLE.el, border: STYLE.bd, borderRadius: STYLE.r, padding: "10px 12px", marginBottom: 12 }}>
                      <span style={{ fontSize: 11, color: STYLE.t3 }}>Prezzo calcolato: </span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: STYLE.ac }}>{formatEuro(Math.round((+form.confPrice / +form.confWeight) * 100) / 100)}/kg</span>
                    </div>
                  )}
                </>
              )}
            </div>
            <div style={row({ justifyContent: "flex-end", padding: "0 22px 18px", gap: 8 })}>
              <button style={btn("g")} onClick={() => setOpen(false)}>Annulla</button>
              <button style={btn("p")} onClick={save}>Salva</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )


  //  -  -  INGREDIENT LIST VIEW  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  - 
  const catIngs = ingsByCat(selCat)

  // Categorie con sotto1  -  mostra cards sotto1 se non selezionata
  if (CATS_WITH_SOTTO1.includes(selCat) && !selSotto1) {
    const sotto1List = SOTTO1_ORDER[selCat] || []
    return (
      <div>
        <div style={row({ marginBottom: 16 })}>
          <button onClick={() => { setSelCat(null); setSelSotto1(null) }} style={{ background: "none", border: "none", color: STYLE.ac, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, padding: 0 }}> Magazzino</button>
          <span style={{ color: STYLE.t3, fontSize: 13 }}>/</span>
          <span style={{ fontSize: 13, color: STYLE.t1, fontWeight: 600 }}>{selCat}</span>
        </div>
        <div style={{ fontSize: 12, color: STYLE.t3, marginBottom: 16 }}>{catIngs.length} ingredienti</div>
        {sotto1List.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 12 }}>
            {sotto1List.map(s1 => {
              const items = catIngs.filter(i => i.sotto1 === s1)
              const count = items.length
              const hasSpiked = items.some(i => i.avg > 0 && (i.cur - i.avg) / i.avg > 0.10)
              return (
                <div key={s1} onClick={() => {
                  pushHistory?.()
                  setSelSotto1(s1)
                  if (setRecentAlerts) setRecentAlerts(prev => prev.filter(r => !(r.cat === selCat && r.sotto1 === s1)))
                }}
                  style={{ ...card({ padding: "18px 16px", cursor: "pointer", position: "relative", overflow: "hidden" }),
                    borderColor: recentAlerts.some(r => r.cat === selCat && r.sotto1 === s1) ? "rgba(248,113,113,0.4)" : "#1f1f25" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2,
                    background: hasSpiked ? "linear-gradient(90deg," + STYLE.red + ",transparent)" : "linear-gradient(90deg," + STYLE.ac + ",transparent)",
                    opacity: 0.4 }} />
                  <div style={{ fontFamily: "'Georgia',serif", fontSize: 15, color: STYLE.t1, marginBottom: 4 }}>{s1}</div>
                  <div style={{ fontSize: 12, color: STYLE.t3 }}>{count} ingredient{count !== 1 ? "i" : "e"}</div>
                  {recentAlerts.some(r => r.cat === selCat && r.sotto1 === s1) && <div style={{ fontSize: 10, color: STYLE.red, marginTop: 4, fontWeight: 600 }}>↑ prezzo aumentato</div>}
                </div>
              )
            })}

          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "48px 0", color: STYLE.t3, fontSize: 13 }}>Nessun ingrediente</div>
        )}
      </div>
    )
  }

  // Lista prodotti  -  filtrata per sotto1 se selezionata - ORDINATA ALFABETICAMENTE
  const list = (selSotto1 === "__none__"
    ? catIngs.filter(i => !i.sotto1)
    : selSotto1
      ? catIngs.filter(i => i.sotto1 === selSotto1)
      : catIngs
  ).sort((a, b) => a.name.localeCompare(b.name, "it"))

  return (
    <div>
      {open && (
        <div onClick={e => e.target === e.currentTarget && setOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 9999 }}>
          <div style={{ background: STYLE.surf, border: STYLE.bd, borderRadius: 16, width: "100%", maxWidth: 480, maxHeight: "90vh", overflow: "auto" }}>
            <div style={row({ justifyContent: "space-between", padding: "18px 22px 0" })}>
              <span style={{ fontFamily: "'Georgia',serif", fontSize: 18, color: STYLE.t1 }}>{edit ? "Modifica ingrediente" : "Nuovo ingrediente"}</span>
              <button onClick={() => setOpen(false)} style={{ background: STYLE.el, border: STYLE.bd, borderRadius: STYLE.r, width: 28, height: 28, cursor: "pointer", color: STYLE.t3 }}>x</button>
            </div>
            <div style={{ padding: "16px 22px" }}>
              <Fld label="Nome *">
                <input style={inp()} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="es. Petto di pollo" />
                {err.name && <span style={{ fontSize: 11, color: STYLE.red }}>{err.name}</span>}
              </Fld>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Fld label="Categoria">
                  <select style={inp({ appearance: "none", cursor: "pointer" })} value={form.cat} onChange={e => setForm(f => ({ ...f, cat: e.target.value }))}>
                    {CATS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </Fld>
                <Fld label="Unit   di misura">
                  <select style={inp({ appearance: "none", cursor: "pointer" })} value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}>
                    {["kg", "litri", "confezione", "bottiglia"].map(u => <option key={u}>{u}</option>)}
                  </select>
                </Fld>
              </div>
              {SOTTO1_ORDER[form.cat] && (
                <Fld label="Sottocategoria">
                  <select style={inp({ appearance: "none", cursor: "pointer" })} value={form.sotto1 || ""} onChange={e => setForm(f => ({ ...f, sotto1: e.target.value }))}>
                    <option value="">— seleziona —</option>
                    {SOTTO1_ORDER[form.cat].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Fld>
              )}
              {edit && form.prezzi && form.prezzi.length > 0 ? (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <label style={{ fontSize: 11.5, fontWeight: 500, color: STYLE.t2 }}>Prezzi per fornitore</label>
                    <span style={{ fontSize: 10, color: STYLE.t3 }}>Miglior prezzo: <strong style={{ color: STYLE.green }}>{form.prezzi.length > 0 ? formatEuro(Math.min(...form.prezzi.map(p=>p.price))) : "—"}/{form.unit}</strong></span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 90px 28px", gap: 6, padding: "4px 8px", background: STYLE.el, borderRadius: "6px 6px 0 0" }}>
                    <span style={{ fontSize: 9, color: STYLE.ac, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Fornitore</span>
                    <span style={{ fontSize: 9, color: STYLE.ac, textAlign: "right" }}>Prezzo/{form.unit}</span>
                    <span></span>
                  </div>
                  <div style={{ border: STYLE.bd, borderTop: "none", borderRadius: "0 0 6px 6px", overflow: "hidden", marginBottom: 8 }}>
                    {[...form.prezzi].sort((a,b) => a.price - b.price).map((p, i) => (
                      <div key={p.sup} style={{ display: "grid", gridTemplateColumns: "1fr 90px 28px", gap: 6, padding: "8px 8px", borderBottom: i < form.prezzi.length-1 ? STYLE.bds : "none", alignItems: "center", background: i === 0 ? "rgba(74,222,128,0.05)" : "transparent" }}>
                        <span style={{ fontSize: 12, color: i === 0 ? STYLE.green : STYLE.red, fontWeight: i === 0 ? 700 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.sup}</span>
                        <input type="number" step="0.01" min="0"
                          style={{ ...inp({ padding: "4px 8px", fontSize: 12, textAlign: "right" }), width: "100%" }}
                          value={p.price}
                          onChange={e => {
                            const val = parseFloat(e.target.value) || 0
                            const newPrezzi = form.prezzi.map(x => x.sup === p.sup ? { ...x, prevPrice: x.price, price: val } : x)
                            setForm(f => ({ ...f, prezzi: newPrezzi }))
                          }}
                        />
                        {form.prezzi.length > 1 && (
                          <button onClick={() => setForm(f => ({ ...f, prezzi: f.prezzi.filter(x => x.sup !== p.sup) }))}
                            style={{ background: "none", border: "none", color: STYLE.t3, cursor: "pointer", fontSize: 14, padding: 0, textAlign: "center" }}>✕</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : form.unit !== "confezione" ? (
                <Fld label={"Prezzo (v/" + form.unit + ") *"}>
                  <input style={inp()} type="number" step="0.01" value={form.cur} onChange={e => setForm(f => ({ ...f, cur: e.target.value }))} placeholder="0.00" />
                  {err.cur && <span style={{ fontSize: 11, color: STYLE.red }}>{err.cur}</span>}
                </Fld>
              ) : (
                <>
                  <div style={{ background: STYLE.acg, border: "1px solid " + STYLE.acd, borderRadius: STYLE.r, padding: "10px 12px", marginBottom: 12, fontSize: 12, color: STYLE.t2 }}>
                    Inserisci il prezzo della confezione e il peso/volume netto  -  il prezzo per kg/litro verr   calcolato automaticamente.
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <Fld label="Prezzo confezione (v) *">
                      <input style={inp()} type="number" step="0.01" value={form.confPrice} onChange={e => setForm(f => ({ ...f, confPrice: e.target.value }))} placeholder="0.00" />
                      {err.confPrice && <span style={{ fontSize: 11, color: STYLE.red }}>{err.confPrice}</span>}
                    </Fld>
                    <Fld label="Peso/volume netto (kg o l) *">
                      <input style={inp()} type="number" step="0.001" value={form.confWeight} onChange={e => setForm(f => ({ ...f, confWeight: e.target.value }))} placeholder="es. 0.750" />
                      {err.confWeight && <span style={{ fontSize: 11, color: STYLE.red }}>{err.confWeight}</span>}
                    </Fld>
                  </div>
                  {form.confPrice && form.confWeight && +form.confWeight > 0 && (
                    <div style={{ background: STYLE.el, border: STYLE.bd, borderRadius: STYLE.r, padding: "10px 12px", marginBottom: 12 }}>
                      <span style={{ fontSize: 11, color: STYLE.t3 }}>Prezzo calcolato: </span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: STYLE.ac }}>{formatEuro(Math.round((+form.confPrice / +form.confWeight) * 100) / 100)}/kg</span>
                    </div>
                  )}
                </>
              )}
            </div>
            <div style={row({ justifyContent: "flex-end", padding: "0 22px 18px", gap: 8 })}>
              <button style={btn("g")} onClick={() => setOpen(false)}>Annulla</button>
              <button style={btn("p")} onClick={save}>Salva</button>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <div style={row({ marginBottom: 16 })}>
        <button onClick={() => { setSelCat(null); setSelSotto1(null) }} style={{ background: "none", border: "none", color: STYLE.ac, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, padding: 0 }}>
           Magazzino
        </button>
        <span style={{ color: STYLE.t3, fontSize: 13 }}>/</span>
        {selSotto1 ? (
          <>
            <button onClick={() => setSelSotto1(null)} style={{ background: "none", border: "none", color: STYLE.ac, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, padding: 0 }}>{selCat}</button>
            <span style={{ color: STYLE.t3, fontSize: 13 }}>/</span>
            <span style={{ fontSize: 13, color: STYLE.t1, fontWeight: 600 }}>{selSotto1 === "__none__" ? "Altri" : selSotto1}</span>
          </>
        ) : (
          <span style={{ fontSize: 13, color: STYLE.t1, fontWeight: 600 }}>{selCat}</span>
        )}
      </div>

      <div style={row({ justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap" })}>
        <div style={{ fontSize: 12, color: STYLE.t3 }}>{list.length} ingredienti</div>
      </div>

      {list.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: STYLE.t3, fontSize: 13 }}>
          Nessun ingrediente in questa categoria
        </div>
      ) : isMobile ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {list.map(ing => {
            const avg = ing.avg || ing.cur || 0
            const spiked = avg > 0 && (ing.cur - avg) / avg > 0.10
            return (
              <div key={ing.id} style={card({ padding: "14px 16px" })}>
                <div style={row({ justifyContent: "space-between", marginBottom: 4 })}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: STYLE.t1, marginBottom: 2 }}>{ing.name}</div>
                    {(ing.sotto1 || ing.sotto2) && (
                      <div style={row({ gap: 6, marginBottom: 4 })}>
                        {ing.sotto1 && <span style={{ fontSize: 10, color: STYLE.ac, background: STYLE.acg, border: "1px solid " + STYLE.acd, borderRadius: 4, padding: "1px 6px" }}>{ing.sotto1}</span>}
                        {ing.sotto2 && <span style={{ fontSize: 10, color: STYLE.t2, background: STYLE.el, border: STYLE.bds, borderRadius: 4, padding: "1px 6px" }}>{ing.sotto2}</span>}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={() => openEdit(ing)} style={{ background: STYLE.el, border: STYLE.bds, borderRadius: STYLE.r, padding: "3px 10px", color: STYLE.t2, fontSize: 11, fontFamily: "inherit", cursor: "pointer" }}>Modifica</button>
                    <button onClick={() => { if (window.confirm("Eliminare " + ing.name + "?")) setIngs(prev => prev.filter(i => i.id !== ing.id)) }} style={{ background: "none", border: "1px solid rgba(248,113,113,0.3)", borderRadius: STYLE.r, padding: "3px 10px", color: STYLE.red, fontSize: 11, fontFamily: "inherit", cursor: "pointer" }}>Elimina</button>
                    <button onClick={() => setDelTarget(ing)} style={{ background: "none", border: "none", color: STYLE.t3, cursor: "pointer", fontSize: 16, padding: "0 4px", flexShrink: 0 }}></button>
                  </div>
                </div>
                
                {ing.prezzi && ing.prezzi.length > 0 && (
                  <div style={{ background: STYLE.el, borderRadius: STYLE.r, padding: "6px 8px", marginTop: 4 }}>
                    {/* Intestazione colonne */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 52px 16px 56px", gap: 4, marginBottom: 5 }}>
                      <span style={{ fontSize: 9, color: STYLE.ac, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Fornitore</span>
                      <span style={{ fontSize: 9, color: STYLE.ac, textAlign: "right" }}>Prec.</span>
                      <span></span>
                      <span style={{ fontSize: 9, color: STYLE.ac, textAlign: "right" }}>Attuale</span>
                    </div>
                    {ing.prezzi.map((p, i) => {
                      const arrow = !p.prevPrice ? "" : p.price < p.prevPrice ? "↓" : p.price > p.prevPrice ? "↑" : "→"
                      const arrowColor = !p.prevPrice ? STYLE.t3 : p.price < p.prevPrice ? STYLE.green : p.price > p.prevPrice ? STYLE.red : STYLE.ac
                      return (
                        <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 52px 16px 56px", gap: 4, padding: "2px 0" }}>
                          <span style={{ fontSize: 11, color: i === 0 ? STYLE.green : STYLE.red, fontWeight: i === 0 ? 700 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.sup}</span>
                          <span style={{ fontSize: 10, color: STYLE.t3, textAlign: "right", alignSelf: "center" }}>{p.prevPrice ? formatEuro(p.prevPrice) : "—"}</span>
                          <span style={{ fontSize: 11, color: arrowColor, textAlign: "center", fontWeight: 700 }}>{arrow}</span>
                          <span style={{ fontSize: 12, color: i === 0 ? STYLE.green : STYLE.red, fontWeight: i === 0 ? 700 : 400, textAlign: "right" }}>{formatEuro(p.price)}<span style={{ fontSize: 9, color: STYLE.t3 }}>/{ing.unit}</span></span>
                        </div>
                      )
                    })}
                  </div>
                )}
                {ing.confPrice && (
                  <div style={{ fontSize: 11, color: STYLE.t3, marginTop: 4 }}>
                    Confezione: {formatEuro(ing.confPrice)} . {ing.confWeight}kg
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div style={{ border: STYLE.bds, borderRadius: STYLE.r2, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead><tr>
              {["Ingrediente", "Prezzo attuale", "Media storica", ""].map(h => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: STYLE.t3, background: STYLE.surf, borderBottom: STYLE.bds }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {list.map(ing => {
                const avg = ing.avg || ing.cur || 0
            const spiked = avg > 0 && (ing.cur - avg) / avg > 0.10
                return (
                  <tr key={ing.id}>
                    <td style={{ padding: "11px 16px", fontWeight: 500, color: STYLE.t1, borderBottom: STYLE.bds }}>
                      <div>{ing.name}</div>
                      {(ing.sotto1 || ing.sotto2) && (
                        <div style={{ display: "flex", gap: 4, marginTop: 3 }}>
                          {ing.sotto1 && <span style={{ fontSize: 9, color: STYLE.ac, background: STYLE.acg, border: "1px solid " + STYLE.acd, borderRadius: 3, padding: "1px 5px" }}>{ing.sotto1}</span>}
                          {ing.sotto2 && <span style={{ fontSize: 9, color: STYLE.t2, background: STYLE.el, borderRadius: 3, padding: "1px 5px" }}>{ing.sotto2}</span>}
                        </div>
                      )}
                      {ing.confPrice && <span style={{ fontSize: 10, color: STYLE.t3 }}>conf. {formatEuro(ing.confPrice)}</span>}
                      {ing.fornitore && <div style={{ fontSize: 10, color: STYLE.t3, marginTop: 2 }}>{ing.fornitore}</div>}
                    </td>
                    <td style={{ padding: "10px 16px", color: spiked ? STYLE.red : STYLE.t1, fontWeight: spiked ? 600 : 400, borderBottom: STYLE.bds, fontVariantNumeric: "tabular-nums" }}>
                      {formatEuro(ing.cur)}/{ing.unit} {spiked ? "'" : ""}
                    </td>
                    <td style={{ padding: "11px 16px", color: STYLE.t2, borderBottom: STYLE.bds, fontVariantNumeric: "tabular-nums" }}>
                      {ing.prezzi && ing.prezzi.length > 0 ? (
                        <div>
                          {/* Intestazione */}
                          <div style={{ display: "grid", gridTemplateColumns: "100px 58px 16px 58px", gap: 4, marginBottom: 4 }}>
                            <span style={{ fontSize: 9, color: STYLE.ac, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Fornitore</span>
                            <span style={{ fontSize: 9, color: STYLE.ac, textAlign: "right" }}>Prec.</span>
                            <span></span>
                            <span style={{ fontSize: 9, color: STYLE.ac, textAlign: "right" }}>Attuale</span>
                          </div>
                          {ing.prezzi.map((p, i) => {
                            const arrow = !p.prevPrice ? "" : p.price < p.prevPrice ? "↓" : p.price > p.prevPrice ? "↑" : "→"
                            const arrowColor = !p.prevPrice ? STYLE.t3 : p.price < p.prevPrice ? STYLE.green : p.price > p.prevPrice ? STYLE.red : STYLE.ac
                            return (
                              <div key={i} style={{ display: "grid", gridTemplateColumns: "100px 58px 16px 58px", gap: 4, padding: "1px 0" }}>
                                <span style={{ fontSize: 11, color: i === 0 ? STYLE.green : STYLE.red, fontWeight: i === 0 ? 700 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.sup}</span>
                                <span style={{ fontSize: 10, color: STYLE.t3, textAlign: "right" }}>{p.prevPrice ? formatEuro(p.prevPrice) : "—"}</span>
                                <span style={{ fontSize: 11, color: arrowColor, textAlign: "center", fontWeight: 700 }}>{arrow}</span>
                                <span style={{ fontSize: 12, color: i === 0 ? STYLE.green : STYLE.red, fontWeight: i === 0 ? 700 : 400, textAlign: "right" }}>{formatEuro(p.price)}<span style={{ fontSize: 9, color: STYLE.t3 }}>/{ing.unit}</span></span>
                              </div>
                            )
                          })}
                        </div>
                      ) : <span>{formatEuro(ing.avg || ing.cur)}/{ing.unit}</span>}
                    </td>
                    <td style={{ padding: "11px 16px", borderBottom: STYLE.bds, textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <button onClick={() => openEdit(ing)} style={{ background: "none", border: "1px solid #2a2a31", color: STYLE.t2, cursor: "pointer", fontSize: 11, fontFamily: "inherit", padding: "2px 8px", borderRadius: STYLE.r }}>Modifica</button>
                        <button onClick={() => { if (window.confirm("Eliminare " + ing.name + "?")) setIngs(prev => prev.filter(i => i.id !== ing.id)) }} style={{ background: "none", border: "1px solid rgba(248,113,113,0.3)", color: STYLE.red, cursor: "pointer", fontSize: 11, fontFamily: "inherit", padding: "2px 8px", borderRadius: STYLE.r }}>Elimina</button>
                        <button onClick={() => setDelTarget(ing)} style={{ background: "none", border: "none", color: STYLE.t3, cursor: "pointer", fontSize: 15, padding: "2px 6px" }} title="Elimina"></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete confirm */}
      {delTarget && (
        <div onClick={e => e.target === e.currentTarget && setDelTarget(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 1000 }}>
          <div style={{ background: STYLE.surf, border: STYLE.bd, borderRadius: 14, width: "100%", maxWidth: 380, padding: "24px 24px 20px" }}>
            <div style={{ fontFamily: "'Georgia',serif", fontSize: 17, color: STYLE.t1, marginBottom: 8 }}>Elimina ingrediente</div>
            <div style={{ fontSize: 13.5, color: STYLE.t2, lineHeight: 1.6, marginBottom: 20 }}>
              Sei sicuro di voler eliminare <strong style={{ color: STYLE.t1 }}>{delTarget.name}</strong>? L'azione non    reversibile.
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button style={btn("g")} onClick={() => setDelTarget(null)}>Annulla</button>
              <button style={{ ...btn("s"), background: STYLE.rd, color: STYLE.red, borderColor: "rgba(248,113,113,0.3)" }} onClick={doDelete}>Elimina</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Dishes({ dishes, setDishes, ings, isMobile, setPage, setEditDish, editDish, setNavBack, clearNavBack, pushHistory }) {
  const CATS = ["Speciali", "Antipasti", "Primi", "Secondi", "Dolci", "Cocktail", "Bevande"]
  const STAGIONI = ["Primavera", "Estate", "Autunno", "Inverno"]

  const [selCat, setSelCat]       = useState(null)
  const [detail, setDetail]       = useState(null)
  const [delTarget, setDelTarget] = useState(null)
  const [showFC, setShowFC]       = useState(false)
  const [showFCAI, setShowFCAI]   = useState(false)

  const r2 = n => Math.round(n * 100) / 100

  function catMatch(d, cat) {
    const c = (d.cat || "").toLowerCase()
    if (cat === "Antipasti") return c === "antipasto" || c === "antipasti"
    if (cat === "Primi")     return c === "primo"    || c === "primi"
    if (cat === "Secondi")   return c === "secondo"  || c === "secondi"
    if (cat === "Dolci")     return c === "dolce"    || c === "dolci"
    if (cat === "Speciali")  return c === "speciale" || c === "speciali"

    if (cat === "Cocktail")  return c === "cocktail"
    if (cat === "Dispensa")   return c === "dispensa" || c === "scatolame" || c === "bevande" || c === "detersivi"
    return false
  }

  const dishesByCat = cat => dishes.filter(d => catMatch(d, cat))

  function toggleStagione(dish, s) {
    const curr = dish.stagioni || []
    const next = curr.includes(s) ? curr.filter(x => x !== s) : [...curr, s]
    setDishes(prev => prev.map(d => d.id === dish.id ? { ...d, stagioni: next } : d))
  }

  function doDelete() {
    setDishes(prev => prev.filter(x => x.id !== delTarget.id))
    setDelTarget(null)
    setDetail(null)
  }

  // Apri FoodCostAI se richiesto da Hub Plus
  useEffect(() => {
    if (sessionStorage.getItem("openFCAI") === "1") {
      sessionStorage.removeItem("openFCAI")
      setShowFCAI(true)
    }
  }, [])

  // Back button
  useEffect(() => {
    if (!selCat && !showFC && !showFCAI) { clearNavBack?.(); return }
    setNavBack?.(() => {
      if (showFCAI) setShowFCAI(false)
      else if (showFC) setShowFC(false)
      else setSelCat(null)
    })
    return () => { clearNavBack?.() }
  }, [selCat, showFC, showFCAI])

  // Mostra FoodCostAI quando richiesto
  if (showFCAI) return <FoodCostAI
    ings={ings} dishes={dishes} setDishes={setDishes}
    isMobile={isMobile}
    onBack={() => setShowFCAI(false)}
  />

  // Mostra FoodCost quando richiesto
  if (showFC) return <FoodCost
    dishes={dishes} setDishes={setDishes} ings={ings} isMobile={isMobile}
    editDish={editDish} setEditDish={setEditDish} defaultTab="food"
    onBack={() => setShowFC(false)}
  />


  //  -  -  CATEGORY VIEW  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  - 
  if (!selCat) return (
    <div>
      <div style={row({ justifyContent: "space-between", marginBottom: 20, alignItems: "flex-start" })}>
        <div>
          <div style={{ fontFamily: "'Georgia',serif", fontSize: 20, color: STYLE.t1, marginBottom: 2 }}>Ricette</div>
          <div style={{ fontSize: 12, color: STYLE.t3 }}>{dishes.length} piatti nel menu</div>
        </div>
        <button style={btn("p")} onClick={() => { pushHistory?.(); setShowFC(true) }}>+ Food Cost</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 12 }}>
        {CATS.map(cat => {
          const list = dishesByCat(cat)
          const overTarget = list.filter(d => d.fc > 0 && d.fc > d.target).length
          return (
            <div key={cat} onClick={() => { pushHistory?.(); setSelCat(cat) }}
              style={{ ...card({ padding: "20px 16px", cursor: "pointer", position: "relative", overflow: "hidden" }),
                borderColor: overTarget > 0 ? "rgba(248,113,113,0.3)" : "#1f1f25" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: overTarget > 0 ? "linear-gradient(90deg," + STYLE.red + ",transparent)" : "linear-gradient(90deg," + STYLE.ac + ",transparent)", opacity: 0.4 }} />
              
              <div style={{ fontFamily: "'Georgia',serif", fontSize: 16, color: STYLE.t1, marginBottom: 4 }}>{cat}</div>
              <div style={{ fontSize: 12, color: STYLE.t3 }}>{list.length} piatt{list.length !== 1 ? "i" : "o"}</div>
              {overTarget > 0 && <div style={{ fontSize: 10, color: STYLE.red, marginTop: 4 }}>! {overTarget} sopra target</div>}
            </div>
          )
        })}
      </div>
    </div>
  )


  //  -  -  DISH LIST VIEW  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  - 
  const list = dishesByCat(selCat)
  return (
    <div>
      <div style={row({ marginBottom: 16 })}>
        <button onClick={() => { setSelCat(null); setDetail(null) }} style={{ background: "none", border: "none", color: STYLE.ac, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, padding: 0 }}> Piatti</button>
        <span style={{ color: STYLE.t3, fontSize: 13 }}>/</span>
        <span style={{ fontSize: 13, color: STYLE.t1, fontWeight: 600 }}>{selCat}</span>
      </div>
      <div style={{ fontSize: 12, color: STYLE.t3, marginBottom: 14 }}>{list.length} piatt{list.length !== 1 ? "i" : "o"}</div>

      {list.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: STYLE.t3, fontSize: 13 }}>
          Nessun piatto in questa categoria  -  aggiungili dalla sezione Food Cost
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {list.map(d => (
            <div key={d.id} style={card({ padding: "14px 16px" })}>
              <div style={row({ justifyContent: "space-between", marginBottom: 8 })}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: STYLE.t1, marginBottom: 2 }}>{d.name}</div>
                  <div style={row({ gap: 10 })}>
                    <span style={{ fontSize: 13, color: STYLE.t1, fontWeight: 600 }}>{d.price > 0 ? formatEuro(d.price) : " - "}</span>
                    {d.ricarico > 0 && <span style={{ fontSize: 12, color: STYLE.ac, fontWeight: 600 }}> --{(d.ricarico/100).toFixed(1)}</span>}
                    {d.fc > 0 && <span style={{ fontSize: 12, color: FC_COLOR(d.fc, d.target), fontWeight: 600 }}>{formatPct(d.fc)} FC</span>}
                    {d.cost > 0 && <span style={{ fontSize: 11, color: STYLE.t3 }}>costo {formatEuro(d.cost)}</span>}
                  </div>
                </div>
                <div style={row({ gap: 8 })}>
                  <button onClick={() => { setEditDish?.(d); setShowFC(true) }}
                    style={{ background: "none", border: "none", color: STYLE.t2, cursor: "pointer", fontSize: 12, fontFamily: "inherit", padding: "2px 6px", borderRadius: STYLE.r, border: "1px solid #2a2a31" }}>Modifica</button>
                  <button onClick={() => setDelTarget(d)} style={{ background: "none", border: "1px solid rgba(248,113,113,0.3)", color: STYLE.red, cursor: "pointer", fontSize: 12, fontFamily: "inherit", padding: "2px 6px", borderRadius: STYLE.r }}>Elimina</button>
                </div>
              </div>
              {/* Food cost bar */}
              {d.fc > 0 && (
                <div style={{ height: 4, background: STYLE.el, borderRadius: 999, overflow: "hidden", marginBottom: 10, position: "relative" }}>
                  <div style={{ height: "100%", width: Math.min(d.fc * 100, 100) + "%", background: FC_COLOR(d.fc, d.target), borderRadius: 999 }} />
                  <div style={{ position: "absolute", top: 0, bottom: 0, left: (d.target * 100) + "%", width: 1, background: STYLE.t3 }} />
                </div>
              )}
              {/* Stagionalit   */}
              <div style={{ borderTop: STYLE.bds, paddingTop: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: STYLE.t3, marginBottom: 6 }}>Stagionalit  </div>
                <div style={row({ flexWrap: "wrap", gap: 6 })}>
                  {STAGIONI.map(s => (
                    <button key={s} onClick={() => toggleStagione(d, s)}
                      style={{ padding: "3px 10px", background: (d.stagioni||[]).includes(s) ? STYLE.acg : "none", border: "1px solid " + ((d.stagioni||[]).includes(s) ? STYLE.acd : "#2a2a31"), borderRadius: 999, color: (d.stagioni||[]).includes(s) ? STYLE.ac : STYLE.t3, fontFamily: "inherit", fontSize: 11, cursor: "pointer" }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
{delTarget && (
        <div onClick={e => e.target === e.currentTarget && setDelTarget(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 1000 }}>
          <div style={{ background: STYLE.surf, border: STYLE.bd, borderRadius: 14, width: "100%", maxWidth: 380, padding: "24px 24px 20px" }}>
            <div style={{ fontFamily: "'Georgia',serif", fontSize: 17, color: STYLE.t1, marginBottom: 8 }}>Elimina piatto</div>
            <div style={{ fontSize: 13.5, color: STYLE.t2, lineHeight: 1.6, marginBottom: 20 }}>
              Sei sicuro di voler eliminare <strong style={{ color: STYLE.t1 }}>{delTarget.name}</strong>? L'azione non    reversibile.
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button style={btn("g")} onClick={() => setDelTarget(null)}>Annulla</button>
              <button style={{ ...btn("s"), background: STYLE.rd, color: STYLE.red, borderColor: "rgba(248,113,113,0.3)" }} onClick={doDelete}>Elimina definitivamente</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


//  -  -  BANCHETTI TAB  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  - 

const DL = s => new Date(s).toLocaleDateString("it-IT", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })

function Invoices({ invs, setInvs, ings, setIngs, fornitori, setFornitori, learned, setLearned, isMobile, setNavBack, clearNavBack, pushHistory }) {
  const CATS = ["Carni", "Pesce", "Frutta e Verdura", "Freschi", "Surgelati", "Dispensa"]
  
  const [invTab, setInvTab]         = useState("fatture") // "fatture" | "fornitori" | "banchetti"
  const [selFornitore, setSelFornitore] = useState(null)
  const [forniForm, setForniForm]   = useState({ name: "", tel: "", email: "", cat: "" })
  const [forniOpen, setForniOpen]   = useState(false)
  const [forniEdit, setForniEdit]   = useState(null)

  // step: "list" | "upload" | "loading" | "review"
  const [step, setStep]           = useState("list")
  const [detailInv, setDetailInv] = useState(null)
  const [prog, setProg]           = useState(0)
  const [progLabel, setProgLabel] = useState("")
  const [ocrError, setOcrError]   = useState(null)
  const [priceAlerts, setPriceAlerts] = useState([]) // alert prezzi anomali
  const [recentAlerts, setRecentAlerts] = useState([]) // { ingId, cat, sotto1 } - temporaneo fino a visione

  // dati fattura
  const [fattura, setFattura] = useState(() => {
    try { const s = localStorage.getItem("fm_ocr_fattura"); return s ? JSON.parse(s) : { sup: "", num: "", date: "", total: "", vat: "" } } catch(e) { return { sup: "", num: "", date: "", total: "", vat: "" } }
  })
  const [fattErr, setFattErr] = useState({})

  // ingredienti trovati in fattura
  // tipo: { nome, quantita, unita, prezzoUnitario, tipo: "update"|"new", ingId, ingName, cat, include }
  const [found, setFound] = useState([])

  // Back button: annulla step corrente o chiudi fornitore
  useEffect(() => {
    if (step === "list" && !selFornitore) { clearNavBack?.(); return }
    setNavBack?.(() => {
      if (step !== "list") reset()
      else if (selFornitore) setSelFornitore(null)
    })
    return () => { clearNavBack?.() }
  }, [step, selFornitore])

  function reset() {
    setStep("list"); setProg(0); setProgLabel(""); setOcrError(null)
    setFattura({ sup: "", num: "", date: "", total: "", vat: "" })
    setFattErr({}); setFound([]); setPriceAlerts([])
  }

  //  -  -  Comprimi immagine  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  - 
  async function compressImage(file) {
    return new Promise((res) => {
      try {
        const img = new Image()
        const url = URL.createObjectURL(file)
        img.onload = () => {
          try {
            const MAX_W = 1600, MAX_H = 2400
            let w = img.width, h = img.height
            if (w > MAX_W) { h = Math.round(h * MAX_W / w); w = MAX_W }
            if (h > MAX_H) { w = Math.round(w * MAX_H / h); h = MAX_H }
            const canvas = document.createElement("canvas")
            canvas.width = w; canvas.height = h
            canvas.getContext("2d").drawImage(img, 0, 0, w, h)
            URL.revokeObjectURL(url)
            canvas.toBlob(blob => res(blob || file), "image/jpeg", 0.90)
          } catch(e) { URL.revokeObjectURL(url); res(file) }
        }
        img.onerror = () => { URL.revokeObjectURL(url); res(file) }
        img.src = url
      } catch(e) { res(file) }
    })
  }

  //  -  -  Leggi prompt da Firebase  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  - 
  async function loadPrompt() {
    try {
      const snap = await getDoc(doc(db, "config", "prompts"))
      if (snap.exists() && snap.data().prompt_fattura) return snap.data().prompt_fattura
    } catch(e) { console.log("Prompt Firebase non disponibile, uso fallback") }
    return null
  }

  //  -  -  Analisi IA  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  - 
  async function handleFile(f) {
    if (!f) return
    setStep("loading"); setProg(5); setProgLabel("Caricamento in corso..."); setOcrError(null)

    try {
      const typeGuess = f.type || (f.name && f.name.toLowerCase().endsWith(".pdf") ? "application/pdf" : "image/jpeg")
      const isImage = typeGuess.startsWith("image/")
      const isPdf   = typeGuess === "application/pdf"
      if (!isImage && !isPdf) {
        setOcrError("Formato non supportato. Usa JPG, PNG o PDF.")
        setStep("upload"); return
      }

      // Carica prompt da Firebase
      setProg(10); setProgLabel("Caricamento prompt AI...")
      const promptBase = await loadPrompt()
      let extractedText = ""
      const PROMPT = promptBase || `Sei un esperto contabile per la ristorazione. Analizza questa fattura e restituisci SOLO JSON valido senza markdown. REGOLE NOME: massimo 8 parole, nome più completo possibile. NO codici articolo alfanumerici (es. AA1234, 640982). ECCEZIONE PESO: se l'unità di misura è pz, conf, cf, cassa, cartone, bottiglia → INCLUDI il peso/volume nel nome (es. "Maionese 5kg", "Uova 30pz", "Olio EVO 5l"). INCLUDERE SEMPRE nel nome queste specificazioni se presenti: Conservazione: al naturale, sott'aceto, sott'olio, affumicato, salmistrato, marinato, fermentato Stato: fresco, precotto, prec, cotto, crudo, abbattuto, abb, decongelato, dec Surgelazione: surgelato, gelo, IQF, frozen, ultra frozen, superfrozen, glassato, glass, -18, S (se isolata), C (se isolata) Tagli: intero, metà, filetti, filoni, trancio, pulito, sporco, mondato, sgusciato Osso: C/O, S/O, DIS Testa: C/T, S/T Calibri gamberi: 1°, 2°, 3°, 4° Calibri polpo: T1 T2 T3 T4 T5 T6 T7 T8 T9 Calibri calamari: U5 U10 1P 2P 3P 4P Calibri pesce: 100/300g, 300/500g, 500/1000g Origine: (MAR), (SEN), (THA), (CHN), (IND), (ITA) — includi se presente Classe: CL.A — includi se presente Abbreviazioni: B.A. (bovino adulto), S/V (sottovuoto), ATM, TR (impanato) Esempi completi: "Gambero Rosso 2° IQF", "Polpo Pulito T2 IQF", "Calamaro Sporco 2P IQF", "Salmone Affumicato Filetto", "Fesa B.A. C/O S/V", "Coscia Pollo CL.A S", "Petto Anatra Mulard Gelo", "Peperoni Rossi al Naturale" REGOLE PREZZO: copia il valore della colonna Prezzo. Se c'è colonna Sconto: applica prezzoUnitario = Prezzo x (1 - Sconto/100). I numeri 4,5,10,22 in ultima colonna sono IVA non sconti. REGOLE UNITA: usa SEMPRE l'unità di misura dalla colonna UM/U.M. della fattura convertita in minuscolo. KG/Kg→kg, LT/Lt/LITRI→l, PZ/pz/NR/nr/N→pz, ML/ml→ml. Default kg per carni, pesce, formaggi, verdura, frutta. Default l per liquidi e bevande. Usa pz solo per prodotti venduti a pezzo intero (uova, limoni, dadi). CATEGORIE: Carni, Pesce, Frutta e Verdura, Freschi, Surgelati, Dispensa CARNI - sotto1: Bovino, Maiale, Pollo, Tacchino, Agnello, Anatra, Coniglio, Selvaggina, Avicoli PESCE - sotto1: Orata, Branzino, Salmone, Pesce Spada, Tonno, Ricciola, Dentice, Cernia, Ombrina, Crostacei, Molluschi, Scampi, Totani, Canocchie, Altri Pesci FRESCHI - sotto1: Formaggi Nobili, Latticini, Salumi, Altri Freschi FRUTTA E VERDURA - sotto1: Frutta, Verdure, Erbe aromatiche SURGELATI - sotto1: Carni, Pesce, Verdure, Gelati e Dolci, Preparati DISPENSA - sotto1: Conserve, Condimenti, Secchi, Bevande analcoliche, Bevande alcoliche, Superalcolici, Detersivi. OVOPRODOTTI: prodotti come pasta d'uovo, misto d'uovo, tuorlo pastorizzato, albume pastorizzato, pasta gialla, pasta tuorlo → categoria Freschi, sotto1 Altri Freschi. NON confondere con pasta alimentare. DETERSIVI: prodotti con parole sgrassatore, detergente, candeggina, ammorbidente, spugna, strofinaccio, sacchi, pellicola, guanti, carta igienica, lavastoviglie, disincrostante, brillantante, igienizzante, deodorante, deodoforante, inox, lucido, wc, caustica, forno, rational, secchio, mocio, scopa, mop, carta mani, asciugamani, nettapavimenti SURGELATI: prodotti con parola surgelato/frozen/ultra frozen/superfrozen/gelo/congelato/IQF/glassato/glass/abbattuto/ABB oppure lettera S o C isolata come ultima parola oppure -18. {"fornitore":"","numero":"","data":"YYYY-MM-DD","totale":0,"iva":0,"prodotti":[{"nome":"","categoria":"","sotto1":"","sotto2":"","quantita":0,"unita":"kg o pz o l","prezzoUnitario":0,"sconto":"","produttore":""}]}`
      if (isPdf) {
        // PDF: parser positionale per prezzi + AI per categorie
        setProg(20); setProgLabel("Estrazione testo dal PDF...")
        if (!window.pdfjsLib) {
          await new Promise((res, rej) => {
            const script = document.createElement("script")
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
            script.onload = res; script.onerror = rej
            document.head.appendChild(script)
          })
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"
        }
        const arrayBuffer = await f.arrayBuffer()
        const pdfDoc = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise

        // Estrai tutti gli item con posizione da tutte le pagine
        const allItems = []
        let fullText = ""
        for (let pg = 1; pg <= pdfDoc.numPages; pg++) {
          const page = await pdfDoc.getPage(pg)
          const tc = await page.getTextContent()
          // pdfjs Y è bottom-up, convertiamo in top-down usando pageHeight
          const vp = page.getViewport({ scale: 1 })
          tc.items.forEach(item => {
            const str = item.str.trim()
            if (!str) return
            const x = Math.round(item.transform[4])
            const y = Math.round(vp.height - item.transform[5]) + (pg - 1) * 1000
            allItems.push({ x, y, str, pg })
          })
          fullText += tc.items.map(i => i.str).join(" ") + "\n"
        }

        // Raggruppa per riga (Y ±4px)
        const rowMap = {}
        allItems.forEach(item => {
          const yk = Math.round(item.y / 4) * 4
          if (!rowMap[yk]) rowMap[yk] = []
          rowMap[yk].push(item)
        })
        const rows = Object.values(rowMap)
          .map(items => ({ y: items[0].y, items: items.sort((a, b) => a.x - b.x) }))
          .sort((a, b) => a.y - b.y)

        // Trova riga intestazione colonne
        const headerKws = ['prezzo', 'quantit', 'sconto', 'importo', 'descrizione', 'u.m.', 'articolo']
        let headerRow = null, headerIdx = 0
        for (let i = 0; i < rows.length; i++) {
          const txt = rows[i].items.map(c => c.str.toLowerCase()).join(" ")
          if (headerKws.filter(k => txt.includes(k)).length >= 2) {
            headerRow = rows[i]; headerIdx = i; break
          }
        }

        // Mappa colonne per X
        const cols = {}
        if (headerRow) {
          headerRow.items.forEach(cell => {
            const t = cell.str.toLowerCase()
            if (t.includes('prezzo')) cols.prezzo = cell.x
            if (t.includes('quantit') || t === 'qtà' || t === 'q.tà') cols.quantita = cell.x
            if (t.includes('sconto')) cols.sconto = cell.x
            if (t.includes('importo') || (t.includes('totale') && !t.includes('documento'))) cols.importo = cell.x
            if (t.includes('descrizione') || t.includes('articolo')) cols.descr = cell.x
            if (t.includes('u.m.') || t === 'um' || t === 'u.m') cols.um = cell.x
          })
        }

        // Trova valore più vicino a colonna X in una riga
        const getCol = (rowItems, xTarget, tol = 50) => {
          if (xTarget === undefined) return ""
          const cands = rowItems.filter(c => Math.abs(c.x - xTarget) <= tol)
          if (!cands.length) return ""
          return cands.sort((a, b) => Math.abs(a.x - xTarget) - Math.abs(b.x - xTarget))[0].str
        }

        const parseNum = s => {
          if (!s) return 0
          return parseFloat(s.replace(/\./g, '').replace(',', '.').replace(/[^0-9.-]/g, '')) || 0
        }

        // Estrai prodotti dalle righe dati
        const IVA_RATES = [4, 5, 10, 22]
        const prodotti = []
        const dataRows = headerRow ? rows.slice(headerIdx + 1) : rows

        for (const row of dataRows) {
          const rowTxt = row.items.map(c => c.str).join(" ")
          // Salta righe senza numeri o troppo corte
          if (!/\d/.test(rowTxt) || row.items.length < 3) continue
          // Salta righe intestazione/totale e righe dettaglio Cavit (Valore/Sconto/Pezzi/Tipo)
          if (/totale|pagamento|scadenza|banca|iban|riferimento|fornitore|fattura|spese|contributo/i.test(rowTxt)) continue

          // Nome: prima cella testuale significativa
          const nameCells = row.items.filter(c => c.str.length > 2 && !/^[\d.,]+$/.test(c.str))
          if (!nameCells.length) continue
          let nome = nameCells[0].str
          // Salta righe dettaglio (Valore, Sconto, Pezzi, Tipo pr.)
          if (/^(valore|sconto|pezzi|tipo pr|kit |arrotond)/i.test(nome)) continue
          // Se il nome sembra un codice articolo (es. VI13025B), prendi la cella successiva
          if (/^[A-Z]{1,4}\d{4,}[A-Z]?$/i.test(nome) && nameCells.length > 1) {
            nome = nameCells[1].str
          }
          if (/^(tot|iva|pag|rif|ban|iban|sca)/i.test(nome)) continue

          const um = getCol(row.items, cols.um) || ""
          const prezzoRaw = getCol(row.items, cols.prezzo)
          const scontoRaw = getCol(row.items, cols.sconto)
          const importoRaw = getCol(row.items, cols.importo)
          const qtaRaw = getCol(row.items, cols.quantita)

          const prezzo = parseNum(prezzoRaw)
          const importo = parseNum(importoRaw)
          const qta = parseNum(qtaRaw) || 1

          if (prezzo <= 0 && importo <= 0) continue

          // Con parser positionale: se viene dalla colonna Sconto è sempre sconto reale
          // Rimuoviamo il filtro IVA_RATES perché sappiamo già da quale colonna viene
          const sconto = cols.sconto !== undefined ? parseNum(scontoRaw) : 0
          const scontoReale = sconto > 0 && sconto < 100
          let prezzoUnitario = prezzo > 0 ? prezzo : (importo / qta)
          if (scontoReale && prezzo > 0) prezzoUnitario = prezzo * (1 - sconto / 100)
          prezzoUnitario = Math.round(prezzoUnitario * 100) / 100

          prodotti.push({ nome, um, qta, prezzo, sconto: scontoReale ? String(sconto) : "", prezzoUnitario, importo })
        }

        if (prodotti.length === 0) {
          // Fallback: manda tutto all'AI se parser non trova niente
          setProg(45); setProgLabel("Analisi AI in corso...")
          const ctrl2 = new AbortController()
          const to2 = setTimeout(() => ctrl2.abort(), 90000)
          const res2 = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST", signal: ctrl2.signal,
            headers: { "Content-Type": "application/json", "Authorization": "Bearer " + import.meta.env.VITE_GROQ_KEY },
            body: JSON.stringify({ model: "meta-llama/llama-4-scout-17b-16e-instruct", max_tokens: 4096,
              messages: [{ role: "user", content: PROMPT + "\n\nTESTO FATTURA:\n" + fullText }] })
          })
          clearTimeout(to2)
          const data2 = await res2.json()
          if (data2.error) throw new Error(data2.error.message || "Errore Groq")
          const raw2 = data2.choices?.[0]?.message?.content || ""
          const match2 = raw2.match(/\{[\s\S]*\}/)
          if (!match2) throw new Error("Risposta AI non valida - riprova")
          processResult(JSON.parse(cleanJSON(match2[0])))
          return
        }

        // Manda solo i nomi all'AI per categoria/tipologia/regione
        setProg(45); setProgLabel("Categorizzazione AI in corso...")
        const PROMPT_CAT = `Categorizza questi prodotti alimentari. Restituisci SOLO JSON valido.
Per ogni prodotto: categoria, sotto1, sotto2, unita.
CATEGORIE: Carni, Pesce, Frutta e Verdura, Freschi, Surgelati, Dispensa.

SURGELATI: prodotti con asterisco C*** S*** o parola surgelato/gelo/congelato/IQF/glassato/glassat/abbattuto/ABB/GLASS/GL.
UNITA - usa SEMPRE l'UM fornito convertito in minuscolo: KG→kg, LT/LITRI→l, PZ/NR→pz, ML→ml. Se UM è KG o simile metti sempre kg. Solo per vini/bottiglie usa bottiglia. Default kg per carni/pesce/formaggi/verdura, l per liquidi, pz solo per uova/limoni/dadi/pezzi interi.
{"fornitore":"","numero":"","data":"","prodotti":[{"nome":"","categoria":"","sotto1":"","sotto2":"","unita":"kg o pz o l o bottiglia"}]}

PRODOTTI:
` + prodotti.map((p, i) => `${i+1}. ${p.nome} (UM:${p.um||"?"})`).join("\n")

        const ctrl = new AbortController()
        const to = setTimeout(() => ctrl.abort(), 60000)
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST", signal: ctrl.signal,
          headers: { "Content-Type": "application/json", "Authorization": "Bearer " + import.meta.env.VITE_GROQ_KEY },
          body: JSON.stringify({ model: "meta-llama/llama-4-scout-17b-16e-instruct", max_tokens: 2048,
            messages: [{ role: "user", content: PROMPT_CAT }] })
        })
        clearTimeout(to)
        const data = await res.json()
        if (data.error) throw new Error(data.error.message || "Errore Groq")
        const raw = data.choices?.[0]?.message?.content || ""
        const match = raw.match(/\{[\s\S]*\}/)
        if (!match) throw new Error("Risposta AI non valida - riprova")
        const catData = JSON.parse(cleanJSON(match[0]))
        const catMap = {}
        ;(catData.prodotti || []).forEach((p, i) => { catMap[i] = p })

        processResult({
          fornitore: catData.fornitore || f.name.replace(/\.pdf$/i, ""),
          numero: catData.numero || "",
          data: catData.data || "",
          totale: 0, iva: 0,
          prodotti: prodotti.map((p, i) => {
            const localDbMatch = lookupFood(p.nome)
            const localDbUnit = localDbMatch ? localDbMatch.unit : null
            return {
              nome: p.nome,
              categoria: catMap[i]?.categoria || "",
              sotto1: catMap[i]?.sotto1 || "",
              sotto2: catMap[i]?.sotto2 || "",
              quantita: p.qta,
              unita: localDbUnit || (p.um ? p.um.toLowerCase().replace("lt","l").replace("litri","l").replace("kgs","kg") : null) || catMap[i]?.unita || "kg",
              prezzoUnitario: p.prezzoUnitario,
              sconto: p.sconto,
              produttore: ""
            }
          })
        })

      } else {
        //  -  -  IMMAGINE: comprimi e manda a Groq con visione  -  -  -  -  -  -  -  - 
        setProg(20); setProgLabel("Compressione immagine...")
        const compressed = await compressImage(f)
        setProg(35); setProgLabel("Lettura immagine...")
        const base64 = await new Promise((res, rej) => {
          const reader = new FileReader()
          reader.onload = () => res(reader.result.split(",")[1])
          reader.onerror = () => rej(new Error("Lettura fallita"))
          reader.readAsDataURL(compressed)
        })

        setProg(50); setProgLabel("Analisi AI in corso...")
        const ctrl = new AbortController()
        const to = setTimeout(() => ctrl.abort(), 90000)
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST", signal: ctrl.signal,
          headers: { "Content-Type": "application/json", "Authorization": "Bearer " + import.meta.env.VITE_GROQ_KEY },
          body: JSON.stringify({
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            max_tokens: 4096,
            messages: [{
              role: "user",
              content: [
                { type: "image_url", image_url: { url: "data:image/jpeg;base64," + base64 } },
                { type: "text", text: PROMPT }
              ]
            }]
          })
        })
        clearTimeout(to)
        const data = await res.json()
        if (data.error) throw new Error(data.error.message || "Errore Groq")
        const raw = data.choices?.[0]?.message?.content || ""
        const match = raw.match(/\{[\s\S]*\}/)
        if (!match) throw new Error("Risposta AI non valida  -  riprova con foto più nitida")
        processResult(JSON.parse(cleanJSON(match[0])))
      }

    } catch(e) {
      const msg = e.name === "AbortError"
        ? "Timeout: l'AI non ha risposto. Riprova."
        : "Errore: " + e.message
      setOcrError(msg)
      setStep("upload")
    }
  }

  //  -  -  Processa risultato AI  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  - 
  function processResult(parsed) {
    setProg(85); setProgLabel("Smistamento prodotti...")

    function guessCat(nome) {
      // Prima cerca nel database prodotti
      const dbResult = lookupFood(nome)
      if (dbResult) return dbResult.cat

      // Fallback regex
      const n = nome.toLowerCase()
      if (/detersiv|sapone|candegg|disinfett|multiuso|sgrassator|lavastoviglie|spugna|strofinaccio|carta igien|scottex|sacchetti|brillantante|wc gel|disincrost|panno|bobina|guanti nitr|tovaglioli|piastrelle|paviment/.test(n)) return "Dispensa"
      if (/surgelat|gelo|frozen|\biqf\b|glass|abbattut|\babb\b/.test(n)) return "Surgelati"
      if (/pelati|passata|conserva|tonno scatol|sardine scatol|fagioli scatol|ceci scatol|lenticchie|acciughe scatol|sugo pronto|legumi in/.test(n)) return "Dispensa"
      if (/birra|beer|lager|ipa|weiss|radler|corona|heineken|peroni|moretti|acqua mineral|coca.cola|fanta|sprite|succo|aranciata|limonata|energy drink|red bull|tonica|ginger|schweppes|gin |vodka|rum |whisky|whiskey|amaro|grappa|limoncello|aperol|campari|cynar|fernet|sambuca|brandy|cognac|calvados|tequila|mezcal|lipton|baileys/.test(n)) return "Dispensa"
      if (/barolo|barbaresco|barbera|nebbiolo|chianti|brunello|amarone|prosecco|franciacorta|pinot grigio|pinot nero|vermentino|nero d.avola|primitivo|sangiovese|soave|lugana|gewurz|riesling|chardonnay|sauvignon|merlot|cabernet|syrah|champagne|bordeaux|borgogna|alsace|chablis|bollicine|spumante|cava|docg|doc |igt |cantina|tenuta|donnafugata|antinori|gaja|sassicaia|conterno|giacosa|ceretto/.test(n)) return "Dispensa"
      if (/pollo|manzo|maiale|vitello|agnello|coniglio|tacchino|cinghiale|anatra|piccione|quaglia|girello|fesa|bistecca|braciola|arrosto|spezzatino|macinato/.test(n)) return "Carni"
      if (/prosciutto|salame|mortadella|bresaola|coppa|speck|affettat|salumi|uova|uovo|pastorizzat|tuorlo|albume|wurstel|strutto/.test(n)) return "Freschi"
      if (/pesce|merluzzo|salmone|tonno fresc|branzino|orata|sogliola|baccala|cozze|vongole|gamberi|scampi|calamari|polpo|seppia|aragosta|astice|granchio|dentice|spigola/.test(n)) return "Pesce"
      if (/mela|pera|pesca|albicocca|ciliegia|arancia|limone|kiwi|ananas|banana|fragola|mango|melone|cocomero|fico|frutta|pomodor|insalata|lattuga|zucchine|melanzane|peperone|cipolla|aglio|carota|sedano|finocchio|broccoli|cavolfiore|asparagi|funghi|radicchio|rucola|spinaci|patate|bietola|carciofo|piselli|fagiolini|mais |zucca|porri|cetrioli|verdura|fave|peperoni/.test(n)) return "Frutta e Verdura"
      if (/parmigiano|mozzarella|grana |burro|latte |panna|yogurt|ricotta|fontina|asiago|brie|gorgonzola|provolone|scamorza|mascarpone|formaggio|toma |pecorino|castelmagno|taleggio|stracchino/.test(n)) return "Freschi"
      return "Dispensa"
    }





    const fatturaData = {
      sup:   parsed.fornitore || "",
      num:   parsed.numero    || "",
      date:  parsed.data      || "",
      total: parsed.totale    ? String(parsed.totale) : "",
      vat:   parsed.iva       ? String(parsed.iva)    : "",
    }
    setFattura(fatturaData)
    try { localStorage.setItem("fm_ocr_fattura", JSON.stringify(fatturaData)) } catch(e) {}

    const prodotti = parsed.prodotti || []
    const foundList = prodotti.filter(p => p && p.nome).map(p => {
      // 1. Controlla prima il dizionario imparato dall'utente
      const learningKey = n => n.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim().split(/\s+/).slice(0, 3).join(" ")
      const nomeKey = learningKey(p.nome)
      const learnedMatch = learned && learned[nomeKey]
      // 2. Determina categoria AI
      const aiCat = normCat(p.categoria) || guessCat(p.nome)
      // DB lookup per categoria e unità
      const dbMatch = !learnedMatch ? lookupFood(p.nome) : null
      // PRIORITÀ: learned > DB locale > AI
      const rawCat = (learnedMatch ? learnedMatch.cat : null) || (dbMatch ? dbMatch.cat : null) || aiCat
      // Vini da bere → Dispensa/Bevande alcoliche (sezione Vini non attiva)
      const cat = rawCat === "Vini" ? "Dispensa" : rawCat
      const sotto1Final = (learnedMatch ? learnedMatch.sotto1 : null) || (dbMatch ? dbMatch.sotto1 : "") || (rawCat === "Vini" ? "Bevande alcoliche" : p.sotto1) || ""
      const sotto2Final = (learnedMatch ? learnedMatch.sotto2 : null) || (dbMatch ? dbMatch.sotto2 : "") || (rawCat === "Vini" ? "" : p.sotto2) || ""
      const dbUnit = (learnedMatch ? learnedMatch.unit : null) || (dbMatch ? dbMatch.unit : null)
      const nameLower = normNameForMatch(p.nome)
      const existing = ings.find(i => {
        if (i.cat !== cat) return false
        const aNorm = normNameForMatch(i.name)
        if (aNorm === nameLower) return true
        const aWords = aNorm.split(/\s+/).filter(w => w.length >= 4)
        const bWords = nameLower.split(/\s+/).filter(w => w.length >= 4)
        if (!aWords.length || !bWords.length) return false
        const common = aWords.filter(w => bWords.includes(w))
        const union = new Set([...aWords, ...bWords]).size
        return common.length / union >= 0.8 && common.length >= 2
      })

      // Prezzo: usa prezzoUnitario dell'AI (già calcolato dal prompt Firebase)
      // Fallback client-side se AI non ha calcolato
      const prezzoUnitario = (() => {
        const IVA_RATES = [4, 5, 10, 22]
        // Se AI ha già calcolato prezzoUnitario, usalo direttamente
        const aiPrice = parseFloat(String(p.prezzoUnitario || "0").replace(",", ".")) || 0
        if (aiPrice > 0) return Math.round(aiPrice * 100) / 100
        // Fallback: usa prezzoLordo con sconto client-side
        const lordo = parseFloat(String(p.prezzoLordo || "0").replace(",", ".")) || 0
        const importo = parseFloat(String(p.importoTotale || "0").replace(",", ".")) || 0
        const qty = parseFloat(String(p.quantita || "1").replace(",", ".")) || 1
        if (lordo > 0) {
          const scontoStr = String(p.sconto || "").replace(",", ".").replace("%", "").trim()
          const sconto = parseFloat(scontoStr) || 0
          const scontoReale = sconto > 0 && sconto < 100 && !IVA_RATES.includes(sconto)
          const price = scontoReale ? lordo * (1 - sconto / 100) : lordo
          return Math.round(price * 100) / 100
        }
        if (importo > 0 && qty > 0) return Math.round(importo / qty * 100) / 100
        return 0
      })()

      return {
        nome: p.nome, nomeEdit: p.nome,
        quantita: p.quantita, unita: p.unita,
        prezzoUnitario,
        sconto: p.sconto || "",
        sotto1: sotto1Final, sotto2: sotto2Final,
        catOriginal: cat, catChanged: false,
        tipo: existing ? "update" : "new",
        ingId: existing ? existing.id : null,
        ingName: existing ? existing.name : null,
        cat, include: true,

      }
    })

    setFound(foundList)

    // ── Rilevamento anomalie prezzi ──────────────────────────────────────────
    const alerts = []
    foundList.forEach(p => {
      if (!p.include || !p.prezzoUnitario || !p.ingId) return
      const ing = ings.find(i => i.id === p.ingId)
      if (!ing) return
      // Prendo il prezzo MINIMO tra tutti i fornitori esistenti
      const prezziEsistenti = (ing.prezzi || []).map(x => x.price).filter(x => x > 0)
      const prezzoRif = prezziEsistenti.length > 0 ? Math.min(...prezziEsistenti) : ing.cur
      if (!prezzoRif || prezzoRif <= 0) return
      const pct = Math.round(((p.prezzoUnitario - prezzoRif) / prezzoRif) * 100)
      if (pct <= 5) return // sotto soglia, nessun alert
      let livello, colore, emoji
      if (pct <= 10) { livello = "Aumento"; colore = "#e8a838"; emoji = "🟡" }
      else if (pct <= 25) { livello = "Aumento rilevante"; colore = "#f97316"; emoji = "🟠" }
      else { livello = "Aumento preoccupante"; colore = "#f87171"; emoji = "🔴" }
      alerts.push({
        nome: p.nomeEdit || p.nome,
        prezzoVecchio: prezzoRif,
        prezzoNuovo: p.prezzoUnitario,
        unit: ing.unit || p.unita || "kg",
        pct,
        livello,
        colore,
        emoji
      })
    })

    if (alerts.length > 0) {
      // Vibrazione: più intensa per aumenti preoccupanti
      const hasGrave = alerts.some(a => a.pct > 25)
      if (navigator.vibrate) {
        navigator.vibrate(hasGrave ? [200, 100, 200, 100, 200] : [150, 100, 150])
      }
      setPriceAlerts(alerts)
    }

    setProg(100); setProgLabel("Completato!")
    setStep("review")
  }

  //  -  -  Normalizza categoria dall'AI  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  - 
  function normCat(cat) {
    if (!cat) return null
    const c = cat.toLowerCase().trim()
    if (c.includes("carne") || c === "carni") return "Carni"
    if (c.includes("pesce")) return "Pesce"
    if (c.includes("frutta") || c.includes("verdura")) return "Frutta e Verdura"
    if (c.includes("latticin")) return "Freschi"
    if (c.includes("fresco") || c.includes("freschi")) return "Freschi"
    if (c.includes("surgel")) return "Surgelati"
    if (c.includes("vino") || c.includes("vini")) return "Dispensa"
    if (c.includes("bevand")) return "Dispensa"
    if (c.includes("scatol")) return "Dispensa"
    if (c.includes("detersiv")) return "Dispensa"
    return null
  }

  //  -  -  Salva tutto  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  - 
  function save() {
    const e = {}
    if (!fattura.sup.trim()) e.sup = "Obbligatorio"
    if (!fattura.date)       e.date = "Obbligatoria"
    if (!fattura.total || +fattura.total <= 0) e.total = "Totale > 0"
    if (Object.keys(e).length) { setFattErr(e); return }

    const toProcess = found.filter(p => p.include && p.prezzoUnitario > 0)

    // Aggiorna prezzi ingredienti esistenti
    const toUpdate = toProcess.filter(p => p.tipo === "update")
    if (toUpdate.length > 0) {
      setIngs(prev => prev.map(ing => {
        const match = toUpdate.find(p => p.ingId === ing.id)
        if (!match) return ing
        const newPrice = match.prezzoUnitario
        const sup = fattura.sup.trim() || "Fornitore"
        // Aggiorna array prezzi: max 5 fornitori, ordinati per prezzo crescente
        const oldPrezzi = ing.prezzi && ing.prezzi.length > 0
          ? [...ing.prezzi]
          : [{ sup, price: ing.cur, date: fattura.date }]
        const idx = oldPrezzi.findIndex(p => normFornitore(p.sup) === normFornitore(sup))
        if (idx >= 0) {
          // Aggiorna solo se il prezzo è cambiato
          if (oldPrezzi[idx].price !== newPrice) {
            oldPrezzi[idx] = { sup, prevPrice: oldPrezzi[idx].price, price: newPrice, date: fattura.date }
          }
        } else {
          oldPrezzi.push({ sup, price: newPrice, date: fattura.date })
        }
        oldPrezzi.sort((a, b) => a.price - b.price)
        const newPrezzi = oldPrezzi.slice(0, 5)
        const bestPrice = newPrezzi[0].price
        const newAvg = Math.round(((ing.avg * 0.7) + (bestPrice * 0.3)) * 100) / 100
        const catFields = match.cat && match.cat !== ing.cat ? { cat: match.cat, sotto1: match.sotto1 || "", sotto2: match.sotto2 || "" } : {}
        return { ...ing, prezzi: newPrezzi, prev: ing.cur, cur: bestPrice, avg: newAvg, ...catFields }
      }))
    }

    // Aggiungi nuovi ingredienti
    const toAdd = toProcess.filter(p => p.tipo === "new")
    if (toAdd.length > 0) {
      const newIngs = toAdd.map(p => ({
        id: "i" + uid(),
        name: (p.nomeEdit || p.nome).trim(),
        cat: p.cat,
        unit: p.confUnit || (["kg","l","litri","pz","ml","g"].includes((p.unita||"").toLowerCase()) ? (p.unita === "litri" ? "l" : p.unita.toLowerCase()) : "kg"),
        cur: p.prezzoUnitario,
        avg: p.prezzoUnitario,
        prezzi: p.prezzoUnitario > 0 ? [{ sup: fattura.sup.trim() || "Fornitore", price: p.prezzoUnitario, date: fattura.date }] : [],
        sotto1: p.sotto1 || "",
        sotto2: p.sotto2 || "",

      }))
      setIngs(prev => [...prev, ...newIngs])
    }

    // Impara le correzioni manuali dell'utente (su TUTTI i prodotti, non solo quelli con prezzo)
    const newLearned = { ...learned }
    let learnedChanged = false
    const learningKey = n => n.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim().split(/\s+/).slice(0, 3).join(" ")
    found.filter(p => p.catChanged && p.cat).forEach(p => {
      const key = learningKey(p.nomeEdit || p.nome)
      if (key.length >= 3) {
        newLearned[key] = { cat: p.cat, sotto1: p.sotto1 || "", sotto2: p.sotto2 || "" }
        learnedChanged = true
      }
    })
    if (learnedChanged) setLearned(newLearned)

    // Salva fattura
    const v = +fattura.vat || 0
    const newInv = {
      id: "v" + uid(), sup: fattura.sup, num: fattura.num,
      date: fattura.date, total: +fattura.total,
      vat: v, net: +fattura.total - v, ok: true,
      prodotti: found.filter(p => p.include).map(p => ({
        nome: (p.nomeEdit || p.nome).trim(), quantita: p.quantita, unita: p.unita, prezzoUnitario: p.prezzoUnitario
      }))
    }
    setInvs(prev => [newInv, ...prev])

    // Auto-crea o aggiorna fornitore (normalizzato)
    const supName = fattura.sup.trim()
    if (supName) {
      setFornitori(prev => {
        const similar = prev.find(f => simFornitore(f.name, supName) >= 0.85)
        if (similar) return prev
        return [...prev, { id: "f" + uid(), name: supName, tel: "", email: "", cat: "" }]
      })
    }

    try { localStorage.removeItem("fm_ocr_fattura") } catch(e) {}

    // ── Alert prezzi post-salvataggio ────────────────────────────────────────
    const newAlerts = []
    found.filter(p => p.include && p.prezzoUnitario > 0 && p.ingId).forEach(p => {
      const ing = ings.find(i => i.id === p.ingId)
      if (!ing) return
      const prezziEsistenti = (ing.prezzi || []).map(x => x.price).filter(x => x > 0)
      const prezzoRif = prezziEsistenti.length > 0 ? Math.min(...prezziEsistenti) : ing.cur
      if (!prezzoRif || prezzoRif <= 0) return
      const pct = Math.round(((p.prezzoUnitario - prezzoRif) / prezzoRif) * 100)
      if (pct <= 5) return
      let livello, colore, emoji
      if (pct <= 10) { livello = "Aumento"; colore = "#e8a838"; emoji = "🟡" }
      else if (pct <= 25) { livello = "Aumento rilevante"; colore = "#f97316"; emoji = "🟠" }
      else { livello = "Aumento preoccupante"; colore = "#f87171"; emoji = "🔴" }
      newAlerts.push({
        nome: p.nomeEdit || p.nome,
        prezzoVecchio: prezzoRif,
        prezzoNuovo: p.prezzoUnitario,
        unit: p.unitaBase || p.unita || "kg",
        pct, livello, colore, emoji
      })
    })
    if (newAlerts.length > 0) {
      const hasGrave = newAlerts.some(a => a.pct > 25)
      if (navigator.vibrate) {
        navigator.vibrate(hasGrave ? [200, 100, 200, 100, 200] : [150, 100, 150])
      }
      setPriceAlerts(newAlerts)
      // Popola recentAlerts con cat+sotto1 degli ingredienti aumentati
      const recents = found.filter(p => p.include && p.ingId && newAlerts.some(a => a.nome === (p.nomeEdit || p.nome))).map(p => {
        const ing = ings.find(i => i.id === p.ingId)
        return { ingId: p.ingId, cat: ing?.cat || p.cat, sotto1: ing?.sotto1 || p.sotto1 || "" }
      })
      setRecentAlerts(recents)
      setStep("alerts")
    } else {
      reset()
    }
  }

  //  -  -  RENDER  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  - 
  const updCount = found.filter(p => p.include && p.tipo === "update").length
  const newCount = found.filter(p => p.include && p.tipo === "new").length

  return (
    <div>
      {/* Header */}
      <div style={row({ justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", alignItems: "flex-start" })}>
        <div>
          <div style={{ fontFamily: "'Georgia',serif", fontSize: 20, color: STYLE.t1 }}>Forniture</div>
          <div style={{ fontSize: 12, color: STYLE.t3 }}>{invs.length} fatture . {fornitori.length} fornitori</div>
        </div>
        <div style={row({ gap: 8 })}>
          {step === "list" && invTab === "fatture" && <button style={btn("p")} onClick={() => { pushHistory?.(); setStep("upload") }}>+ Aggiorna prezzi</button>}
          {step === "list" && invTab === "fornitori" && <button style={btn("p")} onClick={() => { setForniEdit(null); setForniForm({ name: "", tel: "", email: "", cat: "" }); setForniOpen(true) }}>+ Fornitore</button>}
          {step !== "list" && <button style={btn("g")} onClick={reset}> Annulla</button>}
        </div>
      </div>

      {/* Tabs */}
      {step === "list" && (
        <div style={row({ gap: 0, marginBottom: 16 })}>
          {[["fatture", "Fatture"], ["fornitori", "Fornitori"]].map(([id, label], idx) => {
            const urgenti = 0
            return (
              <button key={id} onClick={() => setInvTab(id)}
                style={{ padding: "7px 20px", background: invTab === id ? STYLE.ac : STYLE.el, color: invTab === id ? "#0d0d0f" : STYLE.t2, border: "none", fontFamily: "inherit", fontSize: 13, fontWeight: invTab === id ? 700 : 400, cursor: "pointer", borderRadius: idx === 0 ? "8px 0 0 8px" : idx === 2 ? "0 8px 8px 0" : "0", position: "relative" }}>
                {label}
                {urgenti > 0 && <span style={{ position: "absolute", top: -4, right: -4, width: 16, height: 16, background: STYLE.red, borderRadius: "50%", fontSize: 9, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>{urgenti}</span>}
              </button>
            )
          })}
        </div>
      )}

      {/*  -  -  TAB BANCHETTI  -  -  */}

      {/*  -  -  TAB FORNITORI  -  -  */}
      {step === "list" && invTab === "fornitori" && (
        <div>
          {/* Fornitore detail */}
          {selFornitore && (() => {
            const f = fornitori.find(x => x.id === selFornitore)
            if (!f) return null
            const fInvs = invs.filter(i => simFornitore(i.sup, f.name) >= 0.75)
            const meseAtt = new Date().toISOString().slice(0,7)
            const totMese = fInvs.filter(i => i.date.startsWith(meseAtt)).reduce((s,i) => s + i.total, 0)
            const totAnno = fInvs.filter(i => i.date.startsWith(new Date().getFullYear().toString())).reduce((s,i) => s + i.total, 0)
            return (
              <div>
                <div style={row({ marginBottom: 16 })}>
                  <button onClick={() => setSelFornitore(null)} style={{ background: "none", border: "none", color: STYLE.ac, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, padding: 0 }}> Fornitori</button>
                  <span style={{ color: STYLE.t3, fontSize: 13 }}>/</span>
                  <span style={{ fontSize: 13, color: STYLE.t1, fontWeight: 600 }}>{f.name}</span>
                </div>

                {/* Dati contatto */}
                <div style={card({ padding: 16, marginBottom: 14 })}>
                  <div style={row({ justifyContent: "space-between", marginBottom: 12 })}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: STYLE.t3 }}>Dati contatto</div>
                    <div style={row({ gap: 8 })}>
                      <button onClick={() => { setForniEdit(f); setForniForm({ name: f.name, tel: f.tel||"", email: f.email||"", cat: f.cat||"" }); setForniOpen(true) }}
                        style={{ background: "none", border: "none", color: STYLE.t2, cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>Modifica</button>

                    </div>
                  </div>
                  {[["Nome", f.name], ["Telefono", f.tel||" - "], ["Email", f.email||" - "], ["Categoria", f.cat||" - "]].map(([l,v]) => (
                    <div key={l} style={row({ justifyContent: "space-between", padding: "6px 0", borderBottom: STYLE.bds })}>
                      <span style={{ fontSize: 12, color: STYLE.t3 }}>{l}</span>
                      <span style={{ fontSize: 13, color: STYLE.t1, fontWeight: 500 }}>{v}</span>
                    </div>
                  ))}
                </div>

                {/* Totali */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                  {[{ l: "Speso questo mese", v: formatEuro(totMese) }, { l: "Speso quest'anno", v: formatEuro(totAnno) }].map((k,i) => (
                    <div key={i} style={card({ padding: "12px 14px" })}>
                      <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: STYLE.t3, fontWeight: 600, marginBottom: 4 }}>{k.l}</div>
                      <div style={{ fontFamily: "'Georgia',serif", fontSize: 20, color: STYLE.ac }}>{k.v}</div>
                    </div>
                  ))}
                </div>

                {/* Storico fatture */}
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: STYLE.t3, marginBottom: 10 }}>
                  Fatture ({fInvs.length})
                </div>
                {fInvs.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "24px 0", color: STYLE.t3, fontSize: 13 }}>Nessuna fattura</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {fInvs.map(inv => (
                      <div key={inv.id} style={card({ padding: "12px 14px" })} onClick={() => setDetailInv(inv)}>
                        <div style={row({ justifyContent: "space-between" })}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: STYLE.t1 }}>{inv.num || " - "}</div>
                            <div style={{ fontSize: 11, color: STYLE.t3 }}>{formatDate(inv.date)}</div>
                          </div>
                          <div style={{ fontFamily: "'Georgia',serif", fontSize: 17, color: STYLE.t1 }}>{formatEuro(inv.total)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Bottone elimina fornitore */}
                <div style={{ marginTop: 24, paddingTop: 16, borderTop: STYLE.bds }}>
                  <button
                    onClick={() => {
                      if (window.confirm("Eliminare il fornitore " + f.name + "? Le fatture associate rimarranno nell'archivio.")) {
                        setFornitori(prev => prev.filter(x => x.id !== f.id))
                        setSelFornitore(null)
                      }
                    }}
                    style={{ ...btn("s"), background: STYLE.rd, color: STYLE.red, borderColor: "rgba(248,113,113,0.3)", width: "100%", justifyContent: "center", padding: "10px" }}>
                    Elimina fornitore
                  </button>
                </div>
              </div>
            )
          })()}

          {/* Lista fornitori */}
          {!selFornitore && (
            fornitori.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 0", color: STYLE.t3, fontSize: 13 }}>
                Nessun fornitore  -  vengono creati automaticamente quando carichi una fattura
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {fornitori.map(f => {
                  const fInvs = invs.filter(i => simFornitore(i.sup, f.name) >= 0.75)
                  const totAnno = fInvs.filter(i => i.date.startsWith(new Date().getFullYear().toString())).reduce((s,i) => s + i.total, 0)
                  return (
                    <div key={f.id} style={{ ...card({ padding: "14px 16px", cursor: "pointer" }) }} onClick={() => { pushHistory?.(); setSelFornitore(f.id) }}>
                      <div style={row({ justifyContent: "space-between" })}>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: STYLE.t1, marginBottom: 2 }}>{f.name}</div>
                          <div style={{ fontSize: 11, color: STYLE.t3 }}>{f.cat || " - "} . {fInvs.length} fatture</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 13, color: STYLE.t2 }}>Anno</div>
                          <div style={{ fontFamily: "'Georgia',serif", fontSize: 17, color: STYLE.ac }}>{formatEuro(totAnno)}</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          )}

          {/* Modal aggiungi/modifica fornitore */}
          {forniOpen && (
            <div onClick={e => e.target === e.currentTarget && setForniOpen(false)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 999 }}>
              <div style={{ background: STYLE.surf, border: STYLE.bd, borderRadius: 16, width: "100%", maxWidth: 400 }}>
                <div style={row({ justifyContent: "space-between", padding: "18px 22px 0" })}>
                  <span style={{ fontFamily: "'Georgia',serif", fontSize: 18, color: STYLE.t1 }}>{forniEdit ? "Modifica fornitore" : "Nuovo fornitore"}</span>
                  <button onClick={() => setForniOpen(false)} style={{ background: STYLE.el, border: STYLE.bd, borderRadius: STYLE.r, width: 28, height: 28, cursor: "pointer", color: STYLE.t3 }}>x</button>
                </div>
                <div style={{ padding: "16px 22px" }}>
                  <Fld label="Nome *"><input style={inp()} value={forniForm.name} onChange={e => setForniForm(f => ({ ...f, name: e.target.value }))} placeholder="es. MARR SpA" /></Fld>
                  <Fld label="Telefono"><input style={inp()} value={forniForm.tel} onChange={e => setForniForm(f => ({ ...f, tel: e.target.value }))} placeholder="es. 011 543070" /></Fld>
                  <Fld label="Email"><input style={inp()} value={forniForm.email} onChange={e => setForniForm(f => ({ ...f, email: e.target.value }))} placeholder="es. ordini@marr.it" /></Fld>
                  <Fld label="Categoria merci"><input style={inp()} value={forniForm.cat} onChange={e => setForniForm(f => ({ ...f, cat: e.target.value }))} placeholder="es. Carni, Pesce, Alimentari..." /></Fld>
                </div>
                <div style={row({ justifyContent: "flex-end", padding: "0 22px 18px", gap: 8 })}>
                  <button style={btn("g")} onClick={() => setForniOpen(false)}>Annulla</button>
                  <button style={btn("p")} onClick={() => {
                    if (!forniForm.name.trim()) return
                    if (forniEdit) {
                      setFornitori(prev => prev.map(f => f.id === forniEdit.id ? { ...f, ...forniForm, name: forniForm.name.trim() } : f))
                    } else {
                      setFornitori(prev => [...prev, { id: "f" + uid(), ...forniForm, name: forniForm.name.trim() }])
                    }
                    setForniOpen(false)
                  }}>Salva</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/*  -  -  STEP: UPLOAD  -  -  */}
      {step === "upload" && (
        <div style={card({ padding: 24, maxWidth: 500 })}>
          <div style={{ fontFamily: "'Georgia',serif", fontSize: 16, color: STYLE.t1, marginBottom: 16 }}>Scatta o carica la foto della fattura</div>
          {ocrError && (
            <div style={{ marginBottom: 14, padding: "10px 14px", background: STYLE.rd, border: "1px solid rgba(248,113,113,0.3)", borderRadius: 6, fontSize: 13, color: STYLE.red }}>{ocrError}</div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Fotocamera diretta */}
            <label style={{ display: "block", border: "2px dashed #2a2a31", borderRadius: 10, padding: 24, textAlign: "center", cursor: "pointer", background: STYLE.el }}>
              <input type="file" accept="image/*" capture="environment"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
                style={{ display: "none" }}
              />
              <div style={{ fontSize: 28, marginBottom: 6 }}>📷</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: STYLE.t1, marginBottom: 2 }}>Fotocamera</div>
              <div style={{ fontSize: 11, color: STYLE.t3 }}>Scatta direttamente</div>
            </label>
            {/* Galleria foto */}
            <label style={{ display: "block", border: "2px dashed #2a2a31", borderRadius: 10, padding: 20, textAlign: "center", cursor: "pointer", background: STYLE.el }}>
              <input type="file" accept="image/jpeg,image/png,image/webp"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
                style={{ display: "none" }}
              />
              <div style={{ fontSize: 24, marginBottom: 6 }}>🖼️</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: STYLE.t2, marginBottom: 2 }}>Galleria foto</div>
              <div style={{ fontSize: 11, color: STYLE.t3 }}>JPG o PNG dalla galleria</div>
            </label>
            {/* PDF */}
            <label style={{ display: "block", border: "2px dashed #2a2a31", borderRadius: 10, padding: 20, textAlign: "center", cursor: "pointer", background: STYLE.el }}>
              <input type="file" accept="application/pdf,.pdf"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
                style={{ display: "none" }}
              />
              <div style={{ fontSize: 24, marginBottom: 6 }}>📄</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: STYLE.t2, marginBottom: 2 }}>File PDF</div>
              <div style={{ fontSize: 11, color: STYLE.t3 }}>Apre direttamente i file</div>
            </label>
            <div style={{ fontSize: 11, color: STYLE.t3, textAlign: "center" }}>Le immagini vengono compresse automaticamente</div>
          </div>
        </div>
      )}

      {/*  -  -  STEP: LOADING  -  -  */}
      {step === "loading" && (
        <div style={card({ padding: 32, maxWidth: 500 })}>
          <div style={{ fontFamily: "'Georgia',serif", fontSize: 16, color: STYLE.t1, marginBottom: 20, textAlign: "center" }}>Analisi in corso...</div>
          <div style={{ height: 6, background: STYLE.el, borderRadius: 999, overflow: "hidden", marginBottom: 12 }}>
            <div style={{ height: "100%", width: prog + "%", background: STYLE.ac, borderRadius: 999, transition: "width 0.4s ease" }} />
          </div>
          <div style={{ fontSize: 13, color: STYLE.t3, textAlign: "center" }}>{progLabel}</div>
          <div style={{ fontSize: 11, color: STYLE.t3, textAlign: "center", marginTop: 8 }}>{prog}%</div>
        </div>
      )}

      {/*  -  -  STEP: REVIEW  -  -  */}
      {/* STEP: ALERTS POST-SALVATAGGIO */}
      {step === "alerts" && priceAlerts.length > 0 && (
        <div style={{ maxWidth: 600 }}>
          <div style={{ fontFamily: "'Georgia',serif", fontSize: 20, color: STYLE.t1, marginBottom: 4 }}>Fattura salvata ✓</div>
          <div style={{ fontSize: 12, color: STYLE.t3, marginBottom: 20 }}>Rilevate variazioni di prezzo sui dati confermati</div>

          <div style={{ marginBottom: 16, background: "#1a0a00", border: "1px solid #f97316", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid rgba(249,115,22,0.3)", background: "rgba(249,115,22,0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>⚠️</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#f97316" }}>
                  {priceAlerts.length === 1 ? "1 aumento di prezzo rilevato" : priceAlerts.length + " aumenti di prezzo rilevati"}
                </span>
              </div>
            </div>
            <div style={{ padding: "8px 0" }}>
              {priceAlerts.map((a, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", borderBottom: i < priceAlerts.length - 1 ? "1px solid rgba(249,115,22,0.15)" : "none" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: STYLE.t1, marginBottom: 3 }}>{a.emoji} {a.nome}</div>
                    <div style={{ fontSize: 11, color: STYLE.t3 }}>
                      Prezzo migliore: <span style={{ color: STYLE.green, fontWeight: 600 }}>€{a.prezzoVecchio.toFixed(2)}/{a.unit}</span>
                      <span style={{ margin: "0 6px" }}>→</span>
                      Nuovo: <span style={{ color: a.colore, fontWeight: 600 }}>€{a.prezzoNuovo.toFixed(2)}/{a.unit}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right", marginLeft: 12 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: a.colore }}>+{a.pct}%</div>
                    <div style={{ fontSize: 10, color: a.colore, fontWeight: 600 }}>{a.livello}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: "10px 16px", background: "rgba(249,115,22,0.05)", borderTop: "1px solid rgba(249,115,22,0.15)", fontSize: 11, color: STYLE.t3 }}>
              I prezzi sono già stati aggiornati in magazzino.
            </div>
          </div>

          <button style={{ ...btn("p"), width: "100%", justifyContent: "center" }} onClick={reset}>
            Chiudi
          </button>
        </div>
      )}

      {step === "review" && (
        <div style={{ maxWidth: 600 }}>

          {/* ── MODAL ALERT PREZZI ANOMALI ── */}
          {priceAlerts.length > 0 && (
            <div style={{ marginBottom: 16, background: "#1a0a00", border: "1px solid #f97316", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid rgba(249,115,22,0.3)", background: "rgba(249,115,22,0.1)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 18 }}>⚠️</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#f97316" }}>
                    {priceAlerts.length === 1 ? "Anomalia prezzo rilevata" : `${priceAlerts.length} anomalie prezzi rilevate`}
                  </span>
                </div>
                <button onClick={() => setPriceAlerts([])}
                  style={{ background: "none", border: "none", color: STYLE.t3, cursor: "pointer", fontSize: 18, padding: "0 4px" }}>✕</button>
              </div>
              <div style={{ padding: "8px 0" }}>
                {priceAlerts.map((a, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", borderBottom: i < priceAlerts.length - 1 ? "1px solid rgba(249,115,22,0.15)" : "none" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: STYLE.t1, marginBottom: 3 }}>
                        {a.emoji} {a.nome}
                      </div>
                      <div style={{ fontSize: 11, color: STYLE.t3 }}>
                        Storico: <span style={{ color: STYLE.green, fontWeight: 600 }}>€{a.prezzoVecchio.toFixed(2)}/{a.unit}</span>
                        <span style={{ margin: "0 6px", color: STYLE.t3 }}>→</span>
                        Nuovo: <span style={{ color: a.colore, fontWeight: 600 }}>€{a.prezzoNuovo.toFixed(2)}/{a.unit}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: a.colore }}>+{a.pct}%</div>
                      <div style={{ fontSize: 10, color: a.colore, fontWeight: 600 }}>{a.livello}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: "10px 16px", background: "rgba(249,115,22,0.05)", borderTop: "1px solid rgba(249,115,22,0.15)" }}>
                <div style={{ fontSize: 11, color: STYLE.t3 }}>Verifica i prezzi qui sotto prima di salvare. Puoi modificarli direttamente nel campo prezzo.</div>
              </div>
            </div>
          )}

          {/* Riepilogo */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
            {[
              { l: "Fattura", v: fattura.sup || " - ", sub: fattura.num },
              { l: "Prezzi aggiornati", v: String(updCount), sub: "ingredienti esistenti", c: updCount > 0 ? STYLE.green : STYLE.t3 },
              { l: "Nuovi ingredienti", v: String(newCount), sub: "da aggiungere", c: newCount > 0 ? STYLE.ac : STYLE.t3 },
            ].map((k, i) => (
              <div key={i} style={card({ padding: "12px 14px" })}>
                <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", color: STYLE.t3, fontWeight: 600, marginBottom: 4 }}>{k.l}</div>
                <div style={{ fontFamily: "'Georgia',serif", fontSize: 20, color: k.c || STYLE.t1 }}>{k.v}</div>
                <div style={{ fontSize: 10, color: STYLE.t3 }}>{k.sub}</div>
              </div>
            ))}
          </div>

          {/* Dati fattura */}
          <div style={card({ padding: 16, marginBottom: 14 })}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: STYLE.t3, marginBottom: 12 }}>Dati fattura</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ gridColumn: "1/-1" }}>
                <Fld label="Fornitore *">
                  <input style={inp()} value={fattura.sup} onChange={e => setFattura(f => ({ ...f, sup: e.target.value }))} placeholder="es. Carni Rossi srl" />
                  {fattErr.sup && <span style={{ fontSize: 11, color: STYLE.red }}>{fattErr.sup}</span>}
                </Fld>
              </div>
              <Fld label="N   Fattura *">
                <input style={inp()} value={fattura.num} onChange={e => setFattura(f => ({ ...f, num: e.target.value }))} placeholder="2024/001" />
                {fattErr.num && <span style={{ fontSize: 11, color: STYLE.red }}>{fattErr.num}</span>}
              </Fld>
              <Fld label="Data *">
                <input style={inp()} type="date" value={fattura.date} onChange={e => setFattura(f => ({ ...f, date: e.target.value }))} />
                {fattErr.date && <span style={{ fontSize: 11, color: STYLE.red }}>{fattErr.date}</span>}
              </Fld>
              <Fld label="Totale v">
                <input style={inp()} type="text" inputMode="decimal" value={fattura.total} onChange={e => setFattura(f => ({ ...f, total: e.target.value.replace(",", ".") }))} placeholder="0.00" />
                {fattErr.total && <span style={{ fontSize: 11, color: STYLE.red }}>{fattErr.total}</span>}
              </Fld>
              <Fld label="IVA v">
                <input style={inp()} type="text" inputMode="decimal" value={fattura.vat} onChange={e => setFattura(f => ({ ...f, vat: e.target.value.replace(",", ".") }))} placeholder="0.00" />
              </Fld>
            </div>
          </div>

          {/* Prodotti trovati */}
          {found.length > 0 && (
            <div style={card({ padding: 16, marginBottom: 16 })}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: STYLE.t3, marginBottom: 12 }}>
                Prodotti trovati in fattura
              </div>
              {found.map((p, i) => (
                <div key={i} style={{ padding: "12px 0", borderBottom: i < found.length - 1 ? STYLE.bds : "none",
                  ...((() => { const a = priceAlerts.find(a => a.nome === (p.nomeEdit || p.nome)); return a ? { background: "rgba(249,115,22,0.05)", borderLeft: "3px solid " + a.colore, paddingLeft: 8, marginLeft: -8 } : {} })()) }}>
                  <div style={row({ justifyContent: "space-between", marginBottom: 8, alignItems: "flex-start" })}>
                    <div style={{ flex: 1 }}>
                      <div style={row({ gap: 6, marginBottom: 6 })}>
                        <span style={badge(p.tipo === "update" ? "g" : "a")}>
                          {p.tipo === "update" ? "' Aggiorna" : "+ Nuovo"}
                        </span>
                        <span style={{ fontSize: 11, color: STYLE.t3 }}>{p.quantita} {p.unita}</span>
                      </div>
                      {/* Nome modificabile */}
                      <input
                        style={inp({ fontSize: 12.5, padding: "5px 8px", marginBottom: 4 })}
                        value={p.nomeEdit !== undefined ? p.nomeEdit : p.nome}
                        onChange={e => setFound(prev => prev.map((x, j) => j === i ? { ...x, nomeEdit: e.target.value } : x))}
                        placeholder="Nome ingrediente"
                      />

                    </div>
                    <input type="checkbox" checked={p.include}
                      onChange={e => setFound(prev => prev.map((x, j) => j === i ? { ...x, include: e.target.checked } : x))}
                      style={{ width: 18, height: 18, cursor: "pointer", accentColor: STYLE.ac, flexShrink: 0, marginLeft: 10, marginTop: 4 }}
                    />
                  </div>
                  {p.include && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <div>
                        <label style={{ fontSize: 10, color: STYLE.t2, marginBottom: 3, display: "block" }}>
                          Categoria <span style={{ color: STYLE.green, fontSize: 9 }}>- AI</span>
                        </label>
                        <select style={inp({ appearance: "none", cursor: "pointer", fontSize: 12, borderColor: STYLE.acd })}
                          value={p.cat}
                          onChange={e => setFound(prev => prev.map((x, j) => j === i ? { ...x, cat: e.target.value, sotto1: "", sotto2: "", catChanged: e.target.value !== x.catOriginal } : x))}>
                          {CATS.map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                      {SOTTO1_ORDER[p.cat] ? (
                        <div>
                          <label style={{ fontSize: 10, color: STYLE.t2, marginBottom: 3, display: "block" }}>Sottocategoria</label>
                          <select style={inp({ appearance: "none", cursor: "pointer", fontSize: 12 })}
                            value={p.sotto1 || ""}
                            onChange={e => setFound(prev => prev.map((x, j) => j === i ? { ...x, sotto1: e.target.value } : x))}>
                            <option value="">— seleziona —</option>
                            {SOTTO1_ORDER[p.cat].map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      ) : null}
                      <div>
                        <label style={{ fontSize: 10, color: STYLE.t2, marginBottom: 3, display: "block" }}>
                          {needsConfezione(p.cat, p.sotto1, p.unita) ? "Prezzo confezione €" : "Prezzo unitario €"}
                        </label>
                        <input type="text" inputMode="decimal"
                          style={inp({ fontSize: 12, padding: "5px 8px" })}
                          value={p.prezzoStr !== undefined ? p.prezzoStr : (p.prezzoUnitario === 0 ? "" : String(p.prezzoUnitario).replace(".", ","))}
                          onChange={e => {
                            const val = e.target.value
                            const cleaned = val.replace(",", ".")
                            const num = parseFloat(cleaned)
                            setFound(prev => prev.map((x, j) => j === i ? {
                              ...x,
                              prezzoStr: val,
                              prezzoUnitario: isNaN(num) ? x.prezzoUnitario : Math.round(num * 100) / 100
                            } : x))
                          }}
                          onBlur={e => {
                            const num = parseFloat(e.target.value.replace(",", "."))
                            setFound(prev => prev.map((x, j) => j === i ? {
                              ...x,
                              prezzoStr: undefined,
                              prezzoUnitario: isNaN(num) ? x.prezzoUnitario : Math.round(num * 100) / 100
                            } : x))
                          }}
                          placeholder="0,00"
                        />
                        {p.sconto && <div style={{ fontSize: 9, color: STYLE.t3, marginTop: 2 }}>sconto: {p.sconto}</div>}
                      </div>
                      {/* Campo contenuto confezione - solo per categorie/unità abilitate */}
                      {needsConfezione(p.cat, p.sotto1, p.unita) && (
                        <div style={{ gridColumn: "1 / -1" }}>
                          <div style={{ background: STYLE.acg, border: "1px solid " + STYLE.acd, borderRadius: STYLE.r, padding: "8px 12px" }}>
                            <label style={{ fontSize: 10, color: STYLE.ac, fontWeight: 700, display: "block", marginBottom: 6 }}>
                              Contenuto confezione — per calcolo prezzo/unità base
                            </label>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px", gap: 8, alignItems: "center" }}>
                              <div style={{ fontSize: 11, color: STYLE.t2 }}>
                                {p.unita} da fattura · prezzo {formatEuro(p.prezzoFattura || p.prezzoUnitario || 0)}
                              </div>
                              <input type="number" step="0.001" min="0"
                                style={inp({ fontSize: 12, padding: "4px 8px" })}
                                value={p.confQty || ""}
                                onChange={e => {
                                  const qty = parseFloat(e.target.value) || 0
                                  // Salva prezzoFattura la prima volta, poi divide sempre da quello
                                  setFound(prev => prev.map((x,j) => {
                                    if (j !== i) return x
                                    const prezzoBase = x.prezzoFattura || x.prezzoUnitario || 0
                                    return {
                                      ...x,
                                      confQty: e.target.value,
                                      prezzoFattura: prezzoBase, // salva originale
                                      prezzoUnitario: qty > 0 ? Math.round(prezzoBase / qty * 100) / 100 : prezzoBase
                                    }
                                  }))
                                }}
                                placeholder="qtà"
                              />
                              <select style={inp({ fontSize: 11, appearance: "none", padding: "4px 6px" })}
                                value={p.confUnit || "kg"}
                                onChange={e => setFound(prev => prev.map((x,j) => j===i ? { ...x, confUnit: e.target.value } : x))}>
                                {["kg","l","pz","g","ml","mazzo","conf"].map(u => <option key={u}>{u}</option>)}
                              </select>
                            </div>
                            {p.confQty && +p.confQty > 0 && (p.prezzoFattura || p.prezzoUnitario) > 0 && (
                              <div style={{ fontSize: 11, color: STYLE.green, marginTop: 6, fontWeight: 600 }}>
                                {formatEuro(Math.round((p.prezzoFattura || p.prezzoUnitario) / +p.confQty * 100) / 100)}/{p.confUnit || "kg"} per unità base
                              </div>
                            )}
                            {(p.confUnit || "kg") === "pz" && (
                              <div style={{ fontSize: 10, color: STYLE.ac, marginTop: 4 }}>
                                Usa pz solo se l'ingrediente si usa intero in ricetta (uova, dadi, limoni...). Se si usa a peso scegli kg, se a volume scegli l.
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Azioni */}
          <div style={row({ justifyContent: "flex-end", gap: 10 })}>
            <button style={btn("g")} onClick={reset}>Annulla</button>
            <button style={btn("p")} onClick={save}>
              Salva fattura{updCount + newCount > 0 ? ` e ${updCount + newCount} ingredienti` : ""}
            </button>
          </div>
        </div>
      )}

      {/*  -  -  DETTAGLIO FATTURA  -  -  */}
      {detailInv && (
        <div onClick={e => e.target === e.currentTarget && setDetailInv(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "28px 20px", zIndex: 999, overflowY: "auto" }}>
          <div style={{ background: STYLE.surf, border: STYLE.bd, borderRadius: 16, width: "100%", maxWidth: 520, margin: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px 0" }}>
              <div style={{ fontFamily: "'Georgia',serif", fontSize: 18, color: STYLE.t1 }}>{detailInv.sup}</div>
              <button onClick={() => setDetailInv(null)} style={{ background: STYLE.el, border: STYLE.bd, borderRadius: STYLE.r, width: 28, height: 28, cursor: "pointer", color: STYLE.t3 }}>x</button>
            </div>
            <div style={{ padding: "16px 22px" }}>
              {/* KPI */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
                {[
                  { l: "Data", v: formatDate(detailInv.date) },
                  { l: "N   Fattura", v: detailInv.num || " - " },
                  { l: "Totale", v: formatEuro(detailInv.total) },
                  { l: "IVA", v: formatEuro(detailInv.vat || 0) },
                  { l: "Imponibile", v: formatEuro(detailInv.net || 0) },
                  { l: "Stato", v: "Elaborata" },
                ].map((k, i) => (
                  <div key={i} style={{ background: STYLE.el, border: STYLE.bd, borderRadius: STYLE.r, padding: "10px 12px" }}>
                    <div style={{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.08em", color: STYLE.t3, fontWeight: 600, marginBottom: 3 }}>{k.l}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: STYLE.t1 }}>{k.v}</div>
                  </div>
                ))}
              </div>

              {/* Prodotti */}
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: STYLE.t3, marginBottom: 10 }}>
                Prodotti ({detailInv.prodotti?.length || 0})
              </div>
              {detailInv.prodotti && detailInv.prodotti.length > 0 ? (
                <div style={{ border: STYLE.bd, borderRadius: STYLE.r, overflow: "hidden" }}>
                  {/* Header */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 90px", gap: 8, padding: "7px 12px", background: STYLE.el, borderBottom: STYLE.bds }}>
                    {["Nome prodotto (modificabile)", "v/unit  "].map(h => (
                      <span key={h} style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: STYLE.t3 }}>{h}</span>
                    ))}
                  </div>
                  {detailInv.prodotti.map((p, i) => (
                    <div key={i} style={{ padding: "10px 12px", borderBottom: i < detailInv.prodotti.length - 1 ? STYLE.bds : "none" }}>
                      {/* Nome modificabile */}
                      <input
                        style={inp({ fontSize: 12.5, padding: "5px 8px", marginBottom: 6 })}
                        defaultValue={p.nome}
                        onBlur={e => {
                          const newNome = e.target.value.trim()
                          if (newNome && newNome !== p.nome) {
                            setInvs(prev => prev.map(inv => inv.id === detailInv.id
                              ? { ...inv, prodotti: inv.prodotti.map((x, j) => j === i ? { ...x, nome: newNome } : x) }
                              : inv
                            ))
                            setDetailInv(prev => ({ ...prev, prodotti: prev.prodotti.map((x, j) => j === i ? { ...x, nome: newNome } : x) }))
                          }
                        }}
                      />
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 90px", gap: 8, alignItems: "center" }}>
                        <div style={{ fontSize: 11, color: STYLE.t3 }}>{p.quantita} {p.unita}</div>
                        <input type="text" inputMode="decimal"
                          style={inp({ fontSize: 12.5, padding: "5px 8px" })}
                          defaultValue={p.prezzoUnitario}
                          onBlur={e => {
                            const newPrice = parseFloat(e.target.value.replace(",", "."))
                            if (!isNaN(newPrice) && newPrice !== p.prezzoUnitario) {
                              // Aggiorna fattura
                              setInvs(prev => prev.map(inv => inv.id === detailInv.id
                                ? { ...inv, prodotti: inv.prodotti.map((x, j) => j === i ? { ...x, prezzoUnitario: newPrice } : x) }
                                : inv
                              ))
                              setDetailInv(prev => ({ ...prev, prodotti: prev.prodotti.map((x, j) => j === i ? { ...x, prezzoUnitario: newPrice } : x) }))
                              // Aggiorna anche ingrediente nel magazzino tramite fuzzy matching
                              const nomeProd = (p.nomeEdit || p.nome || "").toLowerCase().trim()
                              const ingMatch = ings.reduce((best, ing) => {
                                const nomeLow = ing.name.toLowerCase()
                                const score = nomeLow.includes(nomeProd.split(" ")[0]) || nomeProd.includes(nomeLow.split(" ")[0]) ? 0.8 : 0
                                return score > (best?.score || 0) ? { ing, score } : best
                              }, null)
                              if (ingMatch && ingMatch.score >= 0.8) {
                                setIngs(prev => prev.map(ing => {
                                  if (ing.id !== ingMatch.ing.id) return ing
                                  const newAvg = Math.round(((ing.avg * 0.7) + (newPrice * 0.3)) * 100) / 100
                                  return { ...ing, prev: ing.cur, cur: newPrice, avg: newAvg }
                                }))
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "20px 0", color: STYLE.t3, fontSize: 13 }}>
                  Nessun prodotto  -  carica di nuovo la fattura per elaborarla
                </div>
              )}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 22px 18px" }}>
              <button style={{ ...btn("g", { fontSize: 12 }), color: STYLE.red }}
                onClick={() => {
                  if (window.confirm("Eliminare questa fattura?")) {
                    setInvs(prev => prev.filter(i => i.id !== detailInv.id))
                    setDetailInv(null)
                  }
                }}>
                Elimina fattura
              </button>
              <button style={btn("p")} onClick={() => setDetailInv(null)}>Chiudi</button>
            </div>
          </div>
        </div>
      )}

      {/*  -  -  LISTA FATTURE  -  -  */}
      {step === "list" && invTab === "fatture" && (
        <>
          {isMobile ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {invs.slice(0, 5).map(inv => (
                <div key={inv.id} style={card({ padding: "16px", cursor: "pointer" })} onClick={() => setDetailInv(inv)}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: STYLE.t1 }}>{inv.sup}</div>
                    <span style={badge("g")}>Elaborata</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, color: STYLE.t3 }}>{formatDate(inv.date)} . {inv.num}</span>
                    <span style={{ fontSize: 18, fontWeight: 700, color: STYLE.t1 }}>{formatEuro(inv.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ border: STYLE.bds, borderRadius: STYLE.r2, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead><tr>{["Data", "Fornitore", "N   Fattura", "Imponibile", "Totale"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: STYLE.t3, background: STYLE.surf, borderBottom: STYLE.bds }}>{h}</th>
                ))}</tr></thead>
                <tbody>{invs.slice(0, 5).map(inv => (
                  <tr key={inv.id} onClick={() => setDetailInv(inv)} style={{ cursor: "pointer" }}
                    onMouseEnter={e => { for (const td of e.currentTarget.cells) td.style.background = STYLE.el }}
                    onMouseLeave={e => { for (const td of e.currentTarget.cells) td.style.background = "" }}>
                    <td style={{ padding: "11px 16px", fontWeight: 500, color: STYLE.t1, borderBottom: STYLE.bds }}>{formatDate(inv.date)}</td>
                    <td style={{ padding: "11px 16px", fontWeight: 500, color: STYLE.t1, borderBottom: STYLE.bds }}>{inv.sup}</td>
                    <td style={{ padding: "11px 16px", color: STYLE.t3, borderBottom: STYLE.bds }}>{inv.num}</td>
                    <td style={{ padding: "11px 16px", color: STYLE.t2, borderBottom: STYLE.bds, fontVariantNumeric: "tabular-nums" }}>{formatEuro(inv.net)}</td>
                    <td style={{ padding: "11px 16px", fontWeight: 600, color: STYLE.t1, borderBottom: STYLE.bds, fontVariantNumeric: "tabular-nums" }}>{formatEuro(inv.total)}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function Ricette({ dishes, setDishes, ings, isMobile, editDish, setEditDish, setNavBack, clearNavBack, pushHistory }) {
  const [sel, setSel] = useState(null) // null | "food" | "drink"

  // Back button: torna da food/drink a selezione ricette
  useEffect(() => {
    if (!sel) { clearNavBack?.(); return }
    setNavBack?.(() => setSel(null))
    return () => { clearNavBack?.() }
  }, [sel])

  if (sel === "food") return <FoodCost dishes={dishes} setDishes={setDishes} ings={ings} isMobile={isMobile} editDish={editDish} setEditDish={setEditDish} defaultTab="food" onBack={() => setSel(null)} />

  const foodCount  = dishes.filter(d => d.cat !== "vino" && d.cat !== "bevanda" && d.cat !== "cocktail").length
  return (
    <div>
      <div style={{ fontFamily: "'Georgia',serif", fontSize: 20, color: STYLE.t1, marginBottom: 4 }}>Ricette</div>
      <div style={{ fontSize: 12, color: STYLE.t3, marginBottom: 24 }}>Gestisci food cost e ricette</div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr", gap: 16 }}>
        <div onClick={() => { pushHistory?.(); setSel("food") }}
          style={{ ...card({ padding: "28px 20px", cursor: "pointer", position: "relative", overflow: "hidden" }) }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg," + STYLE.ac + ",transparent)" }} />
          <div style={{ fontSize: 28, marginBottom: 12 }}></div>
          <div style={{ fontFamily: "'Georgia',serif", fontSize: 18, color: STYLE.t1, marginBottom: 6 }}>Food Cost</div>
          <div style={{ fontSize: 12, color: STYLE.t3, marginBottom: 12 }}>Ricette cucina, costo piatti, margini</div>
          <div style={{ fontSize: 13, color: STYLE.ac, fontWeight: 600 }}>{foodCount} piatt{foodCount !== 1 ? "i" : "o"}</div>
        </div>

      </div>
    </div>
  )
}

function FoodCost({ dishes, setDishes, ings, isMobile, editDish, setEditDish, defaultTab, onBack }) {
  const [tab, setTab] = useState(defaultTab || "food") // "food" | "drink"

  //  -  -  Shared  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  - 
  const FOOD_CATS = ["Speciali", "Antipasti", "Primi", "Secondi", "Dolci", "Cocktail", "Bevande"]
  const UNITS = ["g", "kg", "ml", "l", "pz"]
  const r2 = n => Math.round(n * 100) / 100
  const uid2 = () => Math.random().toString(36).slice(2, 7)

  function toIngUnit(qty, rowUnit, ingUnit) {
    const norm = u => {
      if (!u) return "kg"
      const s = u.toLowerCase().trim()
      if (s === "litri" || s === "liter" || s === "litre") return "l"
      if (s === "bottiglia") return "bottiglia"
      return s
    }
    const ru = norm(rowUnit)
    let iu = norm(ingUnit)

    // Normalizza: se ingrediente salvato in g trattalo come kg, se in ml come l
    // (i prezzi nei ristoranti sono sempre per kg o litro, mai per g o ml)
    let ingScale = 1
    if (iu === "g")  { iu = "kg"; ingScale = 1000 } // prezzo per g ' converti a kg
    if (iu === "ml") { iu = "l";  ingScale = 1000 } // prezzo per ml ' converti a l

    // Converti quantità da rowUnit a iu
    let qtyConverted = qty
    if      (ru === "g"  && iu === "kg") qtyConverted = qty / 1000
    else if (ru === "kg" && iu === "g")  qtyConverted = qty * 1000
    else if (ru === "ml" && iu === "l")  qtyConverted = qty / 1000
    else if (ru === "l"  && iu === "ml") qtyConverted = qty * 1000
    else if (ru === "pz" && iu === "pz") qtyConverted = qty
    else if (ru === iu) qtyConverted = qty
    else qtyConverted = qty // unità incompatibili - passa as-is

    // Applica scala ingrediente
    return qtyConverted / ingScale
  }

  //  -  -  FOOD COST state  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  - 
  const [fForm, setFForm]     = useState(() => {
    try { const s = localStorage.getItem("fm_fc_form"); return s ? JSON.parse(s) : { name: "", cat: "Secondi", ricarico: "300", resa: "1", resaUnit: "porzioni" } } catch(e) { return { name: "", cat: "Secondi", ricarico: "300", resa: "1", resaUnit: "porzioni" } }
  })
  const [fRecipe, setFRecipe] = useState(() => {
    try { const s = localStorage.getItem("fm_fc_recipe"); return s ? JSON.parse(s) : [{ id: uid2(), ingId: "", ingType: "ing", _cat: "", _open: false, qty: "", unit: "g", waste: "0" }] } catch(e) { return [{ id: uid2(), ingId: "", ingType: "ing", _cat: "", _open: false, qty: "", unit: "g", waste: "0" }] }
  })
  const [fErr, setFErr]       = useState({})
  const [fSaved, setFSaved]   = useState(false)

  // Auto-save food cost form
  useEffect(() => { try { localStorage.setItem("fm_fc_form", JSON.stringify(fForm)) } catch(e) {} }, [fForm])
  useEffect(() => { try { localStorage.setItem("fm_fc_recipe", JSON.stringify(fRecipe)) } catch(e) {} }, [fRecipe])

  // Pre-carica piatto esistente per modifica
  useEffect(() => {
    if (!editDish) return
    const catMapRev = { speciale:"Speciali", antipasto:"Antipasti", primo:"Primi", secondo:"Secondi", dolce:"Dolci", cocktail:"Cocktail" }
    setFForm({
      name: editDish.name,
      cat: catMapRev[(editDish.cat||"").toLowerCase()] || "Secondi",
      ricarico: editDish.ricarico ? String(editDish.ricarico) : (editDish.cost > 0 && editDish.price > 0 ? String(Math.round((editDish.price / editDish.cost) * 100)) : "300")
    })
    if (editDish.recipe && editDish.recipe.length > 0) {
      setFRecipe(editDish.recipe.map(r => ({
        id: uid2(), ingId: r.ingId, ingType: r.ingType || "ing", qty: String(r.qty), unit: r.unit, waste: String(r.waste || "0")
      })))
    }
    if (editDish.resa) setFForm(f => ({ ...f, resa: String(editDish.resa), resaUnit: editDish.resaUnit || "porzioni" }))
    setTab("food")
  }, [editDish])

  const fLiveCost = fRecipe.reduce((sum, rr) => {
    if (rr.ingType === "prep") {
      const prep = dishes.find(d => d.id === rr.ingId)
      if (!prep || !rr.qty || !prep.costPerUnit) return sum
      const qty = parseFloat(rr.qty) || 0
      const wastePct = (parseFloat(rr.waste) || 0) / 100
      const wasteMult = wastePct >= 1 ? 1 : 1 / (1 - wastePct)
      return sum + toIngUnit(qty, rr.unit, prep.resaUnit || "pz") * prep.costPerUnit * wasteMult
    }
    const ing = ings.find(i => i.id === rr.ingId)
    if (!ing || !rr.qty) return sum
    const qty = parseFloat(rr.qty) || 0
    const wastePct = (parseFloat(rr.waste) || 0) / 100
    const wasteMult = wastePct >= 1 ? 1 : 1 / (1 - wastePct)
    return sum + toIngUnit(qty, rr.unit, ing.unit) * ing.cur * wasteMult
  }, 0)
  const fRicarico  = parseFloat(fForm.ricarico) || 300
  const fSugPrice  = fLiveCost * (fRicarico / 100)  // moltiplicatore: 300% =  --3
  const fMargin    = fSugPrice - fLiveCost
  const fFoodCostPct = fSugPrice > 0 ? fLiveCost / fSugPrice : 0

  function fAddRow()    { setFRecipe(r => [...r, { id: uid2(), ingId: "", ingType: "ing", _cat: "", _open: false, qty: "", unit: "g", waste: "0" }]) }
  function fRemoveRow(id) { setFRecipe(r => r.filter(x => x.id !== id)) }
  function fUpdateRow(id, patch) { setFRecipe(r => r.map(x => x.id === id ? { ...x, ...patch } : x)) }

  function fSave() {
    const e = {}
    if (!fForm.name.trim()) e.name = "Obbligatorio"
    if (!fForm.ricarico || +fForm.ricarico <= 0) e.ricarico = "Ricarico > 0"
    if (fRecipe.every(r => !r.ingId)) e.recipe = "Almeno un ingrediente"
    if (Object.keys(e).length) { setFErr(e); return }

    const cost  = r2(fLiveCost)
    const price = r2(fSugPrice)
    const fc    = price > 0 ? r2(cost / price) : 0
    const catMap = { Speciali: "speciale", Antipasti: "antipasto", Primi: "primo", Secondi: "secondo", Dolci: "dolce", Cocktail: "cocktail", Bevande: "bevanda" }
    const savedRecipe = fRecipe.filter(r => r.ingId).map(r => ({
      ingId: r.ingId, ingType: r.ingType || "ing", qty: parseFloat(r.qty) || 0, unit: r.unit, waste: r.waste || "0"
    }))
    const resa = parseFloat(fForm.resa) || 1
    const costPerUnit = resa > 0 ? r2(cost / resa) : cost
    if (editDish) {
      // Aggiorna piatto esistente
      setDishes(prev => prev.map(d => d.id === editDish.id ? {
        ...d, name: fForm.name.trim(),
        cat: catMap[fForm.cat] || fForm.cat.toLowerCase(),
        price, target: fFoodCostPct, cost, fc, margin: r2(fMargin),
        ricarico: fRicarico,
        recipe: savedRecipe,
        ...(fForm.cat === "Speciali" ? { resa: parseFloat(fForm.resa)||1, resaUnit: fForm.resaUnit, costPerUnit } : {})
      } : d))
      if (setEditDish) setEditDish(null)
    } else {
      setDishes(prev => [...prev, {
        id: "d" + uid2(), name: fForm.name.trim(),
        cat: catMap[fForm.cat] || fForm.cat.toLowerCase(),
        price, target: fFoodCostPct, cost, fc, margin: r2(fMargin),
        ricarico: fRicarico,
        recipe: savedRecipe, stagioni: [],
        ...(fForm.cat === "Speciali" ? { resa: parseFloat(fForm.resa)||1, resaUnit: fForm.resaUnit, costPerUnit } : {})
      }])
    }
    setFForm({ name: "", cat: "Secondi", ricarico: "300", resa: "1", resaUnit: "porzioni" })
    setFRecipe([{ id: uid2(), ingId: "", _cat: "", _open: false, qty: "", unit: "g", waste: "0" }])
    try { localStorage.removeItem("fm_fc_form"); localStorage.removeItem("fm_fc_recipe") } catch(e) {}
    setFErr({})
    setFSaved(true)
    setTimeout(() => setFSaved(false), 3000)
  }


  //  -  -  RENDER  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  - 
  return (
    <div>
      {/* Header + back */}
      <div style={{ marginBottom: 20 }}>
        <div style={row({ alignItems: "center", gap: 10, marginBottom: 12 })}>
          {onBack && (
            <>
              <button onClick={onBack} style={{ background: "none", border: "none", color: STYLE.ac, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, padding: 0 }}> Ricette</button>
              <span style={{ color: STYLE.t3, fontSize: 13 }}>/</span>
            </>
          )}
          <div style={{ fontFamily: "'Georgia',serif", fontSize: 20, color: STYLE.t1 }}>"Food Cost"</div>
        </div>
      </div>

      {/*  -  -  TAB: FOOD COST  -  -  */}
      {tab === "food" && (
        <div style={{ maxWidth: 600 }}>
          {fSaved && (
            <div style={{ marginBottom: 16, padding: "10px 14px", background: STYLE.gd, border: "1px solid rgba(74,222,128,0.3)", borderRadius: 8, fontSize: 13, color: STYLE.green }}>
              Piatto salvato e aggiunto alla sezione Piatti -
            </div>
          )}

          {/* Info piatto */}
          <div style={card({ padding: 16, marginBottom: 14 })}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: STYLE.t3, marginBottom: 12 }}>Dati piatto</div>
            <Fld label="Nome piatto *">
              <input style={inp()} value={fForm.name} onChange={e => setFForm(f => ({ ...f, name: e.target.value }))} placeholder="es. Filetto al pepe verde" />
              {fErr.name && <span style={{ fontSize: 11, color: STYLE.red }}>{fErr.name}</span>}
            </Fld>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <Fld label="Categoria">
                <select style={inp({ appearance: "none", cursor: "pointer" })} value={fForm.cat} onChange={e => setFForm(f => ({ ...f, cat: e.target.value }))}>
                  {FOOD_CATS.map(c => <option key={c}>{c}</option>)}
                </select>
              </Fld>
              <Fld label="Ricarico %">
                <select style={inp({ appearance: "none", cursor: "pointer" })} value={fForm.ricarico} onChange={e => setFForm(f => ({ ...f, ricarico: e.target.value }))}>
                  {[["100"," --1.0"],["150"," --1.5"],["200"," --2.0"],["250"," --2.5"],["300"," --3.0"],["350"," --3.5"],["400"," --4.0"],["450"," --4.5"],["500"," --5.0"],["600"," --6.0"],["700"," --7.0"]].map(([v,l]) => <option key={v} value={v}>{v}% ({l})</option>)}
                </select>
              </Fld>
              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <div style={{ background: STYLE.acg, border: "1px solid " + STYLE.acd, borderRadius: STYLE.r, padding: "9px 12px", width: "100%" }}>
                  <div style={{ fontSize: 9.5, textTransform: "uppercase", color: STYLE.t3, fontWeight: 600, marginBottom: 3 }}>Prezzo consigliato</div>
                  <div style={{ fontFamily: "'Georgia',serif", fontSize: 20, color: STYLE.ac }}>{fLiveCost > 0 ? formatEuro(fSugPrice) : " - "}</div>
                </div>
              </div>
            </div>
            {fForm.cat === "Speciali" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 4 }}>
                <Fld label="Resa (quantità prodotta)">
                  <input style={inp()} type="number" step="0.1" min="0.1" value={fForm.resa}
                    onChange={e => setFForm(f => ({ ...f, resa: e.target.value }))} placeholder="es. 10" />
                </Fld>
                <Fld label="Unità resa">
                  <select style={inp({ appearance: "none", cursor: "pointer" })} value={fForm.resaUnit}
                    onChange={e => setFForm(f => ({ ...f, resaUnit: e.target.value }))}>
                    {["porzioni", "kg", "l", "pz"].map(u => <option key={u}>{u}</option>)}
                  </select>
                </Fld>
              </div>
            )}
            {fForm.cat === "Speciali" && fLiveCost > 0 && (
              <div style={{ background: STYLE.gd, border: "1px solid rgba(74,222,128,0.25)", borderRadius: STYLE.r, padding: "8px 12px", marginTop: 4 }}>
                <span style={{ fontSize: 11, color: STYLE.t2 }}>Costo per {fForm.resaUnit}: </span>
                <strong style={{ color: STYLE.green }}>{formatEuro(r2(fLiveCost / (parseFloat(fForm.resa)||1)))}/{fForm.resaUnit}</strong>
              </div>
            )}
          </div>

          {/* Ricetta */}
          <div style={card({ padding: 16, marginBottom: 14 })}>
            <div style={row({ justifyContent: "space-between", marginBottom: 10 })}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: STYLE.t3 }}>Ingredienti ricetta</div>
              <button style={btn("g", { fontSize: 12, padding: "4px 10px" })} onClick={fAddRow}>+ Aggiungi</button>
            </div>
            {fErr.recipe && <div style={{ fontSize: 11, color: STYLE.red, marginBottom: 8 }}>{fErr.recipe}</div>}

            {/* Header colonne */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 90px 70px 24px", gap: 6, padding: "5px 6px", background: STYLE.el, borderRadius: "6px 6px 0 0", border: STYLE.bd, borderBottom: "none" }}>
              {["Ingrediente", "Qt   / Um", "Scarto %", ""].map(h => (
                <span key={h} style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: STYLE.t3 }}>{h}</span>
              ))}
            </div>
            <div style={{ border: STYLE.bd, borderRadius: "0 0 6px 6px", overflow: "hidden" }}>
              {fRecipe.map((row, idx) => {
                const ing = row.ingType !== "prep" ? ings.find(i => i.id === row.ingId) : null
                const prep = row.ingType === "prep" ? dishes.find(d => d.id === row.ingId) : null
                const qty = parseFloat(row.qty) || 0
                const lineQty = ing ? toIngUnit(qty, row.unit, ing.unit) : prep ? toIngUnit(qty, row.unit, prep.resaUnit||"pz") : qty
                const wastePctDisplay = (parseFloat(row.waste) || 0) / 100
                const wasteMultDisplay = wastePctDisplay >= 1 ? 1 : 1 / (1 - wastePctDisplay)
                const lineCost = ing && qty > 0 ? r2(lineQty * ing.cur * wasteMultDisplay) : prep && qty > 0 ? r2(lineQty * (prep.costPerUnit||0) * wasteMultDisplay) : 0
                return (
                  <div key={row.id} style={{ display: "grid", gridTemplateColumns: "1fr 90px 70px 24px", gap: 6, padding: "7px 6px", borderBottom: idx < fRecipe.length - 1 ? STYLE.bds : "none", alignItems: "flex-start", background: idx % 2 === 0 ? "transparent" : STYLE.el + "44" }}>
                    {/* Bottone che apre modal full-screen per selezionare ingrediente */}
                    {(() => {
                      const ing = row.ingType !== "prep" ? ings.find(i => i.id === row.ingId) : null
                      const prep = row.ingType === "prep" ? dishes.find(d => d.id === row.ingId) : null
                      const selected = ing || prep
                      return (
                        <button
                          onClick={() => fUpdateRow(row.id, { _open: true, _cat: row._cat || "" })}
                          style={{ ...inp({ padding: "6px 8px", fontSize: 11, cursor: "pointer", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", background: selected ? STYLE.acg : STYLE.el, borderColor: selected ? STYLE.acd : "#2a2a31" })}}>
                          <div style={{ overflow: "hidden", flex: 1 }}>
                            <div style={{ color: selected ? STYLE.ac : STYLE.t3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {ing ? ing.name.slice(0,6) + (ing.name.length > 6 ? "…" : "") : prep ? prep.name.slice(0,6) + (prep.name.length > 6 ? "…" : "") : "Sel…"}
                            </div>
                            {lineCost > 0 && <div style={{ fontSize: 10, color: STYLE.green, marginTop: 1 }}>{formatEuro(lineCost)}</div>}
                          </div>
                          <span style={{ fontSize: 9, color: STYLE.t3, flexShrink: 0, marginLeft: 4 }}>▾</span>
                        </button>
                      )
                    })()}
                    {row._open && (
                      <div onClick={e => { if(e.target === e.currentTarget) fUpdateRow(row.id, { _open: false }) }}
                        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 500, display: "flex", alignItems: "flex-end" }}>
                        <div style={{ width: "100%", background: STYLE.surf, borderRadius: "16px 16px 0 0", maxHeight: "75vh", display: "flex", flexDirection: "column" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 18px 12px", borderBottom: STYLE.bds, flexShrink: 0 }}>
                            {row._cat ? (
                              <button onClick={() => fUpdateRow(row.id, { _cat: "" })}
                                style={{ background: "none", border: "none", color: STYLE.ac, fontFamily: "inherit", fontSize: 14, fontWeight: 600, cursor: "pointer", padding: 0 }}>
                                 {row._cat}
                              </button>
                            ) : (
                              <span style={{ fontSize: 15, fontWeight: 600, color: STYLE.t1 }}>Scegli ingrediente</span>
                            )}
                            <button onClick={() => fUpdateRow(row.id, { _open: false })}
                              style={{ background: STYLE.el, border: STYLE.bd, borderRadius: 6, width: 28, height: 28, cursor: "pointer", color: STYLE.t3, fontSize: 14 }}> </button>
                          </div>
                          <div style={{ overflowY: "auto", flex: 1 }}>
                            {!row._cat ? (
                              <>
                                {dishes.filter(d => (d.cat||"") === "speciale" && d.costPerUnit > 0).length > 0 && (
                                  <div onClick={() => fUpdateRow(row.id, { _cat: "__prep__", _sotto1: null })}
                                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: STYLE.bds, cursor: "pointer", background: STYLE.acg }}>
                                    <span style={{ fontSize: 15, color: STYLE.ac, fontWeight: 600 }}>Preparazioni</span>
                                    <span style={{ color: STYLE.ac }}>›</span>
                                  </div>
                                )}
                                {["Carni","Pesce","Frutta e Verdura","Freschi","Surgelati","Dispensa"]
                                  .filter(c => ings.some(i => i.cat === c))
                                  .map(c => (
                                    <div key={c} onClick={() => fUpdateRow(row.id, { _cat: c, _sotto1: null })}
                                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: STYLE.bds, cursor: "pointer" }}>
                                      <span style={{ fontSize: 15, color: STYLE.t1 }}>{c}</span>
                                      <span style={{ color: STYLE.t3 }}>›</span>
                                    </div>
                                  ))}
                              </>
                            ) : row._cat === "__prep__" ? (
                              <>
                                <div onClick={() => fUpdateRow(row.id, { _cat: "" })}
                                  style={{ padding: "10px 18px", borderBottom: STYLE.bds, cursor: "pointer", fontSize: 12, color: STYLE.ac }}>← Categorie</div>
                                {dishes.filter(d => (d.cat||"") === "speciale" && d.costPerUnit > 0)
                                  .sort((a,b) => a.name.localeCompare(b.name,"it"))
                                  .map(d => (
                                    <div key={d.id} onClick={() => fUpdateRow(row.id, { ingId: d.id, ingType: "prep", _open: false })}
                                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 18px", borderBottom: STYLE.bds, cursor: "pointer", background: row.ingId === d.id ? STYLE.acg : "" }}>
                                      <div>
                                        <div style={{ fontSize: 14, color: row.ingId === d.id ? STYLE.ac : STYLE.t1, fontWeight: row.ingId === d.id ? 600 : 400 }}>{d.name}</div>
                                        <div style={{ fontSize: 11, color: STYLE.t3 }}>{formatEuro(d.costPerUnit)}/{d.resaUnit}</div>
                                      </div>
                                      {row.ingId === d.id && <span style={{ color: STYLE.ac }}>✓</span>}
                                    </div>
                                  ))}
                              </>
                            ) : row._cat && !row._sotto1 && ["Carni","Pesce","Frutta e Verdura","Freschi","Surgelati","Dispensa"].includes(row._cat) ? (
                              <>
                                <div onClick={() => fUpdateRow(row.id, { _cat: null })}
                                  style={{ padding: "10px 18px", borderBottom: STYLE.bds, cursor: "pointer", fontSize: 12, color: STYLE.ac }}> Categorie</div>
                                {[...new Set(ings.filter(i => i.cat === row._cat).map(i => i.sotto1).filter(Boolean))].sort().map(s1 => {
                                  const cnt = ings.filter(i => i.cat === row._cat && i.sotto1 === s1).length
                                  return (
                                    <div key={s1} onClick={() => fUpdateRow(row.id, { _sotto1: s1 })}
                                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 18px", borderBottom: STYLE.bds, cursor: "pointer" }}>
                                      <span style={{ fontSize: 14, color: STYLE.t1 }}>{s1}</span>
                                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <span style={{ fontSize: 11, color: STYLE.t3 }}>{cnt}</span>
                                        <span style={{ color: STYLE.t3 }}> </span>
                                      </div>
                                    </div>
                                  )
                                })}
                                {ings.filter(i => i.cat === row._cat && !i.sotto1).length > 0 && (
                                  <div onClick={() => fUpdateRow(row.id, { _sotto1: "__none__" })}
                                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 18px", borderBottom: STYLE.bds, cursor: "pointer" }}>
                                    <span style={{ fontSize: 14, color: STYLE.t1 }}>Altri</span>
                                    <span style={{ color: STYLE.t3 }}> </span>
                                  </div>
                                )}
                              </>
                            ) : (
                              <>
                                {row._sotto1 && (
                                  <div onClick={() => fUpdateRow(row.id, { _sotto1: null })}
                                    style={{ padding: "10px 18px", borderBottom: STYLE.bds, cursor: "pointer", fontSize: 12, color: STYLE.ac }}> {row._cat}</div>
                                )}
                                {(row._sotto1
                                  ? row._sotto1 === "__none__"
                                    ? ings.filter(i => i.cat === row._cat && !i.sotto1)
                                    : ings.filter(i => i.cat === row._cat && i.sotto1 === row._sotto1)
                                  : ings.filter(i => i.cat === row._cat)
                                ).sort((a,b) => a.name.localeCompare(b.name,"it")).map(i => (
                                <div key={i.id} onClick={() => fUpdateRow(row.id, { ingId: i.id, _open: false })}
                                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 18px", borderBottom: STYLE.bds, cursor: "pointer", background: row.ingId === i.id ? STYLE.acg : "" }}>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 14, color: row.ingId === i.id ? STYLE.ac : STYLE.t1, fontWeight: row.ingId === i.id ? 600 : 400, marginBottom: 2 }}>{i.name}</div>
                                    {(i.sotto1 || i.sotto2) && (
                                      <div style={{ display: "flex", gap: 4, marginBottom: 2 }}>
                                        {i.sotto1 && <span style={{ fontSize: 9, color: STYLE.ac, background: STYLE.acg, border: "1px solid " + STYLE.acd, borderRadius: 3, padding: "1px 5px" }}>{i.sotto1}</span>}
                                        {i.sotto2 && <span style={{ fontSize: 9, color: STYLE.t2, background: STYLE.el, borderRadius: 3, padding: "1px 5px" }}>{i.sotto2}</span>}
                                      </div>
                                    )}
                                    <div style={{ fontSize: 11, color: STYLE.t3 }}>{formatEuro(i.cur)}/{i.unit}</div>
                                  </div>
                                  {row.ingId === i.id && <span style={{ color: STYLE.ac, fontSize: 16 }}>-</span>}
                                </div>
                              ))}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 3 }}>
                      <input style={inp({ padding: "6px 4px", fontSize: 12, width: "50px" })} type="number" step="0.1" min="0" placeholder="0" value={row.qty} onChange={e => fUpdateRow(row.id, { qty: e.target.value })} />
                      <select style={inp({ padding: "6px 3px", fontSize: 11, appearance: "none", width: "38px" })} value={row.unit} onChange={e => fUpdateRow(row.id, { unit: e.target.value })}>
                        {UNITS.map(u => <option key={u}>{u}</option>)}
                      </select>
                    </div>
                    <div style={{ position: "relative" }}>
                      <input style={inp({ padding: "6px 20px 6px 6px", fontSize: 12 })} type="number" step="1" min="0" max="99" placeholder="0" value={row.waste} onChange={e => fUpdateRow(row.id, { waste: e.target.value })} />
                      <span style={{ position: "absolute", right: 5, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: STYLE.t3, pointerEvents: "none" }}>%</span>
                    </div>
                    <button onClick={() => fRemoveRow(row.id)} style={{ background: "none", border: "none", color: STYLE.t3, cursor: "pointer", fontSize: 13, padding: 0 }}> --</button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Calcolo automatico */}
          {fLiveCost > 0 && (
            <div style={card({ padding: 14, marginBottom: 16 })}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: STYLE.t3, marginBottom: 10 }}>Calcolo automatico</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                {[
                  { l: "Costo ricetta",    v: formatEuro(r2(fLiveCost)),   c: STYLE.t1 },
                  { l: "Prezzo consigliato", v: formatEuro(r2(fSugPrice)), c: STYLE.ac },
                  { l: "Food cost %",      v: formatPct(fFoodCostPct),    c: STYLE.green },
                  { l: "Margine lordo",    v: formatEuro(r2(fMargin)),     c: STYLE.green },
                ].map((k, i) => (
                  <div key={i} style={{ background: STYLE.el, border: STYLE.bd, borderRadius: 6, padding: "10px 10px" }}>
                    <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.07em", color: STYLE.t3, fontWeight: 600, marginBottom: 3 }}>{k.l}</div>
                    <div style={{ fontFamily: "'Georgia',serif", fontSize: 15, color: k.c }}>{k.v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {editDish && (
            <button style={{ ...btn("g"), width: "100%", justifyContent: "center", padding: "10px", marginBottom: 8 }}
              onClick={() => { if(setEditDish) setEditDish(null); setFForm({ name: "", cat: "Secondi", ricarico: "300" }); setFRecipe([{ id: uid2(), ingId: "", qty: "", unit: "g", waste: "0" }]) }}>
              Annulla modifica
            </button>
          )}
          <button style={{ ...btn("p"), width: "100%", justifyContent: "center", padding: "12px" }} onClick={fSave}>
            {editDish ? "Aggiorna piatto" : "Salva piatto e invia a Piatti"}
          </button>
        </div>
      )}

    </div>
  )
}


// ──────────────────────────────────────────────────────────────────────────────
// FOOD COST AI — Calcolo grammature con selezione magazzino + AI
// ──────────────────────────────────────────────────────────────────────────────

function FoodCostAI({ ings, dishes, setDishes, isMobile, onBack }) {
  const uid2 = () => Math.random().toString(36).slice(2, 7)
  const r2 = n => Math.round(n * 100) / 100

  const CATS_ING = ["Carni", "Pesce", "Frutta e Verdura", "Freschi", "Surgelati", "Dispensa"]
  const UNITS = ["g", "kg", "ml", "l", "pz"]

  const [step, setStep] = useState("form") // "form" | "loading" | "review"
  const [form, setForm] = useState({ name: "", cat: "Secondi", ricarico: "300" })
  const [rows, setRows] = useState([]) // ingredienti selezionati: { id, ingId, ingName, ingUnit, cur, qty, unit, waste, _open, _cat, _sotto1, lineCost }
  const [error, setError] = useState("")
  const [saved, setSaved] = useState(false)

  const DISH_CATS = ["Antipasti", "Primi", "Secondi", "Dolci", "Speciali", "Cocktail", "Bevande"]

  const GRAMMATURE_HINT = {
    Antipasti: "Antipasto: ingrediente principale 90-130g. Ingredienti secondari proporzionali. Decorativi (insalate, erbette, fiori): 5-10g.",
    Primi: "Primo piatto: pasta 90g oppure riso 80g. Condimento/sugo 50-80g. Ingredienti secondari proporzionali. Decorativi: 5-10g.",
    Secondi: "Secondo piatto: proteina principale 150-220g. Contorno 100-200g. Ingredienti secondari proporzionali. Decorativi: 5-10g.",
    Dolci: "Dolce: peso totale 80-120g distribuito tra gli ingredienti.",
    Speciali: "Preparazione base: calcola grammature realistiche in base al tipo di piatto.",
    Cocktail: "Cocktail: base alcolica 4-6cl, ingredienti secondari in ml proporzionali.",
    Bevande: "Bevanda: calcola in ml proporzionalmente."
  }

  function addRow() {
    setRows(prev => [...prev, { id: uid2(), ingId: null, ingName: "", ingUnit: "kg", cur: 0, qty: 0, unit: "g", waste: 5, decorativo: false, _open: false, _cat: null, _sotto1: null, lineCost: 0 }])
  }

  function removeRow(id) { setRows(prev => prev.filter(r => r.id !== id)) }

  function updateRow(id, patch) {
    setRows(prev => prev.map(r => {
      if (r.id !== id) return r
      const u = { ...r, ...patch }
      if (u.ingId && u.cur > 0 && u.qty > 0) {
        const qKg = u.unit === "g" ? u.qty / 1000 : u.unit === "ml" ? u.qty / 1000 : u.qty
        const wm = 1 / (1 - (u.waste || 0) / 100)
        u.lineCost = r2(qKg * u.cur * wm)
      } else { u.lineCost = 0 }
      return u
    }))
  }

  function selectIng(rowId, ing) {
    setRows(prev => prev.map(r => r.id !== rowId ? r : {
      ...r, ingId: ing.id, ingName: ing.name, ingUnit: ing.unit, cur: ing.cur,
      unit: ing.unit === "kg" ? "g" : ing.unit === "l" ? "ml" : ing.unit,
      _open: false, lineCost: 0
    }))
  }

  async function calcolaAI() {
    const selezionati = rows.filter(r => r.ingId)
    if (!form.name.trim()) { setError("Inserisci il nome del piatto"); return }
    if (selezionati.length === 0) { setError("Seleziona almeno un ingrediente dal magazzino"); return }
    setError("")
    setStep("loading")

    const listaIng = selezionati.map(r => r.ingName).join(", ")
    const hint = GRAMMATURE_HINT[form.cat] || GRAMMATURE_HINT.Secondi

    const prompt = `Sei un cuoco professionista italiano. Calcola le grammature per porzione singola.

PIATTO: "${form.name}" (${form.cat})
REGOLE: ${hint}
NOTA: ingredienti decorativi (insalate, erbette, fiori, microgreens) → qty 5-10g, decorativo: true

INGREDIENTI (calcola grammature per TUTTI):
${selezionati.map((r, i) => (i+1) + ". " + r.ingName).join("\n")}

Restituisci SOLO JSON:
{"grammature":[{"nome":"","qty":0,"unit":"g","waste":5,"decorativo":false}]}`

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + import.meta.env.VITE_GROQ_KEY },
        body: JSON.stringify({
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          max_tokens: 512,
          messages: [{ role: "user", content: prompt }]
        })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error.message)
      const raw = data.choices?.[0]?.message?.content || ""
      const match = raw.match(/\{[\s\S]*\}/)
      if (!match) throw new Error("Risposta AI non valida")
      const parsed = JSON.parse(match[0])
      const grammature = parsed.grammature || []

      // Applica grammature agli ingredienti selezionati
      setRows(prev => prev.map((r, i) => {
        if (!r.ingId) return r
        const g = grammature[i] || grammature.find(x => x.nome?.toLowerCase().includes(r.ingName.toLowerCase().split(" ")[0])) || {}
        const qty = g.qty || 0
        const unit = g.unit || (r.ingUnit === "kg" ? "g" : r.ingUnit === "l" ? "ml" : r.ingUnit)
        const waste = g.waste || 5
        const decorativo = g.decorativo || false
        const qKg = unit === "g" ? qty / 1000 : unit === "ml" ? qty / 1000 : qty
        const wm = 1 / (1 - waste / 100)
        const lineCost = r.cur > 0 && qty > 0 ? r2(qKg * r.cur * wm) : 0
        return { ...r, qty, unit, waste, decorativo, lineCost }
      }))
      setStep("review")
    } catch(e) {
      setError("Errore AI: " + e.message)
      setStep("form")
    }
  }

  const totalCost = r2(rows.reduce((s, r) => s + (r.lineCost || 0), 0))
  const ricarico = parseFloat(form.ricarico) || 300
  const sugPrice = r2(totalCost * (ricarico / 100))
  const fcPct = sugPrice > 0 ? r2(totalCost / sugPrice * 100) : 0

  function salvaRicetta() {
    const catMap = { Antipasti: "antipasto", Primi: "primo", Secondi: "secondo", Dolci: "dolce", Speciali: "speciale", Cocktail: "cocktail", Bevande: "bevanda" }
    const recipe = rows.filter(r => r.ingId && r.qty > 0).map(r => ({
      ingId: r.ingId, ingType: "ing",
      qty: r.unit === "g" ? r.qty / 1000 : r.unit === "ml" ? r.qty / 1000 : r.qty,
      unit: r.ingUnit || "kg", waste: String(r.waste || 0)
    }))
    setDishes(prev => [...prev, {
      id: "d" + uid2(), name: form.name.trim(),
      cat: catMap[form.cat] || form.cat.toLowerCase(),
      price: sugPrice, target: fcPct / 100, cost: totalCost,
      fc: fcPct / 100, margin: r2(sugPrice - totalCost),
      ricarico, recipe, stagioni: []
    }])
    setSaved(true)
    setTimeout(() => {
      setSaved(false); setStep("form")
      setForm({ name: "", cat: "Secondi", ricarico: "300" }); setRows([])
    }, 2500)
  }

  const Breadcrumb = ({ extra }) => (
    <div style={row({ alignItems: "center", gap: 10, marginBottom: 20 })}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: STYLE.ac, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, padding: 0 }}>← Ricette</button>
      <span style={{ color: STYLE.t3 }}>/</span>
      <span style={{ fontSize: 13, color: extra ? STYLE.ac : STYLE.t1, fontWeight: 600, cursor: extra ? "pointer" : "default" }}
        onClick={() => extra && setStep("form")}>Food Cost AI</span>
      {extra && <><span style={{ color: STYLE.t3 }}>/</span><span style={{ fontSize: 13, color: STYLE.t1, fontWeight: 600 }}>{extra}</span></>}
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: STYLE.acg, border: "1px solid " + STYLE.acd, borderRadius: 999, padding: "2px 10px", fontSize: 10, color: STYLE.ac, fontWeight: 700, letterSpacing: "0.1em", marginLeft: 4 }}>⚡ PLUS</span>
    </div>
  )

  // ── LOADING ──
  if (step === "loading") return (
    <div><Breadcrumb />
      <div style={card({ padding: 40, maxWidth: 400, textAlign: "center" })}>
        <div style={{ fontFamily: "'Georgia',serif", fontSize: 16, color: STYLE.t1, marginBottom: 20 }}>L'AI sta calcolando le grammature...</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
          {[0,1,2].map(n => <div key={n} style={{ width: 8, height: 8, borderRadius: "50%", background: STYLE.ac, animation: `pulse ${0.8 + n * 0.15}s ease-in-out infinite alternate` }} />)}
        </div>
      </div>
      <style>{`@keyframes pulse { from { opacity:0.3; transform:scale(0.8); } to { opacity:1; transform:scale(1); } }`}</style>
    </div>
  )

  // ── REVIEW ──
  if (step === "review") return (
    <div style={{ maxWidth: 560 }}>
      <Breadcrumb extra={form.name} />
      {saved && <div style={{ marginBottom: 14, padding: "10px 14px", background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)", borderRadius: 8, fontSize: 13, color: STYLE.green }}>✓ Piatto salvato in Ricette!</div>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
        {[
          { l: "Costo ricetta", v: "€" + totalCost.toFixed(2), c: STYLE.t1 },
          { l: "Prezzo consigliato", v: "€" + sugPrice.toFixed(2), c: STYLE.ac },
          { l: "Food cost %", v: fcPct.toFixed(1) + "%", c: fcPct > 35 ? STYLE.red : STYLE.green },
        ].map((k,i) => (
          <div key={i} style={card({ padding: "12px 14px" })}>
            <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", color: STYLE.t3, marginBottom: 4, fontWeight: 700 }}>{k.l}</div>
            <div style={{ fontFamily: "'Georgia',serif", fontSize: 20, color: k.c }}>{k.v}</div>
          </div>
        ))}
      </div>

      <div style={card({ padding: 16, marginBottom: 14 })}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: STYLE.t3, marginBottom: 12 }}>
          Ingredienti — modifica grammature e scarto
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 72px 52px 44px 24px", gap: 4, padding: "4px 6px", background: STYLE.el, borderRadius: "6px 6px 0 0" }}>
          {["Ingrediente", "Qtà", "Unità", "Scarto%", ""].map(h => <span key={h} style={{ fontSize: 9, fontWeight: 700, color: STYLE.ac, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</span>)}
        </div>
        <div style={{ border: STYLE.bd, borderTop: "none", borderRadius: "0 0 6px 6px", overflow: "hidden" }}>
          {rows.map((r, i) => (
            <div key={r.id} style={{ display: "grid", gridTemplateColumns: "1fr 72px 52px 44px 24px", gap: 4, padding: "8px 6px", borderBottom: i < rows.length-1 ? STYLE.bds : "none", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 12, color: STYLE.t1, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.ingName}</div>
                {r.decorativo && <div style={{ fontSize: 9, color: STYLE.t3 }}>decorativo</div>}
                {r.lineCost > 0 && <div style={{ fontSize: 10, color: STYLE.green }}>€{r.lineCost.toFixed(2)}</div>}
              </div>
              <input type="number" step="1" min="0" style={{ ...inp({ padding: "4px 6px", fontSize: 12, textAlign: "right" }) }} value={r.qty} onChange={e => updateRow(r.id, { qty: parseFloat(e.target.value) || 0 })} />
              <select style={{ ...inp({ padding: "3px 3px", fontSize: 11, appearance: "none" }) }} value={r.unit} onChange={e => updateRow(r.id, { unit: e.target.value })}>
                {UNITS.map(u => <option key={u}>{u}</option>)}
              </select>
              <input type="number" step="1" min="0" max="99" style={{ ...inp({ padding: "4px 4px", fontSize: 12, textAlign: "center" }) }} value={r.waste} onChange={e => updateRow(r.id, { waste: parseFloat(e.target.value) || 0 })} />
              <button onClick={() => removeRow(r.id)} style={{ background: "none", border: "none", color: STYLE.t3, cursor: "pointer", fontSize: 14, padding: 0 }}>✕</button>
            </div>
          ))}
        </div>
      </div>

      <div style={row({ gap: 10, marginBottom: 0 })}>
        <button style={{ ...btn("g"), flex: 1, justifyContent: "center" }} onClick={() => setStep("form")}>← Modifica</button>
        <button style={{ ...btn("p"), flex: 2, justifyContent: "center", padding: 12 }} onClick={salvaRicetta}>Salva piatto</button>
      </div>
    </div>
  )

  // ── FORM ──
  return (
    <div style={{ maxWidth: 560 }}>
      <Breadcrumb />
      {saved && <div style={{ marginBottom: 14, padding: "10px 14px", background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)", borderRadius: 8, fontSize: 13, color: STYLE.green }}>✓ Piatto salvato!</div>}
      {error && <div style={{ marginBottom: 14, padding: "10px 14px", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 8, fontSize: 13, color: STYLE.red }}>{error}</div>}

      <div style={card({ padding: 20, marginBottom: 14 })}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: STYLE.t3, marginBottom: 14 }}>Dati piatto</div>
        <Fld label="Nome piatto *">
          <input style={inp()} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="es. Risotto ai Porcini" />
        </Fld>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Fld label="Categoria">
            <select style={inp({ appearance: "none", cursor: "pointer" })} value={form.cat} onChange={e => setForm(f => ({ ...f, cat: e.target.value }))}>
              {DISH_CATS.map(c => <option key={c}>{c}</option>)}
            </select>
          </Fld>
          <Fld label="Ricarico %">
            <select style={inp({ appearance: "none", cursor: "pointer" })} value={form.ricarico} onChange={e => setForm(f => ({ ...f, ricarico: e.target.value }))}>
              {[["100","×1.0"],["150","×1.5"],["200","×2.0"],["250","×2.5"],["300","×3.0"],["350","×3.5"],["400","×4.0"],["450","×4.5"],["500","×5.0"]].map(([v,l]) => <option key={v} value={v}>{v}% ({l})</option>)}
            </select>
          </Fld>
        </div>
      </div>

      <div style={card({ padding: 16, marginBottom: 14 })}>
        <div style={row({ justifyContent: "space-between", marginBottom: 10 })}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: STYLE.t3 }}>Ingredienti dal magazzino</div>
          <button style={btn("g", { fontSize: 12, padding: "4px 10px" })} onClick={addRow}>+ Aggiungi</button>
        </div>

        {rows.length === 0 && (
          <div style={{ textAlign: "center", padding: "24px 0", color: STYLE.t3, fontSize: 13 }}>
            Tocca "+ Aggiungi" per scegliere gli ingredienti dal magazzino
          </div>
        )}

        {rows.map((r, i) => (
          <div key={r.id} style={{ marginBottom: 8 }}>
            <div style={row({ gap: 8, alignItems: "center" })}>
              <button onClick={() => updateRow(r.id, { _open: true })}
                style={{ ...inp({ flex: 1, padding: "8px 12px", fontSize: 12, cursor: "pointer", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", background: r.ingId ? STYLE.acg : STYLE.el, borderColor: r.ingId ? STYLE.acd : "#2a2a31" })}>
                <span style={{ color: r.ingId ? STYLE.ac : STYLE.t3 }}>{r.ingId ? r.ingName : "Seleziona ingrediente..."}</span>
                <span style={{ fontSize: 10, color: STYLE.t3 }}>▾</span>
              </button>
              <button onClick={() => removeRow(r.id)} style={{ background: "none", border: "none", color: STYLE.t3, cursor: "pointer", fontSize: 18, padding: "0 4px", flexShrink: 0 }}>✕</button>
            </div>

            {/* Modal selezione ingrediente — stesso del Food Cost manuale */}
            {r._open && (
              <div onClick={e => e.target === e.currentTarget && updateRow(r.id, { _open: false })}
                style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 500, display: "flex", alignItems: "flex-end" }}>
                <div style={{ width: "100%", background: STYLE.surf, borderRadius: "16px 16px 0 0", maxHeight: "75vh", display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 18px 12px", borderBottom: STYLE.bds, flexShrink: 0 }}>
                    {r._cat ? (
                      <button onClick={() => updateRow(r.id, { _cat: null, _sotto1: null })}
                        style={{ background: "none", border: "none", color: STYLE.ac, fontFamily: "inherit", fontSize: 14, fontWeight: 600, cursor: "pointer", padding: 0 }}>
                        ← {r._cat}
                      </button>
                    ) : (
                      <span style={{ fontSize: 15, fontWeight: 600, color: STYLE.t1 }}>Scegli ingrediente</span>
                    )}
                    <button onClick={() => updateRow(r.id, { _open: false })}
                      style={{ background: STYLE.el, border: STYLE.bd, borderRadius: 6, width: 28, height: 28, cursor: "pointer", color: STYLE.t3, fontSize: 14 }}>✕</button>
                  </div>
                  <div style={{ overflowY: "auto", flex: 1 }}>
                    {!r._cat ? (
                      CATS_ING.filter(c => ings.some(i => i.cat === c)).map(c => (
                        <div key={c} onClick={() => updateRow(r.id, { _cat: c, _sotto1: null })}
                          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: STYLE.bds, cursor: "pointer" }}>
                          <span style={{ fontSize: 15, color: STYLE.t1 }}>{c}</span>
                          <span style={{ color: STYLE.t3 }}>›</span>
                        </div>
                      ))
                    ) : !r._sotto1 ? (
                      <>
                        {[...new Set(ings.filter(i => i.cat === r._cat).map(i => i.sotto1).filter(Boolean))].sort().map(s1 => (
                          <div key={s1} onClick={() => updateRow(r.id, { _sotto1: s1 })}
                            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 18px", borderBottom: STYLE.bds, cursor: "pointer" }}>
                            <span style={{ fontSize: 14, color: STYLE.t1 }}>{s1}</span>
                            <span style={{ color: STYLE.t3 }}>›</span>
                          </div>
                        ))}
                        {ings.filter(i => i.cat === r._cat && !i.sotto1).length > 0 && (
                          <div onClick={() => updateRow(r.id, { _sotto1: "__none__" })}
                            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 18px", borderBottom: STYLE.bds, cursor: "pointer" }}>
                            <span style={{ fontSize: 14, color: STYLE.t1 }}>Altri</span>
                            <span style={{ color: STYLE.t3 }}>›</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div onClick={() => updateRow(r.id, { _sotto1: null })}
                          style={{ padding: "10px 18px", borderBottom: STYLE.bds, cursor: "pointer", fontSize: 12, color: STYLE.ac }}>← {r._cat}</div>
                        {(r._sotto1 === "__none__"
                          ? ings.filter(i => i.cat === r._cat && !i.sotto1)
                          : ings.filter(i => i.cat === r._cat && i.sotto1 === r._sotto1)
                        ).sort((a,b) => a.name.localeCompare(b.name, "it")).map(ing => (
                          <div key={ing.id} onClick={() => selectIng(r.id, ing)}
                            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 18px", borderBottom: STYLE.bds, cursor: "pointer", background: r.ingId === ing.id ? STYLE.acg : "" }}>
                            <div>
                              <div style={{ fontSize: 14, color: r.ingId === ing.id ? STYLE.ac : STYLE.t1, fontWeight: r.ingId === ing.id ? 600 : 400 }}>{ing.name}</div>
                              <div style={{ fontSize: 11, color: STYLE.t3 }}>{(ing.cur || 0).toFixed(2)}€/{ing.unit}</div>
                            </div>
                            {r.ingId === ing.id && <span style={{ color: STYLE.ac }}>✓</span>}
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {rows.filter(r => r.ingId).length > 0 && (
        <button style={{ ...btn("p"), width: "100%", justifyContent: "center", padding: 12 }} onClick={calcolaAI}>
          ⚡ Calcola grammature con AI
        </button>
      )}
      <style>{`@keyframes pulse { from { opacity:0.3; transform:scale(0.8); } to { opacity:1; transform:scale(1); } }`}</style>
    </div>
  )
}


// ──────────────────────────────────────────────────────────────────────────────
// CHEF Z AI — Assistente AI per la ristorazione professionale
// ──────────────────────────────────────────────────────────────────────────────

const CHEFZ_SYSTEM_PROMPT = `Sei Chef Z AI, l'assistente intelligente integrato nell'app Chef Z.

IDENTITÀ:
Sei un consulente esperto di ristorazione professionale italiana a 360°. Hai conoscenza approfondita di cucina professionale, ingredienti, tecniche culinarie, gestione ristorante, food cost, fornitori, attrezzature professionali e normative del settore.

COSA SAI FARE:
- Rispondere a domande su cucina professionale italiana e internazionale
- Spiegare tecniche culinarie, cotture, preparazioni
- Dare consigli su ingredienti, stagionalità, abbinamenti
- Aiutare con calcoli di food cost e gestione costi
- Consigliare su attrezzature professionali (forni, abbattitori, sottovuoto ecc.)
- Spiegare normative HACCP e igiene alimentare
- Dare consigli su fornitori e gestione approvvigionamenti
- Spiegare come funziona Chef Z in ogni sua funzione

COME FUNZIONA CHEF Z (sai tutto di questa app):
- FORNITURE: scansiona fatture con foto o PDF, AI legge prezzi e prodotti, aggiorna magazzino automaticamente, alert se prezzi aumentano oltre il 5%
- MAGAZZINO: storico prezzi per ingrediente e fornitore, navigazione per categoria (Carni, Pesce, Frutta e Verdura, Freschi, Surgelati, Dispensa)
- RICETTE: calcola food cost con ingredienti reali, ricarico selezionabile, prezzo di vendita consigliato automatico
- DASHBOARD: KPI in tempo reale, piatti da rivedere cliccabili, prezzi aumentati cliccabili, grafico andamento prezzi
- SPESA: lista della spesa dal magazzino, invio ordini via WhatsApp o email ai fornitori
- CHEF Z AI: questo assistente, per domande su cucina e sull'app

REGOLA ASSOLUTA:
Rispondi SOLO a domande che riguardano: cucina professionale, ristorazione, ingredienti, ricette, food cost, fornitori, attrezzature, HACCP, gestione ristorante, Chef Z.
Per qualsiasi altra domanda (politica, sport, tecnologia generica, vita privata, ecc.) rispondi SEMPRE e SOLO con:
"Sono Chef Z AI. Posso aiutarti solo su cucina, ristorazione professionale e sull'utilizzo di Chef Z. Come posso esserti utile?"

Rispondi sempre in italiano. Sii diretto, pratico e professionale. Usa la terminologia del settore.`

function ChefZAI({ isMobile, setPage, pushHistory }) {
  const [view, setView] = useState("hub") // "hub" | "chat"
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Ciao! Sono Chef Z AI, il tuo consulente di cucina e ristorazione professionale. Posso aiutarti su ingredienti, ricette, food cost, attrezzature, fornitori, HACCP e su come usare Chef Z. Come posso esserti utile?" }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function sendMessage() {
    const text = input.trim()
    if (!text || loading) return
    setInput("")
    const newMessages = [...messages, { role: "user", content: text }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + import.meta.env.VITE_GROQ_KEY },
        body: JSON.stringify({
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          max_tokens: 1024,
          messages: [
            { role: "system", content: CHEFZ_SYSTEM_PROMPT },
            ...newMessages.map(m => ({ role: m.role, content: m.content }))
          ]
        })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error.message)
      const reply = data.choices?.[0]?.message?.content || "Errore nella risposta."
      setMessages(prev => [...prev, { role: "assistant", content: reply }])
    } catch(e) {
      setMessages(prev => [...prev, { role: "assistant", content: "Errore di connessione. Riprova." }])
    }
    setLoading(false)
  }

  // HUB VIEW
  if (view === "hub") return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: "'Georgia',serif", fontSize: 20, color: STYLE.t1, marginBottom: 4 }}>Chef Z AI</div>
        <div style={{ fontSize: 12, color: STYLE.t3 }}>Funzioni Plus — powered by AI</div>
      </div>

      {/* Badge Plus */}
      <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: STYLE.acg, border: "1px solid " + STYLE.acd, borderRadius: 999, padding: "4px 14px", marginBottom: 20 }}>
        <span style={{ fontSize: 14 }}>⚡</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: STYLE.ac, letterSpacing: "0.12em", textTransform: "uppercase" }}>Piano Plus</span>
      </div>

      {/* Card 1: Chef Z AI Chat */}
      <div onClick={() => setView("chat")}
        style={{ ...card({ padding: "24px 20px", cursor: "pointer", marginBottom: 16, position: "relative", overflow: "hidden" }), borderColor: STYLE.acd }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg," + STYLE.ac + ",transparent)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: STYLE.acg, border: "1px solid " + STYLE.acd, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: "Georgia,serif", fontStyle: "italic", fontSize: 26, color: STYLE.ac, lineHeight: 1 }}>Z</span>
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: STYLE.t1 }}>Chef Z AI</div>
            <div style={{ fontSize: 12, color: STYLE.t3 }}>Consulente di cucina e ristorazione</div>
          </div>
        </div>
        <div style={{ fontSize: 13, color: STYLE.t2, lineHeight: 1.7, marginBottom: 14 }}>
          Il tuo esperto in tasca. Chiedi tutto su ingredienti, ricette, tecniche professionali, food cost, attrezzature, fornitori, HACCP e come usare Chef Z.
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {["Tecniche cucina", "Food cost", "Ingredienti", "HACCP", "Fornitori", "Attrezzature"].map(t => (
            <span key={t} style={{ fontSize: 10, color: STYLE.ac, background: STYLE.acg, border: "1px solid " + STYLE.acd, borderRadius: 999, padding: "2px 10px" }}>{t}</span>
          ))}
        </div>
        <div style={{ marginTop: 14, fontSize: 13, color: STYLE.ac, fontWeight: 600 }}>Inizia la chat →</div>
      </div>

      {/* Card 2: Food Cost AI */}
      <div onClick={() => { pushHistory?.(); setPage("dishes"); sessionStorage.setItem("openFCAI", "1"); }}
        style={{ ...card({ padding: "24px 20px", cursor: "pointer", position: "relative", overflow: "hidden" }), borderColor: STYLE.acd }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg," + STYLE.ac + ",transparent)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: STYLE.acg, border: "1px solid " + STYLE.acd, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
            🍽️
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: STYLE.t1 }}>Food Cost AI</div>
            <div style={{ fontSize: 12, color: STYLE.t3 }}>Calcolo automatico con intelligenza artificiale</div>
          </div>
        </div>
        <div style={{ fontSize: 13, color: STYLE.t2, lineHeight: 1.7, marginBottom: 14 }}>
          Inserisci solo il nome del piatto, la categoria e gli ingredienti. L'AI calcola automaticamente grammature, costi, food cost % e prezzo di vendita consigliato.
        </div>
        <div style={{ background: STYLE.el, borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 12, color: STYLE.t3, lineHeight: 1.6 }}>
          <span style={{ color: STYLE.t2, fontWeight: 600 }}>Prima:</span> inserisci 10 ingredienti con quantità manualmente — 20 minuti<br/>
          <span style={{ color: STYLE.ac, fontWeight: 600 }}>Con AI:</span> scrivi nome e ingredienti — 30 secondi
        </div>
        <div style={{ fontSize: 13, color: STYLE.ac, fontWeight: 600 }}>Vai al Food Cost AI →</div>
      </div>
    </div>
  )

  // CHAT VIEW
  return (
    <div style={{ display: "flex", flexDirection: "column", height: isMobile ? "calc(100vh - 130px)" : "calc(100vh - 100px)" }}>
      {/* Header */}
      <div style={{ marginBottom: 16, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setView("hub")} style={{ background: "none", border: "none", color: STYLE.ac, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, padding: 0 }}>← Chef Z AI</button>
          <span style={{ color: STYLE.t3, fontSize: 13 }}>/</span>
          <span style={{ fontSize: 13, color: STYLE.t1, fontWeight: 600 }}>Chat</span>
        </div>
      </div>

      {/* Messaggi */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, paddingBottom: 16 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            {m.role === "assistant" && (
              <div style={{ width: 28, height: 28, borderRadius: 8, background: STYLE.acg, border: "1px solid " + STYLE.acd, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginRight: 8, marginTop: 4 }}>
                <span style={{ fontFamily: "Georgia,serif", fontStyle: "italic", fontSize: 14, color: STYLE.ac }}>Z</span>
              </div>
            )}
            <div style={{
              maxWidth: "78%",
              padding: "10px 14px",
              borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              background: m.role === "user" ? STYLE.ac : STYLE.surf,
              color: m.role === "user" ? "#0d0d0f" : STYLE.t1,
              fontSize: 14,
              lineHeight: 1.6,
              border: m.role === "assistant" ? STYLE.bds : "none",
              whiteSpace: "pre-wrap"
            }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "flex-start", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: STYLE.acg, border: "1px solid " + STYLE.acd, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontFamily: "Georgia,serif", fontStyle: "italic", fontSize: 14, color: STYLE.ac }}>Z</span>
            </div>
            <div style={{ padding: "12px 16px", borderRadius: "16px 16px 16px 4px", background: STYLE.surf, border: STYLE.bds, display: "flex", gap: 4, alignItems: "center" }}>
              {[0,1,2].map(n => (
                <div key={n} style={{ width: 6, height: 6, borderRadius: "50%", background: STYLE.ac, opacity: 0.6, animation: `pulse ${0.8 + n * 0.15}s ease-in-out infinite alternate` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ flexShrink: 0, display: "flex", gap: 8, padding: "12px 0 0", borderTop: STYLE.bds }}>
        <input
          ref={inputRef}
          style={{ ...inp({ flex: 1, fontSize: 14, padding: "10px 14px" }), borderRadius: 12 }}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
          placeholder="Chiedi qualcosa su cucina o Chef Z..."
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          style={{ ...btn("p"), borderRadius: 12, padding: "10px 16px", opacity: loading || !input.trim() ? 0.5 : 1 }}>
          ➤
        </button>
      </div>

      <style>{`@keyframes pulse { from { opacity: 0.3; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }`}</style>
    </div>
  )
}


function FMPercentIcon({ size = 44 }) {
  const black = "#0d0d0f"
  const circleSize = size * 0.38
  const lw = size * 0.04
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: circleSize, height: circleSize, borderRadius: "50%", border: `${lw}px solid ${black}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "Georgia,serif", fontWeight: 700, fontSize: circleSize * 0.6, color: black, lineHeight: 1 }}>F</span>
      </div>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%) rotate(-30deg)", width: size * 0.9, height: lw, background: black, borderRadius: 999 }} />
      <div style={{ position: "absolute", bottom: 0, right: 0, width: circleSize, height: circleSize, borderRadius: "50%", border: `${lw}px solid ${black}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "Georgia,serif", fontWeight: 700, fontSize: circleSize * 0.6, color: black, lineHeight: 1 }}>M</span>
      </div>
    </div>
  )
}

function LoginPage() {
  const t = {
    login: "Accedi", register: "Registrati", resetPwd: "Reimposta password",
    email: "Email", password: "Password", confirmPwd: "Conferma password",
    forgotPwd: "Password dimenticata?", loginGoogle: "Continua con Google",
    noAccount: "Non hai un account?", haveAccount: "Hai già un account?",
    appDesc: "Gestione costi per ristoratori",
    errEmail: "Email non valida", errPwd: "La password deve avere almeno 6 caratteri",
    errPwdMatch: "Le password non coincidono",
    errLogin: "Email o password errati", errRegister: "Errore durante la registrazione",
    resetSent: "Email di reset inviata! Controlla la casella."
  }
  const [mode, setMode] = useState("login")
  const [form, setForm] = useState({ email: "", password: "", confirm: "" })
  const [err, setErr] = useState("")
  const [info, setInfo] = useState("")
  const [loading, setLoading] = useState(false)

  function validate() {
    if (!form.email.includes("@")) { setErr(t.errEmail); return false }
    if (mode !== "reset" && form.password.length < 6) { setErr(t.errPwd); return false }
    if (mode === "register" && form.password !== form.confirm) { setErr(t.errPwdMatch); return false }
    return true
  }

  async function handleSubmit() {
    setErr(""); setInfo("")
    if (!validate()) return
    setLoading(true)
    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, form.email, form.password)
      } else if (mode === "register") {
        await createUserWithEmailAndPassword(auth, form.email, form.password)
      } else if (mode === "reset") {
        await sendPasswordResetEmail(auth, form.email)
        setInfo(t.resetSent)
        setMode("login")
      }
    } catch(e) {
      setErr(mode === "login" ? t.errLogin : t.errRegister)
    }
    setLoading(false)
  }

  async function handleGoogle() {
    setErr(""); setLoading(true)
    try {
      await signInWithPopup(auth, googleProvider)
    } catch(e) {
      setErr(e.message)
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d0f", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "system-ui, sans-serif" }}>

      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <div style={{ width: 72, height: 72, background: STYLE.ac, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <FMPercentIcon size={44} />
        </div>
        <div style={{ fontFamily: "'Georgia',serif", fontSize: 26, color: STYLE.t1, letterSpacing: "-0.02em" }}>FoodMargin</div>
        <div style={{ fontSize: 13, color: STYLE.t3, marginTop: 4 }}>{t.appDesc}</div>
      </div>
      <div style={{ width: "100%", maxWidth: 380, background: STYLE.surf, border: STYLE.bd, borderRadius: 16, padding: "28px 24px" }}>
        <div style={{ fontFamily: "'Georgia',serif", fontSize: 18, color: STYLE.t1, marginBottom: 20 }}>
          {mode === "login" ? t.login : mode === "register" ? t.register : t.resetPwd}
        </div>
        {info && <div style={{ marginBottom: 14, padding: "10px 14px", background: STYLE.gd, border: "1px solid rgba(74,222,128,0.25)", borderRadius: 8, fontSize: 13, color: STYLE.green }}>{info}</div>}
        {err && <div style={{ marginBottom: 14, padding: "10px 14px", background: STYLE.rd, border: "1px solid rgba(248,113,113,0.25)", borderRadius: 8, fontSize: 13, color: STYLE.red }}>{err}</div>}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 11.5, fontWeight: 500, color: STYLE.t2, display: "block", marginBottom: 4 }}>{t.email}</label>
          <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            style={{ width: "100%", padding: "10px 12px", background: STYLE.el, border: STYLE.bd, borderRadius: 8, color: STYLE.t1, fontFamily: "inherit", fontSize: 14, outline: "none", boxSizing: "border-box" }}
            placeholder="nome@email.com" />
        </div>
        {mode !== "reset" && (
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11.5, fontWeight: 500, color: STYLE.t2, display: "block", marginBottom: 4 }}>{t.password}</label>
            <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              style={{ width: "100%", padding: "10px 12px", background: STYLE.el, border: STYLE.bd, borderRadius: 8, color: STYLE.t1, fontFamily: "inherit", fontSize: 14, outline: "none", boxSizing: "border-box" }}
              placeholder="        " onKeyDown={e => e.key === "Enter" && handleSubmit()} />
          </div>
        )}
        {mode === "register" && (
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11.5, fontWeight: 500, color: STYLE.t2, display: "block", marginBottom: 4 }}>{t.confirmPwd}</label>
            <input type="password" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
              style={{ width: "100%", padding: "10px 12px", background: STYLE.el, border: STYLE.bd, borderRadius: 8, color: STYLE.t1, fontFamily: "inherit", fontSize: 14, outline: "none", boxSizing: "border-box" }}
              placeholder="        " onKeyDown={e => e.key === "Enter" && handleSubmit()} />
          </div>
        )}
        {mode === "login" && (
          <div style={{ textAlign: "right", marginBottom: 16 }}>
            <button onClick={() => { setMode("reset"); setErr("") }} style={{ background: "none", border: "none", color: STYLE.t3, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>{t.forgotPwd}</button>
          </div>
        )}
        <button onClick={handleSubmit} disabled={loading}
          style={{ width: "100%", padding: "12px", background: STYLE.ac, color: "#0d0d0f", border: "none", borderRadius: 8, fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer", marginBottom: 12, opacity: loading ? 0.7 : 1 }}>
          {loading ? "..." : mode === "login" ? t.login : mode === "register" ? t.register : t.resetPwd}
        </button>
        {mode !== "reset" && (
          <button onClick={handleGoogle} disabled={loading}
            style={{ width: "100%", padding: "12px", background: STYLE.el, color: STYLE.t1, border: STYLE.bd, borderRadius: 8, fontFamily: "inherit", fontSize: 13, fontWeight: 500, cursor: "pointer", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <span style={{ fontSize: 16 }}>G</span> {t.loginGoogle}
          </button>
        )}
        <div style={{ textAlign: "center", fontSize: 13, color: STYLE.t3 }}>
          {mode === "login" && <>{t.noAccount} <button onClick={() => { setMode("register"); setErr("") }} style={{ background: "none", border: "none", color: STYLE.ac, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600 }}>{t.register}</button></>}
          {mode === "register" && <>{t.haveAccount} <button onClick={() => { setMode("login"); setErr("") }} style={{ background: "none", border: "none", color: STYLE.ac, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600 }}>{t.login}</button></>}
          {mode === "reset" && <button onClick={() => { setMode("login"); setErr("") }} style={{ background: "none", border: "none", color: STYLE.ac, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600 }}> {t.login}</button>}
        </div>
      </div>
    </div>
  )
}



function ListaSpesa({ spesa, setSpesa, ings, fornitori, isMobile, setNavBack, clearNavBack, pushHistory }) {
  const CATS = ["Carni", "Pesce", "Frutta e Verdura", "Freschi", "Surgelati", "Dispensa"]
  const [selCat, setSelCat] = useState(null)
  const [note, setNote]     = useState({}) // { ingId: noteText }
  const uid2 = () => Math.random().toString(36).slice(2, 7)

  function toggleIng(ing) {
    const exists = spesa.find(s => s.ingId === ing.id)
    if (exists) {
      setSpesa(prev => prev.filter(s => s.ingId !== ing.id))
    } else {
      setSpesa(prev => [...prev, { id: uid2(), ingId: ing.id, name: ing.name, unit: ing.unit, cat: ing.cat, cur: ing.cur || 0, done: false, qty: 1 }])
    }
  }

  function toggleDone(id) {
    setSpesa(prev => prev.map(s => s.id === id ? { ...s, done: !s.done } : s))
  }

  function removeItem(id) {
    setSpesa(prev => prev.filter(s => s.id !== id))
  }

  function clearDone() {
    setSpesa(prev => prev.filter(s => !s.done))
  }




  const [sendModalOpen, setSendModalOpen] = useState(false)
  const [ristoranteName, setRistoranteName] = useState(localStorage.getItem("ristoranteName") || "")
  const [consegnaDate, setConsegnaDate] = useState("")
  const [sendCat, setSendCat] = useState("Tutto")

  function sendOrder(fornitore) {
    const items = spesa.filter(s => !s.done && (sendCat === "Tutto" || s.cat === sendCat))
    if (!items.length) return
    const text = items.map(s => (parseFloat(s.qty) || 1) + " " + (s.unitSpesa || s.unit || "pz") + " " + s.name).join("\n")
    const now = new Date()
    const dataOra = now.toLocaleDateString("it-IT") + " ore " + now.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })
    const consegnaStr = consegnaDate ? "Consegna richiesta: " + consegnaDate : ""
    const header = (ristoranteName ? ristoranteName + "\n" : "") + "Data ordine: " + dataOra + (consegnaStr ? "\n" + consegnaStr : "")
    const msg = header + "\n\n" + text
    if (fornitore.tel) {
      const tel = fornitore.tel.replace(/\s/g, "")
      window.open("https://wa.me/" + (tel.startsWith("+") ? tel.slice(1) : "39" + tel) + "?text=" + encodeURIComponent(msg))
    } else if (fornitore.email) {
      window.open("mailto:" + fornitore.email + "?subject=Ordine " + new Date().toLocaleDateString("it-IT") + "&body=" + encodeURIComponent(msg))
    }
    setSendModalOpen(false)
  }

  const todoByCat = CATS.map(cat => ({
    cat,
    items: spesa.filter(s => s.cat === cat && !s.done)
  })).filter(g => g.items.length > 0)

  const doneItems = spesa.filter(s => s.done)

  const [selSotto1, setSelSotto1] = useState(null)

  // Back button: naviga tra i livelli lista spesa
  useEffect(() => {
    if (selCat === null) { clearNavBack?.(); return }
    setNavBack?.(() => {
      if (selSotto1 !== null) setSelSotto1(null)
      else setSelCat(null)
    })
    return () => { clearNavBack?.() }
  }, [selCat, selSotto1])

  //  -  -  SELEZIONE INGREDIENTI  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  - 

  if (selCat !== null) {
    const catIngs = ings.filter(i => i.cat === selCat)
    const sotto1List = SOTTO1_ORDER[selCat] || []
    const sotto1WithIngs = sotto1List // mostra tutte le sottocategorie fisse come nel Magazzino
    const ungrouped = catIngs.filter(i => !i.sotto1)

    // Livello 2: mostra card sottocategorie
    if (selSotto1 === null && sotto1WithIngs.length > 0) {
      return (
        <div>
          <div style={row({ marginBottom: 16 })}>
            <button onClick={() => setSelCat(null)} style={{ background: "none", border: "none", color: STYLE.ac, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, padding: 0 }}> Lista spesa</button>
            <span style={{ color: STYLE.t3, fontSize: 13 }}>/</span>
            <span style={{ fontSize: 13, color: STYLE.t1, fontWeight: 600 }}>{selCat}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
            {sotto1WithIngs.map(s1 => {
              const count = catIngs.filter(i => i.sotto1 === s1).length
              const inList = catIngs.filter(i => i.sotto1 === s1 && spesa.some(sp => sp.ingId === i.id)).length
              return (
                <div key={s1} onClick={() => {
                  pushHistory?.()
                  setSelSotto1(s1)
                  if (setRecentAlerts) setRecentAlerts(prev => prev.filter(r => !(r.cat === selCat && r.sotto1 === s1)))
                }}
                  style={{ ...card({ padding: "14px 12px", cursor: "pointer" }), borderColor: inList > 0 ? STYLE.acd : "#1f1f25" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: STYLE.t1, marginBottom: 2 }}>{s1}</div>
                  <div style={{ fontSize: 11, color: STYLE.t3 }}>{count} ingredienti</div>
                  {inList > 0 && <div style={{ fontSize: 10, color: STYLE.ac, marginTop: 2 }}>{inList} in lista</div>}
                </div>
              )
            })}
            {ungrouped.length > 0 && (
              <div onClick={() => setSelSotto1("__altri__")}
                style={{ ...card({ padding: "14px 12px", cursor: "pointer" }) }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: STYLE.t1, marginBottom: 2 }}>Altri</div>
                <div style={{ fontSize: 11, color: STYLE.t3 }}>{ungrouped.length} ingredienti</div>
              </div>
            )}
          </div>
        </div>
      )
    }

    // Livello 3: lista ingredienti nella sottocategoria
    const filteredIngs = (selSotto1 === "__altri__"
      ? ungrouped
      : selSotto1 ? catIngs.filter(i => i.sotto1 === selSotto1) : catIngs
    ).sort((a, b) => a.name.localeCompare(b.name, "it"))

    return (
      <div>
        <div style={row({ marginBottom: 16 })}>
          <button onClick={() => setSelCat(null)} style={{ background: "none", border: "none", color: STYLE.ac, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, padding: 0 }}> Lista spesa</button>
          <span style={{ color: STYLE.t3, fontSize: 13 }}>/</span>
          <button onClick={() => setSelSotto1(null)} style={{ background: "none", border: "none", color: STYLE.ac, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, padding: 0 }}>{selCat}</button>
          {selSotto1 && <><span style={{ color: STYLE.t3, fontSize: 13 }}>/</span>
          <span style={{ fontSize: 13, color: STYLE.t1, fontWeight: 600 }}>{selSotto1 === "__altri__" ? "Altri" : selSotto1}</span></>}
        </div>
        <div style={{ fontSize: 12, color: STYLE.t3, marginBottom: 14 }}>Tocca per aggiungere alla lista</div>
        {filteredIngs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: STYLE.t3, fontSize: 13 }}>Nessun ingrediente</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {filteredIngs.map(ing => {
              const inList = spesa.some(s => s.ingId === ing.id)
              return (
                <div key={ing.id} onClick={() => toggleIng(ing)}
                  style={{ ...card({ padding: "12px 14px", cursor: "pointer" }),
                    borderColor: inList ? STYLE.acd : "#1f1f25",
                    background: inList ? STYLE.acg : STYLE.surf }}>
                  <div style={row({ justifyContent: "space-between" })}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: inList ? STYLE.ac : STYLE.t1, marginBottom: 2 }}>{ing.name}</div>
                      <div style={{ fontSize: 11, color: STYLE.t3 }}>{ing.cur > 0 ? "€ " + (ing.cur || 0).toFixed(2) + "/" + ing.unit : ing.unit}</div>
                    </div>
                    <div style={{ width: 22, height: 22, borderRadius: 4, border: "2px solid " + (inList ? STYLE.ac : "#2a2a31"), background: inList ? STYLE.ac : "none", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {inList && <span style={{ fontSize: 12, color: "#0d0d0f", fontWeight: 700 }}>-</span>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  //  -  -  LISTA SPESA  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  - 
  return (
    <div>
      <div style={row({ justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap" })}>
        <div>
          <div style={{ fontFamily: "'Georgia',serif", fontSize: 20, color: STYLE.t1, marginBottom: 2 }}>Lista della spesa</div>
          <div style={{ fontSize: 12, color: STYLE.t3 }}>{spesa.filter(s => !s.done).length} da comprare . {doneItems.length} completati</div>
        </div>
        <div style={row({ gap: 8 })}>
          {doneItems.length > 0 && (
            <button style={btn("g", { fontSize: 12 })} onClick={clearDone}>Rimuovi completati</button>
          )}
          {spesa.filter(s => !s.done).length > 0 && (
            <button style={btn("p", { fontSize: 12 })} onClick={() => setSendModalOpen(true)}>Invia ordine</button>
          )}
          {spesa.length > 0 && (
            <button style={{ ...btn("g", { fontSize: 12 }), color: STYLE.red }}
              onClick={() => { if (window.confirm("Svuotare tutta la lista spesa?")) setSpesa([]) }}>
              Svuota lista
            </button>
          )}
        </div>

        {sendModalOpen && (
          <div onClick={() => setSendModalOpen(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 9999 }}>
            <div onClick={e => e.stopPropagation()}
              style={{ background: STYLE.surf, borderRadius: "16px 16px 0 0", padding: 20, width: "100%", maxWidth: 480, maxHeight: "85vh", overflowY: "auto" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: STYLE.t1, marginBottom: 16 }}>Invia ordine</div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, color: STYLE.t3, display: "block", marginBottom: 4 }}>Nome ristorante</label>
                <input value={ristoranteName} onChange={e => { setRistoranteName(e.target.value); localStorage.setItem("ristoranteName", e.target.value) }}
                  placeholder="es. Ristorante Da Marco"
                  style={{ width: "100%", background: STYLE.el, border: STYLE.bd, borderRadius: STYLE.r, color: STYLE.t1, fontSize: 13, padding: "7px 10px", fontFamily: "inherit", boxSizing: "border-box" }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, color: STYLE.t3, display: "block", marginBottom: 4 }}>Data consegna richiesta</label>
                <input type="text" value={consegnaDate} onChange={e => setConsegnaDate(e.target.value)}
                  placeholder="es. Lunedì 20/05 o Sabato mattina"
                  style={{ width: "100%", background: STYLE.el, border: STYLE.bd, borderRadius: STYLE.r, color: STYLE.t1, fontSize: 13, padding: "7px 10px", fontFamily: "inherit", boxSizing: "border-box" }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, color: STYLE.t3, display: "block", marginBottom: 6 }}>Cosa inviare:</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {["Tutto", ...["Carni","Pesce","Frutta e Verdura","Freschi","Surgelati","Dispensa"].filter(c => spesa.some(s => !s.done && s.cat === c))].map(cat => (
                    <button key={cat} onClick={() => setSendCat(cat)}
                      style={{ ...btn(sendCat === cat ? "p" : "g", { fontSize: 11, padding: "4px 10px" }) }}>{cat}</button>
                  ))}
                </div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: STYLE.t2, marginBottom: 8 }}>Seleziona fornitore:</div>
              {(fornitori || []).length === 0 ? (
                <div style={{ fontSize: 13, color: STYLE.t3, textAlign: "center", padding: "20px 0" }}>Nessun fornitore salvato — aggiungili nella sezione Fatture</div>
              ) : (
                (fornitori || []).map(f => (
                  <div key={f.id} onClick={() => sendOrder(f)}
                    style={{ ...card({ padding: "12px 14px", marginBottom: 8, cursor: "pointer" }) }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: STYLE.t1 }}>{f.name}</div>
                    <div style={{ fontSize: 11, color: STYLE.t3 }}>{f.tel ? "" + f.tel : f.email ? "" + f.email : "Nessun contatto"}</div>
                  </div>
                ))
              )}
              <button onClick={() => setSendModalOpen(false)} style={{ ...btn("g", { width: "100%", marginTop: 8 }) }}>Annulla</button>
            </div>
          </div>
        )}
      </div>

      {/* Categorie per aggiungere */}
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: STYLE.t3, marginBottom: 10 }}>
        Aggiungi dalla lista ingredienti
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 8, marginBottom: 24 }}>
        {CATS.map(cat => {
          const count = ings.filter(i => i.cat === cat).length
          const inList = spesa.filter(s => s.cat === cat && !s.done).length
          return (
            <div key={cat} onClick={() => { pushHistory?.(); setSelCat(cat) }}
              style={{ ...card({ padding: "12px 14px", cursor: "pointer" }),
                borderColor: inList > 0 ? STYLE.acd : "#1f1f25" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: STYLE.t1, marginBottom: 2 }}>{cat}</div>
              <div style={{ fontSize: 11, color: STYLE.t3 }}>{count} ingredienti</div>
              {inList > 0 && <div style={{ fontSize: 10, color: STYLE.ac, marginTop: 2 }}>{inList} in lista</div>}
            </div>
          )
        })}
      </div>

      {/* Lista da comprare */}
      {spesa.filter(s => !s.done).length === 0 && spesa.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: STYLE.t3, fontSize: 13 }}>
          La lista    vuota  -  aggiungi ingredienti dalle categorie sopra
        </div>
      ) : (
        <>
          {todoByCat.map(({ cat, items }) => (
            <div key={cat} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: STYLE.t3, marginBottom: 8, paddingBottom: 4, borderBottom: STYLE.bds }}>{cat}</div>
              {items.map(s => (
                <div key={s.id} style={{ ...card({ padding: "10px 12px", marginBottom: 6 }) }}>
                  <div style={row({ justifyContent: "space-between", marginBottom: 6 })}>
                    <div onClick={() => toggleDone(s.id)} style={row({ gap: 10, flex: 1, cursor: "pointer" })}>
                      <div style={{ width: 20, height: 20, borderRadius: "50%", border: "2px solid #2a2a31", flexShrink: 0 }} />
                      <span style={{ fontSize: 14, color: STYLE.t1, fontWeight: 600 }}>{s.name}</span>
                    </div>
                    <button onClick={() => removeItem(s.id)} style={{ background: "none", border: "none", color: STYLE.t3, cursor: "pointer", fontSize: 16, padding: "0 4px" }}></button>
                  </div>
                  <div style={row({ gap: 8, alignItems: "center" })}>
                    <input type="number" min="0" step="0.1"
                      value={s.qty === undefined ? "" : s.qty}
                      onChange={e => setSpesa(prev => prev.map(x => x.id === s.id ? { ...x, qty: e.target.value === "" ? "" : parseFloat(e.target.value) } : x))}
                      onBlur={e => setSpesa(prev => prev.map(x => x.id === s.id ? { ...x, qty: parseFloat(e.target.value) || 1 } : x))}
                      style={{ width: 60, background: STYLE.el, border: STYLE.bd, borderRadius: STYLE.r, color: STYLE.t1, fontSize: 13, padding: "3px 6px", textAlign: "center", fontFamily: "inherit" }} />
                    <select
                      value={s.unitSpesa || s.unit || "pz"}
                      onChange={e => setSpesa(prev => prev.map(x => x.id === s.id ? { ...x, unitSpesa: e.target.value } : x))}
                      style={{ background: STYLE.el, border: STYLE.bd, borderRadius: STYLE.r, color: STYLE.t2, fontSize: 12, padding: "3px 6px", fontFamily: "inherit", cursor: "pointer" }}>
                      {["kg","g","l","ml","pz","cassa","cartone","busta","scatola","bottiglie","conf"].map(u => <option key={u}>{u}</option>)}
                    </select>
                    {s.cur > 0 && <>
                      <span style={{ fontSize: 11, color: STYLE.t3, marginLeft: "auto" }}>{formatEuro(s.cur)}/{s.unit || "pz"}</span>
                      <span style={{ fontSize: 12, color: STYLE.ac, fontWeight: 600 }}>{formatEuro(Math.round((parseFloat(s.qty) || 1) * s.cur * 100) / 100)}</span>
                    </>}
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* Totale spesa */}
          {spesa.filter(s => !s.done && s.cur > 0).length > 0 && (
            <div style={{ ...card({ padding: "12px 16px", marginBottom: 16 }), borderColor: STYLE.acd }}>
              <div style={row({ justifyContent: "space-between" })}>
                <span style={{ fontSize: 13, color: STYLE.t2, fontWeight: 600 }}>Totale stimato</span>
                <span style={{ fontSize: 16, color: STYLE.ac, fontWeight: 700 }}>
                  {formatEuro(spesa.filter(s => !s.done).reduce((acc, s) => acc + Math.round((s.qty || 1) * (s.cur || 0) * 100) / 100, 0))}
                </span>
              </div>
            </div>
          )}

          {/* Completati */}
          {doneItems.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: STYLE.t3, marginBottom: 8 }}>Completati</div>
              {doneItems.map(s => (
                <div key={s.id} style={row({ justifyContent: "space-between", padding: "10px 12px", background: STYLE.el, border: STYLE.bds, borderRadius: STYLE.r, marginBottom: 6, opacity: 0.6 })}>
                  <div onClick={() => toggleDone(s.id)} style={row({ gap: 10, flex: 1, cursor: "pointer" })}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", border: "2px solid " + STYLE.green, background: STYLE.gd, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 11, color: STYLE.green, fontWeight: 700 }}>-</span>
                    </div>
                    <span style={{ fontSize: 14, color: STYLE.t3, textDecoration: "line-through" }}>{s.name}</span>
                  </div>
                  <button onClick={() => removeItem(s.id)} style={{ background: "none", border: "none", color: STYLE.t3, cursor: "pointer", fontSize: 16, padding: "0 4px" }}></button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}


function Onboarding({ onDone }) {
  const steps = [
    {
      icon: "-- ",
      title: "Benvenuto in FoodMargin",
      desc: "Il gestionale pensato per ristoratori italiani. Tieni sotto controllo costi, fornitori e menu  -  tutto dal tuo telefono."
    },
    {
      icon: "- ",
      title: "Inizia dalle fatture",
      desc: "Scatta una foto alla bolla del fornitore. FoodMargin legge i prodotti automaticamente, aggiorna i prezzi e popola il magazzino."
    },
    {
      icon: "-- ",
      title: "Calcola le ricette",
      desc: "Crea ricette con ingredienti e grammature reali. Il food cost e il prezzo di vendita consigliato vengono calcolati in automatico."
    },

  ]
  const [step, setStep] = useState(0)
  const cur = steps[step]
  const isLast = step === steps.length - 1

  return (
    <div style={{ minHeight: "100vh", background: STYLE.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "system-ui, sans-serif" }}>
      {/* Logo */}
      <div style={{ marginBottom: 40, textAlign: "center" }}>
        <div style={{ fontFamily: "'Georgia',serif", fontSize: 28, color: STYLE.ac, letterSpacing: "-0.02em" }}>FoodMargin</div>
        <div style={{ fontSize: 12, color: STYLE.t3, marginTop: 4 }}>Gestione costi per ristoratori</div>
      </div>

      {/* Step card */}
      <div style={{ width: "100%", maxWidth: 360, background: STYLE.surf, border: STYLE.bd, borderRadius: 20, padding: "32px 24px", marginBottom: 28, textAlign: "center" }}>
        <div style={{ width: 64, height: 64, background: STYLE.acg, border: "1px solid " + STYLE.acd, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 28, color: STYLE.ac }}>
          <NavIcon id={cur.id} />
        </div>
        <div style={{ fontFamily: "'Georgia',serif", fontSize: 20, color: STYLE.t1, marginBottom: 12 }}>{cur.title}</div>
        <div style={{ fontSize: 14, color: STYLE.t2, lineHeight: 1.7 }}>{cur.desc}</div>
      </div>

      {/* Dots */}
      <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
        {steps.map((_, i) => (
          <div key={i} style={{ width: i === step ? 20 : 8, height: 8, borderRadius: 999, background: i === step ? STYLE.ac : STYLE.el, transition: "width 0.3s" }} />
        ))}
      </div>

      {/* Buttons */}
      <div style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", gap: 10 }}>
        {isLast ? (
          <button onClick={onDone}
            style={{ width: "100%", padding: "16px", background: STYLE.ac, color: "#0d0d0f", border: "none", borderRadius: 12, fontFamily: "inherit", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
              Scansiona la tua prima fattura
          </button>
        ) : (
          <button onClick={() => setStep(s => s + 1)}
            style={{ width: "100%", padding: "14px", background: STYLE.ac, color: "#0d0d0f", border: "none", borderRadius: 10, fontFamily: "inherit", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
            Avanti '
          </button>
        )}
        <button onClick={onDone}
          style={{ width: "100%", padding: "10px", background: "none", color: STYLE.t3, border: "none", fontFamily: "inherit", fontSize: 13, cursor: "pointer" }}>
          Salta introduzione
        </button>
      </div>
    </div>
  )
}


function NavIcon({ id }) {
  const s = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" }
  if (id === "inv")    return <svg {...s}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/></svg>
  if (id === "ing")    return <svg {...s}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27,6.96 12,12.01 20.73,6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
  if (id === "dishes_fc" || id === "fc") return <svg {...s}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="14" y2="17"/></svg>
  if (id === "dishes") return <svg {...s}><circle cx="12" cy="12" r="9"/><path d="M9 7v10M15 7v4a2 2 0 0 1-4 0V7"/></svg>
  if (id === "dash")   return <svg {...s}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
  if (id === "ai")     return <svg {...s}><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12"/></svg>
  if (id === "spesa")  return <svg {...s}><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
  return null
}

const NAV = [
  { id: "inv",    label: "Forniture", group: "Gestione" },
  { id: "ing",    label: "Magazzino", group: "Gestione" },
  { id: "dishes", label: "Ricette",   group: "Gestione" },
  { id: "dash",   label: "Dashboard", group: "Gestione" },
  { id: "spesa",  label: "Spesa",     group: "Gestione" },
  { id: "ai",     label: "Chef Z AI", group: "Gestione" },
]

export default function App() {
  const [page, setPage] = useState(() => sessionStorage.getItem("ristorai_page") || "inv")
  const [collapsed, setCollapsed] = useState(false)
  useEffect(() => { sessionStorage.setItem("ristorai_page", page) }, [page])

  // Back button nativo mobile
  const pageHistRef = useRef([sessionStorage.getItem("ristorai_page") || "inv"])
  const navTo = (newPage) => {
    _navBackHandler = null
    if (pageHistRef.current[pageHistRef.current.length - 1] !== newPage) {
      pageHistRef.current = [...pageHistRef.current, newPage]
    }
    window.history.pushState({ inApp: true }, "", "")
    setPage(newPage)
    sessionStorage.setItem("ristorai_page", newPage)
  }
  const setNavBack = (fn) => { _navBackHandler = fn }
  const clearNavBack = () => { _navBackHandler = null }
  const pushHistory = () => { window.history.pushState({ inApp: true }, "", "") }
  useEffect(() => {
    window.history.replaceState({ inApp: true }, "", "")
    const handlePop = () => {
      if (_navBackHandler) {
        _navBackHandler()
      } else if (pageHistRef.current.length > 1) {
        pageHistRef.current = pageHistRef.current.slice(0, -1)
        const prev = pageHistRef.current[pageHistRef.current.length - 1]
        setPage(prev)
        sessionStorage.setItem("ristorai_page", prev)
      }
    }
    window.addEventListener("popstate", handlePop)
    return () => window.removeEventListener("popstate", handlePop)
  }, [])
  const [ready, setReady] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1024)
  useEffect(() => { const h = () => setW(window.innerWidth); window.addEventListener("resize", h); return () => window.removeEventListener("resize", h) }, [])

  const [ings,      setIngs]      = useState([])
  const [learned,    setLearned]   = useState({}) // prodotti imparati dall'utente
  const [dishes,    setDishes]    = useState([])
  const [invs,      setInvs]      = useState([])
  const [fornitori, setFornitori] = useState([])
  const [spesa, setSpesa] = useState([])
  const [editDish, setEditDish] = useState(null)
  const [onboarded, setOnboarded] = useState(true) // true = skip onboarding for existing users

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u)
      setAuthReady(true)
      if (!u) setReady(false)
    })
    return unsub
  }, [])

  // Load data per user
  useEffect(() => {
    if (!user) { setLoaded(false); return }
    async function load() {
      setLoaded(false)
      setReady(false)
      setIngs([]); setInvs([]); setDishes([]); setFornitori([]); setSpesa([])
      try {
        const snap = await getDoc(doc(db, "users", user.uid, "data", "main"))
        if (snap.exists()) {
          const d = snap.data()
          if (d.ings) {
            // Migrazione automatica alla nuova struttura prezzi per fornitore
            const migrated = d.ings.map(ing => {
              if (ing.prezzi && ing.prezzi.length > 0) return ing
              const price = ing.cur || 0
              return {
                ...ing,
                prezzi: price > 0 ? [{ sup: ing.fornitore || "Fornitore", price, date: new Date().toISOString().slice(0,10) }] : []
              }
            })
            setIngs(migrated)
          }
          if (d.dishes)    setDishes(d.dishes)
          if (d.invs)      setInvs(d.invs)
          if (d.fornitori)  setFornitori(d.fornitori)
          if (d.spesa)      setSpesa(d.spesa)
          if (d.learned)    setLearned(d.learned)
          // Utente esistente  -  salta onboarding
          setOnboarded(true)
        } else {
          // Nuovo utente  -  mostra onboarding
          setOnboarded(false)
        }
        setLoaded(true)
      } catch (e) { console.log("Load error:", e); setLoaded(true) }
      setReady(true)
    }
    load()
  }, [user])

  // Save data per user
  useEffect(() => {
    if (!ready || !user || !loaded) return
    // Rimuove valori undefined che Firebase non accetta
    const clean = obj => {
      if (Array.isArray(obj)) return obj.map(clean)
      if (obj && typeof obj === "object") {
        return Object.fromEntries(Object.entries(obj).filter(([,v]) => v !== undefined).map(([k,v]) => [k, clean(v)]))
      }
      return obj
    }
    setDoc(doc(db, "users", user.uid, "data", "main"), clean({ ings, dishes, invs, fornitori, spesa, onboarded: onboarded, learned }), { merge: true })
      .catch(e => console.log("Save error:", e))
  }, [ings, dishes, invs, fornitori, spesa, onboarded, learned, ready, user])

  async function deleteAccount() {
    if (!window.confirm("Sei sicuro di voler eliminare il tuo account? Tutti i tuoi dati verranno cancellati definitivamente.")) return

    async function doDelete() {
      await deleteDoc(doc(db, "users", user.uid, "data", "main"))
      await deleteUser(user)
      await signOut(auth)
      setUser(null); setOnboarded(false); setSettingsOpen(false)
    }

    try {
      await doDelete()
    } catch(e) {
      if (e.code === "auth/requires-recent-login") {
        // Re-autenticazione necessaria
        const provider = user.providerData?.[0]?.providerId
        if (provider === "google.com") {
          // Re-login Google
          try {
            const gProvider = new GoogleAuthProvider()
            await signInWithPopup(auth, gProvider)
            await doDelete()
          } catch(e2) {
            alert("Errore: " + e2.message)
          }
        } else {
          // Re-login email/password
          const pwd = window.prompt("Inserisci la tua password per confermare la cancellazione:")
          if (!pwd) return
          try {
            const credential = EmailAuthProvider.credential(user.email, pwd)
            await reauthenticateWithCredential(user, credential)
            await doDelete()
          } catch(e2) {
            alert("Password errata o errore: " + e2.message)
          }
        }
      } else {
        alert("Errore: " + e.message)
      }
    }
  }

  const [settingsOpen, setSettingsOpen] = useState(false)

  async function sendPasswordReset() {
    try {
      await sendPasswordResetEmail(auth, user.email)
      alert("Email di reset inviata a " + user.email + "  -  controlla la casella (anche spam).")
    } catch(e) {
      alert("Errore: " + e.message)
    }
  }

  function SettingsPanel() {
    const createdAt = user?.metadata?.creationTime
      ? new Date(user.metadata.creationTime).toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" })
      : " - "
    const lastLogin = user?.metadata?.lastSignInTime
      ? new Date(user.metadata.lastSignInTime).toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
      : " - "
    const provider = user?.providerData?.[0]?.providerId === "google.com" ? "Google" : "Email / Password"

    const sections = [
      {
        title: "Account",
        items: [
          { label: "Email", value: user?.email || " - " },
          { label: "Accesso con", value: provider },
          { label: "Registrato il", value: createdAt },
          { label: "Ultimo accesso", value: lastLogin },
        ]
      },
      {
        title: "Piano",
        items: [
          { label: "Piano attivo", value: "Professional" },
          { label: "Versione app", value: "FoodMargin v1.0" },
          { label: "Dati salvati su", value: "Firebase / Google Cloud" },
        ]
      },
      {
        title: "Privacy e dati",
        items: [
          { label: "Dati personali", value: "Salvati in modo sicuro su Firebase" },
          { label: "Accesso ai dati", value: "Solo tu puoi vedere i tuoi dati" },
          { label: "Backup automatico", value: "Ogni modifica viene salvata" },
        ]
      }
    ]

    const Wrap = isMobile ? ({ children }) => (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", flexDirection: "column", justifyContent: "flex-end", zIndex: 9999 }}>
        <div style={{ background: STYLE.surf, borderRadius: "22px 22px 0 0", maxHeight: "92vh", display: "flex", flexDirection: "column" }}>
          <div style={{ width: 40, height: 4, background: STYLE.el, borderRadius: 999, margin: "12px auto 0", flexShrink: 0 }} />
          {children}
        </div>
      </div>
    ) : ({ children }) => (
      <div onClick={e => e.target === e.currentTarget && setSettingsOpen(false)}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 9999 }}>
        <div style={{ background: STYLE.surf, border: STYLE.bd, borderRadius: 16, width: "100%", maxWidth: 480, maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
          {children}
        </div>
      </div>
    )

    return (
      <Wrap>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px 0", flexShrink: 0 }}>
          <div style={{ fontFamily: "'Georgia',serif", fontSize: 20, color: STYLE.t1 }}>Impostazioni</div>
          <button onClick={() => setSettingsOpen(false)} style={{ background: STYLE.el, border: "none", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", color: STYLE.t3, fontSize: 18, lineHeight: 1 }}></button>
        </div>

        {/* Avatar + email */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 22px", borderBottom: STYLE.bds, flexShrink: 0 }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: STYLE.acg, border: "2px solid " + STYLE.acd, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Georgia',serif", fontSize: 22, color: STYLE.ac, flexShrink: 0 }}>
            {user?.email?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: STYLE.t1 }}>{user?.email?.split("@")[0] || "Utente"}</div>
            <div style={{ fontSize: 12, color: STYLE.t3 }}>{user?.email || " - "}</div>
          </div>
        </div>

        {/* Scrollable content */}
        <div style={{ overflowY: "auto", flex: 1, padding: "8px 22px 0" }}>

          {/* Info sections */}
          {sections.map((sec, si) => (
            <div key={si} style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: STYLE.t3, marginBottom: 8, marginTop: 16 }}>{sec.title}</div>
              <div style={{ background: STYLE.el, border: STYLE.bd, borderRadius: STYLE.r2, overflow: "hidden" }}>
                {sec.items.map(({ label, value }, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 14px", borderBottom: i < sec.items.length - 1 ? STYLE.bds : "none" }}>
                    <span style={{ fontSize: 13, color: STYLE.t3 }}>{label}</span>
                    <span style={{ fontSize: 13, color: STYLE.t1, fontWeight: 500, maxWidth: "55%", textAlign: "right" }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Azioni account */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: STYLE.t3, marginBottom: 8, marginTop: 16 }}>Azioni</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

              {/* Reset password  -  solo se non Google */}
              {provider !== "Google" && (
                <button onClick={sendPasswordReset}
                  style={{ ...btn("s"), justifyContent: "space-between", padding: "12px 14px", borderRadius: STYLE.r2 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: STYLE.t1, textAlign: "left" }}>Reimposta password</div>
                    <div style={{ fontSize: 11, color: STYLE.t3, marginTop: 2, textAlign: "left" }}>Ricevi un'email per cambiare la password</div>
                  </div>
                  <span style={{ color: STYLE.t3, fontSize: 14 }}> </span>
                </button>
              )}

              {/* Logout */}
              <button onClick={() => { setSettingsOpen(false); signOut(auth) }}
                style={{ ...btn("s"), justifyContent: "space-between", padding: "12px 14px", borderRadius: STYLE.r2 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: STYLE.t1, textAlign: "left" }}>Esci dall'account</div>
                  <div style={{ fontSize: 11, color: STYLE.t3, marginTop: 2, textAlign: "left" }}>Rimani registrato, esci solo da questo dispositivo</div>
                </div>
                <span style={{ color: STYLE.t3, fontSize: 14 }}> </span>
              </button>

              {/* Elimina account */}
              <button onClick={() => { setSettingsOpen(false); deleteAccount() }}
                style={{ ...btn("s"), justifyContent: "space-between", padding: "12px 14px", borderRadius: STYLE.r2, background: STYLE.rd, borderColor: "rgba(248,113,113,0.3)" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: STYLE.red, textAlign: "left" }}>Elimina account</div>
                  <div style={{ fontSize: 11, color: STYLE.t3, marginTop: 2, textAlign: "left" }}>Cancella tutti i dati in modo permanente</div>
                </div>
                <span style={{ color: STYLE.red, fontSize: 14 }}> </span>
              </button>

            </div>
          </div>

          <div style={{ fontSize: 11, color: STYLE.t3, textAlign: "center", paddingBottom: 24 }}>
            FoodMargin . Tutti i dati sono crittografati e al sicuro
          </div>

        </div>
      </Wrap>
    )
  }

  if (!authReady) return (
    <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "#0d0d0f", flexDirection: "column", gap: 12 }}>
      <div style={{ fontFamily: "'Georgia',serif", fontSize: 18, color: "#e8a838", letterSpacing: "-0.02em" }}>FoodMargin</div>
      <div style={{ fontSize: 12, color: "#5a5963" }}>Caricamento...</div>
    </div>
  )

  if (!user) return <LoginPage />
  if (!onboarded) return <Onboarding onDone={() => { setOnboarded(true) }} />

  if (!ready) return (
    <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "#0d0d0f", flexDirection: "column", gap: 12 }}>
      <div style={{ fontFamily: "'Georgia',serif", fontSize: 18, color: "#e8a838", letterSpacing: "-0.02em" }}>FoodMargin</div>
      <div style={{ fontSize: 12, color: "#5a5963" }}>Connessione al database...</div>
    </div>
  )

  const isMobile = w < 700
  function renderPage() {
    try {
      switch(page) {
        case "dash":   return <Dashboard ings={ings} dishes={dishes} invs={invs} isMobile={isMobile} setPage={navTo} />
        case "ing":    return <Ingredients ings={ings} setIngs={setIngs} invs={invs} isMobile={isMobile} setNavBack={setNavBack} clearNavBack={clearNavBack} pushHistory={pushHistory} recentAlerts={recentAlerts} setRecentAlerts={setRecentAlerts} />
        case "dishes": return <Dishes dishes={dishes} setDishes={setDishes} ings={ings} isMobile={isMobile} setPage={navTo} setEditDish={setEditDish} setNavBack={setNavBack} clearNavBack={clearNavBack} />
        case "inv":    return <Invoices invs={invs} setInvs={setInvs} ings={ings} setIngs={setIngs} fornitori={fornitori} setFornitori={setFornitori} learned={learned} setLearned={setLearned} isMobile={isMobile} setNavBack={setNavBack} clearNavBack={clearNavBack} />
        case "ai":     return <ChefZAI isMobile={isMobile} setPage={navTo} pushHistory={pushHistory} />
        case "spesa":  return <ListaSpesa spesa={spesa} setSpesa={setSpesa} ings={ings} fornitori={fornitori} isMobile={isMobile} setNavBack={setNavBack} clearNavBack={clearNavBack} />
        default:       return <Dashboard ings={ings} isMobile={isMobile} />
      }
    } catch(e) {
      return <div style={{ padding: 20, color: "#f87171" }}>Errore: {e.message}</div>
    }
  }
  const groups = [...new Set(NAV.map(n => n.group))]
  const sideW = collapsed ? 52 : 160

  if (isMobile) return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: STYLE.bg, color: STYLE.t1, fontFamily: "system-ui, sans-serif" }}>
      <div style={{ height: 52, background: STYLE.surf, borderBottom: STYLE.bds, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", flexShrink: 0 }}>
        <div style={{ fontFamily: "'Georgia',serif", fontSize: 20, color: STYLE.ac }}>FoodMargin</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => setSettingsOpen(true)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", width: 34, height: 34, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
            {user?.photoURL
              ? <img src={user.photoURL} style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover" }} />
              : <div style={{ width: 34, height: 34, borderRadius: "50%", background: STYLE.ac, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff" }}>{(user?.displayName || user?.email || "?")[0].toUpperCase()}</div>
            }
          </button>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px 90px" }}>
        {renderPage()}
      </div>
      {settingsOpen && <SettingsPanel />}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: STYLE.surf, borderTop: STYLE.bds, display: "flex", zIndex: 100, padding: "6px 4px 16px" }}>
        {NAV.map(n => (
          <button key={n.id} onClick={() => navTo(n.id)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "6px 2px", background: page === n.id ? "rgba(90,89,99,0.25)" : "none", border: "none", borderRadius: 10, cursor: "pointer", color: page === n.id ? STYLE.t3 : STYLE.ac }}>
            <NavIcon id={n.id} />
            <span style={{ fontSize: 9, fontWeight: 600 }}>{n.label}</span>
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div style={{ display: "flex", height: "100vh", background: STYLE.bg, color: STYLE.t1, fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 13.5, lineHeight: 1.5, overflow: "hidden" }}>

      <div style={{ width: sideW, flexShrink: 0, background: STYLE.surf, borderRight: STYLE.bds, display: "flex", flexDirection: "column", overflow: "hidden", transition: "width 0.2s ease" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between", padding: collapsed ? "14px 0" : "12px 10px 12px 14px", borderBottom: STYLE.bds, minHeight: 52 }}>
          {!collapsed && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 24, height: 24, background: STYLE.acg, border: "1px solid " + STYLE.acd, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: STYLE.ac, flexShrink: 0 }}>-- </div>
              <div><div style={{ fontFamily: "'Georgia',serif", fontSize: 14, color: STYLE.t1, lineHeight: 1.1 }}>FoodMargin</div><div style={{ fontSize: 8, color: STYLE.ac, letterSpacing: "0.12em", textTransform: "uppercase" }}>SaaS</div></div>
            </div>
          )}
          {collapsed && <div style={{ width: 24, height: 24, background: STYLE.acg, border: "1px solid " + STYLE.acd, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: STYLE.ac }}>-- </div>}
          <button onClick={() => setCollapsed(c => !c)} title={collapsed ? "Espandi" : "Comprimi"} style={{ background: STYLE.el, border: STYLE.bd, borderRadius: 5, width: 22, height: 22, cursor: "pointer", color: STYLE.t3, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginLeft: collapsed ? 0 : 4 }}>
            {collapsed ? " " : " "}
          </button>
        </div>

        {!collapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: 7, margin: "7px 10px", padding: "6px 10px", background: STYLE.el, border: STYLE.bd, borderRadius: 6 }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: STYLE.green, boxShadow: "0 0 5px " + STYLE.green, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: STYLE.t2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>La Gioia</span>
          </div>
        )}

        <nav style={{ flex: 1, padding: "4px 0", overflowY: "auto" }}>
          {groups.map(g => (
            <div key={g} style={{ padding: "2px 0 6px" }}>
              {!collapsed && <span style={{ display: "block", padding: "7px 14px 3px", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: STYLE.t3 }}>{g}</span>}
              {NAV.filter(n => n.group === g).map(n => (
                <button key={n.id} onClick={() => navTo(n.id)} title={collapsed ? n.label : undefined}
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start", gap: 8, padding: collapsed ? "9px 0" : "7px 10px 7px 14px", background: page === n.id ? STYLE.acg : "none", border: "none", cursor: "pointer", color: page === n.id ? STYLE.ac : STYLE.t2, fontFamily: "inherit", fontSize: 13, textAlign: "left", position: "relative" }}>
                  {page === n.id && <div style={{ position: "absolute", left: 0, top: 4, bottom: 4, width: 2, background: STYLE.ac, borderRadius: "0 2px 2px 0" }} />}
                  <NavIcon id={n.id} />
                  {!collapsed && <span style={{ flex: 1, fontSize: 12.5 }}>{n.label}</span>}
                  {!collapsed && n.badge && <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 5px", background: STYLE.ac, color: "#0d0d0f", borderRadius: 999 }}>{n.badge}</span>}
                  {collapsed && n.badge && <span style={{ position: "absolute", top: 5, right: 5, width: 6, height: 6, background: STYLE.ac, borderRadius: "50%" }} />}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {!collapsed && (
          <div style={{ display: "flex", justifyContent: "space-between", padding: "9px 14px", borderTop: STYLE.bds }}>
            <span style={{ fontSize: 10, color: STYLE.t3 }}>Piano</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: STYLE.ac }}>Professional</span>
          </div>
        )}
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", height: 52, background: STYLE.surf, borderBottom: STYLE.bds, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Georgia',serif", fontSize: 15, color: STYLE.t1 }}>
            <span style={{ color: STYLE.ac, opacity: 0.8 }}><NavIcon id={page} /></span>
            {NAV.find(n => n.id === page) && NAV.find(n => n.id === page).label}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "4px 9px 4px 5px", background: STYLE.el, border: STYLE.bd, borderRadius: 6 }}>
              <div style={{ width: 22, height: 22, borderRadius: 5, background: STYLE.acg, border: "1px solid " + STYLE.acd, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Georgia',serif", fontSize: 11, color: STYLE.ac }}>{user?.email?.[0]?.toUpperCase() || "U"}</div>
              <span style={{ fontSize: 12, fontWeight: 500, color: STYLE.t1 }}>{user?.email?.split("@")[0] || "User"}</span>
            </div>
            <button onClick={() => setSettingsOpen(true)} style={{ background: STYLE.el, border: STYLE.bd, borderRadius: 6, width: 32, height: 32, cursor: "pointer", color: STYLE.t2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }} title="Impostazioni"></button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "22px 28px 48px" }}>
          {renderPage()}
        </div>
      </div>
      {settingsOpen && <SettingsPanel />}
    </div>
  )
}

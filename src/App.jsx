import { useState, useEffect, useRef, Component } from "react"
import { lookupWine } from "./winesDB"

function isLikelyWine(name) {
  const n = name.toLowerCase()
  const currentYear = new Date().getFullYear()
  // Annata dinamica: 1960 → anno corrente +5
  if (/(19[6-9]\d|20\d{2})/.test(n)) {
    const year = parseInt(n.match(/(19[6-9]\d|20\d{2})/)[0])
    if (year >= 1960 && year <= currentYear + 5) return true
  }
  // Denominazioni
  if (/(doc|docg|igt|classico|superiore|riserva|gran selezione)/.test(n)) return true
  // Produttore/azienda
  if (/(cantina|tenuta|podere|castello|fattoria|vigna|vigneto|cantine)/.test(n)) return true
  // Termini enologici
  if (/(brut|demi.sec|blanc|cru|millesimato|cuv[eé]e|barrique|bollicine|metodo classico|metodo charmat|ros[eé]|spumante|frizzante|passito|vendemmia tardiva)/.test(n)) return true
  // Tipologie note
  if (/(prosecco|franciacorta|barolo|barbaresco|brunello|chianti|amarone|ripasso|soave|pinot|chardonnay|cabernet|merlot|sangiovese|nebbiolo|vermentino|falanghina|greco di tufo|fiano|nero d.avola|montepulciano|barbera|dolcetto|corvina|gewurztraminer|riesling|sauvignon|viognier|syrah|primitivo|negroamaro|aglianico)/.test(n)) return true
  return false
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
  "Frutta e Verdura": ["Frutta", "Verdura"],
  "Bevande":          ["Analcolici", "Alcolici"],
}

function Dashboard({ ings, dishes, isMobile }) {
  const [tab, setTab] = useState("prezzi") // "prezzi" | "insights"

  function variation(ing) {
    const ref = ing.prev !== undefined ? ing.prev : ing.avg
    if (!ref || ref === 0) return 0
    return Math.round(((ing.cur - ref) / ref) * 1000) / 10
  }

  const withVar = ings.map(ing => ({ ...ing, var: variation(ing) }))
  const increased = withVar.filter(i => i.var > 0).sort((a, b) => b.var - a.var)
  const decreased = withVar.filter(i => i.var < 0).sort((a, b) => a.var - b.var)
  const stable    = withVar.filter(i => i.var === 0)
  const sorted    = [...increased, ...decreased, ...stable]

  // Insights calcolate automaticamente
  const foodDishes = dishes.filter(d => d.fc > 0)
  const avgFoodCost = foodDishes.length > 0
    ? Math.round((foodDishes.reduce((s, d) => s + d.fc, 0) / foodDishes.length) * 10) / 10
    : 0
  const overTarget  = foodDishes.filter(d => d.fc > (d.target || 30))
  const topIncreased = increased.slice(0, 5)
  const topExpensive = [...ings].sort((a, b) => b.cur - a.cur).slice(0, 5)
  const catCosts = ["Carni","Pesce","Freschi","Frutta e Verdura","Surgelati"].map(cat => {
    const catIngs = ings.filter(i => i.cat === cat)
    const avg = catIngs.length > 0 ? catIngs.reduce((s, i) => s + i.cur, 0) / catIngs.length : 0
    return { cat, avg: Math.round(avg * 100) / 100, count: catIngs.length }
  }).filter(c => c.count > 0)

  const alerts = []
  if (increased.length > 0) alerts.push({ type: "warn", msg: increased.length + " ingredient" + (increased.length > 1 ? "i aumentati" : "e aumentato") + " di prezzo" })
  if (overTarget.length > 0) alerts.push({ type: "warn", msg: overTarget.length + " piatt" + (overTarget.length > 1 ? "i" : "o") + " sopra il target food cost" })
  if (ings.length === 0) alerts.push({ type: "info", msg: "Nessun ingrediente  -  inizia scansionando una fattura" })
  if (dishes.length === 0 && ings.length > 0) alerts.push({ type: "info", msg: "Magazzino popolato  -  ora crea le tue ricette" })
  if (avgFoodCost > 35) alerts.push({ type: "warn", msg: "Food cost medio alto: " + avgFoodCost + "%" })
  if (avgFoodCost > 0 && avgFoodCost <= 30) alerts.push({ type: "ok", msg: "Food cost medio ottimo: " + avgFoodCost + "%" })

  const SectionTitle = ({ label }) => (
    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: STYLE.t3, marginBottom: 10, marginTop: 20 }}>{label}</div>
  )

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: "'Georgia',serif", fontSize: 20, color: STYLE.t1 }}>Dashboard</div>
          <div style={{ fontSize: 12, color: STYLE.t3 }}>{ings.length} ingredienti . {dishes.length} piatti</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, marginBottom: 20 }}>
        {[["prezzi","  Prezzi"],["insights","* Insights"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            style={{ padding: "8px 20px", background: tab === id ? STYLE.ac : STYLE.el, color: tab === id ? "#0d0d0f" : STYLE.t2, border: "none", fontFamily: "inherit", fontSize: 13, fontWeight: tab === id ? 700 : 400, cursor: "pointer", borderRadius: id === "prezzi" ? "8px 0 0 8px" : "0 8px 8px 0" }}>
            {label}
          </button>
        ))}
      </div>

      {/* TAB PREZZI */}
      {tab === "prezzi" && (
        <div>
          {/* Counter */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
            {[
              { label: "Aumenti",   count: increased.length, color: STYLE.red,   bg: STYLE.rd,  symbol: "'" },
              { label: "Ribassi",   count: decreased.length, color: STYLE.green, bg: STYLE.gd,  symbol: " - " },
              { label: "Invariati", count: stable.length,    color: STYLE.ac,    bg: STYLE.acg, symbol: "--" },
            ].map((k, i) => (
              <div key={i} style={{ background: k.bg, border: "1px solid " + (i === 0 ? "rgba(248,113,113,0.25)" : i === 1 ? "rgba(74,222,128,0.25)" : STYLE.acd), borderRadius: STYLE.r2, padding: "14px 16px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: k.color, opacity: 0.4 }} />
                <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: STYLE.t3, fontWeight: 700, marginBottom: 6 }}>{k.label}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span style={{ fontFamily: "'Georgia',serif", fontSize: 28, color: k.color, lineHeight: 1 }}>{k.count}</span>
                  <span style={{ fontSize: 16, color: k.color, fontWeight: 700 }}>{k.symbol}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Lista */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {sorted.map(ing => {
              const v = ing.var
              const isUp = v > 0; const isDown = v < 0
              const varColor  = isUp ? STYLE.red : isDown ? STYLE.green : STYLE.ac
              const varBg     = isUp ? STYLE.rd  : isDown ? STYLE.gd    : STYLE.acg
              const varBorder = isUp ? "rgba(248,113,113,0.2)" : isDown ? "rgba(74,222,128,0.2)" : STYLE.acd
              const varText   = isUp ? "+" + v.toFixed(1) + "%" : isDown ? v.toFixed(1) + "%" : "0%"
              return (
                <div key={ing.id} style={{ background: STYLE.surf, border: "1px solid #1f1f25", borderRadius: STYLE.r, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ minWidth: 56, background: varBg, border: "1px solid " + varBorder, borderRadius: 6, padding: "4px 8px", textAlign: "center", flexShrink: 0 }}>
                    <div style={{ fontSize: 14, color: varColor, lineHeight: 1, fontWeight: 700 }}>{isUp ? "'" : isDown ? " - " : "--"}</div>
                    <div style={{ fontSize: 10, color: varColor, fontWeight: 700, marginTop: 1 }}>{varText}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: STYLE.t1, marginBottom: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ing.name}</div>
                    <div style={{ fontSize: 11, color: STYLE.t3 }}>{ing.cat}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: STYLE.t1 }}>{formatEuro(ing.cur)}<span style={{ fontSize: 10, color: STYLE.t3, fontWeight: 400 }}>/{ing.unit}</span></div>
                    <div style={{ fontSize: 10, color: STYLE.t3 }}>prec. {formatEuro(ing.prev !== undefined ? ing.prev : ing.avg)}/{ing.unit}</div>
                  </div>
                </div>
              )
            })}
          </div>
          {ings.length === 0 && <div style={{ textAlign: "center", padding: "60px 0", color: STYLE.t3, fontSize: 13 }}>Nessun ingrediente  -  inizia scansionando una fattura</div>}
        </div>
      )}

      {/* TAB INSIGHTS */}
      {tab === "insights" && (
        <div>
          {/* Alert */}
          {alerts.length > 0 && (
            <>
              <SectionTitle label="Alert" />
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 8 }}>
                {alerts.map((a, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: STYLE.r, background: a.type === "warn" ? STYLE.rd : a.type === "ok" ? STYLE.gd : STYLE.el, border: "1px solid " + (a.type === "warn" ? "rgba(248,113,113,0.3)" : a.type === "ok" ? "rgba(74,222,128,0.3)" : STYLE.acd) }}>
                    <span style={{ fontSize: 14 }}>{a.type === "warn" ? "  " : a.type === "ok" ? " ..." : "  "}</span>
                    <span style={{ fontSize: 13, color: a.type === "warn" ? STYLE.red : a.type === "ok" ? STYLE.green : STYLE.t2 }}>{a.msg}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Food cost medio */}
          {avgFoodCost > 0 && (
            <>
              <SectionTitle label="Food Cost" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 8 }}>
                <div style={{ ...card({ padding: "16px" }) }}>
                  <div style={{ fontSize: 10, color: STYLE.t3, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Media generale</div>
                  <div style={{ fontFamily: "'Georgia',serif", fontSize: 26, color: avgFoodCost > 35 ? STYLE.red : avgFoodCost > 28 ? "#f59e0b" : STYLE.green }}>{avgFoodCost}%</div>
                </div>
                <div style={{ ...card({ padding: "16px" }) }}>
                  <div style={{ fontSize: 10, color: STYLE.t3, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Piatti analizzati</div>
                  <div style={{ fontFamily: "'Georgia',serif", fontSize: 26, color: STYLE.t1 }}>{foodDishes.length}</div>
                </div>
              </div>
              {overTarget.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
                  {overTarget.slice(0, 5).map(d => (
                    <div key={d.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: STYLE.rd, border: "1px solid rgba(248,113,113,0.2)", borderRadius: STYLE.r }}>
                      <span style={{ fontSize: 13, color: STYLE.t1 }}>{d.name}</span>
                      <span style={{ fontSize: 13, color: STYLE.red, fontWeight: 700 }}>{(d.fc * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Prezzi per categoria */}
          {catCosts.length > 0 && (
            <>
              <SectionTitle label="Costo medio per categoria" />
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
                {catCosts.sort((a, b) => b.avg - a.avg).map(c => (
                  <div key={c.cat} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: STYLE.el, border: STYLE.bds, borderRadius: STYLE.r }}>
                    <div>
                      <div style={{ fontSize: 13, color: STYLE.t1, fontWeight: 600 }}>{c.cat}</div>
                      <div style={{ fontSize: 11, color: STYLE.t3 }}>{c.count} ingredient{c.count !== 1 ? "i" : "e"}</div>
                    </div>
                    <div style={{ fontFamily: "'Georgia',serif", fontSize: 16, color: STYLE.ac }}>{formatEuro(c.avg)}/kg</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Top 5 aumenti */}
          {topIncreased.length > 0 && (
            <>
              <SectionTitle label="Maggiori aumenti recenti" />
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
                {topIncreased.map(ing => (
                  <div key={ing.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: STYLE.rd, border: "1px solid rgba(248,113,113,0.2)", borderRadius: STYLE.r }}>
                    <div>
                      <div style={{ fontSize: 13, color: STYLE.t1, fontWeight: 600 }}>{ing.name}</div>
                      <div style={{ fontSize: 11, color: STYLE.t3 }}>{ing.cat}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 13, color: STYLE.red, fontWeight: 700 }}>+{ing.var.toFixed(1)}%</div>
                      <div style={{ fontSize: 11, color: STYLE.t3 }}>{formatEuro(ing.cur)}/{ing.unit}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Top 5 pi   cari */}
          {topExpensive.length > 0 && (
            <>
              <SectionTitle label="Ingredienti pi   costosi" />
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {topExpensive.map((ing, i) => (
                  <div key={ing.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: STYLE.el, border: STYLE.bds, borderRadius: STYLE.r }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontFamily: "'Georgia',serif", fontSize: 16, color: STYLE.t3, width: 20 }}>#{i+1}</span>
                      <div>
                        <div style={{ fontSize: 13, color: STYLE.t1, fontWeight: 600 }}>{ing.name}</div>
                        <div style={{ fontSize: 11, color: STYLE.t3 }}>{ing.cat}</div>
                      </div>
                    </div>
                    <div style={{ fontFamily: "'Georgia',serif", fontSize: 16, color: STYLE.ac }}>{formatEuro(ing.cur)}/{ing.unit}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {ings.length === 0 && <div style={{ textAlign: "center", padding: "60px 0", color: STYLE.t3, fontSize: 13 }}>Nessun dato  -  inizia scansionando una fattura</div>}
        </div>
      )}
    </div>
  )
}

function Ingredients({ ings, setIngs, invs, isMobile }) {
  const CATS = ["Carni", "Pesce", "Freschi", "Frutta e Verdura", "Scatolame", "Surgelati", "Bevande", "Vini", "Detersivi"]
  const VINO_TIPI = ["Rossi", "Bianchi", "Rosé", "Bollicine"]
  const VINO_REGIONI_ORDER = {
    Rossi:    ["Piemonte","Valle d'Aosta","Toscana","Trentino Alto Adige","Friuli Venezia Giulia","Sicilia","Campania","Veneto","Liguria","Lombardia","Sardegna","Puglia","Calabria","Altre regioni","Francia"],
    Bianchi:  ["Piemonte","Valle d'Aosta","Toscana","Trentino Alto Adige","Friuli Venezia Giulia","Sicilia","Campania","Veneto","Liguria","Lombardia","Sardegna","Puglia","Calabria","Altre regioni","Francia"],
    "Rosé":   ["Piemonte","Valle d'Aosta","Toscana","Trentino Alto Adige","Friuli Venezia Giulia","Sicilia","Campania","Veneto","Liguria","Lombardia","Altre regioni","Francia"],
    Bollicine:["Piemonte","Valle d'Aosta","Toscana","Trentino Alto Adige","Friuli Venezia Giulia","Sicilia","Campania","Veneto","Liguria","Lombardia","Sardegna","Puglia","Calabria","Altre regioni","Francia"],
  }
  function getRegioniOrder(tipo) { return VINO_REGIONI_ORDER[tipo] || VINO_REGIONI }
  const VINO_REGIONI = ["Piemonte","Valle d'Aosta","Toscana","Trentino Alto Adige","Friuli Venezia Giulia","Sicilia","Campania","Veneto","Liguria","Lombardia","Sardegna","Puglia","Calabria","Altre regioni","Francia"]
  const [selTipo, setSelTipo] = useState(null)
  const [selRegione, setSelRegione] = useState(null)
  const [selSotto1, setSelSotto1] = useState(null)
  const [editVino, setEditVino] = useState(null) // vino in modifica
  const [editVinoForm, setEditVinoForm] = useState({ name: "", tipoVino: "Rossi", regioneVino: "Piemonte", produttore: "", cur: "" })
  // Trova prezzi per fornitore per un ingrediente
  function prezziPerFornitore(ing) {
    const result = []
    const nameLow = ing.name.toLowerCase()
    const seen = new Set()
    for (const inv of invs) {
      if (!inv.prodotti) continue
      for (const p of inv.prodotti) {
        if (!p.nome || !p.prezzoUnitario) continue
        const pLow = p.nome.toLowerCase()
        if (pLow.includes(nameLow.split(" ")[0]) || nameLow.includes(pLow.split(" ")[0])) {
          if (!seen.has(inv.sup)) {
            seen.add(inv.sup)
            result.push({ sup: inv.sup, price: p.prezzoUnitario, date: inv.date })
          }
        }
      }
    }
    return result.sort((a, b) => a.price - b.price)
  }

  const [selCat, setSelCat]     = useState(null) // null = category view
  const [open, setOpen]         = useState(false)
  const [delTarget, setDelTarget] = useState(null)
  const [edit, setEdit]         = useState(null)
  const [form, setForm]         = useState({ name: "", cat: "Carni", unit: "kg", cur: "", confPrice: "", confWeight: "", tipoVino: "Rossi", regioneVino: "Toscana" })
  const [err, setErr]           = useState({})

  const ingsByCat = cat => ings.filter(i => i.cat === cat)

  // Categorie con navigazione a livelli (sotto1 cards)
  const CATS_WITH_SOTTO1 = ["Carni", "Pesce", "Frutta e Verdura", "Freschi", "Bevande"]
  // Categorie con lista piatta (no sotto1)
  const CATS_FLAT = ["Scatolame", "Surgelati", "Detersivi"]

  function openAdd() {
    setEdit(null)
    setForm({ name: "", cat: selCat || "Carni", sotto1: "", sotto2: "", unit: "kg", cur: "", confPrice: "", confWeight: "", tipoVino: "Rossi", regioneVino: "Toscana" })
    setErr({})
    setOpen(true)
  }

  function openEdit(ing) {
    setEdit(ing)
    setForm({
      name: ing.name, cat: ing.cat, sotto1: ing.sotto1 || "", sotto2: ing.sotto2 || "", unit: ing.unit,
      cur: String(ing.cur),
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

    const oldAvg = edit ? edit.avg : cur
    const newAvg = edit ? Math.round(((oldAvg * 0.7) + (cur * 0.3)) * 100) / 100 : cur
    const d = {
      name: form.name.trim(), cat: form.cat,
      sotto1: form.sotto1 || "", sotto2: form.sotto2 || "",
      unit: unitBase, cur, avg: newAvg,
      prev: edit ? edit.cur : cur,
      ...(form.unit === "confezione" ? { confPrice: +form.confPrice, confWeight: +form.confWeight } : {}),
      ...(form.cat === "Vini" ? { tipoVino: form.tipoVino, regioneVino: form.regioneVino } : {})
    }
    if (edit) setIngs(prev => prev.map(i => i.id === edit.id ? { ...i, ...d } : i))
    else      setIngs(prev => [...prev, { ...d, id: "i" + uid() }])
    setOpen(false)
  }

  function doDelete() {
    setIngs(prev => prev.filter(i => i.id !== delTarget.id))
    setDelTarget(null)
  }

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
          const spiked = ingsByCat(cat).filter(i => (i.cur - i.avg) / i.avg > 0.10).length
          return (
            <div key={cat} onClick={() => setSelCat(cat)}
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
              {form.cat === "Vini" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Fld label="Tipologia">
                    <select style={inp({ appearance: "none", cursor: "pointer" })} value={form.tipoVino} onChange={e => setForm(f => ({ ...f, tipoVino: e.target.value }))}>
                      {VINO_TIPI.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </Fld>
                  <Fld label="Regione">
                    <select style={inp({ appearance: "none", cursor: "pointer" })} value={form.regioneVino} onChange={e => setForm(f => ({ ...f, regioneVino: e.target.value }))}>
                      {VINO_REGIONI.map(r => <option key={r}>{r}</option>)}
                    </select>
                  </Fld>
                </div>
              )}
              {form.unit !== "confezione" ? (
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

  //  -  -  VINI VIEW  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  - 
  if (selCat === "Vini") {
    const vini = ingsByCat("Vini")
    // If no tipo selected, show tipo cards
    if (!selTipo) return (
      <div>
        <div style={row({ marginBottom: 16 })}>
          <button onClick={() => { setSelCat(null); setSelTipo(null); setSelRegione(null) }} style={{ background: "none", border: "none", color: STYLE.ac, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, padding: 0 }}> Magazzino</button>
          <span style={{ color: STYLE.t3, fontSize: 13 }}>/</span>
          <span style={{ fontSize: 13, color: STYLE.t1, fontWeight: 600 }}>Vini</span>
        </div>
        <div style={{ fontSize: 12, color: STYLE.t3, marginBottom: 16 }}>{vini.length} vini totali</div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 12 }}>
          {VINO_TIPI.map(tipo => {
            const count = vini.filter(v => v.tipoVino === tipo).length
            return (
              <div key={tipo} onClick={() => { setSelTipo(tipo); setSelRegione(null) }}
                style={card({ padding: "18px 16px", cursor: "pointer", position: "relative", overflow: "hidden" })}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg," + STYLE.ac + ",transparent)", opacity: 0.4 }} />
                <div style={{ fontFamily: "'Georgia',serif", fontSize: 16, color: STYLE.t1, marginBottom: 4 }}>{tipo}</div>
                <div style={{ fontSize: 12, color: STYLE.t3 }}>{count} vini</div>
              </div>
            )
          })}
        </div>
      </div>
    )
    // Tipo selected
    const byTipo = vini.filter(v => v.tipoVino === selTipo)
    const REGIONI_IT_ING = {
      Rossi:    ["Piemonte","Valle d'Aosta","Toscana","Trentino Alto Adige","Friuli Venezia Giulia","Sicilia","Campania","Veneto","Liguria","Lombardia","Sardegna","Puglia","Calabria","Altre regioni","Francia"],
      Bianchi:  ["Piemonte","Valle d'Aosta","Toscana","Trentino Alto Adige","Veneto","Friuli Venezia Giulia","Sicilia","Liguria","Campania","Sardegna","Lombardia","Puglia","Calabria","Altre regioni","Francia"],
      "Rosé":   ["Piemonte","Valle d'Aosta","Toscana","Trentino Alto Adige","Friuli Venezia Giulia","Sicilia","Campania","Veneto","Liguria","Lombardia","Altre regioni","Francia"],
      Bollicine:["Piemonte","Valle d'Aosta","Toscana","Trentino Alto Adige","Friuli Venezia Giulia","Sicilia","Campania","Veneto","Liguria","Lombardia","Sardegna","Puglia","Calabria","Altre regioni","Francia"],
    }
    const regioniOrdinate = (REGIONI_IT_ING[selTipo] || VINO_REGIONI).filter(r => byTipo.some(v => v.regioneVino === r))

    // Level 2: regione not selected → show regione CARDS
    if (!selRegione) return (
      <div>
        <div style={row({ marginBottom: 16 })}>
          <button onClick={() => { setSelCat(null); setSelTipo(null); setSelRegione(null) }} style={{ background: "none", border: "none", color: STYLE.ac, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, padding: 0 }}> Magazzino</button>
          <span style={{ color: STYLE.t3, fontSize: 13 }}>/</span>
          <button onClick={() => { setSelTipo(null); setSelRegione(null) }} style={{ background: "none", border: "none", color: STYLE.ac, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, padding: 0 }}>Vini</button>
          <span style={{ color: STYLE.t3, fontSize: 13 }}>/</span>
          <span style={{ fontSize: 13, color: STYLE.t1, fontWeight: 600 }}>{selTipo}</span>
        </div>
        {byTipo.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: STYLE.t3, fontSize: 13 }}>Nessun vino in questa tipologia</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3, 1fr)", gap: 12 }}>
            {regioniOrdinate.map(reg => {
              const count = byTipo.filter(v => v.regioneVino === reg).length
              return (
                <div key={reg} onClick={() => setSelRegione(reg)}
                  style={card({ padding: "16px 14px", cursor: "pointer", position: "relative", overflow: "hidden" })}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg," + STYLE.ac + ",transparent)", opacity: 0.3 }} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: STYLE.t1, marginBottom: 4 }}>{reg}</div>
                  <div style={{ fontSize: 11, color: STYLE.t3 }}>{count} vini</div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )

    // Level 3: regione selected → show wines
    const byRegione = byTipo.filter(v => v.regioneVino === selRegione)
    return (
      <div>
        <div style={row({ marginBottom: 16 })}>
          <button onClick={() => { setSelCat(null); setSelTipo(null); setSelRegione(null) }} style={{ background: "none", border: "none", color: STYLE.ac, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, padding: 0 }}> Magazzino</button>
          <span style={{ color: STYLE.t3, fontSize: 13 }}>/</span>
          <button onClick={() => { setSelTipo(null); setSelRegione(null) }} style={{ background: "none", border: "none", color: STYLE.ac, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, padding: 0 }}>Vini</button>
          <span style={{ color: STYLE.t3, fontSize: 13 }}>/</span>
          <button onClick={() => setSelRegione(null)} style={{ background: "none", border: "none", color: STYLE.ac, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, padding: 0 }}>{selTipo}</button>
          <span style={{ color: STYLE.t3, fontSize: 13 }}>/</span>
          <span style={{ fontSize: 13, color: STYLE.t1, fontWeight: 600 }}>{selRegione}</span>
        </div>
        {byRegione.map(ing => (
          <div key={ing.id} style={{ ...card({ padding: "12px 14px", marginBottom: 8 }), display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: STYLE.t1, marginBottom: ing.produttore ? 2 : 0 }}>{ing.name}</div>
              {ing.produttore && <div style={{ fontSize: 11, color: STYLE.ac, fontStyle: "italic", marginBottom: 2 }}>{ing.produttore}</div>}
              <div style={{ fontSize: 11, color: STYLE.t3 }}>{formatEuro(ing.cur)}/{ing.unit}</div>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <button onClick={() => { setEditVino(ing); setEditVinoForm({ name: ing.name, tipoVino: ing.tipoVino || "Rossi", regioneVino: ing.regioneVino || "Piemonte", produttore: ing.produttore || "", cur: String(ing.cur) }) }}
                style={{ background: STYLE.el, border: STYLE.bd, borderRadius: STYLE.r, padding: "4px 10px", color: STYLE.t2, fontFamily: "inherit", fontSize: 11, cursor: "pointer" }}>Modifica</button>
              <button onClick={() => setDelTarget(ing)} style={{ background: "none", border: "none", color: STYLE.t3, cursor: "pointer", fontSize: 15, padding: "0 4px" }}>✕</button>
            </div>
          </div>
        ))}
        {/* Modal modifica vino */}
        {editVino && (
          <div onClick={e => e.target === e.currentTarget && setEditVino(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 1000 }}>
            <div style={{ background: STYLE.surf, border: STYLE.bd, borderRadius: 16, width: "100%", maxWidth: 440 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 22px 0" }}>
                <span style={{ fontFamily: "'Georgia',serif", fontSize: 18, color: STYLE.t1 }}>Modifica vino</span>
                <button onClick={() => setEditVino(null)} style={{ background: STYLE.el, border: STYLE.bd, borderRadius: STYLE.r, width: 28, height: 28, cursor: "pointer", color: STYLE.t3 }}>x</button>
              </div>
              <div style={{ padding: "16px 22px" }}>
                <Fld label="Nome">
                  <input style={inp()} value={editVinoForm.name} onChange={e => setEditVinoForm(f => ({ ...f, name: e.target.value }))} />
                </Fld>
                <Fld label="Produttore / Cantina">
                  <input style={inp()} value={editVinoForm.produttore} onChange={e => setEditVinoForm(f => ({ ...f, produttore: e.target.value }))} placeholder="es. Giacomo Conterno" />
                </Fld>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Fld label="Tipologia">
                    <select style={inp({ appearance: "none", cursor: "pointer" })} value={editVinoForm.tipoVino} onChange={e => setEditVinoForm(f => ({ ...f, tipoVino: e.target.value }))}>
                      {["Rossi","Bianchi","Rosé","Bollicine"].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </Fld>
                  <Fld label="Regione">
                    <select style={inp({ appearance: "none", cursor: "pointer" })} value={editVinoForm.regioneVino} onChange={e => setEditVinoForm(f => ({ ...f, regioneVino: e.target.value }))}>
                      {["Piemonte","Valle d'Aosta","Toscana","Trentino Alto Adige","Friuli Venezia Giulia","Sicilia","Campania","Veneto","Liguria","Lombardia","Sardegna","Puglia","Calabria","Altre regioni","Francia"].map(r => <option key={r}>{r}</option>)}
                    </select>
                  </Fld>
                </div>
                <Fld label="Prezzo attuale (v/bottiglia)">
                  <input style={inp()} type="number" step="0.01" value={editVinoForm.cur} onChange={e => setEditVinoForm(f => ({ ...f, cur: e.target.value }))} placeholder="0.00" />
                </Fld>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "0 22px 18px" }}>
                <button style={btn("g")} onClick={() => setEditVino(null)}>Annulla</button>
                <button style={btn("p")} onClick={() => {
                  const newCur = parseFloat(editVinoForm.cur) || editVino.cur
                  const newAvg = Math.round(((editVino.avg * 0.7) + (newCur * 0.3)) * 100) / 100
                  setIngs(prev => prev.map(i => i.id === editVino.id ? {
                    ...i,
                    name: editVinoForm.name.trim() || i.name,
                    tipoVino: editVinoForm.tipoVino,
                    regioneVino: editVinoForm.regioneVino,
                    produttore: editVinoForm.produttore.trim(),
                    cur: newCur,
                    avg: newCur !== editVino.cur ? newAvg : i.avg,
                    prev: newCur !== editVino.cur ? editVino.cur : i.prev,
                  } : i))
                  setEditVino(null)
                  setSelTipo(null)
                }}>Salva</button>
              </div>
            </div>
          </div>
        )}

        {delTarget && (
          <div onClick={e => e.target === e.currentTarget && setDelTarget(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 1000 }}>
            <div style={{ background: STYLE.surf, border: STYLE.bd, borderRadius: 14, width: "100%", maxWidth: 380, padding: "24px 24px 20px" }}>
              <div style={{ fontFamily: "'Georgia',serif", fontSize: 17, color: STYLE.t1, marginBottom: 8 }}>Elimina ingrediente</div>
              <div style={{ fontSize: 13.5, color: STYLE.t2, lineHeight: 1.6, marginBottom: 20 }}>Sei sicuro di voler eliminare <strong style={{ color: STYLE.t1 }}>{delTarget.name}</strong>?</div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button style={btn("g")} onClick={() => setDelTarget(null)}>Annulla</button>
                <button style={{ ...btn("s"), background: STYLE.rd, color: STYLE.red, borderColor: "rgba(248,113,113,0.3)" }} onClick={() => { setIngs(prev => prev.filter(i => i.id !== delTarget.id)); setDelTarget(null) }}>Elimina</button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

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
                <div key={s1} onClick={() => setSelSotto1(s1)}
                  style={{ ...card({ padding: "18px 16px", cursor: "pointer", position: "relative", overflow: "hidden" }),
                    borderColor: hasSpiked ? "rgba(248,113,113,0.3)" : "#1f1f25" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2,
                    background: hasSpiked ? "linear-gradient(90deg," + STYLE.red + ",transparent)" : "linear-gradient(90deg," + STYLE.ac + ",transparent)",
                    opacity: 0.4 }} />
                  <div style={{ fontFamily: "'Georgia',serif", fontSize: 15, color: STYLE.t1, marginBottom: 4 }}>{s1}</div>
                  <div style={{ fontSize: 12, color: STYLE.t3 }}>{count} ingredient{count !== 1 ? "i" : "e"}</div>
                  {hasSpiked && <div style={{ fontSize: 10, color: STYLE.red, marginTop: 4 }}>↑ prezzi aumentati</div>}
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

  // Lista prodotti  -  filtrata per sotto1 se selezionata
  const list = selSotto1 === "__none__"
    ? catIngs.filter(i => !i.sotto1)
    : selSotto1
      ? catIngs.filter(i => i.sotto1 === selSotto1)
      : catIngs

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
              {form.cat === "Vini" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Fld label="Tipologia">
                    <select style={inp({ appearance: "none", cursor: "pointer" })} value={form.tipoVino} onChange={e => setForm(f => ({ ...f, tipoVino: e.target.value }))}>
                      {VINO_TIPI.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </Fld>
                  <Fld label="Regione">
                    <select style={inp({ appearance: "none", cursor: "pointer" })} value={form.regioneVino} onChange={e => setForm(f => ({ ...f, regioneVino: e.target.value }))}>
                      {VINO_REGIONI.map(r => <option key={r}>{r}</option>)}
                    </select>
                  </Fld>
                </div>
              )}
              {form.unit !== "confezione" ? (
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
                  <div style={{ flex: 1, minWidth: 0 }}>
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
                    <button onClick={() => setDelTarget(ing)} style={{ background: "none", border: "none", color: STYLE.t3, cursor: "pointer", fontSize: 16, padding: "0 4px", flexShrink: 0 }}>✕</button>
                  </div>
                </div>
                <div style={row({ justifyContent: "space-between", marginBottom: 4 })}>
                  <span style={{ fontSize: 14, color: spiked ? STYLE.red : STYLE.t2, fontWeight: spiked ? 700 : 400 }}>
                    {formatEuro(ing.cur)}/{ing.unit} {spiked ? "'" : ""}
                  </span>
                  <span style={{ fontSize: 12, color: STYLE.t3 }}>prec. {formatEuro(ing.prev || ing.avg || ing.cur || 0)}/{ing.unit}</span>
                </div>
                {ing.fornitore && <div style={{ fontSize: 10, color: STYLE.t3, marginBottom: 2 }}>  {ing.fornitore}</div>}
                {(() => {
                  const prezzi = prezziPerFornitore(ing)
                  if (prezzi.length < 2) return null
                  return (
                    <div style={{ background: STYLE.el, borderRadius: STYLE.r, padding: "6px 8px", marginTop: 4 }}>
                      <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: STYLE.t3, marginBottom: 4 }}>Prezzi fornitori</div>
                      {prezzi.map((p, i) => (
                        <div key={i} style={row({ justifyContent: "space-between", padding: "2px 0" })}>
                          <span style={{ fontSize: 11, color: i === 0 ? STYLE.green : STYLE.t2 }}>{p.sup}</span>
                          <span style={{ fontSize: 12, fontWeight: i === 0 ? 700 : 400, color: i === 0 ? STYLE.green : STYLE.t2 }}>{formatEuro(p.price)}/{ing.unit}</span>
                        </div>
                      ))}
                    </div>
                  )
                })()}
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
                      {(() => {
                        const prezzi = prezziPerFornitore(ing)
                        if (prezzi.length < 2) return <span>{formatEuro(ing.avg)}/{ing.unit}</span>
                        return (
                          <div>
                            {prezzi.map((p, i) => (
                              <div key={i} style={row({ gap: 6 })}>
                                <span style={{ fontSize: 11, color: i === 0 ? STYLE.green : STYLE.t3 }}>{p.sup}</span>
                                <span style={{ fontSize: 12, fontWeight: i === 0 ? 700 : 400, color: i === 0 ? STYLE.green : STYLE.t2 }}>{formatEuro(p.price)}</span>
                              </div>
                            ))}
                          </div>
                        )
                      })()}
                    </td>
                    <td style={{ padding: "11px 16px", borderBottom: STYLE.bds, textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <button onClick={() => openEdit(ing)} style={{ background: "none", border: "1px solid #2a2a31", color: STYLE.t2, cursor: "pointer", fontSize: 11, fontFamily: "inherit", padding: "2px 8px", borderRadius: STYLE.r }}>Modifica</button>
                        <button onClick={() => setDelTarget(ing)} style={{ background: "none", border: "none", color: STYLE.t3, cursor: "pointer", fontSize: 15, padding: "2px 6px" }} title="Elimina">✕</button>
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

function Dishes({ dishes, setDishes, ings, isMobile, setPage, setEditDish }) {
  const CATS = ["Speciali", "Antipasti", "Primi", "Secondi", "Dolci", "Vini", "Cocktail", "Bevande"]
  const STAGIONI = ["Primavera", "Estate", "Autunno", "Inverno"]
  const VINO_TIPI = ["Rossi", "Bianchi", "Rosé", "Bollicine"]
  const VINO_REGIONI_ORDER = {
    Rossi:    ["Piemonte","Valle d'Aosta","Toscana","Trentino Alto Adige","Friuli Venezia Giulia","Sicilia","Campania","Veneto","Liguria","Lombardia","Sardegna","Puglia","Calabria","Altre regioni","Francia"],
    Bianchi:  ["Piemonte","Valle d'Aosta","Toscana","Trentino Alto Adige","Friuli Venezia Giulia","Sicilia","Campania","Veneto","Liguria","Lombardia","Sardegna","Puglia","Calabria","Altre regioni","Francia"],
    "Rosé":   ["Piemonte","Valle d'Aosta","Toscana","Trentino Alto Adige","Friuli Venezia Giulia","Sicilia","Campania","Veneto","Liguria","Lombardia","Altre regioni","Francia"],
    Bollicine:["Piemonte","Valle d'Aosta","Toscana","Trentino Alto Adige","Friuli Venezia Giulia","Sicilia","Campania","Veneto","Liguria","Lombardia","Sardegna","Puglia","Calabria","Altre regioni","Francia"],
  }
  function getRegioniOrder(tipo) { return VINO_REGIONI_ORDER[tipo] || VINO_REGIONI }
  const VINO_REGIONI = ["Piemonte","Valle d'Aosta","Toscana","Trentino Alto Adige","Friuli Venezia Giulia","Sicilia","Campania","Veneto","Liguria","Lombardia","Sardegna","Puglia","Calabria","Altre regioni","Francia"]

  const [selCat, setSelCat]       = useState(null)
  const [detail, setDetail]       = useState(null)
  const [delTarget, setDelTarget] = useState(null)

  const r2 = n => Math.round(n * 100) / 100

  function catMatch(d, cat) {
    const c = (d.cat || "").toLowerCase()
    if (cat === "Antipasti") return c === "antipasto" || c === "antipasti"
    if (cat === "Primi")     return c === "primo"    || c === "primi"
    if (cat === "Secondi")   return c === "secondo"  || c === "secondi"
    if (cat === "Dolci")     return c === "dolce"    || c === "dolci"
    if (cat === "Speciali")  return c === "speciale" || c === "speciali"
    if (cat === "Vini")      return c === "vino"     || c === "vini"
    if (cat === "Cocktail")  return c === "cocktail"
    if (cat === "Bevande")   return c === "bevanda" || c === "bevande"
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


  //  -  -  CATEGORY VIEW  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  - 
  if (!selCat) return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: "'Georgia',serif", fontSize: 20, color: STYLE.t1, marginBottom: 2 }}>Piatti</div>
        <div style={{ fontSize: 12, color: STYLE.t3 }}>{dishes.length} piatti nel menu  -  aggiunti dalla sezione Ricette</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 12 }}>
        {CATS.map(cat => {
          const list = dishesByCat(cat)
          const overTarget = list.filter(d => d.fc > 0 && d.fc > d.target).length
          const isVini = cat === "Vini"
          const tipiCount = isVini ? ["Rossi","Bianchi","Rosé","Bollicine"].map(t => ({ t, n: list.filter(v => v.tipoVino === t).length })).filter(x => x.n > 0) : []
          return (
            <div key={cat} onClick={() => setSelCat(cat)}
              style={{ ...card({ padding: "20px 16px", cursor: "pointer", position: "relative", overflow: "hidden" }),
                borderColor: overTarget > 0 ? "rgba(248,113,113,0.3)" : "#1f1f25" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: overTarget > 0 ? "linear-gradient(90deg," + STYLE.red + ",transparent)" : "linear-gradient(90deg," + STYLE.ac + ",transparent)", opacity: 0.4 }} />
              
              <div style={{ fontFamily: "'Georgia',serif", fontSize: 16, color: STYLE.t1, marginBottom: 4 }}>{cat}</div>
              <div style={{ fontSize: 12, color: STYLE.t3, marginBottom: isVini && tipiCount.length > 0 ? 6 : 0 }}>{list.length} {isVini ? "vini" : "piatt" + (list.length !== 1 ? "i" : "o")}</div>
              {isVini && tipiCount.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {tipiCount.map(({ t, n }) => (
                    <div key={t} style={{ fontSize: 10, color: STYLE.t3 }}>{t}: {n}</div>
                  ))}
                </div>
              )}
              {overTarget > 0 && <div style={{ fontSize: 10, color: STYLE.red, marginTop: 4 }}>! {overTarget} sopra target</div>}
            </div>
          )
        })}
      </div>
    </div>
  )

  //  -  -  VINI VIEW  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  - 
  if (selCat === "Vini") {
    const vini = dishesByCat("Vini")
    return (
      <div>
        <div style={row({ marginBottom: 20 })}>
          <button onClick={() => setSelCat(null)} style={{ background: "none", border: "none", color: STYLE.ac, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, padding: 0 }}> Piatti</button>
          <span style={{ color: STYLE.t3, fontSize: 13 }}>/</span>
          <span style={{ fontSize: 13, color: STYLE.t1, fontWeight: 600 }}>Vini</span>
        </div>
        {vini.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: STYLE.t3, fontSize: 13 }}>
            Nessun vino presente  -  aggiungili dalla sezione Drink Cost
          </div>
        ) : (
          VINO_TIPI.map(tipo => {
            const byTipo = vini.filter(v => v.tipoVino === tipo)
            if (byTipo.length === 0) return null
            return (
              <div key={tipo} style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: STYLE.t2, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12, paddingBottom: 6, borderBottom: STYLE.bds }}>{tipo}</div>
                {(() => {
                  const REGIONI_IT_D = {
                    Rossi:    ["Piemonte","Valle d'Aosta","Toscana","Trentino Alto Adige","Friuli Venezia Giulia","Sicilia","Campania","Veneto","Liguria","Lombardia","Sardegna","Puglia","Calabria","Altre regioni","Francia"],
                    Bianchi:  ["Piemonte","Valle d'Aosta","Toscana","Trentino Alto Adige","Veneto","Friuli Venezia Giulia","Sicilia","Liguria","Campania","Sardegna","Lombardia","Puglia","Calabria","Altre regioni","Francia"],
                    "Rosé":   ["Piemonte","Valle d'Aosta","Toscana","Trentino Alto Adige","Friuli Venezia Giulia","Sicilia","Campania","Veneto","Liguria","Lombardia","Altre regioni","Francia"],
                    Bollicine:["Piemonte","Valle d'Aosta","Toscana","Trentino Alto Adige","Friuli Venezia Giulia","Sicilia","Campania","Veneto","Liguria","Lombardia","Sardegna","Puglia","Calabria","Altre regioni","Francia"],
                  }
                  return (REGIONI_IT_D[tipo] || VINO_REGIONI)
                })().map(reg => {
                  const byReg = byTipo.filter(v => v.regioneVino === reg)
                  if (byReg.length === 0) return null
                  return (
                    <div key={reg} style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 11, color: STYLE.t3, marginBottom: 6, paddingLeft: 2, fontStyle: "italic" }}>{reg}</div>
                      {byReg.map(v => (
                        <div key={v.id} style={{ ...card({ padding: "12px 14px", marginBottom: 8 }) }}>
                          <div style={row({ justifyContent: "space-between", marginBottom: 8 })}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 14, fontWeight: 600, color: STYLE.t1, marginBottom: v.produttore ? 2 : 6 }}>{v.name}</div>
                              {v.produttore && <div style={{ fontSize: 11, color: STYLE.ac, fontStyle: "italic", marginBottom: 6 }}>{v.produttore}</div>}
                              {/* KPI vino */}
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6, marginBottom: 8 }}>
                                {[
                                  { l: "Costo bottiglia", v: v.bottlePrice > 0 ? formatEuro(v.bottlePrice) : (v.cost > 0 ? formatEuro(r2(v.cost * (v.calici || 6))) : " - "), c: STYLE.t2 },
                                  { l: "Vendita bottiglia", v: v.priceBottle > 0 ? formatEuro(v.priceBottle) : " - ", c: STYLE.ac },
                                  { l: "Margine", v: v.priceBottle > 0 && v.bottlePrice > 0 ? formatEuro(r2(v.priceBottle - v.bottlePrice)) : " - ", c: STYLE.green },
                                  { l: "Prezzo calice", v: v.priceCalice > 0 ? formatEuro(v.priceCalice) : " - ", c: STYLE.t1 },
                                ].map((k, i) => (
                                  <div key={i} style={{ background: STYLE.el, borderRadius: 6, padding: "6px 8px" }}>
                                    <div style={{ fontSize: 8.5, textTransform: "uppercase", letterSpacing: "0.06em", color: STYLE.t3, fontWeight: 600, marginBottom: 2 }}>{k.l}</div>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: k.c, fontVariantNumeric: "tabular-nums" }}>{k.v}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end", marginLeft: 8, flexShrink: 0 }}>
                              <button onClick={() => setDelTarget(v)} style={{ background: "none", border: "none", color: STYLE.t3, cursor: "pointer", fontSize: 16, padding: "0 4px" }}>✕</button>
                              <button onClick={() => { if(setEditDish && setPage) { setEditDish(v); setPage("fc") } }}
                                style={{ background: "none", border: "1px solid #2a2a31", color: STYLE.t2, cursor: "pointer", fontSize: 11, fontFamily: "inherit", padding: "2px 6px", borderRadius: STYLE.r }}>Modifica</button>
                            </div>
                          </div>
                          {/* Food cost bar */}
                          {v.priceBottle > 0 && v.cost > 0 && (() => {
                            const fc = v.cost / v.priceBottle
                            return (
                              <div style={{ height: 3, background: STYLE.el, borderRadius: 999, overflow: "hidden" }}>
                                <div style={{ height: "100%", width: Math.min(fc * 100, 100) + "%", background: fc > 0.4 ? STYLE.red : fc > 0.3 ? STYLE.ac : STYLE.green, borderRadius: 999 }} />
                              </div>
                            )
                          })()}
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            )
          })
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
                  <button onClick={() => { if(setEditDish && setPage) { setEditDish(d); setPage("fc") } }}
                    style={{ background: "none", border: "none", color: STYLE.t2, cursor: "pointer", fontSize: 12, fontFamily: "inherit", padding: "2px 6px", borderRadius: STYLE.r, border: "1px solid #2a2a31" }}>Modifica</button>
                  <button onClick={() => setDelTarget(d)} style={{ background: "none", border: "none", color: STYLE.t3, cursor: "pointer", fontSize: 18, padding: "0 4px", flexShrink: 0 }}>✕</button>
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

function Invoices({ invs, setInvs, ings, setIngs, fornitori, setFornitori, learned, setLearned, isMobile }) {
  const CATS = ["Carni", "Pesce", "Frutta e Verdura", "Freschi", "Surgelati", "Vini", "Bevande", "Scatolame", "Detersivi"]
  
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

  // dati fattura
  const [fattura, setFattura] = useState(() => {
    try { const s = localStorage.getItem("fm_ocr_fattura"); return s ? JSON.parse(s) : { sup: "", num: "", date: "", total: "", vat: "" } } catch(e) { return { sup: "", num: "", date: "", total: "", vat: "" } }
  })
  const [fattErr, setFattErr] = useState({})

  // ingredienti trovati in fattura
  // tipo: { nome, quantita, unita, prezzoUnitario, tipo: "update"|"new", ingId, ingName, cat, include }
  const [found, setFound] = useState([])

  function reset() {
    setStep("list"); setProg(0); setProgLabel(""); setOcrError(null)
    setFattura({ sup: "", num: "", date: "", total: "", vat: "" })
    setFattErr({}); setFound([])
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
      const PROMPT = promptBase || `Sei un esperto contabile per la ristorazione. Analizza questa fattura e restituisci SOLO JSON valido senza markdown.

REGOLE NOME: massimo 3 parole, solo il prodotto (es: "Maionese Calve", "Petto Barberie", "Triglia Scoglio"). NO pesi, NO volumi, NO codici, NO varianti.
REGOLE PREZZO: copia il valore della colonna Prezzo. Se c'è colonna Sconto: applica prezzoUnitario = Prezzo x (1 - Sconto/100). I numeri 4,5,10,22 in ultima colonna sono IVA non sconti.
CATEGORIE: Carni, Pesce, Frutta e Verdura, Freschi, Surgelati, Vini, Bevande, Scatolame, Detersivi.
VINI - OBBLIGATORIO compilare SEMPRE sotto1 E sotto2:
  sotto1 = Rossi, Bianchi, Rosé, o Bollicine
  sotto2 = regione di appartenenza
  Usa questa mappa per riconoscere i vini:
Bianchi/Altre regioni: barberani, orvieto classico, falanghina del molise, verdicchio di matelica vi, verdicchio dei castelli d, verdicchio di matelica ri, moscato del molise apiana
Bianchi/Campania: greco di tufo, ciro picariello, fiano di avellino, falanghina del sannio, falanghina vigna astroni, campi flegrei falanghina, sant'agata de' goti falanghina
Bianchi/Francia: pouilly-fumé, hermitage blanc, riesling jubilee, riesling réserve, sancerre d'antan, riesling heimbourg, riesling cuvée théo, riesling le kottabe, riesling grossi laüe, riesling engelgarten
Bianchi/Friuli Venezia Giulia: ribolla, collio bianco, collio malvasia, collio friulano, collio sauvignon, collio chardonnay, collio pinot bianco, collio pinot grigio, collio vecchie vigne, friuli isonzo tal lùc
Bianchi/Liguria: pigato, cinque terre bianco, cinque terre sciacchetrà, vermentino colli di luni
Bianchi/Lombardia: chardonnay, oltrepò pavese riesling
Bianchi/Piemonte: gavi, roero arneis, arneis blangé, moscato d'asti, brachetto d'acqui, erbaluce di caluso
Bianchi/Puglia: falanghina, fiano minutolo, moscato di trani, castel del monte bianco, primitivo di manduria dol
Bianchi/Sardegna: opale vermentino, moscato di sardegna, vermentino di gallura, vernaccia di oristano, vermentino di sardegna, cantina della vernaccia, villa solais vermentino
Bianchi/Sicilia: cometa, lighea, etna bianco, moscato di noto, marsala superiore, la fuga chardonnay, grand cru chardonnay, moscato di pantelleria, passito di pantelleria, marsala vergine soleras
Bianchi/Toscana: vermentino, bianco ornellaia, vin santo del chianti, vernaccia di san gimignan, vin santo di montepulcian
Bianchi/Trentino Alto Adige: trentino nosiola, vino santo trentino, alto adige sauvignon, trentino pinot grigio, alto adige chardonnay, alto adige moscato rosa, trentino müller thurgau, alto adige pinot bianco, trentino gewürztraminer, alto adige pinot grigio
Bianchi/Valle d'Aosta: blanc de morgex et de la, valle d'aosta chardonnay
Bianchi/Veneto: lugana, soave classico, cantina di soave, recioto di soave col fosc, recioto di soave le colom, recioto di soave le spond, recioto della valpolicella classico, recioto della valpolicella giovanni allegrini
Bollicine/Altre regioni: lambrusco reggiano, lambrusco di sorbara, lambrusco grasparossa di, concerto lambrusco reggia
Bollicine/Francia: taittinger comtes de champagne rosé, taittinger comtes de champagne blanc de blancs
Bollicine/Friuli Venezia Giulia: ribolla gialla brut
Bollicine/Lombardia: franciacorta brut, franciacorta rosé, franciacorta zero, franciacorta satèn, franciacorta pas dosé, franciacorta alma rosé, franciacorta '61 rosé, franciacorta pas operé, franciacorta '61 brut, franciacorta extra brut
Bollicine/Piemonte: alta langa, asti spumante
Bollicine/Sicilia: etna brut
Bollicine/Trentino Alto Adige: ferrari brut, ferrari rosé, ferrari perlé, trento doc brut, trento doc rosé, trento doc riserva, trento doc extra brut, trento doc rotari rosé, trento doc rotari brut, trento doc altemasi rosé
Bollicine/Valle d'Aosta: blanc de morgex et de la salle brut
Bollicine/Veneto: prosecco doc brut, prosecco doc extra dry, prosecco superiore brut, prosecco superiore crede, conegliano valdobbiadene, prosecco superiore primo, prosecco superiore bosco, prosecco superiore grave, prosecco superiore extra, prosecco superiore giardi
Rossi/Altre regioni: montiano merlot, cerasuolo d'abruzzo, aglianico del vulture, torgiano rosso riserva, rosso conero sassi neri, sagrantino di montefalco, lacrima di morro d'alba, montefalco rosso riserva, montepulciano d'abruzzo, aglianico del molise don
Rossi/Campania: taurasi, devon aglianico, aglianico del taburno, vigna astroni aglianico, terra d'eclano aglianico, sant'agata de' goti aglianico
Rossi/Francia: hermitage rouge, hermitage le méal, hermitage le pavillon, hermitage la chapelle, hermitage les greffieux, hermitage cuvée cathelin, crozes-hermitage thalaber, sancerre rouge clos du ch
Rossi/Friuli Venezia Giulia: merlot, friuli aquileia refosco, friuli colli orientali me, friuli colli orientali re, friuli colli orientali sc, friuli colli orientali ta
Rossi/Liguria: rossese di dolceacqua
Rossi/Lombardia: valtellina rosso, sforzato di valtellina, valtellina superiore torr, valtellina superiore grum, valtellina superiore maze, valtellina superiore valg, valtellina superiore sass, valtellina superiore somm, valtellina superiore infe, valtellina superiore cort
Rossi/Piemonte: barolo, barbaresco, roero braja, roero sudisfà, barbera d'alba, langhe nebbiolo, nebbiolo d'alba, dolcetto d'alba, roero prachiosso, dolcetto di ovada
Rossi/Puglia: negroamaro, nero primitivo, primitivo rosato, salice salentino, neprica primitivo, primitivo portile, primitivo old vines, prima mano primitivo, primitivo di manduria, castel del monte rosso
Rossi/Sardegna: buio carignano, cannonau romangia, carignano del sulcis, cannonau di sardegna, terre rare carignano, cantina del vermentino
Rossi/Sicilia: sur sur, tancredi, etna rosso, etna rosato, maroccoli syrah, nerello cappuccio, nerello mascalese, cerasuolo di vittoria
Rossi/Toscana: syrah, solaia, ornellaia, sassicaia, tignanello, carmignano, guidalberto, bolgheri rosso, chianti rufina, chianti classico
Rossi/Trentino Alto Adige: alto adige schiava, alto adige lagrein, trentino marzemino, trentino pinot nero, teroldego rotaliano, alto adige pinot nero, alto adige lago di caldar, alto adige cabernet sauvi, alto adige merlot siebene, alto adige santa maddalen
Rossi/Valle d'Aosta: valle d'aosta syrah, valle d'aosta nebbiolo
Rossi/Veneto: amarone creso, amarone mazzano, amarone il bosco, amarone costasera, amarone calcarole, bardolino classico, bardolino chiaretto, valpolicella ripasso, amarone villa novare, cantina di bardolino

{"fornitore":"","numero":"","data":"YYYY-MM-DD","totale":0,"iva":0,"prodotti":[{"nome":"","categoria":"","sotto1":"","sotto2":"","quantita":0,"unita":"kg o pz o l","prezzoUnitario":0,"sconto":"","produttore":""}]}`

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
CATEGORIE: Carni, Pesce, Frutta e Verdura, Freschi, Surgelati, Vini, Bevande, Scatolame, Detersivi.
VINI - sotto1=Rossi/Bianchi/Rosé/Bollicine, sotto2=regione (Piemonte/Toscana/Veneto/Sicilia/Trentino Alto Adige/etc).
SURGELATI: prodotti con asterisco C*** S*** o parola surgelato/gelo/congelato.
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
          prodotti: prodotti.map((p, i) => ({
            nome: p.nome,
            categoria: catMap[i]?.categoria || "",
            sotto1: catMap[i]?.sotto1 || "",
            sotto2: catMap[i]?.sotto2 || "",
            quantita: p.qta,
            unita: catMap[i]?.unita || p.um || "pz",
            prezzoUnitario: p.prezzoUnitario,
            sconto: p.sconto,
            produttore: ""
          }))
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
      if (/detersiv|sapone|candegg|disinfett|multiuso|sgrassator|lavastoviglie|spugna|strofinaccio|carta igien|scottex|sacchetti|brillantante|wc gel|disincrost|panno|bobina|guanti nitr|tovaglioli|piastrelle|paviment/.test(n)) return "Detersivi"
      if (/surgelat|gelo|frozen/.test(n)) return "Surgelati"
      if (/pelati|passata|conserva|tonno scatol|sardine scatol|fagioli scatol|ceci scatol|lenticchie|acciughe scatol|sugo pronto|legumi in/.test(n)) return "Scatolame"
      if (/birra|beer|lager|ipa|weiss|radler|corona|heineken|peroni|moretti|acqua mineral|coca.cola|fanta|sprite|succo|aranciata|limonata|energy drink|red bull|tonica|ginger|schweppes|gin |vodka|rum |whisky|whiskey|amaro|grappa|limoncello|aperol|campari|cynar|fernet|sambuca|brandy|cognac|calvados|tequila|mezcal|lipton|baileys/.test(n)) return "Bevande"
      if (/barolo|barbaresco|barbera|nebbiolo|chianti|brunello|amarone|prosecco|franciacorta|pinot grigio|pinot nero|vermentino|nero d.avola|primitivo|sangiovese|soave|lugana|gewurz|riesling|chardonnay|sauvignon|merlot|cabernet|syrah|champagne|bordeaux|borgogna|alsace|chablis|bollicine|spumante|cava|docg|doc |igt |cantina|tenuta|donnafugata|antinori|gaja|sassicaia|conterno|giacosa|ceretto/.test(n)) return "Vini"
      if (/pollo|manzo|maiale|vitello|agnello|coniglio|tacchino|cinghiale|anatra|piccione|quaglia|girello|fesa|bistecca|braciola|arrosto|spezzatino|macinato/.test(n)) return "Carni"
      if (/prosciutto|salame|mortadella|bresaola|coppa|speck|affettat|salumi|uova|uovo|pastorizzat|tuorlo|albume|wurstel|strutto/.test(n)) return "Freschi"
      if (/pesce|merluzzo|salmone|tonno fresc|branzino|orata|sogliola|baccala|cozze|vongole|gamberi|scampi|calamari|polpo|seppia|aragosta|astice|granchio|dentice|spigola/.test(n)) return "Pesce"
      if (/mela|pera|pesca|albicocca|ciliegia|arancia|limone|kiwi|ananas|banana|fragola|mango|melone|cocomero|fico|frutta|pomodor|insalata|lattuga|zucchine|melanzane|peperone|cipolla|aglio|carota|sedano|finocchio|broccoli|cavolfiore|asparagi|funghi|radicchio|rucola|spinaci|patate|bietola|carciofo|piselli|fagiolini|mais |zucca|porri|cetrioli|verdura|fave|peperoni/.test(n)) return "Frutta e Verdura"
      if (/parmigiano|mozzarella|grana |burro|latte |panna|yogurt|ricotta|fontina|asiago|brie|gorgonzola|provolone|scamorza|mascarpone|formaggio|toma |pecorino|castelmagno|taleggio|stracchino/.test(n)) return "Freschi"
      return "Scatolame"
    }

    // Pulisce il nome del vino rimuovendo codici articolo, quantità, annate, formati
    function cleanWineName(nome) {
      return nome
        .replace(/PAC|B[0-9]+V[A-Z]+Q?|[A-Z]{2,6}[0-9]{5,}/g, "") // codici articolo
        .replace(/(CART|AST\.CT|CT|CASSA|ASTUCCIO|SCATOLA|CS)\.?\s*\d+/gi, "") // cartoni
        .replace(/\d{3,4}\s*ML|\d{1,2}[.,]\d\s*L|750|375|1500|1\.5/gi, "") // formati
        .replace(/(19|20)\d{2}/g, "") // annate
        .replace(/(MILLESIMATO|MILLESIM|MILL)/gi, "millesimato")
        .replace(/\s+/g, " ").trim()
    }

    // Normalizza tipologia vino dall'AI
    function normTipoVino(s) {
      if (!s) return null
      const t = s.toLowerCase().trim()
      if (/rosso|rossi|red|rouge/.test(t)) return "Rossi"
      if (/bianco|bianchi|white|blanc/.test(t)) return "Bianchi"
      if (/ros[eé]|rosato|rosé|pink/.test(t)) return "Rosé"
      if (/bollic|spumant|brut|prosecco|franciacorta|champagne|crémant|cremant/.test(t)) return "Bollicine"
      return null
    }

    // Normalizza regione vino dall'AI
    function normRegioneVino(s) {
      if (!s) return null
      const REGIONI = ["Piemonte","Valle d'Aosta","Toscana","Trentino Alto Adige","Friuli Venezia Giulia","Sicilia","Campania","Veneto","Liguria","Lombardia","Sardegna","Puglia","Calabria","Altre regioni","Francia"]
      const t = s.toLowerCase().trim()
      for (const r of REGIONI) {
        if (t.includes(r.toLowerCase()) || r.toLowerCase().includes(t)) return r
      }
      return null
    }

    function guessTipoVino(nome) {
      const n = nome.toLowerCase()
      if (/prosecco|franciacorta|spumante|bollicine|champagne|cava|metodo classico|trento doc|asti spumante|moscato spumante|millesimato|brut|demi.sec|metodo charmat|cuv[eé]e/.test(n)) return "Bollicine"
      if (/rosato|rose|cerasuolo|ramato|chiaretto/.test(n)) return "Rosé"
      if (/bianco|pinot grigio|vermentino|soave|chardonnay|sauvignon|gewurz|riesling|vernaccia|trebbiano|greco|fiano|falanghina|arneis|gavi|ribolla|grillo|catarratto|nuragus|verdicchio/.test(n)) return "Bianchi"
      return "Rossi"
    }

    function guessRegioneVino(nome) {
      const cleaned = cleanWineName(nome)
      const n = nome.toLowerCase()
      // Controlla prima il nome direttamente (più affidabile per nomi lunghi)
      if (/sicilia|etna|nero d.avola|nerello|marsala/i.test(nome)) return "Sicilia"
      if (/piemonte|barolo|barbaresco|barbera|nebbiolo|moscato d.asti|langhe|gavi|arneis|dolcetto/i.test(nome)) return "Piemonte"
      if (/toscana|chianti|brunello|vernaccia|bolgheri|montalcino|montepulciano|maremma/i.test(nome)) return "Toscana"
      if (/prosecco|soave|amarone|valpolicella|veneto|lugana|bardolino|custoza/i.test(nome)) return "Veneto"
      if (/franciacorta|lombardia|valtellina|oltrepo/i.test(nome)) return "Lombardia"
      if (/friuli|collio|ribolla|ramato/i.test(nome)) return "Friuli Venezia Giulia"
      if (/trentino|alto adige|trento doc|teroldego|lagrein|müller|muller/i.test(nome)) return "Trentino Alto Adige"
      if (/aglianico|taurasi|greco di tufo|fiano|falanghina|campania/i.test(nome)) return "Campania"
      if (/sardegna|vermentino di sardegna|cannonau|carignano/i.test(nome)) return "Sardegna"
      if (/champagne|bordeaux|borgogna|alsace|france|loire|chablis|rhone/i.test(nome)) return "Francia"
      if (/valle d.aosta|valdostano/i.test(nome)) return "Valle d'Aosta"
      if (/liguria|riviera ligure|pigato|rossese/i.test(nome)) return "Liguria"
      if (/puglia|primitivo|negroamaro|salice salentino/i.test(nome)) return "Puglia"
      if (/calabria|ciro|gaglioppo/i.test(nome)) return "Calabria"
      return "Altre regioni"
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
      // 3. Se il nome ha indicatori vino → forza Vini e salta lookupFood sempre
      const wineByName = isLikelyWine(p.nome)
      const skipFood = wineByName || aiCat === "Vini" || learnedMatch?.cat === "Vini"
      const dbMatch = !learnedMatch && !skipFood ? lookupFood(p.nome) : null
      const cat = (learnedMatch ? learnedMatch.cat : null) || (wineByName ? "Vini" : null) || (dbMatch ? dbMatch.cat : null) || aiCat
      const sotto1Final = (learnedMatch ? learnedMatch.sotto1 : null) || (dbMatch ? dbMatch.sotto1 : "") || p.sotto1 || ""
      const sotto2Final = (learnedMatch ? learnedMatch.sotto2 : null) || (dbMatch ? dbMatch.sotto2 : "") || p.sotto2 || ""
      const nameLower = p.nome.toLowerCase()
      const existing = ings.find(i => {
        const aWords = i.name.toLowerCase().split(/\s+/).filter(w => w.length >= 4)
        const bWords = nameLower.split(/\s+/).filter(w => w.length >= 4)
        if (!aWords.length || !bWords.length) return false
        const common = aWords.filter(w => bWords.includes(w))
        const union = new Set([...aWords, ...bWords]).size
        const jaccard = common.length / union
        // Jaccard >= 0.5 E almeno 2 parole in comune
        return jaccard >= 0.5 && common.length >= 2
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
        ...(cat === "Vini" ? {
          tipoVino: normTipoVino(p.sotto1) || guessTipoVino(p.nome),
          regioneVino: normRegioneVino(p.sotto2) || guessRegioneVino(p.nome),
          produttore: p.produttore || ""
        } : {})
      }
    })

    setFound(foundList)
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
    if (c.includes("vino") || c.includes("vini")) return "Vini"
    if (c.includes("bevand")) return "Bevande"
    if (c.includes("scatol")) return "Scatolame"
    if (c.includes("detersiv")) return "Detersivi"
    return null
  }

  //  -  -  Salva tutto  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  - 
  function save() {
    const e = {}
    if (!fattura.sup.trim()) e.sup = "Obbligatorio"
    if (!fattura.num.trim()) e.num = "Obbligatorio"
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
        const newCur = match.prezzoUnitario
        const newAvg = Math.round(((ing.avg * 0.7) + (newCur * 0.3)) * 100) / 100
        const vinoFields = ing.cat === "Vini" ? {
          ...(match.tipoVino ? { tipoVino: match.tipoVino } : {}),
          ...(match.regioneVino ? { regioneVino: match.regioneVino } : {}),
          ...(match.produttore ? { produttore: match.produttore } : {}),
        } : {}
        // Aggiorna anche cat/sotto1/sotto2 se l'utente li ha modificati nella revisione
        const catFields = match.cat && match.cat !== ing.cat ? { cat: match.cat, sotto1: match.sotto1 || "", sotto2: match.sotto2 || "" } : {}
        return { ...ing, prev: ing.cur, cur: newCur, avg: newAvg, ...vinoFields, ...catFields }
      }))
    }

    // Aggiungi nuovi ingredienti
    const toAdd = toProcess.filter(p => p.tipo === "new")
    if (toAdd.length > 0) {
      const newIngs = toAdd.map(p => ({
        id: "i" + uid(),
        name: (p.nomeEdit || p.nome).trim(),
        cat: p.cat,
        unit: p.cat === "Vini" ? "bottiglia" : (p.unita || "kg"),
        cur: p.prezzoUnitario,
        avg: p.prezzoUnitario,
        fornitore: fattura.sup.trim() || "",
        sotto1: p.sotto1 || "",
        sotto2: p.sotto2 || "",
        ...(p.cat === "Vini" ? { tipoVino: p.tipoVino || "Rossi", regioneVino: p.regioneVino || "Altre regioni", produttore: p.produttore || "" } : {})
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

    // Auto-crea o aggiorna fornitore
    const supName = fattura.sup.trim()
    if (supName) {
      setFornitori(prev => {
        const exists = prev.find(f => f.name.toLowerCase() === supName.toLowerCase())
        if (exists) return prev // gi   presente
        return [...prev, { id: "f" + uid(), name: supName, tel: "", email: "", cat: "" }]
      })
    }

    try { localStorage.removeItem("fm_ocr_fattura") } catch(e) {}
    reset()
  }

  //  -  -  RENDER  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  - 
  const updCount = found.filter(p => p.include && p.tipo === "update").length
  const newCount = found.filter(p => p.include && p.tipo === "new").length

  return (
    <div>
      {/* Header */}
      <div style={row({ justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", alignItems: "flex-start" })}>
        <div>
          <div style={{ fontFamily: "'Georgia',serif", fontSize: 20, color: STYLE.t1 }}>Fatture</div>
          <div style={{ fontSize: 12, color: STYLE.t3 }}>{invs.length} fatture . {fornitori.length} fornitori</div>
        </div>
        <div style={row({ gap: 8 })}>
          {step === "list" && invTab === "fatture" && <button style={btn("p")} onClick={() => setStep("upload")}>+ Carica fattura</button>}
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
            const fInvs = invs.filter(i => i.sup.toLowerCase() === f.name.toLowerCase())
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
                  const fInvs = invs.filter(i => i.sup.toLowerCase() === f.name.toLowerCase())
                  const totAnno = fInvs.filter(i => i.date.startsWith(new Date().getFullYear().toString())).reduce((s,i) => s + i.total, 0)
                  return (
                    <div key={f.id} style={{ ...card({ padding: "14px 16px", cursor: "pointer" }) }} onClick={() => setSelFornitore(f.id)}>
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
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <label style={{ display: "block", border: "2px dashed #2a2a31", borderRadius: 10, padding: 28, textAlign: "center", cursor: "pointer", background: STYLE.el }}>
              <input type="file" accept="image/*" capture="environment"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
                style={{ display: "none" }}
              />
              <div style={{ fontSize: 32, marginBottom: 8 }}></div>
              <div style={{ fontSize: 15, fontWeight: 600, color: STYLE.t1, marginBottom: 4 }}>Scatta una foto</div>
              <div style={{ fontSize: 12, color: STYLE.t3 }}>Apre direttamente la fotocamera</div>
            </label>
            <label style={{ display: "block", border: "2px dashed #2a2a31", borderRadius: 10, padding: 20, textAlign: "center", cursor: "pointer", background: STYLE.el }}>
              <input type="file" accept="image/*,.pdf"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
                style={{ display: "none" }}
              />
              <div style={{ fontSize: 22, marginBottom: 6 }}></div>
              <div style={{ fontSize: 13, fontWeight: 600, color: STYLE.t2, marginBottom: 2 }}>Scegli dalla galleria o PDF</div>
              <div style={{ fontSize: 11, color: STYLE.t3 }}>JPG, PNG o PDF</div>
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
      {step === "review" && (
        <div style={{ maxWidth: 600 }}>
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
                <div key={i} style={{ padding: "12px 0", borderBottom: i < found.length - 1 ? STYLE.bds : "none" }}>
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
                      {p.tipo === "update" && (
                        <div style={{ fontSize: 11, color: STYLE.green }}>' aggiorna: {p.ingName}</div>
                      )}
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
                      {p.cat === "Vini" ? (
                        <>
                          <div>
                            <label style={{ fontSize: 10, color: STYLE.t2, marginBottom: 3, display: "block" }}>Tipologia</label>
                            <select style={inp({ appearance: "none", cursor: "pointer", fontSize: 12 })}
                              value={p.tipoVino || "Rossi"}
                              onChange={e => setFound(prev => prev.map((x, j) => j === i ? { ...x, tipoVino: e.target.value } : x))}>
                              {["Rossi","Bianchi","Rosé","Bollicine"].map(t => <option key={t}>{t}</option>)}
                            </select>
                          </div>
                          <div>
                            <label style={{ fontSize: 10, color: STYLE.t2, marginBottom: 3, display: "block" }}>Regione</label>
                            <select style={inp({ appearance: "none", cursor: "pointer", fontSize: 12 })}
                              value={p.regioneVino || "Altre regioni"}
                              onChange={e => setFound(prev => prev.map((x, j) => j === i ? { ...x, regioneVino: e.target.value } : x))}>
                              {["Piemonte","Valle d'Aosta","Toscana","Trentino Alto Adige","Friuli Venezia Giulia","Sicilia","Campania","Veneto","Liguria","Lombardia","Sardegna","Puglia","Calabria","Altre regioni","Francia"].map(r => <option key={r}>{r}</option>)}
                            </select>
                          </div>

                        </>
                      ) : SOTTO1_ORDER[p.cat] ? (
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
                        <label style={{ fontSize: 10, color: STYLE.t2, marginBottom: 3, display: "block" }}>Prezzo unitario v</label>
                        <input type="text" inputMode="decimal"
                          style={inp({ fontSize: 12, padding: "5px 8px" })}
                          value={p.prezzoStr !== undefined ? p.prezzoStr : (p.prezzoUnitario === 0 ? "" : String(p.prezzoUnitario).replace(".", ","))}
                          onChange={e => {
                            const val = e.target.value
                            // Permette di digitare liberamente (es. "9,", "9,8")
                            const cleaned = val.replace(",", ".")
                            const num = parseFloat(cleaned)
                            setFound(prev => prev.map((x, j) => j === i ? {
                              ...x,
                              prezzoStr: val,
                              prezzoUnitario: isNaN(num) ? x.prezzoUnitario : Math.round(num * 100) / 100
                            } : x))
                          }}
                          onBlur={e => {
                            // Al blur pulisce la stringa
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

function Ricette({ dishes, setDishes, ings, isMobile, editDish, setEditDish }) {
  const [sel, setSel] = useState(null) // null | "food" | "drink"

  if (sel === "food") return <FoodCost dishes={dishes} setDishes={setDishes} ings={ings} isMobile={isMobile} editDish={editDish} setEditDish={setEditDish} defaultTab="food" onBack={() => setSel(null)} />
  if (sel === "drink") return <FoodCost dishes={dishes} setDishes={setDishes} ings={ings} isMobile={isMobile} editDish={editDish} setEditDish={setEditDish} defaultTab="drink" onBack={() => setSel(null)} />

  const foodCount  = dishes.filter(d => !["vino","bevanda","cocktail"].includes(d.cat)).length
  const drinkCount = dishes.filter(d => ["vino","bevanda","cocktail"].includes(d.cat)).length

  return (
    <div>
      <div style={{ fontFamily: "'Georgia',serif", fontSize: 20, color: STYLE.t1, marginBottom: 4 }}>Ricette</div>
      <div style={{ fontSize: 12, color: STYLE.t3, marginBottom: 24 }}>Gestisci food cost e drink cost</div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr", gap: 16 }}>
        <div onClick={() => setSel("food")}
          style={{ ...card({ padding: "28px 20px", cursor: "pointer", position: "relative", overflow: "hidden" }) }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg," + STYLE.ac + ",transparent)" }} />
          <div style={{ fontSize: 28, marginBottom: 12 }}></div>
          <div style={{ fontFamily: "'Georgia',serif", fontSize: 18, color: STYLE.t1, marginBottom: 6 }}>Food Cost</div>
          <div style={{ fontSize: 12, color: STYLE.t3, marginBottom: 12 }}>Ricette cucina, costo piatti, margini</div>
          <div style={{ fontSize: 13, color: STYLE.ac, fontWeight: 600 }}>{foodCount} piatt{foodCount !== 1 ? "i" : "o"}</div>
        </div>
        <div onClick={() => setSel("drink")}
          style={{ ...card({ padding: "28px 20px", cursor: "pointer", position: "relative", overflow: "hidden" }) }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg," + STYLE.ac + ",transparent)" }} />
          <div style={{ fontSize: 28, marginBottom: 12 }}></div>
          <div style={{ fontFamily: "'Georgia',serif", fontSize: 18, color: STYLE.t1, marginBottom: 6 }}>Drink Cost</div>
          <div style={{ fontSize: 12, color: STYLE.t3, marginBottom: 12 }}>Vini, cocktail, bevande</div>
          <div style={{ fontSize: 13, color: STYLE.ac, fontWeight: 600 }}>{drinkCount} voc{drinkCount !== 1 ? "i" : "e"}</div>
        </div>
      </div>
    </div>
  )
}

function FoodCost({ dishes, setDishes, ings, isMobile, editDish, setEditDish, defaultTab, onBack }) {
  const [tab, setTab] = useState(defaultTab || "food") // "food" | "drink"

  //  -  -  Shared  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  - 
  const FOOD_CATS = ["Speciali", "Antipasti", "Primi", "Secondi", "Dolci", "Cocktail", "Bevande"]
  const VINO_TIPI = ["Rossi", "Bianchi", "Rosé", "Bollicine"]
  const VINO_REGIONI_ORDER = {
    Rossi:    ["Piemonte","Valle d'Aosta","Toscana","Trentino Alto Adige","Friuli Venezia Giulia","Sicilia","Campania","Veneto","Liguria","Lombardia","Sardegna","Puglia","Calabria","Altre regioni","Francia"],
    Bianchi:  ["Piemonte","Valle d'Aosta","Toscana","Trentino Alto Adige","Friuli Venezia Giulia","Sicilia","Campania","Veneto","Liguria","Lombardia","Sardegna","Puglia","Calabria","Altre regioni","Francia"],
    "Rosé":   ["Piemonte","Valle d'Aosta","Toscana","Trentino Alto Adige","Friuli Venezia Giulia","Sicilia","Campania","Veneto","Liguria","Lombardia","Altre regioni","Francia"],
    Bollicine:["Piemonte","Valle d'Aosta","Toscana","Trentino Alto Adige","Friuli Venezia Giulia","Sicilia","Campania","Veneto","Liguria","Lombardia","Sardegna","Puglia","Calabria","Altre regioni","Francia"],
  }
  function getRegioniOrder(tipo) { return VINO_REGIONI_ORDER[tipo] || VINO_REGIONI }
  const VINO_REGIONI = ["Piemonte","Valle d'Aosta","Toscana","Trentino Alto Adige","Friuli Venezia Giulia","Sicilia","Campania","Veneto","Liguria","Lombardia","Sardegna","Puglia","Calabria","Altre regioni","Francia"]
  const UNITS = ["kg", "l", "confezione"]
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

    // Converti quantit   da rowUnit a iu
    let qtyConverted = qty
    if (ru === "g"  && iu === "kg") qtyConverted = qty / 1000
    else if (ru === "kg" && iu === "g")  qtyConverted = qty * 1000
    else if (ru === "ml" && iu === "l")  qtyConverted = qty / 1000
    else if (ru === "l"  && iu === "ml") qtyConverted = qty * 1000
    else if (ru === iu) qtyConverted = qty

    // Applica scala ingrediente (se era in g, il prezzo va diviso per 1000)
    return qtyConverted / ingScale
  }

  //  -  -  FOOD COST state  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  - 
  const [fForm, setFForm]     = useState(() => {
    try { const s = localStorage.getItem("fm_fc_form"); return s ? JSON.parse(s) : { name: "", cat: "Secondi", ricarico: "300" } } catch(e) { return { name: "", cat: "Secondi", ricarico: "300" } }
  })
  const [fRecipe, setFRecipe] = useState(() => {
    try { const s = localStorage.getItem("fm_fc_recipe"); return s ? JSON.parse(s) : [{ id: uid2(), ingId: "", _cat: "", _open: false, qty: "", unit: "g", waste: "0" }] } catch(e) { return [{ id: uid2(), ingId: "", _cat: "", _open: false, qty: "", unit: "g", waste: "0" }] }
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
        id: uid2(), ingId: r.ingId, qty: String(r.qty), unit: r.unit, waste: String(r.waste || "0")
      })))
    }
    setTab("food")
  }, [editDish])

  const fLiveCost = fRecipe.reduce((sum, rr) => {
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

  function fAddRow()    { setFRecipe(r => [...r, { id: uid2(), ingId: "", _cat: "", _open: false, qty: "", unit: "g", waste: "0" }]) }
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
      ingId: r.ingId, qty: parseFloat(r.qty) || 0, unit: r.unit, waste: r.waste || "0"
    }))
    if (editDish) {
      // Aggiorna piatto esistente
      setDishes(prev => prev.map(d => d.id === editDish.id ? {
        ...d, name: fForm.name.trim(),
        cat: catMap[fForm.cat] || fForm.cat.toLowerCase(),
        price, target: fFoodCostPct, cost, fc, margin: r2(fMargin),
        ricarico: fRicarico,
        recipe: savedRecipe
      } : d))
      if (setEditDish) setEditDish(null)
    } else {
      setDishes(prev => [...prev, {
        id: "d" + uid2(), name: fForm.name.trim(),
        cat: catMap[fForm.cat] || fForm.cat.toLowerCase(),
        price, target: fFoodCostPct, cost, fc, margin: r2(fMargin),
        ricarico: fRicarico,
        recipe: savedRecipe, stagioni: []
      }])
    }
    setFForm({ name: "", cat: "Secondi", ricarico: "300" })
    setFRecipe([{ id: uid2(), ingId: "", _cat: "", _open: false, qty: "", unit: "g", waste: "0" }])
    try { localStorage.removeItem("fm_fc_form"); localStorage.removeItem("fm_fc_recipe") } catch(e) {}
    setFErr({})
    setFSaved(true)
    setTimeout(() => setFSaved(false), 3000)
  }

  //  -  -  DRINK COST state  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  - 
  const [dForm, setDForm] = useState({
    name: "", tipo: "Rossi", regione: "Toscana",
    bottlePrice: "", iva: "10", ricarico: "200",
    calici: "6", isVino: true, selIngId: ""
  })
  const [dErr, setDErr]   = useState({})
  const [dSaved, setDSaved] = useState(false)

  const viniIng = ings.filter(i => i.cat === "Vini")
  const bevIng  = ings.filter(i => i.cat === "Bevande")

  // When an ingredient vino is selected, auto-fill price, tipo, regione
  function onSelIngVino(ingId) {
    const ing = ings.find(i => i.id === ingId)
    if (!ing) { setDForm(f => ({ ...f, selIngId: "", bottlePrice: "", name: "" })); return }
    setDForm(f => ({
      ...f,
      selIngId: ingId,
      name: ing.name,
      bottlePrice: String(ing.cur),
      tipo: ing.tipoVino || "Rossi",
      regione: ing.regioneVino || "Altre regioni",
    }))
  }

  // When a bevanda ingredient is selected, auto-fill price and name
  function onSelIngBev(ingId) {
    const ing = ings.find(i => i.id === ingId)
    if (!ing) { setDForm(f => ({ ...f, selIngId: "", bottlePrice: "", name: "" })); return }
    setDForm(f => ({
      ...f,
      selIngId: ingId,
      name: ing.name,
      bottlePrice: String(ing.cur),
    }))
  }

  // Prezzo bottiglia inserito = prezzo NETTO (IVA esclusa)
  // Costo totale = prezzo netto + IVA
  const dPriceNet   = dForm.bottlePrice ? +dForm.bottlePrice : 0
  const dPriceGross = r2(dPriceNet * (1 + (+dForm.iva || 0) / 100))
  const dSellBottle = r2(dPriceNet * ((+dForm.ricarico || 200) / 100)) // moltiplicatore: 200% =  --2
  const dSellCalice = dForm.calici > 0 ? r2(dSellBottle / +dForm.calici) : 0

  function dSave() {
    const e = {}
    if (!dForm.name.trim()) e.name = "Obbligatorio"
    if (!dForm.bottlePrice || +dForm.bottlePrice <= 0) e.bottlePrice = "Prezzo > 0"
    if (Object.keys(e).length) { setDErr(e); return }

    const isVino = !["Cocktail", "Bevanda"].includes(dForm.tipo)
    setDishes(prev => [...prev, {
      id: "d" + uid2(),
      name: dForm.name.trim(),
      cat: isVino ? "vino" : dForm.tipo === "Bevanda" ? "bevanda" : "cocktail",
      price: isVino ? dSellCalice : dSellBottle,
      priceBottle: dSellBottle,
      priceCalice: dSellCalice,
      cost: r2(dPriceNet / (isVino ? +dForm.calici : 1)),
      fc: 0, margin: r2(dSellBottle - dPriceNet),
      ricarico: +dForm.ricarico,
      target: 0,
      tipoVino: isVino ? dForm.tipo : null,
      regioneVino: isVino ? dForm.regione : null,
      stagioni: [],
      bottlePrice: +dForm.bottlePrice,
      iva: +dForm.iva,
      ricarico: +dForm.ricarico,
      calici: +dForm.calici,
    }])
    setDForm({ name: "", tipo: "Rossi", regione: "Toscana", bottlePrice: "", iva: "10", ricarico: "200", calici: "6", isVino: true, selIngId: "" })
    setDErr({})
    setDSaved(true)
    setTimeout(() => setDSaved(false), 3000)
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
          <div style={{ fontFamily: "'Georgia',serif", fontSize: 20, color: STYLE.t1 }}>{tab === "food" ? "Food Cost" : "Drink Cost"}</div>
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
                const ing = ings.find(i => i.id === row.ingId)
                const qty = parseFloat(row.qty) || 0
                const lineQty = ing ? toIngUnit(qty, row.unit, ing.unit) : qty
                const wastePctDisplay = (parseFloat(row.waste) || 0) / 100
                const wasteMultDisplay = wastePctDisplay >= 1 ? 1 : 1 / (1 - wastePctDisplay)
                const lineCost = ing && qty > 0 ? r2(lineQty * ing.cur * wasteMultDisplay) : 0
                return (
                  <div key={row.id} style={{ display: "grid", gridTemplateColumns: "1fr 90px 70px 24px", gap: 6, padding: "7px 6px", borderBottom: idx < fRecipe.length - 1 ? STYLE.bds : "none", alignItems: "flex-start", background: idx % 2 === 0 ? "transparent" : STYLE.el + "44" }}>
                    {/* Bottone che apre modal full-screen per selezionare ingrediente */}
                    {(() => {
                      const ing = ings.find(i => i.id === row.ingId)
                      return (
                        <button
                          onClick={() => fUpdateRow(row.id, { _open: true, _cat: row._cat || "" })}
                          style={{ ...inp({ padding: "6px 8px", fontSize: 11, cursor: "pointer", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", background: ing ? STYLE.acg : STYLE.el, borderColor: ing ? STYLE.acd : "#2a2a31" })}}>
                          <div style={{ overflow: "hidden", flex: 1 }}>
                            <div style={{ color: ing ? STYLE.ac : STYLE.t3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {ing ? ing.name.slice(0, 6) + (ing.name.length > 6 ? " " : "") : "Sel "}
                            </div>
                            {lineCost > 0 && <div style={{ fontSize: 10, color: STYLE.green, marginTop: 1 }}>{formatEuro(lineCost)}</div>}
                          </div>
                          <span style={{ fontSize: 9, color: STYLE.t3, flexShrink: 0, marginLeft: 4 }}>- </span>
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
                              ["Carni","Pesce","Frutta e Verdura","Freschi","Surgelati","Vini","Bevande","Scatolame","Detersivi"]
                                .filter(c => ings.some(i => i.cat === c))
                                .map(c => (
                                  <div key={c} onClick={() => fUpdateRow(row.id, { _cat: c, _sotto1: null })}
                                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: STYLE.bds, cursor: "pointer" }}>
                                    <span style={{ fontSize: 15, color: STYLE.t1 }}>{c}</span>
                                    <span style={{ color: STYLE.t3 }}> </span>
                                  </div>
                                ))
                            ) : row._cat && !row._sotto1 && ["Carni","Pesce","Frutta e Verdura","Freschi","Surgelati","Bevande"].includes(row._cat) ? (
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
                                ).map(i => (
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

      {/*  -  -  TAB: DRINK COST  -  -  */}
      {tab === "drink" && (
        <div style={{ maxWidth: 600 }}>
          {dSaved && (
            <div style={{ marginBottom: 16, padding: "10px 14px", background: STYLE.gd, border: "1px solid rgba(74,222,128,0.3)", borderRadius: 8, fontSize: 13, color: STYLE.green }}>
              Voce salvata e aggiunta alla sezione Piatti -
            </div>
          )}

          <div style={card({ padding: 16, marginBottom: 14 })}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: STYLE.t3, marginBottom: 12 }}>Dati voce</div>

            <Fld label="Nome *">
              <input style={inp()} value={dForm.name}
                onChange={e => {
                  const nome = e.target.value
                  const isVino = !["Cocktail","Bevanda"].includes(dForm.tipo)
                  if (isVino && nome.length > 3) {
                    const dbRes    = lookupWine(nome)
                    const tipoGuess = dbRes ? dbRes.tipo    : guessTipoVino(nome)
                    const regGuess  = dbRes ? dbRes.regione : guessRegioneVino(nome)
                    const prodGuess = dbRes?.produttore || f.selIngId ? f.produttore : ""
                    setDForm(f => ({ ...f, name: nome, tipo: tipoGuess, regione: regGuess, ...(prodGuess ? { produttore: prodGuess } : {}) }))
                  } else {
                    setDForm(f => ({ ...f, name: nome }))
                  }
                }}
                placeholder="es. Barolo Giacomo Conterno 2018" />
              {dErr.name && <span style={{ fontSize: 11, color: STYLE.red }}>{dErr.name}</span>}
            </Fld>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Fld label="Tipologia">
                <select style={inp({ appearance: "none", cursor: "pointer" })} value={dForm.tipo}
                  onChange={e => setDForm(f => ({ ...f, tipo: e.target.value, isVino: e.target.value !== "Cocktail" }))}>
                  {[...VINO_TIPI, "Cocktail", "Bevanda"].map(t => <option key={t}>{t}</option>)}
                </select>
              </Fld>
              {!["Cocktail","Bevanda"].includes(dForm.tipo) && (
                <Fld label="Regione">
                  <select style={inp({ appearance: "none", cursor: "pointer" })} value={dForm.regione} onChange={e => setDForm(f => ({ ...f, regione: e.target.value }))}>
                    {VINO_REGIONI.map(r => <option key={r}>{r}</option>)}
                  </select>
                </Fld>
              )}
            </div>

            {/* Collegamento a ingrediente vino */}
            {!["Cocktail", "Bevanda"].includes(dForm.tipo) && viniIng.length > 0 && (
              <Fld label="Seleziona da magazzino vini">
                <select style={inp({ appearance: "none", cursor: "pointer" })} value={dForm.selIngId} onChange={e => onSelIngVino(e.target.value)}>
                  <option value=""> -  oppure inserisci manualmente  - </option>
                  {viniIng.map(i => {
                    const alreadyDone = dishes.some(d => (d.cat === "vino") && (d.name === i.name || (d.bottlePrice && d.bottlePrice === i.cur)))
                    return <option key={i.id} value={i.id}>{alreadyDone ? "- " : ""}{i.name} . {formatEuro(i.cur)}/bottiglia</option>
                  })}
                </select>
              </Fld>
            )}

            {/* Collegamento a ingrediente bevanda */}
            {dForm.tipo === "Bevanda" && bevIng.length > 0 && (
              <Fld label="Seleziona da magazzino bevande">
                <select style={inp({ appearance: "none", cursor: "pointer" })} value={dForm.selIngId} onChange={e => onSelIngBev(e.target.value)}>
                  <option value=""> -  oppure inserisci manualmente  - </option>
                  {bevIng.map(i => {
                    const alreadyDone = dishes.some(d => d.cat === "bevanda" && d.name === i.name)
                    return <option key={i.id} value={i.id}>{alreadyDone ? "- " : ""}{i.name} . {formatEuro(i.cur)}/{i.unit}</option>
                  })}
                </select>
              </Fld>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <Fld label="Prezzo bottiglia IVA esclusa (v) *">
                <input style={inp()} type="number" step="0.01" value={dForm.bottlePrice} onChange={e => setDForm(f => ({ ...f, bottlePrice: e.target.value, selIngId: "" }))} placeholder="0.00" />
                {dErr.bottlePrice && <span style={{ fontSize: 11, color: STYLE.red }}>{dErr.bottlePrice}</span>}
              </Fld>
              <Fld label="IVA %">
                <select style={inp({ appearance: "none", cursor: "pointer" })} value={dForm.iva} onChange={e => setDForm(f => ({ ...f, iva: e.target.value }))}>
                  {["4", "10", "22"].map(v => <option key={v}>{v}</option>)}
                </select>
              </Fld>
              <Fld label="Ricarico %">
                <select style={inp({ appearance: "none", cursor: "pointer" })} value={dForm.ricarico} onChange={e => setDForm(f => ({ ...f, ricarico: e.target.value }))}>
                  {["100","150","200","250","300","350","400","450","500"].map(v => <option key={v}>{v}</option>)}
                </select>
              </Fld>
            </div>

            {!["Cocktail","Bevanda"].includes(dForm.tipo) && (
              <Fld label="Calici per bottiglia">
                <select style={inp({ appearance: "none", cursor: "pointer" })} value={dForm.calici} onChange={e => setDForm(f => ({ ...f, calici: e.target.value }))}>
                  {["4","5","6","7","8"].map(v => <option key={v}>{v}</option>)}
                </select>
              </Fld>
            )}
          </div>

          {/* Calcolo automatico drink */}
          {dForm.bottlePrice && +dForm.bottlePrice > 0 && (
            <div style={card({ padding: 14, marginBottom: 16 })}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: STYLE.t3, marginBottom: 10 }}>Calcolo automatico</div>
              <div style={{ display: "grid", gridTemplateColumns: !["Cocktail","Bevanda"].includes(dForm.tipo) ? "1fr 1fr 1fr 1fr" : "1fr 1fr 1fr", gap: 8 }}>
                {[
                  { l: "Costo netto (IVA esclusa)", v: formatEuro(r2(dPriceNet)), c: STYLE.t1 },
                  { l: "Costo lordo (IVA inclusa)", v: formatEuro(dPriceGross), c: STYLE.t2 },
                  { l: "Prezzo vendita bottiglia", v: formatEuro(dSellBottle), c: STYLE.ac },
                  ...(!["Cocktail","Bevanda"].includes(dForm.tipo) ? [{ l: "Prezzo al calice", v: formatEuro(dSellCalice), c: STYLE.green }] : []),
                ].map((k, i) => (
                  <div key={i} style={{ background: STYLE.el, border: STYLE.bd, borderRadius: 6, padding: "12px 12px" }}>
                    <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.07em", color: STYLE.t3, fontWeight: 600, marginBottom: 4 }}>{k.l}</div>
                    <div style={{ fontFamily: "'Georgia',serif", fontSize: 18, color: k.c }}>{k.v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button style={{ ...btn("p"), width: "100%", justifyContent: "center", padding: "12px" }} onClick={dSave}>
            Salva e invia a Piatti
          </button>
        </div>
      )}
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



function ListaSpesa({ spesa, setSpesa, ings, fornitori, isMobile }) {
  const CATS = ["Carni", "Pesce", "Frutta e Verdura", "Freschi", "Surgelati", "Vini", "Bevande", "Scatolame", "Detersivi"]
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

  //  -  -  SELEZIONE INGREDIENTI  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  - 
  const [selSotto1, setSelSotto1] = useState(null)

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
                <div key={s1} onClick={() => setSelSotto1(s1)}
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
    const filteredIngs = selSotto1 === "__altri__"
      ? ungrouped
      : selSotto1 ? catIngs.filter(i => i.sotto1 === selSotto1) : catIngs

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
                    <div style={{ flex: 1, minWidth: 0 }}>
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
            <button style={btn("p", { fontSize: 12 })} onClick={() => setSendModalOpen(true)}>📤 Invia ordine</button>
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
              <div style={{ fontSize: 16, fontWeight: 700, color: STYLE.t1, marginBottom: 16 }}>📤 Invia ordine</div>
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
                  {["Tutto", ...["Carni","Pesce","Frutta e Verdura","Freschi","Surgelati","Bevande","Scatolame","Detersivi"].filter(c => spesa.some(s => !s.done && s.cat === c))].map(cat => (
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
                    <div style={{ fontSize: 11, color: STYLE.t3 }}>{f.tel ? "📱 " + f.tel : f.email ? "✉️ " + f.email : "Nessun contatto"}</div>
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
            <div key={cat} onClick={() => setSelCat(cat)}
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
                    <button onClick={() => removeItem(s.id)} style={{ background: "none", border: "none", color: STYLE.t3, cursor: "pointer", fontSize: 16, padding: "0 4px" }}>✕</button>
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
                  <button onClick={() => removeItem(s.id)} style={{ background: "none", border: "none", color: STYLE.t3, cursor: "pointer", fontSize: 16, padding: "0 4px" }}>✕</button>
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
  if (id === "fc")     return <svg {...s}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="14" y2="17"/></svg>
  if (id === "dishes") return <svg {...s}><circle cx="12" cy="12" r="9"/><path d="M9 7v10M15 7v4a2 2 0 0 1-4 0V7"/></svg>
  if (id === "dash")   return <svg {...s}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
  if (id === "spesa")  return <svg {...s}><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
  return null
}

const NAV = [
  { id: "inv",    label: "Fatture",   group: "Gestione" },
  { id: "ing",    label: "Magazzino", group: "Gestione" },
  { id: "fc",     label: "Ricette",   group: "Gestione" },
  { id: "dishes", label: "Piatti",    group: "Gestione" },
  { id: "dash",   label: "Dashboard", group: "Gestione" },
  { id: "spesa",  label: "Spesa",     group: "Gestione" },
]

export default function App() {
  const [page, setPage] = useState(() => sessionStorage.getItem("ristorai_page") || "inv")
  const [collapsed, setCollapsed] = useState(false)
  useEffect(() => { sessionStorage.setItem("ristorai_page", page) }, [page])
  const [ready, setReady] = useState(false)
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
    if (!user) return
    async function load() {
      setReady(false)
      try {
        const snap = await getDoc(doc(db, "users", user.uid, "data", "main"))
        if (snap.exists()) {
          const d = snap.data()
          if (d.ings)      setIngs(d.ings)
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
      } catch (e) { console.log("Load error:", e) }
      setReady(true)
    }
    load()
  }, [user])

  // Save data per user
  useEffect(() => {
    if (!ready || !user) return
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
          <button onClick={() => setSettingsOpen(false)} style={{ background: STYLE.el, border: "none", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", color: STYLE.t3, fontSize: 18 }}> </button>
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
        case "dash":   return <Dashboard ings={ings} dishes={dishes} isMobile={isMobile} />
        case "ing":    return <Ingredients ings={ings} setIngs={setIngs} invs={invs} isMobile={isMobile} />
        case "dishes": return <Dishes dishes={dishes} setDishes={setDishes} ings={ings} isMobile={isMobile} setPage={setPage} setEditDish={setEditDish} />
        case "inv":    return <Invoices invs={invs} setInvs={setInvs} ings={ings} setIngs={setIngs} fornitori={fornitori} setFornitori={setFornitori} learned={learned} setLearned={setLearned} isMobile={isMobile} />
        case "fc":     return <Ricette dishes={dishes} setDishes={setDishes} ings={ings} isMobile={isMobile} editDish={editDish} setEditDish={setEditDish} />
        case "spesa":  return <ListaSpesa spesa={spesa} setSpesa={setSpesa} ings={ings} fornitori={fornitori} isMobile={isMobile} />
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
          <button onClick={() => setSettingsOpen(true)} style={{ background: STYLE.el, border: STYLE.bd, borderRadius: 6, width: 32, height: 32, cursor: "pointer", color: STYLE.t2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}></button>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px 90px" }}>
        {renderPage()}
      </div>
      {settingsOpen && <SettingsPanel />}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: STYLE.surf, borderTop: STYLE.bds, display: "flex", zIndex: 100, padding: "6px 4px 16px" }}>
        {NAV.map(n => (
          <button key={n.id} onClick={() => setPage(n.id)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "6px 2px", background: page === n.id ? "rgba(90,89,99,0.25)" : "none", border: "none", borderRadius: 10, cursor: "pointer", color: page === n.id ? STYLE.t3 : STYLE.ac }}>
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
                <button key={n.id} onClick={() => setPage(n.id)} title={collapsed ? n.label : undefined}
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

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
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

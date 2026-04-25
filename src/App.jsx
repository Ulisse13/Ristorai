import { useState, useEffect } from "react"
import { db, auth, googleProvider } from "./firebase"
import { doc, getDoc, setDoc } from "firebase/firestore"
import {
  onAuthStateChanged, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signInWithPopup,
  signOut, sendPasswordResetEmail
} from "firebase/auth"

const F = n => "€ " + Number(n).toFixed(2).replace(".", ",")
const P = n => (n * 100).toFixed(1) + "%"
const D = s => new Date(s).toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" })
const FC_COLOR = (a, t) => a <= t ? "#4ade80" : a <= t * 1.1 ? "#e8a838" : "#f87171"
const uid = () => Math.random().toString(36).slice(2, 7)

const DISHES = [
  { id: "d1", name: "Petto di Pollo", cat: "secondo", price: 14, target: 0.28, cost: 3.40, fc: 0.243, margin: 10.60 },
  { id: "d2", name: "Spaghetti Pomodoro", cat: "primo", price: 11, target: 0.28, cost: 2.10, fc: 0.191, margin: 8.90 },
  { id: "d3", name: "Branzino al Forno", cat: "secondo", price: 22, target: 0.30, cost: 9.20, fc: 0.418, margin: 12.80 },
  { id: "d4", name: "Cacio e Pepe", cat: "primo", price: 13, target: 0.28, cost: 3.80, fc: 0.292, margin: 9.20 },
  { id: "d5", name: "Antipasto Misto", cat: "antipasto", price: 16, target: 0.25, cost: 3.20, fc: 0.200, margin: 12.80 },
  { id: "d6", name: "Tiramisù", cat: "dolce", price: 7, target: 0.25, cost: 1.60, fc: 0.229, margin: 5.40 },
]
const INIT_ING = [
  { id: "i1", name: "Petto di Pollo", cat: "Carni", unit: "kg", cur: 8.50, avg: 7.80 },
  { id: "i2", name: "Parmigiano Reg.", cat: "Latticini", unit: "kg", cur: 28.00, avg: 24.00 },
  { id: "i3", name: "Pasta di Semola", cat: "Pasta & Cereali", unit: "kg", cur: 1.80, avg: 1.80 },
  { id: "i4", name: "Olio EVO", cat: "Olio & Grassi", unit: "l", cur: 9.50, avg: 8.20 },
  { id: "i5", name: "Pomodori Pelati", cat: "Verdure", unit: "kg", cur: 1.20, avg: 1.20 },
  { id: "i6", name: "Branzino", cat: "Pesce", unit: "kg", cur: 18.00, avg: 15.00 },
  { id: "i7", name: "Burro", cat: "Latticini", unit: "kg", cur: 7.50, avg: 7.00 },
  { id: "i8", name: "Prosciutto Crudo", cat: "Salumi", unit: "kg", cur: 32.00, avg: 30.00 },
]
const INIT_INV = [
  { id: "v1", sup: "Carni Rossi srl", num: "2024/041", date: "2024-11-20", total: 480, vat: 43.6, net: 436.4, ok: true },
  { id: "v2", sup: "Pescheria Azzurra", num: "2024/089", date: "2024-11-18", total: 312, vat: 28.4, net: 283.6, ok: true },
  { id: "v3", sup: "Oleificio Toscano", num: "2024/012", date: "2024-11-22", total: 228, vat: 20.7, net: 207.3, ok: false },
]

const S = {
  bg: "#0d0d0f", surf: "#141417", el: "#1c1c21", ov: "#242429",
  bd: "1px solid #2a2a31", bds: "1px solid #1f1f25",
  ac: "#e8a838", acg: "rgba(232,168,56,0.12)", acd: "#b8832a",
  green: "#4ade80", gd: "rgba(74,222,128,0.12)",
  red: "#f87171", rd: "rgba(248,113,113,0.12)",
  t1: "#f0efe8", t2: "#9998a0", t3: "#5a5963",
  r: "8px", r2: "12px",
}

const css = (o) => ({ ...o })
const row = (extra) => css({ display: "flex", alignItems: "center", gap: 8, ...extra })
const col = (extra) => css({ display: "flex", flexDirection: "column", gap: 4, ...extra })
const card = (extra) => css({ background: S.surf, border: S.bds, borderRadius: S.r2, ...extra })
const btn = (variant, extra) => {
  const base = { display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: S.r, fontFamily: "inherit", fontSize: 12.5, fontWeight: 500, cursor: "pointer", border: "1px solid transparent", lineHeight: 1, whiteSpace: "nowrap" }
  const v = { p: { background: S.ac, color: "#0d0d0f", borderColor: S.ac }, s: { background: S.el, color: S.t1, borderColor: S.bd.replace("1px solid ", "") }, g: { background: "transparent", color: S.t2 } }
  return { ...base, ...(v[variant] || v.s), ...extra }
}
const inp = (extra) => css({ width: "100%", padding: "8px 11px", background: S.el, border: S.bd, borderRadius: S.r, color: S.t1, fontFamily: "inherit", fontSize: 13.5, outline: "none", boxSizing: "border-box", ...extra })
const badge = (color, extra) => {
  const colors = { g: { background: S.gd, color: S.green, borderColor: "rgba(74,222,128,0.25)" }, r: { background: S.rd, color: S.red, borderColor: "rgba(248,113,113,0.25)" }, a: { background: S.acg, color: S.ac, borderColor: S.acd }, n: { background: S.el, color: S.t2, borderColor: "#2a2a31" } }
  return { display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 8px", borderRadius: 999, fontSize: 10.5, fontWeight: 600, border: "1px solid transparent", whiteSpace: "nowrap", ...(colors[color] || colors.n), ...extra }
}

function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 999 }}>
      <div style={{ background: S.surf, border: S.bd, borderRadius: 16, width: "100%", maxWidth: 520, maxHeight: "90vh", overflow: "auto" }}>
        <div style={row({ justifyContent: "space-between", padding: "18px 22px 0" })}>
          <span style={{ fontFamily: "'Georgia',serif", fontSize: 18, color: S.t1 }}>{title}</span>
          <button onClick={onClose} style={{ background: S.el, border: S.bd, borderRadius: S.r, width: 28, height: 28, cursor: "pointer", color: S.t3, fontSize: 14 }}>x</button>
        </div>
        <div style={{ padding: "16px 22px" }}>{children}</div>
        {footer && <div style={row({ justifyContent: "flex-end", padding: "0 22px 18px" })}>{footer}</div>}
      </div>
    </div>
  )
}

function Fld({ label, children }) {
  return <div style={col({ marginBottom: 12 })}><label style={{ fontSize: 11.5, fontWeight: 500, color: S.t2 }}>{label}</label>{children}</div>
}

function Dashboard({ ings, isMobile }) {
  // Calcola variazione % tra prezzo attuale e media storica (proxy dell'acquisto precedente)
  function variation(ing) {
    const ref = ing.prev !== undefined ? ing.prev : ing.avg
    if (!ref || ref === 0) return 0
    return Math.round(((ing.cur - ref) / ref) * 1000) / 10
  }

  const withVar = ings.map(ing => ({ ...ing, var: variation(ing) }))

  const increased = withVar.filter(i => i.var > 0)
  const decreased = withVar.filter(i => i.var < 0)
  const stable    = withVar.filter(i => i.var === 0)

  // Ordine: aumenti decrescenti, poi ribassi, poi invariati
  const sorted = [
    ...increased.sort((a, b) => b.var - a.var),
    ...decreased.sort((a, b) => a.var - b.var),
    ...stable,
  ]

  return (
    <div>
      {/* Titolo */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: "'Georgia',serif", fontSize: isMobile ? 24 : 20, color: S.t1, marginBottom: 2, letterSpacing: "-0.02em" }}>
          Variazioni di prezzo
        </div>
        <div style={{ fontSize: 12, color: S.t3 }}>Aggiornato ad ogni nuova fattura</div>
      </div>

      {/* Counter riassuntivi */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
        {[
          { label: "Aumenti",  count: increased.length, color: S.red,   bg: S.rd,   symbol: "↑" },
          { label: "Ribassi",  count: decreased.length, color: S.green, bg: S.gd,   symbol: "↓" },
          { label: "Invariati",count: stable.length,    color: S.ac,    bg: S.acg,  symbol: "●" },
        ].map((k, i) => (
          <div key={i} style={{ background: k.bg, border: "1px solid " + (i === 0 ? "rgba(248,113,113,0.25)" : i === 1 ? "rgba(74,222,128,0.25)" : S.acd), borderRadius: S.r2, padding: "14px 16px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: k.color, opacity: 0.4 }} />
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: S.t3, fontWeight: 700, marginBottom: 6 }}>{k.label}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontFamily: "'Georgia',serif", fontSize: 28, color: k.color, letterSpacing: "-0.03em", lineHeight: 1 }}>{k.count}</span>
              <span style={{ fontSize: 16, color: k.color, fontWeight: 700 }}>{k.symbol}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Lista ingredienti */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {sorted.map(ing => {
          const v = ing.var
          const isUp   = v > 0
          const isDown = v < 0

          const varColor  = isUp ? S.red : isDown ? S.green : S.ac
          const varBg     = isUp ? S.rd  : isDown ? S.gd    : S.acg
          const varBorder = isUp ? "rgba(248,113,113,0.2)" : isDown ? "rgba(74,222,128,0.2)" : S.acd
          const varSymbol = isUp ? "↑" : isDown ? "↓" : "●"
          const varText   = isUp ? "+" + v.toFixed(1) + "%" : isDown ? v.toFixed(1) + "%" : "0%"

          return (
            <div key={ing.id} style={{ background: S.surf, border: "1px solid #1f1f25", borderRadius: S.r, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
              {/* Variazione */}
              <div style={{ minWidth: 60, background: varBg, border: "1px solid " + varBorder, borderRadius: 6, padding: "4px 8px", textAlign: "center", flexShrink: 0 }}>
                <div style={{ fontSize: 16, color: varColor, lineHeight: 1, fontWeight: 700 }}>{varSymbol}</div>
                <div style={{ fontSize: 10, color: varColor, fontWeight: 700, marginTop: 1 }}>{varText}</div>
              </div>

              {/* Info ingrediente */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: S.t1, marginBottom: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ing.name}</div>
                <div style={{ fontSize: 11, color: S.t3 }}>{ing.cat}</div>
              </div>

              {/* Prezzi */}
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: S.t1, fontVariantNumeric: "tabular-nums" }}>
                  {F(ing.cur)}<span style={{ fontSize: 10, color: S.t3, fontWeight: 400 }}>/{ing.unit}</span>
                </div>
                <div style={{ fontSize: 10, color: S.t3, fontVariantNumeric: "tabular-nums" }}>
                  prec. {F(ing.prev !== undefined ? ing.prev : ing.avg)}/{ing.unit}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {ings.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0", color: S.t3, fontSize: 13 }}>
          Nessun ingrediente — aggiungili dalla sezione Ingredienti
        </div>
      )}
    </div>
  )
}

function Ingredients({ ings, setIngs, isMobile }) {
  const CATS = ["Carni", "Pesce", "Verdure", "Latticini", "Surgelati", "Scatolame", "Detersivi", "Vini"]
  const VINO_TIPI = ["Rossi", "Bianchi", "Rosé", "Bollicine"]
  const VINO_REGIONI = ["Piemonte", "Toscana", "Veneto", "Sicilia", "Campania", "Sardegna", "Lombardia", "Puglia", "Calabria", "Altre regioni", "Francia"]
  const [selTipo, setSelTipo] = useState(null)
  const [selRegione, setSelRegione] = useState(null)

  const [selCat, setSelCat]     = useState(null) // null = category view
  const [open, setOpen]         = useState(false)
  const [delTarget, setDelTarget] = useState(null)
  const [edit, setEdit]         = useState(null)
  const [form, setForm]         = useState({ name: "", cat: "Carni", unit: "kg", cur: "", confPrice: "", confWeight: "", tipoVino: "Rossi", regioneVino: "Toscana" })
  const [err, setErr]           = useState({})

  const ingsByCat = cat => ings.filter(i => i.cat === cat)

  function openAdd() {
    setEdit(null)
    setForm({ name: "", cat: selCat || "Carni", unit: "kg", cur: "", confPrice: "", confWeight: "", tipoVino: "Rossi", regioneVino: "Toscana" })
    setErr({})
    setOpen(true)
  }

  function openEdit(ing) {
    setEdit(ing)
    setForm({
      name: ing.name, cat: ing.cat, unit: ing.unit,
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
      unitBase = "kg" // default — utente può cambiarlo in futuro
    } else {
      cur = +form.cur
      // Normalizza: salva sempre "l" internamente, non "litri"
      unitBase = form.unit === "litri" ? "l" : form.unit
    }

    const oldAvg = edit ? edit.avg : cur
    const newAvg = edit ? Math.round(((oldAvg * 0.7) + (cur * 0.3)) * 100) / 100 : cur
    const d = {
      name: form.name.trim(), cat: form.cat,
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

  // ── CATEGORY VIEW ──────────────────────────────
  if (!selCat) return (
    <div>
      <div style={row({ justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", alignItems: "flex-start" })}>
        <div>
          <div style={{ fontFamily: "'Georgia',serif", fontSize: 20, color: S.t1 }}>Ingredienti</div>
          <div style={{ fontSize: 12, color: S.t3 }}>{ings.length} ingredienti totali</div>
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
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: spiked > 0 ? "linear-gradient(90deg," + S.red + ",transparent)" : "linear-gradient(90deg," + S.ac + ",transparent)", opacity: 0.4 }} />
              <div style={{ fontFamily: "'Georgia',serif", fontSize: 16, color: S.t1, marginBottom: 4 }}>{cat}</div>
              <div style={{ fontSize: 12, color: S.t3 }}>{count} ingredient{count !== 1 ? "i" : "e"}</div>
              {spiked > 0 && <div style={{ fontSize: 10, color: S.red, marginTop: 4 }}>↑ {spiked} prezzi aumentati</div>}
            </div>
          )
        })}
      </div>

      {/* Add modal */}
      {open && (
        <div onClick={e => e.target === e.currentTarget && setOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 999 }}>
          <div style={{ background: S.surf, border: S.bd, borderRadius: 16, width: "100%", maxWidth: 480, maxHeight: "90vh", overflow: "auto" }}>
            <div style={row({ justifyContent: "space-between", padding: "18px 22px 0" })}>
              <span style={{ fontFamily: "'Georgia',serif", fontSize: 18, color: S.t1 }}>Nuovo ingrediente</span>
              <button onClick={() => setOpen(false)} style={{ background: S.el, border: S.bd, borderRadius: S.r, width: 28, height: 28, cursor: "pointer", color: S.t3 }}>x</button>
            </div>
            <div style={{ padding: "16px 22px" }}>
              <Fld label="Nome *">
                <input style={inp()} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="es. Petto di pollo" />
                {err.name && <span style={{ fontSize: 11, color: S.red }}>{err.name}</span>}
              </Fld>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Fld label="Categoria">
                  <select style={inp({ appearance: "none", cursor: "pointer" })} value={form.cat} onChange={e => setForm(f => ({ ...f, cat: e.target.value }))}>
                    {CATS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </Fld>
                <Fld label="Unità di misura">
                  <select style={inp({ appearance: "none", cursor: "pointer" })} value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}>
                    {["kg", "litri", "confezione", "bottiglia"].map(u => <option key={u}>{u}</option>)}
                  </select>
                </Fld>
              </div>
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
                <Fld label={"Prezzo (€/" + form.unit + ") *"}>
                  <input style={inp()} type="number" step="0.01" value={form.cur} onChange={e => setForm(f => ({ ...f, cur: e.target.value }))} placeholder="0.00" />
                  {err.cur && <span style={{ fontSize: 11, color: S.red }}>{err.cur}</span>}
                </Fld>
              ) : (
                <>
                  <div style={{ background: S.acg, border: "1px solid " + S.acd, borderRadius: S.r, padding: "10px 12px", marginBottom: 12, fontSize: 12, color: S.t2 }}>
                    Inserisci il prezzo della confezione e il peso/volume netto — il prezzo per kg/litro verrà calcolato automaticamente.
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <Fld label="Prezzo confezione (€) *">
                      <input style={inp()} type="number" step="0.01" value={form.confPrice} onChange={e => setForm(f => ({ ...f, confPrice: e.target.value }))} placeholder="0.00" />
                      {err.confPrice && <span style={{ fontSize: 11, color: S.red }}>{err.confPrice}</span>}
                    </Fld>
                    <Fld label="Peso/volume netto (kg o l) *">
                      <input style={inp()} type="number" step="0.001" value={form.confWeight} onChange={e => setForm(f => ({ ...f, confWeight: e.target.value }))} placeholder="es. 0.750" />
                      {err.confWeight && <span style={{ fontSize: 11, color: S.red }}>{err.confWeight}</span>}
                    </Fld>
                  </div>
                  {form.confPrice && form.confWeight && +form.confWeight > 0 && (
                    <div style={{ background: S.el, border: S.bd, borderRadius: S.r, padding: "10px 12px", marginBottom: 12 }}>
                      <span style={{ fontSize: 11, color: S.t3 }}>Prezzo calcolato: </span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: S.ac }}>{F(Math.round((+form.confPrice / +form.confWeight) * 100) / 100)}/kg</span>
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

  // ── VINI VIEW ──────────────────────────────────
  if (selCat === "Vini") {
    const vini = ingsByCat("Vini")
    // If no tipo selected, show tipo cards
    if (!selTipo) return (
      <div>
        <div style={row({ marginBottom: 16 })}>
          <button onClick={() => setSelCat(null)} style={{ background: "none", border: "none", color: S.ac, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, padding: 0 }}>← Ingredienti</button>
          <span style={{ color: S.t3, fontSize: 13 }}>/</span>
          <span style={{ fontSize: 13, color: S.t1, fontWeight: 600 }}>Vini</span>
        </div>
        <div style={{ fontSize: 12, color: S.t3, marginBottom: 16 }}>{vini.length} vini totali</div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 12 }}>
          {VINO_TIPI.map(tipo => {
            const count = vini.filter(v => v.tipoVino === tipo).length
            return (
              <div key={tipo} onClick={() => setSelTipo(tipo)}
                style={card({ padding: "18px 16px", cursor: "pointer", position: "relative", overflow: "hidden" })}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg," + S.ac + ",transparent)", opacity: 0.4 }} />
                <div style={{ fontFamily: "'Georgia',serif", fontSize: 16, color: S.t1, marginBottom: 4 }}>{tipo}</div>
                <div style={{ fontSize: 12, color: S.t3 }}>{count} vini</div>
              </div>
            )
          })}
        </div>
      </div>
    )
    // Tipo selected — show by regione
    const byTipo = vini.filter(v => v.tipoVino === selTipo)
    return (
      <div>
        <div style={row({ marginBottom: 16 })}>
          <button onClick={() => setSelCat(null)} style={{ background: "none", border: "none", color: S.ac, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, padding: 0 }}>← Ingredienti</button>
          <span style={{ color: S.t3, fontSize: 13 }}>/</span>
          <button onClick={() => setSelTipo(null)} style={{ background: "none", border: "none", color: S.ac, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, padding: 0 }}>Vini</button>
          <span style={{ color: S.t3, fontSize: 13 }}>/</span>
          <span style={{ fontSize: 13, color: S.t1, fontWeight: 600 }}>{selTipo}</span>
        </div>
        {byTipo.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: S.t3, fontSize: 13 }}>Nessun vino in questa tipologia</div>
        ) : (
          VINO_REGIONI.map(reg => {
            const byReg = byTipo.filter(v => v.regioneVino === reg)
            if (byReg.length === 0) return null
            return (
              <div key={reg} style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: S.t3, fontStyle: "italic", marginBottom: 8, paddingBottom: 4, borderBottom: S.bds }}>{reg}</div>
                {byReg.map(ing => (
                  <div key={ing.id} style={{ ...card({ padding: "12px 14px", marginBottom: 8 }), display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: S.t1, marginBottom: 2 }}>{ing.name}</div>
                      <div style={{ fontSize: 11, color: S.t3 }}>{F(ing.cur)}/{ing.unit}</div>
                    </div>
                    <button onClick={() => setDelTarget(ing)} style={{ background: "none", border: "none", color: S.t3, cursor: "pointer", fontSize: 15, padding: "0 4px" }}>✕</button>
                  </div>
                ))}
              </div>
            )
          })
        )}
        {delTarget && (
          <div onClick={e => e.target === e.currentTarget && setDelTarget(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 1000 }}>
            <div style={{ background: S.surf, border: S.bd, borderRadius: 14, width: "100%", maxWidth: 380, padding: "24px 24px 20px" }}>
              <div style={{ fontFamily: "'Georgia',serif", fontSize: 17, color: S.t1, marginBottom: 8 }}>Elimina ingrediente</div>
              <div style={{ fontSize: 13.5, color: S.t2, lineHeight: 1.6, marginBottom: 20 }}>Sei sicuro di voler eliminare <strong style={{ color: S.t1 }}>{delTarget.name}</strong>?</div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button style={btn("g")} onClick={() => setDelTarget(null)}>Annulla</button>
                <button style={{ ...btn("s"), background: S.rd, color: S.red, borderColor: "rgba(248,113,113,0.3)" }} onClick={() => { setIngs(prev => prev.filter(i => i.id !== delTarget.id)); setDelTarget(null) }}>Elimina</button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── INGREDIENT LIST VIEW ───────────────────────
  const list = ingsByCat(selCat)
  return (
    <div>
      {/* Breadcrumb */}
      <div style={row({ marginBottom: 16 })}>
        <button onClick={() => setSelCat(null)} style={{ background: "none", border: "none", color: S.ac, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, padding: 0 }}>
          ← Ingredienti
        </button>
        <span style={{ color: S.t3, fontSize: 13 }}>/</span>
        <span style={{ fontSize: 13, color: S.t1, fontWeight: 600 }}>{selCat}</span>
      </div>

      <div style={row({ justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap" })}>
        <div style={{ fontSize: 12, color: S.t3 }}>{list.length} ingredienti</div>
      </div>

      {list.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: S.t3, fontSize: 13 }}>
          Nessun ingrediente in questa categoria
        </div>
      ) : isMobile ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {list.map(ing => {
            const spiked = (ing.cur - ing.avg) / ing.avg > 0.10
            return (
              <div key={ing.id} style={card({ padding: "14px 16px" })}>
                <div style={row({ justifyContent: "space-between", marginBottom: 6 })}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: S.t1 }}>{ing.name}</div>
                  <button onClick={() => setDelTarget(ing)} style={{ background: "none", border: "none", color: S.t3, cursor: "pointer", fontSize: 16, padding: "0 4px" }}>✕</button>
                </div>
                <div style={row({ justifyContent: "space-between" })}>
                  <span style={{ fontSize: 14, color: spiked ? S.red : S.t2, fontWeight: spiked ? 700 : 400 }}>
                    {F(ing.cur)}/{ing.unit} {spiked ? "↑" : ""}
                  </span>
                  <span style={{ fontSize: 12, color: S.t3 }}>Media: {F(ing.avg)}/{ing.unit}</span>
                </div>
                {ing.confPrice && (
                  <div style={{ fontSize: 11, color: S.t3, marginTop: 4 }}>
                    Confezione: {F(ing.confPrice)} · {ing.confWeight}kg
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div style={{ border: S.bds, borderRadius: S.r2, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead><tr>
              {["Ingrediente", "Prezzo attuale", "Media storica", ""].map(h => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: S.t3, background: S.surf, borderBottom: S.bds }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {list.map(ing => {
                const spiked = (ing.cur - ing.avg) / ing.avg > 0.10
                return (
                  <tr key={ing.id}>
                    <td style={{ padding: "11px 16px", fontWeight: 500, color: S.t1, borderBottom: S.bds }}>
                      {ing.name}
                      {ing.confPrice && <span style={{ fontSize: 10, color: S.t3, marginLeft: 6 }}>conf. {F(ing.confPrice)}</span>}
                    </td>
                    <td style={{ padding: "10px 16px", color: spiked ? S.red : S.t1, fontWeight: spiked ? 600 : 400, borderBottom: S.bds, fontVariantNumeric: "tabular-nums" }}>
                      {F(ing.cur)}/{ing.unit} {spiked ? "↑" : ""}
                    </td>
                    <td style={{ padding: "11px 16px", color: S.t2, borderBottom: S.bds, fontVariantNumeric: "tabular-nums" }}>
                      {F(ing.avg)}/{ing.unit}
                    </td>
                    <td style={{ padding: "11px 16px", borderBottom: S.bds, textAlign: "right" }}>
                      <button onClick={() => setDelTarget(ing)} style={{ background: "none", border: "none", color: S.t3, cursor: "pointer", fontSize: 15, padding: "2px 6px" }} title="Elimina">✕</button>
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
          <div style={{ background: S.surf, border: S.bd, borderRadius: 14, width: "100%", maxWidth: 380, padding: "24px 24px 20px" }}>
            <div style={{ fontFamily: "'Georgia',serif", fontSize: 17, color: S.t1, marginBottom: 8 }}>Elimina ingrediente</div>
            <div style={{ fontSize: 13.5, color: S.t2, lineHeight: 1.6, marginBottom: 20 }}>
              Sei sicuro di voler eliminare <strong style={{ color: S.t1 }}>{delTarget.name}</strong>? L'azione non è reversibile.
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button style={btn("g")} onClick={() => setDelTarget(null)}>Annulla</button>
              <button style={{ ...btn("s"), background: S.rd, color: S.red, borderColor: "rgba(248,113,113,0.3)" }} onClick={doDelete}>Elimina</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Dishes({ dishes, setDishes, ings, isMobile }) {
  const CATS = ["Speciali", "Antipasti", "Primi", "Secondi", "Dolci", "Vini", "Cocktail"]
  const STAGIONI = ["Primavera", "Estate", "Autunno", "Inverno"]
  const VINO_TIPI = ["Rossi", "Bianchi", "Rosé", "Bollicine"]
  const VINO_REGIONI = ["Piemonte", "Toscana", "Veneto", "Sicilia", "Campania", "Sardegna", "Lombardia", "Puglia", "Calabria", "Altre regioni", "Francia"]

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


  // ── CATEGORY VIEW ──────────────────────────────
  if (!selCat) return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: "'Georgia',serif", fontSize: 20, color: S.t1, marginBottom: 2 }}>Piatti</div>
        <div style={{ fontSize: 12, color: S.t3 }}>{dishes.length} piatti nel menu — aggiunti dalla sezione Food & Drink Cost</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 12 }}>
        {CATS.map(cat => {
          const list = dishesByCat(cat)
          const overTarget = list.filter(d => d.fc > 0 && d.fc > d.target).length
          return (
            <div key={cat} onClick={() => setSelCat(cat)}
              style={{ ...card({ padding: "20px 16px", cursor: "pointer", position: "relative", overflow: "hidden" }),
                borderColor: overTarget > 0 ? "rgba(248,113,113,0.3)" : "#1f1f25" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: overTarget > 0 ? "linear-gradient(90deg," + S.red + ",transparent)" : "linear-gradient(90deg," + S.ac + ",transparent)", opacity: 0.4 }} />
              
              <div style={{ fontFamily: "'Georgia',serif", fontSize: 16, color: S.t1, marginBottom: 4 }}>{cat}</div>
              <div style={{ fontSize: 12, color: S.t3 }}>{list.length} piatt{list.length !== 1 ? "i" : "o"}</div>
              {overTarget > 0 && <div style={{ fontSize: 10, color: S.red, marginTop: 4 }}>! {overTarget} sopra target</div>}
            </div>
          )
        })}
      </div>
    </div>
  )

  // ── VINI VIEW ──────────────────────────────────
  if (selCat === "Vini") {
    const vini = dishesByCat("Vini")
    return (
      <div>
        <div style={row({ marginBottom: 20 })}>
          <button onClick={() => setSelCat(null)} style={{ background: "none", border: "none", color: S.ac, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, padding: 0 }}>← Piatti</button>
          <span style={{ color: S.t3, fontSize: 13 }}>/</span>
          <span style={{ fontSize: 13, color: S.t1, fontWeight: 600 }}>Vini</span>
        </div>
        {vini.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: S.t3, fontSize: 13 }}>
            Nessun vino presente — aggiungili dalla sezione Drink Cost
          </div>
        ) : (
          VINO_TIPI.map(tipo => {
            const byTipo = vini.filter(v => v.tipoVino === tipo)
            if (byTipo.length === 0) return null
            return (
              <div key={tipo} style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: S.t2, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12, paddingBottom: 6, borderBottom: S.bds }}>{tipo}</div>
                {VINO_REGIONI.map(reg => {
                  const byReg = byTipo.filter(v => v.regioneVino === reg)
                  if (byReg.length === 0) return null
                  return (
                    <div key={reg} style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 11, color: S.t3, marginBottom: 6, paddingLeft: 2, fontStyle: "italic" }}>{reg}</div>
                      {byReg.map(v => (
                        <div key={v.id} style={{ ...card({ padding: "12px 14px", marginBottom: 8 }) }}>
                          <div style={row({ justifyContent: "space-between", marginBottom: 8 })}>
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 600, color: S.t1 }}>{v.name}</div>
                              <div style={{ fontSize: 12, color: S.t3 }}>{v.price > 0 ? F(v.price) : "—"}</div>
                            </div>
                            <button onClick={() => setDelTarget(v)} style={{ background: "none", border: "none", color: S.t3, cursor: "pointer", fontSize: 16, padding: "0 4px" }}>✕</button>
                          </div>
                          <div style={row({ flexWrap: "wrap", gap: 4 })}>
                            {STAGIONI.map(s => (
                              <button key={s} onClick={() => toggleStagione(v, s)}
                                style={{ padding: "2px 8px", background: (v.stagioni||[]).includes(s) ? S.acg : "none", border: "1px solid " + ((v.stagioni||[]).includes(s) ? S.acd : "#2a2a31"), borderRadius: 999, color: (v.stagioni||[]).includes(s) ? S.ac : S.t3, fontFamily: "inherit", fontSize: 10, cursor: "pointer" }}>
                                {s}
                              </button>
                            ))}
                          </div>
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
          <div style={{ background: S.surf, border: S.bd, borderRadius: 14, width: "100%", maxWidth: 380, padding: "24px 24px 20px" }}>
            <div style={{ fontFamily: "'Georgia',serif", fontSize: 17, color: S.t1, marginBottom: 8 }}>Elimina piatto</div>
            <div style={{ fontSize: 13.5, color: S.t2, lineHeight: 1.6, marginBottom: 20 }}>
              Sei sicuro di voler eliminare <strong style={{ color: S.t1 }}>{delTarget.name}</strong>? L'azione non è reversibile.
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button style={btn("g")} onClick={() => setDelTarget(null)}>Annulla</button>
              <button style={{ ...btn("s"), background: S.rd, color: S.red, borderColor: "rgba(248,113,113,0.3)" }} onClick={doDelete}>Elimina definitivamente</button>
            </div>
          </div>
        </div>
      )}
      </div>
    )
  }

  // ── DISH LIST VIEW ─────────────────────────────
  const list = dishesByCat(selCat)
  return (
    <div>
      <div style={row({ marginBottom: 16 })}>
        <button onClick={() => { setSelCat(null); setDetail(null) }} style={{ background: "none", border: "none", color: S.ac, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, padding: 0 }}>← Piatti</button>
        <span style={{ color: S.t3, fontSize: 13 }}>/</span>
        <span style={{ fontSize: 13, color: S.t1, fontWeight: 600 }}>{selCat}</span>
      </div>
      <div style={{ fontSize: 12, color: S.t3, marginBottom: 14 }}>{list.length} piatt{list.length !== 1 ? "i" : "o"}</div>

      {list.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: S.t3, fontSize: 13 }}>
          Nessun piatto in questa categoria — aggiungili dalla sezione Food Cost
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {list.map(d => (
            <div key={d.id} style={card({ padding: "14px 16px" })}>
              <div style={row({ justifyContent: "space-between", marginBottom: 8 })}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: S.t1, marginBottom: 2 }}>{d.name}</div>
                  <div style={row({ gap: 10 })}>
                    <span style={{ fontSize: 13, color: S.t1, fontWeight: 600 }}>{d.price > 0 ? F(d.price) : "—"}</span>
                    {d.fc > 0 && <span style={{ fontSize: 12, color: FC_COLOR(d.fc, d.target), fontWeight: 600 }}>{P(d.fc)} FC</span>}
                    {d.cost > 0 && <span style={{ fontSize: 11, color: S.t3 }}>costo {F(d.cost)}</span>}
                  </div>
                </div>
                <button onClick={() => setDelTarget(d)} style={{ background: "none", border: "none", color: S.t3, cursor: "pointer", fontSize: 18, padding: "0 4px", flexShrink: 0 }}>✕</button>
              </div>
              {/* Food cost bar */}
              {d.fc > 0 && (
                <div style={{ height: 4, background: S.el, borderRadius: 999, overflow: "hidden", marginBottom: 10, position: "relative" }}>
                  <div style={{ height: "100%", width: Math.min(d.fc * 100, 100) + "%", background: FC_COLOR(d.fc, d.target), borderRadius: 999 }} />
                  <div style={{ position: "absolute", top: 0, bottom: 0, left: (d.target * 100) + "%", width: 1, background: S.t3 }} />
                </div>
              )}
              {/* Stagionalità */}
              <div style={{ borderTop: S.bds, paddingTop: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: S.t3, marginBottom: 6 }}>Stagionalità</div>
                <div style={row({ flexWrap: "wrap", gap: 6 })}>
                  {STAGIONI.map(s => (
                    <button key={s} onClick={() => toggleStagione(d, s)}
                      style={{ padding: "3px 10px", background: (d.stagioni||[]).includes(s) ? S.acg : "none", border: "1px solid " + ((d.stagioni||[]).includes(s) ? S.acd : "#2a2a31"), borderRadius: 999, color: (d.stagioni||[]).includes(s) ? S.ac : S.t3, fontFamily: "inherit", fontSize: 11, cursor: "pointer" }}>
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
          <div style={{ background: S.surf, border: S.bd, borderRadius: 14, width: "100%", maxWidth: 380, padding: "24px 24px 20px" }}>
            <div style={{ fontFamily: "'Georgia',serif", fontSize: 17, color: S.t1, marginBottom: 8 }}>Elimina piatto</div>
            <div style={{ fontSize: 13.5, color: S.t2, lineHeight: 1.6, marginBottom: 20 }}>
              Sei sicuro di voler eliminare <strong style={{ color: S.t1 }}>{delTarget.name}</strong>? L'azione non è reversibile.
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button style={btn("g")} onClick={() => setDelTarget(null)}>Annulla</button>
              <button style={{ ...btn("s"), background: S.rd, color: S.red, borderColor: "rgba(248,113,113,0.3)" }} onClick={doDelete}>Elimina definitivamente</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


function Invoices({ invs, setInvs, ings, setIngs, isMobile }) {
  const CATS = ["Carni", "Pesce", "Verdure", "Latticini", "Surgelati", "Scatolame", "Detersivi"]
  const GEMINI_KEY = "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"

  // step: "list" | "upload" | "loading" | "review"
  const [step, setStep]           = useState("list")
  const [detailInv, setDetailInv] = useState(null)
  const [prog, setProg]           = useState(0)
  const [progLabel, setProgLabel] = useState("")
  const [ocrError, setOcrError]   = useState(null)

  // dati fattura
  const [fattura, setFattura] = useState({ sup: "", num: "", date: "", total: "", vat: "" })
  const [fattErr, setFattErr] = useState({})

  // ingredienti trovati in fattura
  // tipo: { nome, quantita, unita, prezzoUnitario, tipo: "update"|"new", ingId, ingName, cat, include }
  const [found, setFound] = useState([])

  function reset() {
    setStep("list"); setProg(0); setProgLabel(""); setOcrError(null)
    setFattura({ sup: "", num: "", date: "", total: "", vat: "" })
    setFattErr({}); setFound([])
  }

  // ── Comprimi immagine ─────────────────────────────
  async function compressImage(file) {
    return new Promise((res) => {
      try {
        const img = new Image()
        const url = URL.createObjectURL(file)
        img.onload = () => {
          try {
            const MAX_W = 2000, MAX_H = 2800
            let w = img.width, h = img.height
            if (w > MAX_W) { h = Math.round(h * MAX_W / w); w = MAX_W }
            if (h > MAX_H) { w = Math.round(w * MAX_H / h); h = MAX_H }
            const canvas = document.createElement("canvas")
            canvas.width = w; canvas.height = h
            canvas.getContext("2d").drawImage(img, 0, 0, w, h)
            URL.revokeObjectURL(url)
            canvas.toBlob(blob => res(blob || file), "image/jpeg", 0.92)
          } catch(e) { URL.revokeObjectURL(url); res(file) }
        }
        img.onerror = () => { URL.revokeObjectURL(url); res(file) }
        img.src = url
      } catch(e) { res(file) }
    })
  }

  // ── Analisi OCR ───────────────────────────────────
  async function handleFile(f) {
    if (!f) return
    setStep("loading"); setProg(5); setProgLabel("Preparazione immagine..."); setOcrError(null)

    try {
      // Samsung può restituire f.type vuoto — assumiamo immagine
      const typeGuess = f.type || (f.name && f.name.toLowerCase().endsWith(".pdf") ? "application/pdf" : "image/jpeg")
      const isImage = typeGuess.startsWith("image/")
      const isPdf   = typeGuess === "application/pdf"
      if (!isImage && !isPdf) {
        setOcrError("Formato non supportato. Usa JPG, PNG o PDF.")
        setStep("upload"); return
      }

      // Comprimi sempre
      setProg(15); setProgLabel("Compressione immagine...")
      const fileToSend = isImage ? await compressImage(f) : f

      setProg(30); setProgLabel("Lettura immagine...")
      const base64 = await new Promise((res, rej) => {
        const reader = new FileReader()
        reader.onload  = () => res(reader.result.split(",")[1])
        reader.onerror = () => rej(new Error("Lettura file fallita"))
        reader.readAsDataURL(fileToSend)
      })

      setProg(50); setProgLabel("Invio a Groq AI...")
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 30000)
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + GEMINI_KEY
          },
          body: JSON.stringify({
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            messages: [{
              role: "user",
              content: [
                {
                  type: "image_url",
                  image_url: { url: "data:" + (isPdf ? "application/pdf" : "image/jpeg") + ";base64," + base64 }
                },
                {
                  type: "text",
                  text: 'Sei un esperto contabile italiano specializzato in fatture e bolle di consegna. Analizza questo documento con attenzione. PUO contenere piu documenti/sezioni sullo stesso foglio. ISTRUZIONI: 1) Estrai il nome del fornitore in alto. 2) Usa la prima data trovata. 3) Leggi OGNI riga prodotto da TUTTE le sezioni del documento. 4) Per ogni prodotto: estrai nome descrittivo (senza codici numerici), quantita, unita di misura, e calcola prezzo unitario per kg o litro (PREZZO diviso per QTA.V). 5) Somma TUTTI i TOTALE DOCUMENTO per il totale finale. 6) Somma tutta la IVA. 7) Includi anche prodotti non alimentari come detersivi, materiali pulizia. Rispondi SOLO con JSON valido senza markdown ne backtick: {"fornitore":"nome","numero":"numero","data":"YYYY-MM-DD","totale":0.00,"iva":0.00,"prodotti":[{"nome":"nome prodotto senza codice","quantita":0.0,"unita":"kg","prezzoUnitario":0.00}]}'
                }
              ]
            }],
            max_tokens: 1024
          })
        }
      )

      clearTimeout(timeout)
      setProg(80); setProgLabel("Analisi risposta AI...")
      const data = await response.json()

      if (data.error) throw new Error(data.error.message || "Errore Groq")

      const raw = data.choices?.[0]?.message?.content || ""
      if (!raw) throw new Error("Nessuna risposta da Groq")

      // Pulizia e parsing JSON sicuro
      const jsonMatch = raw.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error("Gemini non ha restituito un JSON valido")
      let parsed
      try {
        parsed = JSON.parse(jsonMatch[0])
      } catch(parseErr) {
        throw new Error("JSON malformato da Gemini — riprova o migliora la foto")
      }

      setProg(90); setProgLabel("Confronto con magazzino...")

      // Compila campi fattura
      setFattura({
        sup:   parsed.fornitore || "",
        num:   parsed.numero    || "",
        date:  parsed.data      || "",
        total: parsed.totale ? String(parsed.totale) : "",
        vat:   parsed.iva    ? String(parsed.iva)    : "",
      })

      // Auto-categorizzazione ingrediente per nome (categorie aggiornate)
      function guessCat(nome) {
        const n = nome.toLowerCase()
        if (/detersiv|sapone|piatti|bucato|ammorbident|candegg|disinfett|multiuso|sgrassator|lavastoviglie|lavatrice|spugna|strofinaccio|carta igien|scottex|sacchetti|brillantante|wc gel|disincrost|panno|bobina|guanti nitr|tovaglioli/.test(n)) return "Detersivi"
        if (/surgelat|gelo|gelato|congelat|misto mare surgelato|verdure surgelate|piselli surgelati|fagiolini surgelati|spinaci gelo|mais surgelato/.test(n)) return "Surgelati"
        if (/pelati|passata|conserva|tonno scatola|sardine scatola|fagioli scatola|ceci scatola|lenticchie scatola|acciughe scatola|pomodori scatola|sugo pronto|legumi/.test(n)) return "Scatolame"
        if (/vino |vini |barolo|barbaresco|barbera|nebbiolo|chianti|brunello|amarone|prosecco|franciacorta|pinot grigio|pinot nero|vermentino|nero d.avola|montepulciano|primitivo|sangiovese|soave|lugana|gewurz|riesling|chardonnay|sauvignon|merlot|cabernet|syrah|champagne|bordeaux|borgogna|alsace|côtes|chablis|rosso di|bianco di|bollicine|spumante|cava/.test(n)) return "Vini"
        if (/pollo|manzo|maiale|vitello|agnello|coniglio|tacchino|salsicc|wurstel|cotechino|pancetta|lardo|guanciale|girello|fesa|bistecca|braciola|arrosto|spezzatino|macinato|cinghiale|anatra|piccione|quaglia|prosciutto|salame|mortadella|bresaola|coppa|speck|roast.beef|noce b/.test(n)) return "Carni"
        if (/pesce|merluzzo|salmone|tonno|branzino|orata|sogliola|baccalà|acciuga|sarda|cozze|vongole|gamberi|scampi|calamari|polpo|seppia|aragosta|astice|granchio|anguilla|dentice|spigola/.test(n)) return "Pesce"
        if (/pomodor|insalata|lattuga|zucchine|melanzane|peperone|cipolla|aglio|carota|sedano|finocchio|broccoli|cavolfiore|asparagi|funghi|radicchio|rucola|spinaci|patate|bietola|carciofo|piselli|fagiolini|mais|zucca|porri|cetrioli|avocado|verdura|fave/.test(n)) return "Verdure"
        if (/parmigiano|mozzarella|grana|pecorino|burro|latte|panna|yogurt|ricotta|fontina|asiago|brie|gorgonzola|provolone|scamorza|mascarpone|formaggio|uova|uovo|toma|tuorlo/.test(n)) return "Latticini"
        return "Scatolame"
      }

      function guessTipoVino(nome) {
        const n = nome.toLowerCase()
        if (/prosecco|franciacorta|spumante|bollicine|champagne|cava|metodo classico|perlage/.test(n)) return "Bollicine"
        if (/rosato|rosé|cerasuolo|ramato/.test(n)) return "Rosé"
        if (/bianco|pinot grigio|vermentino|soave|lugana|chardonnay|sauvignon|gewurz|riesling|chablis|borgogna blanc|vernaccia|trebbiano|greco di|fiano|pecorino/.test(n)) return "Bianchi"
        return "Rossi"
      }

      function guessRegioneVino(nome) {
        const n = nome.toLowerCase()
        if (/barolo|barbaresco|barbera|nebbiolo|moscato|asti|langhe|piemonte/.test(n)) return "Piemonte"
        if (/chianti|brunello|vernaccia|bolgheri|morellino|toscana|supertuscan/.test(n)) return "Toscana"
        if (/prosecco|soave|amarone|valpolicella|bardolino|lugana|veneto/.test(n)) return "Veneto"
        if (/nero d.avola|nerello|etna|sicilia/.test(n)) return "Sicilia"
        if (/aglianico|greco di tufo|fiano|campania|taurasi/.test(n)) return "Campania"
        if (/vermentino|cannonau|sardegna|carignano/.test(n)) return "Sardegna"
        if (/franciacorta|oltrepò|lombardia/.test(n)) return "Lombardia"
        if (/primitivo|negroamaro|puglia|salice/.test(n)) return "Puglia"
        if (/cirò|calabria|gaglioppo/.test(n)) return "Calabria"
        if (/champagne|bordeaux|borgogna|alsace|côtes|chablis|france|loire|rhône/.test(n)) return "Francia"
        return "Altre regioni"
      }

      // Analisi prodotti
      const prodotti = parsed.prodotti || []
      const foundList = prodotti.filter(p => p && p.nome).map(p => {
        const nameLow = p.nome.toLowerCase().trim()
        const existing = ings.find(i =>
          i.name.toLowerCase().includes(nameLow) ||
          nameLow.includes(i.name.toLowerCase().split(" ")[0])
        )
        if (existing) {
          return {
            nome: p.nome, quantita: p.quantita, unita: p.unita,
            prezzoUnitario: p.prezzoUnitario,
            tipo: "update", ingId: existing.id, ingName: existing.name,
            cat: existing.cat, include: true
          }
        } else {
          const cat = guessCat(p.nome)
          return {
            nome: p.nome, quantita: p.quantita, unita: p.unita,
            prezzoUnitario: p.prezzoUnitario,
            tipo: "new", ingId: null, ingName: null,
            cat, include: true,
            ...(cat === "Vini" ? { tipoVino: guessTipoVino(p.nome), regioneVino: guessRegioneVino(p.nome) } : {})
          }
        }
      })

      setFound(foundList)
      setProg(100); setProgLabel("Completato!")
      setStep("review")

    } catch(e) {
      const msg = e.name === "AbortError"
        ? "Timeout: Gemini non ha risposto in 30 secondi. Riprova."
        : "Errore OCR: " + e.message
      setOcrError(msg)
      setStep("upload")
    }
  }

  // ── Salva tutto ───────────────────────────────────
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
        return { ...ing, prev: ing.cur, cur: newCur, avg: newAvg }
      }))
    }

    // Aggiungi nuovi ingredienti
    const toAdd = toProcess.filter(p => p.tipo === "new")
    if (toAdd.length > 0) {
      const newIngs = toAdd.map(p => ({
        id: "i" + uid(),
        name: p.nome,
        cat: p.cat,
        unit: p.cat === "Vini" ? "bottiglia" : (p.unita || "kg"),
        cur: p.prezzoUnitario,
        avg: p.prezzoUnitario,
        ...(p.cat === "Vini" ? { tipoVino: p.tipoVino || "Rossi", regioneVino: p.regioneVino || "Altre regioni" } : {})
      }))
      setIngs(prev => [...prev, ...newIngs])
    }

    // Salva fattura
    const v = +fattura.vat || 0
    setInvs(prev => [{
      id: "v" + uid(), sup: fattura.sup, num: fattura.num,
      date: fattura.date, total: +fattura.total,
      vat: v, net: +fattura.total - v, ok: true,
      prodotti: found.filter(p => p.include).map(p => ({
        nome: p.nome, quantita: p.quantita, unita: p.unita, prezzoUnitario: p.prezzoUnitario
      }))
    }, ...prev])

    reset()
  }

  // ── RENDER ────────────────────────────────────────
  const updCount = found.filter(p => p.include && p.tipo === "update").length
  const newCount = found.filter(p => p.include && p.tipo === "new").length

  return (
    <div>
      {/* Header */}
      <div style={row({ justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", alignItems: "flex-start" })}>
        <div>
          <div style={{ fontFamily: "'Georgia',serif", fontSize: 20, color: S.t1 }}>Fatture</div>
          <div style={{ fontSize: 12, color: S.t3 }}>{invs.length} fatture — OCR con Groq AI</div>
        </div>
        {step === "list" && <button style={btn("p")} onClick={() => setStep("upload")}>+ Carica fattura</button>}
        {step !== "list" && <button style={btn("g")} onClick={reset}>← Annulla</button>}
      </div>

      {/* ── STEP: UPLOAD ── */}
      {step === "upload" && (
        <div style={card({ padding: 24, maxWidth: 500 })}>
          <div style={{ fontFamily: "'Georgia',serif", fontSize: 16, color: S.t1, marginBottom: 16 }}>Scatta o carica la foto della fattura</div>
          {ocrError && (
            <div style={{ marginBottom: 14, padding: "10px 14px", background: S.rd, border: "1px solid rgba(248,113,113,0.3)", borderRadius: 6, fontSize: 13, color: S.red }}>{ocrError}</div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <label style={{ display: "block", border: "2px dashed #2a2a31", borderRadius: 10, padding: 28, textAlign: "center", cursor: "pointer", background: S.el }}>
              <input type="file" accept="image/*" capture="environment"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
                style={{ display: "none" }}
              />
              <div style={{ fontSize: 32, marginBottom: 8 }}></div>
              <div style={{ fontSize: 15, fontWeight: 600, color: S.t1, marginBottom: 4 }}>Scatta una foto</div>
              <div style={{ fontSize: 12, color: S.t3 }}>Apre direttamente la fotocamera</div>
            </label>
            <label style={{ display: "block", border: "2px dashed #2a2a31", borderRadius: 10, padding: 20, textAlign: "center", cursor: "pointer", background: S.el }}>
              <input type="file" accept="image/*,.pdf"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
                style={{ display: "none" }}
              />
              <div style={{ fontSize: 22, marginBottom: 6 }}></div>
              <div style={{ fontSize: 13, fontWeight: 600, color: S.t2, marginBottom: 2 }}>Scegli dalla galleria o PDF</div>
              <div style={{ fontSize: 11, color: S.t3 }}>JPG, PNG o PDF</div>
            </label>
            <div style={{ fontSize: 11, color: S.t3, textAlign: "center" }}>Le immagini vengono compresse automaticamente</div>
          </div>
        </div>
      )}

      {/* ── STEP: LOADING ── */}
      {step === "loading" && (
        <div style={card({ padding: 32, maxWidth: 500 })}>
          <div style={{ fontFamily: "'Georgia',serif", fontSize: 16, color: S.t1, marginBottom: 20, textAlign: "center" }}>Analisi in corso...</div>
          <div style={{ height: 6, background: S.el, borderRadius: 999, overflow: "hidden", marginBottom: 12 }}>
            <div style={{ height: "100%", width: prog + "%", background: S.ac, borderRadius: 999, transition: "width 0.4s ease" }} />
          </div>
          <div style={{ fontSize: 13, color: S.t3, textAlign: "center" }}>{progLabel}</div>
          <div style={{ fontSize: 11, color: S.t3, textAlign: "center", marginTop: 8 }}>{prog}%</div>
        </div>
      )}

      {/* ── STEP: REVIEW ── */}
      {step === "review" && (
        <div style={{ maxWidth: 600 }}>
          {/* Riepilogo */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
            {[
              { l: "Fattura", v: fattura.sup || "—", sub: fattura.num },
              { l: "Prezzi aggiornati", v: String(updCount), sub: "ingredienti esistenti", c: updCount > 0 ? S.green : S.t3 },
              { l: "Nuovi ingredienti", v: String(newCount), sub: "da aggiungere", c: newCount > 0 ? S.ac : S.t3 },
            ].map((k, i) => (
              <div key={i} style={card({ padding: "12px 14px" })}>
                <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", color: S.t3, fontWeight: 600, marginBottom: 4 }}>{k.l}</div>
                <div style={{ fontFamily: "'Georgia',serif", fontSize: 20, color: k.c || S.t1 }}>{k.v}</div>
                <div style={{ fontSize: 10, color: S.t3 }}>{k.sub}</div>
              </div>
            ))}
          </div>

          {/* Dati fattura */}
          <div style={card({ padding: 16, marginBottom: 14 })}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: S.t3, marginBottom: 12 }}>Dati fattura</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ gridColumn: "1/-1" }}>
                <Fld label="Fornitore *">
                  <input style={inp()} value={fattura.sup} onChange={e => setFattura(f => ({ ...f, sup: e.target.value }))} placeholder="es. Carni Rossi srl" />
                  {fattErr.sup && <span style={{ fontSize: 11, color: S.red }}>{fattErr.sup}</span>}
                </Fld>
              </div>
              <Fld label="N° Fattura *">
                <input style={inp()} value={fattura.num} onChange={e => setFattura(f => ({ ...f, num: e.target.value }))} placeholder="2024/001" />
                {fattErr.num && <span style={{ fontSize: 11, color: S.red }}>{fattErr.num}</span>}
              </Fld>
              <Fld label="Data *">
                <input style={inp()} type="date" value={fattura.date} onChange={e => setFattura(f => ({ ...f, date: e.target.value }))} />
                {fattErr.date && <span style={{ fontSize: 11, color: S.red }}>{fattErr.date}</span>}
              </Fld>
              <Fld label="Totale €">
                <input style={inp()} type="number" step="0.01" value={fattura.total} onChange={e => setFattura(f => ({ ...f, total: e.target.value }))} placeholder="0.00" />
                {fattErr.total && <span style={{ fontSize: 11, color: S.red }}>{fattErr.total}</span>}
              </Fld>
              <Fld label="IVA €">
                <input style={inp()} type="number" step="0.01" value={fattura.vat} onChange={e => setFattura(f => ({ ...f, vat: e.target.value }))} placeholder="0.00" />
              </Fld>
            </div>
          </div>

          {/* Prodotti trovati */}
          {found.length > 0 && (
            <div style={card({ padding: 16, marginBottom: 16 })}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: S.t3, marginBottom: 12 }}>
                Prodotti trovati in fattura
              </div>
              {found.map((p, i) => (
                <div key={i} style={{ padding: "12px 0", borderBottom: i < found.length - 1 ? S.bds : "none" }}>
                  <div style={row({ justifyContent: "space-between", marginBottom: p.tipo === "new" ? 8 : 0 })}>
                    <div style={{ flex: 1 }}>
                      <div style={row({ gap: 6, marginBottom: 3 })}>
                        <span style={badge(p.tipo === "update" ? "g" : "a")}>
                          {p.tipo === "update" ? "↑ Aggiorna" : "+ Nuovo"}
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: S.t1 }}>{p.nome}</span>
                      </div>
                      <div style={{ fontSize: 11, color: S.t3 }}>
                        {p.quantita} {p.unita} — {F(p.prezzoUnitario)}/{p.unita}
                        {p.tipo === "update" && <span style={{ color: S.green }}> → {p.ingName}</span>}
                      </div>
                    </div>
                    <input type="checkbox" checked={p.include}
                      onChange={e => setFound(prev => prev.map((x, j) => j === i ? { ...x, include: e.target.checked } : x))}
                      style={{ width: 18, height: 18, cursor: "pointer", accentColor: S.ac, flexShrink: 0 }}
                    />
                  </div>
                  {p.tipo === "new" && p.include && (
                    <div style={{ marginTop: 6 }}>
                      <label style={{ fontSize: 11, color: S.t2, marginBottom: 3, display: "block" }}>Categoria</label>
                      <select style={inp({ appearance: "none", cursor: "pointer", fontSize: 12.5 })}
                        value={p.cat}
                        onChange={e => setFound(prev => prev.map((x, j) => j === i ? { ...x, cat: e.target.value } : x))}>
                        {CATS.map(c => <option key={c}>{c}</option>)}
                      </select>
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

      {/* ── DETTAGLIO FATTURA ── */}
      {detailInv && (
        <div onClick={e => e.target === e.currentTarget && setDetailInv(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "28px 20px", zIndex: 999, overflowY: "auto" }}>
          <div style={{ background: S.surf, border: S.bd, borderRadius: 16, width: "100%", maxWidth: 520, margin: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px 0" }}>
              <div style={{ fontFamily: "'Georgia',serif", fontSize: 18, color: S.t1 }}>{detailInv.sup}</div>
              <button onClick={() => setDetailInv(null)} style={{ background: S.el, border: S.bd, borderRadius: S.r, width: 28, height: 28, cursor: "pointer", color: S.t3 }}>x</button>
            </div>
            <div style={{ padding: "16px 22px" }}>
              {/* KPI */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
                {[
                  { l: "Data", v: D(detailInv.date) },
                  { l: "N° Fattura", v: detailInv.num || "—" },
                  { l: "Totale", v: F(detailInv.total) },
                  { l: "IVA", v: F(detailInv.vat || 0) },
                  { l: "Imponibile", v: F(detailInv.net || 0) },
                  { l: "Stato", v: "Elaborata" },
                ].map((k, i) => (
                  <div key={i} style={{ background: S.el, border: S.bd, borderRadius: S.r, padding: "10px 12px" }}>
                    <div style={{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.08em", color: S.t3, fontWeight: 600, marginBottom: 3 }}>{k.l}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: S.t1 }}>{k.v}</div>
                  </div>
                ))}
              </div>

              {/* Prodotti con prezzo modificabile */}
              {detailInv.prodotti && detailInv.prodotti.length > 0 && (
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: S.t3, marginBottom: 8 }}>
                    Prodotti — modifica prezzo se necessario
                  </div>
                  <div style={{ border: S.bd, borderRadius: S.r, overflow: "hidden" }}>
                    {detailInv.prodotti.map((p, i) => (
                      <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 80px 90px", gap: 8, padding: "10px 14px", borderBottom: i < detailInv.prodotti.length - 1 ? S.bds : "none", alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: S.t1 }}>{p.nome}</div>
                          <div style={{ fontSize: 11, color: S.t3 }}>{p.quantita} {p.unita}</div>
                        </div>
                        <span style={{ fontSize: 12, color: S.t2 }}>{p.unita}</span>
                        <input type="number" step="0.01" min="0"
                          defaultValue={p.prezzoUnitario}
                          onBlur={e => {
                            const newPrice = parseFloat(e.target.value)
                            if (!isNaN(newPrice) && newPrice !== p.prezzoUnitario) {
                              setInvs(prev => prev.map(inv => inv.id === detailInv.id
                                ? { ...inv, prodotti: inv.prodotti.map((x, j) => j === i ? { ...x, prezzoUnitario: newPrice } : x) }
                                : inv
                              ))
                              setDetailInv(prev => ({ ...prev, prodotti: prev.prodotti.map((x, j) => j === i ? { ...x, prezzoUnitario: newPrice } : x) }))
                            }
                          }}
                          style={{ ...inp({ fontSize: 12.5, padding: "6px 8px" }) }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {(!detailInv.prodotti || detailInv.prodotti.length === 0) && (
                <div style={{ textAlign: "center", padding: "20px 0", color: S.t3, fontSize: 13 }}>
                  Nessun prodotto salvato per questa fattura
                </div>
              )}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 22px 18px" }}>
              <button style={{ ...btn("g", { fontSize: 12 }), color: S.red }}
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

      {/* ── LISTA FATTURE ── */}
      {step === "list" && (
        <>
          {isMobile ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {invs.map(inv => (
                <div key={inv.id} style={card({ padding: "16px", cursor: "pointer" })} onClick={() => setDetailInv(inv)}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: S.t1 }}>{inv.sup}</div>
                    <span style={badge("g")}>Elaborata</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, color: S.t3 }}>{D(inv.date)} · {inv.num}</span>
                    <span style={{ fontSize: 18, fontWeight: 700, color: S.t1 }}>{F(inv.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ border: S.bds, borderRadius: S.r2, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead><tr>{["Data", "Fornitore", "N° Fattura", "Imponibile", "Totale"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: S.t3, background: S.surf, borderBottom: S.bds }}>{h}</th>
                ))}</tr></thead>
                <tbody>{invs.map(inv => (
                  <tr key={inv.id} onClick={() => setDetailInv(inv)} style={{ cursor: "pointer" }}
                    onMouseEnter={e => { for (const td of e.currentTarget.cells) td.style.background = S.el }}
                    onMouseLeave={e => { for (const td of e.currentTarget.cells) td.style.background = "" }}>
                    <td style={{ padding: "11px 16px", fontWeight: 500, color: S.t1, borderBottom: S.bds }}>{D(inv.date)}</td>
                    <td style={{ padding: "11px 16px", fontWeight: 500, color: S.t1, borderBottom: S.bds }}>{inv.sup}</td>
                    <td style={{ padding: "11px 16px", color: S.t3, borderBottom: S.bds }}>{inv.num}</td>
                    <td style={{ padding: "11px 16px", color: S.t2, borderBottom: S.bds, fontVariantNumeric: "tabular-nums" }}>{F(inv.net)}</td>
                    <td style={{ padding: "11px 16px", fontWeight: 600, color: S.t1, borderBottom: S.bds, fontVariantNumeric: "tabular-nums" }}>{F(inv.total)}</td>
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

function FoodCost({ dishes, setDishes, ings, isMobile }) {
  const [tab, setTab] = useState("food") // "food" | "drink"

  // ── Shared ────────────────────────────────────
  const FOOD_CATS = ["Speciali", "Antipasti", "Primi", "Secondi", "Dolci", "Cocktail"]
  const VINO_TIPI = ["Rossi", "Bianchi", "Rosé", "Bollicine"]
  const VINO_REGIONI = ["Piemonte", "Toscana", "Veneto", "Sicilia", "Campania", "Sardegna", "Lombardia", "Puglia", "Calabria", "Altre regioni", "Francia"]
  const UNITS = ["kg", "g", "l", "ml", "pz"]
  const r2 = n => Math.round(n * 100) / 100
  const uid2 = () => Math.random().toString(36).slice(2, 7)

  function toIngUnit(qty, rowUnit, ingUnit) {
    // Normalizza unità
    const norm = u => {
      if (!u) return "kg"
      const s = u.toLowerCase().trim()
      if (s === "litri" || s === "liter" || s === "litre") return "l"
      if (s === "bottiglia") return "bottiglia"
      return s
    }
    const ru = norm(rowUnit)
    const iu = norm(ingUnit)
    if (ru === iu) return qty
    if (ru === "g"  && iu === "kg") return qty / 1000
    if (ru === "kg" && iu === "g")  return qty * 1000
    if (ru === "ml" && iu === "l")  return qty / 1000
    if (ru === "l"  && iu === "ml") return qty * 1000
    // Se unità incompatibili (es. g vs l) restituisce qty senza conversione
    return qty
  }

  // ── FOOD COST state ───────────────────────────
  const [fForm, setFForm]     = useState({ name: "", cat: "Secondi", ricarico: "300" })
  const [fRecipe, setFRecipe] = useState([{ id: uid2(), ingId: "", qty: "", unit: "g", waste: "0" }])
  const [fErr, setFErr]       = useState({})
  const [fSaved, setFSaved]   = useState(false)

  const fLiveCost = fRecipe.reduce((sum, row) => {
    const ing = ings.find(i => i.id === row.ingId)
    if (!ing || !row.qty) return sum
    const qty = parseFloat(row.qty) || 0
    const wasteMult = 1 + (parseFloat(row.waste) || 0) / 100
    return sum + toIngUnit(qty, row.unit, ing.unit) * ing.cur * wasteMult
  }, 0)
  const fRicarico  = parseFloat(fForm.ricarico) || 300
  const fSugPrice  = fLiveCost * (1 + fRicarico / 100)
  const fMargin    = fSugPrice - fLiveCost
  const fFoodCostPct = fSugPrice > 0 ? fLiveCost / fSugPrice : 0

  function fAddRow()    { setFRecipe(r => [...r, { id: uid2(), ingId: "", qty: "", unit: "g", waste: "0" }]) }
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
    const catMap = { Speciali: "speciale", Antipasti: "antipasto", Primi: "primo", Secondi: "secondo", Dolci: "dolce", Cocktail: "cocktail" }
    const savedRecipe = fRecipe.filter(r => r.ingId).map(r => ({
      ingId: r.ingId, qty: parseFloat(r.qty) || 0, unit: r.unit, waste: r.waste || "0"
    }))
    setDishes(prev => [...prev, {
      id: "d" + uid2(), name: fForm.name.trim(),
      cat: catMap[fForm.cat] || fForm.cat.toLowerCase(),
      price, target: fFoodCostPct, cost, fc, margin: r2(fMargin),
      recipe: savedRecipe, stagioni: []
    }])
    setFForm({ name: "", cat: "Secondi", ricarico: "300" })
    setFRecipe([{ id: uid2(), ingId: "", qty: "", unit: "g", waste: "0" }])
    setFErr({})
    setFSaved(true)
    setTimeout(() => setFSaved(false), 3000)
  }

  // ── DRINK COST state ──────────────────────────
  const [dForm, setDForm] = useState({
    name: "", tipo: "Rossi", regione: "Toscana",
    bottlePrice: "", iva: "10", ricarico: "200",
    calici: "6", isVino: true, selIngId: ""
  })
  const [dErr, setDErr]   = useState({})
  const [dSaved, setDSaved] = useState(false)

  const viniIng = ings.filter(i => i.cat === "Vini")

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

  const dPriceNet  = dForm.bottlePrice ? (+dForm.bottlePrice / (1 + (+dForm.iva || 0) / 100)) : 0
  const dSellBottle = r2(dPriceNet * (1 + (+dForm.ricarico || 0) / 100))
  const dSellCalice = dForm.calici > 0 ? r2(dSellBottle / +dForm.calici) : 0

  function dSave() {
    const e = {}
    if (!dForm.name.trim()) e.name = "Obbligatorio"
    if (!dForm.bottlePrice || +dForm.bottlePrice <= 0) e.bottlePrice = "Prezzo > 0"
    if (Object.keys(e).length) { setDErr(e); return }

    const isVino = dForm.tipo !== "Cocktail"
    setDishes(prev => [...prev, {
      id: "d" + uid2(),
      name: dForm.name.trim(),
      cat: isVino ? "vino" : "cocktail",
      price: isVino ? dSellCalice : dSellBottle,
      priceBottle: dSellBottle,
      priceCalice: dSellCalice,
      target: 0, cost: r2(dPriceNet / (isVino ? +dForm.calici : 1)), fc: 0, margin: 0,
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

  // ── RENDER ─────────────────────────────────────
  return (
    <div>
      {/* Header + tabs */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: "'Georgia',serif", fontSize: 20, color: S.t1, marginBottom: 12 }}>Food & Drink Cost</div>
        <div style={row({ gap: 0 })}>
          {[["food", "Food Cost"], ["drink", "Drink Cost"]].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              style={{ padding: "8px 20px", background: tab === id ? S.ac : S.el, color: tab === id ? "#0d0d0f" : S.t2, border: "none", fontFamily: "inherit", fontSize: 13, fontWeight: tab === id ? 700 : 400, cursor: "pointer", borderRadius: id === "food" ? "8px 0 0 8px" : "0 8px 8px 0" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── TAB: FOOD COST ── */}
      {tab === "food" && (
        <div style={{ maxWidth: 600 }}>
          {fSaved && (
            <div style={{ marginBottom: 16, padding: "10px 14px", background: S.gd, border: "1px solid rgba(74,222,128,0.3)", borderRadius: 8, fontSize: 13, color: S.green }}>
              Piatto salvato e aggiunto alla sezione Piatti ✓
            </div>
          )}

          {/* Info piatto */}
          <div style={card({ padding: 16, marginBottom: 14 })}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: S.t3, marginBottom: 12 }}>Dati piatto</div>
            <Fld label="Nome piatto *">
              <input style={inp()} value={fForm.name} onChange={e => setFForm(f => ({ ...f, name: e.target.value }))} placeholder="es. Filetto al pepe verde" />
              {fErr.name && <span style={{ fontSize: 11, color: S.red }}>{fErr.name}</span>}
            </Fld>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <Fld label="Categoria">
                <select style={inp({ appearance: "none", cursor: "pointer" })} value={fForm.cat} onChange={e => setFForm(f => ({ ...f, cat: e.target.value }))}>
                  {FOOD_CATS.map(c => <option key={c}>{c}</option>)}
                </select>
              </Fld>
              <Fld label="Ricarico %">
                <select style={inp({ appearance: "none", cursor: "pointer" })} value={fForm.ricarico} onChange={e => setFForm(f => ({ ...f, ricarico: e.target.value }))}>
                  {["100","150","200","250","300","350","400","450","500","600","700"].map(v => <option key={v}>{v}</option>)}
                </select>
              </Fld>
              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <div style={{ background: S.acg, border: "1px solid " + S.acd, borderRadius: S.r, padding: "9px 12px", width: "100%" }}>
                  <div style={{ fontSize: 9.5, textTransform: "uppercase", color: S.t3, fontWeight: 600, marginBottom: 3 }}>Prezzo consigliato</div>
                  <div style={{ fontFamily: "'Georgia',serif", fontSize: 20, color: S.ac }}>{fLiveCost > 0 ? F(fSugPrice) : "—"}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Ricetta */}
          <div style={card({ padding: 16, marginBottom: 14 })}>
            <div style={row({ justifyContent: "space-between", marginBottom: 10 })}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: S.t3 }}>Ingredienti ricetta</div>
              <button style={btn("g", { fontSize: 12, padding: "4px 10px" })} onClick={fAddRow}>+ Aggiungi</button>
            </div>
            {fErr.recipe && <div style={{ fontSize: 11, color: S.red, marginBottom: 8 }}>{fErr.recipe}</div>}

            {/* Header colonne */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 70px 60px 70px 80px 24px", gap: 6, padding: "5px 6px", background: S.el, borderRadius: "6px 6px 0 0", border: S.bd, borderBottom: "none" }}>
              {["Ingrediente", "Qtà", "Um", "Scarto", "Costo", ""].map(h => (
                <span key={h} style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: S.t3 }}>{h}</span>
              ))}
            </div>
            <div style={{ border: S.bd, borderRadius: "0 0 6px 6px", overflow: "hidden" }}>
              {fRecipe.map((row, idx) => {
                const ing = ings.find(i => i.id === row.ingId)
                const qty = parseFloat(row.qty) || 0
                const wasteMult = 1 + (parseFloat(row.waste) || 0) / 100
                const lineQty = ing ? toIngUnit(qty, row.unit, ing.unit) : qty
                const lineCost = ing && qty > 0 ? r2(lineQty * ing.cur * wasteMult) : 0
                return (
                  <div key={row.id} style={{ display: "grid", gridTemplateColumns: "1fr 70px 60px 70px 80px 24px", gap: 6, padding: "7px 6px", borderBottom: idx < fRecipe.length - 1 ? S.bds : "none", alignItems: "center", background: idx % 2 === 0 ? "transparent" : S.el + "44" }}>
                    <select style={inp({ padding: "6px 6px", fontSize: 12, appearance: "none" })} value={row.ingId} onChange={e => fUpdateRow(row.id, { ingId: e.target.value })}>
                      <option value="">Seleziona...</option>
                      {ings.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                    </select>
                    <input style={inp({ padding: "6px 6px", fontSize: 12 })} type="number" step="0.1" min="0" placeholder="0" value={row.qty} onChange={e => fUpdateRow(row.id, { qty: e.target.value })} />
                    <select style={inp({ padding: "6px 4px", fontSize: 12, appearance: "none" })} value={row.unit} onChange={e => fUpdateRow(row.id, { unit: e.target.value })}>
                      {UNITS.map(u => <option key={u}>{u}</option>)}
                    </select>
                    <div style={{ position: "relative" }}>
                      <input style={inp({ padding: "6px 20px 6px 6px", fontSize: 12 })} type="number" step="1" min="0" max="99" placeholder="0" value={row.waste} onChange={e => fUpdateRow(row.id, { waste: e.target.value })} />
                      <span style={{ position: "absolute", right: 5, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: S.t3, pointerEvents: "none" }}>%</span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      {lineCost > 0 ? <span style={{ fontSize: 12, fontWeight: 600, color: S.ac }}>{F(lineCost)}</span> : <span style={{ fontSize: 11, color: S.t3 }}>—</span>}
                    </div>
                    <button onClick={() => fRemoveRow(row.id)} style={{ background: "none", border: "none", color: S.t3, cursor: "pointer", fontSize: 13, padding: 0 }}>×</button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Calcolo automatico */}
          {fLiveCost > 0 && (
            <div style={card({ padding: 14, marginBottom: 16 })}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: S.t3, marginBottom: 10 }}>Calcolo automatico</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                {[
                  { l: "Costo ricetta",    v: F(r2(fLiveCost)),   c: S.t1 },
                  { l: "Prezzo consigliato", v: F(r2(fSugPrice)), c: S.ac },
                  { l: "Food cost %",      v: P(fFoodCostPct),    c: S.green },
                  { l: "Margine lordo",    v: F(r2(fMargin)),     c: S.green },
                ].map((k, i) => (
                  <div key={i} style={{ background: S.el, border: S.bd, borderRadius: 6, padding: "10px 10px" }}>
                    <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.07em", color: S.t3, fontWeight: 600, marginBottom: 3 }}>{k.l}</div>
                    <div style={{ fontFamily: "'Georgia',serif", fontSize: 15, color: k.c }}>{k.v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button style={{ ...btn("p"), width: "100%", justifyContent: "center", padding: "12px" }} onClick={fSave}>
            Salva piatto e invia a Piatti
          </button>
        </div>
      )}

      {/* ── TAB: DRINK COST ── */}
      {tab === "drink" && (
        <div style={{ maxWidth: 600 }}>
          {dSaved && (
            <div style={{ marginBottom: 16, padding: "10px 14px", background: S.gd, border: "1px solid rgba(74,222,128,0.3)", borderRadius: 8, fontSize: 13, color: S.green }}>
              Voce salvata e aggiunta alla sezione Piatti ✓
            </div>
          )}

          <div style={card({ padding: 16, marginBottom: 14 })}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: S.t3, marginBottom: 12 }}>Dati voce</div>

            <Fld label="Nome *">
              <input style={inp()} value={dForm.name} onChange={e => setDForm(f => ({ ...f, name: e.target.value }))} placeholder="es. Barolo Giacomo Conterno 2018" />
              {dErr.name && <span style={{ fontSize: 11, color: S.red }}>{dErr.name}</span>}
            </Fld>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Fld label="Tipologia">
                <select style={inp({ appearance: "none", cursor: "pointer" })} value={dForm.tipo}
                  onChange={e => setDForm(f => ({ ...f, tipo: e.target.value, isVino: e.target.value !== "Cocktail" }))}>
                  {[...VINO_TIPI, "Cocktail"].map(t => <option key={t}>{t}</option>)}
                </select>
              </Fld>
              {dForm.tipo !== "Cocktail" && (
                <Fld label="Regione">
                  <select style={inp({ appearance: "none", cursor: "pointer" })} value={dForm.regione} onChange={e => setDForm(f => ({ ...f, regione: e.target.value }))}>
                    {VINO_REGIONI.map(r => <option key={r}>{r}</option>)}
                  </select>
                </Fld>
              )}
            </div>

            {/* Collegamento a ingrediente vino */}
            {dForm.tipo !== "Cocktail" && viniIng.length > 0 && (
              <Fld label="Seleziona da magazzino vini">
                <select style={inp({ appearance: "none", cursor: "pointer" })} value={dForm.selIngId} onChange={e => onSelIngVino(e.target.value)}>
                  <option value="">— oppure inserisci manualmente —</option>
                  {viniIng.map(i => <option key={i.id} value={i.id}>{i.name} · {F(i.cur)}/bottiglia</option>)}
                </select>
              </Fld>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <Fld label="Prezzo bottiglia (€) *">
                <input style={inp()} type="number" step="0.01" value={dForm.bottlePrice} onChange={e => setDForm(f => ({ ...f, bottlePrice: e.target.value, selIngId: "" }))} placeholder="0.00" />
                {dErr.bottlePrice && <span style={{ fontSize: 11, color: S.red }}>{dErr.bottlePrice}</span>}
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

            {dForm.tipo !== "Cocktail" && (
              <Fld label="Calici per bottiglia">
                <input style={inp()} type="number" step="1" min="1" value={dForm.calici} onChange={e => setDForm(f => ({ ...f, calici: e.target.value }))} />
              </Fld>
            )}
          </div>

          {/* Calcolo automatico drink */}
          {dForm.bottlePrice && +dForm.bottlePrice > 0 && (
            <div style={card({ padding: 14, marginBottom: 16 })}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: S.t3, marginBottom: 10 }}>Calcolo automatico</div>
              <div style={{ display: "grid", gridTemplateColumns: dForm.tipo !== "Cocktail" ? "1fr 1fr 1fr" : "1fr 1fr", gap: 8 }}>
                {[
                  { l: "Costo netto bottiglia", v: F(r2(dPriceNet)), c: S.t1 },
                  { l: "Prezzo vendita bottiglia", v: F(dSellBottle), c: S.ac },
                  ...(dForm.tipo !== "Cocktail" ? [{ l: "Prezzo al calice", v: F(dSellCalice), c: S.green }] : []),
                ].map((k, i) => (
                  <div key={i} style={{ background: S.el, border: S.bd, borderRadius: 6, padding: "12px 12px" }}>
                    <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.07em", color: S.t3, fontWeight: 600, marginBottom: 4 }}>{k.l}</div>
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


function CreateMenu({ menus, setMenus, dishes, isMobile }) {
  const TEMPLATES = [
    { id: "classic",  label: "Classico",   desc: "Serif elegante, bordi sottili" },
    { id: "modern",   label: "Moderno",    desc: "Sans-serif, minimalista" },
    { id: "rustic",   label: "Rustico",    desc: "Testo grande, stile trattoria" },
  ]
  const FONT_SIZES = ["Piccolo", "Medio", "Grande"]
  const ANNI = (() => {
    const y = new Date().getFullYear()
    return [y, y - 1, y - 2]
  })()
  const MESI_IT = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"]
  const STAGIONE_MESI = {
    Primavera: [2,3,4], Estate: [5,6,7], Autunno: [8,9,10], Inverno: [11,0,1]
  }
  const FOOD_CATS = ["Speciali","Antipasti","Primi","Secondi","Dolci","Cocktail"]
  const VINO_TIPI = ["Rossi","Bianchi","Rosé","Bollicine"]
  const VINO_REGIONI = ["Piemonte","Toscana","Veneto","Sicilia","Campania","Sardegna","Lombardia","Puglia","Calabria","Altre regioni","Francia"]

  // state
  const [view, setView]           = useState("home") // home | create_menu | create_vini | open
  const [selAnno, setSelAnno]     = useState(ANNI[0])
  const [openItem, setOpenItem]   = useState(null)

  // Crea menu state
  const [step, setStep]           = useState(1) // 1=config, 2=selezione
  const [counts, setCounts]       = useState({ Speciali:0, Antipasti:2, Primi:3, Secondi:3, Dolci:2, Cocktail:0 })
  const [selDishes, setSelDishes] = useState({})

  // Carta vini state
  const [selVini, setSelVini]     = useState({})

  // Print options
  const [template, setTemplate]   = useState("classic")
  const [fontSize, setFontSize]   = useState("Medio")

  const uid2 = () => Math.random().toString(36).slice(2, 9)
  const nowStr = () => {
    const d = new Date()
    return `${d.getDate()} ${MESI_IT[d.getMonth()]} ${d.getFullYear()}`
  }
  const nowISO = () => new Date().toISOString()

  // Stagione corrente
  const curMonth = new Date().getMonth()
  const curStagione = Object.entries(STAGIONE_MESI).find(([,ms]) => ms.includes(curMonth))?.[0] || "Primavera"

  function catMatch(d, cat) {
    const c = (d.cat || "").toLowerCase()
    if (cat === "Antipasti") return c === "antipasto" || c === "antipasti"
    if (cat === "Primi")     return c === "primo"    || c === "primi"
    if (cat === "Secondi")   return c === "secondo"  || c === "secondi"
    if (cat === "Dolci")     return c === "dolce"    || c === "dolci"
    if (cat === "Speciali")  return c === "speciale" || c === "speciali"
    if (cat === "Cocktail")  return c === "cocktail"
    return false
  }

  function getDishesForCat(cat) {
    const all = dishes.filter(d => catMatch(d, cat))
    const inSeason  = all.filter(d => (d.stagioni||[]).includes(curStagione)).sort((a,b) => (b.margin||0)-(a.margin||0))
    const outSeason = all.filter(d => !(d.stagioni||[]).includes(curStagione)).sort((a,b) => (b.margin||0)-(a.margin||0))
    return [...inSeason, ...outSeason]
  }

  // Anno filter
  const menusAnno = menus.filter(m => new Date(m.date).getFullYear() === selAnno)

  // Save menu
  function saveMenu() {
    const selected = {}
    FOOD_CATS.forEach(cat => {
      selected[cat] = (selDishes[cat] || []).map(id => dishes.find(d => d.id === id)).filter(Boolean)
    })
    setMenus(prev => [{
      id: "m" + uid2(), type: "menu", label: "Menu del " + nowStr(),
      date: nowISO(), template, fontSize, selected
    }, ...prev])
    setView("home"); setStep(1); setSelDishes({}); setSelVini({})
  }

  // Save carta vini
  function saveVini() {
    const selected = {}
    VINO_TIPI.forEach(tipo => {
      selected[tipo] = {}
      VINO_REGIONI.forEach(reg => {
        const key = tipo + "|" + reg
        if (selVini[key]?.length > 0) {
          selected[tipo][reg] = selVini[key].map(id => dishes.find(d => d.id === id)).filter(Boolean)
        }
      })
    })
    setMenus(prev => [{
      id: "m" + uid2(), type: "vini", label: "Carta dei Vini — " + nowStr(),
      date: nowISO(), template, fontSize, selected
    }, ...prev])
    setView("home"); setSelVini({})
  }

  function deleteMenu(id) {
    if (!window.confirm("Eliminare questa voce?")) return
    setMenus(prev => prev.filter(m => m.id !== id))
  }

  function openPrintPreview(item) {
    // Apre il menu in una nuova tab — da lì si può stampare o salvare come PDF
    // e poi condividere il PDF via WhatsApp
    const html = buildPrintHTML(item)
    const win = window.open("", "_blank")
    if (!win) { alert("Abilita i popup per questo sito"); return }
    win.document.write(html)
    win.document.close()
    // Su mobile mostra istruzioni per salvare come PDF
    setTimeout(() => {
      win.print()
    }, 800)
  }

  async function shareMenu(item) {
    // Apre anteprima di stampa — l'utente salva come PDF e condivide
    openPrintPreview(item)
  }

  function printItem(item) {
    openPrintPreview(item)
  }

  // ── Build print HTML ──────────────────────────
  function buildPrintHTML(item) {
    const fsMap = { Piccolo: "13px", Medio: "15px", Grande: "17px" }
    const fs = fsMap[item.fontSize] || "15px"
    const isClassic = item.template === "classic"
    const isRustic  = item.template === "rustic"
    const ff = isClassic ? "Georgia, serif" : isRustic ? "'Times New Roman', serif" : "system-ui, sans-serif"
    const accent = isRustic ? "#8B4513" : "#1a1a1a"

    let body = ""
    if (item.type === "menu") {
      Object.entries(item.selected || {}).forEach(([cat, piatti]) => {
        if (!piatti || piatti.length === 0) return
        body += `<div class="section"><h2>${cat}</h2>`
        piatti.forEach(p => {
          body += `<div class="item"><span class="name">${p.name}</span><span class="price">${p.price > 0 ? "€ " + p.price.toFixed(2).replace(".",",") : ""}</span></div>`
        })
        body += `</div>`
      })
    } else {
      Object.entries(item.selected || {}).forEach(([tipo, regioni]) => {
        const rows = Object.entries(regioni || {})
        if (rows.length === 0) return
        body += `<div class="section"><h2>${tipo}</h2>`
        rows.forEach(([reg, vini]) => {
          if (!vini || vini.length === 0) return
          body += `<div class="regione">${reg}</div>`
          vini.forEach(v => {
            body += `<div class="item"><span class="name">${v.name}</span><span class="price">${v.priceBottle ? "€ " + v.priceBottle.toFixed(2).replace(".",",") + " / cal. € " + v.priceCalice.toFixed(2).replace(".",",") : ""}</span></div>`
          })
        })
        body += `</div>`
      })
    }

    return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
  @page { margin: 2cm; }
  body { font-family: ${ff}; font-size: ${fs}; color: #1a1a1a; max-width: 600px; margin: 0 auto; line-height: 1.6; }
  .print-tip { background: #f5f5f5; border: 1px solid #ddd; border-radius: 8px; padding: 12px 16px; margin-bottom: 24px; font-size: 13px; color: #555; text-align: center; }
  .print-tip strong { color: #333; }
  @media print { .print-tip { display: none; } }
  h1 { text-align: center; font-size: 1.6em; letter-spacing: 0.15em; text-transform: uppercase; border-bottom: ${isClassic ? "2px solid #1a1a1a" : "1px solid #ccc"}; padding-bottom: 8px; margin-bottom: 24px; }
  .date { text-align: center; font-size: 0.8em; color: #666; margin-bottom: 32px; }
  .section { margin-bottom: 28px; }
  h2 { font-size: 1em; text-transform: uppercase; letter-spacing: 0.12em; color: ${accent}; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-bottom: 12px; }
  .regione { font-size: 0.8em; color: #888; font-style: italic; margin: 8px 0 4px; }
  .item { display: flex; justify-content: space-between; align-items: baseline; padding: 4px 0; border-bottom: 1px dotted #e0e0e0; }
  .name { font-weight: ${isClassic ? "normal" : "500"}; }
  .price { font-weight: 600; min-width: 80px; text-align: right; }
  @media print { body { -webkit-print-color-adjust: exact; } }
</style></head><body>
<div class="print-tip">
  Per salvare come PDF: tocca i <strong>tre puntini</strong> del browser → <strong>Stampa</strong> → seleziona <strong>Salva come PDF</strong>.<br>
  Poi condividi il PDF via WhatsApp.
</div>
<h1>${item.type === "menu" ? "Menu" : "Carta dei Vini"}</h1>
<div class="date">${new Date(item.date).toLocaleDateString("it-IT", {day:"2-digit",month:"long",year:"numeric"})}</div>
${body}
</body></html>`
  }

  // ── HOME ───────────────────────────────────────
  if (view === "home") return (
    <div>
      <div style={{ fontFamily: "'Georgia',serif", fontSize: 20, color: S.t1, marginBottom: 20 }}>Crea Menu</div>

      {/* Action buttons */}
      <div style={row({ gap: 10, marginBottom: 24, flexWrap: "wrap" })}>
        <button style={btn("p")} onClick={() => { setView("create_menu"); setStep(1) }}>+ Crea Menu</button>
        <button style={btn("s")} onClick={() => { setView("create_vini"); setSelVini({}) }}>+ Carta dei Vini</button>
      </div>

      {/* Anno selector */}
      <div style={row({ gap: 8, marginBottom: 16, flexWrap: "wrap" })}>
        {ANNI.map(a => (
          <button key={a} onClick={() => setSelAnno(a)}
            style={{ padding: "4px 14px", background: selAnno === a ? S.acg : "none", border: "1px solid " + (selAnno === a ? S.acd : "#2a2a31"), borderRadius: 999, color: selAnno === a ? S.ac : S.t3, fontFamily: "inherit", fontSize: 12, cursor: "pointer" }}>
            {a}
          </button>
        ))}
      </div>

      {/* Lista menu anno */}
      {menusAnno.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: S.t3, fontSize: 13 }}>
          Nessun menu creato nel {selAnno}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {menusAnno.map(m => (
            <div key={m.id} style={{ background: S.surf, border: S.bds, borderRadius: S.r2, padding: "14px 16px" }}>
              <div style={row({ justifyContent: "space-between", marginBottom: 10 })}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: S.t1, marginBottom: 2 }}>{m.label}</div>
                  <div style={{ fontSize: 11, color: S.t3 }}>
                    {new Date(m.date).toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" })}
                    {" · "}{m.template && TEMPLATES.find(t => t.id === m.template)?.label}
                  </div>
                </div>
                <span style={{ ...badge("n"), textTransform: "uppercase", fontSize: 9 }}>{m.type === "menu" ? "Menu" : "Vini"}</span>
              </div>
              <div style={row({ gap: 6, flexWrap: "wrap" })}>
                <button style={btn("s", { fontSize: 11, padding: "4px 10px" })} onClick={() => { setOpenItem(m); setView("open") }}>Apri</button>
                <button style={btn("g", { fontSize: 11, padding: "4px 10px" })} onClick={() => shareMenu(m)}>PDF / Stampa</button>
                <button style={btn("g", { fontSize: 11, padding: "4px 10px" })} onClick={() => printItem(m)}>PDF / Stampa</button>
                <button style={{ ...btn("g", { fontSize: 11, padding: "4px 10px" }), color: S.red }} onClick={() => deleteMenu(m.id)}>Elimina</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  // ── OPEN / PREVIEW ─────────────────────────────
  if (view === "open" && openItem) return (
    <div>
      <div style={row({ marginBottom: 16 })}>
        <button onClick={() => setView("home")} style={{ background: "none", border: "none", color: S.ac, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, padding: 0 }}>← Menu</button>
      </div>
      <div style={{ fontFamily: "'Georgia',serif", fontSize: 18, color: S.t1, marginBottom: 4 }}>{openItem.label}</div>
      <div style={{ fontSize: 12, color: S.t3, marginBottom: 20 }}>{new Date(openItem.date).toLocaleDateString("it-IT", {day:"2-digit",month:"long",year:"numeric"})}</div>

      {openItem.type === "menu" && Object.entries(openItem.selected || {}).map(([cat, piatti]) => {
        if (!piatti || piatti.length === 0) return null
        return (
          <div key={cat} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: S.t3, marginBottom: 8, borderBottom: S.bds, paddingBottom: 4 }}>{cat}</div>
            {piatti.map((p, i) => (
              <div key={i} style={row({ justifyContent: "space-between", padding: "7px 0", borderBottom: S.bds })}>
                <span style={{ fontSize: 14, color: S.t1 }}>{p.name}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: S.t1 }}>{p.price > 0 ? F(p.price) : "—"}</span>
              </div>
            ))}
          </div>
        )
      })}

      {openItem.type === "vini" && Object.entries(openItem.selected || {}).map(([tipo, regioni]) => {
        const rows = Object.entries(regioni || {}).filter(([,v]) => v?.length > 0)
        if (rows.length === 0) return null
        return (
          <div key={tipo} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: S.t3, marginBottom: 8, borderBottom: S.bds, paddingBottom: 4 }}>{tipo}</div>
            {rows.map(([reg, vini]) => (
              <div key={reg} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: S.t3, fontStyle: "italic", marginBottom: 4 }}>{reg}</div>
                {vini.map((v, i) => (
                  <div key={i} style={row({ justifyContent: "space-between", padding: "6px 0", borderBottom: S.bds })}>
                    <span style={{ fontSize: 13, color: S.t1 }}>{v.name}</span>
                    <span style={{ fontSize: 12, color: S.t2 }}>{v.priceBottle ? F(v.priceBottle) + " / " + F(v.priceCalice) : "—"}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )
      })}

      <button style={{ ...btn("p"), marginTop: 12 }} onClick={() => printItem(openItem)}>PDF / Stampa</button>
    </div>
  )

  // ── CREATE MENU STEP 1: config ─────────────────
  if (view === "create_menu" && step === 1) return (
    <div style={{ maxWidth: 500 }}>
      <div style={row({ marginBottom: 16 })}>
        <button onClick={() => setView("home")} style={{ background: "none", border: "none", color: S.ac, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, padding: 0 }}>← Annulla</button>
      </div>
      <div style={{ fontFamily: "'Georgia',serif", fontSize: 18, color: S.t1, marginBottom: 20 }}>Configura il menu</div>

      <div style={card({ padding: 16, marginBottom: 14 })}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: S.t3, marginBottom: 12 }}>Piatti per categoria</div>
        {FOOD_CATS.map(cat => (
          <div key={cat} style={row({ justifyContent: "space-between", padding: "8px 0", borderBottom: S.bds })}>
            <span style={{ fontSize: 13, color: S.t1 }}>{cat}</span>
            <div style={row({ gap: 8 })}>
              <button onClick={() => setCounts(c => ({ ...c, [cat]: Math.max(0, (c[cat]||0)-1) }))}
                style={{ width: 28, height: 28, background: S.el, border: S.bd, borderRadius: S.r, color: S.t1, cursor: "pointer", fontFamily: "inherit", fontSize: 16 }}>−</button>
              <span style={{ width: 24, textAlign: "center", fontSize: 14, fontWeight: 600, color: S.t1 }}>{counts[cat]||0}</span>
              <button onClick={() => setCounts(c => ({ ...c, [cat]: (c[cat]||0)+1 }))}
                style={{ width: 28, height: 28, background: S.el, border: S.bd, borderRadius: S.r, color: S.t1, cursor: "pointer", fontFamily: "inherit", fontSize: 16 }}>+</button>
            </div>
          </div>
        ))}
      </div>

      {/* Template */}
      <div style={card({ padding: 16, marginBottom: 16 })}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: S.t3, marginBottom: 12 }}>Template grafico</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
          {TEMPLATES.map(t => (
            <div key={t.id} onClick={() => setTemplate(t.id)}
              style={{ padding: "10px 10px", background: template === t.id ? S.acg : S.el, border: "1px solid " + (template === t.id ? S.acd : "#2a2a31"), borderRadius: S.r, cursor: "pointer", textAlign: "center" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: template === t.id ? S.ac : S.t1, marginBottom: 3 }}>{t.label}</div>
              <div style={{ fontSize: 10, color: S.t3 }}>{t.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: S.t3, marginBottom: 8 }}>Dimensione testo</div>
        <div style={row({ gap: 8 })}>
          {FONT_SIZES.map(f => (
            <button key={f} onClick={() => setFontSize(f)}
              style={{ padding: "4px 14px", background: fontSize === f ? S.acg : "none", border: "1px solid " + (fontSize === f ? S.acd : "#2a2a31"), borderRadius: 999, color: fontSize === f ? S.ac : S.t3, fontFamily: "inherit", fontSize: 12, cursor: "pointer" }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <button style={{ ...btn("p"), width: "100%", justifyContent: "center", padding: "12px" }}
        onClick={() => { setSelDishes({}); setStep(2) }}>
        Continua — Selezione piatti
      </button>
    </div>
  )

  // ── CREATE MENU STEP 2: selezione piatti ───────
  if (view === "create_menu" && step === 2) {
    const activeCats = FOOD_CATS.filter(cat => (counts[cat]||0) > 0)
    return (
      <div style={{ maxWidth: 560 }}>
        <div style={row({ marginBottom: 16, justifyContent: "space-between" })}>
          <button onClick={() => setStep(1)} style={{ background: "none", border: "none", color: S.ac, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, padding: 0 }}>← Configura</button>
          <span style={{ fontSize: 12, color: S.t3 }}>Stagione: {curStagione}</span>
        </div>
        <div style={{ fontFamily: "'Georgia',serif", fontSize: 18, color: S.t1, marginBottom: 20 }}>Seleziona i piatti</div>

        {activeCats.map(cat => {
          const list = getDishesForCat(cat)
          const max = counts[cat] || 0
          const sel = selDishes[cat] || []
          return (
            <div key={cat} style={card({ padding: 16, marginBottom: 14 })}>
              <div style={row({ justifyContent: "space-between", marginBottom: 10 })}>
                <div style={{ fontSize: 13, fontWeight: 700, color: S.t1 }}>{cat}</div>
                <span style={{ fontSize: 11, color: sel.length >= max ? S.green : S.t3 }}>{sel.length}/{max} selezionati</span>
              </div>
              {list.length === 0 ? (
                <div style={{ fontSize: 12, color: S.t3, padding: "8px 0" }}>Nessun piatto disponibile</div>
              ) : list.map(d => {
                const isSel = sel.includes(d.id)
                const inSeason = (d.stagioni||[]).includes(curStagione)
                return (
                  <div key={d.id} onClick={() => {
                    if (!isSel && sel.length >= max) return
                    setSelDishes(prev => ({
                      ...prev,
                      [cat]: isSel ? sel.filter(x => x !== d.id) : [...sel, d.id]
                    }))
                  }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: S.bds, cursor: sel.length >= max && !isSel ? "not-allowed" : "pointer", opacity: sel.length >= max && !isSel ? 0.4 : 1 }}>
                    <div style={{ width: 18, height: 18, borderRadius: 4, border: "2px solid " + (isSel ? S.ac : "#2a2a31"), background: isSel ? S.acg : "none", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {isSel && <span style={{ fontSize: 10, color: S.ac, fontWeight: 700 }}>✓</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={row({ gap: 6 })}>
                        <span style={{ fontSize: 13, color: S.t1 }}>{d.name}</span>
                        {inSeason && <span style={{ fontSize: 9, color: S.green, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>stagione</span>}
                      </div>
                      {d.margin > 0 && <span style={{ fontSize: 10, color: S.t3 }}>margine {F(d.margin)}</span>}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: S.t1 }}>{d.price > 0 ? F(d.price) : "—"}</span>
                  </div>
                )
              })}
            </div>
          )
        })}

        <button style={{ ...btn("p"), width: "100%", justifyContent: "center", padding: "12px" }} onClick={saveMenu}>
          Salva Menu
        </button>
      </div>
    )
  }

  // ── CREATE CARTA VINI ──────────────────────────
  if (view === "create_vini") {
    const allVini = dishes.filter(d => (d.cat||"").toLowerCase() === "vino")
    return (
      <div style={{ maxWidth: 560 }}>
        <div style={row({ marginBottom: 16, justifyContent: "space-between" })}>
          <button onClick={() => setView("home")} style={{ background: "none", border: "none", color: S.ac, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, padding: 0 }}>← Annulla</button>
        </div>
        <div style={{ fontFamily: "'Georgia',serif", fontSize: 18, color: S.t1, marginBottom: 8 }}>Seleziona i vini</div>
        <div style={{ fontSize: 12, color: S.t3, marginBottom: 20 }}>Organizzati per tipologia e regione</div>

        {/* Template */}
        <div style={card({ padding: 14, marginBottom: 16 })}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: S.t3, marginBottom: 10 }}>Template</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {TEMPLATES.map(t => (
              <div key={t.id} onClick={() => setTemplate(t.id)}
                style={{ padding: "8px 8px", background: template === t.id ? S.acg : S.el, border: "1px solid " + (template === t.id ? S.acd : "#2a2a31"), borderRadius: S.r, cursor: "pointer", textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: template === t.id ? S.ac : S.t1 }}>{t.label}</div>
              </div>
            ))}
          </div>
        </div>

        {allVini.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: S.t3, fontSize: 13 }}>
            Nessun vino presente — aggiungili dalla sezione Drink Cost
          </div>
        ) : (
          VINO_TIPI.map(tipo => {
            const byTipo = allVini.filter(v => v.tipoVino === tipo)
            if (byTipo.length === 0) return null
            return (
              <div key={tipo} style={card({ padding: 16, marginBottom: 12 })}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: S.t3, marginBottom: 12 }}>{tipo}</div>
                {VINO_REGIONI.map(reg => {
                  const byReg = byTipo.filter(v => v.regioneVino === reg)
                  if (byReg.length === 0) return null
                  const key = tipo + "|" + reg
                  const sel = selVini[key] || []
                  return (
                    <div key={reg} style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 11, color: S.t3, fontStyle: "italic", marginBottom: 6 }}>{reg}</div>
                      {byReg.map(v => {
                        const isSel = sel.includes(v.id)
                        return (
                          <div key={v.id} onClick={() => setSelVini(prev => ({
                            ...prev,
                            [key]: isSel ? sel.filter(x => x !== v.id) : [...sel, v.id]
                          }))} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: S.bds, cursor: "pointer" }}>
                            <div style={{ width: 18, height: 18, borderRadius: 4, border: "2px solid " + (isSel ? S.ac : "#2a2a31"), background: isSel ? S.acg : "none", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              {isSel && <span style={{ fontSize: 10, color: S.ac, fontWeight: 700 }}>✓</span>}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 13, color: S.t1 }}>{v.name}</div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              {v.priceBottle && <div style={{ fontSize: 12, color: S.t1, fontWeight: 600 }}>{F(v.priceBottle)}</div>}
                              {v.priceCalice && <div style={{ fontSize: 10, color: S.t3 }}>cal. {F(v.priceCalice)}</div>}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            )
          })
        )}

        <button style={{ ...btn("p"), width: "100%", justifyContent: "center", padding: "12px", marginTop: 8 }} onClick={saveVini}>
          Salva Carta dei Vini
        </button>
      </div>
    )
  }

  return null
}


function AIInsights({ dishes, ings, isMobile }) {
  const MAX_CALLS_MONTH = 10
  const STORAGE_KEY = "fm_ai_calls"

  const [insights, setInsights]   = useState(() => {
    try { return JSON.parse(localStorage.getItem("fm_insights") || "[]") } catch(e) { return [] }
  })
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState(null)
  const [callsUsed, setCallsUsed] = useState(0)

  // Carica contatore chiamate dal localStorage
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"month":"","count":0}')
      const thisMonth = new Date().toISOString().slice(0, 7) // "2025-11"
      if (stored.month === thisMonth) setCallsUsed(stored.count)
      else { localStorage.setItem(STORAGE_KEY, JSON.stringify({ month: thisMonth, count: 0 })); setCallsUsed(0) }
    } catch(e) { setCallsUsed(0) }
  }, [])

  function incrementCalls() {
    const thisMonth = new Date().toISOString().slice(0, 7)
    const newCount = callsUsed + 1
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ month: thisMonth, count: newCount }))
    setCallsUsed(newCount)
  }

  async function generate() {
    if (callsUsed >= MAX_CALLS_MONTH) return
    setLoading(true); setError(null)

    try {
      // Prepara contesto: piatti con food cost + ingredienti con variazioni prezzo
      const dishData = dishes
        .filter(d => d.cost > 0 && d.price > 0)
        .map(d => ({
          nome: d.name,
          cat: d.cat,
          prezzo: d.price,
          costo: d.cost,
          foodCost: Math.round(d.fc * 1000) / 10,
          target: Math.round(d.target * 100),
          margine: d.margin,
        }))

      const ingData = ings.map(i => {
        const var_pct = i.avg > 0 ? Math.round(((i.cur - i.avg) / i.avg) * 1000) / 10 : 0
        return { nome: i.name, cat: i.cat, prezzoAttuale: i.cur, media: i.avg, variazione: var_pct, unita: i.unit }
      }).filter(i => Math.abs(i.variazione) > 0.5)

      const prompt = `Sei un consulente di ristorazione esperto in food cost e gestione del menu.

DATI PIATTI (food cost %):
${JSON.stringify(dishData, null, 2)}

INGREDIENTI CON VARIAZIONI DI PREZZO RECENTI:
${JSON.stringify(ingData, null, 2)}

Analizza i dati e genera esattamente 5 insights pratici e concreti per aiutare il ristoratore a mantenere o migliorare i margini. Per ogni insight:
- Identifica un problema specifico (piatto sopra target, ingrediente aumentato, ecc.)
- Dai 2-3 azioni concrete e alternative (es: aumentare prezzo di €X, ridurre grammatura di Yg, sostituire ingrediente Z con W più economico)
- Stima il guadagno mensile potenziale in euro (assumendo 30-50 porzioni/mese)

Rispondi SOLO con JSON valido senza markdown:
[{"titolo":"...","problema":"...","azioni":["...","...","..."],"guadagno":0,"priorita":"alta|media|bassa"}]`

      const GROQ_KEY = "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"
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + GROQ_KEY },
        body: JSON.stringify({
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }]
        })
      })

      const data = await response.json()
      if (data.error) throw new Error(data.error.message || "Errore Groq")
      const raw = data.choices?.[0]?.message?.content || ""
      const jsonMatch = raw.match(/\[[\s\S]*\]/)
      if (!jsonMatch) throw new Error("Risposta non valida")
      const parsed = JSON.parse(jsonMatch[0])
      setInsights(parsed)
      localStorage.setItem("fm_insights", JSON.stringify(parsed))
      incrementCalls()

    } catch(e) {
      setError("Errore generazione insights: " + e.message)
    }
    setLoading(false)
  }

  const priColor = { alta: S.red, media: S.ac, bassa: S.t3 }
  const rimanenti = MAX_CALLS_MONTH - callsUsed

  return (
    <div>
      <div style={row({ justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", alignItems: "flex-start" })}>
        <div>
          <div style={{ fontFamily: "'Georgia',serif", fontSize: 20, color: S.t1, marginBottom: 2 }}>AI Insights</div>
          <div style={{ fontSize: 12, color: S.t3 }}>
            Consigli per proteggere i margini — {rimanenti} analisi rimaste questo mese
          </div>
        </div>
        <button style={btn(rimanenti > 0 ? "p" : "s", { opacity: rimanenti > 0 ? 1 : 0.5 })}
          onClick={generate} disabled={loading || rimanenti <= 0}>
          {loading ? "Analisi in corso..." : rimanenti > 0 ? "Genera analisi" : "Limite mensile raggiunto"}
        </button>
      </div>

      {/* Barra utilizzo */}
      <div style={{ marginBottom: 20 }}>
        <div style={row({ justifyContent: "space-between", fontSize: 11, color: S.t3, marginBottom: 5 })}>
          <span>Analisi utilizzate questo mese</span>
          <span>{callsUsed}/{MAX_CALLS_MONTH}</span>
        </div>
        <div style={{ height: 4, background: S.el, borderRadius: 999, overflow: "hidden" }}>
          <div style={{ height: "100%", width: (callsUsed / MAX_CALLS_MONTH * 100) + "%", background: callsUsed >= MAX_CALLS_MONTH ? S.red : S.ac, borderRadius: 999, transition: "width 0.4s" }} />
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: 16, padding: "10px 14px", background: S.rd, border: "1px solid rgba(248,113,113,0.3)", borderRadius: 8, fontSize: 13, color: S.red }}>{error}</div>
      )}

      {loading && (
        <div style={card({ padding: 32, textAlign: "center" })}>
          <div style={{ fontSize: 13, color: S.t3, marginBottom: 8 }}>Claude sta analizzando i tuoi dati...</div>
          <div style={{ fontSize: 11, color: S.t3 }}>Piatti, food cost, variazioni prezzi ingredienti</div>
        </div>
      )}

      {!loading && insights.length === 0 && !error && (
        <div style={{ textAlign: "center", padding: "48px 0", color: S.t3, fontSize: 13 }}>
          Clicca "Genera analisi" per ricevere consigli personalizzati sui tuoi margini
        </div>
      )}

      {!loading && insights.map((ins, i) => (
        <div key={i} style={{ background: S.surf, border: S.bds, borderLeft: "3px solid " + (priColor[ins.priorita] || S.t3), borderRadius: S.r2, padding: "16px 18px", marginBottom: 10 }}>
          <div style={row({ justifyContent: "space-between", marginBottom: 8 })}>
            <div style={row({ gap: 8 })}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: priColor[ins.priorita] || S.t3, boxShadow: "0 0 6px " + (priColor[ins.priorita] || S.t3), flexShrink: 0 }} />
              <span style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: S.t3 }}>{ins.priorita}</span>
            </div>
            {ins.guadagno > 0 && (
              <span style={{ fontSize: 11.5, fontWeight: 600, color: S.green, background: S.gd, padding: "2px 10px", borderRadius: 999, border: "1px solid rgba(74,222,128,0.2)" }}>
                +{F(ins.guadagno)}/mese
              </span>
            )}
          </div>

          <div style={{ fontFamily: "'Georgia',serif", fontSize: 15, color: S.t1, marginBottom: 6 }}>{ins.titolo}</div>
          <div style={{ fontSize: 13, color: S.t2, lineHeight: 1.6, marginBottom: 12 }}>{ins.problema}</div>

          {ins.azioni && ins.azioni.length > 0 && (
            <div style={{ background: S.el, border: S.bd, borderRadius: S.r, padding: "10px 12px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: S.t3, marginBottom: 8 }}>Azioni consigliate</div>
              {ins.azioni.map((a, j) => (
                <div key={j} style={row({ gap: 8, marginBottom: j < ins.azioni.length - 1 ? 6 : 0, alignItems: "flex-start" })}>
                  <span style={{ fontSize: 10, color: S.ac, fontWeight: 700, marginTop: 2, flexShrink: 0 }}>{j + 1}.</span>
                  <span style={{ fontSize: 12.5, color: S.t2, lineHeight: 1.5 }}>{a}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}



// ── Traduzioni ───────────────────────────────────────────────────
const T = {
  it: {
    login: "Accedi", register: "Registrati", logout: "Esci",
    email: "Email", password: "Password", confirmPwd: "Conferma password",
    forgotPwd: "Password dimenticata?", resetPwd: "Reimposta password",
    resetSent: "Email di reset inviata! Controlla la casella.",
    loginGoogle: "Continua con Google",
    noAccount: "Non hai un account?", haveAccount: "Hai già un account?",
    appDesc: "Gestione costi e margini per ristoratori",
    errEmail: "Email non valida", errPwd: "Minimo 6 caratteri",
    errPwdMatch: "Le password non coincidono",
    errLogin: "Email o password errati",
    errRegister: "Errore durante la registrazione",
  },
  en: {
    login: "Sign in", register: "Sign up", logout: "Sign out",
    email: "Email", password: "Password", confirmPwd: "Confirm password",
    forgotPwd: "Forgot password?", resetPwd: "Reset password",
    resetSent: "Reset email sent! Check your inbox.",
    loginGoogle: "Continue with Google",
    noAccount: "Don't have an account?", haveAccount: "Already have an account?",
    appDesc: "Cost and margin management for restaurants",
    errEmail: "Invalid email", errPwd: "Minimum 6 characters",
    errPwdMatch: "Passwords don't match",
    errLogin: "Wrong email or password",
    errRegister: "Registration error",
  }
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

function LoginPage({ lang, setLang }) {
  const t = T[lang]
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
      <div style={{ position: "fixed", top: 16, right: 16, display: "flex", gap: 6 }}>
        {["it","en"].map(l => (
          <button key={l} onClick={() => setLang(l)} style={{ padding: "4px 10px", background: lang === l ? S.acg : "none", border: `1px solid ${lang === l ? S.acd : "#2a2a31"}`, borderRadius: 999, color: lang === l ? S.ac : S.t3, fontFamily: "inherit", fontSize: 11, fontWeight: 700, cursor: "pointer", textTransform: "uppercase" }}>{l}</button>
        ))}
      </div>
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <div style={{ width: 72, height: 72, background: S.ac, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <FMPercentIcon size={44} />
        </div>
        <div style={{ fontFamily: "'Georgia',serif", fontSize: 26, color: S.t1, letterSpacing: "-0.02em" }}>FoodMargin</div>
        <div style={{ fontSize: 13, color: S.t3, marginTop: 4 }}>{t.appDesc}</div>
      </div>
      <div style={{ width: "100%", maxWidth: 380, background: S.surf, border: S.bd, borderRadius: 16, padding: "28px 24px" }}>
        <div style={{ fontFamily: "'Georgia',serif", fontSize: 18, color: S.t1, marginBottom: 20 }}>
          {mode === "login" ? t.login : mode === "register" ? t.register : t.resetPwd}
        </div>
        {info && <div style={{ marginBottom: 14, padding: "10px 14px", background: S.gd, border: "1px solid rgba(74,222,128,0.25)", borderRadius: 8, fontSize: 13, color: S.green }}>{info}</div>}
        {err && <div style={{ marginBottom: 14, padding: "10px 14px", background: S.rd, border: "1px solid rgba(248,113,113,0.25)", borderRadius: 8, fontSize: 13, color: S.red }}>{err}</div>}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 11.5, fontWeight: 500, color: S.t2, display: "block", marginBottom: 4 }}>{t.email}</label>
          <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            style={{ width: "100%", padding: "10px 12px", background: S.el, border: S.bd, borderRadius: 8, color: S.t1, fontFamily: "inherit", fontSize: 14, outline: "none", boxSizing: "border-box" }}
            placeholder="nome@email.com" />
        </div>
        {mode !== "reset" && (
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11.5, fontWeight: 500, color: S.t2, display: "block", marginBottom: 4 }}>{t.password}</label>
            <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              style={{ width: "100%", padding: "10px 12px", background: S.el, border: S.bd, borderRadius: 8, color: S.t1, fontFamily: "inherit", fontSize: 14, outline: "none", boxSizing: "border-box" }}
              placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handleSubmit()} />
          </div>
        )}
        {mode === "register" && (
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11.5, fontWeight: 500, color: S.t2, display: "block", marginBottom: 4 }}>{t.confirmPwd}</label>
            <input type="password" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
              style={{ width: "100%", padding: "10px 12px", background: S.el, border: S.bd, borderRadius: 8, color: S.t1, fontFamily: "inherit", fontSize: 14, outline: "none", boxSizing: "border-box" }}
              placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handleSubmit()} />
          </div>
        )}
        {mode === "login" && (
          <div style={{ textAlign: "right", marginBottom: 16 }}>
            <button onClick={() => { setMode("reset"); setErr("") }} style={{ background: "none", border: "none", color: S.t3, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>{t.forgotPwd}</button>
          </div>
        )}
        <button onClick={handleSubmit} disabled={loading}
          style={{ width: "100%", padding: "12px", background: S.ac, color: "#0d0d0f", border: "none", borderRadius: 8, fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer", marginBottom: 12, opacity: loading ? 0.7 : 1 }}>
          {loading ? "..." : mode === "login" ? t.login : mode === "register" ? t.register : t.resetPwd}
        </button>
        {mode !== "reset" && (
          <button onClick={handleGoogle} disabled={loading}
            style={{ width: "100%", padding: "12px", background: S.el, color: S.t1, border: S.bd, borderRadius: 8, fontFamily: "inherit", fontSize: 13, fontWeight: 500, cursor: "pointer", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <span style={{ fontSize: 16 }}>G</span> {t.loginGoogle}
          </button>
        )}
        <div style={{ textAlign: "center", fontSize: 13, color: S.t3 }}>
          {mode === "login" && <>{t.noAccount} <button onClick={() => { setMode("register"); setErr("") }} style={{ background: "none", border: "none", color: S.ac, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600 }}>{t.register}</button></>}
          {mode === "register" && <>{t.haveAccount} <button onClick={() => { setMode("login"); setErr("") }} style={{ background: "none", border: "none", color: S.ac, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600 }}>{t.login}</button></>}
          {mode === "reset" && <button onClick={() => { setMode("login"); setErr("") }} style={{ background: "none", border: "none", color: S.ac, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600 }}>← {t.login}</button>}
        </div>
      </div>
    </div>
  )
}

const NAV = [
  { id: "dash",   label: "Dashboard",   icon: "◈", group: "Gestione" },
  { id: "ing",    label: "Ingredienti", icon: "⬡", group: "Gestione" },
  { id: "dishes", label: "Piatti",      icon: "◎", group: "Gestione" },
  { id: "inv",    label: "Fatture",     icon: "▤", group: "Gestione" },
  { id: "fc",     label: "F&D Cost",    icon: "◬", group: "Gestione" },
  { id: "menu",   label: "Crea Menu",   icon: "❑", group: "Gestione" },
  { id: "ai",     label: "AI Insights", icon: "✦", group: "Gestione" },
]

export default function App() {
  const [page, setPage] = useState(() => sessionStorage.getItem("ristorai_page") || "dash")
  const [collapsed, setCollapsed] = useState(false)
  useEffect(() => { sessionStorage.setItem("ristorai_page", page) }, [page])
  const [ready, setReady] = useState(false)
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [lang, setLang] = useState(() => localStorage.getItem("fm_lang") || "it")
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1024)
  useEffect(() => { const h = () => setW(window.innerWidth); window.addEventListener("resize", h); return () => window.removeEventListener("resize", h) }, [])
  useEffect(() => { localStorage.setItem("fm_lang", lang) }, [lang])

  const [ings,      setIngs]      = useState(INIT_ING)
  const [dishes,    setDishes]    = useState(DISHES)
  const [invs,      setInvs]      = useState(INIT_INV)
  const [dismissed, setDismissed] = useState([])
  const [menus, setMenus] = useState([])

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
          if (d.dismissed) setDismissed(d.dismissed)
          if (d.menus)     setMenus(d.menus)
        }
      } catch (e) { console.log("Load error:", e) }
      setReady(true)
    }
    load()
  }, [user])

  // Save data per user
  useEffect(() => {
    if (!ready || !user) return
    setDoc(doc(db, "users", user.uid, "data", "main"), { ings, dishes, invs, dismissed, menus }, { merge: true })
      .catch(e => console.log("Save error:", e))
  }, [ings, dishes, invs, dismissed, menus, ready, user])

  if (!authReady) return (
    <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "#0d0d0f", flexDirection: "column", gap: 12 }}>
      <div style={{ fontFamily: "'Georgia',serif", fontSize: 18, color: "#e8a838", letterSpacing: "-0.02em" }}>FoodMargin</div>
      <div style={{ fontSize: 12, color: "#5a5963" }}>Caricamento...</div>
    </div>
  )

  if (!user) return <LoginPage lang={lang} setLang={setLang} />

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
        case "dash":   return <Dashboard ings={ings} isMobile={isMobile} />
        case "ing":    return <Ingredients ings={ings} setIngs={setIngs} isMobile={isMobile} />
        case "dishes": return <Dishes dishes={dishes} setDishes={setDishes} ings={ings} isMobile={isMobile} />
        case "inv":    return <Invoices invs={invs} setInvs={setInvs} ings={ings} setIngs={setIngs} isMobile={isMobile} />
        case "fc":     return <FoodCost dishes={dishes} setDishes={setDishes} ings={ings} isMobile={isMobile} />
        case "ai":     return <AIInsights dishes={dishes} ings={ings} isMobile={isMobile} />
        case "menu":   return <CreateMenu menus={menus} setMenus={setMenus} dishes={dishes} isMobile={isMobile} />
        default:       return <Dashboard ings={ings} isMobile={isMobile} />
      }
    } catch(e) {
      return <div style={{ padding: 20, color: "#f87171" }}>Errore: {e.message}</div>
    }
  }
  const groups = [...new Set(NAV.map(n => n.group))]
  const sideW = collapsed ? 52 : 160

  if (isMobile) return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: S.bg, color: S.t1, fontFamily: "system-ui, sans-serif" }}>
      <div style={{ height: 52, background: S.surf, borderBottom: S.bds, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", flexShrink: 0 }}>
        <div style={{ fontFamily: "'Georgia',serif", fontSize: 20, color: S.ac }}>FoodMargin</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", gap: 4 }}>
            {["it","en"].map(l => <button key={l} onClick={() => setLang(l)} style={{ padding: "2px 7px", background: lang===l ? S.acg : "none", border: `1px solid ${lang===l ? S.acd : "#2a2a31"}`, borderRadius: 999, color: lang===l ? S.ac : S.t3, fontFamily: "inherit", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>{l.toUpperCase()}</button>)}
          </div>
          <button onClick={() => signOut(auth)} style={{ background: S.el, border: S.bd, borderRadius: 6, padding: "4px 10px", color: S.t2, fontFamily: "inherit", fontSize: 11, cursor: "pointer" }}>{T[lang].logout}</button>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px 90px" }}>
        {renderPage()}
      </div>
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: S.surf, borderTop: S.bds, display: "flex", zIndex: 100, padding: "6px 4px 16px" }}>
        {NAV.map(n => (
          <button key={n.id} onClick={() => setPage(n.id)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "6px 2px", background: page === n.id ? "rgba(90,89,99,0.25)" : "none", border: "none", borderRadius: 10, cursor: "pointer", color: page === n.id ? S.t3 : S.ac }}>
            <span style={{ fontSize: 22 }}>{n.icon}</span>
            <span style={{ fontSize: 9, fontWeight: 600 }}>{n.label}</span>
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div style={{ display: "flex", height: "100vh", background: S.bg, color: S.t1, fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 13.5, lineHeight: 1.5, overflow: "hidden" }}>

      <div style={{ width: sideW, flexShrink: 0, background: S.surf, borderRight: S.bds, display: "flex", flexDirection: "column", overflow: "hidden", transition: "width 0.2s ease" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between", padding: collapsed ? "14px 0" : "12px 10px 12px 14px", borderBottom: S.bds, minHeight: 52 }}>
          {!collapsed && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 24, height: 24, background: S.acg, border: "1px solid " + S.acd, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: S.ac, flexShrink: 0 }}>◈</div>
              <div><div style={{ fontFamily: "'Georgia',serif", fontSize: 14, color: S.t1, lineHeight: 1.1 }}>FoodMargin</div><div style={{ fontSize: 8, color: S.ac, letterSpacing: "0.12em", textTransform: "uppercase" }}>SaaS</div></div>
            </div>
          )}
          {collapsed && <div style={{ width: 24, height: 24, background: S.acg, border: "1px solid " + S.acd, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: S.ac }}>◈</div>}
          <button onClick={() => setCollapsed(c => !c)} title={collapsed ? "Espandi" : "Comprimi"} style={{ background: S.el, border: S.bd, borderRadius: 5, width: 22, height: 22, cursor: "pointer", color: S.t3, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginLeft: collapsed ? 0 : 4 }}>
            {collapsed ? "›" : "‹"}
          </button>
        </div>

        {!collapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: 7, margin: "7px 10px", padding: "6px 10px", background: S.el, border: S.bd, borderRadius: 6 }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: S.green, boxShadow: "0 0 5px " + S.green, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: S.t2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>La Gioia</span>
          </div>
        )}

        <nav style={{ flex: 1, padding: "4px 0", overflowY: "auto" }}>
          {groups.map(g => (
            <div key={g} style={{ padding: "2px 0 6px" }}>
              {!collapsed && <span style={{ display: "block", padding: "7px 14px 3px", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: S.t3 }}>{g}</span>}
              {NAV.filter(n => n.group === g).map(n => (
                <button key={n.id} onClick={() => setPage(n.id)} title={collapsed ? n.label : undefined}
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start", gap: 8, padding: collapsed ? "9px 0" : "7px 10px 7px 14px", background: page === n.id ? S.acg : "none", border: "none", cursor: "pointer", color: page === n.id ? S.ac : S.t2, fontFamily: "inherit", fontSize: 13, textAlign: "left", position: "relative" }}>
                  {page === n.id && <div style={{ position: "absolute", left: 0, top: 4, bottom: 4, width: 2, background: S.ac, borderRadius: "0 2px 2px 0" }} />}
                  <span style={{ fontSize: 14, flexShrink: 0 }}>{n.icon}</span>
                  {!collapsed && <span style={{ flex: 1, fontSize: 12.5 }}>{n.label}</span>}
                  {!collapsed && n.badge && <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 5px", background: S.ac, color: "#0d0d0f", borderRadius: 999 }}>{n.badge}</span>}
                  {collapsed && n.badge && <span style={{ position: "absolute", top: 5, right: 5, width: 6, height: 6, background: S.ac, borderRadius: "50%" }} />}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {!collapsed && (
          <div style={{ display: "flex", justifyContent: "space-between", padding: "9px 14px", borderTop: S.bds }}>
            <span style={{ fontSize: 10, color: S.t3 }}>Piano</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: S.ac }}>Professional</span>
          </div>
        )}
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", height: 52, background: S.surf, borderBottom: S.bds, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Georgia',serif", fontSize: 15, color: S.t1 }}>
            <span style={{ color: S.ac, opacity: 0.8 }}>{NAV.find(n => n.id === page) && NAV.find(n => n.id === page).icon}</span>
            {NAV.find(n => n.id === page) && NAV.find(n => n.id === page).label}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", gap: 4 }}>
              {["it","en"].map(l => <button key={l} onClick={() => setLang(l)} style={{ padding: "2px 7px", background: lang===l ? S.acg : "none", border: `1px solid ${lang===l ? S.acd : "#2a2a31"}`, borderRadius: 999, color: lang===l ? S.ac : S.t3, fontFamily: "inherit", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>{l.toUpperCase()}</button>)}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "4px 9px 4px 5px", background: S.el, border: S.bd, borderRadius: 6 }}>
              <div style={{ width: 22, height: 22, borderRadius: 5, background: S.acg, border: "1px solid " + S.acd, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Georgia',serif", fontSize: 11, color: S.ac }}>{user?.email?.[0]?.toUpperCase() || "U"}</div>
              <span style={{ fontSize: 12, fontWeight: 500, color: S.t1 }}>{user?.email?.split("@")[0] || "User"}</span>
            </div>
            <button onClick={() => signOut(auth)} style={{ background: S.el, border: S.bd, borderRadius: 6, padding: "5px 12px", color: S.t2, fontFamily: "inherit", fontSize: 11, cursor: "pointer" }}>{T[lang].logout}</button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "22px 28px 48px" }}>
          {renderPage()}
        </div>
      </div>
    </div>
  )
}

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
const RECIPES = {
  d1: [{ id: "i1", name: "Pollo", qty: 0.22, unit: "kg", price: 8.50, waste: 1.1 }, { id: "i4", name: "Olio EVO", qty: 0.02, unit: "l", price: 9.50, waste: 1.0 }],
  d2: [{ id: "i3", name: "Pasta", qty: 0.12, unit: "kg", price: 1.80, waste: 1.0 }, { id: "i5", name: "Pomodori", qty: 0.15, unit: "kg", price: 1.20, waste: 1.0 }],
  d3: [{ id: "i6", name: "Branzino", qty: 0.35, unit: "kg", price: 18.00, waste: 1.25 }, { id: "i7", name: "Burro", qty: 0.02, unit: "kg", price: 7.50, waste: 1.0 }],
  d4: [{ id: "i3", name: "Pasta", qty: 0.10, unit: "kg", price: 1.80, waste: 1.0 }, { id: "i2", name: "Parmigiano", qty: 0.04, unit: "kg", price: 28.00, waste: 1.0 }],
  d5: [{ id: "i8", name: "Prosciutto", qty: 0.08, unit: "kg", price: 32.00, waste: 1.0 }],
  d6: [{ id: "i7", name: "Burro", qty: 0.05, unit: "kg", price: 7.50, waste: 1.0 }, { id: "i2", name: "Parmigiano", qty: 0.01, unit: "kg", price: 28.00, waste: 1.0 }],
}
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
const INIT_SALES = [
  { id: "s1", date: "2024-11-22", shift: "Cena", food: 1840, bev: 420, cov: 180, other: 60, total: 2500, covers: 62 },
  { id: "s2", date: "2024-11-22", shift: "Pranzo", food: 1120, bev: 280, cov: 100, other: 0, total: 1500, covers: 38 },
  { id: "s3", date: "2024-11-21", shift: "Cena", food: 2180, bev: 510, cov: 210, other: 100, total: 3000, covers: 74 },
  { id: "s4", date: "2024-11-20", shift: "Cena", food: 1960, bev: 460, cov: 180, other: 0, total: 2600, covers: 66 },
]
const INSIGHTS = [
  { id: "a1", sev: "critical", title: "Branzino al Forno in perdita", body: "Food cost 41.8% — sopra target 30%. Con 45 porzioni/mese perdi ~108 euro. Porta il prezzo a 28 euro.", action: "Porta a 28 euro", gain: 108 },
  { id: "a2", sev: "high", title: "Aumento prezzi: Parmigiano Reg.", body: "+16.7% rispetto alla media 3 mesi. Impatta Cacio e Pepe e Tiramisù. Verifica fornitori alternativi.", action: "Verifica fornitori", gain: 64 },
  { id: "a3", sev: "high", title: "Consumo anomalo: Branzino", body: "22% oltre il previsto dalle ricette. Costo extra stimato 95 euro/mese. Verifica porzioni e scarti.", action: "Verifica stock", gain: 95 },
  { id: "a4", sev: "medium", title: "Aumenta prezzo: Cacio e Pepe", body: "Da 13 a 15 euro rientri nel target food cost. Guadagno aggiuntivo stimato 76 euro/mese.", action: "Porta a 15 euro", gain: 76 },
  { id: "a5", sev: "low", title: "Promuovi: Antipasto Misto", body: "Margine 80% ma solo 28 vendite/mese. Consigliarlo come piatto del giorno potrebbe portare +38 euro.", action: "Promuovi", gain: 38 },
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

function Sheet({ open, onClose, title, children, footer }) {
  if (!open) return null
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", flexDirection: "column", justifyContent: "flex-end", zIndex: 999 }}>
      <div style={{ background: S.surf, borderRadius: "22px 22px 0 0", maxHeight: "94vh", display: "flex", flexDirection: "column" }}>
        <div style={{ width: 40, height: 4, background: S.el, borderRadius: 999, margin: "12px auto 0", flexShrink: 0 }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 0", flexShrink: 0 }}>
          <span style={{ fontFamily: "'Georgia',serif", fontSize: 20, color: S.t1 }}>{title}</span>
          <button onClick={onClose} style={{ background: S.el, border: "none", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", color: S.t3, fontSize: 18 }}>x</button>
        </div>
        <div style={{ padding: "16px 20px", overflowY: "auto", flex: 1 }}>{children}</div>
        {footer && <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "12px 20px 32px", borderTop: "1px solid #1f1f25", flexShrink: 0 }}>{footer}</div>}
      </div>
    </div>
  )
}


function Fld({ label, children }) {
  return <div style={col({ marginBottom: 12 })}><label style={{ fontSize: 11.5, fontWeight: 500, color: S.t2 }}>{label}</label>{children}</div>
}

function Dashboard({ sales, dishes, isMobile }) {
  const totalR = sales.reduce((s, e) => s + e.total, 0)
  const totalC = sales.reduce((s, e) => s + e.covers, 0)
  return (
    <div>
      <div style={{ marginBottom: 18 }}><div style={{ fontFamily: "'Georgia',serif", fontSize: isMobile ? 26 : 22, color: S.t1, marginBottom: 2 }}>Dashboard</div><div style={{ fontSize: 12, color: S.t3 }}>Panoramica economica — Novembre 2024</div></div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 10, marginBottom: 16 }}>
        {[{ l: "Incasso settimana", v: F(totalR), s: "ultimi 4 giorni" }, { l: "Food Cost medio", v: P(0.274), s: "target 28%" }, { l: "Ticket medio", v: F(totalR / totalC), s: totalC + " coperti" }, { l: "Alert attivi", v: "3", s: "alta priorità" }].map((k, i) => (
          <div key={i} style={{ ...card({ padding: "14px 16px", position: "relative", overflow: "hidden" }) }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg," + S.ac + ",transparent)", opacity: 0.4 }} />
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: S.t3, fontWeight: 600, marginBottom: 5 }}>{k.l}</div>
            <div style={{ fontFamily: "'Georgia',serif", fontSize: 21, color: S.t1, letterSpacing: "-0.03em", marginBottom: 3 }}>{k.v}</div>
            <div style={{ fontSize: 11, color: S.t3 }}>{k.s}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div style={card({ padding: 16 })}>
          <div style={{ fontFamily: "'Georgia',serif", fontSize: 15, color: S.t1, marginBottom: 12 }}>Top piatti per margine</div>
          {[...dishes].sort((a, b) => b.margin - a.margin).slice(0, 4).map((d, i) => (
            <div key={d.id} style={row({ padding: "7px 0", borderBottom: S.bds })}>
              <span style={{ fontFamily: "'Georgia',serif", fontSize: 15, color: S.t3, width: 16 }}>{i + 1}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: S.t1 }}>{d.name}</div>
                <div style={{ fontSize: 11, color: S.t3 }}>{F(d.margin)} margine</div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: FC_COLOR(d.fc, d.target) }}>{P(d.fc)}</span>
            </div>
          ))}
        </div>
        <div style={card({ padding: 16 })}>
          <div style={{ fontFamily: "'Georgia',serif", fontSize: 15, color: S.t1, marginBottom: 12 }}>Alert prioritari</div>
          {INSIGHTS.filter(i => i.sev === "critical" || i.sev === "high").map(ins => (
            <div key={ins.id} style={{ padding: "9px 11px", borderRadius: 6, background: S.el, border: "1px solid rgba(248,113,113,0.2)", marginBottom: 7 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: S.t1, marginBottom: 2 }}>{ins.title}</div>
              <div style={{ fontSize: 11.5, color: S.t2 }}>{ins.body.split(".")[0]}.</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Ingredients({ ings, setIngs, isMobile }) {
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)
  const [edit, setEdit] = useState(null)
  const [delTarget, setDelTarget] = useState(null)
  const [form, setForm] = useState({ name: "", cat: "Carni", unit: "kg", cur: "" })
  const [err, setErr] = useState({})
  const CATS_ALL = ["Carni", "Pesce", "Verdure", "Latticini", "Salumi", "Pasta & Cereali", "Olio & Grassi", "Scatolame", "Surgelati", "Bevande", "Spezie & Aromi", "Altro"]
  const [catFilter, setCatFilter] = useState("")
  const list = ings.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) &&
    (!catFilter || i.cat === catFilter)
  )
  function openAdd() { setEdit(null); setForm({ name: "", cat: "Carni", unit: "kg", cur: "" }); setErr({}); setOpen(true) }
  function openEdit(i) { setEdit(i); setForm({ name: i.name, cat: i.cat, unit: i.unit, cur: String(i.cur) }); setErr({}); setOpen(true) }
  function save() {
    const e = {}
    if (!form.name.trim()) e.name = "Obbligatorio"
    if (!form.cur || +form.cur <= 0) e.cur = "Prezzo > 0"
    if (Object.keys(e).length) { setErr(e); return }
    const newCur = +form.cur
    const oldAvg = edit ? edit.avg : newCur
    const newAvg = edit ? Math.round(((oldAvg * 0.7) + (newCur * 0.3)) * 100) / 100 : newCur
    const d = { name: form.name.trim(), cat: form.cat, unit: form.unit, cur: newCur, avg: newAvg }
    if (edit) { setIngs(prev => prev.map(i => i.id === edit.id ? { ...i, ...d } : i)) } else { setIngs(prev => [...prev, { ...d, id: "i" + uid() }]) }
    setOpen(false)
  }
  function doDelete() { setIngs(prev => prev.filter(i => i.id !== delTarget.id)); setDelTarget(null) }
  return (
    <div>
      <div style={row({ justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", alignItems: "flex-start" })}>
        <div><div style={{ fontFamily: "'Georgia',serif", fontSize: 20, color: S.t1 }}>Ingredienti</div><div style={{ fontSize: 12, color: S.t3 }}>{list.length} ingredienti</div></div>
        <button style={btn("p")} onClick={openAdd}>+ Nuovo</button>
      </div>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca ingrediente..." style={{ ...inp(), maxWidth: 260, marginBottom: 8 }} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
        {["", ...CATS_ALL].map(c => (
          <button key={c} onClick={() => setCatFilter(c)}
            style={{ padding: "3px 10px", background: catFilter === c ? S.acg : "none", border: "1px solid " + (catFilter === c ? S.acd : "#2a2a31"), borderRadius: 999, color: catFilter === c ? S.ac : S.t3, fontFamily: "inherit", fontSize: 11, cursor: "pointer" }}>
            {c || "Tutte"}
          </button>
        ))}
      </div>
      {isMobile ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {list.map(ing => {
            const spiked = (ing.cur - ing.avg) / ing.avg > 0.10
            return (
              <div key={ing.id} style={card({ padding: "16px" })}>
                <div style={row({ justifyContent: "space-between", marginBottom: 8 })}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: S.t1 }}>{ing.name}</div>
                  <span style={badge("n")}>{ing.cat}</span>
                </div>
                <div style={row({ justifyContent: "space-between", marginBottom: 12 })}>
                  <span style={{ fontSize: 15, color: spiked ? S.red : S.t2, fontWeight: spiked ? 700 : 400 }}>{F(ing.cur)}/{ing.unit} {spiked ? "+" : ""}</span>
                  <span style={{ fontSize: 13, color: S.t3 }}>Media: {F(ing.avg)}/{ing.unit}</span>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button style={{ ...btn("s", { fontSize: 14, padding: "10px", flex: 1 }) }} onClick={() => openEdit(ing)}>Modifica</button>
                  <button style={{ ...btn("s", { fontSize: 14, padding: "10px", flex: 1 }), color: S.red }} onClick={() => setDelTarget(ing)}>Elimina</button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div style={{ border: S.bds, borderRadius: S.r2, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead><tr>{["Ingrediente", "Categoria", "Unità", "Prezzo attuale", "Media storica", ""].map(h => <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: S.t3, background: S.surf, borderBottom: S.bds }}>{h}</th>)}</tr></thead>
            <tbody>
              {list.map(ing => {
                const spiked = (ing.cur - ing.avg) / ing.avg > 0.10
                return (
                  <tr key={ing.id}>
                    <td style={{ padding: "11px 16px", fontWeight: 500, color: S.t1, borderBottom: S.bds }}>{ing.name}</td>
                    <td style={{ padding: "11px 16px", borderBottom: S.bds }}><span style={badge("n")}>{ing.cat}</span></td>
                    <td style={{ padding: "11px 16px", color: S.t2, borderBottom: S.bds }}>{ing.unit}</td>
                    <td style={{ padding: "10px 14px", color: spiked ? S.red : S.t1, fontWeight: spiked ? 600 : 400, borderBottom: S.bds, fontVariantNumeric: "tabular-nums" }}>{F(ing.cur)}/{ing.unit} {spiked ? "↑" : ""}</td>
                    <td style={{ padding: "11px 16px", color: S.t2, borderBottom: S.bds, fontVariantNumeric: "tabular-nums" }}>{F(ing.avg)}/{ing.unit}</td>
                    <td style={{ padding: "11px 16px", borderBottom: S.bds, textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                        <button style={btn("g", { fontSize: 12, padding: "4px 9px" })} onClick={() => openEdit(ing)}>Modifica</button>
                        <button style={{ ...btn("g", { fontSize: 12, padding: "4px 9px" }), color: S.red }} onClick={() => setDelTarget(ing)}>Elimina</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={edit ? "Modifica ingrediente" : "Nuovo ingrediente"}
        footer={<><button style={btn("g")} onClick={() => setOpen(false)}>Annulla</button><button style={btn("p")} onClick={save}>Salva</button></>}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ gridColumn: "1/-1" }}><Fld label="Nome *"><input style={inp()} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="es. Petto di pollo" />{err.name && <span style={{ fontSize: 11, color: S.red }}>{err.name}</span>}</Fld></div>
          <Fld label="Categoria"><select style={inp({ appearance: "none", cursor: "pointer" })} value={form.cat} onChange={e => setForm(f => ({ ...f, cat: e.target.value }))}>{["Carni", "Pesce", "Verdure", "Latticini", "Salumi", "Pasta & Cereali", "Olio & Grassi", "Scatolame", "Surgelati", "Bevande", "Spezie & Aromi", "Altro"].map(c => <option key={c}>{c}</option>)}</select></Fld>
          <Fld label="Unità"><select style={inp({ appearance: "none", cursor: "pointer" })} value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}>{["kg", "g", "l", "ml", "pz"].map(u => <option key={u}>{u}</option>)}</select></Fld>
          <Fld label={"Prezzo attuale (€/" + form.unit + ") *"}><input style={inp()} type="number" step="0.01" value={form.cur} onChange={e => setForm(f => ({ ...f, cur: e.target.value }))} placeholder="0.00" />{err.cur && <span style={{ fontSize: 11, color: S.red }}>{err.cur}</span>}<span style={{ fontSize: 11, color: S.t3, marginTop: 2 }}>{edit && edit.avg ? "Media storica attuale: " + F(edit.avg) + "/" + form.unit : "Il sistema calcolerà la media automaticamente"}</span></Fld>
        </div>
      </Modal>

      {delTarget && (
        <div onClick={e => e.target === e.currentTarget && setDelTarget(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 1000 }}>
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
  const [cat, setCat] = useState("")
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState(null)
  const [delTarget, setDelTarget] = useState(null)
  const [edit, setEdit] = useState(null)
  const [form, setForm] = useState({ name: "", cat: "primo", target: "28" })
  const [recipe, setRecipe] = useState([])
  const [err, setErr] = useState({})
  const list = dishes.filter(d => !cat || d.cat === cat)
  const UNITS = ["kg", "g", "l", "ml", "pz"]

  function openAdd() {
    setEdit(null)
    setForm({ name: "", cat: "primo", target: "28" })
    setRecipe([{ id: uid(), ingId: "", qty: "", unit: "kg", waste: "0" }])
    setErr({})
    setOpen(true)
  }
  function openEdit(d) {
    setEdit(d)
    setForm({ name: d.name, cat: d.cat, target: String(Math.round(d.target * 100)) })
    // Carica ricetta salvata nel piatto, fallback su RECIPES statici
    const savedRecipe = d.recipe && d.recipe.length > 0
      ? d.recipe.map(r => ({ id: uid(), ingId: r.ingId, qty: String(r.qty), unit: r.unit, waste: String(r.waste || "0") }))
      : RECIPES[d.id]
        ? RECIPES[d.id].map(r => ({ id: uid(), ingId: r.id, qty: String(r.qty), unit: r.unit, waste: String(Math.round((r.waste - 1) * 100)) }))
        : [{ id: uid(), ingId: "", qty: "", unit: "kg", waste: "0" }]
    setRecipe(savedRecipe)
    setErr({})
    setDetail(null)
    setOpen(true)
  }
  function confirmDelete(d) { setDelTarget(d); setDetail(null) }
  function doDelete() { setDishes(prev => prev.filter(x => x.id !== delTarget.id)); setDelTarget(null) }

  function addRow() { setRecipe(r => [...r, { id: uid(), ingId: "", qty: "", unit: "kg", waste: "0" }]) }
  function removeRow(id) { setRecipe(r => r.filter(x => x.id !== id)) }
  function updateRow(id, patch) { setRecipe(r => r.map(x => x.id === id ? { ...x, ...patch } : x)) }

  // Converti quantità ricetta nell'unità dell'ingrediente
  function toIngUnit(qty, rowUnit, ingUnit) {
    if (rowUnit === ingUnit) return qty
    if (rowUnit === "g"  && ingUnit === "kg") return qty / 1000
    if (rowUnit === "kg" && ingUnit === "g")  return qty * 1000
    if (rowUnit === "ml" && ingUnit === "l")  return qty / 1000
    if (rowUnit === "l"  && ingUnit === "ml") return qty * 1000
    return qty
  }

  const liveCost = recipe.reduce((sum, row) => {
    const ing = ings.find(i => i.id === row.ingId)
    if (!ing || !row.qty) return sum
    const qty = parseFloat(row.qty) || 0
    const wasteMult = 1 + (parseFloat(row.waste) || 0) / 100
    const lineQty = toIngUnit(qty, row.unit, ing.unit)
    return sum + lineQty * ing.cur * wasteMult
  }, 0)

  const targetPct = (parseFloat(form.target) || 28) / 100
  const suggestedPrice = targetPct > 0 ? liveCost / targetPct : 0
  const r2 = n => Math.round(n * 100) / 100

  function save() {
    const e = {}
    if (!form.name.trim()) e.name = "Obbligatorio"
    if (!form.target || +form.target <= 0 || +form.target > 100) e.target = "Valore 1-100"
    if (recipe.every(r => !r.ingId)) e.recipe = "Aggiungi almeno un ingrediente"
    if (Object.keys(e).length) { setErr(e); return }
    const cost = r2(liveCost)
    const price = r2(suggestedPrice)
    const fc = price > 0 ? r2(cost / price) : 0
    // Salva la ricetta nel piatto per caricarla in modifica
    const savedRecipe = recipe.filter(r => r.ingId).map(r => ({
      ingId: r.ingId, qty: parseFloat(r.qty) || 0, unit: r.unit, waste: r.waste || "0"
    }))
    const d = { name: form.name.trim(), cat: form.cat, price, target: targetPct, cost, fc, margin: r2(price - cost), recipe: savedRecipe }
    if (edit) setDishes(prev => prev.map(x => x.id === edit.id ? { ...x, ...d } : x))
    else setDishes(prev => [...prev, { ...d, id: "d" + uid() }])
    setOpen(false)
  }

  function getDetailRecipe(d) {
    return RECIPES[d.id] ? RECIPES[d.id].map(r => {
      const ing = ings.find(i => i.id === r.id)
      return { ...r, ingName: ing ? ing.name : r.name, ingPrice: ing ? ing.cur : r.price, ingUnit: ing ? ing.unit : r.unit }
    }) : []
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        <div><div style={{ fontFamily: "'Georgia',serif", fontSize: 20, color: S.t1 }}>Piatti</div><div style={{ fontSize: 12, color: S.t3 }}>{list.length} piatti nel menu — clicca su una riga per la scheda completa</div></div>
        <button style={btn("p")} onClick={openAdd}>+ Nuovo piatto</button>
      </div>

      <div style={row({ flexWrap: "wrap", marginBottom: 12 })}>
        {["", "antipasto", "primo", "secondo", "dolce"].map(c => (
          <button key={c} onClick={() => setCat(c)} style={{ padding: "4px 11px", background: cat === c ? S.acg : "none", border: "1px solid " + (cat === c ? S.acd : "#2a2a31"), borderRadius: 999, color: cat === c ? S.ac : S.t3, fontFamily: "inherit", fontSize: 12, cursor: "pointer" }}>{c || "Tutti"}</button>
        ))}
      </div>

      {isMobile ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {list.map(d => (
            <div key={d.id} style={card({ padding: "16px" })} onClick={() => setDetail(d)}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: S.t1 }}>{d.name}</div>
                  <span style={{ fontSize: 12, color: S.t3, textTransform: "capitalize" }}>{d.cat}</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "'Georgia',serif", fontSize: 20, color: S.t1 }}>{d.price > 0 ? F(d.price) : "—"}</div>
                  {d.fc > 0 && <div style={{ fontSize: 13, fontWeight: 700, color: FC_COLOR(d.fc, d.target) }}>{P(d.fc)} FC</div>}
                </div>
              </div>
              {d.cost > 0 && (
                <div style={{ background: S.el, borderRadius: S.r, padding: "10px 12px", marginBottom: 10 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
                    {[{ l: "Costo", v: F(d.cost) }, { l: "Margine", v: F(d.margin) }, { l: "Target", v: P(d.target) }].map((k, i) => (
                      <div key={i}>
                        <div style={{ fontSize: 9, textTransform: "uppercase", color: S.t3, fontWeight: 700 }}>{k.l}</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: S.t2 }}>{k.v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ height: 4, background: S.surf, borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: Math.min(d.fc * 100, 100) + "%", background: FC_COLOR(d.fc, d.target), borderRadius: 999 }} />
                  </div>
                </div>
              )}
              <div style={{ display: "flex", gap: 10 }} onClick={e => e.stopPropagation()}>
                <button style={{ ...btn("s", { fontSize: 14, padding: "10px", flex: 1 }) }} onClick={() => openEdit(d)}>Modifica</button>
                <button style={{ ...btn("s", { fontSize: 14, padding: "10px", flex: 1 }), color: S.red }} onClick={() => confirmDelete(d)}>Elimina</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ border: S.bds, borderRadius: S.r2, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead><tr>
              {["Piatto", "Prezzo", "Costo ricetta", "Food Cost %", "Margine", "Stato", ""].map(h => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: S.t3, background: S.surf, borderBottom: S.bds }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>{list.map(d => (
              <tr key={d.id} onClick={() => setDetail(d)} style={{ cursor: "pointer" }}
                onMouseEnter={e => { for (const td of e.currentTarget.cells) td.style.background = S.el }}
                onMouseLeave={e => { for (const td of e.currentTarget.cells) td.style.background = "" }}>
                <td style={{ padding: "11px 16px", borderBottom: S.bds }}>
                  <div style={{ fontWeight: 500, color: S.t1 }}>{d.name}</div>
                  <div style={{ fontSize: 11, color: S.t3, textTransform: "capitalize" }}>{d.cat}</div>
                </td>
                <td style={{ padding: "11px 16px", borderBottom: S.bds, fontVariantNumeric: "tabular-nums", fontWeight: 600, color: S.t1 }}>{d.price > 0 ? F(d.price) : "—"}</td>
                <td style={{ padding: "11px 16px", borderBottom: S.bds, fontVariantNumeric: "tabular-nums", color: S.t2 }}>{d.cost > 0 ? F(d.cost) : "—"}</td>
                <td style={{ padding: "11px 16px", borderBottom: S.bds }}>
                  {d.fc > 0 ? <><div style={{ fontWeight: 600, color: FC_COLOR(d.fc, d.target) }}>{P(d.fc)}</div><div style={{ fontSize: 10, color: S.t3 }}>target {P(d.target)}</div></> : <span style={{ color: S.t3 }}>—</span>}
                </td>
                <td style={{ padding: "11px 16px", borderBottom: S.bds, fontVariantNumeric: "tabular-nums", color: S.green, fontWeight: 500 }}>{d.margin > 0 ? F(d.margin) : "—"}</td>
                <td style={{ padding: "11px 16px", borderBottom: S.bds }}>
                  {d.fc > 0 && d.fc > d.target ? <span style={badge("r")}>Sopra target</span> : d.fc > 0 ? <span style={badge("g")}>OK</span> : <span style={badge("n")}>Senza ricetta</span>}
                </td>
                <td style={{ padding: "11px 16px", borderBottom: S.bds, textAlign: "right" }} onClick={e => e.stopPropagation()}>
                  <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                    <button style={btn("g", { fontSize: 12, padding: "4px 10px" })} onClick={() => openEdit(d)}>Modifica</button>
                    <button style={{ ...btn("g", { fontSize: 12, padding: "4px 10px" }), color: S.red }} onClick={() => confirmDelete(d)}>Elimina</button>
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      {detail && (
        <div onClick={e => e.target === e.currentTarget && setDetail(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "28px 20px", zIndex: 999, overflowY: "auto" }}>
          <div style={{ background: S.surf, border: S.bd, borderRadius: 16, width: "100%", maxWidth: 560, margin: "auto" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "20px 22px 0" }}>
              <div>
                <div style={{ fontFamily: "'Georgia',serif", fontSize: 20, color: S.t1, marginBottom: 3 }}>{detail.name}</div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={badge("n", { textTransform: "capitalize" })}>{detail.cat}</span>
                  {detail.fc > 0 && detail.fc > detail.target
                    ? <span style={badge("r")}>Sopra target</span>
                    : detail.fc > 0 ? <span style={badge("g")}>Food cost OK</span>
                    : <span style={badge("n")}>Senza ricetta</span>}
                </div>
              </div>
              <button onClick={() => setDetail(null)} style={{ background: S.el, border: S.bd, borderRadius: S.r, width: 28, height: 28, cursor: "pointer", color: S.t3 }}>x</button>
            </div>

            <div style={{ padding: "16px 22px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10, marginBottom: 16 }}>
                {[
                  { l: "Prezzo di vendita", v: detail.price > 0 ? F(detail.price) : "—", c: S.t1, highlight: false },
                  { l: "Costo ricetta",     v: detail.cost > 0 ? F(detail.cost) : "—",  c: S.t2, highlight: false },
                  { l: "Food cost %",       v: detail.fc > 0 ? P(detail.fc) : "—",       c: detail.fc > 0 ? FC_COLOR(detail.fc, detail.target) : S.t3, highlight: true },
                  { l: "Margine lordo",     v: detail.margin > 0 ? F(detail.margin) : "—", c: S.green, highlight: true },
                ].map((k, i) => (
                  <div key={i} style={{ background: S.el, border: S.bd, borderRadius: S.r, padding: "12px 14px" }}>
                    <div style={{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.08em", color: S.t3, fontWeight: 600, marginBottom: 4 }}>{k.l}</div>
                    <div style={{ fontFamily: "'Georgia',serif", fontSize: 22, color: k.c, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>{k.v}</div>
                    {k.l === "Food cost %" && detail.fc > 0 && (
                      <div style={{ fontSize: 10, color: S.t3, marginTop: 3 }}>target {P(detail.target)}</div>
                    )}
                  </div>
                ))}
              </div>

              {detail.fc > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: S.t3, marginBottom: 5 }}>
                    <span>Food cost attuale</span>
                    <span>Target {P(detail.target)}</span>
                  </div>
                  <div style={{ height: 8, background: S.el, borderRadius: 999, overflow: "hidden", position: "relative" }}>
                    <div style={{ height: "100%", width: Math.min(detail.fc * 100, 100) + "%", background: FC_COLOR(detail.fc, detail.target), borderRadius: 999, transition: "width 0.4s" }} />
                    <div style={{ position: "absolute", top: 0, bottom: 0, left: (detail.target * 100) + "%", width: 2, background: S.t3, borderRadius: 1 }} />
                  </div>
                </div>
              )}

              {(() => {
                const rec = getDetailRecipe(detail)
                if (rec.length === 0) return (
                  <div style={{ textAlign: "center", padding: "24px 0", color: S.t3, fontSize: 13 }}>
                    Nessuna ricetta salvata — clicca Modifica per aggiungere gli ingredienti
                  </div>
                )
                return (
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: S.t3, marginBottom: 8 }}>Composizione ricetta</div>
                    <div style={{ border: S.bd, borderRadius: S.r, overflow: "hidden" }}>
                      {rec.map((r, i) => {
                        const wastePct = Math.round((r.waste - 1) * 100)
                        const lineQty = r.unit === "g" && r.ingUnit === "kg" ? r.qty / 1000 : r.unit === "ml" && r.ingUnit === "l" ? r.qty / 1000 : r.qty
                        const lineCost = r2(lineQty * r.ingPrice * r.waste)
                        const share = detail.cost > 0 ? Math.round(lineCost / detail.cost * 100) : 0
                        return (
                          <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px 60px", gap: 8, padding: "10px 14px", borderBottom: i < rec.length - 1 ? S.bds : "none", alignItems: "center" }}>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 500, color: S.t1 }}>{r.ingName}</div>
                              <div style={{ fontSize: 10.5, color: S.t3 }}>{r.qty} {r.unit}{wastePct > 0 ? " · scarto " + wastePct + "%" : ""}</div>
                            </div>
                            <span style={{ fontSize: 12, color: S.t2, fontVariantNumeric: "tabular-nums" }}>{F(r.ingPrice)}/{r.ingUnit}</span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: S.ac, fontVariantNumeric: "tabular-nums" }}>{F(lineCost)}</span>
                            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                              <div style={{ fontSize: 10, color: S.t3, textAlign: "right" }}>{share}%</div>
                              <div style={{ height: 4, background: S.el, borderRadius: 999, overflow: "hidden" }}>
                                <div style={{ height: "100%", width: share + "%", background: S.ac, borderRadius: 999 }} />
                              </div>
                            </div>
                          </div>
                        )
                      })}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px 60px", gap: 8, padding: "10px 14px", background: S.el, alignItems: "center" }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: S.t2, textTransform: "uppercase", letterSpacing: "0.06em" }}>Totale costo</span>
                        <span />
                        <span style={{ fontSize: 14, fontWeight: 700, color: S.t1, fontVariantNumeric: "tabular-nums" }}>{detail.cost > 0 ? F(detail.cost) : "—"}</span>
                        <span />
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 22px 18px" }}>
              <button style={{ ...btn("g", { fontSize: 12, padding: "5px 12px" }), color: S.red }} onClick={() => confirmDelete(detail)}>Elimina piatto</button>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={btn("g")} onClick={() => setDetail(null)}>Chiudi</button>
                <button style={btn("p")} onClick={() => openEdit(detail)}>Modifica</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {delTarget && (
        <div onClick={e => e.target === e.currentTarget && setDelTarget(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 1000 }}>
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

      {open && (
        <div onClick={e => e.target === e.currentTarget && setOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 999 }}>
          <div style={{ background: S.surf, border: S.bd, borderRadius: 16, width: "100%", maxWidth: 680, maxHeight: "calc(100vh - 32px)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px 14px", flexShrink: 0, borderBottom: S.bds }}>
              <span style={{ fontFamily: "'Georgia',serif", fontSize: 18, color: S.t1 }}>{edit ? "Modifica piatto" : "Nuovo piatto"}</span>
              <button onClick={() => setOpen(false)} style={{ background: S.el, border: S.bd, borderRadius: S.r, width: 28, height: 28, cursor: "pointer", color: S.t3 }}>x</button>
            </div>
            <div style={{ padding: "16px 22px", overflowY: "auto", flex: 1 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
                <div style={{ gridColumn: "1/-1" }}>
                  <Fld label="Nome piatto *">
                    <input style={inp()} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="es. Risotto allo zafferano" />
                    {err.name && <span style={{ fontSize: 11, color: S.red }}>{err.name}</span>}
                  </Fld>
                </div>
                <Fld label="Categoria">
                  <select style={inp({ appearance: "none", cursor: "pointer" })} value={form.cat} onChange={e => setForm(f => ({ ...f, cat: e.target.value }))}>
                    {["antipasto", "primo", "secondo", "contorno", "dolce", "bevanda"].map(c => <option key={c}>{c}</option>)}
                  </select>
                </Fld>
                <Fld label="Food cost target %">
                  <input style={inp()} type="number" step="1" min="1" max="100" value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value }))} placeholder="28" />
                  {err.target && <span style={{ fontSize: 11, color: S.red }}>{err.target}</span>}
                </Fld>
                <div style={{ display: "flex", alignItems: "flex-end" }}>
                  <div style={{ background: S.acg, border: "1px solid " + S.acd, borderRadius: S.r, padding: "9px 12px", width: "100%" }}>
                    <div style={{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.08em", color: S.t3, fontWeight: 600, marginBottom: 3 }}>Prezzo consigliato</div>
                    <div style={{ fontFamily: "'Georgia',serif", fontSize: 20, color: S.ac, fontVariantNumeric: "tabular-nums" }}>{liveCost > 0 ? F(suggestedPrice) : "—"}</div>
                    <div style={{ fontSize: 10, color: S.t3, marginTop: 2 }}>al {form.target || 28}% food cost</div>
                  </div>
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: S.t3 }}>Ingredienti ricetta</span>
                  <button style={btn("g", { fontSize: 12, padding: "4px 10px" })} onClick={addRow}>+ Aggiungi ingrediente</button>
                </div>
                {err.recipe && <div style={{ fontSize: 11, color: S.red, marginBottom: 6 }}>{err.recipe}</div>}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 70px 80px 90px 28px", gap: 6, padding: "6px 8px", background: S.el, borderRadius: "6px 6px 0 0", border: S.bd, borderBottom: "none" }}>
                  {["Ingrediente", "Quantità", "Unità", "Scarto %", "Costo riga", ""].map(h => <span key={h} style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: S.t3 }}>{h}</span>)}
                </div>
                <div style={{ border: S.bd, borderRadius: "0 0 6px 6px", overflow: "hidden" }}>
                  {recipe.map((row, idx) => {
                    const ing = ings.find(i => i.id === row.ingId)
                    const qty = parseFloat(row.qty) || 0
                    const wasteMult = 1 + (parseFloat(row.waste) || 0) / 100
                    const lineQty = ing ? toIngUnit(qty, row.unit, ing.unit) : qty
                    const lineCost = ing && qty > 0 ? r2(lineQty * ing.cur * wasteMult) : 0
                    return (
                      <div key={row.id} style={{ display: "grid", gridTemplateColumns: "1fr 80px 70px 80px 90px 28px", gap: 6, padding: "8px 8px", borderBottom: idx < recipe.length - 1 ? S.bds : "none", alignItems: "center", background: idx % 2 === 0 ? "transparent" : S.el + "55" }}>
                        <select style={inp({ padding: "7px 8px", fontSize: 12.5, appearance: "none", cursor: "pointer" })} value={row.ingId} onChange={e => updateRow(row.id, { ingId: e.target.value })}>
                          <option value="">Seleziona...</option>
                          {ings.map(i => <option key={i.id} value={i.id}>{i.name} ({F(i.cur)}/{i.unit})</option>)}
                        </select>
                        <input style={inp({ padding: "7px 8px", fontSize: 12.5 })} type="number" step="0.001" min="0" placeholder="0" value={row.qty} onChange={e => updateRow(row.id, { qty: e.target.value })} />
                        <select style={inp({ padding: "7px 8px", fontSize: 12.5, appearance: "none", cursor: "pointer" })} value={row.unit} onChange={e => updateRow(row.id, { unit: e.target.value })}>
                          {UNITS.map(u => <option key={u}>{u}</option>)}
                        </select>
                        <div style={{ position: "relative" }}>
                          <input style={inp({ padding: "7px 24px 7px 8px", fontSize: 12.5 })} type="number" step="1" min="0" max="99" placeholder="0" value={row.waste} onChange={e => updateRow(row.id, { waste: e.target.value })} />
                          <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: S.t3, pointerEvents: "none" }}>%</span>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          {lineCost > 0 ? <span style={{ fontSize: 12.5, fontWeight: 600, color: S.ac, fontVariantNumeric: "tabular-nums" }}>{F(lineCost)}</span> : <span style={{ fontSize: 12, color: S.t3 }}>—</span>}
                          {ing && qty > 0 && parseFloat(row.waste) > 0 && <div style={{ fontSize: 9.5, color: S.t3 }}>lordo: {r2(qty * wasteMult)}{row.unit}</div>}
                        </div>
                        <button onClick={() => removeRow(row.id)} style={{ background: "none", border: "none", color: S.t3, cursor: "pointer", fontSize: 14, padding: 2 }}>x</button>
                      </div>
                    )
                  })}
                </div>
              </div>
              {liveCost > 0 && (
                <div style={{ background: S.el, border: S.bd, borderRadius: S.r, padding: 14 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: S.t3, marginBottom: 10 }}>Calcolo automatico</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                    {[{ l: "Costo ricetta", v: F(r2(liveCost)), c: S.t1 }, { l: "Prezzo consigliato", v: F(r2(suggestedPrice)), c: S.ac }, { l: "Food cost %", v: P(targetPct), c: FC_COLOR(targetPct, targetPct) }, { l: "Margine lordo", v: F(r2(suggestedPrice - liveCost)), c: S.green }].map((k, i) => (
                      <div key={i} style={{ background: S.surf, border: S.bd, borderRadius: 6, padding: "10px 12px" }}>
                        <div style={{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.07em", color: S.t3, fontWeight: 600, marginBottom: 3 }}>{k.l}</div>
                        <div style={{ fontFamily: "'Georgia',serif", fontSize: 16, color: k.c, fontVariantNumeric: "tabular-nums" }}>{k.v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "12px 22px 18px", borderTop: S.bds, flexShrink: 0 }}>
              <button style={btn("g")} onClick={() => setOpen(false)}>Annulla</button>
              <button style={btn("p")} onClick={save}>{edit ? "Salva modifiche" : "Crea piatto"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Invoices({ invs, setInvs, ings, setIngs, isMobile }) {
  const CATS = ["Carni", "Pesce", "Verdure", "Latticini", "Salumi", "Pasta & Cereali", "Olio & Grassi", "Scatolame", "Surgelati", "Bevande", "Spezie & Aromi", "Altro"]
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
            const MAX_W = 1200, MAX_H = 1600
            let w = img.width, h = img.height
            if (w > MAX_W) { h = Math.round(h * MAX_W / w); w = MAX_W }
            if (h > MAX_H) { w = Math.round(w * MAX_H / h); h = MAX_H }
            const canvas = document.createElement("canvas")
            canvas.width = w; canvas.height = h
            canvas.getContext("2d").drawImage(img, 0, 0, w, h)
            URL.revokeObjectURL(url)
            canvas.toBlob(blob => res(blob || file), "image/jpeg", 0.75)
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
                  text: 'Sei un esperto contabile italiano. Analizza questa fattura ed estrai TUTTI i dati. Rispondi SOLO con JSON valido senza markdown ne backtick. Formato esatto: {"fornitore":"nome fornitore","numero":"numero fattura","data":"YYYY-MM-DD","totale":0.00,"iva":0.00,"prodotti":[{"nome":"nome prodotto","quantita":0.0,"unita":"kg","prezzoUnitario":0.00}]}. Per ogni prodotto calcola il prezzo unitario per kg o litro. Se un campo non e presente usa stringa vuota o 0.'
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

      // Auto-categorizzazione ingrediente per nome
      function guessCat(nome) {
        const n = nome.toLowerCase()
        if (/pollo|manzo|maiale|vitello|agnello|coniglio|tacchino|salsicc|wurstel|cotechino|pancetta|lardo|guanciale|girello|fesa|bistecca|braciola|arrosto|spezzatino|macinato|cinghiale|anatra|piccione|quaglia/.test(n)) return "Carni"
        if (/pesce|merluzzo|salmone|tonno|branzino|orata|sogliola|baccalà|acciuga|sarda|cozze|vongole|gamberi|scampi|calamari|polpo|seppia|aragosta|astice|granchio|anguilla|dentice|spigola/.test(n)) return "Pesce"
        if (/spinaci gelo|piselli surgelati|fagiolini surgelati|mais surgelato|misto mare|surgelat/.test(n)) return "Surgelati"
        if (/pomodor|insalata|lattuga|zucchine|melanzane|peperone|cipolla|aglio|carota|sedano|finocchio|broccoli|cavolfiore|asparagi|funghi|radicchio|rucola|spinaci|patate|bietola|carciofo|piselli|fagiolini|mais|zucca|porri|cetrioli|avocado/.test(n)) return "Verdure"
        if (/parmigiano|mozzarella|grana|pecorino|burro|latte|panna|yogurt|ricotta|fontina|asiago|brie|gorgonzola|provolone|scamorza|mascarpone|formaggio|uova|uovo/.test(n)) return "Latticini"
        if (/prosciutto|salame|mortadella|bresaola|coppa|speck|culatello|nduja|lonza|soppressata|finocchiona/.test(n)) return "Salumi"
        if (/pasta|riso|farro|orzo|farina|semola|gnocchi|polenta|quinoa|couscous|bulgur|pane|grissini|crackers/.test(n)) return "Pasta & Cereali"
        if (/olio|burro|strutto|margarina|lardo/.test(n)) return "Olio & Grassi"
        if (/pelati|passata|conserva|tonno scatola|sardine scatola|fagioli scatola|ceci scatola|lenticchie scatola|acciughe scatola/.test(n)) return "Scatolame"
        if (/vino|birra|acqua|succo|coca|aranciata|limonata|aperol|campari|gin|vodka|rum|whisky|grappa|amaro/.test(n)) return "Bevande"
        if (/sale|pepe|zucchero|aceto|limone|rosmarino|timo|basilico|origano|prezzemolo|salvia|menta|curry|paprika|cannella|vaniglia|chiodi|noce moscata|curcuma/.test(n)) return "Spezie & Aromi"
        return "Altro"
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
          return {
            nome: p.nome, quantita: p.quantita, unita: p.unita,
            prezzoUnitario: p.prezzoUnitario,
            tipo: "new", ingId: null, ingName: null,
            cat: guessCat(p.nome), include: true
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
        return { ...ing, cur: newCur, avg: newAvg }
      }))
    }

    // Aggiungi nuovi ingredienti
    const toAdd = toProcess.filter(p => p.tipo === "new")
    if (toAdd.length > 0) {
      const newIngs = toAdd.map(p => ({
        id: "i" + uid(),
        name: p.nome,
        cat: p.cat,
        unit: p.unita || "kg",
        cur: p.prezzoUnitario,
        avg: p.prezzoUnitario,
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
              <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: S.t1, marginBottom: 4 }}>Scatta una foto</div>
              <div style={{ fontSize: 12, color: S.t3 }}>Apre direttamente la fotocamera</div>
            </label>
            <label style={{ display: "block", border: "2px dashed #2a2a31", borderRadius: 10, padding: 20, textAlign: "center", cursor: "pointer", background: S.el }}>
              <input type="file" accept="image/*,.pdf"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
                style={{ display: "none" }}
              />
              <div style={{ fontSize: 22, marginBottom: 6 }}>📁</div>
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

function Sales({ sales, setSales, isMobile }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ date: "", shift: "Cena", food: "", bev: "", cov: "", other: "", covers: "" })
  const tR = sales.reduce((s, e) => s + e.total, 0)
  const tC = sales.reduce((s, e) => s + e.covers, 0)
  const tF = sales.reduce((s, e) => s + e.food, 0)
  const tB = sales.reduce((s, e) => s + e.bev, 0)
  const live = (parseFloat(form.food) || 0) + (parseFloat(form.bev) || 0) + (parseFloat(form.cov) || 0) + (parseFloat(form.other) || 0)
  function save() {
    if (live <= 0 || !form.date) return
    setSales(prev => [{ id: "s" + uid(), date: form.date, shift: form.shift, food: parseFloat(form.food) || 0, bev: parseFloat(form.bev) || 0, cov: parseFloat(form.cov) || 0, other: parseFloat(form.other) || 0, total: live, covers: parseInt(form.covers) || 0 }, ...prev])
    setOpen(false)
  }
  return (
    <div>
      <div style={row({ justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", alignItems: "flex-start" })}>
        <div><div style={{ fontFamily: "'Georgia',serif", fontSize: 20, color: S.t1 }}>Vendite</div><div style={{ fontSize: 12, color: S.t3 }}>{sales.length} registrazioni</div></div>
        <button style={btn("p")} onClick={() => { setForm({ date: new Date().toISOString().slice(0, 10), shift: "Cena", food: "", bev: "", cov: "", other: "", covers: "" }); setOpen(true) }}>+ Registra incasso</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 10, marginBottom: 14 }}>
        {[{ l: "Incasso totale", v: F(tR) }, { l: "Cibo", v: F(tF) + " (" + P(tF / tR) + ")" }, { l: "Bevande", v: F(tB) + " (" + P(tB / tR) + ")" }, { l: "Ticket medio", v: F(tR / tC) }].map((k, i) => (
          <div key={i} style={card({ padding: "12px 14px" })}><div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: S.t3, fontWeight: 600, marginBottom: 4 }}>{k.l}</div><div style={{ fontFamily: "'Georgia',serif", fontSize: 19, color: S.t1 }}>{k.v}</div></div>
        ))}
      </div>
      {isMobile ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {sales.map((s, i) => (
            <div key={s.id || i} style={card({ padding: "16px" })}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: S.t1 }}>{D(s.date)}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: S.t1 }}>{F(s.total)}</div>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={badge("n")}>{s.shift}</span>
                <span style={{ fontSize: 13, color: S.t3 }}>{s.covers} coperti</span>
                <span style={{ fontSize: 13, color: S.t3, marginLeft: "auto" }}>Cibo {F(s.food)}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ border: S.bds, borderRadius: S.r2, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead><tr>{["Data", "Turno", "Cibo", "Bevande", "Coperti", "Totale"].map(h => <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: S.t3, background: S.surf, borderBottom: S.bds }}>{h}</th>)}</tr></thead>
            <tbody>{sales.map((s, i) => (
              <tr key={s.id || i}>
                <td style={{ padding: "11px 16px", fontWeight: 500, color: S.t1, borderBottom: S.bds }}>{D(s.date)}</td>
                <td style={{ padding: "11px 16px", borderBottom: S.bds }}><span style={badge("n")}>{s.shift}</span></td>
                <td style={{ padding: "11px 16px", color: S.t2, borderBottom: S.bds, fontVariantNumeric: "tabular-nums" }}>{F(s.food)}</td>
                <td style={{ padding: "11px 16px", color: S.t2, borderBottom: S.bds, fontVariantNumeric: "tabular-nums" }}>{F(s.bev)}</td>
                <td style={{ padding: "11px 16px", color: S.t2, borderBottom: S.bds }}>{s.covers}</td>
                <td style={{ padding: "11px 16px", fontWeight: 600, color: S.t1, borderBottom: S.bds, fontVariantNumeric: "tabular-nums" }}>{F(s.total)}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="Registra incasso"
        footer={<><button style={btn("g")} onClick={() => setOpen(false)}>Annulla</button><button style={btn("p")} onClick={save}>Registra</button></>}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Fld label="Data *"><input style={inp()} type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></Fld>
          <Fld label="Turno"><select style={inp({ appearance: "none", cursor: "pointer" })} value={form.shift} onChange={e => setForm(f => ({ ...f, shift: e.target.value }))}><option>Cena</option><option>Pranzo</option></select></Fld>
          <Fld label="Cibo / Cucina (euro)"><input style={inp()} type="number" step="0.01" value={form.food} onChange={e => setForm(f => ({ ...f, food: e.target.value }))} placeholder="0.00" /></Fld>
          <Fld label="Bevande (euro)"><input style={inp()} type="number" step="0.01" value={form.bev} onChange={e => setForm(f => ({ ...f, bev: e.target.value }))} placeholder="0.00" /></Fld>
          <Fld label="Coperto / Pane (euro)"><input style={inp()} type="number" step="0.01" value={form.cov} onChange={e => setForm(f => ({ ...f, cov: e.target.value }))} placeholder="0.00" /></Fld>
          <Fld label="Numero coperti"><input style={inp()} type="number" value={form.covers} onChange={e => setForm(f => ({ ...f, covers: e.target.value }))} placeholder="0" /></Fld>
          <div style={{ gridColumn: "1/-1", background: S.el, border: S.bd, borderRadius: S.r, padding: "11px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: S.t3 }}>Totale incasso</span>
            <span style={{ fontFamily: "'Georgia',serif", fontSize: 20, color: S.t1, fontVariantNumeric: "tabular-nums" }}>{F(live)}</span>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function FoodCost({ dishes, ings, isMobile }) {
  const [sel, setSel] = useState(null)
  const [ov, setOv] = useState({})
  const dish = dishes.find(d => d.id === sel)

  function toIngUnit(qty, rowUnit, ingUnit) {
    if (rowUnit === ingUnit) return qty
    if (rowUnit === "g"  && ingUnit === "kg") return qty / 1000
    if (rowUnit === "kg" && ingUnit === "g")  return qty * 1000
    if (rowUnit === "ml" && ingUnit === "l")  return qty / 1000
    if (rowUnit === "l"  && ingUnit === "ml") return qty * 1000
    return qty
  }

  // Usa ricetta salvata nel piatto, fallback su RECIPES statici
  const items = sel ? (
    dish?.recipe?.length > 0
      ? dish.recipe.map(r => {
          const ing = ings.find(i => i.id === r.ingId)
          return {
            id: r.ingId,
            name: ing ? ing.name : r.ingId,
            qty: r.qty,
            unit: r.unit,
            price: ing ? ing.cur : 0,
            ingUnit: ing ? ing.unit : r.unit,
            waste: 1 + (parseFloat(r.waste) || 0) / 100
          }
        })
      : (RECIPES[sel] || []).map(r => {
          const ing = ings.find(i => i.id === r.id)
          return { ...r, ingUnit: ing ? ing.unit : r.unit, price: ing ? ing.cur : r.price }
        })
  ) : []

  const liveItems = items.map(it => {
    const p = ov[it.id] !== undefined && ov[it.id] !== "" ? parseFloat(ov[it.id]) || it.price : it.price
    const lineQty = toIngUnit(it.qty, it.unit, it.ingUnit || it.unit)
    const lc = Math.round(lineQty * p * it.waste * 100) / 100
    return { ...it, lp: p, lc }
  })
  const total = liveItems.reduce((s, i) => s + i.lc, 0)
  const fcPct = dish ? total / dish.price : 0
  const margin = dish ? dish.price - total : 0
  const isSim = Object.values(ov).some(v => v !== undefined && v !== "")
  return (
    <div>
      <div style={{ fontFamily: "'Georgia',serif", fontSize: 20, color: S.t1, marginBottom: 6 }}>Food Cost — Simulatore</div>
      <div style={{ fontSize: 12, color: S.t3, marginBottom: 16 }}>Clicca un piatto, poi modifica i prezzi nella colonna "Simula" per vedere l'impatto in tempo reale</div>
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 14 }}>
        <div style={{ border: S.bds, borderRadius: S.r2, overflow: "hidden" }}>
          <div style={{ padding: "9px 12px", borderBottom: S.bds, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: S.t3 }}>Seleziona piatto</div>
          {dishes.map(d => (
            <button key={d.id} onClick={() => { setSel(d.id === sel ? null : d.id); setOv({}) }} style={{ width: "100%", display: "flex", flexDirection: "column", gap: 4, padding: "10px 13px", background: sel === d.id ? S.acg : "none", border: "none", borderBottom: S.bds, cursor: "pointer", textAlign: "left" }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: S.t1 }}>{d.name}</span>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, color: S.t3 }}>{F(d.price)}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: FC_COLOR(d.fc, d.target) }}>{P(d.fc)}</span>
              </div>
            </button>
          ))}
        </div>
        <div>
          {!sel ? (
            <div style={{ ...card({ padding: 40, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 280 }) }}><span style={{ color: S.t3, fontSize: 13 }}>Seleziona un piatto dalla lista</span></div>
          ) : (
            <div style={col({ gap: 12 })}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                {[{ l: "Prezzo", v: F(dish.price), c: S.t1, sim: false }, { l: "Costo ricetta", v: F(total), c: S.t1, sim: isSim }, { l: "Food cost %", v: P(fcPct), c: FC_COLOR(fcPct, dish.target), sim: isSim }, { l: "Margine lordo", v: F(margin), c: margin > 0 ? S.green : S.red, sim: isSim }].map((k, i) => (
                  <div key={i} style={{ background: k.sim ? S.acg : S.el, border: "1px solid " + (k.sim ? S.acd : "#2a2a31"), borderRadius: 6, padding: "10px 12px", position: "relative" }}>
                    <div style={{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.08em", color: S.t3, fontWeight: 600, marginBottom: 4 }}>{k.l}</div>
                    <div style={{ fontFamily: "'Georgia',serif", fontSize: 17, color: k.c, fontVariantNumeric: "tabular-nums" }}>{k.v}</div>
                    {k.sim && <span style={{ position: "absolute", top: 5, right: 7, fontSize: 8.5, color: S.ac, fontWeight: 700 }}>sim</span>}
                  </div>
                ))}
              </div>
              {fcPct > dish.target && <div style={{ display: "flex", gap: 9, padding: "10px 13px", background: S.rd, border: "1px solid rgba(248,113,113,0.25)", borderRadius: 6, fontSize: 13, color: S.t2 }}><span style={{ color: S.ac }}>!</span><span>Food cost <b style={{ color: S.t1 }}>{P(fcPct)}</b> sopra il target {P(dish.target)}. Per rientrare porta il prezzo a <b style={{ color: S.t1 }}>{F(Math.round(total / dish.target * 100) / 100)}</b>.</span></div>}
              <div style={{ background: S.el, border: S.bd, borderRadius: S.r2, padding: 14 }}>
                <div style={row({ justifyContent: "space-between", marginBottom: 10 })}>
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: S.t3 }}>Ingredienti — modifica "Simula" per vedere l'impatto</span>
                  {isSim && <button style={btn("g", { fontSize: 11, padding: "3px 8px" })} onClick={() => setOv({})}>Reset</button>}
                </div>
                {liveItems.map(it => {
                  const hasOv = ov[it.id] !== undefined && ov[it.id] !== "" && parseFloat(ov[it.id]) !== it.price
                  return (
                    <div key={it.id} style={{ display: "grid", gridTemplateColumns: "1fr 70px 120px 90px 120px", gap: 10, padding: "8px 0", borderBottom: S.bds, alignItems: "center" }}>
                      <div><div style={{ fontSize: 13, fontWeight: 500, color: S.t1 }}>{it.name}</div><div style={{ fontSize: 10.5, color: S.t3 }}>scarto x{it.waste} — {it.qty} {it.unit}</div></div>
                      <span style={{ fontSize: 12, color: S.t2, fontVariantNumeric: "tabular-nums" }}>{it.qty} {it.unit}</span>
                      <span style={{ fontSize: 12.5, color: hasOv ? S.ac : S.t2, fontVariantNumeric: "tabular-nums" }}>{F(it.lp)}/{it.unit}{hasOv && <span style={{ display: "block", fontSize: 10, color: S.t3, textDecoration: "line-through" }}>{F(it.price)}</span>}</span>
                      <span style={{ fontSize: 12.5, fontWeight: hasOv ? 600 : 400, color: hasOv ? S.ac : S.t2, fontVariantNumeric: "tabular-nums" }}>{F(it.lc)}</span>
                      <input type="number" step="0.01" min="0" placeholder={String(it.price)} value={ov[it.id] !== undefined ? ov[it.id] : ""} onChange={e => setOv(p => ({ ...p, [it.id]: e.target.value }))} style={{ ...inp({ fontSize: 12.5, padding: "5px 8px" }), borderColor: hasOv ? S.ac : "#2a2a31", color: hasOv ? S.ac : S.t2 }} />
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AIInsights({ dismissed, setDismissed, isMobile }) {
  const visible = INSIGHTS.filter(i => !dismissed.includes(i.id))
  const totalGain = visible.reduce((s, i) => s + i.gain, 0)
  const sevColor = { critical: S.red, high: "#fb923c", medium: S.ac, low: S.t3 }
  return (
    <div>
      <div style={row({ justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", alignItems: "flex-start" })}>
        <div><div style={{ fontFamily: "'Georgia',serif", fontSize: 20, color: S.t1 }}>AI Insights</div><div style={{ fontSize: 12, color: S.t3 }}>{visible.length} insight — risparmio potenziale <span style={{ color: S.green, fontWeight: 600 }}>{F(totalGain)}/mese</span></div></div>
        <button style={btn("p")}>Genera nuovi insight</button>
      </div>
      {visible.map(ins => (
        <div key={ins.id} style={{ background: S.surf, border: S.bds, borderLeft: "3px solid " + sevColor[ins.sev], borderRadius: S.r2, padding: "14px 16px", marginBottom: 9 }}>
          <div style={row({ justifyContent: "space-between", marginBottom: 6 })}>
            <div style={row({ gap: 8 })}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: sevColor[ins.sev], display: "inline-block", boxShadow: "0 0 5px " + sevColor[ins.sev] }} />
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: S.t3 }}>{ins.sev}</span>
            </div>
            <button onClick={() => setDismissed(d => [...d, ins.id])} style={{ background: "none", border: "none", color: S.t3, cursor: "pointer", fontSize: 12 }}>x</button>
          </div>
          <div style={{ fontSize: 14.5, fontWeight: 600, color: S.t1, marginBottom: 5 }}>{ins.title}</div>
          <div style={{ fontSize: 13, color: S.t2, lineHeight: 1.6, marginBottom: 12 }}>{ins.body}</div>
          <div style={row({ justifyContent: "space-between" })}>
            <button style={btn("s", { fontSize: 12, padding: "5px 12px" })}>{ins.action}</button>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: S.green, background: S.gd, padding: "2px 10px", borderRadius: 999, border: "1px solid rgba(74,222,128,0.2)" }}>+{F(ins.gain)}/mese</span>
          </div>
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
    language: "Lingua",
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
    language: "Language",
  }
}

// ── Login Page ────────────────────────────────────────────────────
function LoginPage({ lang, setLang }) {
  const t = T[lang]
  const [mode, setMode] = useState("login") // login | register | reset
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

      {/* Language switcher */}
      <div style={{ position: "fixed", top: 16, right: 16, display: "flex", gap: 6 }}>
        {["it","en"].map(l => (
          <button key={l} onClick={() => setLang(l)} style={{ padding: "4px 10px", background: lang === l ? S.acg : "none", border: `1px solid ${lang === l ? S.acd : "#2a2a31"}`, borderRadius: 999, color: lang === l ? S.ac : S.t3, fontFamily: "inherit", fontSize: 11, fontWeight: 700, cursor: "pointer", textTransform: "uppercase" }}>{l}</button>
        ))}
      </div>

      {/* Logo */}
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <div style={{ width: 72, height: 72, background: S.ac, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <FMPercentIcon size={44} />
        </div>
        <div style={{ fontFamily: "'Georgia',serif", fontSize: 26, color: S.t1, letterSpacing: "-0.02em" }}>FoodMargin</div>
        <div style={{ fontSize: 13, color: S.t3, marginTop: 4 }}>{t.appDesc}</div>
      </div>

      {/* Card */}
      <div style={{ width: "100%", maxWidth: 380, background: S.surf, border: S.bd, borderRadius: 16, padding: "28px 24px" }}>
        <div style={{ fontFamily: "'Georgia',serif", fontSize: 18, color: S.t1, marginBottom: 20 }}>
          {mode === "login" ? t.login : mode === "register" ? t.register : t.resetPwd}
        </div>

        {info && <div style={{ marginBottom: 14, padding: "10px 14px", background: S.gd, border: "1px solid rgba(74,222,128,0.25)", borderRadius: 8, fontSize: 13, color: S.green }}>{info}</div>}
        {err && <div style={{ marginBottom: 14, padding: "10px 14px", background: S.rd, border: "1px solid rgba(248,113,113,0.25)", borderRadius: 8, fontSize: 13, color: S.red }}>{err}</div>}

        {/* Email */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 11.5, fontWeight: 500, color: S.t2, display: "block", marginBottom: 4 }}>{t.email}</label>
          <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            style={{ width: "100%", padding: "10px 12px", background: S.el, border: S.bd, borderRadius: 8, color: S.t1, fontFamily: "inherit", fontSize: 14, outline: "none", boxSizing: "border-box" }}
            placeholder="nome@email.com" />
        </div>

        {/* Password */}
        {mode !== "reset" && (
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11.5, fontWeight: 500, color: S.t2, display: "block", marginBottom: 4 }}>{t.password}</label>
            <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              style={{ width: "100%", padding: "10px 12px", background: S.el, border: S.bd, borderRadius: 8, color: S.t1, fontFamily: "inherit", fontSize: 14, outline: "none", boxSizing: "border-box" }}
              placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handleSubmit()} />
          </div>
        )}

        {/* Confirm password */}
        {mode === "register" && (
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11.5, fontWeight: 500, color: S.t2, display: "block", marginBottom: 4 }}>{t.confirmPwd}</label>
            <input type="password" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
              style={{ width: "100%", padding: "10px 12px", background: S.el, border: S.bd, borderRadius: 8, color: S.t1, fontFamily: "inherit", fontSize: 14, outline: "none", boxSizing: "border-box" }}
              placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handleSubmit()} />
          </div>
        )}

        {/* Forgot password */}
        {mode === "login" && (
          <div style={{ textAlign: "right", marginBottom: 16 }}>
            <button onClick={() => { setMode("reset"); setErr("") }} style={{ background: "none", border: "none", color: S.t3, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>{t.forgotPwd}</button>
          </div>
        )}

        {/* Submit */}
        <button onClick={handleSubmit} disabled={loading}
          style={{ width: "100%", padding: "12px", background: S.ac, color: "#0d0d0f", border: "none", borderRadius: 8, fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer", marginBottom: 12, opacity: loading ? 0.7 : 1 }}>
          {loading ? "..." : mode === "login" ? t.login : mode === "register" ? t.register : t.resetPwd}
        </button>

        {/* Google */}
        {mode !== "reset" && (
          <button onClick={handleGoogle} disabled={loading}
            style={{ width: "100%", padding: "12px", background: S.el, color: S.t1, border: S.bd, borderRadius: 8, fontFamily: "inherit", fontSize: 13, fontWeight: 500, cursor: "pointer", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <span style={{ fontSize: 16 }}>G</span> {t.loginGoogle}
          </button>
        )}

        {/* Switch mode */}
        <div style={{ textAlign: "center", fontSize: 13, color: S.t3 }}>
          {mode === "login" && <>{t.noAccount} <button onClick={() => { setMode("register"); setErr("") }} style={{ background: "none", border: "none", color: S.ac, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600 }}>{t.register}</button></>}
          {mode === "register" && <>{t.haveAccount} <button onClick={() => { setMode("login"); setErr("") }} style={{ background: "none", border: "none", color: S.ac, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600 }}>{t.login}</button></>}
          {mode === "reset" && <button onClick={() => { setMode("login"); setErr("") }} style={{ background: "none", border: "none", color: S.ac, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600 }}>← {t.login}</button>}
        </div>
      </div>
    </div>
  )
}

// ── FM% Icon ──────────────────────────────────────────────────────
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

const NAV = [
  { id: "dash", label: "Dashboard", icon: "◈", group: "Gestione" },
  { id: "ing", label: "Ingredienti", icon: "⬡", group: "Gestione" },
  { id: "dishes", label: "Piatti", icon: "◎", group: "Gestione" },
  { id: "inv", label: "Fatture", icon: "▤", group: "Gestione" },
  { id: "sales", label: "Vendite", icon: "◫", group: "Gestione" },
  { id: "fc", label: "Food Cost", icon: "◬", group: "Analisi" },
  { id: "ai", label: "AI Insights", icon: "✦", group: "AI", badge: "5" },
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
  const [sales,     setSales]     = useState(INIT_SALES)
  const [dismissed, setDismissed] = useState([])

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
          if (d.sales)     setSales(d.sales)
          if (d.dismissed) setDismissed(d.dismissed)
        }
      } catch (e) { console.log("Load error:", e) }
      setReady(true)
    }
    load()
  }, [user])

  // Save data per user
  useEffect(() => {
    if (!ready || !user) return
    setDoc(doc(db, "users", user.uid, "data", "main"), { ings, dishes, invs, sales, dismissed }, { merge: true })
      .catch(e => console.log("Save error:", e))
  }, [ings, dishes, invs, sales, dismissed, ready, user])

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
  const pages = {
    dash:   <Dashboard sales={sales} dishes={dishes} isMobile={isMobile} />,
    ing:    <Ingredients ings={ings} setIngs={setIngs} isMobile={isMobile} />,
    dishes: <Dishes dishes={dishes} setDishes={setDishes} ings={ings} isMobile={isMobile} />,
    inv:    <Invoices invs={invs} setInvs={setInvs} ings={ings} setIngs={setIngs} isMobile={isMobile} />,
    sales:  <Sales sales={sales} setSales={setSales} isMobile={isMobile} />,
    fc:     <FoodCost dishes={dishes} ings={ings} isMobile={isMobile} />,
    ai:     <AIInsights dismissed={dismissed} setDismissed={setDismissed} isMobile={isMobile} />,
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
        {pages[page]}
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
          {pages[page]}
        </div>
      </div>
    </div>
  )
}

const PROMPT = `Sei un esperto contabile per la ristorazione italiana. Analizza questo testo estratto da una fattura e restituisci SOLO JSON valido senza markdown, senza testo prima o dopo.

## 1. INDIVIDUA LE COLONNE
Prima di tutto trova la riga di intestazione della tabella prodotti.
Cerca e memorizza la posizione di queste colonne:
- DESCRIZIONE: "Descrizione", "Articolo", "Prodotto"
- QUANTITÀ: "Qta", "Qtà", "Quantità", "Quantità Netta", "QTA.F", "Q"
- PREZZO: "Prezzo", "Prezzo Unitario", "Prezzo Netto", "P.Unit", "Pr.Unit", "€/UM"
- UNITÀ: "UM", "U.M.", "Um", "Unità", "UM.F"
- SCONTO: "Sconto", "Sc", "Sc%", "Scontistica" — può essere assente

Se esistono colonne doppie come QTA.V/QTA.F o UM.V/UM.F usa SEMPRE QTA.F e UM.F.
Ignora completamente: Imponibile, Importo, Totale riga, IVA%, codici articolo numerici.

## 2. LETTURA RIGHE — REGOLA FONDAMENTALE
- Elabora UNA riga alla volta, dall'alto verso il basso
- Per ogni riga prodotto: segui SEMPRE la colonna identificata al punto 1
- Il valore nella colonna PREZZO di una riga appartiene SOLO a quella riga
- MAI spostare il prezzo di una riga su un'altra riga
- Se una riga non ha un valore nella colonna PREZZO — salta quella riga
- Se SCONTO è presente: prezzoUnitario = Prezzo × (1 - Sconto/100)
- Se SCONTO è assente: prezzoUnitario = Prezzo

## 3. NOMI PRODOTTI
- Massimo 8 parole, nome più completo possibile
- NO codici articolo alfanumerici (es. AA1234, 640982, 000359)
- Se UM è pz/conf/cf/cassa/cartone/bottiglia → includi peso/volume nel nome (es. "Maionese 5kg", "Uova 30pz", "Olio EVO 5l")
- Includi SEMPRE nel nome se presenti:
  - Conservazione: al naturale, sott'aceto, sott'olio, affumicato, salmistrato, marinato, fermentato
  - Stato: fresco, precotto, prec, cotto, crudo, abbattuto, abb, decongelato, dec
  - Surgelazione: surgelato, gelo, IQF, frozen, ultra frozen, superfrozen, glassato, glass, -18
  - Tagli: intero, metà, filetti, filoni, trancio, pulito, sporco, mondato, sgusciato
  - Osso: C/O, S/O, DIS — Testa: C/T, S/T
  - Calibri gamberi: 1°, 2°, 3°, 4°
  - Calibri polpo: T1–T9 — Calamari: U5 U10 1P 2P 3P 4P
  - Calibri pesce: 100/300g, 300/500g, 500/1000g
  - Origine: (MAR), (SEN), (THA), (CHN), (IND), (ITA)
  - Classe: CL.A — Abbreviazioni: B.A., S/V, ATM, TR
- Esempi: "Gambero Rosso 2° IQF", "Polpo Pulito T2 IQF", "Fesa B.A. C/O S/V", "Coscia Pollo CL.A S"

## 4. UNITÀ DI MISURA
Usa SEMPRE la colonna UM della fattura convertita in minuscolo:
KG/Kg → kg | LT/Lt/LITRI → l | PZ/pz/NR/nr/N → pz | ML/ml → ml
Default: kg per carni/pesce/formaggi/verdura/frutta | l per liquidi/bevande | pz solo per uova/limoni/dadi/pezzi interi

## 5. CATEGORIE
Carni - sotto1: Bovino, Maiale, Pollo, Tacchino, Agnello, Anatra, Coniglio, Selvaggina, Avicoli
Pesce - sotto1: Orata, Branzino, Salmone, Pesce Spada, Tonno, Ricciola, Dentice, Cernia, Ombrina, Crostacei, Molluschi, Scampi, Totani, Canocchie, Altri Pesci
Freschi - sotto1: Formaggi Nobili, Latticini, Salumi, Altri Freschi
Frutta e Verdura - sotto1: Frutta, Verdure, Erbe aromatiche
Surgelati - sotto1: Carni, Pesce, Verdure, Gelati e Dolci, Preparati
  → Surgelato SOLO se: nome contiene surgelato/frozen/IQF/gelo/glassato/abbattuto/ABB, oppure lettera S o C come ultima parola STACCATA (es. "Piselli S"), oppure attaccata a numero+unità (es. "2,5kgS"). NON se S/C fanno parte di una parola (Carrés, Naturalis) o seguiti da altri caratteri (S/V, C/O)
Dispensa - sotto1: Conserve, Condimenti, Secchi, Bevande analcoliche, Bevande alcoliche, Superalcolici, Detersivi
  → Secchi: farine, riso, pasta secca, frutta secca, legumi secchi, biscotti secchi, cioccolato, zucchero, sale, spezie
  → Conserve: pelati, passata, tonno scatola, acciughe, capperi, olive, sottaceti, legumi pronti
  → Detersivi: sgrassatore, detergente, candeggina, spugna, sacchi, pellicola, guanti, carta igienica, lavastoviglie, disincrostante, brillantante, igienizzante, inox, wc, caustica, forno, rational, secchio, mocio, scopa, mop, carta mani, asciugamani, nettapavimenti

Ovoprodotti (pasta d'uovo, misto d'uovo, tuorlo/albume pastorizzato) → Freschi/Altri Freschi. NON confondere con pasta secca.

## 6. OUTPUT JSON
Restituisci SOLO questo JSON, nessun testo prima o dopo, nessun markdown:
{"fornitore":"","numero":"","data":"YYYY-MM-DD","totale":0,"iva":0,"prodotti":[{"nome":"","categoria":"","sotto1":"","sotto2":"","quantita":0,"unita":"kg o pz o l","prezzoUnitario":0,"sconto":"","produttore":""}]}`

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  if (req.method === "OPTIONS") return res.status(200).end()
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })

  try {
    const { text, base64, prompt } = req.body

    // Costruisci il contenuto del messaggio
    let messageContent
    if (text) {
      // Nuovo flusso: testo da Tesseract
      messageContent = [
        { type: "text", text: PROMPT + "\n\nTESTO FATTURA:\n" + text }
      ]
    } else if (base64) {
      // Vecchio flusso fallback: immagine diretta
      messageContent = [
        { type: "image", source: { type: "base64", media_type: "image/jpeg", data: base64 } },
        { type: "text", text: prompt || PROMPT }
      ]
    } else {
      return res.status(400).json({ error: "Nessun contenuto ricevuto" })
    }

    // Retry automatico su errori temporanei
    let response, data
    for (let attempt = 1; attempt <= 2; attempt++) {
      response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_KEY,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 4096,
          messages: [{ role: "user", content: messageContent }]
        })
      })
      data = await response.json()
      if (!data.error || attempt === 2) break
      // Aspetta 1 secondo prima del retry
      await new Promise(r => setTimeout(r, 1000))
    }

    if (data.error) return res.status(400).json({ error: data.error.message || "Errore Claude" })

    const text_out = data.content?.[0]?.text || ""
    return res.status(200).json({ text: text_out })

  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

export const config = { api: { bodyParser: { sizeLimit: '10mb' } } }

// Prompt integrato nella funzione - non serve passarlo dal frontend
const PROMPT = "Sei un esperto contabile per la ristorazione italiana. Analizza questa fattura e restituisci SOLO JSON valido senza markdown, senza testo prima o dopo. ## 1. INDIVIDUA LE COLONNE Prima di tutto trova la riga di intestazione della tabella prodotti. Cerca e memorizza la posizione (sinistra/centro/destra) di queste colonne: - DESCRIZIONE: \"Descrizione\", \"Articolo\", \"Prodotto\" - QUANTIT\u00c0: \"Qta\", \"Qt\u00e0\", \"Quantit\u00e0\", \"Quantit\u00e0 Netta\", \"Q\" - PREZZO: \"Prezzo\", \"Prezzo Unitario\", \"Prezzo Netto\", \"P.Unit\", \"Pr.Unit\", \"\u20ac/UM\" - UNIT\u00c0: \"UM\", \"U.M.\", \"Um\", \"Unit\u00e0\" - SCONTO: \"Sconto\", \"Sc\", \"Sc%\", \"Scontistica\" \u2014 pu\u00f2 essere assente Ignora completamente: Imponibile, Importo, Totale riga, IVA%, codici articolo. ## 2. LETTURA RIGHE \u2014 REGOLA FONDAMENTALE - Elabora UNA riga alla volta, dall'alto verso il basso - Per ogni riga prodotto: segui SEMPRE la colonna identificata al punto 1 - NON usare la posizione numerica delle celle \u2014 usa la colonna intestata - Il valore nella colonna PREZZO di una riga appartiene SOLO a quella riga - MAI spostare il prezzo di una riga su un'altra riga - Se una riga non ha un valore nella colonna PREZZO \u2014 salta quella riga - Se SCONTO \u00e8 presente: prezzoUnitario = Prezzo \u00d7 (1 - Sconto/100) - Se SCONTO \u00e8 assente: prezzoUnitario = Prezzo - RIGHE CON DESCRIZIONE LUNGA: se la descrizione di un prodotto occupa pi\u00f9 righe visive, considerale come UN SOLO prodotto. Il prezzo \u00e8 sempre nella riga dove INIZIA la descrizione, nella colonna PREZZO. NON leggere il prezzo dalla riga successiva. Ignora le righe di continuazione della descrizione. - COLONNA IVA: i valori 4, 5, 10, 22 sono percentuali IVA, NON prezzi. La colonna IVA \u00e8 sempre l'ultima a destra. Non confonderla mai con la colonna PREZZO. - PRODOTTI SIMILI CON VARIANTI: se due righe hanno lo stesso prodotto ma con varianti diverse (taglia S/M/L/XL, misura, colore, formato) sono DUE prodotti separati. Includi SEMPRE la variante nel nome (es. \"Guanti Nitrile Neri L 100pz\", \"Guanti Nitrile Neri M 100pz\"). NON collassarli in un unico prodotto. - UNICIT\u00c0: ogni riga della fattura genera UN SOLO prodotto nel JSON. Non duplicare mai la stessa riga. ## 3. NOMI PRODOTTI - Massimo 8 parole, nome pi\u00f9 completo possibile - NO codici articolo alfanumerici (es. AA1234, 640982) - Se UM \u00e8 pz/conf/cf/cassa/cartone/bottiglia \u2192 includi peso/volume nel nome (es. \"Maionese 5kg\", \"Uova 30pz\", \"Olio EVO 5l\") - Includi SEMPRE nel nome se presenti: - Conservazione: al naturale, sott'aceto, sott'olio, affumicato, salmistrato, marinato, fermentato - Stato: fresco, precotto, prec, cotto, crudo, abbattuto, abb, decongelato, dec - Surgelazione: surgelato, gelo, IQF, frozen, ultra frozen, superfrozen, glassato, glass, -18 - Tagli: intero, met\u00e0, filetti, filoni, trancio, pulito, sporco, mondato, sgusciato - Osso: C/O, S/O, DIS \u2014 Testa: C/T, S/T - Calibri gamberi: 1\u00b0, 2\u00b0, 3\u00b0, 4\u00b0 - Calibri polpo: T1\u2013T9 \u2014 Calamari: U5 U10 1P 2P 3P 4P - Calibri pesce: 100/300g, 300/500g, 500/1000g - Origine: (MAR), (SEN), (THA), (CHN), (IND), (ITA) - Classe: CL.A \u2014 Abbreviazioni: B.A., S/V, ATM, TR - Grattugiato: se la descrizione contiene gratt, grattuggiato, grattugiato \u2192 includi SEMPRE \"Gratt\" nel nome (es. \"Parmigiano Reggiano Gratt 1kg\", \"Pecorino Romano Gratt 1kg\") - Varianti taglia/misura/formato: includi SEMPRE nel nome (es. \"Guanti Nitrile Neri L 100pz\", \"Guanti Nitrile Neri M 100pz\") - Esempi: \"Gambero Rosso 2\u00b0 IQF\", \"Polpo Pulito T2 IQF\", \"Fesa B.A. C/O S/V\", \"Coscia Pollo CL.A S\" ## 4. UNIT\u00c0 DI MISURA Usa SEMPRE la colonna UM della fattura convertita in minuscolo: KG/Kg \u2192 kg | LT/Lt/LITRI \u2192 l | PZ/pz/NR/nr/N \u2192 pz | ML/ml \u2192 ml Default: kg per carni/pesce/formaggi/verdura/frutta | l per liquidi/bevande | pz solo per uova/limoni/dadi/pezzi interi ## 5. CATEGORIE **Carni** - sotto1: Bovino, Maiale, Pollo, Tacchino, Agnello, Anatra, Coniglio, Selvaggina, Avicoli **Pesce** - sotto1: Orata, Branzino, Salmone, Pesce Spada, Tonno, Ricciola, Dentice, Cernia, Ombrina, Crostacei, Molluschi, Scampi, Totani, Canocchie, Altri Pesci **Freschi** - sotto1: Formaggi Nobili, Latticini, Salumi, Altri Freschi **Frutta e Verdura** - sotto1: Frutta, Verdure, Erbe aromatiche **Surgelati** - sotto1: Carni, Pesce, Verdure, Gelati e Dolci, Preparati \u2192 Surgelato SOLO se: nome contiene surgelato/frozen/IQF/gelo/glassato/abbattuto/ABB, oppure lettera S o C come ultima parola STACCATA (es. \"Piselli S\"), oppure attaccata a numero+unit\u00e0 (es. \"2,5kgS\"). NON se S/C fanno parte di una parola (Carr\u00e9s, Naturalis) o seguiti da altri caratteri (S/V, C/O) **Dispensa** - sotto1: Conserve, Condimenti, Secchi, Bevande analcoliche, Bevande alcoliche, Superalcolici, Detersivi \u2192 Secchi: farine, riso, pasta secca, frutta secca, legumi secchi, biscotti secchi, cioccolato, zucchero, sale, spezie \u2192 Conserve: pelati, passata, tonno scatola, acciughe, capperi, olive, sottaceti, legumi pronti \u2192 Detersivi: sgrassatore, detergente, candeggina, spugna, sacchi, pellicola, guanti, carta igienica, lavastoviglie, disincrostante, brillantante, igienizzante, inox, wc, caustica, forno, rational, secchio, mocio, scopa, mop, carta mani, asciugamani, nettapavimenti **Uova e Ovoprodotti** \u2014 usare SEMPRE categoria Freschi/Altri Freschi: uova fresche intere, uova sfuse, uova categoria A, tuorlo pastorizzato, albume pastorizzato, misto uovo, pasta d'uovo. NON usare mai \"Ovoprodotti\" come categoria \u2014 non esiste nel sistema. ## 6. OUTPUT JSON Restituisci SOLO questo JSON, nessun testo prima o dopo, nessun markdown: {\"fornitore\":\"\",\"numero\":\"\",\"data\":\"YYYY-MM-DD\",\"totale\":0,\"iva\":0,\"prodotti\":[{\"nome\":\"\",\"categoria\":\"\",\"sotto1\":\"\",\"sotto2\":\"\",\"quantita\":0,\"unita\":\"kg o pz o l\",\"prezzoUnitario\":0,\"sconto\":\"\",\"produttore\":\"\"}]}"

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  if (req.method === "OPTIONS") return res.status(200).end()
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })

  try {
    const { base64 } = req.body

    if (!base64) return res.status(400).json({ error: "base64 mancante" })

    // Usa il prompt passato dal frontend se presente, altrimenti usa quello integrato
    const prompt = req.body.prompt || PROMPT

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 4096,
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: "image/jpeg", data: base64 } },
            { type: "text", text: prompt }
          ]
        }]
      })
    })

    const data = await response.json()
    if (data.error) return res.status(400).json({ error: data.error.message || data.error.type || "Errore Claude" })

    const text = data.content?.[0]?.text || ""
    return res.status(200).json({ text })

  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

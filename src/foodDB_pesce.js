// ─────────────────────────────────────────────────────────────────────────────
// foodDB_pesce.js — Database PESCE per Ristorai
// Struttura: nome (matching) + testo (varianti) + sotto1/sotto2 + unit
// Fonti: catalogo MARR + catalogo Selecta
// ─────────────────────────────────────────────────────────────────────────────

export const PESCE_DB = [

  // ══════════════════════════════════════════════════════════════════════════
  // PESCI DI MARE — ALLEVATI
  // ══════════════════════════════════════════════════════════════════════════

  { nome: "Orata", testo: "varianti: filetto, filetti, intero | stati: fresco, congelato, IQF, abbattuto | origine: nazionale, greca, turca, Levantina, Ammare | calibri: 300/500g, 500/800g, 800/1200g", sotto1: "Orata", sotto2: "", unit: "kg" },
  { nome: "Branzino", testo: "alias: spigola | varianti: filetto, filetti, intero | stati: fresco, congelato, IQF | origine: nazionale, greca, turca, Levantina, Ammare | calibri: 300/500g, 500/800g", sotto1: "Branzino", sotto2: "", unit: "kg" },
  { nome: "Spigola", testo: "alias branzino | varianti: filetto, intero | fresco, congelato", sotto1: "Branzino", sotto2: "", unit: "kg" },
  { nome: "Ricciola", testo: "varianti: filetto, filone, trancio, intero | stati: fresco, congelato, IQF, ultra frozen | Ammare, allevata", sotto1: "Ricciola", sotto2: "", unit: "kg" },
  { nome: "Ombrina", testo: "alias: ombrina occellata | varianti: filetto, intero | fresco, congelato | Ammare", sotto1: "Ombrina", sotto2: "", unit: "kg" },
  { nome: "Rombo", testo: "alias: rombo chiodato, rombo liscio | varianti: filetto, trancio, intero | fresco, congelato | Ammare | calibri: 1/2kg, 2/4kg", sotto1: "Rombo", sotto2: "", unit: "kg" },
  { nome: "Sogliola", testo: "varianti: filetto, intera | fresca, congelata | Ammare | calibri: 100/200g, 200/300g", sotto1: "Sogliola", sotto2: "", unit: "kg" },
  { nome: "Salmone", testo: "varianti: filetto, filone, trancio, intero | stati: fresco, congelato, IQF, ultra frozen, affumicato | origine: Atlantico, Norvegese, Scozzese, Canada, pescato | marchi: Balik, Coln Valley | calibri: 3/4kg, 4/5kg, 5/6kg", sotto1: "Salmone", sotto2: "", unit: "kg" },
  { nome: "Carbonaro", testo: "alias: carbonaro d'Alaska, black cod | varianti: filetto | congelato, IQF | Ammare", sotto1: "Salmone", sotto2: "", unit: "kg" },
  { nome: "Pagro", testo: "alias: pagro reale | varianti: filetto, intero | fresco, congelato | Ammare", sotto1: "Altri Pesci", sotto2: "Pagro", unit: "kg" },

  // ══════════════════════════════════════════════════════════════════════════
  // PESCI DI MARE — PESCATO
  // ══════════════════════════════════════════════════════════════════════════

  { nome: "Pesce Spada", testo: "varianti: filetto, filone, trancio | stati: fresco, congelato, IQF, ultra frozen, bonificato, affumicato | origine: Mediterraneo, Atlantico | calibri: 15/20kg, 20/30kg", sotto1: "Pesce Spada", sotto2: "", unit: "kg" },
  { nome: "Tonno Rosso", testo: "alias: tonno rosso mediterraneo, tonno rosso superfrozen | varianti: filetto, filone, trancio, ventresca | stati: fresco, ultra frozen, superfrozen, bonificato, affumicato | marchi: Ammare | calibri: 30/50kg, 50/80kg", sotto1: "Tonno", sotto2: "Tonno Rosso", unit: "kg" },
  { nome: "Tonno Yellowfin", testo: "alias: tonno pinna gialla, alalunga | varianti: filetto, filone, trancio | stati: fresco, ultra frozen, bonificato | origine: Oceano Indiano, Atlantico", sotto1: "Tonno", sotto2: "Tonno Yellowfin", unit: "kg" },
  { nome: "Tonno", testo: "varianti: filetto, filone, trancio, bottarga | stati: fresco, congelato, IQF, ultra frozen, bonificato, affumicato | calibri: 20/30kg, 30/50kg", sotto1: "Tonno", sotto2: "", unit: "kg" },
  { nome: "Dentice", testo: "varianti: filetto, trancio, intero | fresco, congelato | Mediterraneo | calibri: 500/1000g, 1/2kg", sotto1: "Dentice", sotto2: "", unit: "kg" },
  { nome: "Cernia", testo: "varianti: filetto, trancio, intera | fresca, congelata | Mediterraneo | calibri: 1/2kg, 2/4kg", sotto1: "Cernia", sotto2: "", unit: "kg" },
  { nome: "Merluzzo", testo: "alias: baccalà fresco | varianti: filetto, trancio | stati: fresco, congelato, IQF | origine: Alaska, Nord Atlantico, Atlantico Centro Orientale | marchi: Alma", sotto1: "Altri Pesci", sotto2: "Merluzzo", unit: "kg" },
  { nome: "Baccalà", testo: "alias: baccalà dissalato, baccalà ammollato | varianti: filetto, trancio, intero | leggermente salato, sotto sale | marchi: Rafols, Alma", sotto1: "Altri Pesci", sotto2: "Merluzzo", unit: "kg" },
  { nome: "Trota", testo: "alias: trota salmonata, trota iridea | varianti: filetto, intera, affumicata | fresca, congelata | allevata, nazionale", sotto1: "Acqua Dolce", sotto2: "Trota", unit: "kg" },
  { nome: "Anguilla", testo: "alias: capitone | varianti: intera, affumicata, filetto | fresca, congelata, affumicata", sotto1: "Acqua Dolce", sotto2: "Anguilla", unit: "kg" },
  { nome: "Acciughe", testo: "alias: alici | varianti: fresche, sott'olio, salate, in salamoia, filetti | origine: Mediterraneo, Cantabrico | marchi: Rosalita, Don Tonino", sotto1: "Altri Pesci", sotto2: "Acciughe", unit: "kg" },
  { nome: "Sarde", testo: "alias: sardine | varianti: fresche, sott'olio, affumicate | Mediterraneo, Adriatico", sotto1: "Altri Pesci", sotto2: "Sarde", unit: "kg" },
  { nome: "Sgombro", testo: "varianti: fresco, affumicato, sott'olio | Mediterraneo, Atlantico", sotto1: "Altri Pesci", sotto2: "Sgombro", unit: "kg" },
  { nome: "Spinarolo", testo: "alias: palombo | varianti: filetto, trancio | fresco, congelato", sotto1: "Altri Pesci", sotto2: "", unit: "kg" },
  { nome: "Coda di Rospo", testo: "alias: rana pescatrice | varianti: filetto, intera, con osso, senza osso | fresca, congelata", sotto1: "Altri Pesci", sotto2: "Coda di Rospo", unit: "kg" },

  // ══════════════════════════════════════════════════════════════════════════
  // CROSTACEI
  // ══════════════════════════════════════════════════════════════════════════

  { nome: "Gambero Rosa", testo: "alias: gambero mediterraneo, gambero grigio | calibri: small, medium, large | stati: fresco, congelato, IQF | intero, pulito, sgusciato, code | origine: Mediterraneo, Adriatico", sotto1: "Crostacei", sotto2: "Gambero Rosa", unit: "kg" },
  { nome: "Gambero Rosso", testo: "calibri: 1°, 2°, 3°, 4° | stati: fresco, congelato, IQF | intero, pulito, sgusciato, code | origine: Mazara, Sicilia, Adriatico, Porto Santo Spirito", sotto1: "Crostacei", sotto2: "Gambero Rosso", unit: "kg" },
  { nome: "Gambero Viola", testo: "calibri: 1°, 2°, 3°, 4° | congelato a bordo, IQF | Porto Santo Spirito", sotto1: "Crostacei", sotto2: "Gambero Viola", unit: "kg" },
  { nome: "Gambero Blu", testo: "alias: gambero blu adriatico | calibri: vari | fresco, congelato, IQF", sotto1: "Crostacei", sotto2: "Gambero Blu", unit: "kg" },
  { nome: "Gambero Bianco", testo: "alias: gambero imperiale, mazzancolla bianca | calibri: vari | congelato, IQF", sotto1: "Crostacei", sotto2: "Gambero Bianco", unit: "kg" },
  { nome: "Gambero Vannamei", testo: "alias: gambero tropicale, gambero indopac, gamb.indop, gambero asiatico | calibri: U5, U10, U15, 6/8, 8/12, 13/15, 16/20, 21/25, 26/30 | congelato, IQF | intero, pulito, sgusciato, code | origine: Asia, Sudamerica", sotto1: "Crostacei", sotto2: "Gambero Tropicale", unit: "kg" },
  { nome: "Gambero Tigre", testo: "alias: tiger prawn, black tiger | calibri: U5, U10, 6/8, 8/12 | congelato, IQF | intero, pulito, code", sotto1: "Crostacei", sotto2: "Gambero Tropicale", unit: "kg" },
  { nome: "Gamberetti", testo: "alias: gambero grigio, gamberetto, gambero di laguna | congelato, IQF | sgusciati, con guscio | piccola pezzatura", sotto1: "Crostacei", sotto2: "Gamberetti", unit: "kg" },
  { nome: "Mazzancolle", testo: "alias: gamberoni, gambero argentino | calibri: 6/8, 8/12, 13/15, 16/20, U5, U10 | stati: fresco, congelato, IQF | intero con testa, pulito, code | Porto Santo Spirito", sotto1: "Crostacei", sotto2: "Gamberoni", unit: "kg" },
  { nome: "Scampo", testo: "alias: langoustine, scampo norvegese | calibri: 3/5, 5/7, 7/10, 10/20, 20/40 | stati: fresco, congelato, IQF | intero, code, decorticato | origine: Scozia, Norvegia, Porcupine | marchi: Premium Shellfish, 5DO", sotto1: "Scampi", sotto2: "", unit: "kg" },
  { nome: "Aragosta", testo: "calibri: 300/500g, 500/700g, 700/1000g | congelata, IQF | intera, mezza, coda | origine: Mediterraneo, Atlantico, Caraibica", sotto1: "Crostacei", sotto2: "Aragosta", unit: "kg" },
  { nome: "Astice", testo: "alias: homard, astice americano, astice canadese, astice blu | calibri: 400/600g, 600/800g, 800/1000g, 1/1,5kg | congelato, IQF | intero vivo, cotto, mezza, coda | origine: Canada, Atlantico | marchi: Premium Shellfish", sotto1: "Crostacei", sotto2: "Astice", unit: "kg" },
  { nome: "Granchio", testo: "alias: granciporro, granchio comune | varianti: intero, polpa | fresco, congelato", sotto1: "Crostacei", sotto2: "Granchio", unit: "kg" },
  { nome: "Grancevola", testo: "alias: granseola, granceola | varianti: intera, polpa | fresca, congelata | Adriatico", sotto1: "Crostacei", sotto2: "Grancevola", unit: "kg" },
  { nome: "Granchio Reale", testo: "alias: king crab, granchio delle nevi, snow crab | varianti: zampe, polpa, intero | congelato, cotto | origine: Alaska, Russia, Norvegia | marchi: Red King Crab", sotto1: "Crostacei", sotto2: "Granchio Reale", unit: "kg" },
  { nome: "Canocchia", testo: "alias: cicala di mare, pannocchia | calibri: piccola, media, grande | fresca, congelata, IQF | Porto Santo Spirito", sotto1: "Canocchie", sotto2: "", unit: "kg" },

  // ══════════════════════════════════════════════════════════════════════════
  // MOLLUSCHI — CEFALOPODI
  // ══════════════════════════════════════════════════════════════════════════

  { nome: "Calamaro", testo: "calibri: U5, U10, 1P, 2P, 3P, 4P, 3/5cm, 100/300g, 300/500g, 500/1000g | stati: fresco, congelato, IQF | pulizia: pulito, sporco, intero | varianti: anelli, ciuffi, tubi | origine: (MAR), (SEN), (THA), (CHN), (IND), (NLD), FAO34 | marchi: B.Line, Marfrio, Orof, Justfish", sotto1: "Molluschi", sotto2: "Calamaro", unit: "kg" },
  { nome: "Calamaretto", testo: "alias: calamaretti | calibri: piccoli, baby | fresco, congelato, IQF | pulito, sporco", sotto1: "Molluschi", sotto2: "Calamaro", unit: "kg" },
  { nome: "Totano", testo: "alias: totani | calibri: S, M, G | congelato, IQF | pulizia: pulito, sporco | varianti: anelli, tubi, tentacoli, fettuccine | origine: (SEN), (MAR), Atlantico | marchi: Justfish", sotto1: "Totani", sotto2: "", unit: "kg" },
  { nome: "Polpo", testo: "calibri: T1, T2, T3, T4, T5, T6, T7, T8, T9, 200/300g, 300/500g, 500/1000g, 1/2kg, 2/3kg | stati: fresco, congelato, IQF, cotto, abbattuto | pulizia: pulito, sporco, mondato | varianti: tentacoli, intero | origine: (MAR), (SEN), (MRT), (MEDIT) | marchi: Porto Santo Spirito", sotto1: "Molluschi", sotto2: "Polpo", unit: "kg" },
  { nome: "Moscardino", testo: "alias: moscardini | calibri: piccoli, baby | fresco, congelato, IQF | cotto, crudo", sotto1: "Molluschi", sotto2: "Polpo", unit: "kg" },
  { nome: "Seppia", testo: "calibri: U1, U2, 1/2, 8/12, 20/40, 500/1000g, 1/2kg | stati: fresca, congelata, IQF | pulizia: pulita, sporca, mondata | varianti: intera, con nero | origine: (IND), (MAR), (SEN), (ITA) | marchi: Orof, Porto Santo Spirito", sotto1: "Molluschi", sotto2: "Seppia", unit: "kg" },
  { nome: "Seppiolina", testo: "alias: seppie piccole, baby seppia | fresca, congelata, IQF | pulita, sporca", sotto1: "Molluschi", sotto2: "Seppia", unit: "kg" },

  // ══════════════════════════════════════════════════════════════════════════
  // MOLLUSCHI — BIVALVI
  // ══════════════════════════════════════════════════════════════════════════

  { nome: "Cozze", testo: "alias: mitili | varianti: con guscio, sgusciate, spurgate, precotte | stati: fresca, congelata, IQF | calibri: 46/60, 80/100, 200/300 | origine: (CHL), (NZL), nazionale | Porto Santo Spirito", sotto1: "Molluschi", sotto2: "Cozze", unit: "kg" },
  { nome: "Vongole", testo: "alias: vongole veraci, lupini | varianti: con guscio, sgusciate, spurgate | fresche, congelate, IQF | Porto Santo Spirito", sotto1: "Molluschi", sotto2: "Vongole", unit: "kg" },
  { nome: "Ostrica", testo: "alias: ostriche | varianti: piatta, concava, calibri N°1 N°2 N°3 N°4 N°5 | fresca | origine: Bretagna, Normandia, Irlanda, Portogallo, nazionale | marchi: Cadoret, Gillardeau, Ancelin", sotto1: "Molluschi", sotto2: "Ostrica", unit: "pz" },
  { nome: "Capasanta", testo: "alias: cappesante, saint jacques, pettine | varianti: con guscio, noce sgusciata | calibri: 10/20, 20/30, U8, U10 | fresca, congelata, IQF | origine: Atlantico, Pacifico | marchi: Rougié, Premium Shellfish", sotto1: "Molluschi", sotto2: "Capasanta", unit: "kg" },
  { nome: "Tellina", testo: "alias: telline, arselle | fresca, congelata | con guscio | Adriatico", sotto1: "Molluschi", sotto2: "Telline", unit: "kg" },
  { nome: "Fasolaro", testo: "alias: fasolari | fresco, congelato | con guscio | Adriatico", sotto1: "Molluschi", sotto2: "Fasolari", unit: "kg" },
  { nome: "Riccio di Mare", testo: "alias: ricci di mare, uni | varianti: gonadi, pasta di ricci | fresco, pastorizzato | origine: Sardegna, Adriatico, Giappone", sotto1: "Molluschi", sotto2: "Ricci di Mare", unit: "kg" },
  { nome: "Cannolicchio", testo: "alias: cannolicchi | congelato, IQF | origine: (NLD) | calibri: 5kg", sotto1: "Molluschi", sotto2: "Cannolicchi", unit: "kg" },
  { nome: "Canestrello", testo: "alias: canestrelli | sgusciati, con guscio | calibri: 20/40 | congelato, IQF", sotto1: "Molluschi", sotto2: "Fasolari", unit: "kg" },

  // ══════════════════════════════════════════════════════════════════════════
  // PRODOTTI ITTICI SPECIALI
  // ══════════════════════════════════════════════════════════════════════════

  { nome: "Bottarga", testo: "varianti: tonno rosso, muggine | intera, grattugiata, trancio | origine: Sardegna, Sicilia | marchi: Don Tonino, Carpier", sotto1: "Altri Pesci", sotto2: "Bottarga", unit: "kg" },
  { nome: "Caviale", testo: "alias: caviale asetra, caviale baerii, caviale beluga, caviale oscietra | origine: Iran, Russia, Cina, Uruguay | marchi: Prunier, Caviar House, Dieckmann Hansen, Riofrio BIO", sotto1: "Altri Pesci", sotto2: "Caviale", unit: "kg" },
  { nome: "Salmone Affumicato", testo: "alias: salmone smoked | varianti: intero, fette, trancio | origine: Scozia, Norvegia, Canada | marchi: Balik, Coln Valley", sotto1: "Altri Pesci", sotto2: "Salmone Affumicato", unit: "kg" },
  { nome: "Rana", testo: "alias: rane | varianti: fresca, gelo, cosce | disponibilità: maggio-settembre", sotto1: "Acqua Dolce", sotto2: "Rana", unit: "kg" },
]

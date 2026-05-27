// ─────────────────────────────────────────────────────────────────────────────
// foodDB_carni.js — Database CARNI per Ristorai
// Struttura: nome (matching) + testo (varianti) + sotto1/sotto2 + unit
// Fonti: catalogo MARR + catalogo Selecta
// ─────────────────────────────────────────────────────────────────────────────

export const CARNI_DB = [

  // ══════════════════════════════════════════════════════════════════════════
  // BOVINO ADULTO
  // ══════════════════════════════════════════════════════════════════════════

  { nome: "Fesa", testo: "alias: fesa di manzo, fesa B.A., fesa vitellone, fesa scottona | stati: fresca, congelata | osso: senza osso | lavorazione: intera, a fette, cotta, roast beef, all'inglese | razze: Piemontese, Angus, Wagyu, Irlanda, Scozia, Argentina | S/V, ATM", sotto1: "Bovino", sotto2: "Fesa", unit: "kg" },
  { nome: "Girello", testo: "alias: girello di manzo, girello B.A., magatello | stati: fresco, congelato | cotto, affumicato | S/V", sotto1: "Bovino", sotto2: "Girello", unit: "kg" },
  { nome: "Filetto Bovino", testo: "alias: filetto di manzo, filetto di vitellone, filetto B.A. | stati: fresco, congelato, abbattuto | intero, porzionato, tournedos, chateaubriand | razze: Piemontese, Angus, Wagyu, Black Angus, Irlanda, Scozia | S/V, ATM", sotto1: "Bovino", sotto2: "Filetto", unit: "kg" },
  { nome: "Controfiletto", testo: "alias: sottofiletto, lombata, entrecôte | stati: fresco, congelato | intero, porzionato | razze: Angus, Wagyu, Irlanda, Scozia | S/V", sotto1: "Bovino", sotto2: "Controfiletto", unit: "kg" },
  { nome: "Costata", testo: "alias: fiorentina, T-bone, ribeye, bistecca, taglio alto | stati: fresca, congelata | porzionata, intera | razze: Piemontese, Angus, Wagyu, Vaca Gallega, Irlanda, Scozia | S/V", sotto1: "Bovino", sotto2: "Costata", unit: "kg" },
  { nome: "Lombata", testo: "alias: lombata di manzo, PURA collezione | stati: fresca, congelata | intera, porzionata | razze: Irlanda, Scozia, Spagna, Polonia, Germania, Wagyu | S/V", sotto1: "Bovino", sotto2: "Controfiletto", unit: "kg" },
  { nome: "Noce", testo: "alias: noce di manzo, noce di vitellone | fresca, congelata | S/V", sotto1: "Bovino", sotto2: "Noce", unit: "kg" },
  { nome: "Scamone", testo: "alias: scamone di manzo | fresco, congelato | intero, porzionato | S/V", sotto1: "Bovino", sotto2: "Scamone", unit: "kg" },
  { nome: "Punta di Petto", testo: "alias: punta petto manzo, brisket | fresca, congelata | con osso, senza osso | S/V", sotto1: "Bovino", sotto2: "Punta di Petto", unit: "kg" },
  { nome: "Biancostato", testo: "alias: biancostato di manzo, reale con osso | fresco, congelato | C/O | S/V", sotto1: "Bovino", sotto2: "Biancostato", unit: "kg" },
  { nome: "Reale", testo: "alias: reale di manzo, cappello del prete | fresco, congelato | S/V", sotto1: "Bovino", sotto2: "Reale", unit: "kg" },
  { nome: "Muscolo", testo: "alias: garetto, geretto, ossobuco manzo | fresco, congelato | C/O, S/O | S/V", sotto1: "Bovino", sotto2: "Muscolo", unit: "kg" },
  { nome: "Ossobuco", testo: "alias: osso buco | fresco, congelato | bovino, vitello", sotto1: "Bovino", sotto2: "Ossobuco", unit: "kg" },
  { nome: "Macinato Bovino", testo: "alias: carne macinata, macinato misto, trita | fresco, congelato, IQF | bovino adulto, vitello, misto | % grasso: magro, normale | S/V, ATM", sotto1: "Bovino", sotto2: "Macinato", unit: "kg" },
  { nome: "Hamburger Bovino", testo: "alias: burger manzo, hamburger manzo, hamburger B.A. | congelato, IQF | calibri: 100g, 150g, 180g, 200g | razze: Angus, Black Angus, Vaca Gallega, dry aged | S/V", sotto1: "Bovino", sotto2: "Hamburger", unit: "kg" },
  { nome: "Carpaccio", testo: "alias: carpaccio di manzo, fettine carpaccio | fresco, congelato, abbattuto | La Piemontese | S/V", sotto1: "Bovino", sotto2: "Carpaccio", unit: "kg" },
  { nome: "Spezzatino Bovino", testo: "alias: bocconcini manzo, brasato, stracotto | fresco, congelato | S/O | S/V", sotto1: "Bovino", sotto2: "Spezzatino", unit: "kg" },
  { nome: "Trippa", testo: "alias: trippa di manzo, busecca | fresca, precotta | S/V", sotto1: "Bovino", sotto2: "Trippa", unit: "kg" },
  { nome: "Lingua Bovina", testo: "alias: lingua di manzo, lingua vitello | fresca, cotta | S/V", sotto1: "Bovino", sotto2: "Lingua", unit: "kg" },
  { nome: "Fegato Bovino", testo: "alias: fegato di manzo, fegato di vitello | fresco, congelato | S/V", sotto1: "Bovino", sotto2: "Fegato", unit: "kg" },
  { nome: "Animelle", testo: "alias: animelle di vitello, animelle di agnello | fresche, congelate | S/V", sotto1: "Bovino", sotto2: "Animelle", unit: "kg" },
  { nome: "Guancia Bovina", testo: "alias: guancia di vitello, guancia di manzo | fresca, congelata | S/V | Frisian", sotto1: "Bovino", sotto2: "Guancia", unit: "kg" },
  { nome: "Cervella", testo: "alias: cervello di vitello | fresca, congelata | Frisian | S/V", sotto1: "Bovino", sotto2: "Cervella", unit: "kg" },
  { nome: "Coda", testo: "alias: coda di bue, coda di manzo | fresca, congelata | C/O | S/V", sotto1: "Bovino", sotto2: "Coda", unit: "kg" },

  // ══════════════════════════════════════════════════════════════════════════
  // VITELLO
  // ══════════════════════════════════════════════════════════════════════════

  { nome: "Fesa Vitello", testo: "alias: fesa di vitello, fesa B.A. vitello | fresca, congelata | S/O | S/V | Frisian, provenienze varie UE", sotto1: "Bovino", sotto2: "Fesa", unit: "kg" },
  { nome: "Filetto Vitello", testo: "alias: filetto di vitello, filettino vitello | fresco, congelato | intero, porzionato, rosato | S/V | Frisian", sotto1: "Bovino", sotto2: "Filetto", unit: "kg" },
  { nome: "Scaloppine", testo: "alias: scaloppine di vitello, scaloppina | fresche, congelate | S/V", sotto1: "Bovino", sotto2: "Scaloppina", unit: "kg" },
  { nome: "Cotoletta Vitello", testo: "alias: cotoletta di vitello, milanese | fresca, congelata | C/O, S/O | S/V", sotto1: "Bovino", sotto2: "Cotoletta", unit: "kg" },
  { nome: "Stinco Vitello", testo: "alias: stinco di vitello, stinco posteriore | fresco, congelato | S/V | Frisian", sotto1: "Bovino", sotto2: "Stinco", unit: "kg" },

  // ══════════════════════════════════════════════════════════════════════════
  // SCOTTONA / VITELLONE
  // ══════════════════════════════════════════════════════════════════════════

  { nome: "Scottona", testo: "alias: scottona Angus, scottona Irish, Small B.F. | tagli: filetto, controfiletto, fesa, scamone, costata | fresca, congelata | razze: Angus, Aberdeen Angus IGP, Scozia, Irlanda | S/V", sotto1: "Bovino", sotto2: "Fesa", unit: "kg" },
  { nome: "Vitellone", testo: "alias: bov.ad., bovino adulto | tagli: fesa, girello, filetto, noce, macinato | fresco, congelato | razze: Piemontese, Angus | S/V", sotto1: "Bovino", sotto2: "", unit: "kg" },

  // ══════════════════════════════════════════════════════════════════════════
  // MAIALE
  // ══════════════════════════════════════════════════════════════════════════

  { nome: "Filetto Maiale", testo: "alias: filetto suino, filetto di maiale | fresco, congelato | intero, porzionato | razze: nazionale, Iberico bellota, Rosso di Castiglia | S/V", sotto1: "Maiale", sotto2: "Filetto", unit: "kg" },
  { nome: "Lombo Maiale", testo: "alias: lombo suino, lonza, carrè suino | fresco, congelato | C/O, S/O | intero, porzionato | S/V", sotto1: "Maiale", sotto2: "Lombo", unit: "kg" },
  { nome: "Costine Maiale", testo: "alias: costine suine, spare ribs, ribs, costolette maiale | fresche, congelate, IQF | cotte, crude | salsa barbecue | S/V", sotto1: "Maiale", sotto2: "Costine", unit: "kg" },
  { nome: "Spalla Maiale", testo: "alias: spalla suina, capocollo fresco | fresca, congelata | C/O, S/O | S/V", sotto1: "Maiale", sotto2: "Spalla", unit: "kg" },
  { nome: "Pancetta Fresca", testo: "alias: pancia maiale, pancia suina, lardo fresco | fresca, congelata | C/O, S/O | S/V", sotto1: "Maiale", sotto2: "Pancetta", unit: "kg" },
  { nome: "Salsiccia Fresca", testo: "alias: salsicce fresche, luganega fresca | fresca, surgelata, IQF | aromatizzata, naturale, piccante | S/V", sotto1: "Maiale", sotto2: "Salsiccia", unit: "kg" },
  { nome: "Arista", testo: "alias: arista di maiale, carrè arrosto | fresca, congelata | C/O, S/O | cotta, cruda | S/V", sotto1: "Maiale", sotto2: "Arista", unit: "kg" },
  { nome: "Stinco Maiale", testo: "alias: stinco suino, stinco posteriore maiale | fresco, congelato | S/V", sotto1: "Maiale", sotto2: "Stinco", unit: "kg" },
  { nome: "Guanciale Maiale", testo: "alias: guanciale fresco, guancia suina | fresco, congelato | S/V | Iberico bellota Casalba", sotto1: "Maiale", sotto2: "Guanciale", unit: "kg" },
  { nome: "Macinato Maiale", testo: "alias: macinato suino | fresco, congelato | S/V, ATM", sotto1: "Maiale", sotto2: "Macinato", unit: "kg" },
  { nome: "Maialino", testo: "alias: maialino da latte, porchetta, maialino sardo | fresco, congelato | intero, a pezzi, busto | origine: Germania, Spagna, nazionale | S/V", sotto1: "Maiale", sotto2: "Intero", unit: "kg" },
  { nome: "Suino Iberico", testo: "alias: iberico bellota, pata negra, iberico cebo de campo | tagli: filetto, presa, coppa, pluma, tapilla, lagarto, ventresca, palomita | fresco, congelato | Casalba, 5J | S/V", sotto1: "Maiale", sotto2: "Filetto", unit: "kg" },

  // ══════════════════════════════════════════════════════════════════════════
  // POLLAME
  // ══════════════════════════════════════════════════════════════════════════

  { nome: "Pollo", testo: "alias: galletto, pollame | varianti: intero, a pezzi, busto, quarti | in quarti, CL.A | stati: fresco, congelato, IQF, surgelato | tagli: petto, coscia, sovracoscia, fuso, ali, collo, fegatini | confezionato, sfuso | nazionale, biologico", sotto1: "Pollo", sotto2: "", unit: "kg" },
  { nome: "Petto Pollo", testo: "alias: filetto di pollo, petto di pollo, fettine petto | fresco, congelato, IQF | intero, a fette, prep., marinato | calibri: 150/200g, 200/250g, 220g | CL.A | S/V, ATM | T/R", sotto1: "Pollo", sotto2: "Petto", unit: "kg" },
  { nome: "Coscia Pollo", testo: "alias: cosce pollo, sovracoscia, quarto, fuso | fresca, congelata, IQF | calibri: 180/220g, 230g, 240/280g | CL.A | S/V", sotto1: "Pollo", sotto2: "Coscia", unit: "kg" },
  { nome: "Ali Pollo", testo: "alias: alette pollo, alucce, ali di pollo, wings | fresche, congelate, IQF | crude, arrostite, marinate | Mexico wings | S/V", sotto1: "Pollo", sotto2: "Ali", unit: "kg" },
  { nome: "Fegatini Pollo", testo: "alias: fegatini di pollo, fegato pollo | freschi, congelati | S/V", sotto1: "Pollo", sotto2: "Fegato", unit: "kg" },
  { nome: "Gallina", testo: "alias: gallina ruspante, galline in quarti | congelata, gelo | in quarti | nazionale | S/V", sotto1: "Pollo", sotto2: "Intero", unit: "kg" },
  { nome: "Cappone", testo: "alias: cappone nostrano, cappone di Morozzo | congelato, gelo | intero, in quarti | S/V", sotto1: "Avicoli", sotto2: "Cappone", unit: "kg" },

  // ══════════════════════════════════════════════════════════════════════════
  // TACCHINO
  // ══════════════════════════════════════════════════════════════════════════

  { nome: "Fesa Tacchino", testo: "alias: petto di tacchino, fesa di tacchino | fresca, congelata, IQF | intera, a metà, preparata | CL.A | S/V | ITA", sotto1: "Tacchino", sotto2: "Petto", unit: "kg" },
  { nome: "Coscia Tacchino", testo: "alias: sovracoscia tacchino | fresca, congelata | S/V", sotto1: "Tacchino", sotto2: "Coscia", unit: "kg" },

  // ══════════════════════════════════════════════════════════════════════════
  // AGNELLO
  // ══════════════════════════════════════════════════════════════════════════

  { nome: "Cosciotto Agnello", testo: "alias: coscia di agnello, cosciotto | fresco, congelato, gelo | C/O, S/O | origine: Nuova Zelanda, Irlanda, Galles, da latte | Lumina, Nature's Meadow | S/V", sotto1: "Agnello", sotto2: "Cosciotto", unit: "kg" },
  { nome: "Carrè Agnello", testo: "alias: carrè, sella, 8 coste | fresco, congelato, gelo | scalzato, normale | origine: Nuova Zelanda, Galles | S/V", sotto1: "Agnello", sotto2: "Carré", unit: "kg" },
  { nome: "Costolette Agnello", testo: "alias: costolette di agnello | fresche, congelate | S/V", sotto1: "Agnello", sotto2: "Costolette", unit: "kg" },
  { nome: "Spalla Agnello", testo: "alias: spalla di agnello | fresca, congelata, gelo | C/O, S/O | origine: Nuova Zelanda, Lumina | S/V", sotto1: "Agnello", sotto2: "Spalla", unit: "kg" },
  { nome: "Stinco Agnello", testo: "alias: stinco posteriore agnello | fresco, congelato, gelo | origine: Nuova Zelanda | S/V", sotto1: "Agnello", sotto2: "Stinco", unit: "kg" },
  { nome: "Abbacchio", testo: "alias: agnello da latte, capretto | fresco, congelato | intero, a pezzi | S/V", sotto1: "Agnello", sotto2: "Intero", unit: "kg" },
  { nome: "Capretto", testo: "alias: capretto da latte | fresco, congelato | intero, a pezzi | S/V", sotto1: "Agnello", sotto2: "Intero", unit: "kg" },

  // ══════════════════════════════════════════════════════════════════════════
  // CONIGLIO
  // ══════════════════════════════════════════════════════════════════════════

  { nome: "Coniglio", testo: "varianti: intero C/T, a pezzi, coscia, sella, lombo, fegato | fresco, congelato | nazionale, selvatico Spagna | S/V", sotto1: "Coniglio", sotto2: "", unit: "kg" },

  // ══════════════════════════════════════════════════════════════════════════
  // ANATRA
  // ══════════════════════════════════════════════════════════════════════════

  { nome: "Petto Anatra", testo: "alias: magret, magret de canard, petto di anatra | varianti: maschio, femmina, Mulard, Canette Barberie | fresco, congelato, gelo | calibri: 250/300g, 300/350g, 450g | a metà porzionato | marchi: Rougié | S/V", sotto1: "Anatra", sotto2: "Petto", unit: "kg" },
  { nome: "Coscia Anatra", testo: "alias: coscia di anatra, confit de canard | fresca, congelata, gelo | Mulard, maschio nazionale | S/V", sotto1: "Anatra", sotto2: "Coscia", unit: "kg" },
  { nome: "Anatra Busto", testo: "alias: anatra intera, anatra a busto | varianti: maschio, femmina, Canette, Barberie | fresca, congelata, gelo | in quarti | CL.A | nazionale, Francia | S/V", sotto1: "Anatra", sotto2: "Intero", unit: "kg" },
  { nome: "Foie Gras", testo: "alias: fegato grasso anatra, fegato grasso oca, fegato d'anatra Mulard | varianti: intero, mondato, scaloppa, mini scaloppa, pepite | fresco, gelo | calibri: 20/40g, 40/60g, 60/80g | marchi: Rougié | origine: Francia, Ungheria | S/V", sotto1: "Anatra", sotto2: "Fegato", unit: "kg" },
  { nome: "Polpa Anatra", testo: "alias: polpa di anatra, macinato anatra | congelata, gelo | nazionale | S/V", sotto1: "Anatra", sotto2: "Polpa", unit: "kg" },

  // ══════════════════════════════════════════════════════════════════════════
  // SELVAGGINA
  // ══════════════════════════════════════════════════════════════════════════

  { nome: "Cervo", testo: "varianti: filetto, controfiletto, sella, coscia, spalla, polpa, spezzatino | allevato Nuova Zelanda, cacciato Scozia, Europeo | fresco, congelato, gelo | S/V", sotto1: "Selvaggina", sotto2: "Cervo", unit: "kg" },
  { nome: "Capriolo", testo: "varianti: sella, controfiletto, coscia, spalla, costine, polpa | cacciato Scozia, Europeo | congelato, gelo | S/V", sotto1: "Selvaggina", sotto2: "Capriolo", unit: "kg" },
  { nome: "Cinghiale", testo: "varianti: coscia, spalla, lombo, filetto, costine, polpa, macinato, spezzatino | fresco, congelato | S/V", sotto1: "Selvaggina", sotto2: "Cinghiale", unit: "kg" },
  { nome: "Lepre", testo: "alias: lepre senza testa, sella di lepre | cacciata Sud America | congelata, gelo | S/V", sotto1: "Selvaggina", sotto2: "Lepre", unit: "kg" },
  { nome: "Fagiano", testo: "varianti: intero, petto, coscia | fresco, congelato | S/V", sotto1: "Selvaggina", sotto2: "Fagiano", unit: "kg" },

  // ══════════════════════════════════════════════════════════════════════════
  // AVICOLI DA CORTILE
  // ══════════════════════════════════════════════════════════════════════════

  { nome: "Faraona", testo: "alias: faraona intera, faraona a busto, coscia faraona | fresca, congelata, gelo | CL.A, nazionale | S/V", sotto1: "Avicoli", sotto2: "Faraona", unit: "kg" },
  { nome: "Piccione", testo: "alias: piccione intero, colombaccio, carcassa piccione | fresco, congelato, gelo | S/V", sotto1: "Avicoli", sotto2: "Piccione", unit: "kg" },
  { nome: "Quaglia", testo: "alias: quaglie, quaglia intera | fresca, congelata, gelo | S/V", sotto1: "Avicoli", sotto2: "Quaglia", unit: "kg" },
]

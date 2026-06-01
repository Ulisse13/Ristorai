// foodDB_surgelati.js — Database SURGELATI per Ristorai
// Fonti: catalogo Selecta + catalogo MARR + keywords IQF/glassato/abbattuto
export const SURGELATI_DB = [

  // ══════════════════════════════════════════════════════════════════════════
  // CARNI SURGELATE
  // ══════════════════════════════════════════════════════════════════════════

  { keywords: ["pollo surgelato", "petto pollo surgelato", "pollo congelato", "pollo abbattuto", "pollo in quarti gelo", "pollo quarti gelo"], sotto1: "Carni", sotto2: "Pollo" },
  { keywords: ["hamburger surgelato", "hamburger congelato", "burger surgelato", "hamburger abbattuto"], sotto1: "Carni", sotto2: "Hamburger" },
  { keywords: ["manzo surgelato", "bovino surgelato", "carne bovina surgelata", "manzo abbattuto", "bovino gelo"], sotto1: "Carni", sotto2: "Manzo" },
  { keywords: ["maiale surgelato", "suino surgelato", "maiale congelato"], sotto1: "Carni", sotto2: "Maiale" },
  { keywords: ["agnello surgelato", "agnello congelato", "agnello abbattuto", "agnello gelo"], sotto1: "Carni", sotto2: "Agnello" },
  { keywords: ["coniglio surgelato", "coniglio congelato", "coniglio abbattuto"], sotto1: "Carni", sotto2: "Coniglio" },
  { keywords: ["anatra surgelata", "anatra congelata", "petto anatra surgelato", "anatra abbattuta", "polpa anatra gelo", "petto anatra mulard gelo"], sotto1: "Carni", sotto2: "Anatra" },
  { keywords: ["tacchino surgelato", "petto tacchino surgelato", "tacchino abbattuto"], sotto1: "Carni", sotto2: "Tacchino" },
  { keywords: ["cappone surgelato", "cappone gelo", "cappone quarti gelo"], sotto1: "Carni", sotto2: "Pollo" },
  { keywords: ["gallina surgelata", "gallina gelo", "gallina quarti gelo"], sotto1: "Carni", sotto2: "Pollo" },
  { keywords: ["faraona surgelata", "faraona gelo"], sotto1: "Carni", sotto2: "Selvaggina" },
  { keywords: ["piccione surgelato", "piccione gelo"], sotto1: "Carni", sotto2: "Selvaggina" },
  { keywords: ["quaglia surgelata", "quaglia gelo"], sotto1: "Carni", sotto2: "Selvaggina" },
  { keywords: ["fegato grasso d'anatra gelo", "fegato grasso anatra gelo", "scaloppa fegato grasso gelo", "pepite fegato grasso gelo"], sotto1: "Carni", sotto2: "Anatra" },
  { keywords: ["polpette surgelate", "polpetta surgelata"], sotto1: "Carni", sotto2: "Polpette" },
  { keywords: ["salsiccia surgelata", "salsicce surgelate"], sotto1: "Carni", sotto2: "Salsiccia" },
  { keywords: ["wurstel surgelato", "hot dog surgelato"], sotto1: "Carni", sotto2: "Wurstel" },
  { keywords: ["spiedini surgelati", "misto carni surgelato"], sotto1: "Carni", sotto2: "Misto Carni" },

  // ══════════════════════════════════════════════════════════════════════════
  // PESCE SURGELATO — tutte le varianti IQF/glassato/abbattuto/congelato
  // ══════════════════════════════════════════════════════════════════════════

  // Salmone
  { keywords: ["salmone surgelato", "filetto salmone surgelato", "salmone congelato", "salmone iqf", "salmone glassato", "salmone abbattuto", "salmone glass", "salmone ora king gelo"], sotto1: "Pesce", sotto2: "Salmone" },

  // Merluzzo / Baccalà
  { keywords: ["merluzzo surgelato", "filetto merluzzo surgelato", "merluzzo congelato", "baccala surgelato", "merluzzo iqf", "merluzzo glassato", "merluzzo abbattuto", "merluzzo glass", "merluzzo alaska"], sotto1: "Pesce", sotto2: "Merluzzo" },

  // Tonno
  { keywords: ["tonno surgelato", "trancio tonno surgelato", "tonno iqf", "tonno glassato", "tonno abbattuto", "tonno glass", "tonno ultra frozen", "filone tonno surgelato"], sotto1: "Pesce", sotto2: "Tonno" },

  // Pesce Spada
  { keywords: ["pesce spada surgelato", "trancio pesce spada surgelato", "pesce spada iqf", "pesce spada glassato", "pesce spada abbattuto", "pesce spada glass", "pesce spada ultra frozen"], sotto1: "Pesce", sotto2: "Pesce Spada" },

  // Orata / Branzino
  { keywords: ["orata surgelata", "orata iqf", "orata glassata", "orata abbattuta", "filetti orata surgelati", "filetto orata surgelato"], sotto1: "Pesce", sotto2: "Orata" },
  { keywords: ["branzino surgelato", "spigola surgelata", "branzino iqf", "branzino glassato", "branzino abbattuto", "filetto branzino surgelato", "filetti branzino surgelati"], sotto1: "Pesce", sotto2: "Branzino" },

  // Ricciola
  { keywords: ["ricciola surgelata", "ricciola iqf", "ricciola glassata", "ricciola abbattuta", "ricciola glass", "filetto ricciola surgelato"], sotto1: "Pesce", sotto2: "Ricciola" },

  // Ombrina
  { keywords: ["ombrina surgelata", "ombrina iqf", "ombrina glassata", "ombrina abbattuta", "filetto ombrina surgelato"], sotto1: "Pesce", sotto2: "Ombrina" },

  // Rombo
  { keywords: ["rombo surgelato", "rombo iqf", "rombo glassato", "rombo abbattuto", "trancio rombo surgelato", "filetto rombo surgelato"], sotto1: "Pesce", sotto2: "Rombo" },

  // Sogliola
  { keywords: ["sogliola surgelata", "filetto sogliola surgelato", "sogliola iqf", "sogliola glassata"], sotto1: "Pesce", sotto2: "Sogliola" },

  // Gamberi — tutte le varianti e calibri
  { keywords: ["gamberi surgelati", "gambero surgelato", "code gamberi surgelate", "gamberi iqf", "gamberi glassati", "gambero glassato", "gamberi abbattuti", "gambero abbattuto", "gamberi glass", "gambero indop", "gambero vannamei surgelato", "gambero tropicale surgelato", "gambero tigre surgelato", "gamb.indop", "gambero pink surgelato", "gambero bianco surgelato", "gambero rosa surgelato", "gambero rosso surgelato", "gambero viola surgelato", "gambero blu surgelato"], sotto1: "Pesce", sotto2: "Gamberi" },

  // Gamberoni / Mazzancolle
  { keywords: ["mazzancolle surgelate", "mazzancolla surgelata", "gamberoni surgelati", "mazzancolle iqf", "mazzancolle glassate", "mazzancolle abbattute", "mazzancolle glass"], sotto1: "Pesce", sotto2: "Gamberoni" },

  // Gamberetti
  { keywords: ["gamberetti surgelati", "gamberetto surgelato", "gamberetti iqf", "gamberetti glassati", "code gamberetti surgelate"], sotto1: "Pesce", sotto2: "Gamberetti" },

  // Scampi
  { keywords: ["scampi surgelati", "scampo surgelato", "scampi iqf", "scampi glassati", "scampi abbattuti", "scampi glass", "code scampi surgelate"], sotto1: "Pesce", sotto2: "Scampi" },

  // Aragosta / Astice
  { keywords: ["aragosta surgelata", "aragosta iqf", "aragosta glassata", "coda aragosta surgelata"], sotto1: "Pesce", sotto2: "Aragosta" },
  { keywords: ["astice surgelato", "astice iqf", "astice glassato", "coda astice surgelata", "astice americano congelato"], sotto1: "Pesce", sotto2: "Astice" },

  // Calamari
  { keywords: ["calamari surgelati", "calamaro surgelato", "calamari congelati", "calamari iqf", "calamari glassati", "calamaro glassato", "calamari abbattuti", "calamaro abbattuto", "calamari glass", "calamaretto surgelato", "calamaretti surgelati", "calamari sporchi congelati", "calamari puliti congelati"], sotto1: "Pesce", sotto2: "Calamari" },

  // Polpo
  { keywords: ["polpo surgelato", "polpo congelato", "polpo iqf", "polpo glassato", "polpo abbattuto", "polpo glass", "polpi surgelati", "polpi glassati", "polpi abbattuti", "polpo cotto surgelato"], sotto1: "Pesce", sotto2: "Polpo" },

  // Seppia
  { keywords: ["seppia surgelata", "seppie surgelate", "seppia iqf", "seppia glassata", "seppie glassate", "seppia abbattuta", "seppie abbattute", "seppia glass"], sotto1: "Pesce", sotto2: "Seppia" },

  // Cozze
  { keywords: ["cozze surgelate", "cozza surgelata", "cozze sgusciate surgelate", "cozze iqf", "cozze glassate", "cozze abbattute"], sotto1: "Pesce", sotto2: "Cozze" },

  // Vongole
  { keywords: ["vongole surgelate", "vongola surgelata", "vongole iqf", "vongole glassate", "vongole sgusciate surgelate"], sotto1: "Pesce", sotto2: "Vongole" },

  // Capesante
  { keywords: ["capesante surgelate", "capasanta surgelata", "capesante iqf", "capesante glassate", "noce capasanta surgelata"], sotto1: "Pesce", sotto2: "Capesante" },

  // Misto mare
  { keywords: ["misto mare surgelato", "frutti di mare surgelati", "seafood mix surgelato", "misto mare iqf", "misto mare glassato"], sotto1: "Pesce", sotto2: "Misto Mare" },

  // Bastoncini
  { keywords: ["bastoncini pesce", "bastoncini di merluzzo", "fish fingers", "bastoncini surgelati"], sotto1: "Pesce", sotto2: "Bastoncini" },

  // ══════════════════════════════════════════════════════════════════════════
  // VERDURE SURGELATE
  // ══════════════════════════════════════════════════════════════════════════

  { keywords: ["piselli surgelati", "pisello surgelato", "piselli gelo"], sotto1: "Verdure", sotto2: "Piselli" },
  { keywords: ["spinaci surgelati", "spinacio surgelato", "spinaci gelo"], sotto1: "Verdure", sotto2: "Spinaci" },
  { keywords: ["fagiolini surgelati", "fagiolino surgelato", "fagiolini gelo"], sotto1: "Verdure", sotto2: "Fagiolini" },
  { keywords: ["broccoli surgelati", "broccolo surgelato"], sotto1: "Verdure", sotto2: "Broccoli" },
  { keywords: ["mais surgelato", "mais gelo", "granturco surgelato"], sotto1: "Verdure", sotto2: "Mais" },
  { keywords: ["carote surgelate", "carota surgelata"], sotto1: "Verdure", sotto2: "Carote" },
  { keywords: ["patate surgelate", "patatine surgelate", "patate fritte surgelate", "patatine fritte surgelate"], sotto1: "Verdure", sotto2: "Patate" },
  { keywords: ["asparagi surgelati", "asparago surgelato"], sotto1: "Verdure", sotto2: "Asparagi" },
  { keywords: ["zucchine surgelate", "zucchina surgelata"], sotto1: "Verdure", sotto2: "Zucchine" },
  { keywords: ["funghi surgelati", "fungo surgelato", "porcini surgelati", "finferli surgelati"], sotto1: "Verdure", sotto2: "Funghi" },
  { keywords: ["peperoni surgelati", "peperone surgelato"], sotto1: "Verdure", sotto2: "Peperoni" },
  { keywords: ["carciofi surgelati", "carciofo surgelato"], sotto1: "Verdure", sotto2: "Carciofi" },
  { keywords: ["fave surgelate", "fava surgelata"], sotto1: "Verdure", sotto2: "Fave" },
  { keywords: ["misto verdure surgelato", "verdure miste surgelate", "minestrone surgelato", "mix verdure surgelato"], sotto1: "Verdure", sotto2: "Misto Verdure" },
  { keywords: ["cipolla surgelata", "cipolle surgelate", "cipolla tritata surgelata"], sotto1: "Verdure", sotto2: "Cipolla" },
  { keywords: ["castagne surgelate", "castagna surgelata", "marron gelo"], sotto1: "Verdure", sotto2: "Castagne" },
  { keywords: ["tartufo surgelato", "tartufo congelato"], sotto1: "Verdure", sotto2: "Tartufo" },

  // ══════════════════════════════════════════════════════════════════════════
  // PREPARATI SURGELATI
  // ══════════════════════════════════════════════════════════════════════════

  { keywords: ["pizza surgelata", "pizza congelata"], sotto1: "Preparati", sotto2: "Pizza" },
  { keywords: ["lasagne surgelate", "lasagna surgelata"], sotto1: "Preparati", sotto2: "Lasagne" },
  { keywords: ["cannelloni surgelati", "cannellone surgelato"], sotto1: "Preparati", sotto2: "Cannelloni" },
  { keywords: ["arancini surgelati", "arancino surgelato", "supplì surgelato"], sotto1: "Preparati", sotto2: "Arancini" },
  { keywords: ["crocchette surgelate", "crocchetta surgelata"], sotto1: "Preparati", sotto2: "Crocchette" },
  { keywords: ["frittura mista surgelata", "misto fritto surgelato"], sotto1: "Preparati", sotto2: "Frittura Mista" },
  { keywords: ["cotoletta surgelata", "cotolette surgelate", "cotoletta impanata surgelata"], sotto1: "Preparati", sotto2: "Cotolette" },
  { keywords: ["gnocchi surgelati", "gnocco surgelato", "gnocchi surgelati"], sotto1: "Preparati", sotto2: "Gnocchi" },
  { keywords: ["ravioli surgelati", "tortellini surgelati", "pasta ripiena surgelata"], sotto1: "Preparati", sotto2: "Pasta Ripiena" },
  { keywords: ["pane surgelato", "baguette surgelata", "panini surgelati", "croissant surgelato", "croissant da lievitare", "brioche surgelata"], sotto1: "Preparati", sotto2: "Pane e Lievitati" },
  { keywords: ["pasta fresca surgelata", "pasta surgelata"], sotto1: "Preparati", sotto2: "Pasta Fresca" },
  { keywords: ["frutta surgelata", "frutti di bosco surgelati", "fragole surgelate", "mirtilli surgelati", "lamponi surgelati"], sotto1: "Preparati", sotto2: "Frutta" },
  { keywords: ["erbe surgelate", "basilico surgelato", "prezzemolo surgelato", "erbe aromatiche surgelate"], sotto1: "Preparati", sotto2: "Erbe Aromatiche" },
  { keywords: ["brodo surgelato", "brodo congelato", "fondo surgelato", "fondo di cottura surgelato"], sotto1: "Preparati", sotto2: "Brodi e Fondi" },
  { keywords: ["impasto surgelato", "pasta sfoglia surgelata", "pasta brisee surgelata"], sotto1: "Preparati", sotto2: "Impasti" },

  // ══════════════════════════════════════════════════════════════════════════
  // GELATI E DOLCI
  // ══════════════════════════════════════════════════════════════════════════

  { keywords: ["gelato", "sorbetto", "semifreddo surgelato", "gelato artigianale"], sotto1: "Gelati e Dolci", sotto2: "Gelati" },
  { keywords: ["torta gelato", "torta fredda surgelata"], sotto1: "Gelati e Dolci", sotto2: "Dolci" },
]

  // ── Frutta Surgelata IQF ──────────────────────────────────────────────────
  { nome: "Lamponi Surgelati", testo: "alias: lamponi iqf, lampone surgelato, lamponi interi, lamponi gran naturali, raspberry frozen, lampponi, lamponi congelati, lamponi naturali | marchi: Gran Naturali, GN, Ardo, Orogel | formato: 1kg, 2.5kg, 5kg | varianti: interi, pezzi", sotto1: "Frutta", sotto2: "", unit: "kg" },
  { nome: "Fragole Surgelate", testo: "alias: fragola iqf, fragole intere surgelate, fragole congelate, strawberry frozen, fragolina surgelata | marchi: Gran Naturali, Ardo | formato: 1kg, 2.5kg", sotto1: "Frutta", sotto2: "", unit: "kg" },
  { nome: "Mirtilli Surgelati", testo: "alias: mirtillo iqf, mirtilli congelati, blueberry frozen | formato: 1kg", sotto1: "Frutta", sotto2: "", unit: "kg" },
  { nome: "Ribes Surgelato", testo: "alias: ribes iqf, ribes rosso surgelato, ribes nero surgelato, cassis surgelato | formato: 1kg", sotto1: "Frutta", sotto2: "", unit: "kg" },
  { nome: "Misti Bosco Surgelati", testo: "alias: misto bosco, frutti bosco surgelati, frutti di bosco misti, mix bosco, forest fruits frozen, frutti del bosco iqf, misti bosco iqf, misto frutti bosco | marchi: Gran Naturali, Ardo, Orogel | formato: 1kg, 2.5kg, 5kg", sotto1: "Frutta", sotto2: "", unit: "kg" },
  { nome: "Mango Surgelato", testo: "alias: mango iqf, mango congelato, mango frozen, mango a pezzi surgelato | formato: 1kg", sotto1: "Frutta", sotto2: "", unit: "kg" },
  { nome: "Ananas Surgelato", testo: "alias: ananas iqf, ananas a pezzi surgelato, pineapple frozen | formato: 1kg", sotto1: "Frutta", sotto2: "", unit: "kg" },
  { nome: "Ciliegie Surgelate", testo: "alias: ciliegia iqf, ciliegie congelate, cherry frozen, amarene surgelate | formato: 1kg", sotto1: "Frutta", sotto2: "", unit: "kg" },
  { nome: "Pesche Surgelate", testo: "alias: pesca iqf, pesche a pezzi surgelate, peach frozen | formato: 1kg", sotto1: "Frutta", sotto2: "", unit: "kg" },
  { nome: "Albicocche Surgelate", testo: "alias: albicocca iqf, albicocche a metà surgelate, apricot frozen | formato: 1kg", sotto1: "Frutta", sotto2: "", unit: "kg" },
  { nome: "Coulis Frutti Rossi", testo: "alias: coulis lamponi, coulis fragole, coulis misti bosco, purea frutta surgelata, coulis frutto, coulis frutti bosco | formato: 1kg, 2.5kg", sotto1: "Preparati", sotto2: "Frutta", unit: "kg" },

  // ── Verdure Surgelate ─────────────────────────────────────────────────────
  { nome: "Piselli Fini Surgelati", testo: "alias: piselli surgelati, piselli fini, piselli iqf, piselli congelati, peas frozen, pisellini surgelati, piselli extra fini, piselli g natura, piselli fine | marchi: Gran Naturali, Ardo, Orogel, GN | formato: 1kg, 2.5kg, 5kg | varianti: fini, extrafini, medi", sotto1: "Verdure", sotto2: "", unit: "kg" },
  { nome: "Fagiolini Surgelati", testo: "alias: fagiolino surgelato, green beans frozen, fagiolini iqf | formato: 1kg", sotto1: "Verdure", sotto2: "", unit: "kg" },
  { nome: "Spinaci Surgelati", testo: "alias: spinacio surgelato, spinaci foglia, spinach frozen, spinaci iqf | formato: 1kg, 2.5kg", sotto1: "Verdure", sotto2: "", unit: "kg" },
  { nome: "Mix Verdure Surgelate", testo: "alias: verdure miste surgelate, verdure miste, misto verdure, minestrone surgelato, mix verdure | formato: 1kg, 2.5kg", sotto1: "Verdure", sotto2: "", unit: "kg" },
  { nome: "Peperoni Arrostiti Surgelati", testo: "alias: peperoni arrostiti surgelati, peperoni grigliati surgelati, peperoni rossi arrosto surgelati, peperoni arr nat, peperoni arrosto naturali, peperoni rossi arr | marchi: Natura, Greci | formato: 3pz, 3kg, vasetto, surgelato | varianti: div13/1, rossi, gialli, misti", sotto1: "Verdure", sotto2: "", unit: "pz" },
  { nome: "Carciofi Surgelati", testo: "alias: carciofo surgelato, carciofi iqf, artichoke frozen | formato: 1kg", sotto1: "Verdure", sotto2: "", unit: "kg" },
  { nome: "Porcini Surgelati", testo: "alias: porcino surgelato, porcini iqf, funghi porcini surgelati | formato: 1kg", sotto1: "Funghi", sotto2: "", unit: "kg" },


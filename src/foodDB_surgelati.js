// ─────────────────────────────────────────────────────────────────────────────
// foodDB_surgelati.js — Database SURGELATI per Ristorai
// cat: "Surgelati"
// sotto1: "Carni" | "Pesce" | "Verdure" | "Gelati e Dolci" | "Preparati"
// sotto2: prodotto specifico
// ─────────────────────────────────────────────────────────────────────────────

export const SURGELATI_DB = [

  // ══════════════════════════════════════════════════════════════════════════
  // CARNI SURGELATE
  // ══════════════════════════════════════════════════════════════════════════

  { keywords: ["pollo surgelato", "petto pollo surgelato", "pollo congelato", "petto di pollo surgelato", "pollo abbattuto", "pollo glassato"], sotto1: "Carni", sotto2: "Pollo" },
  { keywords: ["hamburger surgelato", "hamburger congelato", "burger surgelato", "hamburger abbattuto"], sotto1: "Carni", sotto2: "Hamburger" },
  { keywords: ["manzo surgelato", "bovino surgelato", "carne bovina surgelata", "manzo abbattuto"], sotto1: "Carni", sotto2: "Manzo" },
  { keywords: ["maiale surgelato", "suino surgelato", "carne suina surgelata"], sotto1: "Carni", sotto2: "Maiale" },
  { keywords: ["agnello surgelato", "agnello congelato", "agnello abbattuto", "agnello glassato"], sotto1: "Carni", sotto2: "Agnello" },
  { keywords: ["coniglio surgelato", "coniglio congelato", "coniglio abbattuto"], sotto1: "Carni", sotto2: "Coniglio" },
  { keywords: ["anatra surgelata", "anatra congelata", "petto anatra surgelato", "anatra abbattuta"], sotto1: "Carni", sotto2: "Anatra" },
  { keywords: ["tacchino surgelato", "petto tacchino surgelato", "tacchino abbattuto"], sotto1: "Carni", sotto2: "Tacchino" },
  { keywords: ["salsiccia surgelata", "salsicce surgelate"], sotto1: "Carni", sotto2: "Salsiccia" },
  { keywords: ["polpette surgelate", "polpetta surgelata"], sotto1: "Carni", sotto2: "Polpette" },
  { keywords: ["wurstel surgelato", "hot dog surgelato"], sotto1: "Carni", sotto2: "Wurstel" },
  { keywords: ["misto carni surgelato", "spiedini surgelati"], sotto1: "Carni", sotto2: "Misto Carni" },

  // ══════════════════════════════════════════════════════════════════════════
  // PESCE SURGELATO — varianti fresco/IQF/glassato/abbattuto
  // ══════════════════════════════════════════════════════════════════════════

  // Salmone
  { keywords: ["salmone surgelato", "filetto salmone surgelato", "salmone congelato", "salmone iqf", "salmone glassato", "salmone abbattuto", "salmone glass"], sotto1: "Pesce", sotto2: "Salmone" },

  // Merluzzo / Baccalà
  { keywords: ["merluzzo surgelato", "filetto merluzzo surgelato", "merluzzo congelato", "baccala surgelato", "merluzzo iqf", "merluzzo glassato", "merluzzo abbattuto", "merluzzo glass"], sotto1: "Pesce", sotto2: "Merluzzo" },

  // Tonno
  { keywords: ["tonno surgelato", "trancio tonno surgelato", "tonno iqf", "tonno glassato", "tonno abbattuto", "tonno glass"], sotto1: "Pesce", sotto2: "Tonno" },

  // Pesce Spada
  { keywords: ["pesce spada surgelato", "trancio pesce spada surgelato", "pesce spada iqf", "pesce spada glassato", "pesce spada abbattuto", "pesce spada glass"], sotto1: "Pesce", sotto2: "Pesce Spada" },

  // Orata / Branzino
  { keywords: ["orata surgelata", "branzino surgelato", "spigola surgelata", "orata iqf", "orata glassata", "branzino glassato", "orata abbattuta", "branzino abbattuto"], sotto1: "Pesce", sotto2: "Branzino/Orata" },

  // Ricciola
  { keywords: ["ricciola surgelata", "ricciola iqf", "ricciola glassata", "ricciola abbattuta", "ricciola glass"], sotto1: "Pesce", sotto2: "Ricciola" },

  // Gamberi — tutte le varianti e calibri
  { keywords: ["gamberi surgelati", "gambero surgelato", "code gamberi surgelate", "gamberi iqf", "gamberi glassati", "gambero glassato", "gamberi abbattuti", "gambero abbattuto", "gamberi glass", "gamb iqf", "gambero indop", "gambero vannamei surgelato", "gambero tropicale surgelato", "gambero tigre surgelato", "gamb.indop", "gambero pink surgelato", "gambero bianco surgelato", "gambero rosa surgelato", "gambero rosso surgelato", "gambero viola surgelato", "gambero blu surgelato"], sotto1: "Pesce", sotto2: "Gamberi" },

  // Gamberoni / Mazzancolle
  { keywords: ["mazzancolle surgelate", "mazzancolla surgelata", "gamberoni surgelati", "mazzancolle iqf", "mazzancolle glassate", "mazzancolle abbattute", "mazzancolle glass"], sotto1: "Pesce", sotto2: "Gamberoni" },

  // Gamberetti
  { keywords: ["gamberetti surgelati", "gamberetto surgelato", "gamberetti iqf", "gamberetti glassati"], sotto1: "Pesce", sotto2: "Gamberetti" },

  // Scampi
  { keywords: ["scampi surgelati", "scampo surgelato", "scampi iqf", "scampi glassati", "scampi abbattuti", "scampi glass"], sotto1: "Pesce", sotto2: "Scampi" },

  // Aragosta / Astice
  { keywords: ["aragosta surgelata", "aragosta iqf", "aragosta glassata", "coda aragosta surgelata"], sotto1: "Pesce", sotto2: "Aragosta" },
  { keywords: ["astice surgelato", "astice iqf", "astice glassato", "coda astice surgelata"], sotto1: "Pesce", sotto2: "Astice" },

  // Calamari
  { keywords: ["calamari surgelati", "calamaro surgelato", "calamari congelati", "calamari iqf", "calamari glassati", "calamaro glassato", "calamari abbattuti", "calamaro abbattuto", "calamari glass", "calamaretto surgelato", "calamaretti surgelati"], sotto1: "Pesce", sotto2: "Calamari" },

  // Polpo
  { keywords: ["polpo surgelato", "polpo congelato", "polpo iqf", "polpo glassato", "polpo abbattuto", "polpo glass", "polpi surgelati", "polpi glassati", "polpi abbattuti"], sotto1: "Pesce", sotto2: "Polpo" },

  // Seppia
  { keywords: ["seppia surgelata", "seppie surgelate", "seppia iqf", "seppia glassata", "seppie glassate", "seppia abbattuta", "seppie abbattute", "seppia glass"], sotto1: "Pesce", sotto2: "Seppia" },

  // Cozze
  { keywords: ["cozze surgelate", "cozza surgelata", "cozze sgusciate surgelate", "cozze iqf", "cozze glassate", "cozze abbattute"], sotto1: "Pesce", sotto2: "Cozze" },

  // Vongole
  { keywords: ["vongole surgelate", "vongola surgelata", "vongole iqf", "vongole glassate"], sotto1: "Pesce", sotto2: "Vongole" },

  // Capesante
  { keywords: ["capesante surgelate", "capasanta surgelata", "capesante iqf", "capesante glassate", "noce capasanta surgelata"], sotto1: "Pesce", sotto2: "Capesante" },

  // Misto mare
  { keywords: ["misto mare surgelato", "frutti di mare surgelati", "seafood mix surgelato", "misto mare iqf", "misto mare glassato"], sotto1: "Pesce", sotto2: "Misto Mare" },

  // Bastoncini
  { keywords: ["bastoncini pesce", "bastoncini di merluzzo", "fish fingers", "bastoncini surgelati"], sotto1: "Pesce", sotto2: "Bastoncini" },

  // Sogliola
  { keywords: ["sogliola surgelata", "filetto sogliola surgelato", "sogliola iqf", "sogliola glassata"], sotto1: "Pesce", sotto2: "Sogliola" },

  // Rombo
  { keywords: ["rombo surgelato", "rombo iqf", "rombo glassato", "rombo abbattuto"], sotto1: "Pesce", sotto2: "Rombo" },

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
  { keywords: ["funghi surgelati", "fungo surgelato", "porcini surgelati"], sotto1: "Verdure", sotto2: "Funghi" },
  { keywords: ["peperoni surgelati", "peperone surgelato"], sotto1: "Verdure", sotto2: "Peperoni" },
  { keywords: ["carciofi surgelati", "carciofo surgelato"], sotto1: "Verdure", sotto2: "Carciofi" },
  { keywords: ["fave surgelate", "fava surgelata"], sotto1: "Verdure", sotto2: "Fave" },
  { keywords: ["misto verdure surgelato", "verdure miste surgelate", "minestrone surgelato", "mix verdure surgelato"], sotto1: "Verdure", sotto2: "Misto Verdure" },
  { keywords: ["cipolla surgelata", "cipolle surgelate", "cipolla tritata surgelata"], sotto1: "Verdure", sotto2: "Cipolla" },

  // ══════════════════════════════════════════════════════════════════════════
  // PREPARATI SURGELATI
  // ══════════════════════════════════════════════════════════════════════════

  { keywords: ["pizza surgelata", "pizza congelata"], sotto1: "Preparati", sotto2: "Pizza" },
  { keywords: ["lasagne surgelate", "lasagna surgelata", "lasagne al forno surgelate"], sotto1: "Preparati", sotto2: "Lasagne" },
  { keywords: ["cannelloni surgelati", "cannellone surgelato"], sotto1: "Preparati", sotto2: "Cannelloni" },
  { keywords: ["arancini surgelati", "arancino surgelato", "supplì surgelato"], sotto1: "Preparati", sotto2: "Arancini" },
  { keywords: ["crocchette surgelate", "crocchetta surgelata", "crocchette di patate surgelate"], sotto1: "Preparati", sotto2: "Crocchette" },
  { keywords: ["frittura mista surgelata", "misto fritto surgelato"], sotto1: "Preparati", sotto2: "Frittura Mista" },
  { keywords: ["cotoletta surgelata", "cotolette surgelate", "cotoletta impanata surgelata"], sotto1: "Preparati", sotto2: "Cotolette" },
  { keywords: ["minestra surgelata", "zuppa surgelata", "vellutata surgelata"], sotto1: "Preparati", sotto2: "Zuppe" },
  { keywords: ["gnocchi surgelati", "gnocco surgelato", "gnocchi di patate surgelati"], sotto1: "Preparati", sotto2: "Gnocchi" },
  { keywords: ["ravioli surgelati", "tortellini surgelati", "pasta ripiena surgelata"], sotto1: "Preparati", sotto2: "Pasta Ripiena" },
  { keywords: ["pane surgelato", "pane congelato", "baguette surgelata", "panini surgelati", "croissant surgelato"], sotto1: "Preparati", sotto2: "Pane e Lievitati" },
  { keywords: ["pasta fresca surgelata", "pasta surgelata"], sotto1: "Preparati", sotto2: "Pasta Fresca" },
  { keywords: ["frutta surgelata", "frutti di bosco surgelati", "fragole surgelate", "mirtilli surgelati"], sotto1: "Preparati", sotto2: "Frutta" },
  { keywords: ["erbe surgelate", "basilico surgelato", "prezzemolo surgelato", "erbe aromatiche surgelate"], sotto1: "Preparati", sotto2: "Erbe Aromatiche" },
  { keywords: ["brodo surgelato", "brodo congelato", "fondo surgelato"], sotto1: "Preparati", sotto2: "Brodi e Fondi" },
  { keywords: ["impasto surgelato", "pasta sfoglia surgelata", "pasta brisee surgelata"], sotto1: "Preparati", sotto2: "Impasti" },
  { keywords: ["uova surgelate", "albume surgelato", "tuorlo surgelato"], sotto1: "Preparati", sotto2: "Uova" },

  // ══════════════════════════════════════════════════════════════════════════
  // GELATI E DOLCI
  // ══════════════════════════════════════════════════════════════════════════

  { keywords: ["gelato", "sorbetto", "semifreddo surgelato", "gelato artigianale surgelato"], sotto1: "Gelati e Dolci", sotto2: "Gelati" },
]

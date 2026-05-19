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

  { keywords: ["pollo surgelato", "petto pollo surgelato", "pollo congelato", "petto di pollo surgelato"], sotto1: "Carni", sotto2: "Pollo" },
  { keywords: ["hamburger surgelato", "hamburger congelato", "burger surgelato"], sotto1: "Carni", sotto2: "Hamburger" },
  { keywords: ["manzo surgelato", "bovino surgelato", "carne bovina surgelata"], sotto1: "Carni", sotto2: "Manzo" },
  { keywords: ["maiale surgelato", "suino surgelato", "carne suina surgelata"], sotto1: "Carni", sotto2: "Maiale" },
  { keywords: ["agnello surgelato", "agnello congelato"], sotto1: "Carni", sotto2: "Agnello" },
  { keywords: ["coniglio surgelato", "coniglio congelato"], sotto1: "Carni", sotto2: "Coniglio" },
  { keywords: ["anatra surgelata", "anatra congelata", "petto anatra surgelato"], sotto1: "Carni", sotto2: "Anatra" },
  { keywords: ["tacchino surgelato", "petto tacchino surgelato"], sotto1: "Carni", sotto2: "Tacchino" },
  { keywords: ["salsiccia surgelata", "salsicce surgelate"], sotto1: "Carni", sotto2: "Salsiccia" },
  { keywords: ["polpette surgelate", "polpetta surgelata"], sotto1: "Carni", sotto2: "Polpette" },
  { keywords: ["wurstel surgelato", "hot dog surgelato"], sotto1: "Carni", sotto2: "Wurstel" },
  { keywords: ["misto carni surgelato", "spiedini surgelati"], sotto1: "Carni", sotto2: "Misto Carni" },

  // ══════════════════════════════════════════════════════════════════════════
  // PESCE SURGELATO
  // ══════════════════════════════════════════════════════════════════════════

  { keywords: ["salmone surgelato", "filetto salmone surgelato", "salmone congelato"], sotto1: "Pesce", sotto2: "Salmone" },
  { keywords: ["merluzzo surgelato", "filetto merluzzo surgelato", "merluzzo congelato", "baccala surgelato"], sotto1: "Pesce", sotto2: "Merluzzo" },
  { keywords: ["tonno surgelato", "trancio tonno surgelato"], sotto1: "Pesce", sotto2: "Tonno" },
  { keywords: ["pesce spada surgelato", "trancio pesce spada surgelato"], sotto1: "Pesce", sotto2: "Pesce Spada" },
  { keywords: ["orata surgelata", "branzino surgelato", "spigola surgelata"], sotto1: "Pesce", sotto2: "Branzino/Orata" },
  { keywords: ["gamberi surgelati", "gambero surgelato", "code gamberi surgelate", "mazzancolle surgelate"], sotto1: "Pesce", sotto2: "Gamberi" },
  { keywords: ["scampi surgelati", "scampo surgelato"], sotto1: "Pesce", sotto2: "Scampi" },
  { keywords: ["calamari surgelati", "calamaro surgelato", "calamari congelati"], sotto1: "Pesce", sotto2: "Calamari" },
  { keywords: ["polpo surgelato", "polpo congelato"], sotto1: "Pesce", sotto2: "Polpo" },
  { keywords: ["seppia surgelata", "seppie surgelate"], sotto1: "Pesce", sotto2: "Seppia" },
  { keywords: ["cozze surgelate", "cozza surgelata", "cozze sgusciate surgelate"], sotto1: "Pesce", sotto2: "Cozze" },
  { keywords: ["vongole surgelate", "vongola surgelata"], sotto1: "Pesce", sotto2: "Vongole" },
  { keywords: ["misto mare surgelato", "frutti di mare surgelati", "seafood mix surgelato"], sotto1: "Pesce", sotto2: "Misto Mare" },
  { keywords: ["bastoncini pesce", "bastoncini di merluzzo", "fish fingers"], sotto1: "Pesce", sotto2: "Bastoncini" },
  { keywords: ["capesante surgelate", "capasanta surgelata"], sotto1: "Pesce", sotto2: "Capesante" },

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
  // PIATTI PRONTI SURGELATI
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

  // ══════════════════════════════════════════════════════════════════════════
  // ALTRO SURGELATO
  // ══════════════════════════════════════════════════════════════════════════

  { keywords: ["pane surgelato", "pane congelato", "baguette surgelata", "panini surgelati", "croissant surgelato"], sotto1: "Preparati", sotto2: "Pane e Lievitati" },
  { keywords: ["pasta fresca surgelata", "pasta surgelata"], sotto1: "Preparati", sotto2: "Pasta Fresca" },
  { keywords: ["gelato", "sorbetto", "semifreddo surgelato"], sotto1: "Gelati e Dolci", sotto2: "Gelati" },
  { keywords: ["frutta surgelata", "frutti di bosco surgelati", "fragole surgelate", "mirtilli surgelati"], sotto1: "Preparati", sotto2: "Frutta" },
  { keywords: ["erbe surgelate", "basilico surgelato", "prezzemolo surgelato", "erbe aromatiche surgelate"], sotto1: "Preparati", sotto2: "Erbe Aromatiche" },
  { keywords: ["brodo surgelato", "brodo congelato", "fondo surgelato"], sotto1: "Preparati", sotto2: "Brodi e Fondi" },
  { keywords: ["impasto surgelato", "pasta sfoglia surgelata", "pasta brisee surgelata"], sotto1: "Preparati", sotto2: "Impasti" },
  { keywords: ["uova surgelate", "albume surgelato", "tuorlo surgelato"], sotto1: "Preparati", sotto2: "Uova" },
]

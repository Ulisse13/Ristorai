// ─────────────────────────────────────────────────────────────────────────────
// foodDB_pesce.js — Database prodotti PESCE per Ristorai
// Struttura: keywords → { cat, sotto1 (specie), sotto2 (lavorazione) }
// ─────────────────────────────────────────────────────────────────────────────

export const PESCE_DB = [

  // ── 1. ORATA ───────────────────────────────────────────────────────────────
  { keywords: ["orata", "orate"], sotto1: "Orata", sotto2: "" },
  { keywords: ["orata intera", "orate intere", "orata fresca intera"], sotto1: "Orata", sotto2: "Intero" },
  { keywords: ["filetto orata", "filetti orata", "filetto di orata"], sotto1: "Orata", sotto2: "Filetto" },

  // ── 2. BRANZINO ────────────────────────────────────────────────────────────
  { keywords: ["branzino", "spigola", "branzini"], sotto1: "Branzino", sotto2: "" },
  { keywords: ["branzino intero", "spigola intera", "branzino fresco intero"], sotto1: "Branzino", sotto2: "Intero" },
  { keywords: ["filetto branzino", "filetto di branzino", "filetti branzino", "filetto spigola"], sotto1: "Branzino", sotto2: "Filetto" },

  // ── 3. PAGRO ───────────────────────────────────────────────────────────────
  { keywords: ["pagro", "pagri", "pagro reale"], sotto1: "Pagro", sotto2: "" },
  { keywords: ["pagro intero", "pagro fresco intero"], sotto1: "Pagro", sotto2: "Intero" },
  { keywords: ["filetto pagro", "filetti pagro", "filetto di pagro"], sotto1: "Pagro", sotto2: "Filetto" },

  // ── 4. TONNO ───────────────────────────────────────────────────────────────
  { keywords: ["tonno fresco", "tonno rosso", "tonno pinna gialla", "alalunga"], sotto1: "Tonno", sotto2: "" },
  { keywords: ["tonno intero", "tonno fresco intero"], sotto1: "Tonno", sotto2: "Intero" },
  { keywords: ["filetto tonno", "filetto di tonno", "filetti tonno"], sotto1: "Tonno", sotto2: "Filetto" },
  { keywords: ["filone tonno", "filone di tonno"], sotto1: "Tonno", sotto2: "Filone" },
  { keywords: ["trancio tonno", "tranci tonno", "trancio di tonno"], sotto1: "Tonno", sotto2: "Trancio" },

  // ── 5. PESCE SPADA ─────────────────────────────────────────────────────────
  { keywords: ["pesce spada"], sotto1: "Pesce Spada", sotto2: "" },
  { keywords: ["pesce spada intero"], sotto1: "Pesce Spada", sotto2: "Intero" },
  { keywords: ["filetto pesce spada", "filetto di pesce spada"], sotto1: "Pesce Spada", sotto2: "Filetto" },
  { keywords: ["filone pesce spada"], sotto1: "Pesce Spada", sotto2: "Filone" },
  { keywords: ["trancio pesce spada", "tranci pesce spada"], sotto1: "Pesce Spada", sotto2: "Trancio" },

  // ── 6. RICCIOLA ────────────────────────────────────────────────────────────
  { keywords: ["ricciola", "ricciole"], sotto1: "Ricciola", sotto2: "" },
  { keywords: ["ricciola intera", "ricciola fresca intera"], sotto1: "Ricciola", sotto2: "Intero" },
  { keywords: ["filetto ricciola", "filetti ricciola", "filetto di ricciola"], sotto1: "Ricciola", sotto2: "Filetto" },
  { keywords: ["filone ricciola"], sotto1: "Ricciola", sotto2: "Filone" },
  { keywords: ["trancio ricciola", "tranci ricciola"], sotto1: "Ricciola", sotto2: "Trancio" },

  // ── 7. OMBRINA ─────────────────────────────────────────────────────────────
  { keywords: ["ombrina", "ombrine"], sotto1: "Ombrina", sotto2: "" },
  { keywords: ["ombrina intera", "ombrina fresca intera"], sotto1: "Ombrina", sotto2: "Intero" },
  { keywords: ["filetto ombrina", "filetti ombrina", "filetto di ombrina"], sotto1: "Ombrina", sotto2: "Filetto" },
  { keywords: ["filone ombrina"], sotto1: "Ombrina", sotto2: "Filone" },
  { keywords: ["trancio ombrina", "tranci ombrina"], sotto1: "Ombrina", sotto2: "Trancio" },

  // ── 8. CERNIA ──────────────────────────────────────────────────────────────
  { keywords: ["cernia", "cernie"], sotto1: "Cernia", sotto2: "" },
  { keywords: ["cernia intera", "cernia fresca intera"], sotto1: "Cernia", sotto2: "Intero" },
  { keywords: ["filetto cernia", "filetti cernia", "filetto di cernia"], sotto1: "Cernia", sotto2: "Filetto" },
  { keywords: ["filone cernia"], sotto1: "Cernia", sotto2: "Filone" },
  { keywords: ["trancio cernia", "tranci cernia"], sotto1: "Cernia", sotto2: "Trancio" },

  // ── 9. DENTICE ─────────────────────────────────────────────────────────────
  { keywords: ["dentice", "dentici"], sotto1: "Dentice", sotto2: "" },
  { keywords: ["dentice intero", "dentice fresco intero"], sotto1: "Dentice", sotto2: "Intero" },
  { keywords: ["filetto dentice", "filetti dentice", "filetto di dentice"], sotto1: "Dentice", sotto2: "Filetto" },
  { keywords: ["filone dentice"], sotto1: "Dentice", sotto2: "Filone" },
  { keywords: ["trancio dentice", "tranci dentice"], sotto1: "Dentice", sotto2: "Trancio" },

  // ── 10. SALMONE ────────────────────────────────────────────────────────────
  { keywords: ["salmone fresco", "salmone atlantico", "salmone norvegese"], sotto1: "Salmone", sotto2: "" },
  { keywords: ["salmone intero", "salmone fresco intero"], sotto1: "Salmone", sotto2: "Intero" },
  { keywords: ["filetto salmone", "filetto di salmone", "filetti salmone"], sotto1: "Salmone", sotto2: "Filetto" },
  { keywords: ["filone salmone"], sotto1: "Salmone", sotto2: "Filone" },
  { keywords: ["trancio salmone", "tranci salmone"], sotto1: "Salmone", sotto2: "Trancio" },

  // ── 11. CALAMARI ───────────────────────────────────────────────────────────
  { keywords: ["calamaro", "calamari", "calamaretto", "calamaretti"], sotto1: "Calamari", sotto2: "" },
  { keywords: ["calamari puliti", "calamaro pulito", "calamari mondati"], sotto1: "Calamari", sotto2: "Pulito" },
  { keywords: ["calamari sporchi", "calamaro sporco", "calamari interi con testa"], sotto1: "Calamari", sotto2: "Sporco" },

  // ── 12. POLPO ──────────────────────────────────────────────────────────────
  { keywords: ["polpo", "polpi", "moscardino", "moscardini"], sotto1: "Polpo", sotto2: "" },
  { keywords: ["polpo pulito", "polpi puliti", "polpo mondato"], sotto1: "Polpo", sotto2: "Pulito" },
  { keywords: ["polpo sporco", "polpo intero", "polpi interi", "polpo con testa"], sotto1: "Polpo", sotto2: "Sporco" },
  { keywords: ["tentacoli polpo", "tentacoli di polpo"], sotto1: "Polpo", sotto2: "Tentacoli" },

  // ── 13. SEPPIA ─────────────────────────────────────────────────────────────
  { keywords: ["seppia", "seppie", "seppiolina", "seppiolina"], sotto1: "Seppia", sotto2: "" },
  { keywords: ["seppia pulita", "seppie pulite", "seppia mondata"], sotto1: "Seppia", sotto2: "Pulito" },
  { keywords: ["seppia sporca", "seppia intera", "seppie intere", "seppia con nero"], sotto1: "Seppia", sotto2: "Sporco" },

  // ── ALTRI PESCI COMUNI ─────────────────────────────────────────────────────
  { keywords: ["merluzzo", "merluzzi", "baccala fresco"], sotto1: "Merluzzo", sotto2: "" },
  { keywords: ["filetto merluzzo", "filetti merluzzo"], sotto1: "Merluzzo", sotto2: "Filetto" },
  { keywords: ["trancio merluzzo"], sotto1: "Merluzzo", sotto2: "Trancio" },

  { keywords: ["sogliola", "sogliole"], sotto1: "Sogliola", sotto2: "" },
  { keywords: ["filetto sogliola", "filetti sogliola"], sotto1: "Sogliola", sotto2: "Filetto" },

  { keywords: ["rombo", "rombo chiodato", "rombo liscio"], sotto1: "Rombo", sotto2: "" },
  { keywords: ["filetto rombo"], sotto1: "Rombo", sotto2: "Filetto" },
  { keywords: ["trancio rombo"], sotto1: "Rombo", sotto2: "Trancio" },

  { keywords: ["acciughe fresche", "alice fresca", "alici fresche"], sotto1: "Acciuga", sotto2: "" },
  { keywords: ["sarde fresche", "sardine fresche"], sotto1: "Sarda", sotto2: "" },
  { keywords: ["sgombro fresco", "sgombri freschi"], sotto1: "Sgombro", sotto2: "" },

  { keywords: ["spinarolo", "palombo", "gattucci"], sotto1: "Pesce di fondale", sotto2: "" },
  { keywords: ["trota", "trota salmonata", "trota iridea"], sotto1: "Trota", sotto2: "" },
  { keywords: ["filetto trota", "filetti trota"], sotto1: "Trota", sotto2: "Filetto" },

  // ── CROSTACEI ──────────────────────────────────────────────────────────────

  // Gamberi — vari tipi
  { keywords: ["gambero rosa", "gamberi rosa", "gambero mediterraneo", "gamberi mediterraneo"], sotto1: "Gambero Rosa", sotto2: "" },
  { keywords: ["gambero rosso", "gamberi rossi", "gambero rosso di mazara", "gambero rosso di sicilia"], sotto1: "Gambero Rosso", sotto2: "" },
  { keywords: ["gambero viola", "gamberi viola"], sotto1: "Gambero Viola", sotto2: "" },
  { keywords: ["gambero blu", "gamberi blu", "gambero blu adriatico"], sotto1: "Gambero Blu", sotto2: "" },
  { keywords: ["gambero bianco", "gamberi bianchi", "gambero imperiale"], sotto1: "Gambero Bianco", sotto2: "" },
  { keywords: ["gamberone", "gamberoni", "mazzancolla", "mazzancolle", "gambero argentino"], sotto1: "Gamberoni", sotto2: "" },
  { keywords: ["gambero tropicale", "gambero vannamei", "gambero tigre", "tiger prawn"], sotto1: "Gambero Tropicale", sotto2: "" },
  { keywords: ["gamberetto", "gamberetti", "gambero grigio", "gamberi grigi"], sotto1: "Gamberetti", sotto2: "" },
  // Lavorazione gamberi
  { keywords: ["gamberi puliti", "gamberi sgusciati", "code gamberi", "code di gambero"], sotto1: "Gamberi", sotto2: "Pulito" },
  { keywords: ["gamberi interi", "gamberi con testa", "gamberi sporchi"], sotto1: "Gamberi", sotto2: "Sporco" },

  // Scampi
  { keywords: ["scampo", "scampi", "scampo norvegese", "langoustine"], sotto1: "Scampi", sotto2: "" },
  { keywords: ["scampi puliti", "code scampi", "code di scampo"], sotto1: "Scampi", sotto2: "Pulito" },
  { keywords: ["scampi interi", "scampi con testa"], sotto1: "Scampi", sotto2: "Sporco" },

  // Aragoste
  { keywords: ["aragosta", "aragoste", "aragosta europea", "aragosta rossa"], sotto1: "Aragosta", sotto2: "" },
  { keywords: ["aragosta intera", "aragosta viva"], sotto1: "Aragosta", sotto2: "Intero" },
  { keywords: ["mezza aragosta", "code aragosta", "coda aragosta"], sotto1: "Aragosta", sotto2: "Coda" },

  // Astici
  { keywords: ["astice", "astici", "astice europeo", "astice blu", "astice americano", "astice canadese", "homard"], sotto1: "Astice", sotto2: "" },
  { keywords: ["astice intero", "astice vivo"], sotto1: "Astice", sotto2: "Intero" },
  { keywords: ["mezza astice", "coda astice", "code astice"], sotto1: "Astice", sotto2: "Coda" },

  // Granchi
  { keywords: ["granchio", "granchi", "granciporro", "granchio comune"], sotto1: "Granchio", sotto2: "" },
  { keywords: ["grancevola", "granceola", "granseola"], sotto1: "Grancevola", sotto2: "" },
  { keywords: ["granchio reale", "king crab", "granchio delle nevi", "snow crab"], sotto1: "Granchio Reale", sotto2: "" },
  { keywords: ["falanghina granchio", "moleche", "moeca"], sotto1: "Moleche", sotto2: "" },
  { keywords: ["polpa granchio", "polpa di granchio"], sotto1: "Granchio", sotto2: "Polpa" },

  // Altri crostacei
  { keywords: ["cicala di mare", "cicale di mare", "canocchia", "canocchie", "pannocchia", "pannocchie"], sotto1: "Canocchie", sotto2: "" },
  { keywords: ["crostacei misti", "misto crostacei"], sotto1: "Crostacei Misti", sotto2: "" },

  // ── MOLLUSCHI ──────────────────────────────────────────────────────────────

  // Cozze
  { keywords: ["cozze", "mitili", "cozze nere", "cozza"], sotto1: "Cozze", sotto2: "" },
  { keywords: ["cozze pulite", "cozze sgusciate", "cozze spurgate"], sotto1: "Cozze", sotto2: "Pulito" },
  { keywords: ["cozze sporche", "cozze con guscio", "cozze intere"], sotto1: "Cozze", sotto2: "Sporco" },

  // Vongole
  { keywords: ["vongola", "vongole", "vongole veraci", "vongole lupini"], sotto1: "Vongole", sotto2: "" },
  { keywords: ["vongole sgusciate", "vongole pulite"], sotto1: "Vongole", sotto2: "Pulito" },
  { keywords: ["vongole con guscio", "vongole spurgate"], sotto1: "Vongole", sotto2: "Sporco" },

  // Ostriche
  { keywords: ["ostrica", "ostriche", "ostrica piatta", "ostrica concava", "fine de claire", "speciale"], sotto1: "Ostriche", sotto2: "" },

  // Capesante
  { keywords: ["capasanta", "capesante", "noce di capasanta", "pettine", "pettini di mare", "saint jacques"], sotto1: "Capesante", sotto2: "" },
  { keywords: ["noce capasanta", "noci capasante", "capesante sgusciate"], sotto1: "Capesante", sotto2: "Noce" },
  { keywords: ["capesante con guscio", "capasanta intera"], sotto1: "Capesante", sotto2: "Intero" },

  // Telline e fasolari
  { keywords: ["tellina", "telline", "arselle"], sotto1: "Telline", sotto2: "" },
  { keywords: ["fasolaro", "fasolari"], sotto1: "Fasolari", sotto2: "" },

  // Datteri e altri
  { keywords: ["dattero di mare", "datteri di mare"], sotto1: "Datteri di Mare", sotto2: "" },
  { keywords: ["tartufo di mare", "tartufi di mare"], sotto1: "Tartufi di Mare", sotto2: "" },
  { keywords: ["cannolicchio", "cannolicchi", "canolicchio"], sotto1: "Cannolicchi", sotto2: "" },
  { keywords: ["lupino", "lupini di mare"], sotto1: "Lupini", sotto2: "" },
  { keywords: ["patella", "patelle"], sotto1: "Patelle", sotto2: "" },
  { keywords: ["riccio di mare", "ricci di mare", "uni"], sotto1: "Ricci di Mare", sotto2: "" },
  { keywords: ["molluschi misti", "misto molluschi", "frutti di mare misti"], sotto1: "Molluschi Misti", sotto2: "" },
]

// ─────────────────────────────────────────────────────────────────────────────
// foodDB_pesce.js — Database prodotti PESCE per Ristorai
// sotto1: specie pesce (Salmone, Orata...) | "Crostacei" | "Molluschi"
// sotto2: taglio (Filetto, Trancio, Intero) o nome specifico per Crostacei/Molluschi
// ─────────────────────────────────────────────────────────────────────────────

export const PESCE_DB = [

  // ── ORATA ──────────────────────────────────────────────────────────────────
  { keywords: ["orata", "orate"], sotto1: "Orata", sotto2: "" },
  { keywords: ["orata intera", "orate intere", "orata fresca intera"], sotto1: "Orata", sotto2: "Intero" },
  { keywords: ["filetto orata", "filetti orata", "filetto di orata"], sotto1: "Orata", sotto2: "Filetto" },

  // ── BRANZINO ───────────────────────────────────────────────────────────────
  { keywords: ["branzino", "spigola", "branzini"], sotto1: "Branzino", sotto2: "" },
  { keywords: ["branzino intero", "spigola intera", "branzino fresco intero"], sotto1: "Branzino", sotto2: "Intero" },
  { keywords: ["filetto branzino", "filetto di branzino", "filetti branzino", "filetto spigola"], sotto1: "Branzino", sotto2: "Filetto" },

  // ── SALMONE ────────────────────────────────────────────────────────────────
  { keywords: ["salmone fresco", "salmone atlantico", "salmone norvegese"], sotto1: "Salmone", sotto2: "" },
  { keywords: ["salmone intero", "salmone fresco intero"], sotto1: "Salmone", sotto2: "Intero" },
  { keywords: ["filetto salmone", "filetto di salmone", "filetti salmone"], sotto1: "Salmone", sotto2: "Filetto" },
  { keywords: ["filone salmone"], sotto1: "Salmone", sotto2: "Filone" },
  { keywords: ["trancio salmone", "tranci salmone"], sotto1: "Salmone", sotto2: "Trancio" },

  // ── PESCE SPADA ────────────────────────────────────────────────────────────
  { keywords: ["pesce spada"], sotto1: "Pesce Spada", sotto2: "" },
  { keywords: ["pesce spada intero"], sotto1: "Pesce Spada", sotto2: "Intero" },
  { keywords: ["filetto pesce spada", "filetto di pesce spada"], sotto1: "Pesce Spada", sotto2: "Filetto" },
  { keywords: ["filone pesce spada"], sotto1: "Pesce Spada", sotto2: "Filone" },
  { keywords: ["trancio pesce spada", "tranci pesce spada"], sotto1: "Pesce Spada", sotto2: "Trancio" },

  // ── TONNO ──────────────────────────────────────────────────────────────────
  { keywords: ["tonno fresco", "tonno rosso", "tonno pinna gialla", "alalunga"], sotto1: "Tonno", sotto2: "" },
  { keywords: ["tonno intero", "tonno fresco intero"], sotto1: "Tonno", sotto2: "Intero" },
  { keywords: ["filetto tonno", "filetto di tonno", "filetti tonno"], sotto1: "Tonno", sotto2: "Filetto" },
  { keywords: ["filone tonno", "filone di tonno"], sotto1: "Tonno", sotto2: "Filone" },
  { keywords: ["trancio tonno", "tranci tonno", "trancio di tonno"], sotto1: "Tonno", sotto2: "Trancio" },

  // ── RICCIOLA ───────────────────────────────────────────────────────────────
  { keywords: ["ricciola", "ricciole"], sotto1: "Ricciola", sotto2: "" },
  { keywords: ["ricciola intera", "ricciola fresca intera"], sotto1: "Ricciola", sotto2: "Intero" },
  { keywords: ["filetto ricciola", "filetti ricciola", "filetto di ricciola"], sotto1: "Ricciola", sotto2: "Filetto" },
  { keywords: ["filone ricciola"], sotto1: "Ricciola", sotto2: "Filone" },
  { keywords: ["trancio ricciola", "tranci ricciola"], sotto1: "Ricciola", sotto2: "Trancio" },

  // ── DENTICE ────────────────────────────────────────────────────────────────
  { keywords: ["dentice", "dentici"], sotto1: "Dentice", sotto2: "" },
  { keywords: ["dentice intero", "dentice fresco intero"], sotto1: "Dentice", sotto2: "Intero" },
  { keywords: ["filetto dentice", "filetti dentice", "filetto di dentice"], sotto1: "Dentice", sotto2: "Filetto" },
  { keywords: ["trancio dentice", "tranci dentice"], sotto1: "Dentice", sotto2: "Trancio" },

  // ── CERNIA ─────────────────────────────────────────────────────────────────
  { keywords: ["cernia", "cernie"], sotto1: "Cernia", sotto2: "" },
  { keywords: ["cernia intera", "cernia fresca intera"], sotto1: "Cernia", sotto2: "Intero" },
  { keywords: ["filetto cernia", "filetti cernia", "filetto di cernia"], sotto1: "Cernia", sotto2: "Filetto" },
  { keywords: ["trancio cernia", "tranci cernia"], sotto1: "Cernia", sotto2: "Trancio" },

  // ── OMBRINA ────────────────────────────────────────────────────────────────
  { keywords: ["ombrina", "ombrine"], sotto1: "Ombrina", sotto2: "" },
  { keywords: ["ombrina intera", "ombrina fresca intera"], sotto1: "Ombrina", sotto2: "Intero" },
  { keywords: ["filetto ombrina", "filetti ombrina", "filetto di ombrina"], sotto1: "Ombrina", sotto2: "Filetto" },
  { keywords: ["trancio ombrina", "tranci ombrina"], sotto1: "Ombrina", sotto2: "Trancio" },

  // ── ALTRI PESCI ────────────────────────────────────────────────────────────
  { keywords: ["pagro", "pagri", "pagro reale"], sotto1: "Pagro", sotto2: "" },
  { keywords: ["filetto pagro", "filetti pagro", "filetto di pagro"], sotto1: "Pagro", sotto2: "Filetto" },

  { keywords: ["merluzzo", "merluzzi", "baccala fresco"], sotto1: "Merluzzo", sotto2: "" },
  { keywords: ["filetto merluzzo", "filetti merluzzo"], sotto1: "Merluzzo", sotto2: "Filetto" },
  { keywords: ["trancio merluzzo"], sotto1: "Merluzzo", sotto2: "Trancio" },

  { keywords: ["sogliola", "sogliole"], sotto1: "Sogliola", sotto2: "" },
  { keywords: ["filetto sogliola", "filetti sogliola"], sotto1: "Sogliola", sotto2: "Filetto" },

  { keywords: ["rombo", "rombo chiodato", "rombo liscio"], sotto1: "Rombo", sotto2: "" },
  { keywords: ["filetto rombo"], sotto1: "Rombo", sotto2: "Filetto" },
  { keywords: ["trancio rombo"], sotto1: "Rombo", sotto2: "Trancio" },

  { keywords: ["trota", "trota salmonata", "trota iridea"], sotto1: "Trota", sotto2: "" },
  { keywords: ["filetto trota", "filetti trota"], sotto1: "Trota", sotto2: "Filetto" },

  { keywords: ["acciughe fresche", "alice fresca", "alici fresche"], sotto1: "Acciuga", sotto2: "" },
  { keywords: ["sarde fresche", "sardine fresche"], sotto1: "Sarda", sotto2: "" },
  { keywords: ["sgombro fresco", "sgombri freschi"], sotto1: "Sgombro", sotto2: "" },
  { keywords: ["spinarolo", "palombo", "gattucci"], sotto1: "Pesce di fondale", sotto2: "" },

  // ── CROSTACEI ──────────────────────────────────────────────────────────────
  // sotto1 = "Crostacei" | sotto2 = tipo specifico

  // Gamberi
  { keywords: ["gambero rosa", "gamberi rosa", "gambero mediterraneo", "gamberi mediterraneo"], sotto1: "Crostacei", sotto2: "Gambero Rosa" },
  { keywords: ["gambero rosso", "gamberi rossi", "gambero rosso di mazara", "gambero rosso di sicilia"], sotto1: "Crostacei", sotto2: "Gambero Rosso" },
  { keywords: ["gambero viola", "gamberi viola"], sotto1: "Crostacei", sotto2: "Gambero Viola" },
  { keywords: ["gambero blu", "gamberi blu", "gambero blu adriatico"], sotto1: "Crostacei", sotto2: "Gambero Blu" },
  { keywords: ["gambero bianco", "gamberi bianchi", "gambero imperiale"], sotto1: "Crostacei", sotto2: "Gambero Bianco" },
  { keywords: ["gamberone", "gamberoni", "mazzancolla", "mazzancolle", "gambero argentino"], sotto1: "Crostacei", sotto2: "Gamberoni" },
  { keywords: ["gambero tropicale", "gambero vannamei", "gambero tigre", "tiger prawn"], sotto1: "Crostacei", sotto2: "Gambero Tropicale" },
  { keywords: ["gamberetto", "gamberetti", "gambero grigio", "gamberi grigi"], sotto1: "Crostacei", sotto2: "Gamberetti" },
  { keywords: ["gamberi puliti", "gamberi sgusciati", "code gamberi", "code di gambero"], sotto1: "Crostacei", sotto2: "Gamberi - Code" },
  { keywords: ["gamberi interi", "gamberi con testa", "gamberi sporchi"], sotto1: "Crostacei", sotto2: "Gamberi - Interi" },

  // Scampi
  { keywords: ["scampo", "scampi", "scampo norvegese", "langoustine"], sotto1: "Crostacei", sotto2: "Scampi" },
  { keywords: ["scampi puliti", "code scampi", "code di scampo"], sotto1: "Crostacei", sotto2: "Scampi - Code" },
  { keywords: ["scampi interi", "scampi con testa"], sotto1: "Crostacei", sotto2: "Scampi - Interi" },

  // Aragoste
  { keywords: ["aragosta", "aragoste", "aragosta europea", "aragosta rossa"], sotto1: "Crostacei", sotto2: "Aragosta" },
  { keywords: ["aragosta intera", "aragosta viva"], sotto1: "Crostacei", sotto2: "Aragosta - Intera" },
  { keywords: ["mezza aragosta", "code aragosta", "coda aragosta"], sotto1: "Crostacei", sotto2: "Aragosta - Coda" },

  // Astici
  { keywords: ["astice", "astici", "astice europeo", "astice blu", "astice americano", "astice canadese", "homard"], sotto1: "Crostacei", sotto2: "Astice" },
  { keywords: ["astice intero", "astice vivo"], sotto1: "Crostacei", sotto2: "Astice - Intero" },
  { keywords: ["mezza astice", "coda astice", "code astice"], sotto1: "Crostacei", sotto2: "Astice - Coda" },

  // Granchi
  { keywords: ["granchio", "granchi", "granciporro", "granchio comune"], sotto1: "Crostacei", sotto2: "Granchio" },
  { keywords: ["grancevola", "granceola", "granseola"], sotto1: "Crostacei", sotto2: "Grancevola" },
  { keywords: ["granchio reale", "king crab", "granchio delle nevi", "snow crab"], sotto1: "Crostacei", sotto2: "Granchio Reale" },
  { keywords: ["moleche", "moeca"], sotto1: "Crostacei", sotto2: "Moleche" },
  { keywords: ["polpa granchio", "polpa di granchio"], sotto1: "Crostacei", sotto2: "Polpa di Granchio" },

  // Canocchie
  { keywords: ["cicala di mare", "cicale di mare", "canocchia", "canocchie", "pannocchia", "pannocchie"], sotto1: "Crostacei", sotto2: "Canocchie" },
  { keywords: ["crostacei misti", "misto crostacei"], sotto1: "Crostacei", sotto2: "Misto Crostacei" },

  // ── MOLLUSCHI ──────────────────────────────────────────────────────────────
  // sotto1 = "Molluschi" | sotto2 = tipo + lavorazione

  // Calamari
  { keywords: ["calamaro", "calamari", "calamaretto", "calamaretti"], sotto1: "Molluschi", sotto2: "Calamaro" },
  { keywords: ["calamari puliti", "calamaro pulito", "calamari mondati"], sotto1: "Molluschi", sotto2: "Calamaro - Pulito" },
  { keywords: ["calamari sporchi", "calamaro sporco", "calamari interi con testa"], sotto1: "Molluschi", sotto2: "Calamaro - Sporco" },

  // Polpo
  { keywords: ["polpo", "polpi", "moscardino", "moscardini"], sotto1: "Molluschi", sotto2: "Polpo" },
  { keywords: ["polpo pulito", "polpi puliti", "polpo mondato"], sotto1: "Molluschi", sotto2: "Polpo - Pulito" },
  { keywords: ["polpo sporco", "polpo intero", "polpi interi", "polpo con testa"], sotto1: "Molluschi", sotto2: "Polpo - Sporco" },
  { keywords: ["tentacoli polpo", "tentacoli di polpo"], sotto1: "Molluschi", sotto2: "Polpo - Tentacoli" },

  // Seppia
  { keywords: ["seppia", "seppie", "seppiolina"], sotto1: "Molluschi", sotto2: "Seppia" },
  { keywords: ["seppia pulita", "seppie pulite", "seppia mondata"], sotto1: "Molluschi", sotto2: "Seppia - Pulita" },
  { keywords: ["seppia sporca", "seppia intera", "seppie intere", "seppia con nero"], sotto1: "Molluschi", sotto2: "Seppia - Sporca" },

  // Cozze
  { keywords: ["cozze", "mitili", "cozze nere", "cozza"], sotto1: "Molluschi", sotto2: "Cozze" },
  { keywords: ["cozze pulite", "cozze sgusciate", "cozze spurgate"], sotto1: "Molluschi", sotto2: "Cozze - Pulite" },
  { keywords: ["cozze sporche", "cozze con guscio", "cozze intere"], sotto1: "Molluschi", sotto2: "Cozze - Con guscio" },

  // Vongole
  { keywords: ["vongola", "vongole", "vongole veraci", "vongole lupini"], sotto1: "Molluschi", sotto2: "Vongole" },
  { keywords: ["vongole sgusciate", "vongole pulite"], sotto1: "Molluschi", sotto2: "Vongole - Sgusciate" },
  { keywords: ["vongole con guscio", "vongole spurgate"], sotto1: "Molluschi", sotto2: "Vongole - Con guscio" },

  // Ostriche
  { keywords: ["ostrica", "ostriche", "ostrica piatta", "ostrica concava", "fine de claire", "speciale"], sotto1: "Molluschi", sotto2: "Ostrica" },

  // Capesante
  { keywords: ["capasanta", "capesante", "noce di capasanta", "pettine", "pettini di mare", "saint jacques"], sotto1: "Molluschi", sotto2: "Capasanta" },
  { keywords: ["noce capasanta", "noci capasante", "capesante sgusciate"], sotto1: "Molluschi", sotto2: "Capasanta - Noce" },
  { keywords: ["capesante con guscio", "capasanta intera"], sotto1: "Molluschi", sotto2: "Capasanta - Intera" },

  // Telline e fasolari
  { keywords: ["tellina", "telline", "arselle"], sotto1: "Molluschi", sotto2: "Telline" },
  { keywords: ["fasolaro", "fasolari"], sotto1: "Molluschi", sotto2: "Fasolari" },

  // Ricci e altri
  { keywords: ["riccio di mare", "ricci di mare", "uni"], sotto1: "Molluschi", sotto2: "Ricci di Mare" },
  { keywords: ["dattero di mare", "datteri di mare"], sotto1: "Molluschi", sotto2: "Datteri di Mare" },
  { keywords: ["tartufo di mare", "tartufi di mare"], sotto1: "Molluschi", sotto2: "Tartufi di Mare" },
  { keywords: ["cannolicchio", "cannolicchi", "canolicchio"], sotto1: "Molluschi", sotto2: "Cannolicchi" },
  { keywords: ["lupino", "lupini di mare"], sotto1: "Molluschi", sotto2: "Lupini" },
  { keywords: ["molluschi misti", "misto molluschi", "frutti di mare misti"], sotto1: "Molluschi", sotto2: "Misto Molluschi" },
]

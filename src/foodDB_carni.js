// ─────────────────────────────────────────────────────────────────────────────
// foodDB_carni.js — Database prodotti CARNI per Ristorai
// sotto1: Bovino | Maiale | Pollo | Tacchino | Agnello | Anatra | Coniglio | Selvaggina
// sotto2: taglio specifico (o "Animale - Taglio" per Selvaggina)
// ─────────────────────────────────────────────────────────────────────────────

export const CARNI_DB = [

  // ── BOVINO ─────────────────────────────────────────────────────────────────
  { keywords: ["bovino", "manzo", "vitello", "vitellone", "scottona", "bue", "bovino adulto"], sotto1: "Bovino", sotto2: "" },
  { keywords: ["fesa", "fesa manzo", "fesa vitello", "fesa scottona", "fesa vitellone"], sotto1: "Bovino", sotto2: "Fesa" },
  { keywords: ["girello", "girello manzo", "girello vitello", "girello scottona"], sotto1: "Bovino", sotto2: "Girello" },
  { keywords: ["cappello del prete", "cappello prete"], sotto1: "Bovino", sotto2: "Cappello del prete" },
  { keywords: ["reale manzo", "reale bovino"], sotto1: "Bovino", sotto2: "Reale" },
  { keywords: ["filetto manzo", "filetto vitello", "filetto bovino", "filetto di manzo", "filetto di vitello"], sotto1: "Bovino", sotto2: "Filetto" },
  { keywords: ["controfiletto", "sottofiletto"], sotto1: "Bovino", sotto2: "Controfiletto" },
  { keywords: ["costata", "fiorentina", "bistecca", "t-bone", "ribeye", "entrecote"], sotto1: "Bovino", sotto2: "Costata" },
  { keywords: ["punta di petto", "punta petto manzo"], sotto1: "Bovino", sotto2: "Punta di petto" },
  { keywords: ["biancostato"], sotto1: "Bovino", sotto2: "Biancostato" },
  { keywords: ["muscolo", "garetto"], sotto1: "Bovino", sotto2: "Muscolo" },
  { keywords: ["noce manzo", "noce vitello", "noce bovino"], sotto1: "Bovino", sotto2: "Noce" },
  { keywords: ["scamone"], sotto1: "Bovino", sotto2: "Scamone" },
  { keywords: ["copertina manzo"], sotto1: "Bovino", sotto2: "Copertina" },
  { keywords: ["spinacino manzo"], sotto1: "Bovino", sotto2: "Spinacino" },
  { keywords: ["pancia manzo", "pancia vitello"], sotto1: "Bovino", sotto2: "Pancia" },
  { keywords: ["coda manzo", "coda di bue"], sotto1: "Bovino", sotto2: "Coda" },
  { keywords: ["ossobuco", "osso buco"], sotto1: "Bovino", sotto2: "Ossobuco" },
  { keywords: ["macinato manzo", "macinato vitello", "macinato bovino", "carne macinata", "macinato misto"], sotto1: "Bovino", sotto2: "Macinato" },
  { keywords: ["spezzatino manzo", "spezzatino vitello", "bocconcini manzo", "brasato", "stracotto"], sotto1: "Bovino", sotto2: "Spezzatino" },
  { keywords: ["arrosto manzo", "arrosto vitello", "roast beef"], sotto1: "Bovino", sotto2: "Arrosto" },
  { keywords: ["hamburger manzo", "hamburger bovino", "burger manzo", "burger bovino"], sotto1: "Bovino", sotto2: "Hamburger" },
  { keywords: ["carpaccio manzo", "carpaccio vitello", "carpaccio di manzo"], sotto1: "Bovino", sotto2: "Carpaccio" },
  { keywords: ["scaloppine vitello", "scaloppine di vitello", "scaloppina vitello"], sotto1: "Bovino", sotto2: "Scaloppina" },
  { keywords: ["cotoletta vitello", "cotoletta di vitello", "milanese vitello"], sotto1: "Bovino", sotto2: "Cotoletta" },
  { keywords: ["fegato manzo", "fegato vitello", "fegato bovino"], sotto1: "Bovino", sotto2: "Fegato" },
  { keywords: ["cuore manzo", "cuore vitello"], sotto1: "Bovino", sotto2: "Cuore" },
  { keywords: ["rognone manzo", "rognone vitello"], sotto1: "Bovino", sotto2: "Rognone" },
  { keywords: ["cervello vitello", "cervella vitello"], sotto1: "Bovino", sotto2: "Cervello" },
  { keywords: ["lingua manzo", "lingua vitello", "lingua bovino"], sotto1: "Bovino", sotto2: "Lingua" },
  { keywords: ["trippa", "trippa manzo", "trippa vitello"], sotto1: "Bovino", sotto2: "Trippa" },
  { keywords: ["animelle vitello", "animelle"], sotto1: "Bovino", sotto2: "Animelle" },

  // ── MAIALE ─────────────────────────────────────────────────────────────────
  { keywords: ["suino", "maiale", "maialino", "maialino da latte", "maialino sardo", "porchetta"], sotto1: "Maiale", sotto2: "" },
  { keywords: ["lombo maiale", "lombo suino", "lonza maiale", "lonza suina"], sotto1: "Maiale", sotto2: "Lombo" },
  { keywords: ["filetto maiale", "filetto suino", "filetto di maiale"], sotto1: "Maiale", sotto2: "Filetto" },
  { keywords: ["costine maiale", "costine suine", "spare rib", "ribs maiale", "costolette maiale"], sotto1: "Maiale", sotto2: "Costine" },
  { keywords: ["spalla maiale", "spalla suina"], sotto1: "Maiale", sotto2: "Spalla" },
  { keywords: ["coppa maiale", "capocollo", "coppa suina"], sotto1: "Maiale", sotto2: "Coppa" },
  { keywords: ["pancetta fresca", "pancia maiale", "pancia suina"], sotto1: "Maiale", sotto2: "Pancetta" },
  { keywords: ["coscia fresca maiale", "coscia suina fresca"], sotto1: "Maiale", sotto2: "Coscia" },
  { keywords: ["carre maiale", "carre suino"], sotto1: "Maiale", sotto2: "Carré" },
  { keywords: ["sella maiale", "sella suina"], sotto1: "Maiale", sotto2: "Sella" },
  { keywords: ["stinco maiale", "stinco suino"], sotto1: "Maiale", sotto2: "Stinco" },
  { keywords: ["guancia maiale", "guanciale fresco", "guancia suina"], sotto1: "Maiale", sotto2: "Guanciale" },
  { keywords: ["salsiccia fresca", "salsicce fresche", "luganega fresca"], sotto1: "Maiale", sotto2: "Salsiccia" },
  { keywords: ["braciola maiale", "braciole maiale"], sotto1: "Maiale", sotto2: "Braciola" },
  { keywords: ["arista maiale", "arrosto maiale"], sotto1: "Maiale", sotto2: "Arista" },
  { keywords: ["macinato maiale", "macinato suino"], sotto1: "Maiale", sotto2: "Macinato" },
  { keywords: ["lardo fresco"], sotto1: "Maiale", sotto2: "Lardo" },

  // ── POLLO ──────────────────────────────────────────────────────────────────
  { keywords: ["pollo", "galletto", "pollame"], sotto1: "Pollo", sotto2: "" },
  { keywords: ["pollo intero", "pollo a pezzi", "busto pollo", "carcassa pollo"], sotto1: "Pollo", sotto2: "Intero" },
  { keywords: ["petto pollo", "petto di pollo", "filetto pollo", "filetto di pollo"], sotto1: "Pollo", sotto2: "Petto" },
  { keywords: ["coscia pollo", "cosce pollo", "sovracoscia pollo", "fusi pollo", "fuso di pollo", "sovracoscio pollo"], sotto1: "Pollo", sotto2: "Coscia" },
  { keywords: ["ali pollo", "alette pollo", "alucce pollo", "ali di pollo"], sotto1: "Pollo", sotto2: "Ali" },
  { keywords: ["collo pollo"], sotto1: "Pollo", sotto2: "Collo" },
  { keywords: ["macinato pollo", "pollo macinato"], sotto1: "Pollo", sotto2: "Macinato" },
  { keywords: ["fegato pollo", "fegatini pollo", "fegatini di pollo"], sotto1: "Pollo", sotto2: "Fegato" },
  { keywords: ["cuore pollo", "cuori pollo"], sotto1: "Pollo", sotto2: "Cuore" },
  { keywords: ["ventriglio pollo", "ventrigli pollo"], sotto1: "Pollo", sotto2: "Ventriglio" },

  // ── TACCHINO ───────────────────────────────────────────────────────────────
  { keywords: ["tacchino"], sotto1: "Tacchino", sotto2: "" },
  { keywords: ["tacchino intero"], sotto1: "Tacchino", sotto2: "Intero" },
  { keywords: ["petto tacchino", "fesa tacchino", "fesa di tacchino", "petto di tacchino"], sotto1: "Tacchino", sotto2: "Petto" },
  { keywords: ["coscia tacchino", "sovracoscia tacchino"], sotto1: "Tacchino", sotto2: "Coscia" },
  { keywords: ["ali tacchino"], sotto1: "Tacchino", sotto2: "Ali" },
  { keywords: ["macinato tacchino"], sotto1: "Tacchino", sotto2: "Macinato" },

  // ── AGNELLO ────────────────────────────────────────────────────────────────
  { keywords: ["agnello", "abbacchio", "agnellone"], sotto1: "Agnello", sotto2: "" },
  { keywords: ["agnello intero"], sotto1: "Agnello", sotto2: "Intero" },
  { keywords: ["cosciotto agnello", "coscia agnello", "coscia di agnello"], sotto1: "Agnello", sotto2: "Cosciotto" },
  { keywords: ["carre agnello"], sotto1: "Agnello", sotto2: "Carré" },
  { keywords: ["costolette agnello", "costolette di agnello"], sotto1: "Agnello", sotto2: "Costolette" },
  { keywords: ["spalla agnello", "spalla di agnello"], sotto1: "Agnello", sotto2: "Spalla" },
  { keywords: ["collo agnello"], sotto1: "Agnello", sotto2: "Collo" },
  { keywords: ["petto agnello"], sotto1: "Agnello", sotto2: "Petto" },
  { keywords: ["sella agnello"], sotto1: "Agnello", sotto2: "Sella" },
  { keywords: ["filetto agnello"], sotto1: "Agnello", sotto2: "Filetto" },
  { keywords: ["macinato agnello"], sotto1: "Agnello", sotto2: "Macinato" },
  { keywords: ["coratella agnello", "coratella d'agnello"], sotto1: "Agnello", sotto2: "Coratella" },

  // ── ANATRA ─────────────────────────────────────────────────────────────────
  { keywords: ["anatra", "germano reale"], sotto1: "Anatra", sotto2: "" },
  { keywords: ["anatra intera"], sotto1: "Anatra", sotto2: "Intero" },
  { keywords: ["petto anatra", "magret", "magret de canard"], sotto1: "Anatra", sotto2: "Petto" },
  { keywords: ["coscia anatra", "sovracoscia anatra", "confit anatra", "confit de canard"], sotto1: "Anatra", sotto2: "Coscia" },
  { keywords: ["ali anatra"], sotto1: "Anatra", sotto2: "Ali" },
  { keywords: ["fegato anatra", "foie gras"], sotto1: "Anatra", sotto2: "Fegato" },

  // ── CONIGLIO ───────────────────────────────────────────────────────────────
  { keywords: ["coniglio"], sotto1: "Coniglio", sotto2: "" },
  { keywords: ["coniglio intero", "coniglio a pezzi"], sotto1: "Coniglio", sotto2: "Intero" },
  { keywords: ["coscia coniglio", "coscia di coniglio"], sotto1: "Coniglio", sotto2: "Coscia" },
  { keywords: ["sella coniglio", "lombo coniglio"], sotto1: "Coniglio", sotto2: "Sella" },
  { keywords: ["spalla coniglio"], sotto1: "Coniglio", sotto2: "Spalla" },
  { keywords: ["fegato coniglio"], sotto1: "Coniglio", sotto2: "Fegato" },

  // ── SELVAGGINA (lista piatta — sotto2 = Animale + taglio) ─────────────────
  { keywords: ["cinghiale"], sotto1: "Selvaggina", sotto2: "Cinghiale" },
  { keywords: ["cinghiale intero"], sotto1: "Selvaggina", sotto2: "Cinghiale intero" },
  { keywords: ["coscia cinghiale", "coscia di cinghiale"], sotto1: "Selvaggina", sotto2: "Cinghiale - Coscia" },
  { keywords: ["spalla cinghiale"], sotto1: "Selvaggina", sotto2: "Cinghiale - Spalla" },
  { keywords: ["lombo cinghiale", "filetto cinghiale"], sotto1: "Selvaggina", sotto2: "Cinghiale - Filetto" },
  { keywords: ["costine cinghiale"], sotto1: "Selvaggina", sotto2: "Cinghiale - Costine" },
  { keywords: ["polpa cinghiale", "macinato cinghiale", "spezzatino cinghiale"], sotto1: "Selvaggina", sotto2: "Cinghiale - Polpa" },

  { keywords: ["cervo"], sotto1: "Selvaggina", sotto2: "Cervo" },
  { keywords: ["filetto cervo", "filetto di cervo"], sotto1: "Selvaggina", sotto2: "Cervo - Filetto" },
  { keywords: ["controfiletto cervo"], sotto1: "Selvaggina", sotto2: "Cervo - Controfiletto" },
  { keywords: ["coscia cervo", "coscia di cervo"], sotto1: "Selvaggina", sotto2: "Cervo - Coscia" },
  { keywords: ["spalla cervo"], sotto1: "Selvaggina", sotto2: "Cervo - Spalla" },
  { keywords: ["costine cervo"], sotto1: "Selvaggina", sotto2: "Cervo - Costine" },
  { keywords: ["polpa cervo", "macinato cervo", "spezzatino cervo"], sotto1: "Selvaggina", sotto2: "Cervo - Polpa" },

  { keywords: ["capriolo"], sotto1: "Selvaggina", sotto2: "Capriolo" },
  { keywords: ["filetto capriolo", "filetto di capriolo"], sotto1: "Selvaggina", sotto2: "Capriolo - Filetto" },
  { keywords: ["coscia capriolo", "coscia di capriolo"], sotto1: "Selvaggina", sotto2: "Capriolo - Coscia" },
  { keywords: ["sella capriolo"], sotto1: "Selvaggina", sotto2: "Capriolo - Sella" },
  { keywords: ["costine capriolo"], sotto1: "Selvaggina", sotto2: "Capriolo - Costine" },
  { keywords: ["polpa capriolo", "macinato capriolo", "spezzatino capriolo"], sotto1: "Selvaggina", sotto2: "Capriolo - Polpa" },

  { keywords: ["piccione", "piccione intero", "colombaccio"], sotto1: "Selvaggina", sotto2: "Piccione" },
  { keywords: ["quaglia", "quaglie", "quaglia intera"], sotto1: "Selvaggina", sotto2: "Quaglia" },
  { keywords: ["faraona", "faraona intera"], sotto1: "Selvaggina", sotto2: "Faraona" },
]

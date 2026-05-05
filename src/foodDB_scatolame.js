// ─────────────────────────────────────────────────────────────────────────────
// foodDB_scatolame.js — Database SCATOLAME per Ristorai
// cat: "Scatolame" | sotto1: "" | sotto2: ""
// Lista piatta — nessuna sottocategoria
// ─────────────────────────────────────────────────────────────────────────────

export const SCATOLAME_DB = [

  // ── POMODORO E CONSERVE ────────────────────────────────────────────────────
  { keywords: ["pelati", "pomodori pelati", "pelati san marzano", "pelati mutti", "pelati cirio"], sotto1: "", sotto2: "" },
  { keywords: ["passata di pomodoro", "passata pomodoro", "passata mutti", "passata rustica"], sotto1: "", sotto2: "" },
  { keywords: ["polpa di pomodoro", "polpa pomodoro", "pomodori a cubetti", "pomodori tritati"], sotto1: "", sotto2: "" },
  { keywords: ["concentrato di pomodoro", "doppio concentrato", "triplo concentrato"], sotto1: "", sotto2: "" },
  { keywords: ["sugo pronto", "sugo al pomodoro", "sugo alla bolognese", "sugo pronto barattolo"], sotto1: "", sotto2: "" },
  { keywords: ["pomodori secchi", "pomodori secchi sott'olio"], sotto1: "", sotto2: "" },

  // ── LEGUMI IN SCATOLA ──────────────────────────────────────────────────────
  { keywords: ["ceci in scatola", "ceci precotti", "ceci latta"], sotto1: "", sotto2: "" },
  { keywords: ["fagioli in scatola", "fagioli precotti", "fagioli borlotti scatola", "fagioli cannellini scatola"], sotto1: "", sotto2: "" },
  { keywords: ["lenticchie in scatola", "lenticchie precotte"], sotto1: "", sotto2: "" },
  { keywords: ["piselli in scatola", "piselli precotti", "piselli latta"], sotto1: "", sotto2: "" },
  { keywords: ["fave in scatola", "fave precotte"], sotto1: "", sotto2: "" },
  { keywords: ["soia in scatola", "edamame in scatola"], sotto1: "", sotto2: "" },
  { keywords: ["legumi misti scatola", "misto legumi precotti"], sotto1: "", sotto2: "" },

  // ── PESCE IN SCATOLA ───────────────────────────────────────────────────────
  { keywords: ["tonno in scatola", "tonno sott'olio", "tonno al naturale", "tonno rio mare", "tonno nostromo"], sotto1: "", sotto2: "" },
  { keywords: ["sardine in scatola", "sardine sott'olio", "sardine al naturale"], sotto1: "", sotto2: "" },
  { keywords: ["acciughe sott'olio", "acciughe in scatola", "filetti di acciughe"], sotto1: "", sotto2: "" },
  { keywords: ["sgombro in scatola", "sgombro sott'olio", "sgombro al naturale"], sotto1: "", sotto2: "" },
  { keywords: ["salmone in scatola", "salmone al naturale scatola"], sotto1: "", sotto2: "" },
  { keywords: ["polpo in scatola", "polpo precotto scatola"], sotto1: "", sotto2: "" },
  { keywords: ["cozze in scatola", "vongole in scatola", "frutti di mare scatola"], sotto1: "", sotto2: "" },

  // ── PASTA E CEREALI SECCHI ─────────────────────────────────────────────────
  { keywords: ["pasta secca", "spaghetti", "rigatoni", "penne", "fusilli", "farfalle", "tagliatelle secche", "linguine", "bucatini", "mezze penne", "tortiglioni", "sedanini", "conchiglie", "ditali"], sotto1: "", sotto2: "" },
  { keywords: ["pasta integrale", "pasta di farro", "pasta di kamut", "pasta senza glutine"], sotto1: "", sotto2: "" },
  { keywords: ["riso", "riso arborio", "riso carnaroli", "riso vialone nano", "riso basmati", "riso integrale", "riso parboiled", "riso venere"], sotto1: "", sotto2: "" },
  { keywords: ["farro", "orzo perlato", "orzo", "farro perlato", "quinoa", "amaranto", "bulgur", "couscous"], sotto1: "", sotto2: "" },
  { keywords: ["polenta", "farina di mais", "farina bramata"], sotto1: "", sotto2: "" },
  { keywords: ["farina 00", "farina 0", "farina 1", "farina 2", "farina integrale", "farina di grano tenero", "farina di grano duro", "semola di grano duro", "semola rimacinata"], sotto1: "", sotto2: "" },
  { keywords: ["farina di mandorle", "farina di nocciole", "farina di riso", "farina di ceci", "farina di castagne"], sotto1: "", sotto2: "" },
  { keywords: ["amido di mais", "maizena", "amido di frumento", "fecola di patate"], sotto1: "", sotto2: "" },

  // ── ZUCCHERI E DOLCIARIO ───────────────────────────────────────────────────
  { keywords: ["zucchero semolato", "zucchero bianco", "zucchero pacco"], sotto1: "", sotto2: "" },
  { keywords: ["zucchero di canna", "zucchero grezzo", "zucchero di canna grezzo"], sotto1: "", sotto2: "" },
  { keywords: ["zucchero a velo", "zucchero impalpabile", "zucchero velo"], sotto1: "", sotto2: "" },
  { keywords: ["miele", "miele millefiori", "miele di acacia", "miele di castagno", "miele agreste"], sotto1: "", sotto2: "" },
  { keywords: ["sciroppo di glucosio", "sciroppo di mais", "golden syrup", "treacle"], sotto1: "", sotto2: "" },
  { keywords: ["cioccolato fondente", "cioccolato al latte", "cioccolato bianco", "copertura cioccolato", "cioccolato zaini"], sotto1: "", sotto2: "" },
  { keywords: ["cacao amaro", "cacao in polvere", "cacao dolce"], sotto1: "", sotto2: "" },
  { keywords: ["granella di nocciole", "granella di mandorle", "granella di pistacchi", "granella noci"], sotto1: "", sotto2: "" },
  { keywords: ["nocciole sgusciate", "mandorle sgusciate", "noci sgusciate", "pistacchi sgusciati", "pinoli", "anacardi", "arachidi"], sotto1: "", sotto2: "" },
  { keywords: ["marmellata", "confettura", "confettura di albicocche", "marmellata di arance"], sotto1: "", sotto2: "" },
  { keywords: ["uva passa", "uvetta", "frutta candita", "scorze candite"], sotto1: "", sotto2: "" },
  { keywords: ["vaniglia", "bacche di vaniglia", "estratto di vaniglia", "vanillina", "aroma vaniglia"], sotto1: "", sotto2: "" },
  { keywords: ["lievito in polvere", "lievito per dolci", "lievito chimico", "bicarbonato di sodio"], sotto1: "", sotto2: "" },

  // ── CONDIMENTI E SALSE ─────────────────────────────────────────────────────
  { keywords: ["olio extravergine", "olio evo", "olio di oliva", "olio cucinarte", "olio extravergine pet"], sotto1: "", sotto2: "" },
  { keywords: ["olio di semi", "olio di girasole", "olio di arachidi", "olio di mais"], sotto1: "", sotto2: "" },
  { keywords: ["aceto di vino bianco", "aceto di vino rosso", "aceto di mele", "aceto balsamico", "aceto balsam", "glassa balsamica"], sotto1: "", sotto2: "" },
  { keywords: ["maionese", "maionese calve", "maionese hellmann", "maionese classica"], sotto1: "", sotto2: "" },
  { keywords: ["senape", "senape di digione", "senape classica"], sotto1: "", sotto2: "" },
  { keywords: ["ketchup", "salsa ketchup"], sotto1: "", sotto2: "" },
  { keywords: ["salsa di soia", "tamari", "teriyaki"], sotto1: "", sotto2: "" },
  { keywords: ["worcestershire", "salsa worcester"], sotto1: "", sotto2: "" },
  { keywords: ["tabasco", "salsa piccante", "sriracha"], sotto1: "", sotto2: "" },
  { keywords: ["pesto barattolo", "pesto genovese barattolo", "pesto al basilico barattolo"], sotto1: "", sotto2: "" },
  { keywords: ["salsa noci barattolo", "salsa alle noci"], sotto1: "", sotto2: "" },
  { keywords: ["olive sott'olio", "olive in salamoia", "olive verdi", "olive nere", "olive taggiasche", "olive ripiene"], sotto1: "", sotto2: "" },
  { keywords: ["capperi", "capperi sott'aceto", "capperi sotto sale"], sotto1: "", sotto2: "" },
  { keywords: ["cetriolini", "giardiniera", "sottaceti misti", "peperoni sott'aceto"], sotto1: "", sotto2: "" },
  { keywords: ["insalata russa", "insalata russa barattolo"], sotto1: "", sotto2: "" },

  // ── BRODI E BASI ───────────────────────────────────────────────────────────
  { keywords: ["brodo knorr", "brodo granulare", "dado da brodo", "dado vegetale", "dado di carne", "dado di pesce", "brodo in polvere"], sotto1: "", sotto2: "" },
  { keywords: ["fondo bruno", "fondo bruno knorr", "fondo bruno pasta", "fondo di carne"], sotto1: "", sotto2: "" },
  { keywords: ["brodo pronto", "brodo in brick", "brodo di pollo pronto", "brodo vegetale pronto"], sotto1: "", sotto2: "" },

  // ── SPEZIE E AROMI SECCHI ──────────────────────────────────────────────────
  { keywords: ["sale fino", "sale grosso", "sale marino", "sale iodato", "sale rosa himalaya", "salgemma"], sotto1: "", sotto2: "" },
  { keywords: ["pepe nero", "pepe bianco", "pepe macinato", "pepe in grani"], sotto1: "", sotto2: "" },
  { keywords: ["origano secco", "basilico secco", "timo secco", "rosmarino secco", "salvia secca", "alloro"], sotto1: "", sotto2: "" },
  { keywords: ["noce moscata", "cannella", "chiodi di garofano", "cardamomo", "curcuma", "paprika", "curry", "zafferano"], sotto1: "", sotto2: "" },
  { keywords: ["aglio in polvere", "cipolla in polvere", "peperoncino secco", "peperoncino in polvere"], sotto1: "", sotto2: "" },
  { keywords: ["macinato per impanatura", "pangrattato", "pangrattato condito"], sotto1: "", sotto2: "" },

  // ── ALTRO SCATOLAME ────────────────────────────────────────────────────────
  { keywords: ["mais in scatola", "mais dolce scatola"], sotto1: "", sotto2: "" },
  { keywords: ["castagne in scatola", "marroni in barattolo"], sotto1: "", sotto2: "" },
  { keywords: ["tartufo in barattolo", "tartufo scatolame", "salsa al tartufo barattolo", "condimento tartufo"], sotto1: "", sotto2: "" },
  { keywords: ["funghi sott'olio", "funghi in barattolo", "porcini sott'olio", "funghi misti barattolo"], sotto1: "", sotto2: "" },
  { keywords: ["macinato di fette", "fette biscottate", "grissini", "crackers"], sotto1: "", sotto2: "" },
  { keywords: ["gelatina", "colla di pesce", "agar agar"], sotto1: "", sotto2: "" },

  // ── BISCOTTI E PASTICCERIA SECCA ───────────────────────────────────────────
  { keywords: ["savoiardi", "biscotti savoiardi", "pavesini"], sotto1: "", sotto2: "" },
  { keywords: ["amaretti", "amaretti di saronno", "amaretti morbidi", "amaretti secchi"], sotto1: "", sotto2: "" },
  { keywords: ["biscotti secchi", "biscotti al burro", "frollini", "digestive"], sotto1: "", sotto2: "" },
  { keywords: ["wafer", "wafer al cacao", "wafer alla nocciola"], sotto1: "", sotto2: "" },
  { keywords: ["cantucci", "biscotti di prato", "cantuccini"], sotto1: "", sotto2: "" },
  { keywords: ["brutti ma buoni", "ricciarelli"], sotto1: "", sotto2: "" },
  { keywords: ["meringhe", "meringa"], sotto1: "", sotto2: "" },
  { keywords: ["pan di spagna", "base per torta", "pasta biscuit secco"], sotto1: "", sotto2: "" },

  // ── PANE E PRODOTTI DA FORNO SECCHI ───────────────────────────────────────
  { keywords: ["pangrattato", "pane grattugiato", "pan grattato"], sotto1: "", sotto2: "" },
  { keywords: ["fette biscottate", "fette biscottate integrali"], sotto1: "", sotto2: "" },
  { keywords: ["grissini", "grissini torinesi", "grissini integrali"], sotto1: "", sotto2: "" },
  { keywords: ["crackers", "cracker al sesamo", "cracker integrali"], sotto1: "", sotto2: "" },
  { keywords: ["pane carasau", "pane guttiau"], sotto1: "", sotto2: "" },
  { keywords: ["taralli", "tarallini", "taralli pugliesi"], sotto1: "", sotto2: "" },
  { keywords: ["crostini", "crostini di pane", "pane tostato secco"], sotto1: "", sotto2: "" },

  // ── CIALDE E DECORAZIONI ──────────────────────────────────────────────────
  { keywords: ["cialde", "cialda per gelato", "cannoli secchi", "cestino di cialda"], sotto1: "", sotto2: "" },
  { keywords: ["decorazioni zucchero", "codette colorate", "perle di zucchero", "oro alimentare"], sotto1: "", sotto2: "" },
  { keywords: ["colorante alimentare", "coloranti alimentari"], sotto1: "", sotto2: "" },
]

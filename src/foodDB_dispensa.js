// ─────────────────────────────────────────────────────────────────────────────
// foodDB_dispensa.js — Database DISPENSA per Ristorai
// cat: "Dispensa"
// sotto1: Conserve | Condimenti | Secchi | Bevande analcoliche | Bevande alcoliche | Superalcolici | Detersivi
// ─────────────────────────────────────────────────────────────────────────────

export const DISPENSA_DB = [

  // ══════════════════════════════════════════════════════════════════════════
  // CONSERVE
  // ══════════════════════════════════════════════════════════════════════════

  { keywords: ["pelati", "pomodori pelati", "pelati san marzano", "pelati mutti", "pelati cirio"], sotto1: "Conserve", sotto2: "Pomodoro" },
  { keywords: ["passata di pomodoro", "passata pomodoro", "passata mutti", "passata rustica"], sotto1: "Conserve", sotto2: "Pomodoro" },
  { keywords: ["polpa di pomodoro", "polpa pomodoro", "pomodori a cubetti", "pomodori tritati"], sotto1: "Conserve", sotto2: "Pomodoro" },
  { keywords: ["concentrato di pomodoro", "doppio concentrato", "triplo concentrato"], sotto1: "Conserve", sotto2: "Pomodoro" },
  { keywords: ["sugo pronto", "sugo al pomodoro", "sugo alla bolognese", "sugo pronto barattolo"], sotto1: "Conserve", sotto2: "Sughi" },
  { keywords: ["pomodori secchi", "pomodori secchi sott'olio"], sotto1: "Conserve", sotto2: "Pomodoro" },
  { keywords: ["ceci in scatola", "ceci precotti", "ceci latta"], sotto1: "Conserve", sotto2: "Legumi" },
  { keywords: ["fagioli in scatola", "fagioli precotti", "fagioli borlotti scatola", "fagioli cannellini scatola"], sotto1: "Conserve", sotto2: "Legumi" },
  { keywords: ["lenticchie in scatola", "lenticchie precotte"], sotto1: "Conserve", sotto2: "Legumi" },
  { keywords: ["piselli in scatola", "piselli precotti", "piselli latta"], sotto1: "Conserve", sotto2: "Legumi" },
  { keywords: ["legumi misti scatola", "misto legumi precotti"], sotto1: "Conserve", sotto2: "Legumi" },
  { keywords: ["tonno in scatola", "tonno sott'olio", "tonno al naturale", "tonno rio mare", "tonno nostromo"], sotto1: "Conserve", sotto2: "Pesce" },
  { keywords: ["sardine in scatola", "sardine sott'olio"], sotto1: "Conserve", sotto2: "Pesce" },
  { keywords: ["acciughe sott'olio", "acciughe in scatola", "filetti di acciughe"], sotto1: "Conserve", sotto2: "Pesce" },
  { keywords: ["sgombro in scatola", "sgombro sott'olio"], sotto1: "Conserve", sotto2: "Pesce" },
  { keywords: ["salmone in scatola", "salmone al naturale scatola"], sotto1: "Conserve", sotto2: "Pesce" },
  { keywords: ["polpo in scatola", "polpo precotto scatola"], sotto1: "Conserve", sotto2: "Pesce" },
  { keywords: ["cozze in scatola", "vongole in scatola", "frutti di mare scatola"], sotto1: "Conserve", sotto2: "Pesce" },
  { keywords: ["mais in scatola", "mais dolce scatola"], sotto1: "Conserve", sotto2: "Altro" },
  { keywords: ["castagne in scatola", "marroni in barattolo"], sotto1: "Conserve", sotto2: "Altro" },
  { keywords: ["tartufo in barattolo", "salsa al tartufo barattolo", "condimento tartufo"], sotto1: "Conserve", sotto2: "Altro" },
  { keywords: ["funghi sott'olio", "funghi in barattolo", "porcini sott'olio", "funghi misti barattolo"], sotto1: "Conserve", sotto2: "Altro" },
  { keywords: ["marmellata", "confettura", "confettura di albicocche", "marmellata di arance"], sotto1: "Conserve", sotto2: "Dolci" },
  { keywords: ["cioccolato fondente", "cioccolato al latte", "cioccolato bianco", "copertura cioccolato"], sotto1: "Conserve", sotto2: "Dolci" },

  // ══════════════════════════════════════════════════════════════════════════
  // CONDIMENTI
  // ══════════════════════════════════════════════════════════════════════════

  { keywords: ["olio extravergine", "olio evo", "olio di oliva", "olio cucinarte", "olio extravergine pet"], sotto1: "Condimenti", sotto2: "Olio" },
  { keywords: ["olio di semi", "olio di girasole", "olio di arachidi", "olio di mais"], sotto1: "Condimenti", sotto2: "Olio" },
  { keywords: ["aceto di vino bianco", "aceto di vino rosso", "aceto di mele", "aceto balsamico", "glassa balsamica"], sotto1: "Condimenti", sotto2: "Aceto" },
  { keywords: ["maionese", "maionese calve", "maionese hellmann", "maionese classica"], sotto1: "Condimenti", sotto2: "Salse" },
  { keywords: ["senape", "senape di digione", "senape classica"], sotto1: "Condimenti", sotto2: "Salse" },
  { keywords: ["ketchup", "salsa ketchup"], sotto1: "Condimenti", sotto2: "Salse" },
  { keywords: ["salsa di soia", "tamari", "teriyaki"], sotto1: "Condimenti", sotto2: "Salse" },
  { keywords: ["worcestershire", "salsa worcester"], sotto1: "Condimenti", sotto2: "Salse" },
  { keywords: ["tabasco", "salsa piccante", "sriracha"], sotto1: "Condimenti", sotto2: "Salse" },
  { keywords: ["pesto barattolo", "pesto genovese barattolo", "pesto al basilico barattolo"], sotto1: "Condimenti", sotto2: "Salse" },
  { keywords: ["olive sott'olio", "olive in salamoia", "olive verdi", "olive nere", "olive taggiasche"], sotto1: "Condimenti", sotto2: "Conserve Vegetali" },
  { keywords: ["capperi", "capperi sott'aceto", "capperi sotto sale"], sotto1: "Condimenti", sotto2: "Conserve Vegetali" },
  { keywords: ["cetriolini", "giardiniera", "sottaceti misti", "peperoni sott'aceto"], sotto1: "Condimenti", sotto2: "Conserve Vegetali" },
  { keywords: ["sale fino", "sale grosso", "sale marino", "sale iodato", "sale rosa himalaya"], sotto1: "Condimenti", sotto2: "Sale e Spezie" },
  { keywords: ["pepe nero", "pepe bianco", "pepe macinato", "pepe in grani"], sotto1: "Condimenti", sotto2: "Sale e Spezie" },
  { keywords: ["noce moscata", "cannella", "chiodi di garofano", "cardamomo", "curcuma", "paprika", "curry", "zafferano"], sotto1: "Condimenti", sotto2: "Sale e Spezie" },
  { keywords: ["origano secco", "basilico secco", "timo secco", "rosmarino secco", "salvia secca", "alloro"], sotto1: "Condimenti", sotto2: "Sale e Spezie" },
  { keywords: ["aglio in polvere", "cipolla in polvere", "peperoncino secco", "peperoncino in polvere"], sotto1: "Condimenti", sotto2: "Sale e Spezie" },
  { keywords: ["miele", "miele millefiori", "miele di acacia", "miele di castagno", "miele agreste"], sotto1: "Condimenti", sotto2: "Dolcificanti" },
  { keywords: ["sciroppo di glucosio", "golden syrup"], sotto1: "Condimenti", sotto2: "Dolcificanti" },

  // ══════════════════════════════════════════════════════════════════════════
  // SECCHI
  // ══════════════════════════════════════════════════════════════════════════

  { keywords: ["pasta secca", "spaghetti", "rigatoni", "penne", "fusilli", "farfalle", "linguine", "bucatini", "mezze penne", "tortiglioni", "sedanini", "conchiglie", "ditali"], sotto1: "Secchi", sotto2: "Pasta" },
  { keywords: ["pasta integrale", "pasta di farro", "pasta di kamut", "pasta senza glutine"], sotto1: "Secchi", sotto2: "Pasta" },
  { keywords: ["riso", "riso arborio", "riso carnaroli", "riso vialone nano", "riso basmati", "riso integrale", "riso parboiled", "riso venere"], sotto1: "Secchi", sotto2: "Riso" },
  { keywords: ["farro", "orzo perlato", "orzo", "quinoa", "amaranto", "bulgur", "couscous"], sotto1: "Secchi", sotto2: "Cereali" },
  { keywords: ["polenta", "farina di mais", "farina bramata"], sotto1: "Secchi", sotto2: "Farine" },
  { keywords: ["farina 00", "farina 0", "farina 1", "farina 2", "farina integrale", "farina di grano tenero", "semola di grano duro", "semola rimacinata"], sotto1: "Secchi", sotto2: "Farine" },
  { keywords: ["farina di mandorle", "farina di nocciole", "farina di riso", "farina di ceci", "farina di castagne"], sotto1: "Secchi", sotto2: "Farine" },
  { keywords: ["amido di mais", "maizena", "amido di frumento", "fecola di patate"], sotto1: "Secchi", sotto2: "Farine" },
  { keywords: ["zucchero semolato", "zucchero bianco", "zucchero pacco"], sotto1: "Secchi", sotto2: "Zucchero" },
  { keywords: ["zucchero di canna", "zucchero grezzo", "zucchero di canna grezzo"], sotto1: "Secchi", sotto2: "Zucchero" },
  { keywords: ["zucchero a velo", "zucchero impalpabile", "zucchero velo"], sotto1: "Secchi", sotto2: "Zucchero" },
  { keywords: ["brodo knorr", "brodo granulare", "dado da brodo", "dado vegetale", "dado di carne", "dado di pesce"], sotto1: "Secchi", sotto2: "Brodi e Basi" },
  { keywords: ["fondo bruno", "fondo di carne"], sotto1: "Secchi", sotto2: "Brodi e Basi" },
  { keywords: ["brodo pronto", "brodo in brick", "brodo di pollo pronto", "brodo vegetale pronto"], sotto1: "Secchi", sotto2: "Brodi e Basi" },
  { keywords: ["cacao amaro", "cacao in polvere"], sotto1: "Secchi", sotto2: "Dolci" },
  { keywords: ["granella di nocciole", "granella di mandorle", "granella di pistacchi", "granella noci"], sotto1: "Secchi", sotto2: "Dolci" },
  { keywords: ["nocciole sgusciate", "mandorle sgusciate", "noci sgusciate", "pistacchi sgusciati", "pinoli", "anacardi", "arachidi"], sotto1: "Secchi", sotto2: "Frutta Secca" },
  { keywords: ["vaniglia", "bacche di vaniglia", "estratto di vaniglia", "vanillina"], sotto1: "Secchi", sotto2: "Dolci" },
  { keywords: ["lievito in polvere", "lievito per dolci", "lievito chimico", "bicarbonato di sodio"], sotto1: "Secchi", sotto2: "Dolci" },
  { keywords: ["savoiardi", "biscotti savoiardi", "pavesini"], sotto1: "Secchi", sotto2: "Biscotti" },
  { keywords: ["amaretti", "amaretti di saronno", "amaretti morbidi"], sotto1: "Secchi", sotto2: "Biscotti" },
  { keywords: ["pangrattato", "pane grattugiato", "pan grattato"], sotto1: "Secchi", sotto2: "Pane" },
  { keywords: ["fette biscottate", "grissini", "crackers", "taralli", "tarallini"], sotto1: "Secchi", sotto2: "Pane" },
  { keywords: ["gelatina", "colla di pesce", "agar agar"], sotto1: "Secchi", sotto2: "Dolci" },
  { keywords: ["uva passa", "uvetta", "frutta candita", "scorze candite"], sotto1: "Secchi", sotto2: "Dolci" },

  // ══════════════════════════════════════════════════════════════════════════
  // BEVANDE ANALCOLICHE
  // ══════════════════════════════════════════════════════════════════════════

  { keywords: ["acqua minerale", "acqua naturale", "acqua frizzante", "acqua liscia", "acqua bottiglia", "acqua san pellegrino", "acqua ferrarelle", "acqua panna", "acqua levissima"], sotto1: "Bevande analcoliche", sotto2: "Acqua" },
  { keywords: ["acqua tonica", "tonica", "schweppes tonica", "fever tree tonica"], sotto1: "Bevande analcoliche", sotto2: "Tonica" },
  { keywords: ["ginger ale", "ginger beer", "schweppes ginger", "fever tree ginger"], sotto1: "Bevande analcoliche", sotto2: "Ginger" },
  { keywords: ["coca cola", "coca-cola", "coca cola zero", "coca cola light", "coca cola sleek"], sotto1: "Bevande analcoliche", sotto2: "Cola" },
  { keywords: ["fanta", "fanta arancia", "fanta lattina", "fanta sleek"], sotto1: "Bevande analcoliche", sotto2: "Bibite" },
  { keywords: ["sprite", "sprite lattina"], sotto1: "Bevande analcoliche", sotto2: "Bibite" },
  { keywords: ["pepsi", "pepsi cola", "pepsi max"], sotto1: "Bevande analcoliche", sotto2: "Cola" },
  { keywords: ["aranciata", "aranciata san pellegrino", "chinotto"], sotto1: "Bevande analcoliche", sotto2: "Bibite" },
  { keywords: ["limonata", "limonata san pellegrino", "cedrata"], sotto1: "Bevande analcoliche", sotto2: "Bibite" },
  { keywords: ["red bull", "red bull energy"], sotto1: "Bevande analcoliche", sotto2: "Energy Drink" },
  { keywords: ["monster energy", "rockstar", "energy drink"], sotto1: "Bevande analcoliche", sotto2: "Energy Drink" },
  { keywords: ["lipton ice tea", "the freddo", "fuzetea", "nestea"], sotto1: "Bevande analcoliche", sotto2: "Tè Freddo" },
  { keywords: ["succo di frutta", "succo arancia", "succo pesca", "succo ace", "succo mela", "yoga succo", "skipper succo"], sotto1: "Bevande analcoliche", sotto2: "Succhi" },
  { keywords: ["sciroppo di menta", "sciroppo grenadine", "sciroppo monin", "sciroppo amarena"], sotto1: "Bevande analcoliche", sotto2: "Sciroppi" },
  { keywords: ["succo yuzu", "yuzu"], sotto1: "Bevande analcoliche", sotto2: "Succhi" },

  // ══════════════════════════════════════════════════════════════════════════
  // BEVANDE ALCOLICHE
  // ══════════════════════════════════════════════════════════════════════════

  { keywords: ["birra menabrea", "birra moretti", "birra peroni", "nastro azzurro", "birra heineken", "birra corona", "birra beck"], sotto1: "Bevande alcoliche", sotto2: "Birra" },
  { keywords: ["birra artigianale", "birra ipa", "birra ale", "birra weiss", "birra lager", "birra radler", "birra doppio malto"], sotto1: "Bevande alcoliche", sotto2: "Birra" },
  { keywords: ["birra analcolica", "birra senza alcol"], sotto1: "Bevande alcoliche", sotto2: "Birra" },
  { keywords: ["aperol", "campari", "aperitivo veneziano", "cynar"], sotto1: "Bevande alcoliche", sotto2: "Aperitivi" },
  { keywords: ["martini bianco", "martini rosso", "martini extra dry", "vermouth"], sotto1: "Bevande alcoliche", sotto2: "Vermouth" },
  { keywords: ["prosecco sfuso", "vino sfuso"], sotto1: "Bevande alcoliche", sotto2: "Vino Sfuso" },

  // ══════════════════════════════════════════════════════════════════════════
  // SUPERALCOLICI
  // ══════════════════════════════════════════════════════════════════════════

  { keywords: ["gin", "gin hendricks", "gin bombay", "gin tanqueray", "gin gordon", "gin beefeater", "gin malfy"], sotto1: "Superalcolici", sotto2: "Gin" },
  { keywords: ["vodka", "vodka absolut", "vodka grey goose", "vodka smirnoff", "vodka ketel one"], sotto1: "Superalcolici", sotto2: "Vodka" },
  { keywords: ["rum", "rum bacardi", "rum havana", "rum diplomatico", "rum appleton"], sotto1: "Superalcolici", sotto2: "Rum" },
  { keywords: ["whisky", "whiskey", "scotch whisky", "bourbon", "jack daniels", "jameson", "johnnie walker", "glenfiddich"], sotto1: "Superalcolici", sotto2: "Whisky" },
  { keywords: ["tequila", "tequila patron", "mezcal"], sotto1: "Superalcolici", sotto2: "Tequila" },
  { keywords: ["brandy", "cognac", "hennessy", "remy martin", "calvados", "armagnac"], sotto1: "Superalcolici", sotto2: "Cognac" },
  { keywords: ["grappa", "grappa di barolo", "grappa di moscato", "acquavite"], sotto1: "Superalcolici", sotto2: "Grappa" },
  { keywords: ["limoncello", "limoncello di sorrento"], sotto1: "Superalcolici", sotto2: "Liquori" },
  { keywords: ["sambuca", "amaretto disaronno", "disaronno", "baileys", "cointreau", "maraschino", "kahlua"], sotto1: "Superalcolici", sotto2: "Liquori" },
  { keywords: ["amaro montenegro", "fernet branca", "averna", "ramazzotti", "jagermeister", "amaro del capo"], sotto1: "Superalcolici", sotto2: "Amari" },
  { keywords: ["mirto", "nocino", "liquore alla noce"], sotto1: "Superalcolici", sotto2: "Liquori" },

  // ══════════════════════════════════════════════════════════════════════════
  // DETERSIVI
  // ══════════════════════════════════════════════════════════════════════════

  { keywords: ["detersivo lavastoviglie", "detergente lavastoviglie", "piatti concentrato", "detersivo piatti"], sotto1: "Detersivi", sotto2: "Lavastoviglie" },
  { keywords: ["brillantante lavastoviglie", "brillantante"], sotto1: "Detersivi", sotto2: "Lavastoviglie" },
  { keywords: ["sale per lavastoviglie", "sale rigenerante"], sotto1: "Detersivi", sotto2: "Lavastoviglie" },
  { keywords: ["tabs lavastoviglie", "pastiglie lavastoviglie", "capsule lavastoviglie"], sotto1: "Detersivi", sotto2: "Lavastoviglie" },
  { keywords: ["sgrassatore", "sgrassatore professionale", "sgrassatore cucina", "multiuso prof"], sotto1: "Detersivi", sotto2: "Pulizia" },
  { keywords: ["detergente multiuso", "spray multiuso", "detergente superfici", "detergente cucina"], sotto1: "Detersivi", sotto2: "Pulizia" },
  { keywords: ["detersivo pavimenti", "detergente pavimenti", "piastrelle e pavimenti"], sotto1: "Detersivi", sotto2: "Pulizia" },
  { keywords: ["wc gel", "gel wc", "disincrostante wc", "disincrostante"], sotto1: "Detersivi", sotto2: "Bagno" },
  { keywords: ["candeggina", "varechina", "ipoclorito di sodio"], sotto1: "Detersivi", sotto2: "Igiene" },
  { keywords: ["disinfettante", "igienizzante", "alcool denaturato"], sotto1: "Detersivi", sotto2: "Igiene" },
  { keywords: ["sapone mani", "detergente mani", "sapone liquido", "gel mani"], sotto1: "Detersivi", sotto2: "Igiene" },
  { keywords: ["carta igienica", "rotoli carta"], sotto1: "Detersivi", sotto2: "Consumabili" },
  { keywords: ["bobina", "carta cucina", "rotolo cucina", "bobina everyday"], sotto1: "Detersivi", sotto2: "Consumabili" },
  { keywords: ["tovaglioli carta", "tovaglioli di carta"], sotto1: "Detersivi", sotto2: "Consumabili" },
  { keywords: ["rotolo alluminio", "carta stagnola", "pellicola trasparente", "carta forno"], sotto1: "Detersivi", sotto2: "Consumabili" },
  { keywords: ["sacchi neri", "sacchi spazzatura", "sacchi immondizia", "sacchi 90l", "sacchi 70l"], sotto1: "Detersivi", sotto2: "Consumabili" },
  { keywords: ["guanti nitrile", "guanti nitrile neri", "guanti nitrile monouso"], sotto1: "Detersivi", sotto2: "Consumabili" },
  { keywords: ["guanti lattice", "guanti vinile", "guanti monouso"], sotto1: "Detersivi", sotto2: "Consumabili" },
  { keywords: ["spugna abrasiva", "scotch brite", "paglietta acciaio"], sotto1: "Detersivi", sotto2: "Pulizia" },
  { keywords: ["strofinaccio", "panno microfibra", "panni multiuso"], sotto1: "Detersivi", sotto2: "Pulizia" },
  { keywords: ["buste sottovuoto", "sacchi sottovuoto", "contenitori gn", "vaschette alluminio"], sotto1: "Detersivi", sotto2: "Consumabili" },
]

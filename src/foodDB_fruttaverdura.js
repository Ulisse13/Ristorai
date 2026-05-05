// ─────────────────────────────────────────────────────────────────────────────
// foodDB_fruttaverdura.js — Database FRUTTA E VERDURA per Ristorai
// sotto1: "Frutta" o "Verdura" | sotto2: ""
// ─────────────────────────────────────────────────────────────────────────────

export const FRUTTAVERDURA_DB = [

  // ══════════════════════════════════════════════════════════════════════════
  // FRUTTA
  // ══════════════════════════════════════════════════════════════════════════

  // Agrumi
  { keywords: ["arancia", "arance", "arancia rossa", "arancia navel", "arancia tarocco", "arancia moro", "arancia sanguinella"], sotto1: "Frutta", sotto2: "" },
  { keywords: ["limone", "limoni", "limone di amalfi", "limone di sorrento", "limone sfusato", "limone verdello"], sotto1: "Frutta", sotto2: "" },
  { keywords: ["mandarino", "mandarini", "clementina", "clementine", "mandarancio", "tangerina"], sotto1: "Frutta", sotto2: "" },
  { keywords: ["pompelmo", "pompelmi", "grapefruit"], sotto1: "Frutta", sotto2: "" },
  { keywords: ["cedro", "bergamotto", "kumquat", "chinotto", "lime", "limette"], sotto1: "Frutta", sotto2: "" },

  // Mele e pere
  { keywords: ["mela", "mele", "mela golden", "mela fuji", "mela granny smith", "mela gala", "mela renetta", "mela pink lady", "mela royal gala", "mela annurca"], sotto1: "Frutta", sotto2: "" },
  { keywords: ["pera", "pere", "pera williams", "pera conference", "pera kaiser", "pera abate", "pera coscia", "pera decana"], sotto1: "Frutta", sotto2: "" },
  { keywords: ["cotogna", "cotogne", "mela cotogna"], sotto1: "Frutta", sotto2: "" },

  // Pesche e albicocche
  { keywords: ["pesca", "pesche", "pesca gialla", "pesca bianca", "pesca noce", "nettarina", "pesca saturnina", "percoca"], sotto1: "Frutta", sotto2: "" },
  { keywords: ["albicocca", "albicocche", "albicocca del vesuvio"], sotto1: "Frutta", sotto2: "" },
  { keywords: ["ciliegia", "ciliegie", "ciliegia ferrovia", "ciliegia marasca", "amarena"], sotto1: "Frutta", sotto2: "" },
  { keywords: ["susina", "susine", "prugna", "prugne", "susina stanley", "mirabella"], sotto1: "Frutta", sotto2: "" },

  // Uva
  { keywords: ["uva", "uva bianca", "uva nera", "uva rossa", "uva fragola", "uva moscato", "uva italia", "uva sultana", "uva da tavola"], sotto1: "Frutta", sotto2: "" },

  // Frutti estivi
  { keywords: ["cocomero", "anguria", "angurie", "cocomeri"], sotto1: "Frutta", sotto2: "" },
  { keywords: ["melone", "meloni", "melone cantalupo", "melone retato", "melone invernale", "melone giallo"], sotto1: "Frutta", sotto2: "" },
  { keywords: ["fragola", "fragole", "fragolina di bosco"], sotto1: "Frutta", sotto2: "" },
  { keywords: ["lampone", "lamponi"], sotto1: "Frutta", sotto2: "" },
  { keywords: ["mirtillo", "mirtilli", "mirtillo nero", "mirtillo rosso", "blueberry"], sotto1: "Frutta", sotto2: "" },
  { keywords: ["mora", "more", "mora di rovo", "blackberry"], sotto1: "Frutta", sotto2: "" },
  { keywords: ["ribes", "ribes rosso", "ribes nero", "ribes bianco", "groselha"], sotto1: "Frutta", sotto2: "" },
  { keywords: ["fico", "fichi", "fico d'india", "fichi d'india"], sotto1: "Frutta", sotto2: "" },

  // Frutta esotica e tropicale
  { keywords: ["banana", "banane", "banana cavendish", "banana nana"], sotto1: "Frutta", sotto2: "" },
  { keywords: ["ananas", "ananas fresh", "ananas baby"], sotto1: "Frutta", sotto2: "" },
  { keywords: ["mango", "manghi", "mango kent", "mango ataulfo"], sotto1: "Frutta", sotto2: "" },
  { keywords: ["papaia", "papaya"], sotto1: "Frutta", sotto2: "" },
  { keywords: ["kiwi", "kiwi verde", "kiwi giallo", "kiwi gold"], sotto1: "Frutta", sotto2: "" },
  { keywords: ["avocado", "avocado hass", "avocado fuerte"], sotto1: "Frutta", sotto2: "" },
  { keywords: ["litchi", "lychee", "lichee"], sotto1: "Frutta", sotto2: "" },
  { keywords: ["maracuja", "frutto della passione", "passion fruit"], sotto1: "Frutta", sotto2: "" },
  { keywords: ["melograno", "melograni", "granada"], sotto1: "Frutta", sotto2: "" },
  { keywords: ["cocco", "noce di cocco", "latte di cocco fresco"], sotto1: "Frutta", sotto2: "" },
  { keywords: ["guava", "carambola", "star fruit", "rambutan", "mangostano", "durian"], sotto1: "Frutta", sotto2: "" },
  { keywords: ["dattero fresco", "datteri freschi", "fico secco", "uva passa", "frutta secca"], sotto1: "Frutta", sotto2: "" },
  { keywords: ["physalis", "alchechengi", "cape gooseberry"], sotto1: "Frutta", sotto2: "" },

  // Castagne fresche (stagionali — le secche vanno in Scatolame)
  { keywords: ["castagna fresca", "castagne fresche", "marrone fresco", "marroni freschi"], sotto1: "Frutta", sotto2: "" },

  // ══════════════════════════════════════════════════════════════════════════
  // VERDURA
  // ══════════════════════════════════════════════════════════════════════════

  // Pomodori
  { keywords: ["pomodoro", "pomodori", "pomodoro san marzano", "pomodoro ciliegino", "pomodoro cherry", "pomodoro datterino", "pomodoro cuore di bue", "pomodoro costoluto", "pomodoro pachino", "pomodoro piccadilly", "pomodorino"], sotto1: "Verdura", sotto2: "" },

  // Insalate e foglie
  { keywords: ["insalata", "lattuga", "lattuga iceberg", "lattuga romana", "lattuga gentile", "lattuga canasta"], sotto1: "Verdura", sotto2: "" },
  { keywords: ["radicchio", "radicchio rosso", "radicchio di treviso", "radicchio di chioggia", "radicchio variegato"], sotto1: "Verdura", sotto2: "" },
  { keywords: ["rucola", "rucola selvatica", "rucola coltivata"], sotto1: "Verdura", sotto2: "" },
  { keywords: ["spinaci", "spinacio", "spinaci baby"], sotto1: "Verdura", sotto2: "" },
  { keywords: ["bietola", "bietole", "bietola da coste", "bietola da foglia", "coste"], sotto1: "Verdura", sotto2: "" },
  { keywords: ["cicoria", "cicoria catalogna", "cicoria puntarelle", "puntarelle"], sotto1: "Verdura", sotto2: "" },
  { keywords: ["indivia", "indivia belga", "indivia riccia", "scarola"], sotto1: "Verdura", sotto2: "" },
  { keywords: ["cavolo cappuccio", "cavolo bianco", "cavolo rosso", "cavolo verde", "cappuccio"], sotto1: "Verdura", sotto2: "" },
  { keywords: ["cavolo nero", "cavolo toscano"], sotto1: "Verdura", sotto2: "" },
  { keywords: ["verza", "cavolo verza", "savoy"], sotto1: "Verdura", sotto2: "" },
  { keywords: ["pak choi", "pak choy", "bok choy"], sotto1: "Verdura", sotto2: "" },
  { keywords: ["catalogna", "catalogna frastagliata"], sotto1: "Verdura", sotto2: "" },
  { keywords: ["valerianella", "songino", "soncino"], sotto1: "Verdura", sotto2: "" },
  { keywords: ["basilico", "basilico genovese", "basilico napoletano"], sotto1: "Verdura", sotto2: "" },
  { keywords: ["prezzemolo", "prezzemolo riccio", "prezzemolo piatto"], sotto1: "Verdura", sotto2: "" },
  { keywords: ["menta", "menta piperita", "menta romana"], sotto1: "Verdura", sotto2: "" },
  { keywords: ["salvia", "rosmarino", "timo", "origano fresco", "maggiorana"], sotto1: "Verdura", sotto2: "" },
  { keywords: ["erba cipollina", "erbe aromatiche", "erbe miste"], sotto1: "Verdura", sotto2: "" },

  // Crucifere
  { keywords: ["broccolo", "broccoli", "broccoletto", "broccolo romanesco", "cime di rapa"], sotto1: "Verdura", sotto2: "" },
  { keywords: ["cavolfiore", "cavolfiori", "cavolfiore bianco", "cavolfiore viola", "cavolfiore romanesco"], sotto1: "Verdura", sotto2: "" },
  { keywords: ["cavoletto di bruxelles", "cavoletti di bruxelles"], sotto1: "Verdura", sotto2: "" },
  { keywords: ["kohlrabi", "cavolo rapa"], sotto1: "Verdura", sotto2: "" },

  // Zucchine e melanzane
  { keywords: ["zucchina", "zucchine", "zucchino", "zucchina verde", "zucchina gialla", "zucchina romana", "zucchina tonda"], sotto1: "Verdura", sotto2: "" },
  { keywords: ["fiore di zucca", "fiori di zucca", "fiori di zucchina"], sotto1: "Verdura", sotto2: "" },
  { keywords: ["melanzana", "melanzane", "melanzana tonda", "melanzana lunga", "melanzana striata"], sotto1: "Verdura", sotto2: "" },

  // Peperoni e peperoncini
  { keywords: ["peperone", "peperoni", "peperone rosso", "peperone giallo", "peperone verde", "peperone friggitello"], sotto1: "Verdura", sotto2: "" },
  { keywords: ["peperoncino", "peperoncini", "peperoncino piccante", "peperoncino dolce", "friggitelli"], sotto1: "Verdura", sotto2: "" },

  // Cipolle e affini
  { keywords: ["cipolla", "cipolle", "cipolla bianca", "cipolla rossa", "cipolla dorata", "cipolla borettana", "cipollotto", "scalogno"], sotto1: "Verdura", sotto2: "" },
  { keywords: ["aglio", "aglio bianco", "aglio rosa", "aglio nero", "aglio di sulmona"], sotto1: "Verdura", sotto2: "" },
  { keywords: ["porro", "porri", "porro gigante"], sotto1: "Verdura", sotto2: "" },

  // Tuberi e radici
  { keywords: ["patata", "patate", "patata novella", "patata rossa", "patata gialla", "patata viola", "patata dolce", "batata"], sotto1: "Verdura", sotto2: "" },
  { keywords: ["carota", "carote", "carota novella", "carota arancio", "carota viola", "carota gialla"], sotto1: "Verdura", sotto2: "" },
  { keywords: ["rapa", "rape", "rapa bianca", "rapa rossa", "barbabietola", "barbabietole"], sotto1: "Verdura", sotto2: "" },
  { keywords: ["sedano rapa", "sedano di verona", "celeriac"], sotto1: "Verdura", sotto2: "" },
  { keywords: ["pastinaca", "topinambur", "scorzonera", "radice di prezzemolo"], sotto1: "Verdura", sotto2: "" },
  { keywords: ["zenzero fresco", "curcuma fresca"], sotto1: "Verdura", sotto2: "" },
  { keywords: ["daikon", "ravanello", "ravanelli", "ravanello rosso", "ravanello bianco"], sotto1: "Verdura", sotto2: "" },

  // Sedano e finocchio
  { keywords: ["sedano", "sedano verde", "sedano bianco"], sotto1: "Verdura", sotto2: "" },
  { keywords: ["finocchio", "finocchi", "finocchio selvatico"], sotto1: "Verdura", sotto2: "" },

  // Asparagi
  { keywords: ["asparago", "asparagi", "asparago verde", "asparago bianco", "asparago viola", "asparago selvatico"], sotto1: "Verdura", sotto2: "" },

  // Carciofi
  { keywords: ["carciofo", "carciofi", "carciofo romanesco", "carciofo spinoso", "carciofo violetto", "carciofo sardo"], sotto1: "Verdura", sotto2: "" },

  // Legumi freschi
  { keywords: ["piselli freschi", "pisello fresco", "piselli sgranati"], sotto1: "Verdura", sotto2: "" },
  { keywords: ["fagiolino", "fagiolini", "fagiolo verde", "fagioli verdi", "cornetto", "cornetti"], sotto1: "Verdura", sotto2: "" },
  { keywords: ["fava fresca", "fave fresche", "fave sgranate"], sotto1: "Verdura", sotto2: "" },
  { keywords: ["edamame", "soia fresca"], sotto1: "Verdura", sotto2: "" },

  // Funghi
  { keywords: ["fungo", "funghi", "funghi misti", "fungo champignon", "champignon", "funghi porcini freschi", "porcino fresco", "finferlo", "finferli", "cantarello", "gallinaccio"], sotto1: "Verdura", sotto2: "" },
  { keywords: ["fungo shiitake", "shiitake", "pleurotus", "fungo ostrica", "pioppino", "pioppini", "chiodino", "chiodini"], sotto1: "Verdura", sotto2: "" },
  { keywords: ["tartufo fresco", "tartufo nero", "tartufo bianco", "scorzone"], sotto1: "Verdura", sotto2: "" },

  // Zucca
  { keywords: ["zucca", "zucca butternut", "zucca delica", "zucca mantovana", "zucca hokkaido", "zucca violina"], sotto1: "Verdura", sotto2: "" },

  // Mais
  { keywords: ["mais fresco", "granturco fresco", "spiga di mais"], sotto1: "Verdura", sotto2: "" },

  // Cetrioli
  { keywords: ["cetriolo", "cetrioli", "cetriolo mini", "cetriolo giapponese"], sotto1: "Verdura", sotto2: "" },

  // Olive fresche
  { keywords: ["oliva fresca", "olive fresche", "olive verdi fresche", "olive nere fresche"], sotto1: "Verdura", sotto2: "" },

  // Germogli e misticanze
  { keywords: ["germogli", "germogli di soia", "germogli di ravanello", "microgreens", "misticanza", "mix insalate", "insalatina"], sotto1: "Verdura", sotto2: "" },

  // Altro
  { keywords: ["mais dolce", "granoturco", "cima di rapa"], sotto1: "Verdura", sotto2: "" },
  { keywords: ["rafano", "wasabi fresco", "cappero fresco"], sotto1: "Verdura", sotto2: "" },
]

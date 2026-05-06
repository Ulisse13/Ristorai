// ─────────────────────────────────────────────────────────────────────────────
// foodDB_freschi.js — Database FRESCHI per Ristorai
// cat: "Freschi"
// sotto1: "Formaggi Nobili" | "Latticini" | "Salumi" | "Altri Freschi"
// sotto2: prodotto specifico
// ─────────────────────────────────────────────────────────────────────────────

export const FRESCHI_DB = [

  // ══════════════════════════════════════════════════════════════════════════
  // FORMAGGI NOBILI
  // ══════════════════════════════════════════════════════════════════════════

  { keywords: ["castelmagno", "castelmagno dop"], sotto1: "Formaggi Nobili", sotto2: "Castelmagno" },
  { keywords: ["gorgonzola", "gorgonzola dolce", "gorgonzola piccante", "gorgonzola dop"], sotto1: "Formaggi Nobili", sotto2: "Gorgonzola" },
  { keywords: ["fontina", "fontina dop", "fontina valdostana"], sotto1: "Formaggi Nobili", sotto2: "Fontina" },
  { keywords: ["fontal", "fontal dolce"], sotto1: "Formaggi Nobili", sotto2: "Fontal" },
  { keywords: ["toma", "toma piemontese", "toma dop", "toma di lanzo", "toma ossolana", "tomino"], sotto1: "Formaggi Nobili", sotto2: "Toma" },
  { keywords: ["pecorino romano", "pecorino sardo", "pecorino toscano", "pecorino siciliano", "pecorino di fossa", "pecorino stagionato"], sotto1: "Formaggi Nobili", sotto2: "Pecorino" },
  { keywords: ["caciocavallo", "caciocavallo silano", "caciocavallo podolico", "caciocavallo affumicato"], sotto1: "Formaggi Nobili", sotto2: "Caciocavallo" },
  { keywords: ["brie", "brie de meaux", "brie de melun"], sotto1: "Formaggi Nobili", sotto2: "Brie" },
  { keywords: ["camembert", "camembert de normandie"], sotto1: "Formaggi Nobili", sotto2: "Camembert" },
  { keywords: ["taleggio", "taleggio dop"], sotto1: "Formaggi Nobili", sotto2: "Taleggio" },
  { keywords: ["asiago", "asiago pressato", "asiago stagionato", "asiago dop"], sotto1: "Formaggi Nobili", sotto2: "Asiago" },
  { keywords: ["montasio", "montasio dop", "montasio fresco", "montasio stagionato"], sotto1: "Formaggi Nobili", sotto2: "Montasio" },
  { keywords: ["raclette", "raclette svizzera"], sotto1: "Formaggi Nobili", sotto2: "Raclette" },
  { keywords: ["gruyere", "gruyère", "emmental", "emmentaler"], sotto1: "Formaggi Nobili", sotto2: "Gruyère" },
  { keywords: ["manchego", "manchego curado", "manchego viejo"], sotto1: "Formaggi Nobili", sotto2: "Manchego" },
  { keywords: ["roquefort"], sotto1: "Formaggi Nobili", sotto2: "Roquefort" },
  { keywords: ["comte", "comté"], sotto1: "Formaggi Nobili", sotto2: "Comté" },
  { keywords: ["cheddar", "cheddar stagionato"], sotto1: "Formaggi Nobili", sotto2: "Cheddar" },
  { keywords: ["gouda", "gouda stagionato", "gouda affumicato"], sotto1: "Formaggi Nobili", sotto2: "Gouda" },
  { keywords: ["edam"], sotto1: "Formaggi Nobili", sotto2: "Edam" },
  { keywords: ["stilton", "blue stilton"], sotto1: "Formaggi Nobili", sotto2: "Stilton" },
  { keywords: ["bitto", "bitto storico"], sotto1: "Formaggi Nobili", sotto2: "Bitto" },
  { keywords: ["valtellina casera", "casera"], sotto1: "Formaggi Nobili", sotto2: "Casera" },
  { keywords: ["ragusano", "ragusano dop"], sotto1: "Formaggi Nobili", sotto2: "Ragusano" },
  { keywords: ["canestrato pugliese", "canestrato"], sotto1: "Formaggi Nobili", sotto2: "Canestrato" },
  { keywords: ["quartirolo lombardo", "quartirolo"], sotto1: "Formaggi Nobili", sotto2: "Quartirolo" },
  { keywords: ["provolone valpadana", "provolone dolce", "provolone piccante"], sotto1: "Formaggi Nobili", sotto2: "Provolone" },
  { keywords: ["scamorza affumicata", "scamorza stagionata"], sotto1: "Formaggi Nobili", sotto2: "Scamorza Affumicata" },
  { keywords: ["puzzone di moena", "spressa delle giudicarie", "formaggio di montagna"], sotto1: "Formaggi Nobili", sotto2: "Formaggio di Montagna" },
  { keywords: ["murazzano", "robiola di roccaverano"], sotto1: "Formaggi Nobili", sotto2: "Robiola Stagionata" },

  // ══════════════════════════════════════════════════════════════════════════
  // LATTICINI VARI
  // ══════════════════════════════════════════════════════════════════════════

  { keywords: ["mozzarella", "mozzarella fior di latte", "mozzarella di bufala", "mozzarella campana", "mozzarella treccia", "mozzarella ciliegina", "mozzarella bocconcino"], sotto1: "Latticini", sotto2: "Mozzarella" },
  { keywords: ["burrata", "burrata pugliese"], sotto1: "Latticini", sotto2: "Burrata" },
  { keywords: ["stracciatella", "stracciatella pugliese"], sotto1: "Latticini", sotto2: "Stracciatella" },
  { keywords: ["ricotta", "ricotta vaccina", "ricotta ovina", "ricotta di bufala", "ricotta salata"], sotto1: "Latticini", sotto2: "Ricotta" },
  { keywords: ["crescenza", "stracchino"], sotto1: "Latticini", sotto2: "Stracchino" },
  { keywords: ["robiola fresca", "robiola di capra"], sotto1: "Latticini", sotto2: "Robiola Fresca" },
  { keywords: ["primo sale", "primo sale ovino"], sotto1: "Latticini", sotto2: "Primo Sale" },
  { keywords: ["caprino fresco", "formaggio di capra fresco"], sotto1: "Latticini", sotto2: "Caprino" },
  { keywords: ["feta", "feta greca", "feta dop"], sotto1: "Latticini", sotto2: "Feta" },
  { keywords: ["halloumi", "haloumi"], sotto1: "Latticini", sotto2: "Halloumi" },
  { keywords: ["mascarpone"], sotto1: "Latticini", sotto2: "Mascarpone" },
  { keywords: ["philadelphia", "formaggio spalmabile", "formaggio cremoso", "cream cheese"], sotto1: "Latticini", sotto2: "Formaggio Spalmabile" },
  { keywords: ["sottilette", "fette formaggio", "formaggio fuso a fette"], sotto1: "Latticini", sotto2: "Sottilette" },
  { keywords: ["formaggino", "formaggini"], sotto1: "Latticini", sotto2: "Formaggini" },
  { keywords: ["scamorza fresca", "scamorza bianca"], sotto1: "Latticini", sotto2: "Scamorza Fresca" },
  { keywords: ["parmigiano reggiano", "parmigiano grattugiato", "parmigiano grattuggiato", "grana padano", "grana grattugiato", "grana padano grattugiato"], sotto1: "Latticini", sotto2: "Parmigiano Grattugiato" },
  { keywords: ["parmigiano reggiano pezzo", "grana padano pezzo", "parmigiano pezzo"], sotto1: "Latticini", sotto2: "Parmigiano" },
  { keywords: ["latte intero", "latte parzialmente scremato", "latte scremato", "latte fresco", "latte uht", "latte vaccino"], sotto1: "Latticini", sotto2: "Latte" },
  { keywords: ["latte di capra", "latte di pecora", "latte di bufala"], sotto1: "Latticini", sotto2: "Latte Alternativo" },
  { keywords: ["panna fresca", "panna da cucina", "panna da montare", "panna uht", "panna liquida", "panna acida", "creme fraiche", "crème fraîche"], sotto1: "Latticini", sotto2: "Panna" },
  { keywords: ["burro", "burro chiarificato", "burro salato", "burro di malga", "burro biologico", "burro prealpi"], sotto1: "Latticini", sotto2: "Burro" },
  { keywords: ["yogurt intero", "yogurt greco", "yogurt naturale", "yogurt bianco", "yogurt magro"], sotto1: "Latticini", sotto2: "Yogurt" },
  { keywords: ["kefir", "kefir di latte"], sotto1: "Latticini", sotto2: "Kefir" },
  { keywords: ["tuorlo pastorizzato", "tuorli pastorizzati", "albume pastorizzato", "albumi pastorizzati", "uova pastorizzate", "ovoprodotto"], sotto1: "Latticini", sotto2: "Ovoprodotti" },

  // ══════════════════════════════════════════════════════════════════════════
  // SALUMI
  // ══════════════════════════════════════════════════════════════════════════

  { keywords: ["prosciutto crudo", "prosciutto di parma", "prosciutto di san daniele", "prosciutto toscano", "prosciutto di norcia", "culatello", "prosciutto stagionato"], sotto1: "Salumi", sotto2: "Prosciutto Crudo" },
  { keywords: ["prosciutto cotto", "prosciutto cotto alta qualita", "prosciutto cotto arrosto"], sotto1: "Salumi", sotto2: "Prosciutto Cotto" },
  { keywords: ["salame", "salame milano", "salame napoli", "salame felino", "salame ungherese", "salame cacciatore", "salame calabrese", "salame di varzi", "salamino"], sotto1: "Salumi", sotto2: "Salame" },
  { keywords: ["mortadella", "mortadella bologna", "mortadella con pistacchi"], sotto1: "Salumi", sotto2: "Mortadella" },
  { keywords: ["bresaola", "bresaola della valtellina", "bresaola di manzo"], sotto1: "Salumi", sotto2: "Bresaola" },
  { keywords: ["speck", "speck alto adige"], sotto1: "Salumi", sotto2: "Speck" },
  { keywords: ["coppa", "coppa stagionata", "capocollo stagionato", "coppa di testa"], sotto1: "Salumi", sotto2: "Coppa" },
  { keywords: ["pancetta tesa", "pancetta arrotolata", "pancetta stagionata", "pancetta affumicata"], sotto1: "Salumi", sotto2: "Pancetta" },
  { keywords: ["guanciale", "guanciale stagionato", "guanciale di amatrice"], sotto1: "Salumi", sotto2: "Guanciale" },
  { keywords: ["lardo", "lardo di colonnata", "lardo stagionato"], sotto1: "Salumi", sotto2: "Lardo" },
  { keywords: ["strutto"], sotto1: "Salumi", sotto2: "Strutto" },
  { keywords: ["nduja", "nduja di spilinga", "'nduja"], sotto1: "Salumi", sotto2: "Nduja" },
  { keywords: ["soppressata", "soppressata calabrese", "soppressata lucana"], sotto1: "Salumi", sotto2: "Soppressata" },
  { keywords: ["finocchiona", "finocchiona toscana"], sotto1: "Salumi", sotto2: "Finocchiona" },
  { keywords: ["wurstel", "frankfurter", "hot dog", "wurstel di suino", "wurstel di pollo"], sotto1: "Salumi", sotto2: "Wurstel" },
  { keywords: ["cotechino fresco", "zampone fresco"], sotto1: "Salumi", sotto2: "Cotechino" },
  { keywords: ["salsiccia stagionata", "salsiccia secca", "salsiccia calabrese"], sotto1: "Salumi", sotto2: "Salsiccia Stagionata" },
  { keywords: ["affettato misto", "misto affettati", "tagliere salumi"], sotto1: "Salumi", sotto2: "Affettato Misto" },

  // ══════════════════════════════════════════════════════════════════════════
  // ALTRI FRESCHI
  // ══════════════════════════════════════════════════════════════════════════

  // Uova
  { keywords: ["uova", "uovo", "uova fresche", "uova cat a", "uova categoria a", "uova allevate a terra", "uova biologiche", "uova di gallina"], sotto1: "Altri Freschi", sotto2: "Uova" },

  // Pasta fresca
  { keywords: ["pasta fresca", "pasta fresca all'uovo", "tagliatelle fresche", "pappardelle fresche", "fettuccine fresche", "tagliolini freschi", "lasagne fresche", "sfoglia fresca"], sotto1: "Altri Freschi", sotto2: "Pasta Fresca" },
  { keywords: ["gnocchi freschi", "gnocchi di patate freschi"], sotto1: "Altri Freschi", sotto2: "Gnocchi Freschi" },
  { keywords: ["ravioli freschi", "tortellini freschi", "cappelletti freschi", "tortelloni freschi", "agnolotti freschi"], sotto1: "Altri Freschi", sotto2: "Pasta Ripiena Fresca" },

  // Lievito
  { keywords: ["lievito di birra fresco", "lievito fresco", "lievito di birra"], sotto1: "Altri Freschi", sotto2: "Lievito di Birra" },

  // Paste di frutta secca
  { keywords: ["pasta di nocciole", "pasta nocciole", "crema di nocciole pura"], sotto1: "Altri Freschi", sotto2: "Pasta di Nocciole" },
  { keywords: ["pasta di pistacchio", "pasta pistacchio", "crema di pistacchio pura"], sotto1: "Altri Freschi", sotto2: "Pasta di Pistacchio" },
  { keywords: ["pasta di mandorle", "pasta mandorle", "marzapane fresco"], sotto1: "Altri Freschi", sotto2: "Pasta di Mandorle" },
  { keywords: ["pasta di arachidi", "burro di arachidi fresco"], sotto1: "Altri Freschi", sotto2: "Pasta di Arachidi" },
  { keywords: ["tahini", "pasta di sesamo"], sotto1: "Altri Freschi", sotto2: "Pasta di Sesamo" },

  // Sughi e salse fresche
  { keywords: ["pesto fresco", "pesto alla genovese fresco", "pesto di basilico fresco"], sotto1: "Altri Freschi", sotto2: "Pesto Fresco" },
  { keywords: ["salsa di noci fresca", "salsa noci fresca"], sotto1: "Altri Freschi", sotto2: "Salsa di Noci" },
  { keywords: ["sugo fresco", "salsa fresca", "ragù fresco", "passata fresca"], sotto1: "Altri Freschi", sotto2: "Sugo Fresco" },
  { keywords: ["hummus fresco", "guacamole fresco"], sotto1: "Altri Freschi", sotto2: "Salse Fresche" },

  // Prodotti vegetali freschi
  { keywords: ["tofu", "tofu fresco", "tofu silken"], sotto1: "Altri Freschi", sotto2: "Tofu" },
  { keywords: ["seitan", "seitan fresco"], sotto1: "Altri Freschi", sotto2: "Seitan" },
  { keywords: ["tempeh"], sotto1: "Altri Freschi", sotto2: "Tempeh" },

  // Succhi freschi
  { keywords: ["succo fresco", "succo di frutta fresco", "centrifugato", "estratto di frutta"], sotto1: "Altri Freschi", sotto2: "Succhi Freschi" },

  // Altro fresco da banco
  { keywords: ["impasto fresco", "pasta per pizza fresca", "pasta sfoglia fresca", "pasta brisée fresca", "pasta frolla fresca"], sotto1: "Altri Freschi", sotto2: "Impasti Freschi" },
  { keywords: ["panna cotta pronta", "budino fresco", "dolce fresco"], sotto1: "Altri Freschi", sotto2: "Dolci Freschi" },
]

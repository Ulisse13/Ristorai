// ─────────────────────────────────────────────────────────────────────────────
// foodDB_freschi.js — Database FRESCHI per Ristorai
// Struttura: nome (matching) + testo (varianti) + sotto1/sotto2 + unit
// Fonti: catalogo MARR + catalogo Selecta
// ─────────────────────────────────────────────────────────────────────────────

export const FRESCHI_DB = [

  // ══════════════════════════════════════════════════════════════════════════
  // FORMAGGI NOBILI — ITALIANI
  // ══════════════════════════════════════════════════════════════════════════

  { nome: "Parmigiano Reggiano", testo: "alias: Parmigiano DOP | stagionatura: 18, 24, 30, 36, 48, 60, 72 mesi | formato: spicchio, mezza ruota, ruota intera, 1/8 | grattugiato, cubetti | varianti: montagna, Solodibruna, Vacche Rosse, Riserva | in lattina, S/V", sotto1: "Formaggi Nobili", sotto2: "Parmigiano Reggiano", unit: "kg" },
  { nome: "Grana Padano", testo: "alias: Grana Padano DOP | stagionatura: base, Senior 20 mesi | formato: spicchio, ruota, 1/8, intera | grattugiato | S/V", sotto1: "Formaggi Nobili", sotto2: "Grana Padano", unit: "kg" },
  { nome: "Gorgonzola", testo: "alias: Gorgonzola DOP | varianti: dolce, piccante | formato: spicchio, forma intera | stagionatura: 2-6 mesi | S/V", sotto1: "Formaggi Nobili", sotto2: "Gorgonzola", unit: "kg" },
  { nome: "Fontina", testo: "alias: Fontina DOP, Fontina valdostana, Fontina d'alpeggio | formato: spicchio, forma intera | stagionatura: 3-6 mesi | S/V", sotto1: "Formaggi Nobili", sotto2: "Fontina", unit: "kg" },
  { nome: "Fontal", testo: "alias: Fontal dolce | formato: spicchio, forma | S/V", sotto1: "Formaggi Nobili", sotto2: "Fontal", unit: "kg" },
  { nome: "Taleggio", testo: "alias: Taleggio DOP | formato: forma intera, spicchio | stagionatura: 40-50 giorni | S/V", sotto1: "Formaggi Nobili", sotto2: "Taleggio", unit: "kg" },
  { nome: "Pecorino Romano", testo: "alias: Pecorino Romano DOP, Pecorino sardo, Pecorino toscano, Pecorino siciliano, Pecorino di fossa | formato: spicchio, 1/8, forma intera | stagionatura: fresco, semistagionato, stagionato | S/V", sotto1: "Formaggi Nobili", sotto2: "Pecorino", unit: "kg" },
  { nome: "Caciocavallo", testo: "alias: Caciocavallo silano, Caciocavallo podolico, Caciocavallo affumicato | formato: intero, spicchio | stagionatura: fresco, stagionato | S/V", sotto1: "Formaggi Nobili", sotto2: "Caciocavallo", unit: "kg" },
  { nome: "Asiago", testo: "alias: Asiago DOP, Asiago pressato, Asiago stagionato | formato: spicchio, forma | stagionatura: pressato, mezzano, vecchio, stravecchio | S/V", sotto1: "Formaggi Nobili", sotto2: "Asiago", unit: "kg" },
  { nome: "Provolone", testo: "alias: Provolone Valpadana DOP, Provolone dolce, Provolone piccante | formato: intero, metà, spicchio | stagionatura: dolce 2-3 mesi, piccante 6+ mesi | S/V", sotto1: "Formaggi Nobili", sotto2: "Provolone", unit: "kg" },
  { nome: "Scamorza Affumicata", testo: "alias: scamorza stagionata | formato: intera, affettata | S/V", sotto1: "Formaggi Nobili", sotto2: "Scamorza Affumicata", unit: "kg" },
  { nome: "Bitto", testo: "alias: Bitto DOP, Bitto storico | formato: spicchio, forma intera | stagionatura: 70 giorni - 10 anni | S/V", sotto1: "Formaggi Nobili", sotto2: "Bitto", unit: "kg" },
  { nome: "Valtellina Casera", testo: "alias: Casera DOP | formato: spicchio, forma | stagionatura: 70 giorni - 2 anni | S/V", sotto1: "Formaggi Nobili", sotto2: "Casera", unit: "kg" },
  { nome: "Toma", testo: "alias: Toma piemontese DOP, Toma di Lanzo, Toma ossolana, Tomino | formato: spicchio, forma, da griglia | stagionatura: fresca, stagionata | S/V", sotto1: "Formaggi Nobili", sotto2: "Toma", unit: "kg" },

  // ══════════════════════════════════════════════════════════════════════════
  // FORMAGGI NOBILI — ESTERI
  // ══════════════════════════════════════════════════════════════════════════

  { nome: "Brie", testo: "alias: Brie de Meaux DOP, Brie de Melun DOP, Brie de Normandie | formato: forma intera, spicchio, petit | S/V | marchi: MonS", sotto1: "Formaggi Nobili", sotto2: "Brie", unit: "kg" },
  { nome: "Camembert", testo: "alias: Camembert de Normandie DOP, Camembert petit | formato: forma intera | S/V | marchi: MonS", sotto1: "Formaggi Nobili", sotto2: "Camembert", unit: "kg" },
  { nome: "Roquefort", testo: "alias: Roquefort DOP | formato: spicchio, forma | S/V | marchi: J.Carles, MonS", sotto1: "Formaggi Nobili", sotto2: "Roquefort", unit: "kg" },
  { nome: "Comté", testo: "alias: Comte MonS | stagionatura: 8, 14, 20, 30 mesi | formato: spicchio, 1/4, forma intera | S/V | marchi: MonS", sotto1: "Formaggi Nobili", sotto2: "Comté", unit: "kg" },
  { nome: "Gruyère", testo: "alias: Gruyère des Grottes, Emmental, Emmentaler | formato: spicchio, forma | stagionatura: 16-20 mesi | marchi: Swisscru | S/V", sotto1: "Formaggi Nobili", sotto2: "Gruyère", unit: "kg" },
  { nome: "Raclette", testo: "alias: Raclette svizzera, Raclette fumée, Raclette BIO | formato: mezza forma, forma intera | marchi: MonS, Swisscru | S/V", sotto1: "Formaggi Nobili", sotto2: "Raclette", unit: "kg" },
  { nome: "Manchego", testo: "alias: Manchego DOP, Manchego curado, Manchego viejo | formato: spicchio, forma | stagionatura: curado, viejo | marchi: Olmeda Origenes | S/V", sotto1: "Formaggi Nobili", sotto2: "Manchego", unit: "kg" },
  { nome: "Cheddar", testo: "alias: Cheddar Traditional, Red Cheddar | formato: spicchio, forma intera, blocco | stagionatura: mild, mature, extra mature | origine: Gran Bretagna | S/V", sotto1: "Formaggi Nobili", sotto2: "Cheddar", unit: "kg" },
  { nome: "Gouda", testo: "alias: Gouda stagionato, Gouda di capra, Gouda al tartufo, Reypenaer | formato: spicchio, forma | stagionatura: jong, belegen, oud | marchi: Reypenaer | S/V", sotto1: "Formaggi Nobili", sotto2: "Gouda", unit: "kg" },
  { nome: "Stilton", testo: "alias: Blue Stilton, Cashel Blue, Blue Shropshire | formato: spicchio, forma intera | origine: Gran Bretagna | S/V", sotto1: "Formaggi Nobili", sotto2: "Stilton", unit: "kg" },
  { nome: "Feta", testo: "alias: Feta DOP, Feta greca | formato: monoporzione, preaffettata, in latta | origine: Grecia | S/V", sotto1: "Formaggi Nobili", sotto2: "Feta", unit: "kg" },
  { nome: "Halloumi", testo: "alias: Haloumi, Manouri DOP | formato: intero, affettato | origine: Cipro, Grecia | S/V", sotto1: "Formaggi Nobili", sotto2: "Halloumi", unit: "kg" },

  // ══════════════════════════════════════════════════════════════════════════
  // LATTICINI
  // ══════════════════════════════════════════════════════════════════════════

  { nome: "Mozzarella", testo: "alias: Mozzarella fior di latte, Mozzarella di Bufala Campana DOP, Burrata, Stracciatella | varianti: treccia, ciliegina, bocconcino, fiordilatte, pizzeria, cubettata, julienne | formato: singola, pluripack | BIO, Querceta | S/V", sotto1: "Latticini", sotto2: "Mozzarella", unit: "kg" },
  { nome: "Burrata", testo: "alias: Burrata pugliese, Burratina, Mini burratina | varianti: classica, affumicata, BIO | origine: Puglia | formato: singola, pluripack | Querceta | S/V", sotto1: "Latticini", sotto2: "Burrata", unit: "kg" },
  { nome: "Stracciatella", testo: "alias: Stracciatella pugliese, stracciatella di burrata | varianti: BIO | origine: Puglia | Querceta | S/V", sotto1: "Latticini", sotto2: "Stracciatella", unit: "kg" },
  { nome: "Ricotta", testo: "alias: Ricotta vaccina, Ricotta ovina, Ricotta di bufala, Ricotta salata, Ricottine | varianti: fresca, stagionata, affumicata, di pecora, BIO | formato: vaschetta, monoporzione | Querceta | S/V", sotto1: "Latticini", sotto2: "Ricotta", unit: "kg" },
  { nome: "Mascarpone", testo: "alias: Mascarpone artigianale | origine: Emilia Romagna, Lombardia | S/V", sotto1: "Latticini", sotto2: "Mascarpone", unit: "kg" },
  { nome: "Stracchino", testo: "alias: Crescenza, Stracchino fresco | varianti: fresco | S/V", sotto1: "Latticini", sotto2: "Stracchino", unit: "kg" },
  { nome: "Robiola", testo: "alias: Robiola fresca, Robiola di capra, Robiola di Roccaverano | varianti: fresca, stagionata, in foglie, spalmabile | formato: singola | S/V", sotto1: "Latticini", sotto2: "Robiola", unit: "kg" },
  { nome: "Caprino", testo: "alias: Formaggio di capra fresco, Caprino fresco | varianti: fresco, stagionato, al pepe nero | BIO, Puglia | S/V", sotto1: "Latticini", sotto2: "Caprino", unit: "kg" },
  { nome: "Scamorza Fresca", testo: "alias: Scamorza bianca, Nodino fiordilatte | varianti: bianca, affumicata | S/V", sotto1: "Latticini", sotto2: "Scamorza Fresca", unit: "kg" },
  { nome: "Latte", testo: "alias: latte intero, latte fresco, latte UHT, latte scremato, latte parzialmente scremato | varianti: vaccino, di capra, di pecora, di bufala, di soia, di avena, di mandorla, di riso, biologico | formato: bottiglia, cartone, brik | marchi: Alpro, Orasi", sotto1: "Latticini", sotto2: "Latte", unit: "l" },
  { nome: "Panna", testo: "alias: panna fresca, panna da cucina, panna da montare, panna UHT, panna acida, crème fraîche | varianti: fresca, UHT, spray, 15%, 35%, 42% | marchi: Elle&Vire, Corman | formato: bottiglia, brick, vaschetta", sotto1: "Latticini", sotto2: "Panna", unit: "l" },
  { nome: "Burro", testo: "alias: Burro della Normandia, Burro della Bretagna, Burro italiano, Burro di bufala, Burro chiarificato, Burro biologico | varianti: naturale, salato, demi-sel, extra secco 84%, monoporzione, blocco, rotolo, cestello | marchi: Elle&Vire, Corman, Echiré, GrandEmilia | formato: blocco, panetto, rotolo, cestello", sotto1: "Latticini", sotto2: "Burro", unit: "kg" },
  { nome: "Yogurt", testo: "alias: Yogurt intero, Yogurt greco, Yogurt naturale, Yogurt BIO | varianti: naturale, intero, magro, greco, BIO | marchi: MonS | formato: vasetto, pluripack", sotto1: "Latticini", sotto2: "Yogurt", unit: "kg" },
  { nome: "Formaggio Spalmabile", testo: "alias: Philadelphia, Cream Cheese, fromage blanc | varianti: naturale, alle erbe, light | marchi: Elle&Vire | formato: vaschetta, pluripack | S/V", sotto1: "Latticini", sotto2: "Formaggio Spalmabile", unit: "kg" },
  { nome: "Ovoprodotti", testo: "alias: tuorlo pastorizzato, albume pastorizzato, uova pastorizzate, misto uovo pastorizzato | varianti: tuorlo, albume, intero | formato: bottiglia, brick, busta | BIO", sotto1: "Latticini", sotto2: "Ovoprodotti", unit: "kg" },

  // ══════════════════════════════════════════════════════════════════════════
  // SALUMI
  // ══════════════════════════════════════════════════════════════════════════

  { nome: "Prosciutto Crudo", testo: "alias: Prosciutto di Parma DOP, Prosciutto di San Daniele DOP, Prosciutto toscano, Culatello di Zibello DOP, Prosciutto di Sauris IGP | varianti: con osso, senza osso, intero, affettato, metà | stagionatura: 12-36 mesi | marchi: Podere Cadassa, Salumitaliani | S/V", sotto1: "Salumi", sotto2: "Prosciutto Crudo", unit: "kg" },
  { nome: "Prosciutto Cotto", testo: "alias: Prosciutto cotto alta qualità, Prosciutto cotto arrosto | varianti: intero, affettato, a fette | S/V", sotto1: "Salumi", sotto2: "Prosciutto Cotto", unit: "kg" },
  { nome: "Speck", testo: "alias: Speck Alto Adige IGP, Speck di Sauris IGP, Speck del Trentino, Speck Sarner | varianti: intero, affettato, metà | S/V", sotto1: "Salumi", sotto2: "Speck", unit: "kg" },
  { nome: "Bresaola", testo: "alias: Bresaola della Valtellina IGP, Bresaola di manzo, Bresaola di cavallo, Bresaola di cervo, Bresaola di cinghiale | varianti: intera, affettata, metà | S/V | Mottolino, Ibis", sotto1: "Salumi", sotto2: "Bresaola", unit: "kg" },
  { nome: "Mortadella", testo: "alias: Mortadella Bologna IGP, Mortadella con pistacchi | varianti: intera, affettata, metà | formato: con o senza pistacchi | Presidio Slow Food | S/V", sotto1: "Salumi", sotto2: "Mortadella", unit: "kg" },
  { nome: "Salame", testo: "alias: Salame Milano, Salame Napoli, Salame Felino, Salame cacciatore, Salame calabrese, Salamino, Strolghino, Finocchiona, Soppressata, Nduja, Ciauscolo | varianti: intero, affettato, metà | stagionatura: varia | marchi: Podere Cadassa | S/V", sotto1: "Salumi", sotto2: "Salame", unit: "kg" },
  { nome: "Coppa", testo: "alias: Coppa stagionata, Capocollo, Coppa di testa, Coppa di Martina Franca IGP | varianti: intera, affettata, pulita | S/V | Podere Cadassa", sotto1: "Salumi", sotto2: "Coppa", unit: "kg" },
  { nome: "Pancetta", testo: "alias: Pancetta tesa, Pancetta arrotolata, Pancetta stagionata, Pancetta affumicata, Pancetta cubetti | varianti: tesa, arrotolata, affettata, cubetti | S/V, ATM | Podere Cadassa", sotto1: "Salumi", sotto2: "Pancetta", unit: "kg" },
  { nome: "Guanciale", testo: "alias: Guanciale stagionato, Guanciale di Amatrice, Guanciale affumicato di Sauris | varianti: intero, affettato | S/V | Podere Cadassa", sotto1: "Salumi", sotto2: "Guanciale", unit: "kg" },
  { nome: "Lardo", testo: "alias: Lardo di Colonnata IGP, Lardo stagionato, Lardo pancettato, Lardo di montagna | varianti: intero, affettato | S/V | Podere Cadassa", sotto1: "Salumi", sotto2: "Lardo", unit: "kg" },
  { nome: "Pastrami", testo: "alias: Pastrami bovino affumicato, Controfiletto manzo fumé | varianti: intero, affettato | S/V", sotto1: "Salumi", sotto2: "Bresaola", unit: "kg" },
  { nome: "Wurstel", testo: "alias: Frankfurter, Hot dog, Wurstel di suino, Wurstel di pollo | varianti: classici, senza glutine | formato: sfusi, pluripack | S/V, ATM", sotto1: "Salumi", sotto2: "Wurstel", unit: "kg" },
  { nome: "Prosciutto Iberico", testo: "alias: Prosciutto Iberico bellota, Pata Negra 5J, Paleta Iberica, Jamon Iberico | varianti: intero, senza osso, affettato | marchi: Cinco Jotas, Casalba | S/V", sotto1: "Salumi", sotto2: "Prosciutto Crudo", unit: "kg" },

  // ══════════════════════════════════════════════════════════════════════════
  // ALTRI FRESCHI
  // ══════════════════════════════════════════════════════════════════════════

  { nome: "Uova", testo: "alias: uova fresche, uova di gallina, uova Cat A, uova biologiche, uova allevate a terra | calibri: S, M, L, XL | formato: cartone 6, 10, 12, 30 pz | BIO, free range, allevate a terra, allevamento intensivo", sotto1: "Altri Freschi", sotto2: "Uova", unit: "pz" },
  { nome: "Misto Uovo", testo: "alias: pasta d'uovo, misto d'uovo, pasta uovo gialla, pasta uovo AIA, uovo intero pastorizzato, uovo liquido, ovoprodotto misto | marchi: AIA, Eurovo, Sanovo | formato: busta 1kg, 5kg, 10kg, sacchetto | surgelato, refrigerato", sotto1: "Altri Freschi", sotto2: "Ovoprodotti", unit: "kg" },
  { nome: "Tuorlo Pastorizzato", testo: "alias: pasta tuorlo, tuorlo liquido, pasta gialla, egg yolk | marchi: AIA, Eurovo | formato: busta 1kg, 5kg", sotto1: "Altri Freschi", sotto2: "Ovoprodotti", unit: "kg" },
  { nome: "Albume Pastorizzato", testo: "alias: pasta albume, albume liquido, bianco d'uovo pastorizzato, egg white | marchi: AIA, Eurovo | formato: busta 1kg, 5kg", sotto1: "Altri Freschi", sotto2: "Ovoprodotti", unit: "kg" },
  { nome: "Lievito di Birra", testo: "alias: lievito fresco, lievito di birra fresco | formato: panetto 25g, 500g, 1kg | S/V", sotto1: "Altri Freschi", sotto2: "Lievito di Birra", unit: "kg" },
  { nome: "Pasta Fresca", testo: "alias: tagliatelle fresche, pappardelle, fettuccine, tagliolini, lasagne, sfoglia fresca | all'uovo, di semola | formato: vaschetta, busta, sfusa | S/V, ATM", sotto1: "Altri Freschi", sotto2: "Pasta Fresca", unit: "kg" },
  { nome: "Gnocchi Freschi", testo: "alias: gnocchi di patate freschi | varianti: classici, al farro | formato: vaschetta, busta | S/V, ATM", sotto1: "Altri Freschi", sotto2: "Gnocchi Freschi", unit: "kg" },
  { nome: "Pasta Ripiena Fresca", testo: "alias: ravioli freschi, tortellini freschi, cappelletti, tortelloni, agnolotti | varianti: al formaggio, alla carne, alle verdure, al tartufo | S/V, ATM", sotto1: "Altri Freschi", sotto2: "Pasta Ripiena Fresca", unit: "kg" },
  { nome: "Pasta di Pistacchio", testo: "alias: crema di pistacchio pura, pasta pistacchio | varianti: BIO, esteri, Bronte DOP | S/V", sotto1: "Altri Freschi", sotto2: "Paste di Frutta Secca", unit: "kg" },
  { nome: "Pasta di Nocciole", testo: "alias: crema di nocciole pura, pasta nocciole | varianti: Piemonte IGP, tostate | S/V", sotto1: "Altri Freschi", sotto2: "Paste di Frutta Secca", unit: "kg" },
  { nome: "Pesto Fresco", testo: "alias: pesto alla genovese fresco, pesto di basilico fresco | varianti: classico, senza aglio, con noci | S/V, ATM", sotto1: "Altri Freschi", sotto2: "Pesto Fresco", unit: "kg" },
]

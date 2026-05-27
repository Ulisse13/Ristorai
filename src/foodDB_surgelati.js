// ─────────────────────────────────────────────────────────────────────────────
// foodDB_surgelati.js — Database SURGELATI per Ristorai
// Struttura: nome (matching) + testo (varianti) + sotto1/sotto2 + unit
// Nota: gli stati (IQF, gelo, S, C ecc.) sono gestiti da detectStato in foodDB.js
// Fonti: catalogo MARR + catalogo Selecta
// ─────────────────────────────────────────────────────────────────────────────

export const SURGELATI_DB = [

  // ══════════════════════════════════════════════════════════════════════════
  // CARNI SURGELATE
  // ══════════════════════════════════════════════════════════════════════════

  { nome: "Pollo Surgelato", testo: "alias: pollo gelo, pollo congelato, pollo IQF | varianti: intero, quarti, busto, gallina, cappone, faraona | calibri: 180/220g, 230g, 240/280g | CL.A | S/V", sotto1: "Carni", sotto2: "Pollo", unit: "kg" },
  { nome: "Petto Pollo Surgelato", testo: "alias: petto pollo gelo, petto pollo IQF | varianti: intero, a fette, prep., marinato, croccante | calibri: 150/200g, 220g | TR, S/V", sotto1: "Carni", sotto2: "Pollo", unit: "kg" },
  { nome: "Coscia Pollo Surgelata", testo: "alias: coscia pollo gelo, coscia pollo IQF, fuso pollo, sovracoscia pollo | calibri: 180/220g, 230g, 240/280g | CL.A | S/V", sotto1: "Carni", sotto2: "Pollo", unit: "kg" },
  { nome: "Ali Pollo Surgelate", testo: "alias: ali pollo gelo, alette pollo, wings surgelate, mexico wings | arrostite, crude | IQF | S/V", sotto1: "Carni", sotto2: "Pollo", unit: "kg" },
  { nome: "Hamburger Surgelato", testo: "alias: burger surgelato, hamburger gelo, hamburger congelato | varianti: manzo, bovino, Angus, Black Angus, ovino, vegetale, vegano | calibri: 80g, 100g, 113g, 125g, 150g, 180g, 200g | IQF | S/V", sotto1: "Carni", sotto2: "Hamburger", unit: "kg" },
  { nome: "Polpette Surgelate", testo: "alias: polpette gelo, polpetta surgelata | varianti: bovino, maiale, miste | calibri: 20g, 30g, 50g | IQF | S/V", sotto1: "Carni", sotto2: "Polpette", unit: "kg" },
  { nome: "Salsiccia Surgelata", testo: "alias: salsicce surgelate, salsiccia gelo | varianti: suino, pollo, piccante | IQF | S/V", sotto1: "Carni", sotto2: "Salsiccia", unit: "kg" },
  { nome: "Arrosticini Surgelati", testo: "alias: arrosticini gelo, arrosticini IQF | varianti: ovino adulto, Black Angus | calibri: 21g, 28g | S/V", sotto1: "Carni", sotto2: "Agnello", unit: "kg" },
  { nome: "Macinato Surgelato", testo: "alias: macinato bovino gelo, macinato IQF | varianti: bovino adulto, vitellone | IQF | S/V, ATM", sotto1: "Carni", sotto2: "Manzo", unit: "kg" },
  { nome: "Anatra Surgelata", testo: "alias: anatra gelo, polpa anatra gelo, petto anatra gelo | varianti: busto, quarti, polpa, petto Mulard | gelo | S/V", sotto1: "Carni", sotto2: "Anatra", unit: "kg" },
  { nome: "Foie Gras Surgelato", testo: "alias: fegato grasso gelo, scaloppa fegato grasso gelo, pepite fegato grasso gelo | varianti: scaloppa, mini scaloppa, pepite, intero, mondato | calibri: 20/40g, 40/60g, 60/80g | marchi: Rougié | gelo | S/V", sotto1: "Carni", sotto2: "Anatra", unit: "kg" },
  { nome: "Selvaggina Surgelata", testo: "alias: cervo gelo, capriolo gelo, cinghiale gelo, lepre gelo, faraona gelo, piccione gelo, quaglia gelo | varianti: filetto, sella, coscia, polpa | gelo | S/V", sotto1: "Carni", sotto2: "Selvaggina", unit: "kg" },
  { nome: "Costine Surgelate", testo: "alias: costine cotte gelo, spare ribs surgelate | con salsa barbecue | IQF | S/V", sotto1: "Carni", sotto2: "Maiale", unit: "kg" },
  { nome: "Spiedini Surgelati", testo: "alias: spiedini gelo, spiedini di carne | varianti: misti, pollo, maiale | IQF | S/V", sotto1: "Carni", sotto2: "Misto Carni", unit: "kg" },

  // ══════════════════════════════════════════════════════════════════════════
  // PESCE SURGELATO — già gestito da foodDB_pesce.js con isSurgelato
  // qui le voci specifiche per prodotti solo surgelati senza fresco
  // ══════════════════════════════════════════════════════════════════════════

  { nome: "Bastoncini Pesce", testo: "alias: bastoncini di merluzzo, fish fingers, bastoncini surgelati | varianti: merluzzo, platessa | impanati | calibri: 30g, 50g, 80g | IQF | S/V", sotto1: "Pesce", sotto2: "Bastoncini", unit: "kg" },
  { nome: "Bauletti Astice", testo: "alias: bauletti di astice surgelati | varianti: ripieni | IQF | S/V | Selecta", sotto1: "Pesce", sotto2: "Astice", unit: "kg" },
  { nome: "Misto Mare Surgelato", testo: "alias: frutti di mare surgelati, seafood mix, misto mare IQF | varianti: con cozze, vongole, gamberi, calamari | IQF | busta | Selecta", sotto1: "Pesce", sotto2: "Misto Mare", unit: "kg" },
  { nome: "Canestrello Surgelato", testo: "alias: canestrelli surgelati, canestrello IQF | calibri: 20/40 | sgusciati | IQF", sotto1: "Pesce", sotto2: "Capesante", unit: "kg" },

  // ══════════════════════════════════════════════════════════════════════════
  // VERDURE SURGELATE
  // ══════════════════════════════════════════════════════════════════════════

  { nome: "Piselli Surgelati", testo: "alias: piselli gelo, piselli IQF | varianti: fini, finissimi, medi | Bonduelle | IQF | busta", sotto1: "Verdure", sotto2: "Piselli", unit: "kg" },
  { nome: "Spinaci Surgelati", testo: "alias: spinaci gelo, spinaci IQF | varianti: foglia intera, tritati, porzioni | IQF | busta", sotto1: "Verdure", sotto2: "Spinaci", unit: "kg" },
  { nome: "Fagiolini Surgelati", testo: "alias: fagiolini gelo, fagiolini IQF | varianti: interi, tagliati | IQF | busta", sotto1: "Verdure", sotto2: "Fagiolini", unit: "kg" },
  { nome: "Broccoli Surgelati", testo: "alias: broccoli gelo, broccoli IQF, cimette broccoli | varianti: rosette, cimette, interi | Bonduelle, Fruttad | IQF | busta", sotto1: "Verdure", sotto2: "Broccoli", unit: "kg" },
  { nome: "Patate Surgelate", testo: "alias: patatine surgelate, patate fritte surgelate, purea patate | varianti: fritte, al forno, spicchi, rustic, purea, blu | IQF | busta, sacco", sotto1: "Verdure", sotto2: "Patate", unit: "kg" },
  { nome: "Mais Surgelato", testo: "alias: mais gelo, granturco surgelato | varianti: chicchi, spiga baby | IQF | busta", sotto1: "Verdure", sotto2: "Mais", unit: "kg" },
  { nome: "Carote Surgelate", testo: "alias: carote gelo, carote IQF | varianti: a rondelle, intere, baby | IQF | busta", sotto1: "Verdure", sotto2: "Carote", unit: "kg" },
  { nome: "Asparagi Surgelati", testo: "alias: asparagi gelo, asparagi IQF | varianti: verdi, bianchi, mini | IQF | busta", sotto1: "Verdure", sotto2: "Asparagi", unit: "kg" },
  { nome: "Funghi Surgelati", testo: "alias: funghi gelo, porcini surgelati, finferli surgelati | varianti: porcini, finferli, misto bosco | IQF | busta", sotto1: "Verdure", sotto2: "Funghi", unit: "kg" },
  { nome: "Carciofi Surgelati", testo: "alias: carciofi gelo, carciofi IQF | varianti: interi, a spicchi, cuori | IQF | busta", sotto1: "Verdure", sotto2: "Carciofi", unit: "kg" },
  { nome: "Peperoni Surgelati", testo: "alias: peperoni gelo, peperoni IQF | varianti: a striscioline, a cubetti, misti | IQF | busta", sotto1: "Verdure", sotto2: "Peperoni", unit: "kg" },
  { nome: "Zucchine Surgelate", testo: "alias: zucchine gelo, zucchine IQF | varianti: a rondelle, a cubetti, grigliate | IQF | busta", sotto1: "Verdure", sotto2: "Zucchine", unit: "kg" },
  { nome: "Pomodorini Surgelati", testo: "alias: pomodorini confit gelo, pomodorini IQF | varianti: confit, ciliegino | IQF | busta", sotto1: "Verdure", sotto2: "Pomodori", unit: "kg" },
  { nome: "Cipolla Surgelata", testo: "alias: cipolla gelo, cipolla tritata surgelata, cipolle IQF | varianti: tritata, a rondelle, stuita | IQF | busta", sotto1: "Verdure", sotto2: "Cipolla", unit: "kg" },
  { nome: "Edamame Surgelato", testo: "alias: soia edamame gelo, edamame IQF | Pinguin | IQF | busta", sotto1: "Verdure", sotto2: "Legumi", unit: "kg" },
  { nome: "Avocado Surgelato", testo: "alias: avocado gelo, avocado IQF | varianti: cubetti, fette, MAP | IQF | busta", sotto1: "Verdure", sotto2: "Avocado", unit: "kg" },
  { nome: "Castagne Surgelate", testo: "alias: castagne gelo, marron gelo, marroni surgelati | varianti: intere, pelate | IQF | busta", sotto1: "Verdure", sotto2: "Castagne", unit: "kg" },
  { nome: "Mix Verdure Surgelate", testo: "alias: misto verdure surgelato, verdure miste gelo, minestrone surgelato | varianti: classico, estivo, orientale, minestrone | IQF | busta", sotto1: "Verdure", sotto2: "Misto Verdure", unit: "kg" },
  { nome: "Bieta Surgelata", testo: "alias: bieta costa gelo, bieta IQF | Gran Natura | IQF | busta", sotto1: "Verdure", sotto2: "Bieta", unit: "kg" },
  { nome: "Cavolo Nero Surgelato", testo: "alias: cavolo nero gelo | IQF | busta", sotto1: "Verdure", sotto2: "Cavolo", unit: "kg" },
  { nome: "Cimette di Rapa Surgelate", testo: "alias: cimette rapa gelo, broccoletti gelo | Gran Natura | IQF | busta", sotto1: "Verdure", sotto2: "Broccoli", unit: "kg" },

  // ══════════════════════════════════════════════════════════════════════════
  // PREPARATI SURGELATI
  // ══════════════════════════════════════════════════════════════════════════

  { nome: "Lasagne Surgelate", testo: "alias: lasagna surgelata, lasagne gelo | varianti: carne, ricotta spinaci, verdure | IQF | vassoi, S/V", sotto1: "Preparati", sotto2: "Lasagne", unit: "kg" },
  { nome: "Cannelloni Surgelati", testo: "alias: cannellone surgelato, cannelloni gelo | varianti: carne, ricotta spinaci | IQF | S/V", sotto1: "Preparati", sotto2: "Cannelloni", unit: "kg" },
  { nome: "Gnocchi Surgelati", testo: "alias: gnocchi gelo, gnocco surgelato | varianti: patate, ricotta | IQF | S/V, ATM", sotto1: "Preparati", sotto2: "Gnocchi", unit: "kg" },
  { nome: "Pasta Ripiena Surgelata", testo: "alias: ravioli surgelati, tortellini surgelati, tortelloni gelo, cappelletti gelo | varianti: carne, formaggio, verdure, tartufo | IQF | S/V, ATM", sotto1: "Preparati", sotto2: "Pasta Ripiena", unit: "kg" },
  { nome: "Arancini Surgelati", testo: "alias: arancino surgelato, supplì surgelato | varianti: classici, al ragù, mozzarella | IQF | S/V", sotto1: "Preparati", sotto2: "Arancini", unit: "kg" },
  { nome: "Crocchette Surgelate", testo: "alias: crocchetta surgelata, crocchette patate gelo | varianti: patate, miste | IQF | S/V", sotto1: "Preparati", sotto2: "Crocchette", unit: "kg" },
  { nome: "Pizza Surgelata", testo: "alias: pizza gelo, pizza congelata | varianti: Margherita, Quattro stagioni, tonno | IQF | S/V", sotto1: "Preparati", sotto2: "Pizza", unit: "kg" },
  { nome: "Pane Surgelato", testo: "alias: pane gelo, baguette surgelata, panini surgelati, brioche surgelata, croissant surgelato, miniburger surgelato | varianti: baguette, panini, burger bun, croissant, da lievitare | IQF | S/V", sotto1: "Preparati", sotto2: "Pane e Lievitati", unit: "kg" },
  { nome: "Pasta Sfoglia Surgelata", testo: "alias: pasta sfoglia gelo, pasta brisée surgelata, pasta fillo gelo, pasta kataifi gelo, pasta brick | varianti: sfoglia, brisée, fillo, kataifi, brick | gelo | S/V | Selecta", sotto1: "Preparati", sotto2: "Impasti", unit: "kg" },
  { nome: "Frutta Surgelata", testo: "alias: frutti di bosco surgelati, fragole surgelate, mirtilli surgelati, lamponi surgelati, purea surgelata | varianti: fragole, mirtilli, lamponi, frutti di bosco misti, mango, ananas | IQF, blocco | busta | Ravifruit, Adamance", sotto1: "Preparati", sotto2: "Frutta", unit: "kg" },
  { nome: "Erbe Surgelate", testo: "alias: basilico surgelato, prezzemolo surgelato, erbe aromatiche surgelate | varianti: basilico, prezzemolo, mix erbe | IQF | busta", sotto1: "Preparati", sotto2: "Erbe Aromatiche", unit: "kg" },
  { nome: "Brodo Surgelato", testo: "alias: fondo surgelato, brodo congelato, fondo di cottura gelo | varianti: bovino, pollo, pesce, verdure, cipolla | blocco, S/V | Selecta fondi", sotto1: "Preparati", sotto2: "Brodi e Fondi", unit: "kg" },
  { nome: "Snack Surgelati", testo: "alias: snack gelo, finger food surgelati | varianti: gyoza gamberi, spring roll, dim sum, xiaolongbao | IQF | S/V | Selecta, MARR", sotto1: "Preparati", sotto2: "Snack", unit: "kg" },

  // ══════════════════════════════════════════════════════════════════════════
  // GELATI E DOLCI
  // ══════════════════════════════════════════════════════════════════════════

  { nome: "Gelato", testo: "alias: gelato artigianale, fior di latte, sorbetto | varianti: crema, cioccolato, limone, fragola, pistacchio, nocciola, fior di latte | formato: vaschetta 1,5L, 5L, 10L, monoporzione | -18 | Selecta", sotto1: "Gelati e Dolci", sotto2: "Gelati", unit: "kg" },
  { nome: "Sorbetto", testo: "alias: sorbetto limone, sorbetto fragola | varianti: limone, fragola, lampone, mango, passion fruit | formato: vaschetta, monoporzione | -18 | IQF | Selecta", sotto1: "Gelati e Dolci", sotto2: "Gelati", unit: "kg" },
  { nome: "Semifreddo", testo: "alias: semifreddo surgelato, torta gelato | varianti: al cioccolato, tiramisù, zabaione | formato: intera, monoporzione | -18 | Selecta", sotto1: "Gelati e Dolci", sotto2: "Dolci", unit: "kg" },
  { nome: "Macarons Surgelati", testo: "alias: macarons gelo | varianti: assortiti | IQF | Valrhona, Selecta", sotto1: "Gelati e Dolci", sotto2: "Dolci", unit: "kg" },
  { nome: "Mini Dessert Surgelati", testo: "alias: mini dessert gelo, dessert monoporzione surgelati | varianti: cheesecake, mousse, panna cotta | IQF | Selecta", sotto1: "Gelati e Dolci", sotto2: "Dolci", unit: "kg" },
]

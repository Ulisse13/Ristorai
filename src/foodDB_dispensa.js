// ─────────────────────────────────────────────────────────────────────────────
// foodDB_dispensa.js — Database DISPENSA per Ristorai
// Struttura: nome (matching) + testo (varianti) + sotto1/sotto2 + unit
// Fonti: catalogo MARR + catalogo Selecta
// ─────────────────────────────────────────────────────────────────────────────

export const DISPENSA_DB = [

  // ══════════════════════════════════════════════════════════════════════════
  // CONSERVE — POMODORO
  // ══════════════════════════════════════════════════════════════════════════

  { nome: "Pelati", testo: "varianti: San Marzano, datterino, tondo, interi | formato: 3/1, 4/4, 400g, 2,5kg | marchi: Mutti, Gran Natura, Torrente, Le Tenute del Cavaliere | BIO", sotto1: "Conserve", sotto2: "Pomodoro", unit: "kg" },
  { nome: "Passata Pomodoro", testo: "alias: passata di pomodoro, passata classica | varianti: rustica, liscia, vellutata, BIO | formato: bottiglia 700g, 3/1, 5/1, 10kg bib | marchi: Mutti, Ortolina, Gran Natura, Le Tenute del Cavaliere", sotto1: "Conserve", sotto2: "Pomodoro", unit: "kg" },
  { nome: "Polpa Pomodoro", testo: "alias: polpa di pomodoro, polpa cubetti, polpa fine | varianti: cubetti, fine, a filetti | formato: 3/1, 5/1, 400g, 10kg bib | marchi: Mutti, Gran Natura, Due Fagiani, Rossogargano, Jolly", sotto1: "Conserve", sotto2: "Pomodoro", unit: "kg" },
  { nome: "Concentrato Pomodoro", testo: "alias: doppio concentrato, triplo concentrato | varianti: doppio, triplo | formato: 3/1, 4/4, 1kg", sotto1: "Conserve", sotto2: "Pomodoro", unit: "kg" },
  { nome: "Pomodori Secchi", testo: "alias: pomodori essiccati, pomodori secchi sott'olio | formato: vaso, barattolo, busta | origine: Puglia, Sicilia", sotto1: "Conserve", sotto2: "Pomodoro", unit: "kg" },

  // ══════════════════════════════════════════════════════════════════════════
  // CONSERVE — ORTAGGI E VERDURE
  // ══════════════════════════════════════════════════════════════════════════

  { nome: "Carciofi Conserva", testo: "alias: carciofi sott'olio, carciofi al naturale, cuori di carciofo | varianti: interi, tagliati, sott'olio | formato: vaso, barattolo, latta | marchi: Ortoc", sotto1: "Conserve", sotto2: "Ortaggi", unit: "kg" },
  { nome: "Peperoni Conserva", testo: "alias: peperoni arrostiti, peperoni sott'olio, Piquillo | varianti: al naturale, sott'olio, arrostiti | formato: vaso, barattolo, latta | marchi: Olmeda Origenes", sotto1: "Conserve", sotto2: "Ortaggi", unit: "kg" },
  { nome: "Capperi", testo: "alias: capperi in salamoia, capperi sotto sale, cucunci | varianti: in salamoia, in sale, sott'olio, in polvere, foglie | origine: Pantelleria IGP, Sicilia | formato: vaso, vasetto, busta, secchiello | marchi: Selecta", sotto1: "Conserve", sotto2: "Capperi", unit: "kg" },
  { nome: "Olive", testo: "varianti: verdi, nere, Taggiasche, Kalamata, Gordal, Chupadedos | sott'olio, in salamoia, denocciolate | formato: vaso, latta, barattolo | marchi: Olmeda Origenes, Selecta", sotto1: "Conserve", sotto2: "Olive", unit: "kg" },
  { nome: "Fagioli Conserva", testo: "alias: fagioli in scatola, fagioli borlotti, fagioli cannellini | varianti: borlotti, cannellini, neri, bianchi | al naturale | formato: latta, barattolo", sotto1: "Conserve", sotto2: "Legumi", unit: "kg" },
  { nome: "Ceci Conserva", testo: "alias: ceci in scatola, ceci al naturale | al naturale | formato: latta, barattolo", sotto1: "Conserve", sotto2: "Legumi", unit: "kg" },
  { nome: "Mais Conserva", testo: "alias: mais dolce in scatola, mais al naturale, ortoriso | al naturale | formato: latta, barattolo | marchi: Iposea", sotto1: "Conserve", sotto2: "Ortaggi", unit: "kg" },
  { nome: "Tonno Conserva", testo: "alias: tonno in scatola, tonno sott'olio, tonno al naturale | varianti: olio oliva, olio girasole, naturale, busta | formato: scatola 70g, 140g, 620g, 1730g, busta 1kg | marchi: Nostromo, Justfish, Amati, Donzela, Perlas, Orofish", sotto1: "Conserve", sotto2: "Pesce", unit: "kg" },
  { nome: "Acciughe Conserva", testo: "alias: alici sott'olio, acciughe in scatola, filetti acciughe | varianti: filetti sott'olio, sotto sale, pasta di acciughe | formato: latta, vaso, vasetto | marchi: Don Tonino, Rosalita, Cantabrico, R.C.E.", sotto1: "Conserve", sotto2: "Pesce", unit: "kg" },
  { nome: "Confettura", testo: "alias: marmellata, confettura di frutta, composta | varianti: albicocca, fragola, lampone, ciliegia, fico, mirtillo, arancia | formato: vaso, vasetto 110g | BIO | marchi: MonS, Gli Indispensabili", sotto1: "Conserve", sotto2: "Dolci", unit: "kg" },
  { nome: "Miele", testo: "varianti: castagno, ailanto, lavanda, millefiori, corbezzolo, acacia | BIO | formato: vasetto, vaso, secchiello | marchi: MonS, Thiercelin 1809", sotto1: "Conserve", sotto2: "Dolci", unit: "kg" },

  // ══════════════════════════════════════════════════════════════════════════
  // CONDIMENTI — OLI
  // ══════════════════════════════════════════════════════════════════════════

  { nome: "Olio EVO", testo: "alias: olio extravergine di oliva, olio evo | varianti: 100% italiano, UE, IGP Toscana, biologico, spray, monoporzione | formato: bottiglia 250ml, 500ml, 750ml, 1L, latta 5L, PET 5L, 10L, monoporzione | marchi: Coppini, David, Olitalia, F.Casale, Primoljo, Topfood, Meridiani, Favololio, Essenza", sotto1: "Condimenti", sotto2: "Olio", unit: "l" },
  { nome: "Olio Oliva", testo: "alias: olio di oliva, olio vergine | varianti: vergine, di sansa | formato: bottiglia 1L, latta 5L, PET 1L, 5L | marchi: David, F.Casale, Olitalia, Topfood", sotto1: "Condimenti", sotto2: "Olio", unit: "l" },
  { nome: "Olio Semi", testo: "alias: olio di semi, olio semi vari, olio girasole, olio arachidi, olio soia, olio mais, olio palma | varianti: girasole, arachidi, soia, mais, palma, alto oleico | formato: PET 1L, 5L, 10L, latta 25L | marchi: Olitalia, Desantis, S/Terra, Mediter", sotto1: "Condimenti", sotto2: "Olio", unit: "l" },
  { nome: "Olio Friggere", testo: "alias: olio per frittura, frienn | formato: latta 5L, 10L | marchi: Frienn, Friol, Frideal", sotto1: "Condimenti", sotto2: "Olio", unit: "l" },
  { nome: "Olio Nocciola", testo: "alias: olio di nocciola gastronomico | formato: bottiglia 250ml, 500ml | marchi: Selecta", sotto1: "Condimenti", sotto2: "Olio", unit: "l" },
  { nome: "Olio Sesamo", testo: "alias: olio di sesamo, sesame oil | formato: bottiglia 500ml | marchi: Thiercelin 1809, Selecta", sotto1: "Condimenti", sotto2: "Olio", unit: "l" },
  { nome: "Olio Argan", testo: "alias: olio di argan gastronomico | formato: bottiglia | marchi: Thiercelin 1809", sotto1: "Condimenti", sotto2: "Olio", unit: "l" },

  // ══════════════════════════════════════════════════════════════════════════
  // CONDIMENTI — ACETI
  // ══════════════════════════════════════════════════════════════════════════

  { nome: "Aceto Balsamico", testo: "alias: aceto balsamico di Modena IGP, aceto balsamico tradizionale | varianti: IGP, tradizionale 25 anni, spray, glassa | formato: bottiglia 250ml, 500ml, PET 5L | marchi: De Nigris, Cucinarte, DNT, De Nigris Mons", sotto1: "Condimenti", sotto2: "Aceto", unit: "l" },
  { nome: "Aceto Vino", testo: "alias: aceto di vino bianco, aceto di vino rosso, aceto di mele, aceto champagne | varianti: bianco, rosso, Chardonnay, Chianti, mele, Jerez, Lampone, Champagne | formato: bottiglia 250ml, 500ml, PET 1L | marchi: De Nigris, San Francesco, Verna, Agreste, Olmeda Origenes, Selecta", sotto1: "Condimenti", sotto2: "Aceto", unit: "l" },

  // ══════════════════════════════════════════════════════════════════════════
  // CONDIMENTI — SALSE E ALTRI
  // ══════════════════════════════════════════════════════════════════════════

  { nome: "Salsa di Soia", testo: "alias: soy sauce, shoyu, tamari, salsa di soia giapponese | varianti: classica, bianca, tamari, senza glutine | formato: bottiglia 500ml, 1L, 1,8L | marchi: Yamasa, Marusho, Thiercelin 1809", sotto1: "Condimenti", sotto2: "Salse Etniche", unit: "l" },
  { nome: "Mirin", testo: "alias: mirin giapponese, sake da cucina | formato: bottiglia | marchi: Marusho, Thiercelin 1809", sotto1: "Condimenti", sotto2: "Salse Etniche", unit: "l" },
  { nome: "Ponzu", testo: "alias: ponzu giapponese, champonzu, daidai ponzu | formato: bottiglia | marchi: Marusho", sotto1: "Condimenti", sotto2: "Salse Etniche", unit: "l" },
  { nome: "Wasabi", testo: "alias: wasabi in pasta, wasabi in polvere | formato: tubo, barattolo | marchi: Selecta", sotto1: "Condimenti", sotto2: "Salse Etniche", unit: "kg" },
  { nome: "Tahini", testo: "alias: pasta di sesamo, tahina | formato: vasetto, barattolo | marchi: Selecta", sotto1: "Condimenti", sotto2: "Salse Etniche", unit: "kg" },
  { nome: "Sriracha", testo: "alias: salsa piccante asiatica, chili sauce | formato: bottiglia | marchi: Selecta", sotto1: "Condimenti", sotto2: "Salse Etniche", unit: "l" },
  { nome: "Ketchup", testo: "alias: salsa ketchup, pomodoro ketchup | formato: bottiglia 1L, flacone, monoporzione | marchi: Heinz, Calvé", sotto1: "Condimenti", sotto2: "Salse", unit: "l" },
  { nome: "Maionese", testo: "varianti: classica, light, alle erbe | formato: secchio 5kg, barattolo, tubo, monoporzione | marchi: Calvé, Heinz", sotto1: "Condimenti", sotto2: "Salse", unit: "kg" },
  { nome: "Senape", testo: "varianti: Dijon, rustica con grani, all'aneto, allo zafferano, allo Yuzu | formato: vasetto 200g, secchiello 1kg, flacone 500g | marchi: Balik, Selecta, Thiercelin 1809", sotto1: "Condimenti", sotto2: "Salse", unit: "kg" },
  { nome: "Mostarda", testo: "alias: mostarda di frutta, salsa senapata | varianti: frutta mista, fichi, pere, limoni, cotogne | formato: vasetto, vaso | marchi: Gli Indispensabili, Selecta", sotto1: "Condimenti", sotto2: "Salse", unit: "kg" },
  { nome: "Salsa Worcestershire", testo: "alias: worcester, salsa inglese | formato: bottiglia | marchi: Lea & Perrins", sotto1: "Condimenti", sotto2: "Salse", unit: "l" },
  { nome: "Tabasco", testo: "alias: salsa piccante, hot sauce | formato: bottiglia | marchi: Tabasco", sotto1: "Condimenti", sotto2: "Salse", unit: "l" },
  { nome: "Tartufo Condimento", testo: "alias: crema di tartufo, salsa tartufata, condimento al tartufo, fette di tartufo | varianti: nero, bianco, estivo, scorzone | formato: vasetto, barattolo, vaso | marchi: Selecta", sotto1: "Condimenti", sotto2: "Tartufo", unit: "kg" },

  // ══════════════════════════════════════════════════════════════════════════
  // SECCHI — PASTA E RISO
  // ══════════════════════════════════════════════════════════════════════════

  { nome: "Pasta", testo: "varianti: spaghetti, rigatoni, penne, fusilli, tagliatelle, farfalle, linguine, bucatini, orecchiette, caserecce | formato: 500g, 1kg, 3kg, 5kg | BIO, semola, integrale | marchi: vari", sotto1: "Secchi", sotto2: "Pasta", unit: "kg" },
  { nome: "Riso", testo: "varianti: Carnaroli, Vialone Nano, Arborio, Basmati, Parboiled, profumato, sushi, nero glutinoso | DOP, IGP, BIO | formato: sacco 1kg, 5kg, 25kg, sacchetto di tela | origine: Veneto, Po Delta, Pakistan, Thailandia | marchi: Selecta", sotto1: "Secchi", sotto2: "Riso", unit: "kg" },
  { nome: "Farina", testo: "varianti: tipo 00, 0, 1, 2, integrale, di forza W220, W310, semola, farro, avena, ceci, mais, riso, grano saraceno, mandorle, nocciole, Kamut, 5 cereali | BIO, macinate a pietra | formato: sacco 1kg, 5kg, 25kg | marchi: Selecta", sotto1: "Secchi", sotto2: "Farina", unit: "kg" },
  { nome: "Legumi Secchi", testo: "varianti: ceci, fagioli borlotti, fagioli cannellini, lenticchie, cicerchia, roveja, fagiolo risina | BIO, DOP, IGP | formato: busta 500g, 1kg | marchi: Selecta", sotto1: "Secchi", sotto2: "Legumi", unit: "kg" },
  { nome: "Cereali", testo: "varianti: farro, orzo, quinoa bianca, quinoa rossa, quinoa nera, grano saraceno | BIO | formato: busta 500g, 1kg | marchi: Selecta, Thiercelin 1809", sotto1: "Secchi", sotto2: "Cereali", unit: "kg" },
  { nome: "Zucchero", testo: "varianti: bianco, di canna, muscovado, invertito, a velo, di canna grezzo | formato: sacco 1kg, 5kg, 25kg | marchi: vari", sotto1: "Secchi", sotto2: "Zucchero", unit: "kg" },
  { nome: "Sale", testo: "varianti: fino, grosso, marino, di rocca, Halen Môn, Kala Namak, affumicato, speziato, vanigliato | formato: barattolo, busta, sacco | marchi: Halen Môn, Thiercelin 1809, Selecta", sotto1: "Secchi", sotto2: "Sale", unit: "kg" },
  { nome: "Dado", testo: "alias: dado brodo, brodo granulare, brodo in polvere | varianti: manzo, pollo, verdure, pesce | formato: busta, barattolo, pz | marchi: Knorr, Star, Selecta fondi", sotto1: "Secchi", sotto2: "Brodi", unit: "pz" },
  { nome: "Lievito", testo: "alias: lievito in polvere, lievito per dolci, lievito secco, lievito istantaneo | varianti: chimico, secco, di birra secco | formato: bustina, barattolo, busta", sotto1: "Secchi", sotto2: "Lievito", unit: "kg" },
  { nome: "Amido", testo: "alias: amido di mais, maizena, fecola di patate, frumina | varianti: mais, patate, riso, tapioca | formato: busta, barattolo", sotto1: "Secchi", sotto2: "Addensanti", unit: "kg" },
  { nome: "Pane Grattugiato", testo: "alias: pangrattato, panko, pane grattato | varianti: classico, panko giapponese, integrale | formato: busta, sacchetto | marchi: Selecta Panko Thai", sotto1: "Secchi", sotto2: "Panatura", unit: "kg" },
  { nome: "Spezie", testo: "varianti: pepe nero, pepe bianco, pepe rosa, pepe verde, pepe Sichuan, curcuma, paprika, cumino, coriandolo, noce moscata, cannella, chiodi garofano, zafferano, anice stellato, cardamomo, curry, masala, Ras El Hanout | intera, macinata | formato: barattolo, busta, vasetto | marchi: Speziale, Thiercelin 1809, Selecta", sotto1: "Secchi", sotto2: "Spezie", unit: "kg" },
  { nome: "Vaniglia", testo: "alias: baccelli di vaniglia, estratto di vaniglia, pasta di vaniglia | varianti: Bourbon Madagascar, Tahiti | formato: baccello, estratto, pasta, polvere | marchi: Thiercelin 1809, Norohy, Selecta", sotto1: "Secchi", sotto2: "Spezie", unit: "kg" },

  // ══════════════════════════════════════════════════════════════════════════
  // BEVANDE ANALCOLICHE
  // ══════════════════════════════════════════════════════════════════════════

  { nome: "Acqua Minerale", testo: "varianti: naturale, frizzante, effervescente naturale | formato: PET 0,5L, 1,5L, CT 6x1,5L, CT 24x50cl | marchi: S.Benedetto, Guizza, Ecogreen, Soleila", sotto1: "Bevande analcoliche", sotto2: "Acqua", unit: "l" },
  { nome: "Bibite", testo: "alias: bevanda gassata, soft drink | varianti: Coca Cola, Fanta, Sprite, Pepsi, chinotto, aranciata, limonata, tonica | formato: lattina 33cl, PET 1,5L, CT 24x33cl | marchi: Coca Cola, Schweppes, S.Benedetto, Lemonsoda", sotto1: "Bevande analcoliche", sotto2: "Bibite", unit: "l" },
  { nome: "Succo Frutta", testo: "alias: succo di frutta, succo polpa, nettare | varianti: arancia, pesca, pera, albicocca, ACE, ananas | formato: brick 200ml, bottiglia 1L, CT 8x1L | marchi: GDS, Boero", sotto1: "Bevande analcoliche", sotto2: "Succhi", unit: "l" },
  { nome: "The", testo: "alias: tè, ice tea, bevanda al tè | varianti: limone, pesca, verde | formato: lattina 33cl, PET 1,5L, brick 200ml | marchi: Estathé, Lipton, S.Benedetto", sotto1: "Bevande analcoliche", sotto2: "Bibite", unit: "l" },
  { nome: "Sciroppo", testo: "alias: sciroppo bar, mixyfruit | varianti: amarena, fragola, lampone, granatina, latte mandorle, zucchero, zucchero di canna, menta, arancia | formato: bottiglia 750ml, 1,25kg, 1,3kg | marchi: Fabbri, Toschi, Boero", sotto1: "Bevande analcoliche", sotto2: "Sciroppi", unit: "l" },
  { nome: "Bevanda Soia", testo: "alias: latte di soia, bevanda avena, latte vegetale | varianti: soia, avena, mandorla, riso | formato: bottiglia 1L, brick 500ml | marchi: Alpro, Orasi", sotto1: "Bevande analcoliche", sotto2: "Bevande Vegetali", unit: "l" },
  { nome: "Energy Drink", testo: "alias: energy drink, bevanda energetica | varianti: classica | formato: lattina 250ml, CT 24x250ml | marchi: Red Bull", sotto1: "Bevande analcoliche", sotto2: "Bibite", unit: "l" },

  // ══════════════════════════════════════════════════════════════════════════
  // BEVANDE ALCOLICHE
  // ══════════════════════════════════════════════════════════════════════════

  { nome: "Birra", testo: "varianti: lager, pilsner, IPA, weizen, rossa, senza glutine, artigianale | formato: bottiglia 33cl, 50cl, 66cl, lattina 33cl, CT 24x33cl | marchi: Moretti, Heineken, Beck's, Peroni, Ichnusa, Menabrea, Tennent's, Asahi, Sapporo, Ceres, Daura, Bitburger", sotto1: "Bevande alcoliche", sotto2: "Birra", unit: "l" },
  { nome: "Vino da Cucina", testo: "alias: vino per cucinare, vino sfuso, Marsala, vino bianco cucina, vino rosso cucina | varianti: bianco, rosso, Marsala, brik | formato: brik, bottiglia, fusto | marchi: vari", sotto1: "Bevande alcoliche", sotto2: "Vino", unit: "l" },
  { nome: "Porto", testo: "alias: vino di Porto, porto Ruby, porto White | varianti: Ruby, White, Tawny | formato: bottiglia 75cl | marchi: Sandeman", sotto1: "Bevande alcoliche", sotto2: "Vini Liquorosi", unit: "l" },

  // ══════════════════════════════════════════════════════════════════════════
  // SUPERALCOLICI
  // ══════════════════════════════════════════════════════════════════════════

  { nome: "Rum", testo: "varianti: bianco, scuro, invecchiato | formato: bottiglia 70cl, 1L | marchi: vari", sotto1: "Superalcolici", sotto2: "Rum", unit: "l" },
  { nome: "Grappa", testo: "varianti: giovane, invecchiata, aromatica | formato: bottiglia 70cl | marchi: vari", sotto1: "Superalcolici", sotto2: "Grappa", unit: "l" },
  { nome: "Brandy", testo: "alias: cognac, Armagnac | formato: bottiglia 70cl | marchi: vari", sotto1: "Superalcolici", sotto2: "Brandy", unit: "l" },
  { nome: "Amaro", testo: "alias: liquore amaro, aperitivo | varianti: classico, alle erbe | formato: bottiglia 70cl, 1L | marchi: vari", sotto1: "Superalcolici", sotto2: "Amaro", unit: "l" },
  { nome: "Liquore", testo: "varianti: limoncello, arancello, fragolino, nocino, sambuca, amaretto | formato: bottiglia 70cl, 1L | marchi: vari", sotto1: "Superalcolici", sotto2: "Liquore", unit: "l" },
  { nome: "Alcool", testo: "alias: alcool puro, alcool alimentare, alcool etilico | formato: bottiglia, fusto | uso: pasticceria, conserve, fiamme", sotto1: "Superalcolici", sotto2: "Alcool", unit: "l" },

  // ══════════════════════════════════════════════════════════════════════════
  // DETERSIVI E PRODOTTI PULIZIA
  // ══════════════════════════════════════════════════════════════════════════

  // ── PRODOTTI PULIZIA CUCINA ──────────────────────────────────────────────────
  { nome: "Detersivo Lavastoviglie", testo: "alias: lavastoviglie liquido, deterg.lavast, gel lavastoviglie, deterg.clorato lavast | formato: tanica 6kg, 12kg, flacone | marchi: MARR, CIF, vari", sotto1: "Detersivi", sotto2: "Pulizia Cucina", unit: "kg" },
  { nome: "Disincrostante", testo: "alias: disincrostante lavastoviglie, detart, anticalcare lavastoviglie, jonmatic anticalc | formato: tanica 5L, 6kg | marchi: MARR, Jonmatic", sotto1: "Detersivi", sotto2: "Pulizia Cucina", unit: "l" },
  { nome: "Brillantante", testo: "alias: brillantante lavastoviglie, sgocciolatante | formato: tanica 5kg | marchi: MARR", sotto1: "Detersivi", sotto2: "Pulizia Cucina", unit: "kg" },
  { nome: "Sgrassatore", testo: "alias: sgrassatore cucina, sgrassatore marsiglia, sgrass cleaner, deterg.mult.cucina, pulitutto igieniz, detergente multiuso cucina, CIF sgrassatore | formato: flacone 750ml, tanica 5L | marchi: CIF, SAI, MARR, G8", sotto1: "Detersivi", sotto2: "Pulizia Cucina", unit: "l" },
  { nome: "Detersivo Pavimenti", testo: "alias: deterg.pavim, nettapavimenti, floor surface, Xense | formato: tanica 5L, flacone | marchi: MARR, Xense, vari", sotto1: "Detersivi", sotto2: "Pulizia Ambienti", unit: "l" },
  { nome: "Detergente Idroalcolico", testo: "alias: det.idroalcol, alcol igienizzante, igienizzante superfici, ALO33 | formato: flacone 750ml, tanica | marchi: MARR, vari", sotto1: "Detersivi", sotto2: "Igiene Ambienti", unit: "l" },
  { nome: "Candeggina", testo: "alias: candeggiante cloro, candeggina profumata, ipoclorito di sodio, varechina, CIF gel candeggina | formato: bottiglia 2L, 2,5L, 5kg | marchi: MARR, SAI, CIF, Scala", sotto1: "Detersivi", sotto2: "Pulizia Ambienti", unit: "l" },
  { nome: "Ammorbidente", testo: "alias: ammorbidente bucato | formato: tanica 4kg | marchi: MARR", sotto1: "Detersivi", sotto2: "Bucato", unit: "kg" },
  { nome: "Anticalcare", testo: "alias: anticalcare bagno, CIF anticalcare, rimozione calcare | formato: flacone 1L | marchi: CIF", sotto1: "Detersivi", sotto2: "Pulizia Ambienti", unit: "l" },

  // ── IGIENE PERSONALE ──────────────────────────────────────────────────────
  { nome: "Sapone Mani", testo: "alias: sapone liquido mani, gel igienizzante mani, saponette hotel | varianti: liquido, gel, solido | formato: flacone 1L, 5L, 500ml, saponetta | marchi: MARR, Milmil, Daily, Flowpack", sotto1: "Detersivi", sotto2: "Igiene Personale", unit: "l" },
  { nome: "Guanti", testo: "alias: guanti lattice, guanti nitrile, guanti vinile | varianti: lattice, nitrile neri, vinile, monouso | taglie: S, M, L, XL | formato: scatola 10pz, 100pz | marchi: Contract, Reflex, Solo", sotto1: "Detersivi", sotto2: "Igiene Personale", unit: "pz" },

  // ── SPUGNE E STRACCI ─────────────────────────────────────────────────────
  { nome: "Spugna", testo: "alias: spugna abrasiva, spugna acciaio, spugna cucina, pannospugna | varianti: abrasiva, acciaio, accoppiata | formato: pz, confezione 10pz, 25pz | marchi: Vileda, Arix, Astree, Spongyl", sotto1: "Detersivi", sotto2: "Pulizia Cucina", unit: "pz" },
  { nome: "Strofinaccio", testo: "alias: strofinaccio asciugapiatti, strofinaccio scozia, canovaccio | formato: pz, confezione 10pz, 50x70cm, 45x60cm | marchi: vari", sotto1: "Detersivi", sotto2: "Pulizia Cucina", unit: "pz" },

  // ── CARTA E IMBALLAGGI ───────────────────────────────────────────────────
  { nome: "Carta Igienica", testo: "alias: carta ig, rotoli carta igienica, carta interfoliata, jumbo, mini jumbo, carta igienica everyday | varianti: 2 veli, 3 veli, jumbo 300m, mini 150m, intercalata | formato: rotolo, confezione 4pz, 8pz, 10pz, pacco 24pz | marchi: Everyday, Bliss", sotto1: "Detersivi", sotto2: "Carta", unit: "pz" },
  { nome: "Tovaglia", testo: "alias: tovaglietta carta, tovagliolo carta, tovaglia rotolo | varianti: 100x100, 30x40, 35x50 | formato: rotolo 50m, confezione 100pz, 250pz | marchi: vari | bianca", sotto1: "Detersivi", sotto2: "Carta", unit: "pz" },
  { nome: "Pellicola", testo: "alias: pellicola trasparente, pellicola PVC, film alimentare, pellicola microonde | varianti: PVC, microonde, trasparente | formato: rotolo 300m, 450mm H | marchi: vari | AST", sotto1: "Detersivi", sotto2: "Imballaggi", unit: "pz" },
  { nome: "Sacchi Immondizia", testo: "alias: sacchi neri, sacchi biodegradabili, sacchi azzurri, sacchi gialli, sacchi neutri | varianti: neri, biodegradabili, colorati | formato: rotolo 10pz, 20pz, 30pz | dimensioni: 45x55, 55x70, 70x110, 75x110, 90x120, 92x105 | marchi: vari", sotto1: "Detersivi", sotto2: "Imballaggi", unit: "pz" },
  { nome: "Carta Forno", testo: "alias: carta da forno, carta antiaderente, cartaforno | formato: rotolo, fogli | marchi: vari", sotto1: "Detersivi", sotto2: "Imballaggi", unit: "pz" },
  { nome: "Carta Alluminio", testo: "alias: carta stagnola, foglio alluminio, alluminio alimentare | formato: rotolo | marchi: vari", sotto1: "Detersivi", sotto2: "Imballaggi", unit: "pz" },

  // ── PULIZIA PROFESSIONALE ─────────────────────────────────────────────────
  { nome: "Deodorante Ambiente", testo: "alias: deodorante, deodoforante, profumatore ambiente, air freshener, deofor, deodorante wc, deodorante cucina, deodorante pavimenti | varianti: spray, liquido, solido, WC, cucina, ambienti | formato: flacone, barattolo | marchi: vari", sotto1: "Detersivi", sotto2: "Igiene Ambienti", unit: "pz" },
  { nome: "Detergente WC", testo: "alias: detergente bagno, gel wc, anticalcare wc, ducale wc, net wc | varianti: gel, liquido, tavoletta | formato: flacone, flacone curvo | marchi: vari", sotto1: "Detersivi", sotto2: "Pulizia Ambienti", unit: "l" },
  { nome: "Detergente Inox", testo: "alias: lucido inox, lucidante acciaio inox, pulitore inox, nettainox | formato: flacone, spray | marchi: vari", sotto1: "Detersivi", sotto2: "Pulizia Cucina", unit: "l" },
  { nome: "Caustica", testo: "alias: soda caustica, detergente caustificante, decapante forni, pulisci forno caustico, detergente alcalino forno, Rational | varianti: gel, liquida, in pastiglie | formato: tanica, flacone, pastiglie | marchi: Rational, vari", sotto1: "Detersivi", sotto2: "Pulizia Cucina", unit: "kg" },
  { nome: "Detergente Forno", testo: "alias: pulisci forno, detergente forni, desgrassante forno, rational tabs, rational liquido | varianti: spray, liquido, pastiglie, tab | formato: flacone, confezione pastiglie | marchi: Rational, vari", sotto1: "Detersivi", sotto2: "Pulizia Cucina", unit: "pz" },
  { nome: "Lucido Superfici", testo: "alias: lucido multiuso, lucidante superfici, cera pavimenti | formato: flacone, tanica | marchi: vari", sotto1: "Detersivi", sotto2: "Pulizia Ambienti", unit: "l" },

  // ── ATTREZZATURE PULIZIA ─────────────────────────────────────────────────
  { nome: "Secchio", testo: "alias: secchio pulizie, secchio con strizzatore, secchio plastica | varianti: con strizzatore, senza, doppio | formato: 10L, 15L, 25L | marchi: vari", sotto1: "Detersivi", sotto2: "Attrezzature", unit: "pz" },
  { nome: "Mocio", testo: "alias: mop, mocio lavapavimenti, frange mocio, ricambio mocio | varianti: cotone, microfibra, ricambio | formato: pz | marchi: Vileda, vari", sotto1: "Detersivi", sotto2: "Attrezzature", unit: "pz" },
  { nome: "Scopa", testo: "alias: scopa, spazzolone, granata, spazzolone pavimenti | varianti: classica, con manico, raccoglipolvere | formato: pz | marchi: vari", sotto1: "Detersivi", sotto2: "Attrezzature", unit: "pz" },
  { nome: "Carta Asciugamani", testo: "alias: carta mani, asciugamani carta, carta interfogliata, carta rotolo, carta bobina | varianti: Z-fold, interfogliata, rotolo, bobina | formato: confezione, pacco | marchi: Everyday, vari", sotto1: "Detersivi", sotto2: "Carta", unit: "pz" },

  // ── Frutta Secca e Granelle ───────────────────────────────────────────────
  { nome: "Nocciole", testo: "alias: nocciola, noccioline, nocciole pelate, nocciole tostate, nocciole intere, nocciole tritate, granella nocciole, nocciole pelate tostate, hazelnut | marchi: Melandri, Borges, Senna | formato: 1kg, 500g, 5kg", sotto1: "Frutta Secca", sotto2: "", unit: "kg" },
  { nome: "Mandorle", testo: "alias: mandorla, mandorle pelate, mandorle tostate, mandorle intere, granella mandorle, almond | formato: 1kg, 500g", sotto1: "Frutta Secca", sotto2: "", unit: "kg" },
  { nome: "Pistacchi", testo: "alias: pistacchio, pistacchi sgusciati, granella pistacchio, pistacchi pelati, granella pistacchio 2/4, pistachio | formato: 1kg, 500g", sotto1: "Frutta Secca", sotto2: "", unit: "kg" },
  { nome: "Pinoli", testo: "alias: pinolo, pinoli italiani, pine nut | formato: 500g, 1kg", sotto1: "Frutta Secca", sotto2: "", unit: "kg" },
  { nome: "Noci", testo: "alias: noce, noci sgusciate, noci intere, noci tritate, walnut | formato: 1kg", sotto1: "Frutta Secca", sotto2: "", unit: "kg" },
  { nome: "Uvetta", testo: "alias: uvetta sultanina, uva passa, raisin, sultana | formato: 1kg, 500g", sotto1: "Frutta Secca", sotto2: "", unit: "kg" },
  // ── Legumi Secchi ─────────────────────────────────────────────────────────
  { nome: "Ceci Secchi", testo: "alias: ceci, ceci secchi, chickpeas, ceci melandri, garbanzo | formato: 1kg, 2.5kg, 5kg | marchi: Melandri", sotto1: "Legumi Secchi", sotto2: "", unit: "kg" },
  { nome: "Lenticchie Secche", testo: "alias: lenticchia, lenticchie, lentils | formato: 1kg, 5kg", sotto1: "Legumi Secchi", sotto2: "", unit: "kg" },
  { nome: "Fagioli Secchi", testo: "alias: fagiolo secco, fagioli borlotti secchi, fagioli cannellini secchi, cannellini | formato: 1kg, 5kg", sotto1: "Legumi Secchi", sotto2: "", unit: "kg" },
  // ── Dolci Secchi ──────────────────────────────────────────────────────────
  { nome: "Amaretti", testo: "alias: amaretto, biscotto amaretto, amaretti morbidi, amaretti secchi, amaretti bonomi, amaretti lazzaroni | marchi: Bonomi, Lazzaroni | formato: 200g, 300g, 400g, 1kg", sotto1: "Dolci Secchi", sotto2: "", unit: "pz" },
  { nome: "Savoiardi", testo: "alias: savoiardo, lady finger, biscotto savoiardo | marchi: Vicenzi, Balocco | formato: 200g, 400g", sotto1: "Dolci Secchi", sotto2: "", unit: "pz" },
  { nome: "Biscotti Secchi", testo: "alias: biscotto, cantucci, cantuccini, brutti ma buoni, frollino | formato: 200g, 1kg", sotto1: "Dolci Secchi", sotto2: "", unit: "pz" },
  // ── Conserve Vegetali ─────────────────────────────────────────────────────
  { nome: "Capperi Sottaceto", testo: "alias: cappero, capperi, caper, frutti cappero, frutti capperi, capperi aceto, frutti cappero aceto, capperi sotto aceto | formato: 690g, 1kg, 3kg | marchi: Sacla", sotto1: "Conserve", sotto2: "Capperi", unit: "kg" },
  { nome: "Peperoni Arrostiti Conserva", testo: "alias: peperoni grigliati, peperoni arrosto, peperoni arrostiti, peperoni natura, peperoni rossi arrosto, peperoni arr nat | marchi: Greci, Sacla, Natura | formato: 2.6kg, 3kg", sotto1: "Conserve", sotto2: "Verdure", unit: "kg" },
]

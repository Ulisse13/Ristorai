// ─────────────────────────────────────────────────────────────────────────────
// foodDB_fruttaverdura.js — Database FRUTTA E VERDURA per Ristorai
// Struttura: nome (matching) + testo (varianti) + sotto1/sotto2 + unit
// Fonti: catalogo MARR + catalogo Selecta
// ─────────────────────────────────────────────────────────────────────────────

export const FRUTTAVERDURA_DB = [

  // ══════════════════════════════════════════════════════════════════════════
  // AGRUMI
  // ══════════════════════════════════════════════════════════════════════════

  { nome: "Arancia", testo: "alias: arancia fresca, arance fresche, arancia tarocco fresca, arancia navel fresca, arance cassetta | varianti: rossa, navel, tarocco, moro, sanguinella, bionda | origine: Sicilia, Calabria, Spagna, Marocco | calibri: 57/67, 67/82, 82/102 | BIO | cassetta, busta", sotto1: "Frutta", sotto2: "", unit: "kg" },
  { nome: "Limone", testo: "alias: limone fresco, limoni freschi, limone sfusato, verdello fresco, limone di Amalfi fresco, limone di Sorrento fresco, limoni cassetta | varianti: sfusato, verdello, di Amalfi, di Sorrento | origine: Sicilia, Campania, Spagna, Argentina | calibri: 40/48, 48/56, 56/64 | BIO | cassetta, busta, plateau", sotto1: "Frutta", sotto2: "", unit: "kg" },
  { nome: "Mandarino", testo: "alias: clementina, mandarancio, tangerina | varianti: clementine senza semi, tardivi | origine: Sicilia, Calabria, Spagna | calibri: 1, 2, 3, 4 | BIO | cassetta", sotto1: "Frutta", sotto2: "", unit: "kg" },
  { nome: "Pompelmo", testo: "alias: grapefruit | varianti: giallo, rosa, rosso | origine: Israele, Spagna, USA | calibri: 32/40, 40/48 | cassetta", sotto1: "Frutta", sotto2: "", unit: "kg" },
  { nome: "Lime", testo: "alias: limette, lime verde | origine: Messico, Brasile, Persia | BIO | busta, cassetta", sotto1: "Frutta", sotto2: "", unit: "kg" },
  { nome: "Bergamotto", testo: "origine: Calabria | fresco, stagionale | cassetta", sotto1: "Frutta", sotto2: "", unit: "kg" },

  // ══════════════════════════════════════════════════════════════════════════
  // MELE E PERE
  // ══════════════════════════════════════════════════════════════════════════

  { nome: "Mela", testo: "varianti: Golden, Fuji, Granny Smith, Gala, Renetta, Pink Lady, Royal Gala, Annurca, Fuji, Cosmic | origine: Trentino, Val di Non, Emilia, Cile, Francia | calibri: 60/65, 65/70, 70/75, 75/80 | BIO | cassetta, busta", sotto1: "Frutta", sotto2: "", unit: "kg" },
  { nome: "Pera", testo: "varianti: Williams, Conference, Kaiser, Abate, Coscia, Decana, Passa Crassana | origine: Emilia, Veneto, Francia, Belgio | calibri: 55/60, 60/65, 65/70, 70/75 | BIO | cassetta", sotto1: "Frutta", sotto2: "", unit: "kg" },

  // ══════════════════════════════════════════════════════════════════════════
  // FRUTTA ESTIVA E DRUPE
  // ══════════════════════════════════════════════════════════════════════════

  { nome: "Pesca", testo: "alias: pesca fresca, pesche fresche, nettarina fresca, pesca noce fresca, pesca percoca fresca | varianti: gialla, bianca, saturnina, percoca | origine: Emilia, Veneto, Campania, Spagna | calibri: A, AA, B, C | BIO | cassetta, busta", sotto1: "Frutta", sotto2: "", unit: "kg" },
  { nome: "Albicocca", testo: "varianti: del Vesuvio, Pavan, Goldrich, Orangered | origine: Campania, Emilia, Spagna | calibri: 40/45, 45/50, 50/55, 55/60 | BIO | cassetta, busta", sotto1: "Frutta", sotto2: "", unit: "kg" },
  { nome: "Ciliegia", testo: "varianti: Ferrovia, Marasca, Bigarreau, amarena, mora | origine: Puglia, Emilia, Vignola, Spagna, Cile | calibri: 24/26, 26/28, 28/32 | BIO | cassetta, vaschetta", sotto1: "Frutta", sotto2: "", unit: "kg" },
  { nome: "Susina", testo: "alias: prugna | varianti: Stanley, Regina Claudia, Mirabella, nera, rossa | origine: Emilia, Francia | calibri: vari | BIO | cassetta, busta", sotto1: "Frutta", sotto2: "", unit: "kg" },
  { nome: "Fragola", testo: "alias: fragola fresca, fragole fresche, fragolina di bosco, fragole vaschetta, fragoline di bosco fresche | varianti: Candonga, Elsanta, Alba, Camarosa, Sabrina | origine: Campania, Sicilia, Spagna, Olanda, serra | calibri: 18/22, 22/28, 28/35 | BIO | vaschetta, plateau", sotto1: "Frutta", sotto2: "", unit: "kg" },

  // ══════════════════════════════════════════════════════════════════════════
  // FRUTTI DI BOSCO
  // ══════════════════════════════════════════════════════════════════════════

  { nome: "Lampone", testo: "alias: lampone fresco, lamponi freschi, lamponi vaschetta | varianti: rosso, giallo | origine: Olanda, Polonia, Cile, serra | BIO | vaschetta, plateau | Marius Auda", sotto1: "Frutta", sotto2: "", unit: "kg" },
  { nome: "Mirtillo", testo: "alias: mirtillo fresco, mirtilli freschi, blueberry freschi, mirtillo rosso fresco | varianti: nero, rosso, americano | origine: Olanda, Polonia, Cile, Perù | BIO | vaschetta, plateau | Marius Auda", sotto1: "Frutta", sotto2: "", unit: "kg" },
  { nome: "Mora", testo: "alias: mora di rovo, blackberry | origine: Olanda, Cile | BIO | vaschetta, plateau", sotto1: "Frutta", sotto2: "", unit: "kg" },
  { nome: "Ribes", testo: "varianti: rosso, nero, bianco | origine: Olanda, Polonia | BIO | vaschetta, plateau", sotto1: "Frutta", sotto2: "", unit: "kg" },
  { nome: "Uva", testo: "varianti: bianca, nera, rossa, fragola, Italia, Victoria, Sultanina, Moscato, Red Globe | origine: Puglia, Sicilia, Spagna, Cile, Sudafrica | calibri: da tavola, con semi, senza semi | BIO | cassetta, busta, plateau", sotto1: "Frutta", sotto2: "", unit: "kg" },

  // ══════════════════════════════════════════════════════════════════════════
  // FRUTTA TROPICALE ED ESOTICA
  // ══════════════════════════════════════════════════════════════════════════

  { nome: "Banana", testo: "varianti: Cavendish, nana, verde, matura | origine: Ecuador, Colombia, Costa Rica | calibri: Extra, Cat I, Cat II | BIO | cartone, busta", sotto1: "Frutta", sotto2: "", unit: "kg" },
  { nome: "Ananas", testo: "varianti: Gold, MD2, Baby, fresh cut | origine: Costa Rica, Ghana, Benin | calibri: 5, 6, 7, 8, 9, 10, 12 | BIO | cartone, busta", sotto1: "Frutta", sotto2: "", unit: "kg" },
  { nome: "Mango", testo: "alias: mango fresco, manghi freschi, mango Kent fresco, mango maturo | varianti: Kent, Ataulfo, Keitt, Tommy Atkins | origine: Perù, Brasile, Costa d'Avorio, Spagna | calibri: 8, 10, 12 | BIO | cartone", sotto1: "Frutta", sotto2: "", unit: "kg" },
  { nome: "Avocado", testo: "varianti: Hass, Fuerte, Reed | origine: Spagna, Perù, Messico, Sudafrica | calibri: 10, 12, 14, 16, 18 | BIO | cartone, busta, plateau", sotto1: "Frutta", sotto2: "", unit: "kg" },
  { nome: "Kiwi", testo: "varianti: verde, giallo Gold, Hayward | origine: Lazio, Piemonte, Nuova Zelanda, Cile | calibri: 25, 30, 33, 36, 42 | BIO | plateau, cassetta", sotto1: "Frutta", sotto2: "", unit: "kg" },
  { nome: "Melograno", testo: "varianti: Wonderful, Acco | origine: Israele, Spagna, Turchia | calibri: vari | BIO | cartone", sotto1: "Frutta", sotto2: "", unit: "kg" },
  { nome: "Melone", testo: "varianti: Cantalupo, retato, giallo, Honeydew, Charentais, invernale | origine: Sicilia, Puglia, Spagna, Marocco, Olanda | calibri: 1350, 1500, 1800, 2000 | BIO | cassetta, plateau", sotto1: "Frutta", sotto2: "", unit: "kg" },
  { nome: "Cocomero", testo: "alias: anguria | varianti: con semi, senza semi, mini, a fette | origine: Sicilia, Puglia, Spagna | calibri: 5/8kg, 8/10kg, 10+ | BIO | sfuso, cassetta", sotto1: "Frutta", sotto2: "", unit: "kg" },
  { nome: "Fico", testo: "varianti: verde, nero, di India | origine: Puglia, Sicilia | BIO | vaschetta, plateau", sotto1: "Frutta", sotto2: "", unit: "kg" },
  { nome: "Physalis", testo: "alias: alchechengi, cape gooseberry | vaschetta, plateau | Marius Auda | BIO", sotto1: "Frutta", sotto2: "", unit: "kg" },
  { nome: "Maracuja", testo: "alias: frutto della passione, passion fruit | varianti: giallo, viola | BIO | vaschetta, cartone", sotto1: "Frutta", sotto2: "", unit: "kg" },
  { nome: "Finger Lime", testo: "alias: lime australiano, caviale di lime | Marius Auda | plateau, vaschetta", sotto1: "Frutta", sotto2: "", unit: "kg" },

  // ══════════════════════════════════════════════════════════════════════════
  // POMODORI
  // ══════════════════════════════════════════════════════════════════════════

  { nome: "Pomodoro", testo: "alias: pomodoro fresco, pomodori freschi, pomodorino fresco, ciliegino fresco, datterino fresco, pomodoro san marzano fresco, pomodoro pachino fresco, pomodoro grappolo fresco, pomodori cassetta | varianti: San Marzano, ciliegino, cherry, datterino, cuore di bue, costoluto, Pachino IGP, Piccadilly, Camone, Raf, tondo liscio, grappolo | origine: Sicilia, Campania, Puglia, Olanda, Spagna, serra | calibri: 47/57, 57/67, 67/82, 82/102 | BIO | cassetta, busta, plateau, vaschetta | mini, pomodorino", sotto1: "Verdure", sotto2: "", unit: "kg" },

  // ══════════════════════════════════════════════════════════════════════════
  // INSALATE E FOGLIE
  // ══════════════════════════════════════════════════════════════════════════

  { nome: "Lattuga", testo: "alias: insalata, Iceberg, Romana, Gentile, Canasta, Glaciale, Sucrine | origine: Veneto, Lazio, Spagna, Olanda, serra | BIO | cassetta, busta, vaschetta | cuori, testa intera | Marius Auda", sotto1: "Verdure", sotto2: "", unit: "kg" },
  { nome: "Radicchio", testo: "varianti: rosso di Treviso, di Chioggia, variegato di Castelfranco, tardivo | origine: Veneto | BIO | cassetta, vaschetta", sotto1: "Verdure", sotto2: "", unit: "kg" },
  { nome: "Rucola", testo: "varianti: coltivata, selvatica | origine: Puglia, Campania, Olanda, serra | BIO | busta, vaschetta, plateau | Marius Auda", sotto1: "Verdure", sotto2: "", unit: "kg" },
  { nome: "Spinaci", testo: "alias: spinacio | varianti: baby spinaci, foglie intere, da cuocere | origine: Veneto, Puglia, Olanda, serra | BIO | busta, vaschetta | Marius Auda", sotto1: "Verdure", sotto2: "", unit: "kg" },
  { nome: "Misticanza", testo: "alias: mix insalate, insalatina, mesclun | varianti: primaverile, estiva, autunnale, baby leaf | BIO | busta, vaschetta, cassa | Marius Auda", sotto1: "Verdure", sotto2: "", unit: "kg" },
  { nome: "Bietola", testo: "alias: bietole, bietola da coste, coste, Red Chard | varianti: da coste, da foglia, rossa | BIO | busta, mazzo | Marius Auda", sotto1: "Verdure", sotto2: "", unit: "kg" },
  { nome: "Cicoria", testo: "alias: catalogna, puntarelle, indivia, scarola | varianti: catalogna frastagliata, puntarelle | origine: Lazio, Puglia | BIO | mazzo, cassetta", sotto1: "Verdure", sotto2: "", unit: "kg" },
  { nome: "Cavolo", testo: "alias: cavolo cappuccio, cavolo nero, verza, cavolo rosso, cavolo di Bruxelles, Pak choi, Bok choy | varianti: bianco, rosso, verde, nero, toscano, Savoy | BIO | cassetta, mezza testa, testa intera | Marius Auda", sotto1: "Verdure", sotto2: "", unit: "kg" },

  // ══════════════════════════════════════════════════════════════════════════
  // CRUCIFERE
  // ══════════════════════════════════════════════════════════════════════════

  { nome: "Broccolo", testo: "alias: broccoli, broccoletti, cime di rapa, broccolo romanesco | varianti: verde, romanesco | origine: Campania, Puglia, Sicilia, Spagna | BIO | cassetta, mazzo | mini broccoli Selecta", sotto1: "Verdure", sotto2: "", unit: "kg" },
  { nome: "Cavolfiore", testo: "varianti: bianco, viola, romanesco, giallo | origine: Puglia, Sicilia, Francia | BIO | cassetta, sfuso", sotto1: "Verdure", sotto2: "", unit: "kg" },

  // ══════════════════════════════════════════════════════════════════════════
  // ZUCCHINE E MELANZANE
  // ══════════════════════════════════════════════════════════════════════════

  { nome: "Zucchina", testo: "alias: zucchine, zucchino | varianti: verde, gialla, romana, tonda, mini | origine: Campania, Sicilia, Spagna, serra | calibri: 14/21, 21/28, 28/35 | BIO | cassetta, busta, vaschetta | fiori di zucca", sotto1: "Verdure", sotto2: "", unit: "kg" },
  { nome: "Melanzana", testo: "varianti: tonda, lunga, striata, viola, mini | origine: Campania, Sicilia, Spagna, serra | calibri: 150/250g, 250/350g, 350+ | BIO | cassetta, busta, vaschetta", sotto1: "Verdure", sotto2: "", unit: "kg" },

  // ══════════════════════════════════════════════════════════════════════════
  // PEPERONI E PEPERONCINI
  // ══════════════════════════════════════════════════════════════════════════

  { nome: "Peperone", testo: "varianti: rosso, giallo, verde, arancione, Friggitello, Corno, Tinkerbell, Piquillo | origine: Olanda, Spagna, Puglia, Sicilia, serra | calibri: L, M, XL, 150/250g | BIO | cassetta, busta, plateau | Olmeda Origenes", sotto1: "Verdure", sotto2: "", unit: "kg" },
  { nome: "Peperoncino", testo: "alias: friggitelli, peperoncino piccante | varianti: dolce, piccante, Urfa, Chipotle | origine: Calabria, Puglia, Spagna | BIO | mazzo, busta, vasetto", sotto1: "Verdure", sotto2: "", unit: "kg" },

  // ══════════════════════════════════════════════════════════════════════════
  // CIPOLLE E AFFINI
  // ══════════════════════════════════════════════════════════════════════════

  { nome: "Cipolla", testo: "alias: cipolla fresca, cipolle fresche, cipollotto fresco, cipolla novella fresca | varianti: bianca, rossa, dorata, Borettana, cipollotto, novella | origine: Puglia, Sicilia, Spagna, Egitto | calibri: 40/60, 60/80, 80/100 | BIO | cassetta, busta, rete | mini Selecta", sotto1: "Verdure", sotto2: "", unit: "kg" },
  { nome: "Aglio", testo: "alias: aglio fresco, aglio bianco fresco, aglio rosa fresco, testa d'aglio fresca, spicchi d'aglio freschi | varianti: bianco, rosa, nero fermentato, di Sulmona, testa, spicchi | origine: Campania, Spagna, Cina | BIO | treccia, rete, busta, testa | Nero di Voghiera", sotto1: "Verdure", sotto2: "", unit: "kg" },
  { nome: "Scalogno", testo: "alias: shallot | varianti: lungo, tondo | origine: Francia, Olanda | BIO | rete, busta", sotto1: "Verdure", sotto2: "", unit: "kg" },
  { nome: "Porro", testo: "alias: porri | varianti: gigante, mini, baby | origine: Veneto, Campania, Olanda | BIO | mazzo, cassetta | Marius Auda mini", sotto1: "Verdure", sotto2: "", unit: "kg" },

  // ══════════════════════════════════════════════════════════════════════════
  // TUBERI E RADICI
  // ══════════════════════════════════════════════════════════════════════════

  { nome: "Patata", testo: "alias: patate | varianti: comune, novella, rossa, gialla, viola, Vitelotte, dolce/batata, Cheyenne, Fine de Ratte, Ratte | origine: Puglia, Campania, Olanda, Egitto | calibri: 28/35, 35/45, 45/55, 55/75 | BIO | sacco, busta, cassetta | Selecta: Cherie, Vitelotte", sotto1: "Verdure", sotto2: "", unit: "kg" },
  { nome: "Carota", testo: "alias: carote | varianti: arancio, viola, gialla, bianca, mini, con ciuffo, Rainbow | origine: Veneto, Puglia, Olanda | calibri: 80/150g, 150/250g | BIO | busta, cassetta, mazzo | Marius Auda mini", sotto1: "Verdure", sotto2: "", unit: "kg" },
  { nome: "Barbabietola", testo: "alias: barbabietole, rapa rossa, Chioggia | varianti: rossa, gialla, Chioggia, arcobaleno, mini | BIO | vaschetta, busta, cassetta | Marius Auda mini", sotto1: "Verdure", sotto2: "", unit: "kg" },
  { nome: "Sedano Rapa", testo: "alias: celeriac, sedano di Verona | varianti: intero, tagliato | BIO | sfuso, busta", sotto1: "Verdure", sotto2: "", unit: "kg" },
  { nome: "Topinambur", testo: "alias: topinambour | BIO | busta, sfuso | Marius Auda", sotto1: "Verdure", sotto2: "", unit: "kg" },
  { nome: "Pastinaca", testo: "alias: radice bianca, parsnip | BIO | busta | Selecta", sotto1: "Verdure", sotto2: "", unit: "kg" },
  { nome: "Zenzero", testo: "alias: zenzero fresco, ginger | BIO | busta, sfuso", sotto1: "Verdure", sotto2: "", unit: "kg" },
  { nome: "Curcuma", testo: "alias: curcuma fresca, turmeric | BIO | busta, sfuso", sotto1: "Verdure", sotto2: "", unit: "kg" },
  { nome: "Ravanello", testo: "alias: ravanelli, daikon, ravanello rosso | varianti: rosso, bianco, daikon | BIO | mazzo, busta | Marius Auda", sotto1: "Verdure", sotto2: "", unit: "kg" },

  // ══════════════════════════════════════════════════════════════════════════
  // SEDANO E FINOCCHIO
  // ══════════════════════════════════════════════════════════════════════════

  { nome: "Sedano", testo: "alias: sedano verde, sedano bianco | varianti: verde, bianco, costa | origine: Veneto, Puglia, Olanda | BIO | mazzo, cassetta", sotto1: "Verdure", sotto2: "", unit: "kg" },
  { nome: "Finocchio", testo: "alias: finocchi | varianti: maschio, femmina, selvatico, mini | origine: Puglia, Campania, Spagna | calibri: 200/350g, 350/500g | BIO | cassetta, busta | Marius Auda mini", sotto1: "Verdure", sotto2: "", unit: "kg" },

  // ══════════════════════════════════════════════════════════════════════════
  // ASPARAGI E CARCIOFI
  // ══════════════════════════════════════════════════════════════════════════

  { nome: "Asparago", testo: "alias: asparagi | varianti: verde, bianco, viola, selvatico, mini | origine: Veneto, Puglia, Olanda, Perù | calibri: 8/12, 12/16, 16/20, 20+ mm | BIO | mazzo, busta | Marius Auda mini", sotto1: "Verdure", sotto2: "", unit: "kg" },
  { nome: "Carciofo", testo: "alias: carciofo fresco, carciofi freschi, carciofo romanesco fresco, carciofo spinoso fresco, carciofo baby fresco | varianti: romanesco, spinoso sardo, violetto, Cynara, baby | origine: Sardegna, Puglia, Sicilia, Bretagna | calibri: 6, 9, 12, 16 per cassa | BIO | cassetta, mazzo", sotto1: "Verdure", sotto2: "", unit: "kg" },

  // ══════════════════════════════════════════════════════════════════════════
  // LEGUMI FRESCHI
  // ══════════════════════════════════════════════════════════════════════════

  { nome: "Fagiolino", testo: "alias: fagiolini, fagiolo verde, cornetto, taccole | varianti: verde, giallo, piattino | origine: Campania, Puglia, Kenya, Spagna, serra | calibri: Extra, I, II | BIO | busta, cassetta | Marius Auda finissimi", sotto1: "Verdure", sotto2: "", unit: "kg" },
  { nome: "Piselli", testo: "alias: pisello fresco, piselli sgranati | varianti: freschi, sgranati, Salad pea | BIO | busta, baccello | Marius Auda", sotto1: "Verdure", sotto2: "", unit: "kg" },
  { nome: "Fave", testo: "alias: fava fresca, fave fresche, fave sgranate | varianti: fresche, sgranate | origine: Puglia, Sicilia | BIO | busta, baccello", sotto1: "Verdure", sotto2: "", unit: "kg" },

  // ══════════════════════════════════════════════════════════════════════════
  // FUNGHI
  // ══════════════════════════════════════════════════════════════════════════

  { nome: "Champignon", testo: "alias: fungo champignon fresco, funghi champignon freschi, funghi prataioli freschi, champignon freschi, portobello fresco, champignon baby freschi | varianti: bianchi, bruni, Portobello, baby | origine: Olanda, Polonia, nazionale | calibri: Extra, I, II | BIO | vaschetta, busta, cassetta", sotto1: "Verdure", sotto2: "Funghi", unit: "kg" },
  { nome: "Porcini", testo: "alias: funghi porcini freschi, porcini freschi, porcino fresco | varianti: Extra, I categoria, misti | origine: Italia, Europa | stagionale | vaschetta, busta, cassetta", sotto1: "Verdure", sotto2: "Funghi", unit: "kg" },
  { nome: "Finferli", testo: "alias: finferli freschi, gallinacci freschi, cantarelli freschi, finferlo fresco | varianti: freschi | stagionale | vaschetta, busta", sotto1: "Verdure", sotto2: "Funghi", unit: "kg" },
  { nome: "Shiitake", testo: "alias: fungo shiitake, lentinula | varianti: freschi, disidratati | origine: Cina, Olanda | vaschetta, busta | Selecta freschi", sotto1: "Verdure", sotto2: "Funghi", unit: "kg" },
  { nome: "Pleurotus", testo: "alias: fungo ostrica, orecchioni, pioppino, chiodini | varianti: grigio, giallo, rosa | origine: Olanda, nazionale | vaschetta, busta", sotto1: "Verdure", sotto2: "Funghi", unit: "kg" },
  { nome: "Tartufo", testo: "alias: tartufo nero fresco, tartufo bianco fresco, scorzone fresco, tartufo estivo fresco, tartufo intero fresco | varianti: intero, a lamelle, grattugiato | stagionale | origine: Umbria, Marche, Alba | vaschetta, barattolo", sotto1: "Verdure", sotto2: "Tartufo", unit: "kg" },
  { nome: "Funghi Misti", testo: "alias: misto bosco, mix funghi, funghi misti | varianti: freschi, gelo | stagionale | vaschetta, busta", sotto1: "Verdure", sotto2: "Funghi", unit: "kg" },

  // ══════════════════════════════════════════════════════════════════════════
  // ZUCCA E MAIS
  // ══════════════════════════════════════════════════════════════════════════

  { nome: "Zucca", testo: "varianti: Butternut, Delica, Mantovana, Hokkaido, Violina, Spaghetti | origine: Veneto, Puglia, Spagna | calibri: 1/2kg, 2/3kg, 3/5kg | BIO | sfusa, a pezzi", sotto1: "Verdure", sotto2: "", unit: "kg" },
  { nome: "Mais", testo: "alias: granturco fresco, spiga di mais, Edamame, soia fresca | varianti: spiga, chicchi, baby | BIO | busta, cassetta", sotto1: "Verdure", sotto2: "", unit: "kg" },

  // ══════════════════════════════════════════════════════════════════════════
  // CETRIOLI E OLIVE
  // ══════════════════════════════════════════════════════════════════════════

  { nome: "Cetriolo", testo: "varianti: comune, mini, giapponese, di serra | origine: Olanda, Spagna, serra | calibri: 350/500g, 500+ | BIO | busta, cassetta, plateau", sotto1: "Verdure", sotto2: "", unit: "kg" },
  { nome: "Oliva Fresca", testo: "alias: olive fresche, olive verdi fresche, olive nere fresche | stagionale | origine: Puglia, Sicilia, Grecia | busta, cassetta", sotto1: "Verdure", sotto2: "", unit: "kg" },

  // ══════════════════════════════════════════════════════════════════════════
  // ERBE AROMATICHE
  // ══════════════════════════════════════════════════════════════════════════

  { nome: "Basilico", testo: "alias: basilico fresco, basilico genovese fresco, mazzo di basilico, basilico in vaso fresco | varianti: genovese, napoletano, a foglia larga, greco | origine: Liguria, Campania, serra | BIO | mazzo, vaso, busta | Marius Auda", sotto1: "Erbe aromatiche", sotto2: "Basilico", unit: "kg" },
  { nome: "Prezzemolo", testo: "varianti: riccio, piatto, radice | origine: Italia, Olanda | BIO | mazzo, busta | Marius Auda", sotto1: "Erbe aromatiche", sotto2: "Prezzemolo", unit: "kg" },
  { nome: "Rosmarino", testo: "varianti: fresco | BIO | mazzo, vaso, busta | Marius Auda", sotto1: "Erbe aromatiche", sotto2: "Rosmarino", unit: "kg" },
  { nome: "Timo", testo: "varianti: comune, al limone, selvatico | BIO | mazzo, vaso, busta | Marius Auda", sotto1: "Erbe aromatiche", sotto2: "Timo", unit: "kg" },
  { nome: "Salvia", testo: "varianti: comune, ananas | BIO | mazzo, vaso, busta | Marius Auda", sotto1: "Erbe aromatiche", sotto2: "Salvia", unit: "kg" },
  { nome: "Menta", testo: "varianti: piperita, romana, Mojito, acquatica | BIO | mazzo, vaso, busta | Marius Auda", sotto1: "Erbe aromatiche", sotto2: "Menta", unit: "kg" },
  { nome: "Erba Cipollina", testo: "alias: cipollina | BIO | mazzo, busta | Marius Auda", sotto1: "Erbe aromatiche", sotto2: "Erba cipollina", unit: "kg" },
  { nome: "Maggiorana", testo: "varianti: fresca | BIO | mazzo, busta | Marius Auda", sotto1: "Erbe aromatiche", sotto2: "Maggiorana", unit: "kg" },
  { nome: "Dragoncello", testo: "alias: estragone | BIO | mazzo, busta | Marius Auda", sotto1: "Erbe aromatiche", sotto2: "Dragoncello", unit: "kg" },
  { nome: "Aneto", testo: "varianti: fresco | BIO | mazzo, busta | Marius Auda", sotto1: "Erbe aromatiche", sotto2: "Aneto", unit: "kg" },
  { nome: "Origano", testo: "varianti: fresco, di Pantelleria | BIO | mazzo, busta | Marius Auda", sotto1: "Erbe aromatiche", sotto2: "Origano", unit: "kg" },
  { nome: "Erbe Miste", testo: "alias: mix erbe, bouquet garni, erbe aromatiche miste | varianti: primaverili, estive, autunnali | BIO | busta, mazzo | Marius Auda", sotto1: "Erbe aromatiche", sotto2: "", unit: "kg" },
  { nome: "Fiori Eduli", testo: "alias: fiori commestibili, fiori eduli freschi | varianti: viola pensiero, nasturzio, calendula, borragine, begonia | stagionale | vaschetta, plateau | Marius Auda", sotto1: "Erbe aromatiche", sotto2: "Fiori", unit: "kg" },
  { nome: "Microgreens", testo: "alias: germogli, cress, crescioni, microgreens | varianti: Daikon cress, Rucola cress, Basil cress, Sakura cress, Shiso | vaschetta, plateau | Selecta | Marius Auda", sotto1: "Erbe aromatiche", sotto2: "Germogli", unit: "kg" },
]

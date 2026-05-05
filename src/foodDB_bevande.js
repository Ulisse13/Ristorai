// ─────────────────────────────────────────────────────────────────────────────
// foodDB_bevande.js — Database BEVANDE per Ristorai
// cat: "Bevande"
// sotto1: "Analcolici" | "Alcolici"
// sotto2: prodotto specifico
// ─────────────────────────────────────────────────────────────────────────────

export const BEVANDE_DB = [

  // ══════════════════════════════════════════════════════════════════════════
  // ANALCOLICI
  // ══════════════════════════════════════════════════════════════════════════

  // Acque
  { keywords: ["acqua minerale", "acqua naturale", "acqua frizzante", "acqua leggermente frizzante", "acqua liscia", "acqua bottiglia", "acqua 50cl", "acqua 75cl", "acqua 1l", "acqua 1,5l", "acqua 500ml"], sotto1: "Analcolici", sotto2: "Acqua" },
  { keywords: ["acqua san pellegrino", "acqua ferrarelle", "acqua levissima", "acqua panna", "acqua sant'anna", "acqua vera", "acqua lete", "acqua rocchetta"], sotto1: "Analcolici", sotto2: "Acqua" },

  // Acqua tonica e bibite gassate
  { keywords: ["acqua tonica", "tonica", "tonica schweppes", "schweppes tonica", "fever tree tonica"], sotto1: "Analcolici", sotto2: "Acqua Tonica" },
  { keywords: ["ginger ale", "ginger beer", "schweppes ginger", "fever tree ginger"], sotto1: "Analcolici", sotto2: "Ginger" },
  { keywords: ["soda", "acqua di seltz", "club soda"], sotto1: "Analcolici", sotto2: "Soda" },

  // Cola e bibite
  { keywords: ["coca cola", "coca-cola", "coca cola 33cl", "coca cola 66cl", "coca cola lattina", "coca cola zero", "coca cola light", "coca cola sleek"], sotto1: "Analcolici", sotto2: "Coca Cola" },
  { keywords: ["fanta", "fanta arancia", "fanta 33cl", "fanta lattina", "fanta sleek"], sotto1: "Analcolici", sotto2: "Fanta" },
  { keywords: ["sprite", "sprite 33cl", "sprite lattina", "sprite sleek"], sotto1: "Analcolici", sotto2: "Sprite" },
  { keywords: ["pepsi", "pepsi cola", "pepsi max"], sotto1: "Analcolici", sotto2: "Pepsi" },
  { keywords: ["aranciata", "aranciata san pellegrino", "aranciata rossa", "chinotto", "chinotto san pellegrino"], sotto1: "Analcolici", sotto2: "Aranciata" },
  { keywords: ["limonata", "limonata san pellegrino", "cedrata", "cedrata tassoni"], sotto1: "Analcolici", sotto2: "Limonata" },

  // Energy drink
  { keywords: ["red bull", "red bull 25cl", "red bull lattina", "red bull energy"], sotto1: "Analcolici", sotto2: "Red Bull" },
  { keywords: ["monster energy", "monster lattina", "monster 50cl"], sotto1: "Analcolici", sotto2: "Monster" },
  { keywords: ["rockstar", "burn energy", "energy drink"], sotto1: "Analcolici", sotto2: "Energy Drink" },

  // Tè e infusi freddi
  { keywords: ["lipton ice tea", "lipton limone", "lipton pesca", "the freddo limone", "the freddo pesca", "the freddo 33cl", "the freddo lattina"], sotto1: "Analcolici", sotto2: "Tè Freddo" },
  { keywords: ["fuzetea", "nestea", "the freddo", "infuso freddo"], sotto1: "Analcolici", sotto2: "Tè Freddo" },

  // Succhi
  { keywords: ["succo di frutta", "succo 200ml", "succo brick", "succo arancia", "succo pesca", "succo ace", "succo mela", "succo ananas", "succo pera"], sotto1: "Analcolici", sotto2: "Succhi" },
  { keywords: ["comodo brick", "yoga succo", "skipper succo"], sotto1: "Analcolici", sotto2: "Succhi" },

  // Sciroppi
  { keywords: ["sciroppo di menta", "sciroppo grenadine", "sciroppo monin", "sciroppo amarena", "sciroppo limone", "sciroppo vaniglia", "sciroppo caramello"], sotto1: "Analcolici", sotto2: "Sciroppi" },

  // ══════════════════════════════════════════════════════════════════════════
  // ALCOLICI
  // ══════════════════════════════════════════════════════════════════════════

  // Birre
  { keywords: ["birra menabrea", "menabrea 33cl", "menabrea lattina", "menabrea 150"], sotto1: "Alcolici", sotto2: "Birra" },
  { keywords: ["birra moretti", "moretti 33cl", "moretti lattina", "moretti 66cl", "birra moretti bottiglia"], sotto1: "Alcolici", sotto2: "Birra" },
  { keywords: ["birra peroni", "peroni 33cl", "nastro azzurro", "nastro azzurro 33cl", "peroni lattina"], sotto1: "Alcolici", sotto2: "Birra" },
  { keywords: ["birra heineken", "heineken 33cl", "heineken lattina", "heineken 66cl"], sotto1: "Alcolici", sotto2: "Birra" },
  { keywords: ["birra corona", "corona extra", "corona 33cl"], sotto1: "Alcolici", sotto2: "Birra" },
  { keywords: ["birra beck", "beck's", "becks lattina"], sotto1: "Alcolici", sotto2: "Birra" },
  { keywords: ["birra artigianale", "birra ipa", "birra ale", "birra weiss", "birra lager", "birra radler", "birra doppio malto"], sotto1: "Alcolici", sotto2: "Birra" },
  { keywords: ["birra analcolica", "birra senza alcol"], sotto1: "Alcolici", sotto2: "Birra Analcolica" },

  // Aperitivi
  { keywords: ["aperol", "aperol 70cl", "aperol 1l", "aperol bottiglia"], sotto1: "Alcolici", sotto2: "Aperol" },
  { keywords: ["campari", "campari 70cl", "campari 1l", "campari bitter"], sotto1: "Alcolici", sotto2: "Campari" },
  { keywords: ["select", "cynar", "aperitivo veneziano"], sotto1: "Alcolici", sotto2: "Aperitivo" },
  { keywords: ["martini bianco", "martini rosso", "martini extra dry", "vermouth"], sotto1: "Alcolici", sotto2: "Vermouth" },
  { keywords: ["lillet", "cocchi americano", "aperitivo vino"], sotto1: "Alcolici", sotto2: "Aperitivo Vino" },

  // Amari
  { keywords: ["amaro montenegro", "montenegro 70cl", "amaro montenegro bottiglia"], sotto1: "Alcolici", sotto2: "Amaro Montenegro" },
  { keywords: ["fernet branca", "fernet 70cl", "fernet menta"], sotto1: "Alcolici", sotto2: "Fernet" },
  { keywords: ["averna", "amaro averna", "averna 70cl"], sotto1: "Alcolici", sotto2: "Averna" },
  { keywords: ["ramazzotti", "amaro ramazzotti"], sotto1: "Alcolici", sotto2: "Ramazzotti" },
  { keywords: ["jagermeister", "jager"], sotto1: "Alcolici", sotto2: "Jägermeister" },
  { keywords: ["amaro del capo", "amaro siciliano", "amaro alle erbe"], sotto1: "Alcolici", sotto2: "Amaro" },

  // Liquori dolci
  { keywords: ["baileys", "baileys irish cream", "baileys 70cl"], sotto1: "Alcolici", sotto2: "Baileys" },
  { keywords: ["limoncello", "limoncello di sorrento", "limoncello di capri"], sotto1: "Alcolici", sotto2: "Limoncello" },
  { keywords: ["sambuca", "sambuca molinari", "sambuca romana"], sotto1: "Alcolici", sotto2: "Sambuca" },
  { keywords: ["cointreau", "triple sec", "grand marnier", "curacao"], sotto1: "Alcolici", sotto2: "Liquore all'Arancia" },
  { keywords: ["maraschino", "cherry brandy", "liquore di ciliegia"], sotto1: "Alcolici", sotto2: "Maraschino" },
  { keywords: ["kahlua", "tia maria", "liquore al caffe"], sotto1: "Alcolici", sotto2: "Liquore al Caffè" },
  { keywords: ["malibu", "cocco rum", "liquore al cocco"], sotto1: "Alcolici", sotto2: "Liquore al Cocco" },
  { keywords: ["amaretto disaronno", "amaretto di saronno", "disaronno"], sotto1: "Alcolici", sotto2: "Amaretto" },
  { keywords: ["strega", "galliano", "frangelico"], sotto1: "Alcolici", sotto2: "Liquore Italiano" },

  // Superalcolici — Gin
  { keywords: ["gin", "gin 70cl", "gin hendricks", "gin bombay", "gin tanqueray", "gin gordon", "gin beefeater", "gin malfy", "gin mare"], sotto1: "Alcolici", sotto2: "Gin" },

  // Superalcolici — Vodka
  { keywords: ["vodka", "vodka 70cl", "vodka absolut", "vodka grey goose", "vodka belvedere", "vodka smirnoff", "vodka ketel one"], sotto1: "Alcolici", sotto2: "Vodka" },

  // Superalcolici — Rum
  { keywords: ["rum", "rum 70cl", "rum bacardi", "rum havana", "rum diplomatico", "rum appleton", "rum jamaicano", "rhum agricole"], sotto1: "Alcolici", sotto2: "Rum" },

  // Superalcolici — Whisky
  { keywords: ["whisky", "whiskey", "scotch whisky", "bourbon", "jack daniels", "jim beam", "jameson", "johnnie walker", "glenfiddich", "laphroaig", "talisker", "macallan"], sotto1: "Alcolici", sotto2: "Whisky" },

  // Superalcolici — Tequila e Mezcal
  { keywords: ["tequila", "tequila patron", "tequila jose cuervo", "tequila herradura", "mezcal"], sotto1: "Alcolici", sotto2: "Tequila" },

  // Superalcolici — Brandy e Cognac
  { keywords: ["brandy", "cognac", "hennessy", "remy martin", "martell", "calvados", "armagnac"], sotto1: "Alcolici", sotto2: "Cognac/Brandy" },

  // Grappa e distillati italiani
  { keywords: ["grappa", "grappa di barolo", "grappa di moscato", "grappa invecchiata", "acquavite"], sotto1: "Alcolici", sotto2: "Grappa" },
  { keywords: ["nocino", "liquore alla noce", "liquore al fico", "mirto", "mirto sardo"], sotto1: "Alcolici", sotto2: "Distillato Italiano" },
]

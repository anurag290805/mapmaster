/*
 * Frozen 2026-11-10 research snapshot. This module is deliberately located
 * under candidate/: it is never imported by gameplay, Vite entry points, the
 * service worker, rewards, Daily Challenges, Firebase, or cloud saves.
 *
 * The rows preserve the country entity, P610 high-point claim target, and the
 * label returned by the query. `raw_source_scope` is retained where a source
 * entity has a different territorial scope than MapMaster's map identity.
 */
export const SOURCE_SNAPSHOT = Object.freeze({
  id: "wikidata-country-terrain.v1",
  retrieved_at: "2026-11-10",
  source_organization: "Wikidata",
  source_license: "CC0 1.0 Universal",
  attribution_requirement: "No legal attribution requirement; retain source and revision links for editorial provenance.",
  query_url: "https://query.wikidata.org/sparql",
  query: "SELECT ?country ?countryLabel ?highestPoint ?highestPointLabel WHERE { ?country wdt:P31/wdt:P279* wd:Q3624078; wdt:P610 ?highestPoint. SERVICE wikibase:label { bd:serviceParam wikibase:language \\\"en\\\". } }",
  claim_property: "P610",
  claim_label: "highest point",
  raw_row_count: 194,
  purpose: "development-only country-fact editorial research; not gameplay content",
});

// [MapMaster display identity, source country QID, source feature label, source feature QID, scope note?]
// This is the frozen, minimally transformed source evidence. Labels are not
// MapMaster database keys; the adapter derives canonical IDs below.
export const RAW_TERRAIN_EVIDENCE = Object.freeze([
  ["Afghanistan","Q889","Noshaq","Q271700"], ["Albania","Q222","Korab","Q912579"], ["Algeria","Q262","Mount Tahat","Q822326"], ["Andorra","Q228","Coma Pedrosa","Q62467"],
  ["Angola","Q916","Mount Moco","Q1348116"], ["Antigua and Barbuda","Q781","Mount Obama","Q1718336"], ["Argentina","Q414","Aconcagua","Q39739","The query returned Q39739 without an English label; Aconcagua is retained as an editorial label pending secondary confirmation."], ["Armenia","Q399","Mount Aragats","Q203568"],
  ["Australia","Q408","Mawson Peak","Q2114101","Source scope includes external territories; exclude from any map-scored prompt unless CP05 scope permits it."], ["Austria","Q40","Grossglockner","Q3388"], ["Azerbaijan","Q227","Mount Bazardüzü","Q725591"], ["Bahamas","Q778","Mount Alvernia","Q746274"],
  ["Bahrain","Q398","Mountain of Smoke","Q1032812"], ["Bangladesh","Q902","Mowdok tiang","Q2696459"], ["Barbados","Q244","Mount Hillaby","Q1854502"], ["Belarus","Q184","Dziaržynkaja hara","Q921447"],
  ["Belgium","Q31","Signal de Botrange","Q322824"], ["Belize","Q242","Doyle's Delight","Q47490"], ["Benin","Q962","Mont Sokbaro","Q923330"], ["Bhutan","Q917","Gangkhar Puensum","Q219986"],
  ["Bolivia","Q750","Nevado Sajama","Q272593"], ["Bosnia and Herzegovina","Q225","Maglić","Q837723"], ["Botswana","Q963","Otse Hill","Q3491942"], ["Brazil","Q155","Pico da Neblina","Q739484"],
  ["Brunei","Q921","Bukit Pagon","Q1003282"], ["Bulgaria","Q219","Musala","Q209341"], ["Burkina Faso","Q965","Mount Tenakourou","Q116675"], ["Burundi","Q967","Mount Heha","Q1649074"],
  ["Cabo Verde","Q1011","Pico do Fogo","Q499108"], ["Cambodia","Q424","Phnom Aural","Q539772"], ["Cameroon","Q1009","Mount Cameroon","Q190562"], ["Canada","Q16","Mount Logan","Q120306"],
  ["Central African Republic","Q929","Mont Ngaoui","Q2422162"], ["Chad","Q657","Emi Koussi","Q257441"], ["Chile","Q298","Ojos del Salado","Q233836"], ["China","Q148","Mount Everest","Q513","The source label is People's Republic of China; MapMaster's display alias is China."],
  ["Colombia","Q739","Pico Simón Bolívar","Q338790"], ["Comoros","Q970","Mount Karthala","Q527548"], ["Congo","Q971","Mont Nabemba","Q3113296","The source label is Republic of the Congo; MapMaster's display alias is Congo."], ["Costa Rica","Q800","Cerro Chirripó","Q252362"],
  ["Croatia","Q224","Dinara","Q3183447"], ["Cuba","Q241","Pico Turquino","Q1145743"], ["Cyprus","Q229","Mount Olympus","Q819979"], ["Czech Republic","Q213","Sněžka","Q617511"],
  ["Denmark","Q35","Møllehøj","Q689106","Do not infer a Kingdom of Denmark territorial extent from this country-level claim."], ["Djibouti","Q977","Mousa Ali","Q1951029"], ["Dominica","Q784","Morne Diablotins","Q1638549"], ["Dominican Republic","Q786","Pico Duarte","Q783742"],
  ["Ecuador","Q736","Chimborazo","Q14081"], ["Egypt","Q79","Mount Catherine","Q1140642"], ["El Salvador","Q792","Cerro El Pital","Q74214"], ["Equatorial Guinea","Q983","Pico Basilé","Q1518286"],
  ["Eritrea","Q986","Emba Soira","Q1753730"], ["Estonia","Q191","Suur Munamägi","Q504991"], ["Eswatini","Q1050","Emlembe","Q1337951"], ["Ethiopia","Q115","Ras Dashen","Q275435"],
  ["Fiji","Q712","Mount Tomanivi","Q1513944"], ["Finland","Q33","Halti","Q216035"], ["France","Q142","Mont Blanc","Q583","Do not turn this transboundary feature into a sole-ownership claim."], ["Gabon","Q1000","Mont Bengoué","Q3210770"],
  ["Gambia","Q1005","Atlantic Ocean","Q97","No P610 claim was returned. This alternate P206 body-of-water claim only supports a coast-facing fact, not a highest-point fact."], ["Georgia","Q230","Shkhara","Q217457"], ["Germany","Q183","Zugspitze","Q3375"], ["Ghana","Q117","Mount Afadja","Q635179"],
  ["Greece","Q41","Mount Olympus","Q80344"], ["Grenada","Q769","Mount Saint Catherine","Q525281"], ["Guatemala","Q774","Volcán Tajumulco","Q818467"], ["Guinea","Q1006","Mount Richard-Molard","Q849129"],
  ["Guinea-Bissau","Q1007","Monte Torin","Q109837809"], ["Guyana","Q734","Mount Roraima","Q4777","Do not infer sole-country ownership of this transboundary feature."], ["Haiti","Q790","Peak la Selle","Q1971319"], ["Honduras","Q783","Cerro Las Minas","Q1055875"],
  ["Hungary","Q28","Kékes","Q747618"], ["Iceland","Q189","Hvannadalshnúkur","Q140084"], ["India","Q668","Kanchenjunga","Q82019","Do not turn this transboundary feature into a boundary or sovereignty claim."], ["Indonesia","Q252","Puncak Jaya","Q1045888"],
  ["Iran","Q794","Damavand","Q40758"], ["Iraq","Q796","Cheekha Dar","Q1068860"], ["Ireland","Q27","Carrauntoohil","Q503368"], ["Israel","Q801","Meron","Q540520"],
  ["Italy","Q38","Mont Blanc","Q583","Do not turn this transboundary feature into a sole-ownership claim."], ["Jamaica","Q766","Blue Mountain Peak","Q885798"], ["Japan","Q17","Mount Fuji","Q39231"], ["Jordan","Q810","Jabal Umm ad Dami","Q1261902"],
  ["Kazakhstan","Q232","Khan Tengri","Q211529","Do not turn this transboundary feature into a boundary or sovereignty claim."], ["Kenya","Q114","Mount Kenya","Q172070"], ["Kiribati","Q710","Banaba Island","Q271901"], ["Kuwait","Q817","Mutla Ridge","Q4116111"],
  ["Kyrgyzstan","Q813","Jengish Chokusu","Q332762","Do not turn this transboundary feature into a boundary or sovereignty claim."], ["Laos","Q819","Phou Bia","Q239485"], ["Latvia","Q211","Gaiziņkalns","Q1122342"], ["Lebanon","Q822","Qurnat as Sawda'","Q311330"],
  ["Lesotho","Q1013","Thabana Ntlenyana","Q733132"], ["Liberia","Q1014","Mount Wuteve","Q1950836"], ["Libya","Q1016","Bikku Bitti","Q860146"], ["Liechtenstein","Q347","Grauspitz","Q665000"],
  ["Lithuania","Q37","Aukštojas Hill","Q771431"], ["Luxembourg","Q32","Kneiff","Q24457"], ["Madagascar","Q1019","Maromokotro","Q1147144"], ["Malawi","Q1020","Mulanje Massif","Q1510436"],
  ["Malaysia","Q833","Mount Kinabalu","Q60967"], ["Maldives","Q826","Villingili","Q176749","Very-low-elevation island data should be independently rechecked before any player-facing use."], ["Mali","Q912","Mount Hombori","Q1454300"], ["Malta","Q233","Ta' Dmejrek","Q1850604"],
  ["Marshall Islands","Q709","Likiep Atoll","Q518353","Atoll-versus-island terminology requires a content check before use."], ["Mauritania","Q1025","Kediet ej Jill","Q2595789"], ["Mauritius","Q1027","Piton de la Petite Rivière Noire","Q1760978"], ["Mexico","Q96","Citlaltepetl","Q238147"],
  ["Micronesia","Q702","Dolohmwar","Q1236265","The source label is Federated States of Micronesia; MapMaster's display alias is Micronesia."], ["Moldova","Q217","Bălănești Hill","Q47940"], ["Monaco","Q235","Chemin des Révoires","Q1069352"], ["Mongolia","Q711","Hüiten Peak","Q1091113"],
  ["Montenegro","Q236","Zla Kolata","Q2720697","Do not turn this border-area feature into a boundary claim."], ["Morocco","Q1028","Jbel Toubkal","Q503433","Do not infer territorial scope beyond MapMaster's existing CP05 policy."], ["Mozambique","Q1029","Monte Binga","Q1353678"], ["Myanmar","Q836","Hkakabo Razi","Q870063"],
  ["Namibia","Q1030","Brandberg","Q897834"], ["Nauru","Q697","Command Ridge","Q2667931"], ["Nepal","Q837","Mount Everest","Q513","Do not turn this transboundary feature into a boundary or sovereignty claim."], ["Netherlands","Q29999","Mount Scenery","Q1301834","Source scope is Kingdom of the Netherlands and includes Caribbean territory; it is not a safe CP05 map-scope claim."],
  ["New Zealand","Q664","Aoraki / Mount Cook","Q5059"], ["Nicaragua","Q811","Cerro Mogotón","Q2092378","Do not turn this border-area feature into a boundary claim."], ["Niger","Q1032","Mont Idoukal-n-Taghès","Q3042286"], ["Nigeria","Q1033","Chappal Waddi","Q976055"],
  ["North Korea","Q423","Baekdu Mountain","Q107635","Do not turn this transboundary feature into a boundary or sovereignty claim."], ["North Macedonia","Q221","Korab","Q912579","Do not turn this transboundary feature into a boundary claim."], ["Norway","Q20","Galdhøpiggen","Q203942"], ["Oman","Q842","Jebel Shams","Q1261915"],
  ["Pakistan","Q843","K2","Q43512","Do not turn this transboundary feature into a boundary or sovereignty claim."], ["Palau","Q695","Mount Ngerchelchuus","Q1191219"], ["Palestine","Q219060","Mount Nabi Yunis","Q6922335","Political-entity and territorial-scope handling remains governed by CP05; do not use competitively."], ["Panama","Q804","Volcan Baru","Q594726"],
  ["Papua New Guinea","Q691","Mount Wilhelm","Q277441"], ["Paraguay","Q733","Cerro Tres Kandú","Q1055965"], ["Peru","Q419","Huascarán","Q200935"], ["Philippines","Q928","Mount Apo","Q455963"],
  ["Poland","Q36","Rysy","Q672936","Do not turn this transboundary feature into a boundary claim."], ["Portugal","Q45","Mount Pico","Q928681"], ["Qatar","Q846","Qurayn Abu al Bawl","Q1633034"], ["Romania","Q218","Moldoveanu Peak","Q746524"],
  ["Russia","Q159","Mount Elbrus","Q43105"], ["Rwanda","Q1037","Mount Karisimbi","Q737859","Do not turn this transboundary feature into a boundary claim."], ["Saint Kitts and Nevis","Q763","Mount Liamuiga","Q1269774"], ["Saint Lucia","Q760","Mount Gimie","Q1811114"],
  ["Saint Vincent and the Grenadines","Q757","La Soufrière","Q26544"], ["Samoa","Q683","Silisili","Q1147814"], ["San Marino","Q238","Monte Titano","Q158526"], ["Sao Tome and Principe","Q1039","Pico de São Tomé","Q1471391"],
  ["Saudi Arabia","Q851","Jabal Sawda","Q1261892"], ["Senegal","Q1041","Népin Cliff","Q98596662"], ["Serbia","Q403","Velika Rudoka","Q20568528","Do not turn this border-area feature into a boundary claim."], ["Seychelles","Q1042","Morne Seychellois","Q1579060"],
  ["Sierra Leone","Q1044","Mount Bintumani","Q769525"], ["Singapore","Q334","Bukit Timah","Q720209"], ["Slovakia","Q214","Gerlachovský štít","Q81213"], ["Slovenia","Q215","Triglav","Q1024"],
  ["Solomon Islands","Q685","Mount Popomanaseu","Q760819"], ["Somalia","Q1045","Shimbiris","Q649162"], ["South Africa","Q258","Mafadi","Q1883683","Do not turn this border-area feature into a boundary claim."], ["South Korea","Q884","Hallasan","Q494645"],
  ["South Sudan","Q958","Kinyeti","Q948298"], ["Spain","Q29","Teide","Q38954"], ["Sri Lanka","Q854","Pidurutalagala","Q1146327"], ["Sudan","Q1049","Deriba Caldera","Q2520348"],
  ["Suriname","Q730","Julianatop","Q1549215"], ["Sweden","Q34","Kebnekaise","Q214011"], ["Switzerland","Q39","Dufourspitze","Q3403"], ["Syria","Q858","Mount Hermon","Q215471","Do not turn this transboundary feature into a boundary or sovereignty claim."],
  ["Taiwan","Q865","Yushan Main Peak","Q500275","Political-entity handling remains governed by CP05; do not use competitively."], ["Tajikistan","Q863","Ismoil Somoni Peak","Q41413"], ["Tanzania","Q924","Mount Kibo","Q1394606"], ["Thailand","Q869","Doi Inthanon","Q1140075"],
  ["Timor-Leste","Q574","Tatamailau","Q1539961"], ["Togo","Q945","Mount Agou","Q1753509"], ["Tonga","Q678","Kao","Q1520405"], ["Trinidad and Tobago","Q754","El Cerro del Aripo","Q1056103"],
  ["Tunisia","Q948","Jebel ech Chambi","Q1232136"], ["Turkey","Q43","Mount Ararat","Q72303","Name and transboundary context should not be used as a political clue."], ["Turkmenistan","Q874","Aýrybaba","Q794684"], ["Tuvalu","Q672","Niulakita","Q632489"],
  ["Uganda","Q1036","Mount Stanley","Q221666","Do not turn this transboundary feature into a boundary claim."], ["Ukraine","Q212","Hoverla","Q627508"], ["United Arab Emirates","Q878","Jebel Jais","Q3492099"], ["United Kingdom","Q145","Ben Nevis","Q104674"],
  ["United States","Q30","Denali","Q130018","The query returned Q130018 without an English label; Denali is retained as an editorial label pending secondary confirmation."], ["Uruguay","Q77","Cerro Catedral","Q1055837"], ["Uzbekistan","Q265","Khazret Sultan","Q519822"], ["Vanuatu","Q686","Mount Tabwemasana","Q1542459"],
  ["Vatican City","Q237","Vatican Hill","Q1053000"], ["Venezuela","Q717","Pico Bolívar","Q213704"], ["Vietnam","Q881","Fansipan","Q123782"], ["Yemen","Q805","Jabal an Nabi Shu'ayb","Q1261935"],
  ["Zambia","Q953","Mafinga Central","Q18351462"], ["Zimbabwe","Q954","Mount Nyangani","Q152294"],
]);

/* ============================================================
   MapMaster – India Edition | script.js
   ============================================================ */


/* ============================================================
   1. DATA — MULTI-COUNTRY MAP ENGINE
   ============================================================ */
const MAPS = {
  india: {
    name:    "India",
    svg:     "svg/india.svg",
    regions: [
      "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
      "Chhattisgarh", "Goa", "Gujarat", "Haryana",
      "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
      "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
      "Mizoram", "Nagaland", "Odisha", "Punjab",
      "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
      "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
    ]
  },
  usa: {
    name:    "USA",
    svg:     "svg/usa.svg",
    regions: [
      "Alabama", "Alaska", "Arizona", "Arkansas",
      "California", "Colorado", "Connecticut", "Delaware",
      "Florida", "Georgia", "Hawaii", "Idaho",
      "Illinois", "Indiana", "Iowa", "Kansas",
      "Kentucky", "Louisiana", "Maine", "Maryland",
      "Massachusetts", "Michigan", "Minnesota", "Mississippi",
      "Missouri", "Montana", "Nebraska", "Nevada",
      "New Hampshire", "New Jersey", "New Mexico", "New York",
      "North Carolina", "North Dakota", "Ohio", "Oklahoma",
      "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
      "South Dakota", "Tennessee", "Texas", "Utah",
      "Vermont", "Virginia", "Washington", "West Virginia",
      "Wisconsin", "Wyoming"
    ]
  },
  europe: {
    name: "Europe",
    svg:  "svg/europe.svg",
    regions: [
      "Germany", "France", "Italy", "Spain", "Portugal",
      "Netherlands", "Belgium", "Luxembourg", "Switzerland", "Austria",
      "Poland", "Czech Republic", "Slovakia", "Hungary", "Romania",
      "Bulgaria", "Greece", "Croatia", "Slovenia", "Serbia",
      "Bosnia and Herzegovina", "Montenegro", "Albania", "Macedonia",
      "Sweden", "Norway", "Finland", "Denmark",
      "Estonia", "Latvia", "Lithuania",
      "Ireland", "United Kingdom",
      "Ukraine", "Belarus", "Moldova",
      "Russia", "Kazakhstan",
      "Turkey", "Cyprus", "Malta", "Iceland"
    ]
  },
  northAmerica: {
    name: "North America",
    svg:  "svg/north america.svg",
    regions: [
      "Canada", "United States", "Mexico",
      "Guatemala", "Belize", "El Salvador", "Honduras",
      "Nicaragua", "Costa Rica", "Panama",
      "Cuba", "Jamaica", "Haiti", "Dominican Republic",
      "Bahamas", "Barbados", "Trinidad and Tobago",
      "Saint Lucia", "Grenada", "Antigua and Barbuda",
      "Dominica", "Saint Kitts and Nevis", "Saint Vincent and the Grenadines"
    ]
  },
  southAmerica: {
    name: "South America",
    svg:  "svg/south america.svg",
    regions: [
      "Argentina", "Bolivia", "Brazil", "Chile",
      "Colombia", "Ecuador", "Guyana", "Paraguay",
      "Peru", "Suriname", "Uruguay", "Venezuela"
    ]
  },
  africa: {
    name: "Africa",
    svg:  "svg/africa.svg",
    regions: [
      "Algeria", "Angola", "Benin", "Botswana", "Burkina Faso",
      "Burundi", "Cameroon", "Cape Verde", "Central African Republic", "Chad",
      "Comoros", "Democratic Republic of Congo", "Republic of Congo",
      "Djibouti", "Egypt", "Equatorial Guinea", "Eritrea", "Swaziland",
      "Ethiopia", "Gabon", "Gambia", "Ghana", "Guinea", "Guinea-Bissau",
      "Côte d'Ivoire", "Kenya", "Lesotho", "Liberia", "Libya",
      "Madagascar", "Malawi", "Mali", "Mauritania", "Mauritius",
      "Morocco", "Mozambique", "Namibia", "Niger", "Nigeria",
      "Rwanda", "Sao Tome and Principe", "Senegal", "Seychelles",
      "Sierra Leone", "Somalia", "South Africa", "South Sudan",
      "Sudan", "Tanzania", "Togo", "Tunisia", "Uganda", "Zambia", "Zimbabwe"
    ]
  },
  asia: {
    name: "Asia",
    svg:  "svg/asia.svg",
    regions: [
      "Afghanistan", "Armenia", "Azerbaijan", "Bahrain", "Bangladesh",
      "Bhutan", "Brunei", "Cambodia", "China", "Cyprus",
      "Georgia", "India", "Indonesia", "Iran", "Iraq",
      "Israel", "Japan", "Jordan", "Kazakhstan", "Kuwait",
      "Kyrgyzstan", "Laos", "Lebanon", "Malaysia", "Maldives",
      "Mongolia", "Myanmar", "Nepal", "North Korea", "Oman",
      "Pakistan", "Palestine", "Philippines", "Qatar", "Saudi Arabia",
      "Singapore", "South Korea", "Sri Lanka", "Syria", "Taiwan",
      "Tajikistan", "Thailand", "Timor-Leste", "Turkey", "Turkmenistan",
      "United Arab Emirates", "Uzbekistan", "Vietnam", "Yemen"
    ]
  },
  oceania: {
    name: "Oceania",
    svg:  "svg/oceania.svg",
    regions: [
      "Australia", "New Zealand", "Papua New Guinea", "Fiji",
      "Solomon Islands", "Vanuatu", "Samoa", "Tonga",
      "Kiribati", "Federated States of Micronesia", "Palau", "Marshall Islands",
      "Nauru", "Tuvalu"
    ]
  },
  world: {
    name: "World",
    svg:  "svg/world.svg",
    regions: [
      "Afghanistan", "Albania", "Algeria", "Andorra", "Angola",
      "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
      "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados",
      "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
      "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei",
      "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
      "Cameroon", "Canada", "Central African Republic", "Chad", "Chile",
      "China", "Colombia", "Comoros", "Congo", "Costa Rica",
      "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark",
      "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt",
      "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini",
      "Ethiopia", "Fiji", "Finland", "France", "Gabon",
      "Gambia", "Georgia", "Germany", "Ghana", "Greece",
      "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
      "Haiti", "Honduras", "Hungary", "Iceland", "India",
      "Indonesia", "Iran", "Iraq", "Ireland", "Israel",
      "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan",
      "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos",
      "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya",
      "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi",
      "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands",
      "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova",
      "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique",
      "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands",
      "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea",
      "North Macedonia", "Norway", "Oman", "Pakistan", "Palau",
      "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru",
      "Philippines", "Poland", "Portugal", "Qatar", "Romania",
      "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia",
      "Saint Vincent and the Grenadines", "Samoa", "San Marino",
      "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia",
      "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia",
      "Solomon Islands", "Somalia", "South Africa", "South Korea",
      "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname",
      "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan",
      "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga",
      "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
      "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom",
      "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City",
      "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
    ]
  }
};

/* ============================================================
   FLAGS DATASET — country name -> flag emoji / image path
   Using emoji flags (unicode) so no external files needed
   ============================================================ */
const FLAGS = {
  // World countries — emoji flags
  "Afghanistan": "🇦🇫", "Albania": "🇦🇱", "Algeria": "🇩🇿", "Argentina": "🇦🇷",
  "Australia": "🇦🇺", "Austria": "🇦🇹", "Bangladesh": "🇧🇩", "Belgium": "🇧🇪",
  "Bolivia": "🇧🇴", "Brazil": "🇧🇷", "Canada": "🇨🇦", "Chile": "🇨🇱",
  "China": "🇨🇳", "Colombia": "🇨🇴", "Croatia": "🇭🇷", "Cuba": "🇨🇺",
  "Czech Republic": "🇨🇿", "Denmark": "🇩🇰", "Ecuador": "🇪🇨", "Egypt": "🇪🇬",
  "Ethiopia": "🇪🇹", "Finland": "🇫🇮", "France": "🇫🇷", "Germany": "🇩🇪",
  "Ghana": "🇬🇭", "Greece": "🇬🇷", "Hungary": "🇭🇺", "Iceland": "🇮🇸",
  "India": "🇮🇳", "Indonesia": "🇮🇩", "Iran": "🇮🇷", "Iraq": "🇮🇶",
  "Ireland": "🇮🇪", "Israel": "🇮🇱", "Italy": "🇮🇹", "Jamaica": "🇯🇲",
  "Japan": "🇯🇵", "Jordan": "🇯🇴", "Kazakhstan": "🇰🇿", "Kenya": "🇰🇪",
  "Kuwait": "🇰🇼", "Lebanon": "🇱🇧", "Libya": "🇱🇾", "Malaysia": "🇲🇾",
  "Mexico": "🇲🇽", "Mongolia": "🇲🇳", "Morocco": "🇲🇦", "Myanmar": "🇲🇲",
  "Nepal": "🇳🇵", "Netherlands": "🇳🇱", "New Zealand": "🇳🇿", "Nigeria": "🇳🇬",
  "North Korea": "🇰🇵", "Norway": "🇳🇴", "Pakistan": "🇵🇰", "Peru": "🇵🇪",
  "Philippines": "🇵🇭", "Poland": "🇵🇱", "Portugal": "🇵🇹", "Qatar": "🇶🇦",
  "Romania": "🇷🇴", "Russia": "🇷🇺", "Saudi Arabia": "🇸🇦", "Serbia": "🇷🇸",
  "Singapore": "🇸🇬", "South Africa": "🇿🇦", "South Korea": "🇰🇷", "Spain": "🇪🇸",
  "Sri Lanka": "🇱🇰", "Sweden": "🇸🇪", "Switzerland": "🇨🇭", "Syria": "🇸🇾",
  "Taiwan": "🇹🇼", "Thailand": "🇹🇭", "Turkey": "🇹🇷", "Ukraine": "🇺🇦",
  "United Arab Emirates": "🇦🇪", "United Kingdom": "🇬🇧", "United States": "🇺🇸",
  "Uruguay": "🇺🇾", "Venezuela": "🇻🇪", "Vietnam": "🇻🇳", "Yemen": "🇾🇪",
  "Zambia": "🇿🇲", "Zimbabwe": "🇿🇼",
  // Europe
  "Luxembourg": "🇱🇺", "Bulgaria": "🇧🇬", "Slovakia": "🇸🇰", "Slovenia": "🇸🇮",
  "Belarus": "🇧🇾", "Lithuania": "🇱🇹", "Latvia": "🇱🇻", "Estonia": "🇪🇪",
  "Moldova": "🇲🇩", "Montenegro": "🇲🇪", "Bosnia and Herzegovina": "🇧🇦",
  "Albania": "🇦🇱", "North Macedonia": "🇲🇰", "Cyprus": "🇨🇾", "Malta": "🇲🇹",
  // Americas
  "Guatemala": "🇬🇹", "Honduras": "🇭🇳", "Nicaragua": "🇳🇮", "Costa Rica": "🇨🇷",
  "Panama": "🇵🇦", "Haiti": "🇭🇹", "Dominican Republic": "🇩🇴", "Bahamas": "🇧🇸",
  "Trinidad and Tobago": "🇹🇹", "Paraguay": "🇵🇾", "Guyana": "🇬🇾",
  "Suriname": "🇸🇷",
  // Africa
  "Tunisia": "🇹🇳", "Sudan": "🇸🇩", "Angola": "🇦🇴", "Mozambique": "🇲🇿",
  "Madagascar": "🇲🇬", "Cameroon": "🇨🇲", "Niger": "🇳🇪", "Mali": "🇲🇱",
  "Senegal": "🇸🇳", "Uganda": "🇺🇬", "Tanzania": "🇹🇿", "Rwanda": "🇷🇼",
  // Asia/Oceania
  "Bhutan": "🇧🇹", "Cambodia": "🇰🇭", "Laos": "🇱🇦", "Brunei": "🇧🇳",
  "Papua New Guinea": "🇵🇬", "Fiji": "🇫🇯"
};

/* ============================================================
   CAPITALS DATASET
   ============================================================ */
const CAPITALS = {
  world: {
    "Afghanistan": "Kabul", "Albania": "Tirana", "Algeria": "Algiers",
    "Argentina": "Buenos Aires", "Australia": "Canberra", "Austria": "Vienna",
    "Bangladesh": "Dhaka", "Belgium": "Brussels", "Bolivia": "Sucre",
    "Brazil": "Brasília", "Canada": "Ottawa", "Chile": "Santiago",
    "China": "Beijing", "Colombia": "Bogotá", "Croatia": "Zagreb",
    "Cuba": "Havana", "Czech Republic": "Prague", "Denmark": "Copenhagen",
    "Ecuador": "Quito", "Egypt": "Cairo", "Ethiopia": "Addis Ababa",
    "Finland": "Helsinki", "France": "Paris", "Germany": "Berlin",
    "Ghana": "Accra", "Greece": "Athens", "Hungary": "Budapest",
    "Iceland": "Reykjavik", "India": "New Delhi", "Indonesia": "Jakarta",
    "Iran": "Tehran", "Iraq": "Baghdad", "Ireland": "Dublin",
    "Israel": "Jerusalem", "Italy": "Rome", "Jamaica": "Kingston",
    "Japan": "Tokyo", "Jordan": "Amman", "Kazakhstan": "Astana",
    "Kenya": "Nairobi", "Kuwait": "Kuwait City", "Lebanon": "Beirut",
    "Libya": "Tripoli", "Malaysia": "Kuala Lumpur", "Mexico": "Mexico City",
    "Mongolia": "Ulaanbaatar", "Morocco": "Rabat", "Myanmar": "Naypyidaw",
    "Nepal": "Kathmandu", "Netherlands": "Amsterdam", "New Zealand": "Wellington",
    "Nigeria": "Abuja", "North Korea": "Pyongyang", "Norway": "Oslo",
    "Pakistan": "Islamabad", "Peru": "Lima", "Philippines": "Manila",
    "Poland": "Warsaw", "Portugal": "Lisbon", "Qatar": "Doha",
    "Romania": "Bucharest", "Russia": "Moscow", "Saudi Arabia": "Riyadh",
    "Serbia": "Belgrade", "Singapore": "Singapore", "South Africa": "Pretoria",
    "South Korea": "Seoul", "Spain": "Madrid", "Sri Lanka": "Sri Jayawardenepura Kotte",
    "Sweden": "Stockholm", "Switzerland": "Bern", "Syria": "Damascus",
    "Thailand": "Bangkok", "Turkey": "Ankara", "Ukraine": "Kyiv",
    "United Arab Emirates": "Abu Dhabi", "United Kingdom": "London",
    "United States": "Washington D.C.", "Uruguay": "Montevideo",
    "Venezuela": "Caracas", "Vietnam": "Hanoi", "Yemen": "Sanaa",
    "Zambia": "Lusaka", "Zimbabwe": "Harare"
  },
  india: {
    "Andhra Pradesh": "Amaravati", "Arunachal Pradesh": "Itanagar",
    "Assam": "Dispur", "Bihar": "Patna", "Chhattisgarh": "Raipur",
    "Goa": "Panaji", "Gujarat": "Gandhinagar", "Haryana": "Chandigarh",
    "Himachal Pradesh": "Shimla", "Jharkhand": "Ranchi",
    "Karnataka": "Bengaluru", "Kerala": "Thiruvananthapuram",
    "Madhya Pradesh": "Bhopal", "Maharashtra": "Mumbai",
    "Manipur": "Imphal", "Meghalaya": "Shillong", "Mizoram": "Aizawl",
    "Nagaland": "Kohima", "Odisha": "Bhubaneswar", "Punjab": "Chandigarh",
    "Rajasthan": "Jaipur", "Sikkim": "Gangtok", "Tamil Nadu": "Chennai",
    "Telangana": "Hyderabad", "Tripura": "Agartala",
    "Uttar Pradesh": "Lucknow", "Uttarakhand": "Dehradun",
    "West Bengal": "Kolkata"
  },
  usa: {
    "Alabama": "Montgomery", "Alaska": "Juneau", "Arizona": "Phoenix",
    "Arkansas": "Little Rock", "California": "Sacramento",
    "Colorado": "Denver", "Connecticut": "Hartford", "Delaware": "Dover",
    "Florida": "Tallahassee", "Georgia": "Atlanta", "Hawaii": "Honolulu",
    "Idaho": "Boise", "Illinois": "Springfield", "Indiana": "Indianapolis",
    "Iowa": "Des Moines", "Kansas": "Topeka", "Kentucky": "Frankfort",
    "Louisiana": "Baton Rouge", "Maine": "Augusta", "Maryland": "Annapolis",
    "Massachusetts": "Boston", "Michigan": "Lansing", "Minnesota": "Saint Paul",
    "Mississippi": "Jackson", "Missouri": "Jefferson City",
    "Montana": "Helena", "Nebraska": "Lincoln", "Nevada": "Carson City",
    "New Hampshire": "Concord", "New Jersey": "Trenton",
    "New Mexico": "Santa Fe", "New York": "Albany",
    "North Carolina": "Raleigh", "North Dakota": "Bismarck",
    "Ohio": "Columbus", "Oklahoma": "Oklahoma City", "Oregon": "Salem",
    "Pennsylvania": "Harrisburg", "Rhode Island": "Providence",
    "South Carolina": "Columbia", "South Dakota": "Pierre",
    "Tennessee": "Nashville", "Texas": "Austin", "Utah": "Salt Lake City",
    "Vermont": "Montpelier", "Virginia": "Richmond",
    "Washington": "Olympia", "West Virginia": "Charleston",
    "Wisconsin": "Madison", "Wyoming": "Cheyenne"
  },
  europe: {
    "Germany": "Berlin", "France": "Paris", "Italy": "Rome",
    "Spain": "Madrid", "Portugal": "Lisbon", "Netherlands": "Amsterdam",
    "Belgium": "Brussels", "Luxembourg": "Luxembourg City",
    "Switzerland": "Bern", "Austria": "Vienna", "Poland": "Warsaw",
    "Czech Republic": "Prague", "Slovakia": "Bratislava",
    "Hungary": "Budapest", "Romania": "Bucharest", "Bulgaria": "Sofia",
    "Greece": "Athens", "Croatia": "Zagreb", "Slovenia": "Ljubljana",
    "Serbia": "Belgrade", "Bosnia and Herzegovina": "Sarajevo",
    "Montenegro": "Podgorica", "Albania": "Tirana",
    "North Macedonia": "Skopje", "Sweden": "Stockholm",
    "Norway": "Oslo", "Finland": "Helsinki", "Denmark": "Copenhagen",
    "Estonia": "Tallinn", "Latvia": "Riga", "Lithuania": "Vilnius",
    "Ireland": "Dublin", "United Kingdom": "London",
    "Ukraine": "Kyiv", "Belarus": "Minsk", "Moldova": "Chișinău",
    "Turkey": "Ankara", "Cyprus": "Nicosia", "Malta": "Valletta",
    "Iceland": "Reykjavik"
  }
};

// Which maps support which game types
const MAP_SUPPORT = {
  india:        { name: true,  locate: true,  flag: false, capital: true  },
  usa:          { name: true,  locate: true,  flag: false, capital: true  },
  europe:       { name: true,  locate: true,  flag: true,  capital: true  },
  northAmerica: { name: true,  locate: true,  flag: true,  capital: false },
  southAmerica: { name: true,  locate: true,  flag: true,  capital: false },
  africa:       { name: true,  locate: true,  flag: true,  capital: false },
  asia:         { name: true,  locate: true,  flag: true,  capital: false },
  oceania:      { name: true,  locate: true,  flag: true,  capital: false },
  world:        { name: true,  locate: true,  flag: true,  capital: true  },
};

/* ============================================================
   INDIA UNION TERRITORIES — Easter Egg Bonus (India map only)
   ============================================================ */
const INDIA_UTS = [
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Ladakh",
  "Lakshadweep",
  "Puducherry"
];

let currentMapKey    = "india";
let previousScreen   = "start";   // tracks where to go back to
let CURRENT_REGIONS  = MAPS[currentMapKey].regions;

const normalize = (str) => str.toLowerCase().replace(/\s+/g, "");

/** Returns "Countries" for world/continent maps, "States" for country maps */
const CONTINENT_KEYS = ["europe", "northAmerica", "southAmerica", "africa", "asia", "oceania"];
function regionLabel() {
  return (currentMapKey === "world" || CONTINENT_KEYS.includes(currentMapKey))
    ? "Countries" : "States";
}


/* ============================================================
   2. DOM REFERENCES
   ============================================================ */
const screens = {
  start:         document.getElementById("startScreen"),
  countrySelect:   document.getElementById("countrySelectScreen"),
  continentSelect: document.getElementById("continentSelectScreen"),
  setup:         document.getElementById("setupScreen"),
  challenge:     document.getElementById("challengeSettings"),
  game:          document.getElementById("gameScreen"),
  win:           document.getElementById("winScreen"),
  lose:          document.getElementById("loseScreen"),
};

const buttons = {
  typingMode:   document.getElementById("typingModeBtn"),
  locateMode:   document.getElementById("locateModeBtn"),
  flagMode:     document.getElementById("flagModeBtn"),
  capitalMode:  document.getElementById("capitalModeBtn"),
  practiceMode: document.getElementById("practiceModeBtn"),
  challengeMode:document.getElementById("challengeModeBtn"),
  startGame:    document.getElementById("startGameBtn"),
  submitAnswer: document.getElementById("submitAnswerBtn"),
  restart:      document.getElementById("restartBtn"),
  retry:        document.getElementById("retryBtn"),
};

const display = {
  score:        document.getElementById("scoreDisplay"),
  timer:        document.getElementById("timerDisplay"),
  lives:        document.getElementById("livesDisplay"),
  feedback:     document.getElementById("feedbackMessage"),
  finalTime:    document.getElementById("finalTime"),
  finalAccuracy:document.getElementById("finalAccuracy"),
  loseReason:   document.getElementById("loseReason"),
};

const stateInput    = document.getElementById("stateInput");
const inputSection  = document.getElementById("inputSection");
const indiaMap      = document.getElementById("indiaMap");
const locatePrompt  = document.getElementById("locatePrompt");
const flagContainer = document.getElementById("flagContainer");
const flagImage     = document.getElementById("flagImage");
const capitalPrompt = document.getElementById("capitalPrompt");

// New UI elements
const progressBarFill  = document.getElementById("progressBarFill");
const progressLabel    = document.getElementById("progressLabel");
const soundToggleBtn   = document.getElementById("soundToggleBtn");
const themeToggleBtn   = document.getElementById("themeToggleBtn");
const headerRestartBtn = document.getElementById("headerRestartBtn");
const locateNameEl     = locatePrompt ? locatePrompt.querySelector(".locate-name") : null;

// Feature additions
const homeStartBtn     = document.getElementById("homeStartBtn");
const livesSection     = document.getElementById("livesSection");
const streakDisplay    = document.getElementById("streakDisplay");
const finalStreak      = document.getElementById("finalStreak");
const confettiCanvas   = document.getElementById("confettiCanvas");

// Sound elements (short data-URI beeps — tiny, no external files)
const sfxCorrect = new Audio("data:audio/wav;base64,UklGRl4AAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YTgAAAA" +
  "AgICAgICAgH+AfYB7gHmAeIB3gHeAeIB6gH2AgICEgIiAjICRgJaAnACi");
const sfxWrong   = new Audio("data:audio/wav;base64,UklGRl4AAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YTgAAAA" +
  "AgICAgICAgICAgICAgICAgICAgH+AfYB7gHmAeIB4gHmAe4B/gIOAiICP");
sfxCorrect.volume = 0.18;
sfxWrong.volume   = 0.12;

// Synthesize additional sounds via AudioContext (no files needed)
function createSfx(type) {
  return {
    play() {
      if (!soundEnabled) return;
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const gain = ctx.createGain();
        gain.connect(ctx.destination);

        if (type === "streak") {
          // Ascending arpeggio
          [523, 659, 784, 1047].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            osc.type = "sine";
            osc.frequency.value = freq;
            const g = ctx.createGain();
            g.gain.setValueAtTime(0, ctx.currentTime + i * 0.08);
            g.gain.linearRampToValueAtTime(0.15, ctx.currentTime + i * 0.08 + 0.04);
            g.gain.linearRampToValueAtTime(0, ctx.currentTime + i * 0.08 + 0.12);
            osc.connect(g); g.connect(ctx.destination);
            osc.start(ctx.currentTime + i * 0.08);
            osc.stop(ctx.currentTime + i * 0.08 + 0.15);
          });
        } else if (type === "tick") {
          // Sharp tick for timer warning
          const osc = ctx.createOscillator();
          osc.type = "square";
          osc.frequency.value = 880;
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.06);
          osc.connect(gain);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.07);
        } else if (type === "win") {
          // Victory fanfare
          [523, 659, 784, 1047, 1319].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            osc.type = "triangle";
            osc.frequency.value = freq;
            const g = ctx.createGain();
            g.gain.setValueAtTime(0, ctx.currentTime + i * 0.1);
            g.gain.linearRampToValueAtTime(0.18, ctx.currentTime + i * 0.1 + 0.05);
            g.gain.linearRampToValueAtTime(0, ctx.currentTime + i * 0.1 + 0.25);
            osc.connect(g); g.connect(ctx.destination);
            osc.start(ctx.currentTime + i * 0.1);
            osc.stop(ctx.currentTime + i * 0.1 + 0.3);
          });
        } else if (type === "lose") {
          // Descending sad notes
          [392, 349, 294, 220].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            osc.type = "sine";
            osc.frequency.value = freq;
            const g = ctx.createGain();
            g.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.15);
            g.gain.linearRampToValueAtTime(0, ctx.currentTime + i * 0.15 + 0.2);
            osc.connect(g); g.connect(ctx.destination);
            osc.start(ctx.currentTime + i * 0.15);
            osc.stop(ctx.currentTime + i * 0.15 + 0.25);
          });
        }
        setTimeout(() => ctx.close(), 2000);
      } catch(_) {}
    }
  };
}

const sfxStreak = createSfx("streak");
const sfxTick   = createSfx("tick");
const sfxWin    = createSfx("win");
const sfxLose   = createSfx("lose");

let lastTickPlayed = -1; // prevent tick spam


/* ============================================================
   3. GAME STATE
   ============================================================ */
const gameState = {
  gameType:       null,   // "typing" | "locate" | "flag" | "capital"
  gameMode:       null,   // "practice" | "challenge"
  selectedTime:   null,   // seconds
  selectedLives:  null,   // number
  timeLeft:       0,
  livesLeft:      0,
  score:          0,
  bonusPoints:    0,      // UT easter egg bonus (India only)
  totalAttempts:  0,
  guessedStates:  [],
  guessedUTs:     [],     // tracked separately — don't count toward win
  missedRegions:  [],     // for review mode
  timerInterval:  null,
  startTime:      null,
  currentTarget:  null,   // for locate / flag / capital mode
  currentStreak:  0,
  bestStreak:     0,      // persists across rounds in same session
  reviewMode:     false,  // true when reviewing missed regions
};


/* ============================================================
   4. UTILITY FUNCTIONS
   ============================================================ */

/** Show one screen, hide all others — with fade transition */
function showScreen(screenName) {
  const current = Object.values(screens).find(s => !s.classList.contains("hidden"));
  // Record which screen we're leaving so back buttons know where to return
  const currentKey = Object.keys(screens).find(k => screens[k] === current);
  if (currentKey) previousScreen = currentKey;
  const next    = screens[screenName];

  if (current && current !== next) {
    current.classList.add("screen-exit");
    setTimeout(() => {
      current.classList.add("hidden");
      current.classList.remove("screen-exit");
      next.classList.remove("hidden");
      next.classList.add("screen-enter");
      setTimeout(() => next.classList.remove("screen-enter"), 350);
    }, 220);
  } else {
    Object.values(screens).forEach(s => s.classList.add("hidden"));
    next.classList.remove("hidden");
    next.classList.add("screen-enter");
    setTimeout(() => next.classList.remove("screen-enter"), 350);
  }
}

/** Update all HUD displays */
function updateHUD() {
  // Show score + bonus together so bonus feels rewarding
  display.score.textContent = gameState.score + gameState.bonusPoints;

  display.timer.textContent = gameState.gameMode === "challenge"
    ? formatTime(gameState.timeLeft)
    : "∞";

  // FIX 2: Only show numeric lives in challenge + locate mode
  if (gameState.gameMode === "challenge" && gameState.gameType === "locate") {
    display.lives.textContent = gameState.livesLeft;
  } else {
    display.lives.textContent = "∞";
  }

  // Streak display
  if (streakDisplay) streakDisplay.textContent = gameState.currentStreak;

  updateProgress();
}

/** Play a sound effect if sound is enabled */
function playSound(sfx) {
  if (!soundEnabled) return;
  // Synthesized sfx have a .play() method directly
  if (typeof sfx.play === "function" && !(sfx instanceof Audio)) {
    sfx.play();
    return;
  }
  try {
    sfx.currentTime = 0;
    sfx.play().catch(() => {}); // silently ignore autoplay policy errors
  } catch (_) {}
}

/** Update progress bar and label */
function updateProgress() {
  const count = gameState.guessedStates.length;
  let total;
  if (gameState.gameType === "flag") {
    total = getFlagRegions().length || CURRENT_REGIONS.length;
  } else if (gameState.gameType === "capital") {
    total = getCapitalRegions().length || CURRENT_REGIONS.length;
  } else {
    total = CURRENT_REGIONS.length;
  }
  const pct   = total > 0 ? (count / total) * 100 : 0;
  if (progressBarFill) {
    progressBarFill.style.width = pct + "%";
    progressBarFill.classList.remove("progress-glow");
    void progressBarFill.offsetWidth;
    progressBarFill.classList.add("progress-glow");
    setTimeout(() => progressBarFill.classList.remove("progress-glow"), 350);
  }
  const modeLabel = gameState.gameType === "flag" ? "Flags"
    : gameState.gameType === "capital" ? "Capitals"
    : regionLabel();
  if (progressLabel) progressLabel.textContent = `${count} / ${total} ${modeLabel}`;
}

/** Format seconds into MM:SS */
function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

/** Get elapsed time since game start in seconds */
function getElapsedTime() {
  return Math.floor((Date.now() - gameState.startTime) / 1000);
}

/** Get SVG document safely */
function getSvgDoc() {
  return indiaMap.contentDocument;
}

/** Get a path element from SVG by name — tries aria-label, id, title, name */
function getPathByName(name) {
  const svgDoc = getSvgDoc();
  if (!svgDoc) return null;
  // Try the most common attribute patterns SVG maps use
  return svgDoc.querySelector(`[aria-label="${name}"]`)
      || svgDoc.querySelector(`#${CSS.escape(name)}`)
      || svgDoc.querySelector(`[id="${name}"]`)
      || svgDoc.querySelector(`[name="${name}"]`)
      || svgDoc.querySelector(`[data-name="${name}"]`)
      || svgDoc.querySelector(`[title="${name}"]`)
      || (() => {
           // Last resort: find a <path> whose child <title> text matches
           const titles = svgDoc.querySelectorAll("path > title");
           for (const t of titles) {
             if (t.textContent.trim() === name) return t.parentElement;
           }
           return null;
         })();
}

/** Get the region name from a path element — inverse of getPathByName */
function getRegionName(path) {
  return path.getAttribute("aria-label")
      || path.getAttribute("name")
      || path.getAttribute("data-name")
      || path.getAttribute("title")
      || path.getAttribute("id")
      || (path.querySelector("title") ? path.querySelector("title").textContent.trim() : null);
}

/** Color a state path and trigger pulse animation on correct guess */
function colorState(name, color, animate = false) {
  const path = getPathByName(name);
  if (!path) return;
  path.style.fill = color;
  if (animate) {
    const svgDoc = getSvgDoc();
    if (svgDoc) {
      const svgRoot = svgDoc.documentElement;
      // Choose animation class based on color (purple for UTs, green for states)
      const flashClass = color === "#8b5cf6" ? "ut-correct-flash" : "state-correct-flash";
      svgRoot.classList.remove("state-correct-flash", "ut-correct-flash");
      void svgRoot.offsetWidth;
      svgRoot.classList.add(flashClass);
      setTimeout(() => svgRoot.classList.remove(flashClass), 450);
    }
  }
}

/** Flash a state red temporarily then revert + shake the map wrapper */
function flashRed(name) {
  const path = getPathByName(name);
  if (!path) return;
  const original = path.style.fill || "";
  path.style.fill = "#ef4444";

  // Shake the host-DOM wrapper (CSS can reach this, unlike SVG shadow DOM)
  const wrapper = document.getElementById("mapZoomWrapper");
  if (wrapper) {
    wrapper.classList.remove("map-shake");
    void wrapper.offsetWidth; // reflow to restart animation
    wrapper.classList.add("map-shake");
    setTimeout(() => wrapper.classList.remove("map-shake"), 400);
  }

  setTimeout(() => { path.style.fill = original; }, 600);
}

/** Show feedback message with optional style class */
function showFeedback(message, type = "") {
  display.feedback.textContent = message;
  display.feedback.className = type;
}

/** Pick a random unguessed state */
function pickRandomState() {
  const remaining = CURRENT_REGIONS.filter(s => !gameState.guessedStates.includes(s));
  if (remaining.length === 0) return null;
  return remaining[Math.floor(Math.random() * remaining.length)];
}

/** Set selected button style within a group */
function setSelectedBtn(group, selectedBtn) {
  group.forEach(btn => btn.classList.remove("selected"));
  selectedBtn.classList.add("selected");
}

/** Clear the timer interval */
function clearTimer() {
  if (gameState.timerInterval) {
    clearInterval(gameState.timerInterval);
    gameState.timerInterval = null;
  }
}

/** Reset all SVG path fills back to default color */
function resetMapStyles() {
  const svgDoc = getSvgDoc();
  if (!svgDoc) return;
  const paths = svgDoc.querySelectorAll("path");
  paths.forEach(path => {
    path.style.fill = "#e2d9d0";
  });
}


/* ============================================================
   5. CONFETTI
   ============================================================ */
function launchConfetti() {
  if (!confettiCanvas) return;

  confettiCanvas.classList.remove("hidden");
  confettiCanvas.width  = window.innerWidth;
  confettiCanvas.height = window.innerHeight;

  const ctx      = confettiCanvas.getContext("2d");
  const COLORS   = ["#E8604A","#2D9E6B","#F0C040","#FFFFFF","#F0826D","#60A8E8","#C94A34"];
  const COUNT    = 160;
  const DURATION = 5000; // ms
  const startTs  = performance.now();
  let   rafId    = null;

  // Build particles
  const particles = Array.from({ length: COUNT }, () => ({
    x:     Math.random() * confettiCanvas.width,
    y:     Math.random() * confettiCanvas.height * -1,   // start above viewport
    w:     6  + Math.random() * 9,
    h:     10 + Math.random() * 6,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    vx:    (Math.random() - 0.5) * 3,
    vy:    2  + Math.random() * 4,
    angle: Math.random() * Math.PI * 2,
    spin:  (Math.random() - 0.5) * 0.2,
  }));

  // Resize handler
  function onResize() {
    confettiCanvas.width  = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
  window.addEventListener("resize", onResize);

  function draw(ts) {
    const elapsed = ts - startTs;
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    // Fade out last 1s
    const alpha = elapsed > DURATION - 1000
      ? Math.max(0, (DURATION - elapsed) / 1000)
      : 1;

    particles.forEach(p => {
      p.x     += p.vx;
      p.y     += p.vy;
      p.angle += p.spin;

      // Reset particle when it falls off screen
      if (p.y > confettiCanvas.height + 20) {
        p.y  = -20;
        p.x  = Math.random() * confettiCanvas.width;
        p.vy = 2 + Math.random() * 4;
      }

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });

    if (elapsed < DURATION) {
      rafId = requestAnimationFrame(draw);
    } else {
      // Clean up
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      confettiCanvas.classList.add("hidden");
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(rafId);
    }
  }

  rafId = requestAnimationFrame(draw);
}


/* ============================================================
   6. TIMER LOGIC
   ============================================================ */
function startTimer() {
  clearTimer();
  lastTickPlayed = -1;
  gameState.timerInterval = setInterval(() => {
    gameState.timeLeft--;
    updateHUD();

    // Timer warning sound — play each second when ≤10s remaining
    if (gameState.timeLeft <= 10 && gameState.timeLeft !== lastTickPlayed && gameState.timeLeft > 0) {
      lastTickPlayed = gameState.timeLeft;
      playSound(sfxTick);
    }

    if (gameState.timeLeft <= 0) {
      clearTimer();
      endGame(false, "time");
    }
  }, 1000);
}


/* ============================================================
   6. CORE GAME FUNCTIONS
   ============================================================ */

/** Reset game state to defaults */
function resetGame() {
  clearTimer();
  resetMapStyles(); // Reset SVG fills before new game starts
  gameState.score          = 0;
  gameState.bonusPoints    = 0;
  gameState.totalAttempts  = 0;
  gameState.guessedStates  = [];
  gameState.guessedUTs     = [];
  gameState.missedRegions  = [];
  gameState.timerInterval  = null;
  gameState.startTime      = null;
  gameState.currentTarget  = null;
  gameState.timeLeft       = gameState.selectedTime || 0;
  gameState.currentStreak  = 0;
  gameState.reviewMode     = false;
  // bestStreak intentionally NOT reset — persists in session

  // FIX 2: Explicitly set lives only for challenge locate mode
  if (gameState.gameMode === "challenge" && gameState.gameType === "locate") {
    gameState.livesLeft = gameState.selectedLives;
  } else {
    gameState.livesLeft = 0;
  }

  stateInput.value = "";
  showFeedback("");

  // Reset progress bar
  if (progressBarFill) progressBarFill.style.width = "0%";
  if (progressLabel)   progressLabel.textContent   = `0 / ${CURRENT_REGIONS.length} ${regionLabel()}`;

  // Clear locate prompt safely — only clear the state name, keep HTML structure intact
  if (locatePrompt) {
    if (locateNameEl) locateNameEl.textContent = "";
    locatePrompt.classList.add("hidden");
  }
}

/** Start the game */
function startGame() {
  resetGame();
  gameState.startTime = Date.now();
  updateHUD();
  showScreen("game");

  // Hide all mode-specific UI first
  inputSection.classList.add("hidden");
  if (locatePrompt)  locatePrompt.classList.add("hidden");
  if (flagContainer) flagContainer.classList.add("hidden");
  if (capitalPrompt) capitalPrompt.classList.add("hidden");

  if (gameState.gameType === "typing") {
    inputSection.classList.remove("hidden");
    stateInput.placeholder = regionLabel() === "Countries" ? "Type a country name..." : "Type a state name...";
  } else if (gameState.gameType === "locate") {
    locatePrompt.classList.remove("hidden");
    // Set up locate mode — called in SVG load handler if SVG not yet loaded
    const svgDoc = getSvgDoc();
    if (svgDoc && svgDoc.querySelector("path")) {
      setupLocateMode();
    }
  } else if (gameState.gameType === "flag") {
    inputSection.classList.remove("hidden");
    flagContainer.classList.remove("hidden");
    stateInput.placeholder = "Type the country name...";
    setupFlagMode();
  } else if (gameState.gameType === "capital") {
    inputSection.classList.remove("hidden");
    capitalPrompt.classList.remove("hidden");
    stateInput.placeholder = "Type the capital city...";
    setupCapitalMode();
  }

  // Show/hide hint button — available in all text-input modes
  const hintBtnEl = document.getElementById("hintBtn");
  if (hintBtnEl) {
    hintBtnEl.classList.toggle("hidden", gameState.gameType === "locate");
  }

  if (gameState.gameMode === "challenge") {
    startTimer();
  }
}

/** End the game */
function endGame(isWin, reason = "") {
  clearTimer();

  if (isWin) {
    playSound(sfxWin);
    launchConfetti();
    // Color entire map
    CURRENT_REGIONS.forEach(s => colorState(s, "#2D9E6B"));

    if (gameState.gameMode === "challenge") {
      const elapsed = getElapsedTime();
      const accuracy = gameState.totalAttempts > 0
        ? Math.round((gameState.score / gameState.totalAttempts) * 100)
        : 100;
      display.finalTime.textContent     = formatTime(elapsed);
      display.finalAccuracy.textContent = accuracy;
    } else {
      display.finalTime.textContent     = "--";
      display.finalAccuracy.textContent = "--";
    }
    if (finalStreak) finalStreak.textContent = gameState.bestStreak;

    // UT Easter egg stat — only show on India map
    const utBonusStat = document.getElementById("utBonusStat");
    const finalUTBonus = document.getElementById("finalUTBonus");
    if (utBonusStat && finalUTBonus) {
      if (currentMapKey === "india" && gameState.guessedUTs.length > 0) {
        finalUTBonus.textContent = `+${gameState.bonusPoints} (${gameState.guessedUTs.length}/${INDIA_UTS.length} UTs)`;
        utBonusStat.classList.remove("hidden");
      } else {
        utBonusStat.classList.add("hidden");
      }
    }

    // Hide review button on win (nothing missed if you won)
    const reviewBtn = document.getElementById("reviewBtn");
    if (reviewBtn) reviewBtn.classList.add("hidden");

    showScreen("win");

  } else {
    playSound(sfxLose);

    // Populate missed regions for review (only for typing/locate/capital modes)
    if (gameState.gameType === "typing" || gameState.gameType === "capital") {
      const allRegions = gameState.gameType === "capital"
        ? getCapitalRegions()
        : CURRENT_REGIONS;
      gameState.missedRegions = allRegions.filter(r => !gameState.guessedStates.includes(r));
    } else if (gameState.gameType === "locate") {
      gameState.missedRegions = CURRENT_REGIONS.filter(r => !gameState.guessedStates.includes(r));
    } else {
      gameState.missedRegions = [];
    }

    // Build missed list display
    const missedListEl = document.getElementById("missedList");
    const reviewBtn    = document.getElementById("reviewBtn");
    if (missedListEl) {
      if (gameState.missedRegions.length > 0) {
        missedListEl.innerHTML = gameState.missedRegions
          .slice(0, 8) // cap at 8 to avoid overflow
          .map(r => `<span class="missed-tag">${r}</span>`)
          .join("");
        if (gameState.missedRegions.length > 8) {
          missedListEl.innerHTML += `<span class="missed-tag missed-more">+${gameState.missedRegions.length - 8} more</span>`;
        }
      } else {
        missedListEl.innerHTML = "<em>None — great run!</em>";
      }
    }
    if (reviewBtn) {
      reviewBtn.classList.toggle("hidden", gameState.missedRegions.length === 0);
    }

    display.loseReason.textContent = reason === "time"
      ? "⏰ Time's up! Better luck next time."
      : "💔 You ran out of lives!";
    showScreen("lose");
  }
}

/** Check win condition */
function checkWin() {
  let total;
  if (gameState.gameType === "flag") {
    total = getFlagRegions().length;
  } else if (gameState.gameType === "capital") {
    total = getCapitalRegions().length;
  } else {
    total = CURRENT_REGIONS.length;
  }
  if (gameState.guessedStates.length >= total) {
    endGame(true);
  }
}


/** Called after every correct answer — handles streak milestones */
function onStreakUpdate() {
  if (gameState.currentStreak > 0 && gameState.currentStreak % 5 === 0) {
    playSound(sfxStreak);
  }
}

/** Show the "all UTs found" achievement toast */
function showUTAchievement() {
  const existing = document.getElementById("utAchievement");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "utAchievement";
  toast.innerHTML = `
    <span class="ut-achievement-icon">🇮🇳</span>
    <div class="ut-achievement-text">
      <strong>India Expert!</strong>
      <span>You discovered all Union Territories</span>
    </div>
  `;
  document.body.appendChild(toast);

  // Animate in, then out
  requestAnimationFrame(() => toast.classList.add("ut-achievement-show"));
  setTimeout(() => {
    toast.classList.remove("ut-achievement-show");
    setTimeout(() => toast.remove(), 500);
  }, 4000);
}

/** Track a missed region (avoid duplicates) */
function trackMiss(region) {
  if (region && !gameState.missedRegions.includes(region)) {
    gameState.missedRegions.push(region);
  }
}


/* ============================================================
   7. TYPING MODE LOGIC
   ============================================================ */
function handleTypingSubmit() {
  const raw   = stateInput.value.trim();
  const input = normalize(raw);
  stateInput.value = "";

  if (!input) return;

  if (gameState.gameType === "flag") {
    handleFlagSubmit(raw, input);
    return;
  }

  if (gameState.gameType === "capital") {
    handleCapitalSubmit(raw, input);
    return;
  }

  gameState.totalAttempts++;

  // Check already guessed (states)
  const alreadyGuessed = gameState.guessedStates.find(s => normalize(s) === input);
  if (alreadyGuessed) {
    showFeedback(`Already guessed: ${alreadyGuessed}`, "wrong");
    gameState.totalAttempts--;
    return;
  }

  // ── INDIA UT EASTER EGG ────────────────────────────────────────────────────
  if (currentMapKey === "india") {
    const utMatch = INDIA_UTS.find(ut => normalize(ut) === input);
    if (utMatch) {
      if (gameState.guessedUTs.includes(utMatch)) {
        showFeedback(`Already found: ${utMatch}`, "wrong");
        gameState.totalAttempts--;
        return;
      }
      gameState.guessedUTs.push(utMatch);
      gameState.bonusPoints += 2;
      colorState(utMatch, "#8b5cf6", true);
      showFeedback(`🌟 Union Territory Bonus! +2 — ${utMatch}`, "ut-bonus");
      playSound(sfxCorrect);
      // Small streak bump but don't count toward win
      gameState.currentStreak++;
      if (gameState.currentStreak > gameState.bestStreak) gameState.bestStreak = gameState.currentStreak;
      onStreakUpdate();
      updateHUD();
      // Check if all UTs found — achievement toast
      if (gameState.guessedUTs.length === INDIA_UTS.length) {
        showUTAchievement();
      }
      return;
    }
  }
  // ──────────────────────────────────────────────────────────────────────────

  // Match against state list
  const match = CURRENT_REGIONS.find(s => normalize(s) === input);

  if (match) {
    gameState.score++;
    gameState.currentStreak++;
    if (gameState.currentStreak > gameState.bestStreak) gameState.bestStreak = gameState.currentStreak;
    gameState.guessedStates.push(match);
    colorState(match, "#2D9E6B", true);
    showFeedback(`✓ ${match}`, "correct");
    playSound(sfxCorrect);
    onStreakUpdate();
    updateHUD();
    checkWin();
  } else {
    gameState.currentStreak = 0;
    showFeedback(regionLabel() === "Countries" ? "✗ Not a valid country name." : "✗ Not a valid state name.", "wrong");
    playSound(sfxWrong);
    updateHUD();
  }
}


/* ============================================================
   FLAG MODE
   ============================================================ */

/** Get regions that have flag data for current map */
function getFlagRegions() {
  return CURRENT_REGIONS.filter(r => FLAGS[r]);
}

function setupFlagMode() {
  const available = getFlagRegions();
  if (available.length === 0) {
    showFeedback("No flag data available for this map.", "wrong");
    return;
  }
  const target = pickRandomFlagTarget();
  if (target) showFlagTarget(target);
}

function pickRandomFlagTarget() {
  const available = getFlagRegions().filter(r => !gameState.guessedStates.includes(r));
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

function showFlagTarget(name) {
  gameState.currentTarget = name;
  if (!flagContainer || !flagImage) return;
  const flagVal = FLAGS[name];
  if (!flagVal) return;

  // Use emoji rendered as large text in a div instead of img src
  const emojiEl = flagContainer.querySelector(".flag-emoji");
  if (emojiEl) {
    emojiEl.textContent = flagVal;
  } else {
    // Replace img with emoji span
    flagImage.style.display = "none";
    const span = document.createElement("div");
    span.className = "flag-emoji";
    span.textContent = flagVal;
    flagContainer.insertBefore(span, flagImage);
  }

  // Animate
  flagContainer.style.animation = "none";
  void flagContainer.offsetWidth;
  flagContainer.style.animation = "";
}

function handleFlagSubmit(raw, input) {
  if (!gameState.currentTarget) return;
  gameState.totalAttempts++;

  const correct = normalize(gameState.currentTarget);
  if (input === correct) {
    gameState.score++;
    gameState.currentStreak++;
    if (gameState.currentStreak > gameState.bestStreak) gameState.bestStreak = gameState.currentStreak;
    gameState.guessedStates.push(gameState.currentTarget);
    colorState(gameState.currentTarget, "#2D9E6B", true);
    showFeedback(`✓ ${gameState.currentTarget}`, "correct");
    playSound(sfxCorrect);
    onStreakUpdate();
    updateHUD();

    const next = pickRandomFlagTarget();
    if (next) {
      showFlagTarget(next);
    }
    checkWin();
  } else {
    gameState.currentStreak = 0;
    trackMiss(gameState.currentTarget);
    showFeedback(`✗ Not correct. Try again!`, "wrong");
    playSound(sfxWrong);
    updateHUD();

    if (gameState.gameMode === "challenge") {
      gameState.livesLeft--;
      updateHUD();
      if (gameState.livesLeft <= 0) endGame(false, "lives");
    }
  }
}


/* ============================================================
   CAPITAL MODE
   ============================================================ */

function getCapitalData() {
  // Determine which capital dataset to use
  if (currentMapKey === "world") return CAPITALS.world;
  if (CAPITALS[currentMapKey]) return CAPITALS[currentMapKey];
  // For continents without their own capital data, skip
  return null;
}

function getCapitalRegions() {
  const data = getCapitalData();
  if (!data) return [];
  return CURRENT_REGIONS.filter(r => data[r]);
}

function setupCapitalMode() {
  const available = getCapitalRegions();
  if (available.length === 0) {
    showFeedback("No capital data available for this map.", "wrong");
    return;
  }
  const target = pickRandomCapitalTarget();
  if (target) showCapitalTarget(target);
}

function pickRandomCapitalTarget() {
  const available = getCapitalRegions().filter(r => !gameState.guessedStates.includes(r));
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

function showCapitalTarget(name) {
  gameState.currentTarget = name;
  if (!capitalPrompt) return;
  const regionEl = capitalPrompt.querySelector(".capital-region");
  if (regionEl) regionEl.textContent = name;

  capitalPrompt.style.animation = "none";
  void capitalPrompt.offsetWidth;
  capitalPrompt.style.animation = "";
}

function handleCapitalSubmit(raw, input) {
  if (!gameState.currentTarget) return;
  const data = getCapitalData();
  if (!data) return;

  gameState.totalAttempts++;
  const correctCapital = data[gameState.currentTarget];
  const correctNorm = normalize(correctCapital);

  if (input === correctNorm) {
    gameState.score++;
    gameState.currentStreak++;
    if (gameState.currentStreak > gameState.bestStreak) gameState.bestStreak = gameState.currentStreak;
    gameState.guessedStates.push(gameState.currentTarget);
    colorState(gameState.currentTarget, "#2D9E6B", true);
    showFeedback(`✓ ${correctCapital}`, "correct");
    playSound(sfxCorrect);
    onStreakUpdate();
    updateHUD();

    const next = pickRandomCapitalTarget();
    if (next) {
      showCapitalTarget(next);
    }
    checkWin();
  } else {
    gameState.currentStreak = 0;
    trackMiss(gameState.currentTarget);
    showFeedback(`✗ Incorrect. Hint: starts with "${correctCapital[0]}"`, "wrong");
    playSound(sfxWrong);
    updateHUD();

    if (gameState.gameMode === "challenge") {
      gameState.livesLeft--;
      updateHUD();
      if (gameState.livesLeft <= 0) endGame(false, "lives");
    }
  }
}


/* ============================================================
   8. LOCATE MODE LOGIC
   ============================================================ */

/** Display the target state prompt */
function showLocateTarget(name) {
  if (!locatePrompt) return;

  // Always query fresh in case DOM was modified
  const nameEl = locatePrompt.querySelector(".locate-name");

  if (nameEl) {
    nameEl.textContent = name;
  } else {
    // Fallback: set text directly if span structure is missing
    locatePrompt.textContent = "Find: " + name;
  }

  // Ensure prompt is visible
  locatePrompt.classList.remove("hidden");

  // Restart fade-in animation
  locatePrompt.style.animation = "none";
  void locatePrompt.offsetWidth;
  locatePrompt.style.animation = "";
}

/** Attach click listeners to all SVG paths for locate mode */
function setupLocateMode() {
  const svgDoc = getSvgDoc();
  if (!svgDoc) return;

  const paths = svgDoc.querySelectorAll("path");
  paths.forEach(path => {
    path.style.cursor = "pointer";
    path.addEventListener("click", handleLocateClick);
  });

  // Pick first target
  gameState.currentTarget = pickRandomState();
  if (gameState.currentTarget) showLocateTarget(gameState.currentTarget);
}

/** Handle a click on the SVG map in locate mode */
function handleLocateClick(e) {
  const clicked = getRegionName(e.target);
  if (!clicked) return;

  // Ignore already guessed states
  if (gameState.guessedStates.includes(clicked)) return;

  gameState.totalAttempts++;

  if (clicked === gameState.currentTarget) {
    // Correct
    gameState.score++;
    gameState.currentStreak++;
    if (gameState.currentStreak > gameState.bestStreak) gameState.bestStreak = gameState.currentStreak;
    gameState.guessedStates.push(clicked);
    colorState(clicked, "#2D9E6B", true);
    playSound(sfxCorrect);
    onStreakUpdate();
    updateHUD();

    const next = pickRandomState();
    if (next) {
      gameState.currentTarget = next;
      showLocateTarget(next);
    }

    checkWin();

  } else {
    // Wrong
    gameState.currentStreak = 0;
    trackMiss(gameState.currentTarget);
    flashRed(clicked);
    playSound(sfxWrong);
    updateHUD();

    if (gameState.gameMode === "challenge") {
      gameState.livesLeft--;
      updateHUD();
      if (gameState.livesLeft <= 0) {
        endGame(false, "lives");
      }
    }
  }
}


/* ============================================================
   9. CHALLENGE SETTINGS — SELECTION TRACKING
   ============================================================ */
const timerButtons = document.querySelectorAll("#timerSection button[data-time]");
const livesButtons = document.querySelectorAll("#livesSection button[data-lives]");

timerButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    gameState.selectedTime = parseInt(btn.dataset.time);
    setSelectedBtn([...timerButtons], btn);
  });
});

livesButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    gameState.selectedLives = parseInt(btn.dataset.lives);
    setSelectedBtn([...livesButtons], btn);
  });
});


/* ============================================================
   10. MAP SELECTION HELPER
   ============================================================ */

/** Apply a map key: update CURRENT_REGIONS, swap SVG, update all labels */
function applyMap(mapKey) {
  currentMapKey   = mapKey;
  CURRENT_REGIONS = MAPS[mapKey].regions;

  indiaMap.data = MAPS[mapKey].svg;

  // Update game-screen header subtitle
  const headerSubEl = document.getElementById("headerSub");
  if (headerSubEl) headerSubEl.textContent = MAPS[mapKey].name + " Edition";

  // Update setup screen subtitle
  const setupSub = document.getElementById("setupSubtitle");
  if (setupSub) {
    const continentKeys = ["europe", "northAmerica", "southAmerica", "africa", "asia", "oceania"];
    let descriptor;
    if (mapKey === "world") {
      descriptor = "countries of the World";
    } else if (continentKeys.includes(mapKey)) {
      descriptor = "countries of " + MAPS[mapKey].name;
    } else {
      descriptor = "states of " + MAPS[mapKey].name;
    }
    setupSub.textContent = "How well do you know the " + descriptor + "?";
  }

  // Light state reset (gameMode not set yet)
  clearTimer();
  gameState.score         = 0;
  gameState.totalAttempts = 0;
  gameState.guessedStates = [];
  gameState.currentStreak = 0;
  gameState.currentTarget = null;

  if (progressBarFill) progressBarFill.style.width = "0%";
  if (progressLabel)   progressLabel.textContent   = "0 / " + CURRENT_REGIONS.length + " " + regionLabel();

  // Update which game type buttons are enabled for this map
  updateGameTypeAvailability();
}

/** Deselect all setup-screen buttons and reset game type/mode */
function resetSetupSelections() {
  gameState.gameType = null;
  gameState.gameMode = null;
  [buttons.typingMode, buttons.locateMode, buttons.flagMode, buttons.capitalMode,
   buttons.practiceMode, buttons.challengeMode]
    .forEach(b => b && b.classList.remove("selected"));
  if (homeStartBtn) homeStartBtn.disabled = true;
  updateGameTypeAvailability();
}


/* ============================================================
   11. SCOPE BUTTONS — START SCREEN
   ============================================================ */
const countryScopeBtn   = document.getElementById("countryScopeBtn");
const continentScopeBtn = document.getElementById("continentScopeBtn");
const worldScopeBtn     = document.getElementById("worldScopeBtn");

if (countryScopeBtn) {
  countryScopeBtn.addEventListener("click", () => {
    showScreen("countrySelect");
  });
}

if (continentScopeBtn) {
  continentScopeBtn.addEventListener("click", () => {
    showScreen("continentSelect");
  });
}

if (worldScopeBtn) {
  worldScopeBtn.addEventListener("click", () => {
    applyMap("world");
    resetSetupSelections();
    showScreen("setup");
  });
}


/* ============================================================
   11b. COUNTRY SELECT SCREEN
   ============================================================ */
const countryButtons     = document.querySelectorAll(".country-btn");
const countryContinueBtn = document.getElementById("countryContinueBtn");

countryButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    countryButtons.forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    applyMap(btn.dataset.country);
    if (countryContinueBtn) countryContinueBtn.disabled = false;
  });
});

if (countryContinueBtn) {
  countryContinueBtn.addEventListener("click", () => {
    if (!currentMapKey) return;
    resetSetupSelections();
    showScreen("setup");
  });
}




/* ============================================================
   11b-ii. CONTINENT SELECT SCREEN
   ============================================================ */
const continentButtons = document.querySelectorAll(".continent-btn");

continentButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    continentButtons.forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    applyMap(btn.dataset.continent);
    resetSetupSelections();
    showScreen("setup");
  });
});

const continentBackBtn = document.getElementById("continentBackBtn");
if (continentBackBtn) {
  continentBackBtn.addEventListener("click", () => {
    continentButtons.forEach(b => b.classList.remove("selected"));
    showScreen("start");
  });
}


/* ============================================================
   BACK BUTTON LISTENERS
   ============================================================ */
const countryBackBtn   = document.getElementById("countryBackBtn");
const setupBackBtn     = document.getElementById("setupBackBtn");
const challengeBackBtn = document.getElementById("challengeBackBtn");

// countrySelectScreen → start
if (countryBackBtn) {
  countryBackBtn.addEventListener("click", () => {
    // Reset any country selection
    document.querySelectorAll(".country-btn").forEach(b => b.classList.remove("selected"));
    const countryContinueBtn = document.getElementById("countryContinueBtn");
    if (countryContinueBtn) countryContinueBtn.disabled = true;
    showScreen("start");
  });
}

// setupScreen → countrySelect (if came from country) or start (if came from world)
if (setupBackBtn) {
  setupBackBtn.addEventListener("click", () => {
    const dest = previousScreen === "countrySelect" ? "countrySelect"
               : previousScreen === "continentSelect" ? "continentSelect"
               : "start";
    showScreen(dest);
  });
}

// challengeSettings → setup
if (challengeBackBtn) {
  challengeBackBtn.addEventListener("click", () => {
    showScreen("setup");
  });
}
/* ============================================================
   11c. SETUP SCREEN — game type + mode
   ============================================================ */
const gameTypeButtons = [buttons.typingMode, buttons.locateMode, buttons.flagMode, buttons.capitalMode];
const gameModeButtons = [buttons.practiceMode, buttons.challengeMode];

/** Enable/disable Start Game button */
function validateHomeStart() {
  if (homeStartBtn) {
    homeStartBtn.disabled = !(gameState.gameType && gameState.gameMode);
  }
}

/** Update challenge button availability based on current map */
function updateGameTypeAvailability() {
  const support = MAP_SUPPORT[currentMapKey] || { name: true, locate: true, flag: false, capital: false };
  if (buttons.typingMode)  buttons.typingMode.disabled  = !support.name;
  if (buttons.locateMode)  buttons.locateMode.disabled  = !support.locate;
  if (buttons.flagMode)    buttons.flagMode.disabled    = !support.flag;
  if (buttons.capitalMode) buttons.capitalMode.disabled = !support.capital;

  // Deselect any now-disabled selection
  if (gameState.gameType === "flag"    && !support.flag)    { gameState.gameType = null; buttons.flagMode?.classList.remove("selected"); }
  if (gameState.gameType === "capital" && !support.capital) { gameState.gameType = null; buttons.capitalMode?.classList.remove("selected"); }
  validateHomeStart();
}

/** Show/hide lives section based on game type */
function updateLivesSectionVisibility() {
  if (!livesSection) return;
  if (gameState.gameType === "typing" || gameState.gameType === "flag" || gameState.gameType === "capital") {
    livesSection.classList.add("lives-hidden");
    gameState.selectedLives = null;
    document.querySelectorAll("#livesSection button").forEach(b => b.classList.remove("selected"));
  } else {
    livesSection.classList.remove("lives-hidden");
  }
}

buttons.typingMode.addEventListener("click", () => {
  gameState.gameType = "typing";
  setSelectedBtn(gameTypeButtons.filter(b => b), buttons.typingMode);
  updateLivesSectionVisibility();
  validateHomeStart();
});

buttons.locateMode.addEventListener("click", () => {
  gameState.gameType = "locate";
  setSelectedBtn(gameTypeButtons.filter(b => b), buttons.locateMode);
  updateLivesSectionVisibility();
  validateHomeStart();
});

if (buttons.flagMode) {
  buttons.flagMode.addEventListener("click", () => {
    gameState.gameType = "flag";
    setSelectedBtn(gameTypeButtons.filter(b => b), buttons.flagMode);
    updateLivesSectionVisibility();
    validateHomeStart();
  });
}

if (buttons.capitalMode) {
  buttons.capitalMode.addEventListener("click", () => {
    gameState.gameType = "capital";
    setSelectedBtn(gameTypeButtons.filter(b => b), buttons.capitalMode);
    updateLivesSectionVisibility();
    validateHomeStart();
  });
}

buttons.practiceMode.addEventListener("click", () => {
  gameState.gameMode = "practice";
  setSelectedBtn(gameModeButtons, buttons.practiceMode);
  validateHomeStart();
});

buttons.challengeMode.addEventListener("click", () => {
  gameState.gameMode = "challenge";
  setSelectedBtn(gameModeButtons, buttons.challengeMode);
  validateHomeStart();
});

if (homeStartBtn) {
  homeStartBtn.addEventListener("click", () => {
    if (!gameState.gameType || !gameState.gameMode) return;
    if (gameState.gameMode === "challenge") {
      showScreen("challenge");
    } else {
      gameState.selectedTime  = null;
      gameState.selectedLives = null;
      startGame();
    }
  });
}


/* ============================================================
   12. EVENT LISTENERS — CHALLENGE SETTINGS SCREEN
   ============================================================ */
buttons.startGame.addEventListener("click", () => {
  if (!gameState.selectedTime) {
    alert("Please select a timer duration.");
    return;
  }
  if (gameState.gameType === "locate" && !gameState.selectedLives) {
    alert("Please select number of lives.");
    return;
  }

  gameState.timeLeft  = gameState.selectedTime;
  gameState.livesLeft = gameState.selectedLives || 0;

  startGame();
});


/* ============================================================
   13. EVENT LISTENERS — GAME SCREEN
   ============================================================ */
buttons.submitAnswer.addEventListener("click", handleTypingSubmit);

stateInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleTypingSubmit();
});


/* ============================================================
   14. EVENT LISTENERS — WIN / LOSE SCREENS
   ============================================================ */
buttons.restart.addEventListener("click", () => {
  showScreen("start");
});

buttons.retry.addEventListener("click", () => {
  showScreen("start");
});

// Hint button
const hintBtn = document.getElementById("hintBtn");
if (hintBtn) {
  hintBtn.addEventListener("click", () => {
    useHint();
  });
}

// Review missed regions button
const reviewBtn = document.getElementById("reviewBtn");
if (reviewBtn) {
  reviewBtn.addEventListener("click", () => {
    enterReviewMode();
  });
}


/* ============================================================
   15. HEADER BUTTON LISTENERS
   ============================================================ */

// Sound toggle
let soundEnabled = true;
if (soundToggleBtn) {
  soundToggleBtn.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    soundToggleBtn.textContent = soundEnabled ? "🔊" : "🔇";
  });
}

// Theme toggle — with localStorage persistence
let darkMode = false;

// Load saved theme on startup (before first paint)
const savedTheme = localStorage.getItem("mapmaster-theme");
if (savedTheme === "dark") {
  darkMode = true;
  document.body.classList.add("dark-theme");
  if (themeToggleBtn) themeToggleBtn.textContent = "☀️";
}

if (themeToggleBtn) {
  themeToggleBtn.addEventListener("click", () => {
    darkMode = !darkMode;
    document.body.classList.toggle("dark-theme", darkMode);
    localStorage.setItem("mapmaster-theme", darkMode ? "dark" : "light");
    themeToggleBtn.textContent = darkMode ? "☀️" : "🌙";
  });
}

// Header restart button → go back to start screen
if (headerRestartBtn) {
  headerRestartBtn.addEventListener("click", () => {
    clearTimer();
    showScreen("start");
  });
}

/* ============================================================
   REVIEW MODE
   ============================================================ */
function enterReviewMode() {
  gameState.reviewMode = true;
  showScreen("game");

  // Hide all interactive UI
  inputSection.classList.add("hidden");
  if (locatePrompt)  locatePrompt.classList.add("hidden");
  if (flagContainer) flagContainer.classList.add("hidden");
  if (capitalPrompt) capitalPrompt.classList.add("hidden");

  // Reset map visually then colour states
  const svgDoc = getSvgDoc();
  if (svgDoc) {
    svgDoc.querySelectorAll("path").forEach(p => { p.style.fill = "#e2d9d0"; });
  }

  // Green = correctly guessed, red = missed
  gameState.guessedStates.forEach(r => colorState(r, "#2D9E6B"));
  gameState.missedRegions.forEach(r => colorState(r, "#ef4444"));

  // Show a review banner inside the map container
  const existing = document.getElementById("reviewBanner");
  if (existing) existing.remove();
  const banner = document.createElement("div");
  banner.id = "reviewBanner";
  banner.innerHTML = `
    <span class="review-title">📖 Review Mode</span>
    <span class="review-sub">🟢 Guessed &nbsp; 🔴 Missed (${gameState.missedRegions.length})</span>
    <button id="reviewExitBtn">← Back to Menu</button>
  `;
  const mapCont = document.getElementById("mapContainer");
  if (mapCont) mapCont.prepend(banner);

  document.getElementById("reviewExitBtn")?.addEventListener("click", () => {
    banner.remove();
    showScreen("start");
  });
}

/* ============================================================
   HINT SYSTEM
   ============================================================ */
function generateHint() {
  const type = gameState.gameType;

  if (type === "typing") {
    // Pick a random unguessed region to hint at
    const unguessed = CURRENT_REGIONS.filter(r => !gameState.guessedStates.includes(r));
    if (unguessed.length === 0) return null;
    const pick = unguessed[Math.floor(Math.random() * unguessed.length)];
    return `Try: ${pick[0]}${"_".repeat(pick.length - 1)}  (${pick.length} letters)`;
  }

  const target = gameState.currentTarget;
  if (!target) return null;

  if (type === "flag") {
    return `Country starts with "${target[0]}"`;
  } else if (type === "capital") {
    const data = getCapitalData();
    const capital = data ? data[target] : null;
    return capital ? `Capital starts with "${capital[0]}"` : `Region: ${target[0]}...`;
  } else if (type === "locate") {
    // Flash the target region yellow on the map
    const path = getPathByName(target);
    if (path) {
      const orig = path.style.fill;
      path.style.fill = "#F0C040";
      setTimeout(() => { path.style.fill = orig; }, 1200);
    }
    return `Highlighted on map for 1 second`;
  }
  return null;
}

function useHint() {
  if (gameState.reviewMode) return;

  const hint = generateHint();
  if (!hint) return;

  // Penalise
  if (gameState.gameMode === "challenge") {
    if (gameState.gameType === "locate") {
      gameState.livesLeft = Math.max(0, gameState.livesLeft - 1);
    } else {
      gameState.timeLeft = Math.max(0, gameState.timeLeft - 10);
    }
    updateHUD();
  }

  showFeedback(`💡 ${hint}`, "hint");
}


/* ============================================================
   16. SVG LOAD HANDLER
   ============================================================ */
indiaMap.addEventListener("load", () => {
  const svgDoc = getSvgDoc();
  if (!svgDoc) return;

  const svgRoot = svgDoc.documentElement;

  // ── Auto-fit viewBox to actual path content ──────────────────────────────
  // Some SVGs (e.g. europe.svg) have a viewBox whose origin doesn't match
  // where the paths actually sit, causing only a corner to appear.
  // We compute the real bounding box of all paths and set the viewBox to that.
  try {
    const allPaths = Array.from(svgDoc.querySelectorAll("path"));
    if (allPaths.length > 0) {
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      allPaths.forEach(p => {
        try {
          const bb = p.getBBox();
          if (bb.width > 0 || bb.height > 0) {
            minX = Math.min(minX, bb.x);
            minY = Math.min(minY, bb.y);
            maxX = Math.max(maxX, bb.x + bb.width);
            maxY = Math.max(maxY, bb.y + bb.height);
          }
        } catch(e) {}
      });
      if (isFinite(minX)) {
        const pad = (maxX - minX) * 0.02; // 2% padding around edges
        svgRoot.setAttribute("viewBox",
          `${minX - pad} ${minY - pad} ${(maxX - minX) + pad * 2} ${(maxY - minY) + pad * 2}`
        );
      }
    }
  } catch(e) {}

  svgRoot.setAttribute("width",  "100%");
  svgRoot.setAttribute("height", "100%");
  svgRoot.style.width  = "100%";
  svgRoot.style.height = "100%";
  svgRoot.setAttribute("preserveAspectRatio", "xMidYMid meet");

  // Style all paths for default appearance
  const paths = svgDoc.querySelectorAll("path");
  paths.forEach(path => {
    path.style.fill        = "#e2d9d0";
    path.style.stroke      = "#b8a89e";
    path.style.strokeWidth = "0.5";
    path.style.transition  = "fill 0.2s ease";
  });

  // Hover effect via SVG-level listeners
  paths.forEach(path => {
    path.addEventListener("mouseenter", () => {
      const label = getRegionName(path);
      if (label && !gameState.guessedStates.includes(label)) {
        path.style.fill = "#f0a898";
      }
    });
    path.addEventListener("mouseleave", () => {
      const label = getRegionName(path);
      if (label && !gameState.guessedStates.includes(label)) {
        path.style.fill = "#e2d9d0";
      }
    });
  });

  // FIX 1: If game already started in locate mode, set up locate listeners now
  if (gameState.gameType === "locate" && gameState.guessedStates !== null && gameState.startTime) {
    setupLocateMode();
  }

  // Review mode — re-apply colours if SVG reloads during review
  if (gameState.reviewMode) {
    gameState.guessedStates.forEach(r => colorState(r, "#2D9E6B"));
    gameState.missedRegions.forEach(r => colorState(r, "#ef4444"));
  }
});

/* ============================================================
   17. MAP ZOOM + PAN
   ============================================================ */
(function setupZoomPan() {
  const container = document.getElementById("mapContainer");
  const wrapper   = document.getElementById("mapZoomWrapper");
  if (!container || !wrapper) return;

  let scale = 1, tx = 0, ty = 0;
  let dragging = false, startX = 0, startY = 0, startTx = 0, startTy = 0;

  function clampTranslate() {
    // Limit pan so map can't be dragged fully offscreen
    const maxT = (scale - 1) * 50; // generous limit in percent-equivalent
    tx = Math.max(-maxT * 5, Math.min(maxT * 5, tx));
    ty = Math.max(-maxT * 5, Math.min(maxT * 5, ty));
  }

  function applyTransform() {
    clampTranslate();
    wrapper.style.transform = `scale(${scale}) translate(${tx}px, ${ty}px)`;
    wrapper.style.cursor = scale > 1 ? (dragging ? "grabbing" : "grab") : "default";
  }

  // Zoom via scroll wheel — zoom toward cursor
  container.addEventListener("wheel", e => {
    e.preventDefault();
    const prev = scale;
    const factor = e.deltaY < 0 ? 1.12 : 0.9;
    scale = Math.min(Math.max(1, scale * factor), 6);

    if (scale > 1) {
      const rect = wrapper.getBoundingClientRect();
      // Cursor position relative to wrapper centre, in unscaled coords
      const cx = (e.clientX - rect.left  - rect.width  / 2) / prev;
      const cy = (e.clientY - rect.top   - rect.height / 2) / prev;
      tx -= cx * (scale - prev);
      ty -= cy * (scale - prev);
    } else {
      tx = 0; ty = 0; // reset when fully zoomed out
    }
    applyTransform();
  }, { passive: false });

  // Pan — drag only when zoomed in
  container.addEventListener("mousedown", e => {
    if (scale <= 1) return;
    dragging = true;
    startX = e.clientX; startY = e.clientY;
    startTx = tx; startTy = ty;
    applyTransform();
    e.preventDefault();
  });

  window.addEventListener("mousemove", e => {
    if (!dragging) return;
    tx = startTx + (e.clientX - startX) / scale;
    ty = startTy + (e.clientY - startY) / scale;
    applyTransform();
  });

  window.addEventListener("mouseup", () => {
    if (!dragging) return;
    dragging = false;
    applyTransform();
  });

  // Touch pinch zoom
  let lastPinchDist = null;
  container.addEventListener("touchstart", e => {
    if (e.touches.length === 2) {
      lastPinchDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  }, { passive: true });

  container.addEventListener("touchmove", e => {
    if (e.touches.length === 2 && lastPinchDist) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      scale = Math.min(Math.max(1, scale * (dist / lastPinchDist)), 6);
      lastPinchDist = dist;
      if (scale === 1) { tx = 0; ty = 0; }
      applyTransform();
    }
  }, { passive: true });

  container.addEventListener("touchend", () => { lastPinchDist = null; });

  // Double-click → reset zoom
  container.addEventListener("dblclick", () => {
    scale = 1; tx = 0; ty = 0;
    applyTransform();
  });
})();
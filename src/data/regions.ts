/**
 * Region and language choices for the header's region selector
 * (components/global/RegionSelector). Owner, 2026-10-27: a Cosentino-style
 * button by the logo; continents, then countries, then languages; every
 * country listed, its main language picked for the visitor, and any other
 * language available. The site's content stays the same everywhere; a
 * language only switches on Google Translate for the page.
 *
 * Language codes are Google Translate's (Hebrew is "iw", Filipino "tl",
 * Javanese "jw", Chinese "zh-CN" / "zh-TW").
 *
 * Each country's first language is the one chosen for it. English comes
 * first where it is an official language most business is done in (India,
 * Singapore, Nigeria...), the country's own language everywhere else.
 */

export interface Language {
  /** Google Translate code. */
  code: string;
  /** Name in the language itself, so a visitor can find their own. */
  native: string;
  /** English name, shown beside it. */
  english: string;
}

export const LANGUAGES: Language[] = [
  { code: "en", native: "English", english: "English" },
  { code: "af", native: "Afrikaans", english: "Afrikaans" },
  { code: "sq", native: "Shqip", english: "Albanian" },
  { code: "am", native: "አማርኛ", english: "Amharic" },
  { code: "ar", native: "العربية", english: "Arabic" },
  { code: "hy", native: "Հայերեն", english: "Armenian" },
  { code: "as", native: "অসমীয়া", english: "Assamese" },
  { code: "ay", native: "Aymar aru", english: "Aymara" },
  { code: "az", native: "Azərbaycanca", english: "Azerbaijani" },
  { code: "bm", native: "Bamanankan", english: "Bambara" },
  { code: "eu", native: "Euskara", english: "Basque" },
  { code: "be", native: "Беларуская", english: "Belarusian" },
  { code: "bn", native: "বাংলা", english: "Bengali" },
  { code: "bs", native: "Bosanski", english: "Bosnian" },
  { code: "bg", native: "Български", english: "Bulgarian" },
  { code: "ca", native: "Català", english: "Catalan" },
  { code: "ceb", native: "Cebuano", english: "Cebuano" },
  { code: "ny", native: "Chichewa", english: "Chichewa" },
  { code: "zh-CN", native: "简体中文", english: "Chinese (Simplified)" },
  { code: "zh-TW", native: "繁體中文", english: "Chinese (Traditional)" },
  { code: "hr", native: "Hrvatski", english: "Croatian" },
  { code: "cs", native: "Čeština", english: "Czech" },
  { code: "da", native: "Dansk", english: "Danish" },
  { code: "dv", native: "ދިވެހި", english: "Dhivehi" },
  { code: "nl", native: "Nederlands", english: "Dutch" },
  { code: "et", native: "Eesti", english: "Estonian" },
  { code: "ee", native: "Eʋegbe", english: "Ewe" },
  { code: "tl", native: "Filipino", english: "Filipino" },
  { code: "fi", native: "Suomi", english: "Finnish" },
  { code: "fr", native: "Français", english: "French" },
  { code: "gl", native: "Galego", english: "Galician" },
  { code: "ka", native: "ქართული", english: "Georgian" },
  { code: "de", native: "Deutsch", english: "German" },
  { code: "el", native: "Ελληνικά", english: "Greek" },
  { code: "gn", native: "Avañe'ẽ", english: "Guarani" },
  { code: "gu", native: "ગુજરાતી", english: "Gujarati" },
  { code: "ht", native: "Kreyòl ayisyen", english: "Haitian Creole" },
  { code: "ha", native: "Hausa", english: "Hausa" },
  { code: "iw", native: "עברית", english: "Hebrew" },
  { code: "hi", native: "हिन्दी", english: "Hindi" },
  { code: "hu", native: "Magyar", english: "Hungarian" },
  { code: "is", native: "Íslenska", english: "Icelandic" },
  { code: "ig", native: "Igbo", english: "Igbo" },
  { code: "ilo", native: "Ilokano", english: "Ilocano" },
  { code: "id", native: "Bahasa Indonesia", english: "Indonesian" },
  { code: "ga", native: "Gaeilge", english: "Irish" },
  { code: "it", native: "Italiano", english: "Italian" },
  { code: "ja", native: "日本語", english: "Japanese" },
  { code: "jw", native: "Basa Jawa", english: "Javanese" },
  { code: "kn", native: "ಕನ್ನಡ", english: "Kannada" },
  { code: "kk", native: "Қазақ тілі", english: "Kazakh" },
  { code: "km", native: "ខ្មែរ", english: "Khmer" },
  { code: "rw", native: "Kinyarwanda", english: "Kinyarwanda" },
  { code: "ko", native: "한국어", english: "Korean" },
  { code: "kri", native: "Krio", english: "Krio" },
  { code: "ku", native: "Kurdî", english: "Kurdish (Kurmanji)" },
  { code: "ckb", native: "کوردی", english: "Kurdish (Sorani)" },
  { code: "ky", native: "Кыргызча", english: "Kyrgyz" },
  { code: "lo", native: "ລາວ", english: "Lao" },
  { code: "lv", native: "Latviešu", english: "Latvian" },
  { code: "ln", native: "Lingála", english: "Lingala" },
  { code: "lt", native: "Lietuvių", english: "Lithuanian" },
  { code: "lg", native: "Luganda", english: "Luganda" },
  { code: "lb", native: "Lëtzebuergesch", english: "Luxembourgish" },
  { code: "mk", native: "Македонски", english: "Macedonian" },
  { code: "mai", native: "मैथिली", english: "Maithili" },
  { code: "mg", native: "Malagasy", english: "Malagasy" },
  { code: "ms", native: "Bahasa Melayu", english: "Malay" },
  { code: "ml", native: "മലയാളം", english: "Malayalam" },
  { code: "mt", native: "Malti", english: "Maltese" },
  { code: "mi", native: "Māori", english: "Maori" },
  { code: "mr", native: "मराठी", english: "Marathi" },
  { code: "mn", native: "Монгол", english: "Mongolian" },
  { code: "my", native: "မြန်မာ", english: "Myanmar (Burmese)" },
  { code: "ne", native: "नेपाली", english: "Nepali" },
  { code: "nso", native: "Sepedi", english: "Northern Sotho" },
  { code: "no", native: "Norsk", english: "Norwegian" },
  { code: "or", native: "ଓଡ଼ିଆ", english: "Odia" },
  { code: "om", native: "Afaan Oromoo", english: "Oromo" },
  { code: "ps", native: "پښتو", english: "Pashto" },
  { code: "fa", native: "فارسی", english: "Persian" },
  { code: "pl", native: "Polski", english: "Polish" },
  { code: "pt", native: "Português", english: "Portuguese" },
  { code: "pa", native: "ਪੰਜਾਬੀ", english: "Punjabi" },
  { code: "qu", native: "Runasimi", english: "Quechua" },
  { code: "ro", native: "Română", english: "Romanian" },
  { code: "ru", native: "Русский", english: "Russian" },
  { code: "sm", native: "Gagana Samoa", english: "Samoan" },
  { code: "sr", native: "Српски", english: "Serbian" },
  { code: "st", native: "Sesotho", english: "Sesotho" },
  { code: "sn", native: "chiShona", english: "Shona" },
  { code: "sd", native: "سنڌي", english: "Sindhi" },
  { code: "si", native: "සිංහල", english: "Sinhala" },
  { code: "sk", native: "Slovenčina", english: "Slovak" },
  { code: "sl", native: "Slovenščina", english: "Slovenian" },
  { code: "so", native: "Soomaali", english: "Somali" },
  { code: "es", native: "Español", english: "Spanish" },
  { code: "su", native: "Basa Sunda", english: "Sundanese" },
  { code: "sw", native: "Kiswahili", english: "Swahili" },
  { code: "sv", native: "Svenska", english: "Swedish" },
  { code: "tg", native: "Тоҷикӣ", english: "Tajik" },
  { code: "ta", native: "தமிழ்", english: "Tamil" },
  { code: "te", native: "తెలుగు", english: "Telugu" },
  { code: "th", native: "ไทย", english: "Thai" },
  { code: "ti", native: "ትግርኛ", english: "Tigrinya" },
  { code: "ts", native: "Xitsonga", english: "Tsonga" },
  { code: "tr", native: "Türkçe", english: "Turkish" },
  { code: "tk", native: "Türkmençe", english: "Turkmen" },
  { code: "ak", native: "Twi", english: "Twi" },
  { code: "uk", native: "Українська", english: "Ukrainian" },
  { code: "ur", native: "اردو", english: "Urdu" },
  { code: "uz", native: "Oʻzbekcha", english: "Uzbek" },
  { code: "vi", native: "Tiếng Việt", english: "Vietnamese" },
  { code: "cy", native: "Cymraeg", english: "Welsh" },
  { code: "xh", native: "isiXhosa", english: "Xhosa" },
  { code: "yo", native: "Yorùbá", english: "Yoruba" },
  { code: "zu", native: "isiZulu", english: "Zulu" },
];

const BY_CODE = new Map(LANGUAGES.map((l) => [l.code, l]));

export function languageByCode(code: string): Language | undefined {
  return BY_CODE.get(code);
}

export interface Country {
  /** ISO 3166-1 alpha-2, as Vercel's x-vercel-ip-country reports it. */
  code: string;
  name: string;
  /** Shorter label for the header button, where the name runs long. */
  short?: string;
  /** Language codes, the one chosen for the country first. */
  langs: string[];
}

export interface Continent {
  id: string;
  name: string;
  countries: Country[];
}

const c = (
  code: string,
  name: string,
  langs: string[],
  short?: string
): Country => ({ code, name, langs, short });

export const CONTINENTS: Continent[] = [
  {
    id: "africa",
    name: "Africa",
    countries: [
      c("DZ", "Algeria", ["ar", "fr"]),
      c("AO", "Angola", ["pt"]),
      c("BJ", "Benin", ["fr", "yo"]),
      c("BW", "Botswana", ["en"]),
      c("BF", "Burkina Faso", ["fr"]),
      c("BI", "Burundi", ["fr", "en"]),
      c("CV", "Cabo Verde", ["pt"]),
      c("CM", "Cameroon", ["fr", "en"]),
      c("CF", "Central African Republic", ["fr"], "C. African Rep."),
      c("TD", "Chad", ["fr", "ar"]),
      c("KM", "Comoros", ["fr", "ar"]),
      c("CG", "Congo", ["fr", "ln"]),
      c("CD", "Congo (DRC)", ["fr", "ln", "sw"]),
      c("CI", "Côte d'Ivoire", ["fr"]),
      c("DJ", "Djibouti", ["fr", "ar", "so"]),
      c("EG", "Egypt", ["ar", "en"]),
      c("GQ", "Equatorial Guinea", ["es", "fr", "pt"], "Eq. Guinea"),
      c("ER", "Eritrea", ["ti", "ar", "en"]),
      c("SZ", "Eswatini", ["en"]),
      c("ET", "Ethiopia", ["am", "om", "ti", "en"]),
      c("GA", "Gabon", ["fr"]),
      c("GM", "Gambia", ["en"]),
      c("GH", "Ghana", ["en", "ak", "ee"]),
      c("GN", "Guinea", ["fr"]),
      c("GW", "Guinea-Bissau", ["pt"]),
      c("KE", "Kenya", ["en", "sw"]),
      c("LS", "Lesotho", ["en", "st"]),
      c("LR", "Liberia", ["en"]),
      c("LY", "Libya", ["ar"]),
      c("MG", "Madagascar", ["mg", "fr"]),
      c("MW", "Malawi", ["en", "ny"]),
      c("ML", "Mali", ["fr", "bm"]),
      c("MR", "Mauritania", ["ar", "fr"]),
      c("MU", "Mauritius", ["en", "fr"]),
      c("MA", "Morocco", ["ar", "fr"]),
      c("MZ", "Mozambique", ["pt"]),
      c("NA", "Namibia", ["en", "af"]),
      c("NE", "Niger", ["fr", "ha"]),
      c("NG", "Nigeria", ["en", "ha", "yo", "ig"]),
      c("RW", "Rwanda", ["rw", "en", "fr"]),
      c("ST", "São Tomé and Príncipe", ["pt"], "São Tomé"),
      c("SN", "Senegal", ["fr"]),
      c("SC", "Seychelles", ["en", "fr"]),
      c("SL", "Sierra Leone", ["en", "kri"]),
      c("SO", "Somalia", ["so", "ar"]),
      c("ZA", "South Africa", ["en", "af", "zu", "xh", "st", "nso", "ts"]),
      c("SS", "South Sudan", ["en", "ar"]),
      c("SD", "Sudan", ["ar", "en"]),
      c("TZ", "Tanzania", ["sw", "en"]),
      c("TG", "Togo", ["fr", "ee"]),
      c("TN", "Tunisia", ["ar", "fr"]),
      c("UG", "Uganda", ["en", "sw", "lg"]),
      c("ZM", "Zambia", ["en"]),
      c("ZW", "Zimbabwe", ["en", "sn"]),
    ],
  },
  {
    id: "asia",
    name: "Asia",
    countries: [
      c("AF", "Afghanistan", ["ps", "fa"]),
      c("AM", "Armenia", ["hy", "ru"]),
      c("AZ", "Azerbaijan", ["az", "ru"]),
      c("BD", "Bangladesh", ["bn", "en"]),
      c("BT", "Bhutan", ["en"]),
      c("BN", "Brunei", ["ms", "en"]),
      c("KH", "Cambodia", ["km", "en"]),
      c("CN", "China", ["zh-CN"]),
      c("GE", "Georgia", ["ka", "ru"]),
      c("HK", "Hong Kong", ["zh-TW", "en"]),
      c("IN", "India", [
        "en",
        "hi",
        "ta",
        "te",
        "kn",
        "ml",
        "mr",
        "bn",
        "gu",
        "pa",
        "or",
        "as",
        "ur",
      ]),
      c("ID", "Indonesia", ["id", "jw", "su"]),
      c("JP", "Japan", ["ja"]),
      c("KZ", "Kazakhstan", ["kk", "ru"]),
      c("KG", "Kyrgyzstan", ["ky", "ru"]),
      c("LA", "Laos", ["lo"]),
      c("MO", "Macau", ["zh-TW", "pt"]),
      c("MY", "Malaysia", ["ms", "en", "zh-CN", "ta"]),
      c("MV", "Maldives", ["dv", "en"]),
      c("MN", "Mongolia", ["mn"]),
      c("MM", "Myanmar", ["my"]),
      c("NP", "Nepal", ["ne", "en"]),
      c("PK", "Pakistan", ["en", "ur", "pa", "sd", "ps"]),
      c("PH", "Philippines", ["en", "tl", "ceb", "ilo"]),
      c("SG", "Singapore", ["en", "zh-CN", "ms", "ta"]),
      c("KR", "South Korea", ["ko"]),
      c("LK", "Sri Lanka", ["si", "ta", "en"]),
      c("TW", "Taiwan", ["zh-TW"]),
      c("TJ", "Tajikistan", ["tg", "ru"]),
      c("TH", "Thailand", ["th"]),
      c("TL", "Timor-Leste", ["pt"]),
      c("TM", "Turkmenistan", ["tk", "ru"]),
      c("UZ", "Uzbekistan", ["uz", "ru"]),
      c("VN", "Vietnam", ["vi"]),
    ],
  },
  {
    id: "europe",
    name: "Europe",
    countries: [
      c("AL", "Albania", ["sq"]),
      c("AD", "Andorra", ["ca", "es", "fr"]),
      c("AT", "Austria", ["de"]),
      c("BY", "Belarus", ["be", "ru"]),
      c("BE", "Belgium", ["nl", "fr", "de"]),
      c("BA", "Bosnia and Herzegovina", ["bs", "hr", "sr"], "Bosnia"),
      c("BG", "Bulgaria", ["bg"]),
      c("HR", "Croatia", ["hr"]),
      c("CY", "Cyprus", ["el", "tr", "en"]),
      c("CZ", "Czechia", ["cs"]),
      c("DK", "Denmark", ["da"]),
      c("EE", "Estonia", ["et", "ru"]),
      c("FI", "Finland", ["fi", "sv"]),
      c("FR", "France", ["fr"]),
      c("DE", "Germany", ["de"]),
      c("GR", "Greece", ["el"]),
      c("HU", "Hungary", ["hu"]),
      c("IS", "Iceland", ["is"]),
      c("IE", "Ireland", ["en", "ga"]),
      c("IT", "Italy", ["it"]),
      c("XK", "Kosovo", ["sq", "sr"]),
      c("LV", "Latvia", ["lv", "ru"]),
      c("LI", "Liechtenstein", ["de"]),
      c("LT", "Lithuania", ["lt"]),
      c("LU", "Luxembourg", ["fr", "de", "lb"]),
      c("MT", "Malta", ["en", "mt"]),
      c("MD", "Moldova", ["ro", "ru"]),
      c("MC", "Monaco", ["fr"]),
      c("ME", "Montenegro", ["sr"]),
      c("NL", "Netherlands", ["nl"]),
      c("MK", "North Macedonia", ["mk", "sq"]),
      c("NO", "Norway", ["no"]),
      c("PL", "Poland", ["pl"]),
      c("PT", "Portugal", ["pt"]),
      c("RO", "Romania", ["ro"]),
      c("RU", "Russia", ["ru"]),
      c("SM", "San Marino", ["it"]),
      c("RS", "Serbia", ["sr"]),
      c("SK", "Slovakia", ["sk"]),
      c("SI", "Slovenia", ["sl"]),
      c("ES", "Spain", ["es", "ca", "eu", "gl"]),
      c("SE", "Sweden", ["sv"]),
      c("CH", "Switzerland", ["de", "fr", "it"]),
      c("TR", "Türkiye", ["tr"]),
      c("UA", "Ukraine", ["uk"]),
      c("GB", "United Kingdom", ["en", "cy"], "UK"),
      c("VA", "Vatican City", ["it"]),
    ],
  },
  {
    id: "middle-east",
    name: "Middle East",
    countries: [
      c("BH", "Bahrain", ["ar", "en"]),
      c("IR", "Iran", ["fa"]),
      c("IQ", "Iraq", ["ar", "ckb", "ku"]),
      c("IL", "Israel", ["iw", "ar", "en"]),
      c("JO", "Jordan", ["ar", "en"]),
      c("KW", "Kuwait", ["ar", "en"]),
      c("LB", "Lebanon", ["ar", "fr", "en"]),
      c("OM", "Oman", ["ar", "en"]),
      c("PS", "Palestine", ["ar"]),
      c("QA", "Qatar", ["ar", "en"]),
      c("SA", "Saudi Arabia", ["ar", "en"]),
      c("SY", "Syria", ["ar"]),
      c("AE", "United Arab Emirates", ["ar", "en"], "UAE"),
      c("YE", "Yemen", ["ar"]),
    ],
  },
  {
    id: "north-america",
    name: "North America",
    countries: [
      c("AG", "Antigua and Barbuda", ["en"], "Antigua"),
      c("BS", "Bahamas", ["en"]),
      c("BB", "Barbados", ["en"]),
      c("BZ", "Belize", ["en", "es"]),
      c("CA", "Canada", ["en", "fr"]),
      c("CR", "Costa Rica", ["es"]),
      c("CU", "Cuba", ["es"]),
      c("DM", "Dominica", ["en"]),
      c("DO", "Dominican Republic", ["es"], "Dominican Rep."),
      c("SV", "El Salvador", ["es"]),
      c("GD", "Grenada", ["en"]),
      c("GT", "Guatemala", ["es"]),
      c("HT", "Haiti", ["fr", "ht"]),
      c("HN", "Honduras", ["es"]),
      c("JM", "Jamaica", ["en"]),
      c("MX", "Mexico", ["es"]),
      c("NI", "Nicaragua", ["es"]),
      c("PA", "Panama", ["es"]),
      c("PR", "Puerto Rico", ["es", "en"]),
      c("KN", "Saint Kitts and Nevis", ["en"], "St Kitts"),
      c("LC", "Saint Lucia", ["en"], "St Lucia"),
      c("VC", "Saint Vincent and the Grenadines", ["en"], "St Vincent"),
      c("TT", "Trinidad and Tobago", ["en"], "Trinidad"),
      c("US", "United States", ["en", "es"], "USA"),
    ],
  },
  {
    id: "south-america",
    name: "South America",
    countries: [
      c("AR", "Argentina", ["es"]),
      c("BO", "Bolivia", ["es", "qu", "ay"]),
      c("BR", "Brazil", ["pt"]),
      c("CL", "Chile", ["es"]),
      c("CO", "Colombia", ["es"]),
      c("EC", "Ecuador", ["es", "qu"]),
      c("GY", "Guyana", ["en"]),
      c("PY", "Paraguay", ["es", "gn"]),
      c("PE", "Peru", ["es", "qu"]),
      c("SR", "Suriname", ["nl"]),
      c("UY", "Uruguay", ["es"]),
      c("VE", "Venezuela", ["es"]),
    ],
  },
  {
    id: "oceania",
    name: "Oceania",
    countries: [
      c("AU", "Australia", ["en"]),
      c("FJ", "Fiji", ["en"]),
      c("KI", "Kiribati", ["en"]),
      c("MH", "Marshall Islands", ["en"]),
      c("FM", "Micronesia", ["en"]),
      c("NR", "Nauru", ["en"]),
      c("NZ", "New Zealand", ["en", "mi"]),
      c("PW", "Palau", ["en"]),
      c("PG", "Papua New Guinea", ["en"], "PNG"),
      c("WS", "Samoa", ["sm", "en"]),
      c("SB", "Solomon Islands", ["en"]),
      c("TO", "Tonga", ["en"]),
      c("TV", "Tuvalu", ["en"]),
      c("VU", "Vanuatu", ["en", "fr"]),
    ],
  },
];

const COUNTRY_INDEX = new Map<
  string,
  { country: Country; continent: Continent }
>();
for (const continent of CONTINENTS)
  for (const country of continent.countries)
    COUNTRY_INDEX.set(country.code, { country, continent });

export function findCountry(code: string | null | undefined) {
  return code ? COUNTRY_INDEX.get(code.toUpperCase()) : undefined;
}

/**
 * The language to use for a country: the visitor's own browser language
 * when it is one of the country's (a French-speaking visitor in
 * Switzerland gets French, not German), else the country's first.
 */
export function languageForCountry(
  country: Country,
  browserLangs: readonly string[] = []
): string {
  for (const b of browserLangs) {
    const base = b.toLowerCase();
    const hit = country.langs.find(
      (l) =>
        l.toLowerCase() === base ||
        l.toLowerCase() === base.split("-")[0] ||
        (l === "iw" && base.startsWith("he"))
    );
    if (hit) return hit;
  }
  return country.langs[0];
}

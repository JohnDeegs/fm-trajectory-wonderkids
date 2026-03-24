export type RecruitmentTier = 'Exceptional' | 'Excellent';

// ── Nation Youth Ratings ──────────────────────────────────────────────────────
// Source: help_ai/youth_ratings.png
// Keys include FM24 3-letter export codes (e.g. "NOR") AND adjective fallbacks.
export const NATION_YOUTH_RATINGS: Record<string, number> = {
  // ── Exceptional tier (>110) ───────────────────────────────────────────────
  'BRA': 163, 'Brazilian': 163,
  'FRA': 155, 'French': 155,
  'GER': 155, 'German': 155,
  'ESP': 144, 'Spanish': 144,
  'ITA': 144, 'Italian': 144,
  'ARG': 140, 'Argentine': 140, 'Argentinian': 140,
  'ENG': 135, 'English': 135,
  'POR': 134, 'Portuguese': 134,
  'NED': 132, 'Dutch': 132,
  'EGY': 125, 'Egyptian': 125,
  'TUR': 124, 'Turkish': 124,
  'BEL': 120, 'Belgian': 120,
  'MEX': 120, 'Mexican': 120,
  'NGA': 120, 'NIG': 120, 'Nigerian': 120,
  'COL': 117, 'Colombian': 117,
  'JPN': 112, 'Japanese': 112,

  // ── Exactly 110 — Excellent tier (>90 but NOT >110) ──────────────────────
  'USA': 110, 'American': 110,
  'IRN': 110, 'IRI': 110, 'Iranian': 110,
  'UKR': 110, 'Ukrainian': 110,
  'KOR': 110, 'South Korean': 110,

  // ── Excellent tier (>90) ──────────────────────────────────────────────────
  'CIV': 105, 'CVI': 105, 'Ivorian': 105,
  'KSA': 105, 'SAU': 105, 'Saudi': 105, 'Saudi Arabian': 105,
  'QAT': 105, 'Qatari': 105,
  'IRQ': 103, 'Iraqi': 103,
  'ALG': 102, 'Algerian': 102,
  'COD': 101, 'DRC': 101, 'Congolese': 101, 'DR Congolese': 101,
  'MAR': 100, 'Moroccan': 100,
  'SRB': 100, 'Serbian': 100,
  'CMR': 100, 'Cameroonian': 100,
  'GHA': 99,  'Ghanaian': 99,
  'CRO': 98,  'HRV': 98, 'Croatian': 98,
  'PER': 97,  'Peruvian': 97,
  'RSA': 97,  'ZAF': 97, 'South African': 97,
  'UAE': 97,  'Emirati': 97, 'United Arab Emirates': 97,
  'SCO': 97,  'Scottish': 97,
  'IRL': 95,  'REP': 95, 'Irish': 95,
  'TUN': 95,  'Tunisian': 95,
  'NOR': 94,  'Norwegian': 94,
  'POL': 94,  'Polish': 94,
  'CZE': 94,  'Czech': 94,
  'GRE': 94,  'Greek': 94,
  'ECU': 94,  'Ecuadorian': 94,
  'SEN': 94,  'Senegalese': 94,
  'TAN': 94,  'Tanzanian': 94,
  'CHI': 93,  'CHL': 93, 'Chilean': 93,
  'AUT': 93,  'Austrian': 93,
  'DEN': 91, 'Danish': 91,
  'SVK': 91, 'Slovak': 91, 'Slovakian': 91,
  'ROM': 91, 'ROU': 91, 'Romanian': 91,

  // ── Exactly 90 (NOT >90 — no badge) ──────────────────────────────────────
  'SUI': 90, 'Swiss': 90,
  'URU': 90, 'Uruguayan': 90,
  'PAR': 90, 'Paraguayan': 90,
  'FIN': 90, 'Finnish': 90,
  'AUS': 90, 'Australian': 90,
  'JOR': 90, 'Jordanian': 90,
  'KUW': 90, 'Kuwaiti': 90,
  'ANG': 90, 'Angolan': 90,

  // ── Below threshold — stored for modal numeric display ────────────────────
  'SWE': 88, 'Swedish': 88,
  'NZL': 88, 'New Zealander': 88, 'New Zealand': 88,
  'IND': 86, 'Indian': 86,
  'THA': 86, 'Thai': 86,
  'BUL': 86, 'BGR': 86, 'Bulgarian': 86,
  'WAL': 85, 'Welsh': 85,
  'SYR': 85, 'Syrian': 85,
  'MKD': 85, 'Macedonian': 85, 'North Macedonian': 85,
  'LIB': 85, 'LBN': 85, 'Lebanese': 85,
  'VEN': 85, 'Venezuelan': 85,
  'ISR': 84, 'Israeli': 84,
  'PRK': 84, 'North Korean': 84,
  'VIE': 83, 'Vietnamese': 83,
  'HUN': 83, 'Hungarian': 83,
  'ISL': 82, 'ICE': 82, 'Icelandic': 82,
  'CRC': 82, 'Costa Rican': 82,
  'BAH': 82, 'BHR': 82, 'Bahraini': 82,
  'GEO': 80, 'Georgian': 80,
  'GUI': 79, 'GIN': 79, 'Guinean': 79,
  'TOG': 79, 'Togolese': 79,
  'NIR': 79, 'Northern Irish': 79,
  'SLO': 78, 'SVN': 78, 'Slovenian': 78,
  'BIH': 78, 'BOS': 78, 'Bosnian': 78,
  'LAT': 78, 'LVA': 78, 'Latvian': 78,
  'BLR': 78, 'Belarusian': 78,
  'EST': 75, 'Estonian': 75,
  'MNE': 75, 'MON': 75, 'Montenegrin': 75,
  'ZAM': 75, 'ZMB': 75, 'Zambian': 75,
  'CYP': 74, 'Cypriot': 74,
  'SUD': 74, 'SDN': 74, 'Sudanese': 74,
  'MLI': 73, 'Malian': 73,
  'LTU': 71, 'Lithuanian': 71,
  'UGA': 71, 'Ugandan': 71,
  'BOL': 71, 'Bolivian': 71,
  'HAI': 71, 'HTI': 71, 'Haitian': 71,
  'IDN': 70, 'INA': 70, 'Indonesian': 70,
  'OMA': 70, 'OMN': 70, 'Omani': 70,
  'UZB': 68, 'Uzbek': 68,
  'ESA': 68, 'SLV': 68, 'Salvadoran': 68,
  'BEN': 67, 'Beninese': 67,
  'CAN': 65, 'Canadian': 65,
  'YEM': 65, 'Yemeni': 65,
  'ALB': 65, 'Albanian': 65,
  'PAL': 64, 'PLE': 64, 'Palestinian': 64,
  'ETH': 64, 'Ethiopian': 64,
  'MOZ': 64, 'Mozambican': 64,
  'MYA': 61, 'MMR': 61, 'Burmese': 61, 'Myanmar': 61,
  'KOS': 60, 'XKX': 60, 'Kosovar': 60,
  'CHN': 60, 'Chinese': 60,
  'PAN': 60, 'Panamanian': 60,
  'JAM': 59, 'Jamaican': 59,
  'KAZ': 59, 'Kazakhstani': 59, 'Kazakh': 59,
  'HKG': 59, 'Hong Kong': 59,
  'CPV': 59, 'Cape Verdean': 59,
  'LBA': 59, 'LBY': 59, 'Libyan': 59,
  'TRI': 57, 'TTO': 57, 'Trinidadian': 57,
  'AZE': 56, 'Azerbaijani': 56,
  'FAR': 55, 'FRO': 55, 'Faroese': 55,
  'RWA': 55, 'Rwandan': 55,
  'BOT': 55, 'BWA': 55, 'Botswanan': 55,
  'KEN': 55, 'Kenyan': 55,
  'ARM': 41, 'Armenian': 41,
  'PHI': 40, 'PHL': 40, 'Filipino': 40,
};

// ── Club Youth Recruitment ────────────────────────────────────────────────────
// Source: help_ai/Football Club Facilities Data.pdf
// Only Exceptional and Excellent tiers stored — lower tiers not surfaced in UI.
export const CLUB_YOUTH_RECRUITMENT: Record<string, RecruitmentTier> = {
  // ── Exceptional ──────────────────────────────────────────────────────────
  'Barcelona':               'Exceptional',
  'Manchester City':         'Exceptional',
  'Man City':                'Exceptional',
  'FC Liefering':            'Exceptional',
  'Independiente del Valle': 'Exceptional',
  'Defensor Sporting':       'Exceptional',
  'Red Bull Salzburg':       'Exceptional',
  'RB Salzburg':             'Exceptional',
  'FC Basel':                'Exceptional',
  'Basel':                   'Exceptional',
  'FC Copenhagen':           'Exceptional',
  'FC København':            'Exceptional',
  'Nacional':                'Exceptional',  // Nacional Uruguay
  'Benfica':                 'Exceptional',
  'SL Benfica':              'Exceptional',
  'Vålerenga':               'Exceptional',
  'Valerenga':               'Exceptional',
  'Red Star Belgrade':       'Exceptional',
  'Crvena zvezda':           'Exceptional',
  'Legia Warszawa':          'Exceptional',
  'Legia':                   'Exceptional',
  'Lech Poznań':             'Exceptional',
  'Lech Poznan':             'Exceptional',
  'Lech':                    'Exceptional',
  'Farul Constanta':         'Exceptional',
  'FC Midtjylland':          'Exceptional',
  'Midtjylland':             'Exceptional',

  // ── Excellent ────────────────────────────────────────────────────────────
  'Chelsea':                 'Excellent',
  'Dinamo Zagreb':           'Excellent',
  'Dinamo':                  'Excellent',
  'Hajduk Split':            'Excellent',
  'Hajduk':                  'Excellent',
  'Sporting CP':             'Excellent',
  'Anderlecht':              'Excellent',
  'RSCA Futures':            'Excellent',
  'Real Madrid':             'Excellent',
  'Danubio':                 'Excellent',
  'Austria Wien':            'Excellent',
  'Rapid Wien':              'Excellent',
  'SK Rapid':                'Excellent',
  'AZ Alkmaar':              'Excellent',
  'AZ':                      'Excellent',
  'Ajax':                    'Excellent',
  'Ulsan Hyundai':           'Excellent',
  'Ulsan':                   'Excellent',
  'Porto':                   'Excellent',
  'FC Porto':                'Excellent',
  'Génération Foot':         'Excellent',
  'Generation Foot':         'Excellent',
  'Manchester United':       'Excellent',
  'Man Utd':                 'Excellent',
  'Man. United':             'Excellent',
  'Man United':              'Excellent',
  'Maccabi Tel-Aviv':        'Excellent',
  'Maccabi Petach-Tikva':    'Excellent',
  'Feyenoord':               'Excellent',
  'FC Nordsjælland':         'Excellent',
  'FC Nordsjaelland':        'Excellent',
  'Nordsjaelland':           'Excellent',
  'Nordsjælland':            'Excellent',
  'Grasshopper':             'Excellent',
  'Grasshoppers':            'Excellent',
  'Brommapojkarna':          'Excellent',
  'IF Brommapojkarna':       'Excellent',
  'Hibernian':               'Excellent',
  'ASEC Mimosas':            'Excellent',
  'Bodø/Glimt':              'Excellent',
  'Bodo/Glimt':              'Excellent',
  'Atalanta':                'Excellent',
  'RGUOR':                   'Excellent',
  'Rennes':                  'Excellent',
  'Paris Saint-Germain':     'Excellent',
  'Paris SG':                'Excellent',
  'PSG':                     'Excellent',
  'PSV Eindhoven':           'Excellent',
  'PSV':                     'Excellent',
  'Pyunik':                  'Excellent',
  'Standard Liège':          'Excellent',
  'Standard Liege':          'Excellent',
  'Standard':                'Excellent',
  'Sparta Prague':           'Excellent',
  'Sparta Praha':            'Excellent',
  'Trenčín':                 'Excellent',
  'Trencin':                 'Excellent',
  'Villarreal':              'Excellent',
  'Valencia':                'Excellent',
  'Žilina':                  'Excellent',
  'Zilina':                  'Excellent',
  'INF Clairefontaine':      'Excellent',
  'Universidad Católica':    'Excellent',
  'Univ. Católica':          'Excellent',
  'Csikszereda':             'Excellent',
  'AIK':                     'Excellent',
  'Atletico Madrid':         'Excellent',
  'Atlético Madrid':         'Excellent',
  'Atlético de Madrid':      'Excellent',
  'Club Brugge':             'Excellent',
  'Borussia Dortmund':       'Excellent',
  'Dortmund':                'Excellent',
  'Malmö FF':                'Excellent',
  'Malmo FF':                'Excellent',
  'Maccabi Haifa':           'Excellent',
  'Lyon':                    'Excellent',
  'Olympique Lyonnais':      'Excellent',
  'KRC Genk':                'Excellent',
  'Genk':                    'Excellent',
  'Bayern Munich':           'Excellent',
  'FC Bayern':               'Excellent',
  'FC Bayern München':       'Excellent',
  'Girona':                  'Excellent',
  'Girona B':                'Excellent',
  'ÍA':                      'Excellent',
  'FCSB':                    'Excellent',
};

// ── Country name lookup (3-letter code → full English country name) ───────────
// Used so filter text like "Ireland" matches players with nationality "IRL".
export const NATIONALITY_COUNTRY_NAMES: Record<string, string> = {
  'ENG': 'England',       'SCO': 'Scotland',        'WAL': 'Wales',
  'NIR': 'Northern Ireland', 'IRL': 'Ireland',       'REP': 'Ireland',
  'FRA': 'France',        'GER': 'Germany',          'ESP': 'Spain',
  'ITA': 'Italy',         'POR': 'Portugal',         'NED': 'Netherlands',
  'BEL': 'Belgium',       'BRA': 'Brazil',           'ARG': 'Argentina',
  'COL': 'Colombia',      'MEX': 'Mexico',           'USA': 'United States',
  'JPN': 'Japan',         'KOR': 'South Korea',      'PRK': 'North Korea',
  'EGY': 'Egypt',         'TUR': 'Turkey',           'UKR': 'Ukraine',
  'NOR': 'Norway',        'SWE': 'Sweden',           'DEN': 'Denmark',
  'FIN': 'Finland',       'POL': 'Poland',           'CZE': 'Czech Republic',
  'SVK': 'Slovakia',      'ROM': 'Romania',          'ROU': 'Romania',
  'HUN': 'Hungary',       'AUT': 'Austria',          'SUI': 'Switzerland',
  'GRE': 'Greece',        'SRB': 'Serbia',           'CRO': 'Croatia',
  'HRV': 'Croatia',       'SLO': 'Slovenia',         'SVN': 'Slovenia',
  'BIH': 'Bosnia',        'BOS': 'Bosnia',           'MNE': 'Montenegro',
  'MON': 'Montenegro',    'ALB': 'Albania',          'MKD': 'North Macedonia',
  'KOS': 'Kosovo',        'XKX': 'Kosovo',           'GEO': 'Georgia',
  'ARM': 'Armenia',       'AZE': 'Azerbaijan',       'BLR': 'Belarus',
  'UZB': 'Uzbekistan',    'KAZ': 'Kazakhstan',       'RUS': 'Russia',
  'MAR': 'Morocco',       'ALG': 'Algeria',          'TUN': 'Tunisia',
  'NGA': 'Nigeria',       'NIG': 'Nigeria',          'GHA': 'Ghana',
  'CMR': 'Cameroon',      'SEN': 'Senegal',          'CIV': 'Ivory Coast',
  'CVI': 'Ivory Coast',   'COD': 'DR Congo',         'DRC': 'DR Congo',
  'ETH': 'Ethiopia',      'KEN': 'Kenya',            'ZAM': 'Zambia',
  'ZMB': 'Zambia',        'RSA': 'South Africa',     'ZAF': 'South Africa',
  'MOZ': 'Mozambique',    'ANG': 'Angola',           'RWA': 'Rwanda',
  'UGA': 'Uganda',        'TAN': 'Tanzania',         'MLI': 'Mali',
  'BEN': 'Benin',         'TOG': 'Togo',             'GUI': 'Guinea',
  'GIN': 'Guinea',        'SUD': 'Sudan',            'SDN': 'Sudan',
  'CPV': 'Cape Verde',    'LBA': 'Libya',            'LBY': 'Libya',
  'BOT': 'Botswana',      'BWA': 'Botswana',
  'IRN': 'Iran',          'IRI': 'Iran',             'IRQ': 'Iraq',
  'KSA': 'Saudi Arabia',  'SAU': 'Saudi Arabia',     'UAE': 'United Arab Emirates',
  'QAT': 'Qatar',         'JOR': 'Jordan',           'KUW': 'Kuwait',
  'LIB': 'Lebanon',       'LBN': 'Lebanon',          'ISR': 'Israel',
  'PAL': 'Palestine',     'PLE': 'Palestine',        'SYR': 'Syria',
  'YEM': 'Yemen',         'OMA': 'Oman',             'OMN': 'Oman',
  'BAH': 'Bahrain',       'BHR': 'Bahrain',
  'CHN': 'China',         'HKG': 'Hong Kong',        'AUS': 'Australia',
  'NZL': 'New Zealand',   'IND': 'India',            'THA': 'Thailand',
  'VIE': 'Vietnam',       'IDN': 'Indonesia',        'INA': 'Indonesia',
  'MYA': 'Myanmar',       'MMR': 'Myanmar',          'PHI': 'Philippines',
  'PHL': 'Philippines',
  'URU': 'Uruguay',       'PAR': 'Paraguay',         'BOL': 'Bolivia',
  'PER': 'Peru',          'ECU': 'Ecuador',          'CHI': 'Chile',
  'CHL': 'Chile',         'VEN': 'Venezuela',        'CAN': 'Canada',
  'CRC': 'Costa Rica',    'PAN': 'Panama',           'ESA': 'El Salvador',
  'SLV': 'El Salvador',   'HAI': 'Haiti',            'HTI': 'Haiti',
  'JAM': 'Jamaica',       'TRI': 'Trinidad',         'TTO': 'Trinidad',
  'ISL': 'Iceland',       'ICE': 'Iceland',          'FAR': 'Faroe Islands',
  'FRO': 'Faroe Islands', 'LTU': 'Lithuania',        'LAT': 'Latvia',
  'LVA': 'Latvia',        'EST': 'Estonia',          'CYP': 'Cyprus',
};

/** Returns search terms for a nationality code: the code itself + full country name. */
export function getNationalitySearchTerms(code: string): string[] {
  const name = NATIONALITY_COUNTRY_NAMES[code];
  return name
    ? [code.toLowerCase(), name.toLowerCase()]
    : [code.toLowerCase()];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function getNationYouthRating(nationality: string): number | null {
  if (!nationality) return null;
  const direct = NATION_YOUTH_RATINGS[nationality];
  if (direct !== undefined) return direct;
  // Case-insensitive fallback
  const lower = nationality.toLowerCase();
  for (const [k, v] of Object.entries(NATION_YOUTH_RATINGS)) {
    if (k.toLowerCase() === lower) return v;
  }
  return null;
}

export function getClubRecruitment(club: string): RecruitmentTier | null {
  if (!club) return null;
  const direct = CLUB_YOUTH_RECRUITMENT[club];
  if (direct !== undefined) return direct;
  // Case-insensitive fallback
  const lower = club.toLowerCase();
  for (const [k, v] of Object.entries(CLUB_YOUTH_RECRUITMENT)) {
    if (k.toLowerCase() === lower) return v;
  }
  return null;
}

/** Returns the display tier for a nation rating, null if below Excellent threshold. */
export function getNationTier(rating: number): 'Exceptional' | 'Excellent' | null {
  if (rating > 110) return 'Exceptional';
  if (rating > 90) return 'Excellent';
  return null;
}

/** Colour for nation youth rating value shown in the modal. */
export function nationRatingColour(rating: number): string {
  if (rating >= 140) return '#f59e0b'; // gold
  if (rating >= 110) return '#34d399'; // emerald
  if (rating >= 90)  return '#86efac'; // light green
  if (rating >= 80)  return '#facc15'; // yellow
  return '#7c8db0';                    // muted
}

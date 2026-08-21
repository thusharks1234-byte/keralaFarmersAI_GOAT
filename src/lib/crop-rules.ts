import type { CropRecommendation } from '../types';

interface FarmInput {
  district?: string | null;
  soilType?: string | null;
  ph?: number | null;
  waterAvailability?: string | null;
  previousCrop?: string | null;
  farmType?: string | null;
}

interface CropRule {
  cropName: string;
  cropEmoji: string;
  soilTypes: string[];
  waterNeeds: string[];
  phMin: number;
  phMax: number;
  baseScore: number;
  waterRequirement: string;
  growingPeriod: string;
  reasons: string[];
  notAfter?: string[];
  preferredDistricts?: string[];
}

const CROP_RULES: CropRule[] = [

  // ─────────────────────────────────────────────
  // KERALA CROPS (14 districts, perfected)
  // ─────────────────────────────────────────────

  {
    cropName: 'Coconut',
    cropEmoji: '🥥',
    soilTypes: ['sandy loam', 'laterite', 'loam', 'red laterite', 'alluvial', 'coastal sandy'],
    waterNeeds: ['moderate', 'high', 'canal', 'rain-fed', 'well irrigation'],
    phMin: 5.5, phMax: 8.0,
    baseScore: 88,
    waterRequirement: 'Moderate (800–2500mm rainfall)',
    growingPeriod: '5–7 years to first yield',
    reasons: [
      "State tree of Kerala, highly suited to coastal & laterite terrain",
      'Tolerates wide soil range — thrives in sandy loam and laterite',
      'Year-round income from copra, oil, toddy & coir',
    ],
    preferredDistricts: [
      'Kozhikode', 'Malappuram', 'Thrissur', 'Kannur', 'Kasaragod',
      'Alappuzha', 'Ernakulam', 'Kollam', 'Thiruvananthapuram',
      'Dakshina Kannada', 'Udupi', 'Uttara Kannada', 'Tumakuru', 'Mandya',
    ],
  },
  {
    cropName: 'Banana',
    cropEmoji: '🍌',
    soilTypes: ['loam', 'clay loam', 'alluvial', 'red laterite', 'sandy loam'],
    waterNeeds: ['high', 'canal', 'well irrigation', 'drip'],
    phMin: 5.5, phMax: 7.5,
    baseScore: 82,
    waterRequirement: 'High (1200–2500mm or regular irrigation)',
    growingPeriod: '10–12 months',
    reasons: [
      'Fast-growing, short payback period',
      "Thrives in Kerala's humid climate with loamy soils",
      'High local & export demand — Nendran variety commands premium',
    ],
    preferredDistricts: [
      'Thrissur', 'Ernakulam', 'Wayanad', 'Palakkad', 'Thiruvananthapuram', 'Kollam',
      'Malappuram', 'Kozhikode', 'Kannur',
      'Dakshina Kannada', 'Udupi', 'Shivamogga (Shimoga)', 'Hassan',
    ],
  },
  {
    cropName: 'Paddy (Rice)',
    cropEmoji: '🌾',
    soilTypes: ['clay', 'clay loam', 'alluvial', 'kari', 'black cotton', 'red laterite'],
    waterNeeds: ['high', 'canal', 'paddy field', 'rain-fed'],
    phMin: 5.0, phMax: 7.0,
    baseScore: 80,
    waterRequirement: 'High (needs standing water or 1200+ mm rainfall)',
    growingPeriod: '90–150 days',
    reasons: [
      "Staple food crop — Kuttanad is 'rice bowl of Kerala'",
      'Clay and waterlogged soils ideal for Virippu/Mundakan seasons',
      'Govt support: MSP, seed subsidies, Paddy Land Protection Act',
    ],
    preferredDistricts: [
      'Alappuzha', 'Kottayam', 'Ernakulam', 'Thrissur', 'Palakkad',
      'Wayanad', 'Malappuram', 'Kozhikode', 'Kannur',
      'Mandya', 'Mysuru (Mysore)', 'Hassan', 'Shivamogga (Shimoga)',
      'Dakshina Kannada', 'Udupi', 'Uttara Kannada', 'Kodagu (Coorg)',
      'Raichur', 'Koppal', 'Ballari (Bellary)',
    ],
  },
  {
    cropName: 'Black Pepper',
    cropEmoji: '🫑',
    soilTypes: ['laterite', 'red laterite', 'forest loam', 'loam'],
    waterNeeds: ['moderate', 'rain-fed'],
    phMin: 5.0, phMax: 6.5,
    baseScore: 77,
    waterRequirement: 'Moderate (rain-fed, well-drained slopes)',
    growingPeriod: '3 years to first yield; 10–15 years productive',
    reasons: [
      "\"King of Spices\" — Kerala is India's largest producer",
      'Suits laterite, sloped land with support trees',
      'High export value; organic pepper fetches premium',
    ],
    notAfter: ['pepper'],
    preferredDistricts: [
      'Idukki', 'Wayanad', 'Kannur', 'Kozhikode', 'Pathanamthitta', 'Thrissur', 'Malappuram',
      'Kodagu (Coorg)', 'Dakshina Kannada', 'Udupi', 'Uttara Kannada', 'Chikkamagaluru',
    ],
  },
  {
    cropName: 'Tapioca (Cassava)',
    cropEmoji: '🥔',
    soilTypes: ['sandy loam', 'laterite', 'loam', 'red laterite', 'gravelly loam'],
    waterNeeds: ['low', 'rain-fed', 'moderate'],
    phMin: 5.0, phMax: 8.0,
    baseScore: 73,
    waterRequirement: 'Low–Moderate (drought tolerant, 500–1500mm)',
    growingPeriod: '6–12 months',
    reasons: [
      'Drought-tolerant; ideal for poor laterite and hilly terrain',
      'Quick harvest cycle with minimal inputs',
      'Dual use — food & starch industry',
    ],
    preferredDistricts: [
      'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Kottayam', 'Idukki', 'Palakkad',
    ],
  },
  {
    cropName: 'Ginger',
    cropEmoji: '🫚',
    soilTypes: ['loam', 'sandy loam', 'forest loam', 'clay loam'],
    waterNeeds: ['moderate', 'rain-fed'],
    phMin: 5.5, phMax: 7.0,
    baseScore: 72,
    waterRequirement: 'Moderate (well-drained, humid)',
    growingPeriod: '8–9 months',
    reasons: [
      'High market value spice; Kerala & Wayanad are top producers',
      'Well-drained loamy soils with good organic matter ideal',
      'Growing pharmaceutical and export demand',
    ],
    notAfter: ['ginger'],
    preferredDistricts: [
      'Wayanad', 'Idukki', 'Palakkad', 'Ernakulam', 'Kozhikode',
      'Kodagu (Coorg)', 'Chikkamagaluru', 'Hassan', 'Shivamogga (Shimoga)',
    ],
  },
  {
    cropName: 'Rubber',
    cropEmoji: '🌳',
    soilTypes: ['laterite', 'red laterite', 'loam', 'sandy loam'],
    waterNeeds: ['moderate', 'rain-fed', 'high'],
    phMin: 4.5, phMax: 6.5,
    baseScore: 76,
    waterRequirement: 'Moderate (>2000mm annual rainfall)',
    growingPeriod: '6–7 years to tapping; 30+ years productive',
    reasons: [
      "Kerala produces ~90% of India's natural rubber",
      'Ideal for laterite slopes and undulating terrain',
      'Long-term, stable income; tapping from 5th year',
    ],
    preferredDistricts: [
      'Kottayam', 'Pathanamthitta', 'Ernakulam', 'Idukki', 'Kollam',
      'Thiruvananthapuram', 'Thrissur', 'Malappuram', 'Wayanad',
    ],
  },
  {
    cropName: 'Turmeric',
    cropEmoji: '🟡',
    soilTypes: ['clay loam', 'loam', 'sandy loam', 'red laterite'],
    waterNeeds: ['moderate', 'rain-fed', 'well irrigation', 'drip'],
    phMin: 4.5, phMax: 7.5,
    baseScore: 70,
    waterRequirement: 'Moderate (well-drained, 1000–2000mm)',
    growingPeriod: '7–9 months',
    reasons: [
      'Medicinal & culinary spice with surging global demand',
      "Suits Kerala's humid climate and well-drained loam",
      "Karnataka is India's #1 turmeric state by volume",
    ],
    notAfter: ['turmeric'],
    preferredDistricts: [
      'Palakkad', 'Ernakulam', 'Wayanad', 'Idukki', 'Thrissur', 'Malappuram',
      'Dharwad', 'Haveri', 'Davanagere', 'Shivamogga (Shimoga)', 'Hassan', 'Chikkamagaluru',
    ],
  },
  {
    cropName: 'Arecanut (Betel Nut)',
    cropEmoji: '🌴',
    soilTypes: ['laterite', 'clay loam', 'alluvial', 'loam', 'red laterite'],
    waterNeeds: ['moderate', 'canal', 'well irrigation', 'drip'],
    phMin: 5.0, phMax: 8.0,
    baseScore: 78,
    waterRequirement: 'Moderate (regular watering, 750–4500mm)',
    growingPeriod: '6–8 years to first yield',
    reasons: [
      'Major cash crop of coastal Karnataka & Kerala (Kasaragod belt)',
      'Strong and stable local & export demand',
      'Long productive life — 30–60 years',
    ],
    preferredDistricts: [
      'Kasaragod', 'Malappuram', 'Kannur', 'Kozhikode', 'Wayanad', 'Thrissur',
      'Dakshina Kannada', 'Udupi', 'Uttara Kannada', 'Shivamogga (Shimoga)',
      'Hassan', 'Chikkamagaluru', 'Kodagu (Coorg)', 'Mandya', 'Tumakuru (Tumkur)',
    ],
  },
  {
    cropName: 'Cardamom',
    cropEmoji: '🌿',
    soilTypes: ['forest loam', 'loam', 'clay loam'],
    waterNeeds: ['high', 'rain-fed'],
    phMin: 4.5, phMax: 6.0,
    baseScore: 72,
    waterRequirement: 'High (1500–3500mm, cool & shaded)',
    growingPeriod: '2–3 years to yield; 8–10 years productive',
    reasons: [
      "\"Queen of Spices\" — Idukki & Wayanad dominate India's production",
      'High altitude (600–1500m) with forest shade ideal',
      'Extremely high market value, especially green cardamom',
    ],
    preferredDistricts: [
      'Idukki', 'Wayanad', 'Palakkad',
      'Kodagu (Coorg)', 'Chikkamagaluru', 'Hassan',
    ],
  },
  {
    cropName: 'Coffee (Robusta/Arabica)',
    cropEmoji: '☕',
    soilTypes: ['forest loam', 'loam', 'clay loam', 'red laterite'],
    waterNeeds: ['moderate', 'rain-fed', 'high'],
    phMin: 5.5, phMax: 6.5,
    baseScore: 74,
    waterRequirement: 'Moderate–High (1200–2500mm, shade-grown)',
    growingPeriod: '3–4 years to first yield',
    reasons: [
      'Wayanad & Idukki are Kerala top coffee districts',
      "Kodagu (Coorg) is India's coffee capital — ideal microclimate",
      'Premium organic & shade-grown commands high export prices',
    ],
    preferredDistricts: [
      'Wayanad', 'Idukki',
      'Kodagu (Coorg)', 'Chikkamagaluru', 'Hassan', 'Shivamogga (Shimoga)', 'Uttara Kannada',
    ],
  },
  {
    cropName: 'Pineapple',
    cropEmoji: '🍍',
    soilTypes: ['sandy loam', 'laterite', 'loam', 'red laterite'],
    waterNeeds: ['moderate', 'rain-fed'],
    phMin: 4.5, phMax: 6.0,
    baseScore: 68,
    waterRequirement: 'Moderate (drought-tolerant once established)',
    growingPeriod: '15–18 months',
    reasons: [
      'Vazhakulam variety (Ernakulam) has GI tag — high market value',
      'Well-suited to acidic laterite soil slopes',
      'Growing processed food & export demand',
    ],
    preferredDistricts: [
      'Ernakulam', 'Thrissur', 'Palakkad', 'Idukki', 'Wayanad', 'Kottayam',
    ],
  },
  {
    cropName: 'Jackfruit',
    cropEmoji: '🌲',
    soilTypes: ['laterite', 'loam', 'sandy loam', 'alluvial'],
    waterNeeds: ['moderate', 'rain-fed', 'low'],
    phMin: 5.5, phMax: 7.5,
    baseScore: 66,
    waterRequirement: 'Low–Moderate (drought-tolerant once established)',
    growingPeriod: '3–5 years to first yield',
    reasons: [
      "Kerala's state fruit — thriving in home gardens and commercial farms",
      'Rising demand as a meat substitute ("vegetarian meat")',
      'Very low input cost after establishment',
    ],
    preferredDistricts: [
      'Ernakulam', 'Thrissur', 'Kozhikode', 'Kannur', 'Kasaragod',
      'Palakkad', 'Malappuram', 'Wayanad',
    ],
  },
  {
    cropName: 'Vegetables (Mixed)',
    cropEmoji: '🥦',
    soilTypes: ['loam', 'sandy loam', 'alluvial', 'clay loam', 'red laterite', 'red loam'],
    waterNeeds: ['moderate', 'canal', 'drip', 'well irrigation'],
    phMin: 5.5, phMax: 7.0,
    baseScore: 70,
    waterRequirement: 'Moderate (regular irrigation every 3–5 days)',
    growingPeriod: '2–4 months per cycle',
    reasons: [
      'Quick returns — ideal for small-hold & homestead farms',
      'Year-round demand; can be grown in 3–4 cycles/year',
      'State subsidises vegetable cultivation under Subhiksha Keralam',
    ],
    preferredDistricts: [
      'Thiruvananthapuram', 'Kollam', 'Ernakulam', 'Thrissur', 'Palakkad',
      'Wayanad', 'Idukki', 'Malappuram', 'Kozhikode',
      'Kolar', 'Chikkaballapur', 'Bengaluru Rural', 'Bengaluru Urban',
      'Belagavi (Belgaum)', 'Hassan', 'Dharwad', 'Tumakuru (Tumkur)', 'Ramanagara',
    ],
  },

  // ─────────────────────────────────────────────
  // KARNATAKA CROPS (all 31 districts)
  // ─────────────────────────────────────────────

  {
    cropName: 'Ragi (Finger Millet)',
    cropEmoji: '🌱',
    soilTypes: ['red sandy loam', 'red laterite', 'sandy loam', 'loam', 'gravelly loam'],
    waterNeeds: ['low', 'rain-fed', 'moderate'],
    phMin: 5.0, phMax: 8.0,
    baseScore: 82,
    waterRequirement: 'Low (500–900mm, rain-fed, drought tolerant)',
    growingPeriod: '90–120 days',
    reasons: [
      "Karnataka is India's #1 Ragi state — Tumakuru, Kolar, Bengaluru Rural are top producers",
      'Highly drought-tolerant; suits dry Deccan plateau red soils',
      'Nutritional & health food demand surging; excellent MSP support',
    ],
    preferredDistricts: [
      'Tumakuru (Tumkur)', 'Bengaluru Rural', 'Bengaluru Urban',
      'Kolar', 'Chikkaballapur', 'Ramanagara', 'Chitradurga', 'Davanagere',
      'Haveri', 'Shivamogga (Shimoga)', 'Mandya', 'Mysuru (Mysore)',
      'Hassan', 'Raichur', 'Koppal', 'Ballari (Bellary)', 'Vijayanagara',
    ],
  },
  {
    cropName: 'Jowar (Sorghum)',
    cropEmoji: '🌾',
    soilTypes: ['black cotton', 'deep black', 'medium black', 'red loam', 'sandy loam'],
    waterNeeds: ['low', 'rain-fed', 'moderate'],
    phMin: 6.0, phMax: 8.5,
    baseScore: 80,
    waterRequirement: 'Low (400–800mm, very drought tolerant)',
    growingPeriod: '90–120 days (Kharif); 100–130 days (Rabi)',
    reasons: [
      "Vijayapura & Bidar are India's top jowar districts",
      'Thrives on black cotton (vertisol) soils of North Karnataka',
      'Dual purpose — grain food & dry fodder for livestock',
    ],
    preferredDistricts: [
      'Vijayapura (Bijapur)', 'Bagalkot', 'Gadag', 'Dharwad', 'Belagavi (Belgaum)',
      'Raichur', 'Kalaburagi (Gulbarga)', 'Yadgir', 'Bidar', 'Koppal',
      'Ballari (Bellary)', 'Vijayanagara', 'Haveri', 'Chitradurga',
    ],
  },
  {
    cropName: 'Bajra (Pearl Millet)',
    cropEmoji: '🌿',
    soilTypes: ['sandy loam', 'sandy', 'red sandy', 'light loam'],
    waterNeeds: ['low', 'rain-fed'],
    phMin: 6.0, phMax: 8.0,
    baseScore: 76,
    waterRequirement: 'Very Low (300–600mm, extremely drought-hardy)',
    growingPeriod: '75–90 days',
    reasons: [
      'Best crop for arid, sandy soils of Raichur & Kalaburagi',
      'Extremely heat and drought tolerant',
      'Good grain & fodder yield in marginal lands',
    ],
    preferredDistricts: [
      'Raichur', 'Kalaburagi (Gulbarga)', 'Yadgir', 'Bidar', 'Koppal',
      'Vijayapura (Bijapur)', 'Bagalkot', 'Ballari (Bellary)', 'Vijayanagara',
    ],
  },
  {
    cropName: 'Cotton (Bt)',
    cropEmoji: '🌸',
    soilTypes: ['black cotton', 'deep black', 'medium black', 'red loam', 'clay'],
    waterNeeds: ['moderate', 'rain-fed', 'drip'],
    phMin: 6.0, phMax: 8.0,
    baseScore: 83,
    waterRequirement: 'Moderate (700–1100mm or drip irrigation)',
    growingPeriod: '160–200 days (Kharif)',
    reasons: [
      "Dharwad, Haveri, Gadag & Vijayapura are Karnataka's cotton belt",
      'Black cotton soils (vertisols) have high water-holding capacity — ideal',
      'Textile industry demand is consistent; MSP support from Govt',
    ],
    preferredDistricts: [
      'Dharwad', 'Haveri', 'Gadag', 'Vijayapura (Bijapur)', 'Bagalkot',
      'Raichur', 'Kalaburagi (Gulbarga)', 'Yadgir', 'Belagavi (Belgaum)',
      'Bidar', 'Koppal', 'Ballari (Bellary)', 'Vijayanagara', 'Chitradurga',
    ],
  },
  {
    cropName: 'Sugarcane',
    cropEmoji: '🎋',
    soilTypes: ['black cotton', 'alluvial', 'loam', 'clay loam', 'deep black'],
    waterNeeds: ['high', 'canal', 'drip', 'well irrigation'],
    phMin: 6.0, phMax: 8.5,
    baseScore: 85,
    waterRequirement: 'High (1500–2500mm or canal irrigation)',
    growingPeriod: '10–14 months (plant crop) + ratoon',
    reasons: [
      "Belagavi & Bagalkot are India's top sugarcane districts by sugar recovery",
      "Mandya 'sugar bowl of Karnataka' — Cauvery canal irrigation ideal",
      'Long crop cycle but assured factory procurement at FRP',
    ],
    preferredDistricts: [
      'Belagavi (Belgaum)', 'Bagalkot', 'Mandya', 'Mysuru (Mysore)',
      'Dharwad', 'Haveri', 'Uttara Kannada', 'Shivamogga (Shimoga)',
      'Hassan', 'Vijayapura (Bijapur)', 'Raichur',
    ],
  },
  {
    cropName: 'Maize (Corn)',
    cropEmoji: '🌽',
    soilTypes: ['loam', 'sandy loam', 'clay loam', 'red loam', 'alluvial'],
    waterNeeds: ['moderate', 'rain-fed', 'canal', 'drip'],
    phMin: 5.8, phMax: 8.0,
    baseScore: 81,
    waterRequirement: 'Moderate (500–800mm well-distributed)',
    growingPeriod: '80–110 days',
    reasons: [
      'Davanagere & Haveri lead Karnataka maize production',
      'Short season, can be grown Kharif & Rabi both',
      'High demand from poultry feed, starch & ethanol industries',
    ],
    preferredDistricts: [
      'Davanagere', 'Haveri', 'Chitradurga', 'Shivamogga (Shimoga)',
      'Belagavi (Belgaum)', 'Hassan', 'Mandya', 'Tumakuru (Tumkur)',
      'Dharwad', 'Gadag', 'Koppal', 'Ballari (Bellary)', 'Vijayanagara',
    ],
  },
  {
    cropName: 'Sunflower',
    cropEmoji: '🌻',
    soilTypes: ['loam', 'sandy loam', 'red sandy loam', 'clay loam'],
    waterNeeds: ['moderate', 'rain-fed', 'drip', 'canal'],
    phMin: 6.0, phMax: 8.0,
    baseScore: 77,
    waterRequirement: 'Low–Moderate (500–750mm)',
    growingPeriod: '85–95 days',
    reasons: [
      "Raichur & Kalaburagi are India's top sunflower districts",
      'Short duration, good Rabi crop for North Karnataka dry zone',
      'Edible oil crop with stable market prices & export demand',
    ],
    preferredDistricts: [
      'Raichur', 'Kalaburagi (Gulbarga)', 'Vijayapura (Bijapur)', 'Bagalkot',
      'Yadgir', 'Koppal', 'Bidar', 'Chitradurga', 'Davanagere',
      'Ballari (Bellary)', 'Vijayanagara', 'Haveri',
    ],
  },
  {
    cropName: 'Groundnut',
    cropEmoji: '🥜',
    soilTypes: ['sandy loam', 'red sandy loam', 'loam', 'sandy'],
    waterNeeds: ['moderate', 'rain-fed', 'drip'],
    phMin: 5.5, phMax: 7.5,
    baseScore: 78,
    waterRequirement: 'Moderate (500–750mm, well-drained essential)',
    growingPeriod: '90–120 days (Kharif); 120–135 days (Rabi)',
    reasons: [
      "Kalaburagi & Raichur are Karnataka's groundnut heartland",
      'Red sandy loam with good drainage ideal',
      'Profitable — oil, cake, export and domestic consumption',
    ],
    preferredDistricts: [
      'Kalaburagi (Gulbarga)', 'Raichur', 'Yadgir', 'Vijayapura (Bijapur)',
      'Bagalkot', 'Bidar', 'Chitradurga', 'Tumakuru (Tumkur)',
      'Davanagere', 'Koppal', 'Ballari (Bellary)', 'Vijayanagara',
    ],
  },
  {
    cropName: 'Tomato',
    cropEmoji: '🍅',
    soilTypes: ['sandy loam', 'loam', 'red loam', 'clay loam', 'alluvial'],
    waterNeeds: ['moderate', 'drip', 'well irrigation', 'canal'],
    phMin: 6.0, phMax: 7.0,
    baseScore: 79,
    waterRequirement: 'Moderate (drip irrigation preferred)',
    growingPeriod: '60–90 days per crop cycle',
    reasons: [
      'Kolar & Chikkaballapur supply tomatoes to entire South India',
      'Red loamy soils with good drainage suit tomato perfectly',
      'High yield potential under protected/hybrid cultivation',
    ],
    preferredDistricts: [
      'Kolar', 'Chikkaballapur', 'Bengaluru Rural', 'Bengaluru Urban',
      'Belagavi (Belgaum)', 'Hassan', 'Dharwad', 'Tumakuru (Tumkur)', 'Ramanagara',
    ],
  },
  {
    cropName: 'Onion',
    cropEmoji: '🧅',
    soilTypes: ['sandy loam', 'loam', 'clay loam', 'red sandy loam'],
    waterNeeds: ['moderate', 'drip', 'canal', 'well irrigation'],
    phMin: 6.0, phMax: 7.5,
    baseScore: 78,
    waterRequirement: 'Moderate (drip preferred, 500–700mm)',
    growingPeriod: '90–120 days',
    reasons: [
      'Dharwad, Gadag & Bijapur are major onion export hubs of Karnataka',
      'Kharif & Rabi both possible in North Karnataka',
      'Consistent demand; stable prices due to national importance',
    ],
    preferredDistricts: [
      'Gadag', 'Dharwad', 'Haveri', 'Vijayapura (Bijapur)', 'Bagalkot',
      'Bidar', 'Raichur', 'Kalaburagi (Gulbarga)', 'Belagavi (Belgaum)',
      'Chitradurga', 'Davanagere', 'Koppal',
    ],
  },
  {
    cropName: 'Pomegranate',
    cropEmoji: '🍎',
    soilTypes: ['sandy loam', 'loam', 'red loam', 'black cotton'],
    waterNeeds: ['drip', 'low', 'moderate'],
    phMin: 5.5, phMax: 8.0,
    baseScore: 81,
    waterRequirement: 'Low–Moderate (drip irrigation, 500–800mm)',
    growingPeriod: '5–7 months fruiting; long-lived orchard',
    reasons: [
      'Bijapur/Vijayapura pomegranate has international export reputation',
      'Highly drought-tolerant once established; ideal for semi-arid zones',
      'Premium Bhagwa variety fetches excellent export prices',
    ],
    preferredDistricts: [
      'Vijayapura (Bijapur)', 'Bagalkot', 'Raichur', 'Yadgir',
      'Kalaburagi (Gulbarga)', 'Bidar', 'Dharwad', 'Koppal',
      'Ballari (Bellary)', 'Vijayanagara',
    ],
  },
  {
    cropName: 'Mango',
    cropEmoji: '🥭',
    soilTypes: ['sandy loam', 'loam', 'red loam', 'laterite', 'alluvial'],
    waterNeeds: ['moderate', 'rain-fed', 'low', 'drip'],
    phMin: 5.5, phMax: 7.5,
    baseScore: 76,
    waterRequirement: 'Moderate (800–2500mm; dry spell before flowering needed)',
    growingPeriod: '3–5 years to first crop; 20–40 years productive',
    reasons: [
      "Kolar & Chikkaballapur are Karnataka's mango belt (Alphonso, Banganapalli)",
      'Dry spell before season induces heavy flowering',
      'Stable long-term orchard income',
    ],
    preferredDistricts: [
      'Kolar', 'Chikkaballapur', 'Tumakuru (Tumkur)', 'Mandya',
      'Ramanagara', 'Bengaluru Rural', 'Raichur', 'Koppal',
      'Ballari (Bellary)', 'Vijayanagara', 'Dharwad', 'Bagalkot',
    ],
  },
  {
    cropName: 'Mulberry (Sericulture)',
    cropEmoji: '🌿',
    soilTypes: ['loam', 'sandy loam', 'clay loam', 'red loam'],
    waterNeeds: ['moderate', 'drip', 'canal', 'well irrigation'],
    phMin: 6.2, phMax: 7.2,
    baseScore: 77,
    waterRequirement: 'Moderate (drip/sprinkler, year-round)',
    growingPeriod: 'Perennial; leaf harvest every 35–45 days',
    reasons: [
      "Karnataka produces 70% of India's mulberry silk — Mandya & Mysuru lead",
      'Sericulture provides employment through silkworm rearing',
      'Govt of Karnataka provides subsidised silkworm seed & equipment',
    ],
    preferredDistricts: [
      'Mandya', 'Mysuru (Mysore)', 'Ramanagara', 'Chikkaballapur',
      'Kolar', 'Tumakuru (Tumkur)', 'Hassan', 'Chamarajanagar',
    ],
  },
  {
    cropName: 'Soybean',
    cropEmoji: '🟢',
    soilTypes: ['loam', 'clay loam', 'black cotton', 'medium black', 'red loam'],
    waterNeeds: ['moderate', 'rain-fed', 'drip'],
    phMin: 6.0, phMax: 7.5,
    baseScore: 75,
    waterRequirement: 'Moderate (600–900mm Kharif season)',
    growingPeriod: '90–110 days',
    reasons: [
      'Dharwad, Belagavi & Bidar are top soybean districts of Karnataka',
      'Short duration Kharif crop — fits well before Rabi crops',
      'High protein content; consistent demand from oil mills & food industry',
    ],
    preferredDistricts: [
      'Dharwad', 'Belagavi (Belgaum)', 'Haveri', 'Gadag',
      'Bidar', 'Kalaburagi (Gulbarga)', 'Vijayapura (Bijapur)', 'Bagalkot',
    ],
  },
  {
    cropName: 'Potato',
    cropEmoji: '🥔',
    soilTypes: ['sandy loam', 'loam', 'red loam'],
    waterNeeds: ['moderate', 'drip', 'well irrigation', 'canal'],
    phMin: 5.0, phMax: 6.5,
    baseScore: 73,
    waterRequirement: 'Moderate (well-distributed, drip preferred)',
    growingPeriod: '70–90 days',
    reasons: [
      'Hassan & Bengaluru Rural produce quality potato for South India market',
      'Cool climate of hill districts (Kodagu, Chikkamagaluru) ideal',
      'High yield, good market price during off-season production',
    ],
    preferredDistricts: [
      'Bengaluru Rural', 'Chikkaballapur', 'Hassan', 'Kodagu (Coorg)',
      'Chikkamagaluru', 'Mandya', 'Tumakuru (Tumkur)',
    ],
  },
];

export const KERALA_DISTRICTS = [
  'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha', 'Kottayam',
  'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad', 'Malappuram',
  'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod',
];

export const KARNATAKA_DISTRICTS = [
  'Bagalkot', 'Ballari (Bellary)', 'Belagavi (Belgaum)', 'Bengaluru Rural',
  'Bengaluru Urban', 'Bidar', 'Chamarajanagar', 'Chikkaballapur', 'Chikkamagaluru',
  'Chitradurga', 'Dakshina Kannada', 'Davanagere', 'Dharwad', 'Gadag', 'Hassan',
  'Haveri', 'Kalaburagi (Gulbarga)', 'Kodagu (Coorg)', 'Kolar', 'Koppal', 'Mandya',
  'Mysuru (Mysore)', 'Raichur', 'Ramanagara', 'Shivamogga (Shimoga)', 'Tumakuru (Tumkur)',
  'Udupi', 'Uttara Kannada', 'Vijayapura (Bijapur)', 'Vijayanagara', 'Yadgir',
];

export function getCropRecommendations(farmInput: FarmInput): CropRecommendation[] {
  const { district, soilType, ph, waterAvailability, previousCrop } = farmInput;

  const soilLower = soilType?.toLowerCase() || '';
  const waterLower = waterAvailability?.toLowerCase() || '';
  const prevCropLower = previousCrop?.toLowerCase() || '';
  const districtLower = district?.toLowerCase() || '';

  // Detect state context for regional penalty logic
  const isKarnataka = districtLower
    ? KARNATAKA_DISTRICTS.some(d => {
        const dl = d.toLowerCase();
        return districtLower.includes(dl.split(' ')[0]) || dl.includes(districtLower.split(' ')[0]);
      })
    : false;
  const isKerala = districtLower
    ? KERALA_DISTRICTS.some(d => {
        const dl = d.toLowerCase();
        return districtLower.includes(dl) || dl.includes(districtLower);
      })
    : false;

  const scored = CROP_RULES.map((rule) => {
    let score = rule.baseScore;

    // Soil type match
    const soilMatch = rule.soilTypes.some(s => soilLower.includes(s) || s.includes(soilLower));
    if (soilLower && soilMatch) score += 10;
    if (soilLower && !soilMatch) score -= 15;

    // Water availability match
    const waterMatch = rule.waterNeeds.some(w => waterLower.includes(w) || w.includes(waterLower));
    if (waterLower && waterMatch) score += 5;
    if (waterLower && !waterMatch) score -= 10;

    // pH match
    if (ph) {
      if (ph >= rule.phMin && ph <= rule.phMax) {
        score += 5;
      } else if (ph < rule.phMin - 1 || ph > rule.phMax + 1) {
        score -= 15;
      }
    }

    // District match — big boost for geographic relevance
    let districtMatch = false;
    if (districtLower && rule.preferredDistricts?.some(d => {
      const dl = d.toLowerCase();
      return districtLower.includes(dl) || dl.includes(districtLower) ||
        districtLower.split(/[\s(]/)[0] === dl.split(/[\s(]/)[0];
    })) {
      score += 22;
      districtMatch = true;
    }

    // Regional penalties — suppress clearly wrong-region crops
    const karnatakaOnlycrops = ['Ragi (Finger Millet)', 'Jowar (Sorghum)', 'Bajra (Pearl Millet)',
      'Cotton (Bt)', 'Sunflower', 'Pomegranate', 'Soybean', 'Mulberry (Sericulture)', 'Maize (Corn)'];
    const keralaOnlyCrops = ['Rubber', 'Tapioca (Cassava)', 'Pineapple', 'Jackfruit'];

    if (isKerala && !districtMatch && karnatakaOnlycrops.includes(rule.cropName)) score -= 22;
    if (isKarnataka && !districtMatch && keralaOnlyCrops.includes(rule.cropName)) score -= 22;

    // Crop rotation penalty
    if (prevCropLower && rule.notAfter?.some(n => prevCropLower.includes(n))) {
      score -= 25;
    }

    // Clamp 20–99
    score = Math.max(20, Math.min(99, score));

    const reasons = [...rule.reasons];
    if (districtMatch && district) reasons.unshift(`Highly suitable for ${district} district`);
    else if (soilMatch && soilLower) reasons.unshift(`Soil type (${soilType}) is well-suited`);
    if (ph && ph >= rule.phMin && ph <= rule.phMax) reasons.push(`pH ${ph} is in ideal range (${rule.phMin}–${rule.phMax})`);

    return {
      cropName: rule.cropName,
      suitabilityPercent: score,
      reasons: reasons.slice(0, 3),
      waterRequirement: rule.waterRequirement,
      growingPeriod: rule.growingPeriod,
      cropEmoji: rule.cropEmoji,
    } as CropRecommendation;
  });

  return scored
    .sort((a, b) => b.suitabilityPercent - a.suitabilityPercent)
    .slice(0, 8);
}


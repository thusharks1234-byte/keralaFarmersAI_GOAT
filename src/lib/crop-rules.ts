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
  {
    cropName: 'Coconut',
    cropEmoji: '🥥',
    soilTypes: ['sandy loam', 'laterite', 'loam', 'red laterite', 'alluvial'],
    waterNeeds: ['moderate', 'high', 'canal', 'rain-fed'],
    phMin: 5.5, phMax: 8.0,
    baseScore: 85,
    waterRequirement: 'Moderate (800–1200mm rainfall)',
    growingPeriod: '5–7 years to first yield',
    reasons: ['Suited to Kerala\'s climate', 'Good for laterite soil', 'High market value'],
    preferredDistricts: ['Kozhikode', 'Malappuram', 'Thiruvananthapuram', 'Kollam', 'Alappuzha', 'Thrissur', 'Kannur', 'Kasaragod'],
  },
  {
    cropName: 'Banana',
    cropEmoji: '🍌',
    soilTypes: ['loam', 'clay loam', 'alluvial', 'red laterite'],
    waterNeeds: ['high', 'canal', 'well irrigation'],
    phMin: 5.5, phMax: 7.5,
    baseScore: 80,
    waterRequirement: 'High (1200–2500mm)',
    growingPeriod: '10–12 months',
    reasons: ['Fast growing', 'Good water retention in loam', 'High demand in Kerala markets'],
    preferredDistricts: ['Thrissur', 'Ernakulam', 'Wayanad', 'Palakkad', 'Thiruvananthapuram', 'Kollam'],
  },
  {
    cropName: 'Paddy (Rice)',
    cropEmoji: '🌾',
    soilTypes: ['clay', 'clay loam', 'alluvial', 'kari'],
    waterNeeds: ['high', 'canal', 'paddy field'],
    phMin: 5.0, phMax: 7.0,
    baseScore: 78,
    waterRequirement: 'High (needs standing water)',
    growingPeriod: '90–150 days',
    reasons: ['Traditional Kerala crop', 'Clay soil ideal', 'Well suited for waterlogged areas'],
    preferredDistricts: ['Alappuzha', 'Palakkad', 'Thrissur', 'Ernakulam', 'Kottayam'],
  },
  {
    cropName: 'Pepper (Black)',
    cropEmoji: '🫑',
    soilTypes: ['laterite', 'red laterite', 'forest loam'],
    waterNeeds: ['moderate', 'rain-fed'],
    phMin: 5.0, phMax: 6.5,
    baseScore: 75,
    waterRequirement: 'Moderate (rain-fed, well-drained)',
    growingPeriod: '3 years to first yield',
    reasons: ['Spice crop, high value', 'Good for laterite', 'Traditional Kerala spice'],
    notAfter: ['pepper'],
    preferredDistricts: ['Idukki', 'Wayanad', 'Kannur', 'Kozhikode', 'Pathanamthitta'],
  },
  {
    cropName: 'Tapioca (Cassava)',
    cropEmoji: '🥔',
    soilTypes: ['sandy loam', 'laterite', 'loam', 'red laterite'],
    waterNeeds: ['low', 'rain-fed', 'moderate'],
    phMin: 5.0, phMax: 8.0,
    baseScore: 72,
    waterRequirement: 'Low (drought tolerant)',
    growingPeriod: '6–12 months',
    reasons: ['Drought tolerant', 'Good for poor soils', 'Steady local demand'],
    preferredDistricts: ['Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Kottayam'],
  },
  {
    cropName: 'Ginger',
    cropEmoji: '🫚',
    soilTypes: ['loam', 'sandy loam', 'forest loam'],
    waterNeeds: ['moderate', 'rain-fed'],
    phMin: 5.5, phMax: 7.0,
    baseScore: 70,
    waterRequirement: 'Moderate (well-drained)',
    growingPeriod: '8–9 months',
    reasons: ['High market value spice', 'Good in well-drained loamy soil', 'Kerala specialty'],
    notAfter: ['ginger'],
    preferredDistricts: ['Wayanad', 'Idukki', 'Palakkad', 'Ernakulam'],
  },
  {
    cropName: 'Rubber',
    cropEmoji: '🌳',
    soilTypes: ['laterite', 'red laterite', 'loam'],
    waterNeeds: ['moderate', 'rain-fed', 'high'],
    phMin: 4.5, phMax: 6.5,
    baseScore: 75,
    waterRequirement: 'Moderate (>2000mm annual rainfall)',
    growingPeriod: '6–7 years to tapping',
    reasons: ['Major Kerala cash crop', 'Good for laterite and sloped land', 'Long-term income'],
    preferredDistricts: ['Kottayam', 'Pathanamthitta', 'Ernakulam', 'Idukki', 'Kollam', 'Thiruvananthapuram'],
  },
  {
    cropName: 'Vegetables (Mixed)',
    cropEmoji: '🥦',
    soilTypes: ['loam', 'sandy loam', 'alluvial', 'clay loam'],
    waterNeeds: ['moderate', 'canal', 'drip'],
    phMin: 5.5, phMax: 7.0,
    baseScore: 68,
    waterRequirement: 'Moderate (regular irrigation)',
    growingPeriod: '2–4 months per cycle',
    reasons: ['Quick returns', 'Year-round demand', 'Suitable for small farms'],
    preferredDistricts: ['Thiruvananthapuram', 'Kollam', 'Ernakulam', 'Thrissur', 'Palakkad', 'Wayanad', 'Idukki'],
  },
  {
    cropName: 'Turmeric',
    cropEmoji: '🟡',
    soilTypes: ['clay loam', 'loam', 'sandy loam'],
    waterNeeds: ['moderate', 'rain-fed', 'well irrigation'],
    phMin: 4.5, phMax: 7.5,
    baseScore: 68,
    waterRequirement: 'Moderate (well-drained preferred)',
    growingPeriod: '7–9 months',
    reasons: ['High market value', 'Suits Kerala agro-climate', 'Growing export demand'],
    notAfter: ['turmeric'],
    preferredDistricts: ['Palakkad', 'Ernakulam', 'Wayanad', 'Idukki', 'Thrissur'],
  },
  {
    cropName: 'Arecanut (Betel Nut)',
    cropEmoji: '🌴',
    soilTypes: ['laterite', 'clay loam', 'alluvial', 'loam'],
    waterNeeds: ['moderate', 'canal', 'well irrigation'],
    phMin: 5.0, phMax: 8.0,
    baseScore: 76,
    waterRequirement: 'Moderate (regular watering)',
    growingPeriod: '6–8 years to first yield',
    reasons: ['Major Kerala crop', 'Strong local market', 'Long productive life'],
    preferredDistricts: ['Kasaragod', 'Malappuram', 'Kannur', 'Kozhikode', 'Wayanad'],
  },
  {
    cropName: 'Cardamom',
    cropEmoji: '🌿',
    soilTypes: ['forest loam', 'loam'],
    waterNeeds: ['high', 'rain-fed'],
    phMin: 4.5, phMax: 6.0,
    baseScore: 70,
    waterRequirement: 'High (1500–2500mm, cool climate)',
    growingPeriod: '2-3 years to yield',
    reasons: ['Extremely high market value', 'Ideal for high altitudes', 'Major export spice'],
    preferredDistricts: ['Idukki', 'Wayanad', 'Palakkad'],
  },
];

const KERALA_DISTRICTS = [
  'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha', 'Kottayam',
  'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad', 'Malappuram',
  'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod',
];

  export function getCropRecommendations(farmInput: FarmInput): CropRecommendation[] {
    const { district, soilType, ph, waterAvailability, previousCrop } = farmInput;
    
    const soilLower = soilType?.toLowerCase() || '';
    const waterLower = waterAvailability?.toLowerCase() || '';
    const prevCropLower = previousCrop?.toLowerCase() || '';
    const districtLower = district?.toLowerCase() || '';
  
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
  
      // District match (Geographic real data)
      let districtMatch = false;
      if (districtLower && rule.preferredDistricts?.some(d => districtLower.includes(d.toLowerCase()))) {
        score += 20; // Big boost for location match
        districtMatch = true;
      }
  
      // Crop rotation penalty
      if (prevCropLower && rule.notAfter?.some(n => prevCropLower.includes(n))) {
        score -= 25;
      }
  
      // Clamp 0–99
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

  return scored.sort((a, b) => b.suitabilityPercent - a.suitabilityPercent);
}

export { KERALA_DISTRICTS };

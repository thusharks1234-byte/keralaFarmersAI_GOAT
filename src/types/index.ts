export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  preferred_language: 'en' | 'ml' | 'hi';
  created_at: string;
  updated_at: string;
}

export interface Farm {
  id: string;
  owner_id: string;
  farm_name: string | null;
  district: string | null;
  village: string | null;
  pincode: string | null;
  latitude: number | null;
  longitude: number | null;
  area_acres: number | null;
  farm_type: string | null;
  farming_experience_years: number | null;
  created_at: string;
  updated_at: string;
}

export interface SoilData {
  id: string;
  farm_id: string;
  soil_type: string | null;
  ph: number | null;
  nitrogen: number | null;
  phosphorus: number | null;
  potassium: number | null;
  water_availability: string | null;
  updated_at: string;
}

export interface CropCycle {
  id: string;
  farm_id: string;
  crop_name: string;
  is_current: boolean;
  planting_date: string | null;
  expected_harvest_date: string | null;
  previous_crop: string | null;
  created_at: string;
}

export interface FarmActivity {
  id: string;
  farm_id: string;
  activity_type: string;
  description: string | null;
  created_at: string;
}

export interface ChatSession {
  id: string;
  owner_id: string;
  title: string | null;
  language: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface MarketPrice {
  id: string;
  commodity: string;
  market: string;
  district: string | null;
  min_price: number | null;
  max_price: number | null;
  modal_price: number | null;
  unit: string;
  price_date: string;
  source: string;
  synced_at: string;
}

export interface GovernmentScheme {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  eligibility: string | null;
  benefit: string | null;
  deadline: string | null;
  source_url: string | null;
  last_verified_at: string | null;
  created_at: string;
}

export interface FarmTask {
  id: string;
  farm_id: string;
  title: string;
  category: 'irrigation' | 'fertilizer' | 'pest_control' | 'weeding' | 'harvest' | 'other';
  due_date: string;
  reminder: boolean;
  notes: string | null;
  status: 'pending' | 'completed';
  created_at: string;
}

export interface UserPreferences {
  owner_id: string;
  units: string;
  notifications_enabled: boolean;
  notify_disease_doctor: boolean;
  updated_at: string;
}

export interface SupportRequest {
  id?: string;
  name: string;
  email: string;
  message: string;
  created_at?: string;
}

export type Language = 'en' | 'ml' | 'hi';

export interface WeatherData {
  current: {
    temperature: number;
    humidity: number;
    windspeed: number;
    weathercode: number;
    apparent_temperature: number;
    precipitation: number;
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weathercode: number[];
    precipitation_sum: number[];
    sunrise: string[];
    sunset: string[];
  };
}

export interface CropRecommendation {
  cropName: string;
  suitabilityPercent: number;
  reasons: string[];
  waterRequirement: string;
  growingPeriod: string;
  cropEmoji: string;
}

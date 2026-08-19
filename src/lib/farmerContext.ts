/**
 * farmerContext.ts
 * Safe, cached farmer context builder for use in the voice assistant's AI prompts.
 * Fetches only non-sensitive, agriculturally relevant data.
 * Does NOT re-fetch on every query — the caller manages caching.
 */
import { supabase } from './supabase';

export interface FarmerContext {
  farmerName: string | null;
  districtOrRegion: string | null;
  currentCrop: string | null;
  farmType: string | null;
  preferredLanguage: 'en' | 'ml';
}

/** Fetches a minimal, safe farming context for the given authenticated user id. */
export async function fetchFarmerContext(userId: string): Promise<FarmerContext | null> {
  try {
    const [profileRes, farmRes] = await Promise.all([
      supabase.from('profiles').select('full_name, preferred_language').eq('id', userId).single(),
      supabase.from('farms').select('id, district, farm_type').eq('owner_id', userId).single(),
    ]);

    const cropRes = farmRes.data?.id
      ? await supabase
          .from('crop_cycles')
          .select('crop_name')
          .eq('farm_id', farmRes.data.id)
          .eq('is_current', true)
          .single()
      : { data: null };

    return {
      farmerName:        profileRes.data?.full_name ?? null,
      districtOrRegion:  farmRes.data?.district   ?? null,
      currentCrop:       (cropRes as { data: { crop_name?: string } | null })?.data?.crop_name ?? null,
      farmType:          farmRes.data?.farm_type   ?? null,
      preferredLanguage: (profileRes.data?.preferred_language as 'en' | 'ml') ?? 'en',
    };
  } catch {
    // Unauthenticated users or missing data — degrade gracefully
    return null;
  }
}

/**
 * Builds the language instruction fragment for the AI system prompt.
 * Centralizes all language instruction strings in one place.
 */
export function buildLanguageInstruction(lang: 'ml' | 'hi' | 'en' | 'unknown'): string {
  switch (lang) {
    case 'ml': return 'Respond in simple, conversational Malayalam suitable for farmers. Use common words, not formal or literary Malayalam.';
    case 'hi': return 'Respond in simple, conversational Hindi suitable for farmers. Use common words.';
    default:   return 'Respond in simple, clear English suitable for farmers.';
  }
}

/**
 * Builds a farmer context fragment for the AI system prompt.
 * Returns an empty string if no context is available.
 * Deliberately omits sensitive fields (auth tokens, exact GPS coords, etc).
 */
export function buildFarmerContextFragment(ctx: FarmerContext | null): string {
  if (!ctx) return '';
  const parts: string[] = [];
  if (ctx.farmerName)       parts.push(`Farmer: ${ctx.farmerName}`);
  if (ctx.districtOrRegion) parts.push(`Region: ${ctx.districtOrRegion}, Kerala, India`);
  if (ctx.currentCrop)      parts.push(`Current crop: ${ctx.currentCrop}`);
  if (ctx.farmType)         parts.push(`Farm type: ${ctx.farmType}`);
  if (parts.length === 0) return '';
  return `\n\nFarmer context (use for personalization only, do NOT repeat back):\n${parts.join('\n')}`;
}

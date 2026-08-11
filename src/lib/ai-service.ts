import { supabase } from './supabase';

// ─── API Keys (from .env) ─────────────────────────────────────────────
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY as string;
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY as string;
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY as string;

// ─── System Prompt ────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are Krishi Mithram (കൃഷി മിത്രം), an expert AI agricultural assistant for farmers in Kerala, India.
Your goal is to provide accurate, actionable, and scientific farming advice based on the user's context.
Keep your answers concise, practical, and highly relevant to Kerala's climate, crops, and soil types (laterite, red laterite, alluvial, kari).
Major crops in Kerala: Paddy, Coconut, Rubber, Banana, Tapioca, Pepper, Cardamom, Coffee, Tea, Ginger, Turmeric, Vegetables.
If the user asks in Malayalam, reply in fluent Malayalam. If in English, reply in English.
Always be helpful, empathetic, and culturally aware of Kerala's farming traditions.`;

function buildMessages(message: string, context: string, lang: string) {
  return [
    {
      role: 'system',
      content: `${SYSTEM_PROMPT}\nFarm Context: ${context || 'Kerala farmer'}\nLanguage: ${lang}`,
    },
    { role: 'user', content: message },
  ];
}

// ─── 1. GROQ (PRIMARY — fastest, free tier) ───────────────────────────
async function callGroq(message: string, context: string, lang: string): Promise<string> {
  const GROQ_MODELS = [
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
    'gemma2-9b-it',
    'mixtral-8x7b-32768',
  ];

  for (const model of GROQ_MODELS) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          messages: buildMessages(message, context, lang),
          temperature: 0.7,
          max_tokens: 700,
        }),
      });

      if (response.status === 429) {
        // Rate limited on this model, try next
        console.warn(`Groq model ${model} rate-limited, trying next...`);
        continue;
      }

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`Groq model ${model} failed (${response.status}): ${errText}`);
        continue;
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content;
      if (text) {
        console.log(`✅ Groq success with model: ${model}`);
        return text;
      }
    } catch (e) {
      console.warn(`Groq model ${model} threw:`, e);
    }
  }

  throw new Error('All Groq models failed');
}

// ─── 2. OpenRouter (Secondary) ────────────────────────────────────────
async function callOpenRouter(message: string, context: string, lang: string): Promise<string> {
  const MODELS = [
    'mistralai/mistral-7b-instruct:free',
    'meta-llama/llama-3.2-3b-instruct:free',
    'google/gemma-3-4b-it:free',
    'qwen/qwen3-8b:free',
    'deepseek/deepseek-chat-v3-0324:free',
  ];

  for (const model of MODELS) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Krishi Mithram',
        },
        body: JSON.stringify({
          model,
          messages: buildMessages(message, context, lang),
          temperature: 0.7,
          max_tokens: 600,
        }),
      });

      if (!response.ok) {
        console.warn(`OpenRouter model ${model} failed (${response.status})`);
        continue;
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content;
      if (text) {
        console.log(`✅ OpenRouter success with: ${model}`);
        return text;
      }
    } catch (e) {
      console.warn(`OpenRouter model ${model} threw:`, e);
    }
  }

  throw new Error('All OpenRouter models failed');
}

// ─── 3. OpenAI (Tertiary) ─────────────────────────────────────────────
async function callOpenAI(message: string, context: string, lang: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: buildMessages(message, context, lang),
      temperature: 0.7,
      max_tokens: 600,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI (${response.status}): ${err.slice(0, 200)}`);
  }
  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty OpenAI response');
  return text;
}



// ─── Main Orchestrator ────────────────────────────────────────────────
/**
 * Sends a chat message with automatic provider fallback.
 * Priority: Groq → OpenRouter → OpenAI
 */
export async function sendChatMessage(
  sessionId: string,
  message: string,
  context: string,
  lang: string
): Promise<{ reply: string; provider: string }> {

  // Save user message
  await supabase.from('chat_messages').insert({
    session_id: sessionId,
    role: 'user',
    content: message,
  });

  let reply = '';
  let provider = '';
  const errors: string[] = [];

  // 1. Groq
  try {
    console.log('🚀 Trying Groq...');
    reply = await callGroq(message, context, lang);
    provider = 'groq';
  } catch (e1) {
    errors.push(`Groq: ${(e1 as Error).message}`);
    console.warn('⚠️ Groq failed, trying OpenRouter...');

    // 2. OpenRouter
    try {
      reply = await callOpenRouter(message, context, lang);
      provider = 'openrouter';
    } catch (e2) {
      errors.push(`OpenRouter: ${(e2 as Error).message}`);
      console.warn('⚠️ OpenRouter failed, trying OpenAI...');

      // 3. OpenAI
      try {
        reply = await callOpenAI(message, context, lang);
        provider = 'openai';
      } catch (e3) {
        errors.push(`OpenAI: ${(e3 as Error).message}`);
        console.error('❌ All providers failed:\n' + errors.join('\n'));
        throw new Error(
          'All AI services are temporarily unavailable. Please try again in a moment.'
        );
      }
    }
  }

  // Save assistant reply
  await supabase.from('chat_messages').insert({
    session_id: sessionId,
    role: 'assistant',
    content: reply,
  });

  // Update session timestamp
  await supabase
    .from('chat_sessions')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', sessionId);

  console.log(`✅ Response from: ${provider}`);
  return { reply, provider };
}

/**
 * Dynamically translates a list of English words/phrases to Malayalam using Groq.
 */
export async function translateToMalayalam(texts: string[]): Promise<Record<string, string>> {
  const uniqueTexts = Array.from(new Set(texts.map(t => t?.trim()).filter(Boolean)));
  if (uniqueTexts.length === 0) return {};
  if (!GROQ_API_KEY) {
    console.warn("No Groq API Key found for translations");
    return {};
  }

  // To prevent token overflows, split into chunks of max 60 items
  const chunkSize = 60;
  const chunks: string[][] = [];
  for (let i = 0; i < uniqueTexts.length; i += chunkSize) {
    chunks.push(uniqueTexts.slice(i, i + chunkSize));
  }

  const translations: Record<string, string> = {};

  for (const chunk of chunks) {
    const prompt = `Translate the following list of agricultural commodities, market names, district names, state names, and crop varieties from English to Malayalam.
Return ONLY a valid JSON object mapping the exact English term to its Malayalam translation. Do not include markdown formatting, markdown blocks (like \`\`\`json), or any explanations.
Example:
{"Coconut": "തേങ്ങ", "Kerala": "കേരളം"}

List to translate:
${JSON.stringify(chunk)}`;

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: 'You are a translation assistant returning raw JSON mapping.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.1,
          max_tokens: 1500,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content?.trim();
        if (content) {
          const jsonStr = content.replace(/^```json/, '').replace(/```$/, '').trim();
          try {
            const parsed = JSON.parse(jsonStr);
            Object.assign(translations, parsed);
          } catch (e) {
            console.error("Failed to parse dynamic translation chunk response", e, content);
          }
        }
      }
    } catch (e) {
      console.error("Dynamic translation chunk request failed", e);
    }
  }

  return translations;
}

/**
 * Identifies crop disease using Groq Vision API, falling back to OpenAI if Groq Vision is unavailable.
 */
export async function identifyCropDisease(base64Image: string, lang: string): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error('Groq API Key is missing. Please configure VITE_GROQ_API_KEY.');
  }

  // Ensure base64Image starts with 'data:image/...;base64,'
  const imageUrl = base64Image.startsWith('data:') 
    ? base64Image 
    : `data:image/jpeg;base64,${base64Image}`;

  const prompt = lang === 'ml'
    ? `ഈ വിള ചിത്രത്തിൽ കാണുന്ന രോഗം കണ്ടെത്തുക.
ദയവായി താഴെ പറയുന്ന വിവരങ്ങൾ കൃത്യമായി നൽകുക:
1. രോഗത്തിന്റെ പേര് (മലയാളത്തിലും ഇംഗ്ലീഷിലും)
2. രോഗബാധയുടെ തീവ്രത (ലഘുവായത് / മിതമായത് / ഗുരുതരമായത്)
3. പ്രധാന ലക്ഷണങ്ങൾ (Symptoms)
4. ജൈവ പ്രതിവിധികൾ (Organic remedies / solutions)
5. രാസ പ്രതിവിധികൾ (Chemical remedies - optional)
6. തടയാനുള്ള മുൻകരുതലുകൾ (Prevention tips)

നിങ്ങളുടെ മറുപടി ലളിതവും കർഷകർക്ക് മനസ്സിലാകുന്നതുമായ രീതിയിൽ മലയാളത്തിൽ ആയിരിക്കണം. ശീർഷകങ്ങളും വിവരങ്ങളും വായിക്കാൻ എളുപ്പമുള്ള രീതിയിൽ മാർക്ക്ഡൗണിൽ ഫോർമാറ്റ് ചെയ്യുക.`
    : `Analyze this crop image to identify any disease. 
Provide:
1. Disease Name (and scientific name)
2. Severity Level (Mild / Moderate / Severe)
3. Symptoms observed
4. Organic remedies / solutions
5. Chemical remedies (if necessary)
6. Prevention tips

Provide clear, structured, and actionable formatting in markdown.`;

  const GROQ_VISION_MODELS = [
    'llama-3.2-11b-vision-preview',
    'llama-3.2-90b-vision-preview'
  ];

  let lastError: any;
  for (const model of GROQ_VISION_MODELS) {
    try {
      console.log(`🚀 Attempting disease diagnosis using Groq Vision model: ${model}`);
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: imageUrl } }
              ]
            }
          ],
          temperature: 0.2,
          max_tokens: 1200,
        }),
      });

      if (response.status === 429) {
        console.warn(`Groq Vision model ${model} rate-limited, trying next...`);
        continue;
      }

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`Groq Vision model ${model} failed (${response.status}): ${errText}`);
        continue;
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content;
      if (text) {
        console.log(`✅ Groq Vision success with: ${model}`);
        return text;
      }
    } catch (e) {
      console.warn(`Groq Vision model ${model} threw:`, e);
      lastError = e;
    }
  }

  // Fallback to OpenAI Vision
  if (OPENAI_API_KEY) {
    try {
      console.log('🚀 Falling back to OpenAI Vision (gpt-4o-mini)...');
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: imageUrl } }
              ]
            }
          ],
          temperature: 0.2,
          max_tokens: 1200,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.choices?.[0]?.message?.content || 'Empty response from OpenAI';
      }
    } catch (e) {
      console.error('OpenAI Vision fallback failed:', e);
    }
  }

  throw lastError || new Error('All vision models failed. Please verify your Groq API Key and internet connection.');
}



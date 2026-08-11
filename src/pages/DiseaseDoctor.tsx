import { useState, useRef } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { FlaskConical, Camera, Upload, Trash2, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

interface DiseaseInfo {
  nameEn: string;
  nameMl: string;
  symptomsEn: string[];
  symptomsMl: string[];
  organicEn: string[];
  organicMl: string[];
  chemicalEn: string[];
  chemicalMl: string[];
  preventionEn: string[];
  preventionMl: string[];
}

// 100% Deterministic Disease Knowledge Base for common Indian/Kerala diseases
const DISEASE_DATABASE: Record<string, DiseaseInfo> = {
  'Phytophthora palmivora': {
    nameEn: 'Coconut Bud Rot',
    nameMl: 'കൂമ്പ് ചീയൽ (തെങ്ങ്)',
    symptomsEn: [
      'Yellowing and withering of the young spear leaf',
      'Rotted tissues emit a foul smell',
      'The bud easily detaches when pulled gently',
      'Gradual yellowing and drooping of surrounding leaves'
    ],
    symptomsMl: [
      'ഇളം കൂമ്പ് ഇലകൾ മഞ്ഞനിറമായി ഉണങ്ങാൻ തുടങ്ങുന്നു',
      'ചീഞ്ഞ കൂമ്പ് ഭാഗത്തുനിന്ന് ദുർഗന്ധം വമിക്കുന്നു',
      'മെല്ലെ വലിച്ചാൽ കൂമ്പില എളുപ്പത്തിൽ അടർന്നുപോരുന്നു',
      'തൊട്ടടുത്ത ഓലകൾ പച്ചപ്പ് നഷ്ടപ്പെട്ട് താഴേക്ക് തൂങ്ങുന്നു'
    ],
    organicEn: [
      'Cut and remove all affected rotted tissue from the bud area.',
      'Apply Bordeaux paste on the cut surface to seal the wound.',
      'Pour Pseudomonas fluorescens solution (20g/L) on leaf axils.'
    ],
    organicMl: [
      'ബാധിച്ച കൂമ്പ് ഭാഗങ്ങൾ പൂർണ്ണമായും മുറിച്ചു മാറ്റി നശിപ്പിക്കുക.',
      'മുറിപ്പാടിൽ ബോർഡോ പേസ്റ്റ് നന്നായി പുരട്ടി സംരക്ഷിക്കുക.',
      'ഓലക്കവിളുകളിൽ സുഡോമോണസ് ലായനി (ഒരു ലിറ്ററിൽ 20 ഗ്രാം) ഒഴിച്ച് കൊടുക്കുക.'
    ],
    chemicalEn: [
      'Spray 1% Bordeaux mixture on the crown of surrounding healthy trees as a preventive measure.',
      'Place Mancozeb sachets (3g per tree) in the leaf axils of the crop.'
    ],
    chemicalMl: [
      'ചുറ്റുമുള്ള രോഗമില്ലാത്ത തെങ്ങുകളുടെ മണ്ടയിൽ 1% ബോർഡോ മിശ്രിതം തളിക്കുക.',
      'ഓലക്കവിളുകളിൽ മാങ്കോസെബ് അടങ്ങിയ സാഷെകൾ വെക്കുക.'
    ],
    preventionEn: [
      'Clean leaf axils and crown regularly before the monsoon seasons.',
      'Ensure proper drainage to prevent waterlogging around the root zone.'
    ],
    preventionMl: [
      'കാലവർഷത്തിന് മുന്നോടിയായി തെങ്ങിൻ മണ്ടയും ഓലക്കവിളുകളും വൃത്തിയാക്കുക.',
      'തടങ്ങളിൽ വെള്ളം കെട്ടിക്കിടക്കാതെ വെള്ളവാർച്ചാ സൗകര്യം ഉറപ്പാക്കുക.'
    ]
  },
  'Phytoplasma': {
    nameEn: 'Coconut Root Wilt Disease',
    nameMl: 'കാറ്റുവീഴ്ച രോഗം (തെങ്ങ്)',
    symptomsEn: [
      'Flaccidity (ribbing) of leaves where leaflets curve inward',
      'Yellowing and necrosis of older leaves',
      'Marginal necrosis and drying of leaflets',
      'Reduction in nut size and kernel thickness'
    ],
    symptomsMl: [
      'ഓലക്കാലുകൾ ഉൾവലിഞ്ഞ് തോണി പോലെ വളയുന്ന സ്വഭാവം (Flaccidity)',
      'മൂത്ത ഓലകൾ മഞ്ഞനിറമായി ഉണങ്ങി നശിക്കുന്നു',
      'ഓലക്കാലുകളുടെ അരികുകൾ കരിഞ്ഞുണങ്ങുന്നു',
      'തേങ്ങയുടെ വലിപ്പം കുറയുകയും കൊപ്രയുടെ കനം കുറയുകയും ചെയ്യുന്നു'
    ],
    organicEn: [
      'Apply organic manures like neem cake (5kg/tree) and compost to improve tree vigor.',
      'Grow cover crops like Calopogonium mucunoides in the basin.'
    ],
    organicMl: [
      'തെങ്ങൊന്നിന് 5 കിലോ വേപ്പിൻപിണ്ണാക്കും കമ്പോസ്റ്റും നൽകി പ്രതിരോധശേഷി വർദ്ധിപ്പിക്കുക.',
      'തടങ്ങളിൽ കലോപ്പഗോണിയം പോലുള്ള പച്ചിലവളവിളകൾ വളർത്തുക.'
    ],
    chemicalEn: [
      'Root feed with Oxytetracycline hydrochloride (3g in 100ml water) in severe cases.',
      'Apply balanced chemical NPK fertilizers based on soil test results.'
    ],
    chemicalMl: [
      'ഗുരുതരമായ ഘട്ടങ്ങളിൽ ഓക്സിടെട്രാസൈക്ലിൻ ലായനി (100 മില്ലി വെള്ളത്തിൽ 3 ഗ്രാം) വേരുകൾ വഴി നൽകുക.',
      'മണ്ണ് പരിശോധനയുടെ അടിസ്ഥാനത്തിൽ രാസവളങ്ങൾ (NPK) കൃത്യമായ അളവിൽ നൽകുക.'
    ],
    preventionEn: [
      'Plant disease-resistant varieties like Chowghat Orange Dwarf (COD) or Hybrid varieties.',
      'Adopt strict vector management to control lace bugs and plant hoppers.'
    ],
    preventionMl: [
      'ചൗഘാട്ട് ഓറഞ്ച് ഡ്വാർഫ് (COD) അല്ലെങ്കിൽ മറ്റ് സങ്കരയിനം തെങ്ങിൻ തൈകൾ നടുക.',
      'രോഗം പരത്തുന്ന ഓലപ്പേനുകളെയും ചെറുജീവികളെയും നശിപ്പിക്കാൻ ജൈവ കീടനാശിനികൾ തളിക്കുക.'
    ]
  },
  'Magnaporthe oryzae': {
    nameEn: 'Paddy Blast Disease',
    nameMl: 'ബ്ലാസ്റ്റ് രോഗം / കരിങ്കരിച്ചിൽ (നെല്ല്)',
    symptomsEn: [
      'Spindle-shaped spots with reddish-brown margins and gray centers on leaves',
      'Rotten neck symptom where the neck of the panicle rots and breaks',
      'Grayish-green lesions on nodes'
    ],
    symptomsMl: [
      'ഇലകളിൽ കണ്ണ് അല്ലെങ്കിൽ വഞ്ചി ആകൃതിയിലുള്ള തവിട്ടുനിറത്തിലുള്ള പാടുകൾ',
      'കതിരിന്റെ കഴുത്ത് ഭാഗം ചീഞ്ഞ് കതിരുകൾ ഒടിഞ്ഞു തൂങ്ങുന്ന അവസ്ഥ (Rotten neck)',
      'കണുകളിൽ ചാരനിറം കലർന്ന കറുത്ത പാടുകൾ വീഴുക'
    ],
    organicEn: [
      'Spray Pseudomonas fluorescens liquid formulation (10 ml/L) on foliage.',
      'Avoid high nitrogen application; use split doses of organic compost.'
    ],
    organicMl: [
      'സുഡോമോണസ് ലായനി (ഒരു ലിറ്ററിന് 10 മില്ലി) ഇലകളിൽ തളിക്കുക.',
      'നൈട്രജൻ വളങ്ങളുടെ അമിത ഉപയോഗം ഒഴിവാക്കി പച്ചിലവളങ്ങൾ നൽകുക.'
    ],
    chemicalEn: [
      'Spray Tricyclazole 75 WP (0.6 g/L) or Carbendazim 50 WP (1 g/L) at the onset of spots.'
    ],
    chemicalMl: [
      'പാടുകൾ കണ്ട് തുടങ്ങുമ്പോൾ ട്രൈസൈക്ലസോൾ (0.6 ഗ്രാം/ലിറ്റർ) അല്ലെങ്കിൽ കാർബെൻഡാസിം തളിക്കുക.'
    ],
    preventionEn: [
      'Use certified blast-resistant seeds.',
      'Maintain continuous thin sheet of water in fields; avoid dry stress.'
    ],
    preventionMl: [
      'രോഗപ്രതിരോധശേഷിയുള്ള വിത്തുകൾ മാത്രം കൃഷിക്ക് ഉപയോഗിക്കുക.',
      'വയലിൽ ഈർപ്പം നിലനിർത്തുക; കടുത്ത വരൾച്ചയുണ്ടാകാതെ നോക്കുക.'
    ]
  },
  'Xanthomonas oryzae': {
    nameEn: 'Paddy Bacterial Leaf Blight (BLB)',
    nameMl: 'ബാക്ടീരിയൽ ഇല കരിച്ചിൽ (നെല്ല്)',
    symptomsEn: [
      'Wavy yellow streaks starting from the leaf tips moving downwards',
      'Leaves dry up and turn straw-colored',
      'Milky ooze droplets appear on leaf surface in early morning'
    ],
    symptomsMl: [
      'ഇലകളുടെ അരികുകളിൽ നിന്ന് തുടങ്ങി താഴേക്ക് വ്യാപിക്കുന്ന മഞ്ഞക്കരിച്ചിൽ',
      'ഇലകൾ പൂർണ്ണമായും കരിഞ്ഞ് ഉണങ്ങി വൈക്കോൽ നിറമാകുന്നു',
      'അതിരാവിലെ ഇലകളിൽ പാൽനിറത്തിലുള്ള ബാക്ടീരിയൽ ദ്രാവകം കാണപ്പെടുന്നു'
    ],
    organicEn: [
      'Spray cow dung slurry supernatant (20g/L of water) on leaves.',
      'Drain the field water for 2-3 days if disease spreads rapidly.'
    ],
    organicMl: [
      'പച്ചച്ചാണകം കലക്കിയ വെള്ളത്തിന്റെ തെളി (ഒരു ലിറ്ററിന് 20 ഗ്രാം) അരിച്ചെടുത്ത് തളിക്കുക.',
      'രോഗം കഠിനമായാൽ വയലിലെ വെള്ളം 2-3 ദിവസത്തേക്ക് വറ്റിക്കുക.'
    ],
    chemicalEn: [
      'Spray Streptocycline (0.1g) + Copper Oxychloride (2g) per liter of water.'
    ],
    chemicalMl: [
      'സ്ട്രെപ്റ്റോസൈക്ലിൻ (0.1 ഗ്രാം) + കോപ്പർ ഓക്സിക്ലോറൈഡ് (2 ഗ്രാം) ഒരു ലിറ്റർ വെള്ളത്തിൽ എന്ന തോതിൽ തളിക്കുക.'
    ],
    preventionEn: [
      'Avoid high nitrogenous fertilizers.',
      'Maintain clean borders and destroy grass weeds that host the bacteria.'
    ],
    preventionMl: [
      'നൈട്രജൻ അടങ്ങിയ വളങ്ങൾ അമിതമായി നൽകുന്നത് ഒഴിവാക്കുക.',
      'വരമ്പുകളിലെ കളകൾ ചെത്തിമാറ്റി ശുചിയായി സൂക്ഷിക്കുക.'
    ]
  },
  'Phytophthora capsici': {
    nameEn: 'Black Pepper Foot Rot / Quick Wilt',
    nameMl: 'ദ്രുതവാട്ടം (കുരുമുളക്)',
    symptomsEn: [
      'Dark slimy spots appearing on the leaves which fall off rapidly',
      'Blackening and rotting of the stem collar and roots',
      'Sudden foliar yellowing followed by entire vine wilting within days'
    ],
    symptomsMl: [
      'ഇലകളിൽ കറുത്ത നനവുള്ള പാടുകൾ വരികയും അവ വേഗത്തിൽ കൊഴിയുകയും ചെയ്യുക',
      'തണ്ടിന്റെ ചുവടും വേരുകളും ചീഞ്ഞ് കറുപ്പ് നിറമാകുന്നു',
      'ഇലകൾ പെട്ടെന്ന് മഞ്ഞളിക്കുകയും കുറച്ചു ദിവസങ്ങൾക്കുള്ളിൽ വള്ളി വാടിപ്പോവുകയും ചെയ്യുക'
    ],
    organicEn: [
      'Apply Trichoderma harzianum enriched compost at the base of vines.',
      'Drench the root zone with Pseudomonas fluorescens (20g/L).'
    ],
    organicMl: [
      'ട്രൈക്കോഡെർമ സമ്പുഷ്ടമാക്കിയ ജൈവവളം വള്ളിയുടെ ചുവട്ടിൽ ചേർക്കുക.',
      'വേരുപടലങ്ങളിൽ സുഡോമോണസ് ലായനി ഒഴിച്ചു കൊടുക്കുക.'
    ],
    chemicalEn: [
      'Spray 1% Bordeaux mixture on the leaves.',
      'Drench the base of the vine with 0.2% Copper Oxychloride.'
    ],
    chemicalMl: [
      'ഇലകളിൽ 1% വീര്യമുള്ള ബോർഡോ മിശ്രിതം തളിക്കുക.',
      'വള്ളിച്ചുവട്ടിൽ 0.2% വീര്യമുള്ള കോപ്പർ ഓക്സിക്ലോറൈഡ് ഒഴിക്കുക.'
    ],
    preventionEn: [
      'Provide good shade regulation and drainage to prevent damp microclimates.',
      'Avoid root injuries during weeding and intercultivation.'
    ],
    preventionMl: [
      'തോട്ടത്തിൽ അമിത തണൽ ഒഴിവാക്കി കാറ്റും വെളിച്ചവും കിട്ടാൻ ശാഖകൾ കോതുക.',
      'വളമിടുമ്പോഴും കൊത്തുമ്പോഴും വേരുകൾക്ക് മുറിവേൽക്കാതെ ശ്രദ്ധിക്കുക.'
    ]
  },
  'Fusarium oxysporum': {
    nameEn: 'Banana Panama Wilt',
    nameMl: 'പനാമ വാട്ടം (വാഴ)',
    symptomsEn: [
      'Progressive yellowing of lower leaf margins moving inwards',
      'Drooping of leaves at the petiole forming a skirt around pseudostem',
      'Splitting of the pseudostem base near the ground'
    ],
    symptomsMl: [
      'താഴത്തെ ഇലകളുടെ അരികുകളിൽ നിന്ന് തുടങ്ങി മധ്യത്തിലേക്ക് പടരുന്ന മഞ്ഞനിറം',
      'ഇലത്തണ്ടുകൾ ഒടിഞ്ഞ് ഇലകൾ വാഴത്തണ്ടിനോട് ചേർന്ന് തൂങ്ങിക്കിടക്കുക',
      'വാഴയുടെ കാണ്ഡത്തിന്റെ ചുവടുഭാഗം നീളത്തിൽ കീറിപ്പോവുക'
    ],
    organicEn: [
      'Apply neem cake (1kg/plant) in the planting pit.',
      'Drench soil with Trichoderma viride culture.'
    ],
    organicMl: [
      'നടീൽ സമയത്ത് തടത്തിൽ ഒരു കിലോ വീതം വേപ്പിൻപിണ്ണാക്ക് നൽകുക.',
      'മണ്ണിൽ ട്രൈക്കോഡെർമ കൾച്ചർ ഒഴിച്ച് കൊടുക്കുക.'
    ],
    chemicalEn: [
      'Capsule application of Carbendazim (50mg/capsule) at the base of the pseudostem.',
      'Drench soil with Carbendazim 0.2% solution.'
    ],
    chemicalMl: [
      'വാഴച്ചുവട്ടിൽ കാർബെൻഡാസിം ക്യാപ്സ്യൂൾ നിക്ഷേപിക്കുക.',
      'വാഴത്തടങ്ങളിൽ 0.2% കാർബെൻഡാസിം ലായനി ഒഴിച്ച് കൊടുക്കുക.'
    ],
    preventionEn: [
      'Use tissue culture plantlets verified as disease-free.',
      'Avoid moving soil from infected farms.'
    ],
    preventionMl: [
      'രോഗമില്ലാത്ത ടിഷ്യൂകൾച്ചർ തൈകൾ കൃഷിക്കായി തിരഞ്ഞെടുക്കുക.',
      'രോഗബാധിതമായ തോട്ടങ്ങളിൽ നിന്നുള്ള ഉപകരണങ്ങളോ മണ്ണോ മറ്റൊരിടത്തേക്ക് മാറ്റരുത്.'
    ]
  }
};

// Generates fallback structured recommendations dynamically based on pathogen characteristics
function getFallbackRemedies(name: string, commonName: string) {
  const query = `${name} ${commonName}`.toLowerCase();

  // Fungal disease characteristics
  const isFungal = query.includes('phytophthora') || query.includes('fusarium') || 
                    query.includes('rust') || query.includes('mildew') || 
                    query.includes('blast') || query.includes('colletotrichum') || 
                    query.includes('alternaria') || query.includes('rot') ||
                    query.includes('fungal') || query.includes('cercospora');
  
  // Viral disease characteristics
  const isViral = query.includes('virus') || query.includes('mosaic') || query.includes('viroid');

  // Bacterial disease characteristics
  const isBacterial = query.includes('bacteria') || query.includes('xanthomonas') || 
                      query.includes('blight') || query.includes('ralstonia');

  if (isFungal) {
    return {
      nameEn: commonName || 'Fungal Plant Infection',
      nameMl: commonName ? `ഫംഗസ് രോഗം (${commonName})` : 'ഫംഗസ് ബാധ',
      symptomsEn: ['Spotted patches on leaves', 'Fungal mold or powdery spores observed', 'Leaf margins drying prematurely'],
      symptomsMl: ['ഇലകളിൽ കരിഞ്ഞ അല്ലെങ്കിൽ ചാരനിറത്തിലുള്ള പാടുകൾ', 'പൂപ്പൽ പോലെയുള്ള പറ്റിപ്പിടിക്കൽ', 'ഇലകളുടെ വശങ്ങൾ കരിഞ്ഞുണങ്ങുന്നു'],
      organicEn: ['Spray Neem Oil emulsion (20ml/L of water).', 'Apply Pseudomonas fluorescens (20g/L) root drenching.'],
      organicMl: ['വേപ്പെണ്ണ വെളുത്തുള്ളി കാന്താരി മിശ്രിതം തളിക്കുക.', 'സുഡോമോണസ് ലായനി (ലിറ്ററിന് 20 ഗ്രാം) തടത്തിൽ ഒഴിക്കുക.'],
      chemicalEn: ['Spray Carbendazim 50% WP (1g/L) or Copper Oxychloride (2g/L) if infection is severe.'],
      chemicalMl: ['രോഗം ശക്തമാണെങ്കിൽ കാർബെൻഡാസിം (1ഗ്രാം/ലിറ്റർ) അല്ലെങ്കിൽ കോപ്പർ ഓക്സിക്ലോറൈഡ് (2ഗ്രാം/ലിറ്റർ) തളിക്കുക.'],
      preventionEn: ['Prune excess branches to improve sun penetration.', 'Avoid overhead sprinkler watering during late evening.'],
      preventionMl: ['അടിയിലെ ഇലകൾ വെട്ടിമാറ്റി വായുസഞ്ചാരവും വെളിച്ചവും ഉറപ്പാക്കുക.', 'വൈകുന്നേരങ്ങളിൽ ചെടികൾക്ക് മുകളിൽ നിന്നുള്ള നന ഒഴിവാക്കുക.']
    };
  }

  if (isViral) {
    return {
      nameEn: commonName || 'Viral Plant Infection',
      nameMl: commonName ? `വൈറസ് ബാധ (${commonName})` : 'വൈറസ് രോഗബാധ',
      symptomsEn: ['Mosaic pattern on leaves', 'Stunted plant growth and deformed leaves', 'Mottling and curling of leaf tips'],
      symptomsMl: ['ഇലകളിൽ പച്ചയും മഞ്ഞയും കലർന്ന മൊസൈക്ക് പാറ്റേൺ', 'ചെടിയുടെ വളർച്ച മുരടിക്കലും ഇലകളുടെ വലിപ്പം കുറയലും', 'ഇലകൾ ചുരുണ്ട് കൂടുന്ന അവസ്ഥ'],
      organicEn: ['Uproot and burn infected plants immediately to prevent spread.', 'Control insect vectors using organic neem-soap spray.'],
      organicMl: ['രോഗം ബാധിച്ച ചെടി പൂർണ്ണമായും പിഴുതുമാറ്റി കത്തിച്ച് നശിപ്പിക്കുക.', 'കീടങ്ങളെ നശിപ്പിക്കാൻ വേപ്പെണ്ണ സോപ്പ് ലായനി തളിക്കുക.'],
      chemicalEn: ['No direct chemical remedy exists for plant viruses. Control insect vectors (whiteflies/aphids) using Imidacloprid (0.5ml/L).'],
      chemicalMl: ['വൈറസ് രോഗങ്ങൾക്ക് രാസപ്രതിവിധിയില്ല. രോഗം പരത്തുന്ന വെളുത്ത ഈച്ചകളെയും കീടങ്ങളെയും നിയന്ത്രിക്കാൻ കീടനാശിനി തളിക്കുക.'],
      preventionEn: ['Use certified disease-free seeds or planting suckers.', 'Use yellow sticky traps to capture vector flies.'],
      preventionMl: ['ഗുണനിലവാരമുള്ള തൈകൾ മാത്രം നടാനായി ഉപയോഗിക്കുക.', 'തോട്ടങ്ങളിൽ മഞ്ഞക്കെണികൾ സ്ഥാപിക്കുക.']
    };
  }

  if (isBacterial) {
    return {
      nameEn: commonName || 'Bacterial Plant Infection',
      nameMl: commonName ? `ബാക്ടീരിയൽ രോഗം (${commonName})` : 'ബാക്ടീരിയൽ രോഗബാധ',
      symptomsEn: ['Water-soaked spots on stems or leaves', 'Leaf margins showing wilt or drying streaks', 'Stem rotting with bacterial ooze'],
      symptomsMl: ['ഇലകളിലോ തണ്ടിലോ നനവുള്ള പാടുകൾ വരിക', 'ഇലകൾ ഉണങ്ങി കരിഞ്ഞുപോകുന്ന അവസ്ഥ', 'ബാക്ടീരിയൽ ദ്രാവകം കണ്ട് തുടങ്ങുക'],
      organicEn: ['Spray fresh cow dung slurry supernatant (20g/L).', 'Drench with Pseudomonas fluorescens bio-agent.'],
      organicMl: ['പച്ചച്ചാണകം കലക്കിയ വെള്ളത്തിന്റെ തെളി അരിച്ചെടുത്ത് സ്പ്രേ ചെയ്യുക.', 'സുഡോമോണസ് ലായനി ഒഴിച്ചു കൊടുക്കുക.'],
      chemicalEn: ['Spray Streptomycin sulphate (0.1g) + Copper Oxychloride (2g) per liter of water.'],
      chemicalMl: ['സ്ട്രെപ്റ്റോസൈക്ലിൻ (0.1 ഗ്രാം) + കോപ്പർ ഓക്സിക്ലോറൈഡ് (2 ഗ്രാം) ഒരു ലിറ്റർ വെള്ളത്തിൽ എന്ന തോതിൽ തളിക്കുക.'],
      preventionEn: ['Avoid wounding plants during weeding.', 'Sanitize farming tools after working on affected areas.'],
      preventionMl: ['കളകൾ നീക്കം ചെയ്യുമ്പോൾ തണ്ടുകൾക്ക് പോറലേൽക്കാതെ നോക്കുക.', 'ഉപയോഗിക്കുന്ന ആയുധങ്ങൾ അണുവിമുക്തമാക്കുക.']
    };
  }

  // Generic plant disease fallback
  return {
    nameEn: commonName || name || 'Plant Pathology',
    nameMl: commonName ? `${commonName}` : 'സസ്യ രോഗബാധ',
    symptomsEn: ['Abnormal discoloration or spots observed on foliage', 'Premature defoliation or leaf wilt'],
    symptomsMl: ['ഇലകളിൽ അസ്വാഭാവികമായ നിറംമാറ്റമോ പാടുകളോ കാണപ്പെടുന്നു', 'ഇലകൾ കൊഴിയുക അല്ലെങ്കിൽ വാടിപ്പോകുക'],
    organicEn: ['Apply organic neem cake in soil.', 'Spray organic multi-insect/fungal repellent mixtures.'],
    organicMl: ['മണ്ണിൽ വേപ്പിൻപിണ്ണാക്ക് നൽകുക.', 'ജൈവ കീട-രോഗനാശിനികൾ തളിച്ചു കൊടുക്കുക.'],
    chemicalEn: ['Apply broad-spectrum systemic fungicide like Carbendazim if necessary.'],
    chemicalMl: ['രോഗം ഗുരുതരമാണെങ്കിൽ ഒരു കാർഷിക വിദഗ്ദ്ധന്റെ ഉപദേശപ്രകാരം ഫംഗസ് നാശിനി തളിക്കുക.'],
    preventionEn: ['Maintain balanced crop nutrition.', 'Remove and destroy dry diseased crop debris.'],
    preventionMl: ['വിളകൾക്ക് കൃത്യമായ പോഷകങ്ങൾ നൽകുക.', 'രോഗം ബാധിച്ച ഇലകളും അവശിഷ്ടങ്ങളും കൃഷിയിടത്തിൽ നിന്നും മാറ്റി നശിപ്പിക്കുക.']
  };
}

export default function DiseaseDoctor() {
  const { t, language } = useLanguage();
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [dragOver, setDragOver] = useState(false);

  // Pl@ntNet API Results
  const [identifiedDisease, setIdentifiedDisease] = useState<DiseaseInfo | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [alternativeMatches, setAlternativeMatches] = useState<{ name: string; score: number }[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Helper to convert base64 data URL to File object with explicit MIME type
  const base64ToFile = (base64Str: string): File => {
    const parts = base64Str.split(';base64,');
    const mimeType = parts[0].split(':')[1] || 'image/jpeg';
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }
    const ext = mimeType.split('/')[1] || 'jpeg';
    return new File([uInt8Array], `crop_image.${ext}`, { type: mimeType });
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError(language === 'ml' ? 'ദയവായി ഒരു ചിത്രം തിരഞ്ഞെടുക്കുക.' : 'Please select an image file.');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImage(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const triggerCamera = () => {
    cameraInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setImage(null);
    setIdentifiedDisease(null);
    setConfidence(0);
    setAlternativeMatches([]);
    setError('');
  };

  // Calling Pl@ntNet API directly
  const handleAnalyze = async () => {
    if (!image) {
      setError(t.diseaseDoctor.selectFileError);
      return;
    }

    setLoading(true);
    setError('');
    setIdentifiedDisease(null);
    setAlternativeMatches([]);

    try {
      // Convert base64 to a proper File object with explicit MIME type
      const imageFile = base64ToFile(image);
      const formData = new FormData();
      formData.append('images', imageFile, imageFile.name);
      formData.append('organs', 'auto'); // use auto to support any plant part

      const PLANTNET_API_KEY = import.meta.env.VITE_PLANTNET_API_KEY as string;
      // Use unified /api/plantnet proxy path which works in Dev (Vite proxy) and Prod (Vercel Edge function)
      const apiBase = '/api/plantnet';
      const response = await fetch(
        `${apiBase}/v2/diseases/identify?api-key=${PLANTNET_API_KEY}&lang=en&nb-results=5&no-reject=true`,
        {
          method: 'POST',
          body: formData
        }
      );

      const json = await response.json();
      console.log('[PlantNet Disease API]', response.status, JSON.stringify(json).slice(0, 500));

      if (!response.ok) {
        // Handle specific error codes
        if (response.status === 404) {
          throw new Error(
            language === 'ml'
              ? 'ചിത്രത്തിൽ ഒരു സസ്യ രോഗവും കണ്ടെത്തിയില്ല. ദയവായി ഇലകൾ, തണ്ട്, അല്ലെങ്കിൽ രോഗബാധിത ഭാഗങ്ങൾ വ്യക്തമായി കാണിക്കുന്ന ഒരു ഫോട്ടോ ഉപയോഗിക്കുക.'
              : 'No plant disease detected in this image. Please upload a clear, well-lit photo of diseased leaves, stem, or fruit.'
          );
        }
        throw new Error(
          language === 'ml'
            ? `PlantNet API പിഴവ്: ${json.message || 'അജ്ഞാത പിഴവ്'}`
            : `PlantNet API error: ${json.message || 'Unknown error'}`
        );
      }

      if (!json.results || json.results.length === 0) {
        throw new Error(
          language === 'ml'
            ? 'ഈ ചിത്രത്തിൽ തിരിച്ചറിയാൻ കഴിയുന്ന സസ്യ രോഗ ലക്ഷണങ്ങൾ ഒന്നും ഇല്ല.'
            : 'No identifiable plant disease patterns found in this image.'
        );
      }

      // Process best match - PlantNet disease API response schema
      const bestMatch = json.results[0];
      
      // The disease API returns a different schema than species API
      // Disease results have: species.scientificName OR species.scientificNameWithoutAuthor
      // and species.commonNames array
      const scientificName = (
        bestMatch.species?.scientificNameWithoutAuthor ||
        bestMatch.species?.scientificName ||
        bestMatch.disease?.scientificName ||
        bestMatch.name ||
        'Unknown'
      );
      const commonNames: string[] = (
        bestMatch.species?.commonNames ||
        bestMatch.disease?.commonNames ||
        []
      );
      const primaryCommonName = commonNames[0] || scientificName;
      const score = Math.round((bestMatch.score || 0) * 100);

      setConfidence(score);

      // Extract alternatives
      const alternatives = json.results.slice(1, 4).map((r: any) => ({
        name: (
          r.species?.commonNames?.[0] ||
          r.disease?.commonNames?.[0] ||
          r.species?.scientificNameWithoutAuthor ||
          r.name ||
          'Unknown'
        ),
        score: Math.round((r.score || 0) * 100)
      }));
      setAlternativeMatches(alternatives);

      // Match with local knowledge base (try both name and common name)
      let matchedInfo = DISEASE_DATABASE[scientificName];
      if (!matchedInfo) {
        const databaseKeys = Object.keys(DISEASE_DATABASE);
        const fuzzyKey = databaseKeys.find(key =>
          key.toLowerCase().includes(scientificName.toLowerCase()) ||
          scientificName.toLowerCase().includes(key.toLowerCase()) ||
          commonNames.some(cn => key.toLowerCase().includes(cn.toLowerCase()))
        );
        matchedInfo = fuzzyKey
          ? DISEASE_DATABASE[fuzzyKey]
          : getFallbackRemedies(scientificName, primaryCommonName);
      }

      setIdentifiedDisease(matchedInfo);
    } catch (err: any) {
      setError(err?.message || t.diseaseDoctor.apiError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '12px 0 36px' }}>
      <div className="section-header">
        <div>
          <h1 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FlaskConical size={24} style={{ color: 'var(--copper-500)' }} />
            {t.diseaseDoctor.title}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', marginTop: '4px' }}>
            {language === 'ml' ? 'Pl@ntNet എഞ്ചിൻ ഉപയോഗിച്ചുള്ള രോഗനിർണ്ണയം' : 'Pl@ntNet Engine Powered Crop Diagnostics'}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginTop: '24px' }}>
        
        {/* Left Side: Upload & Action Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
              {t.diseaseDoctor.description}
            </p>

            {/* Hidden Input Targets */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <input
              type="file"
              ref={cameraInputRef}
              onChange={handleFileChange}
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
            />

            {!image ? (
              /* Dropzone empty state */
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={triggerUpload}
                style={{
                  border: `2px dashed ${dragOver ? 'var(--copper-500)' : 'rgba(184,115,51,0.25)'}`,
                  background: dragOver ? 'rgba(184,115,51,0.04)' : '#F8F5EF',
                  borderRadius: '16px',
                  padding: '48px 24px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <div style={{
                  width: '56px', height: '56px', borderRadius: '50%',
                  background: 'rgba(184,115,51,0.08)', color: 'var(--copper-500)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Upload size={24} />
                </div>
                <div>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {t.diseaseDoctor.uploadZone}
                  </span>
                </div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Supports PNG, JPG, JPEG
                </span>
              </div>
            ) : (
              /* Image preview state */
              <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(184,115,51,0.2)' }}>
                <img
                  src={image}
                  alt={t.diseaseDoctor.preview}
                  style={{ width: '100%', height: '280px', objectFit: 'cover', display: 'block' }}
                />
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
                  padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <span style={{ color: '#fff', fontSize: '13px', fontWeight: 500 }}>
                    {t.diseaseDoctor.preview}
                  </span>
                  <button
                    className="btn btn-ghost"
                    onClick={handleRemoveImage}
                    style={{
                      background: 'rgba(220,53,69,0.9)', color: '#fff', border: 'none',
                      padding: '8px 12px', borderRadius: '8px', fontSize: '12.5px',
                      display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgb(220,53,69)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(220,53,69,0.9)'}
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              </div>
            )}

            {/* Selection Options & Diagnostics Buttons */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              {!image ? (
                <>
                  <button
                    className="btn btn-secondary"
                    onClick={triggerCamera}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <Camera size={18} /> {t.diseaseDoctor.takePhoto}
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={triggerUpload}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <Upload size={18} /> {t.diseaseDoctor.uploadImage}
                  </button>
                </>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={handleAnalyze}
                  disabled={loading}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    padding: '14px 20px', fontSize: '15px'
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                      {t.diseaseDoctor.analyzing}
                    </>
                  ) : (
                    <>
                      {t.diseaseDoctor.analyze} <ArrowRight size={18} />
                    </>
                  )}
                </button>
              )}
            </div>

            {error && (
              <div style={{
                marginTop: '16px', padding: '12px 16px', background: 'rgba(220,53,69,0.06)',
                border: '1px solid rgba(220,53,69,0.2)', borderRadius: '10px', color: 'rgb(220,53,69)',
                fontSize: '13.5px', display: 'flex', gap: '8px', alignItems: 'center'
              }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Diagnosis Result Panel */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card" style={{
            flex: 1, padding: '28px', minHeight: '340px', display: 'flex',
            flexDirection: 'column', justifyContent: identifiedDisease ? 'flex-start' : 'center',
            alignItems: identifiedDisease ? 'stretch' : 'center', textAlign: identifiedDisease ? 'left' : 'center'
          }}>
            {loading ? (
              /* Loading State */
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <Loader2 size={44} style={{ color: 'var(--copper-500)', animation: 'spin 1.2s linear infinite' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {t.diseaseDoctor.analyzing}
                </h3>
                <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', maxWidth: '280px', margin: '0 auto', lineHeight: 1.5 }}>
                  {language === 'ml' 
                    ? 'Pl@ntNet എഞ്ചിൻ രോഗകാരികളെയും ഇലകളിലെ പാറ്റേണുകളെയും വിലയിരുത്തുന്നു. കാത്തിരിക്കുക...'
                    : 'Pl@ntNet API is classifying leaf textures, chlorosis, and lesions. Please wait...'}
                </p>
              </div>
            ) : identifiedDisease ? (
              /* Success Result State */
              <div>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  borderBottom: '1px solid rgba(184,115,51,0.15)', paddingBottom: '12px', marginBottom: '20px'
                }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-serif)', color: 'var(--forest-900)' }}>
                    🎯 {t.diseaseDoctor.results}
                  </h3>
                  <button
                    className="btn btn-ghost"
                    onClick={handleRemoveImage}
                    style={{ fontSize: '12.5px', padding: '6px 12px', color: 'var(--copper-500)' }}
                  >
                    {t.diseaseDoctor.startOver}
                  </button>
                </div>

                <div style={{ overflowY: 'auto', maxHeight: '500px', paddingRight: '8px' }}>
                  {/* Primary Disease Identified */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
                    <div>
                      <h4 style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}>
                        {language === 'ml' ? identifiedDisease.nameMl : identifiedDisease.nameEn}
                      </h4>
                      <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px', fontStyle: 'italic' }}>
                        Pathogen: {Object.keys(DISEASE_DATABASE).find(key => DISEASE_DATABASE[key] === identifiedDisease) || 'Identified Specimen'}
                      </p>
                    </div>
                    <div style={{
                      background: 'rgba(184,115,51,0.08)', border: '1px solid rgba(184,115,51,0.2)',
                      padding: '6px 12px', borderRadius: '12px', textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '11px', color: 'var(--copper-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Confidence
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--copper-600)', fontFamily: 'var(--font-serif)', marginTop: '2px' }}>
                        {confidence}%
                      </div>
                    </div>
                  </div>

                  {/* Symptoms */}
                  <div style={{ marginBottom: '20px' }}>
                    <h5 style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--forest-900)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      🔍 {t.diseaseDoctor.symptoms}
                    </h5>
                    <ul style={{ paddingLeft: '20px', listStyleType: 'disc' }}>
                      {(language === 'ml' ? identifiedDisease.symptomsMl : identifiedDisease.symptomsEn).map((sym, i) => (
                        <li key={i} style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '6px' }}>
                          {sym}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Organic remedies */}
                  <div style={{ marginBottom: '20px', background: 'rgba(213,232,213,0.2)', border: '1px solid rgba(213,232,213,0.5)', padding: '16px', borderRadius: '12px' }}>
                    <h5 style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--agri-green-700)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      🌿 {t.diseaseDoctor.organic}
                    </h5>
                    <ul style={{ paddingLeft: '20px', listStyleType: 'disc' }}>
                      {(language === 'ml' ? identifiedDisease.organicMl : identifiedDisease.organicEn).map((rem, i) => (
                        <li key={i} style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '6px' }}>
                          {rem}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Chemical remedies */}
                  <div style={{ marginBottom: '20px', background: 'rgba(184,115,51,0.04)', border: '1px solid rgba(184,115,51,0.1)', padding: '16px', borderRadius: '12px' }}>
                    <h5 style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--copper-500)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      🧪 {t.diseaseDoctor.chemical}
                    </h5>
                    <ul style={{ paddingLeft: '20px', listStyleType: 'disc' }}>
                      {(language === 'ml' ? identifiedDisease.chemicalMl : identifiedDisease.chemicalEn).map((rem, i) => (
                        <li key={i} style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '6px' }}>
                          {rem}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Prevention */}
                  <div style={{ marginBottom: '20px' }}>
                    <h5 style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      🛡️ {t.diseaseDoctor.prevention}
                    </h5>
                    <ul style={{ paddingLeft: '20px', listStyleType: 'disc' }}>
                      {(language === 'ml' ? identifiedDisease.preventionMl : identifiedDisease.preventionEn).map((prev, i) => (
                        <li key={i} style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '6px' }}>
                          {prev}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Alternatives */}
                  {alternativeMatches.length > 0 && (
                    <div style={{ borderTop: '1px dashed rgba(0,0,0,0.1)', paddingTop: '16px', marginTop: '16px' }}>
                      <h5 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {language === 'ml' ? 'മറ്റു അനുമാനങ്ങൾ' : 'Alternative Possibilities'}
                      </h5>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {alternativeMatches.map((alt, i) => (
                          <div key={i} style={{ background: '#F8F5EF', border: '1px solid rgba(0,0,0,0.05)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                            {alt.name} ({alt.score}%)
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            ) : (
              /* Empty Initial State */
              <div style={{ maxWidth: '300px', margin: '0 auto' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔬</div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  {language === 'ml' ? 'ഫോട്ടോകൾക്കായി കാത്തിരിക്കുന്നു' : 'Awaiting Crop Photo'}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {language === 'ml'
                    ? 'വലതുവശത്തുനിന്നും ഒരു ഇലയുടെയോ ചെടിയുടെയോ ചിത്രം തിരഞ്ഞെടുത്ത് രോഗനിർണ്ണയം നടത്തുക.'
                    : 'Upload a picture of the leaves or stem of the affected plant to start diagnosis.'}
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

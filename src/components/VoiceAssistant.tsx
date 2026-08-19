import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, X, Loader2, Volume2 } from 'lucide-react';

// Define the global interfaces for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

type LanguageCode = 'en-US' | 'ml-IN' | 'hi-IN';

interface LanguageOption {
  code: LanguageCode;
  label: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'en-US', label: 'English' },
  { code: 'ml-IN', label: 'മലയാളം' },
  { code: 'hi-IN', label: 'हिंदी' },
];

export default function VoiceAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeLang, setActiveLang] = useState<LanguageCode>('en-US');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Ensure voices are loaded (Chrome sometimes needs a nudge)
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const current = event.resultIndex;
        const result = event.results[current][0].transcript;
        setTranscript(result);
        setIsListening(false);
        handleSendToGemini(result, recognitionRef.current.lang); // Use current lang
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        setTranscript('Could not hear you. Please try again.');
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      console.warn("Speech Recognition API not supported in this browser.");
    }
    
    return () => {
      if (recognitionRef.current) {
         recognitionRef.current.stop();
      }
      window.speechSynthesis.cancel();
      audioRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = activeLang;
    }
  }, [activeLang]);

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsSpeaking(false);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      stopSpeaking(); // stop any ongoing speech before listening
      setTranscript('');
      setResponse('');
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error("Failed to start listening:", e);
      }
    }
  };

  const handleSendToGemini = async (text: string, lang: LanguageCode) => {
    if (!text.trim()) return;
    
    setIsProcessing(true);
    
    const langName = LANGUAGES.find(l => l.code === lang)?.label || 'English';
    const systemInstruction = `You are Krishimithran, a friendly and helpful agricultural assistant. You MUST respond ONLY in ${langName}. Keep answers brief, practical and conversational. No markdown formatting.`;

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error("Gemini API key is missing");

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          system_instruction: {
            parts: { text: systemInstruction }
          },
          contents: [{
            parts: [{ text }]
          }]
        })
      });

      if (!res.ok) {
         throw new Error(`API returned ${res.status}`);
      }

      const data = await res.json();
      const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not understand.';
      setResponse(replyText);
      speakResponse(replyText, lang);
    } catch (error) {
      console.error('Error fetching from Gemini:', error);
      setResponse('An error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ─── Dual-engine TTS ───────────────────────────────────────────────
  // 1st try: Web Speech API (works if OS has voice installed)
  // 2nd try: Google Translate TTS via <audio> element (works everywhere, no CORS)
  const speakResponse = (text: string, lang: LanguageCode) => {
    stopSpeaking();

    // Map our LanguageCode to Google Translate lang codes
    const gtLangMap: Record<LanguageCode, string> = {
      'en-US': 'en',
      'ml-IN': 'ml',
      'hi-IN': 'hi',
    };
    const gtLang = gtLangMap[lang];

    // Helper: play via Google Translate TTS audio element
    const playViaGoogleTTS = () => {
      // Google Translate TTS supports up to ~200 chars per request
      // Split long text into chunks
      const chunks: string[] = [];
      const words = text.split(' ');
      let current = '';
      for (const word of words) {
        if ((current + ' ' + word).trim().length > 180) {
          if (current) chunks.push(current.trim());
          current = word;
        } else {
          current = (current + ' ' + word).trim();
        }
      }
      if (current) chunks.push(current.trim());

      let chunkIndex = 0;
      const playChunk = () => {
        if (chunkIndex >= chunks.length) {
          setIsSpeaking(false);
          return;
        }
        const chunk = chunks[chunkIndex++];
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=${gtLang}&client=tw-ob`;
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = playChunk;
        audio.onerror = () => {
          console.warn('Google TTS audio error for chunk:', chunk);
          setIsSpeaking(false);
        };
        setIsSpeaking(true);
        audio.play().catch(err => {
          console.error('Audio play failed:', err);
          setIsSpeaking(false);
        });
      };
      playChunk();
    };

    // Try Web Speech API first — check if a matching voice exists
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice =
      voices.find(v => v.lang === lang) ||
      voices.find(v => v.lang.startsWith(lang.split('-')[0])) ||
      voices.find(v => v.lang.toLowerCase().startsWith(gtLang));

    if (matchedVoice) {
      // Web Speech API path (Android, iOS, Windows with voice pack installed)
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.voice = matchedVoice;
      utterance.rate = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => {
        console.warn('Web Speech failed, falling back to Google TTS');
        setIsSpeaking(false);
        playViaGoogleTTS();
      };
      window.speechSynthesis.speak(utterance);

      // Chrome bug: speechSynthesis can stall — detect and fallback
      setTimeout(() => {
        if (window.speechSynthesis.speaking && !window.speechSynthesis.pending) {
          // Still fine, do nothing
        }
      }, 500);
    } else {
      // No matching OS voice — use Google Translate TTS directly
      console.info(`No ${lang} voice found on this device. Using Google Translate TTS.`);
      playViaGoogleTTS();
    }
  };

  const closeAssistant = () => {
    setIsOpen(false);
    stopSpeaking();
    if (isListening) recognitionRef.current?.stop();
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            drag
            dragConstraints={{
              top: typeof window !== 'undefined' ? -window.innerHeight + 100 : -800,
              left: typeof window !== 'undefined' ? -window.innerWidth + 100 : -800,
              right: 0,
              bottom: 0
            }}
            dragElastic={0.1}
            dragMomentum={false}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            style={{
              position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
              padding: '16px', borderRadius: '50%', background: 'linear-gradient(to right, #10b981, #16a34a)',
              color: 'white', border: 'none', cursor: 'pointer',
              boxShadow: '0 20px 25px -5px rgba(34, 197, 94, 0.3), 0 8px 10px -6px rgba(34, 197, 94, 0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            aria-label="Open Voice Assistant"
          >
            <Mic size={28} />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 10000, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)',
            padding: '24px'
          }}>
            <motion.div
              initial={{ y: 50, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 50, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              style={{
                position: 'relative', width: '100%', maxWidth: '380px',
                backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(16px)',
                borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                border: '1px solid rgba(255, 255, 255, 0.5)'
              }}
            >
              <div style={{ height: '8px', width: '100%', background: 'linear-gradient(to right, #4ade80, #10b981, #14b8a6)' }} />
              
              <button 
                onClick={closeAssistant}
                style={{
                  position: 'absolute', top: '16px', right: '16px', padding: '8px',
                  background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer',
                  borderRadius: '50%', zIndex: 10
                }}
              >
                <X size={20} />
              </button>

              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                
                <div style={{ position: 'relative', marginBottom: '24px' }}>
                  <div style={{
                    width: '96px', height: '96px', background: 'linear-gradient(to bottom right, #dcfce7, #d1fae5)',
                    borderRadius: '50%', border: '4px solid white', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', overflow: 'hidden'
                  }}>
                    👨‍🌾
                  </div>
                  <div style={{
                    position: 'absolute', bottom: '-8px', left: '50%', transform: 'translateX(-50%)',
                    backgroundColor: 'white', padding: '4px 12px', borderRadius: '9999px',
                    fontSize: '12px', fontWeight: 'bold', color: '#15803d', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                    border: '1px solid #dcfce7', whiteSpace: 'nowrap'
                  }}>
                    Krishimithran
                  </div>
                </div>

                <div style={{
                  display: 'flex', backgroundColor: 'rgba(243, 244, 246, 0.8)', padding: '4px',
                  borderRadius: '9999px', marginBottom: '32px', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
                  width: '100%', justifyContent: 'space-between', backdropFilter: 'blur(4px)'
                }}>
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setActiveLang(lang.code)}
                      style={{
                        flex: 1, padding: '8px 12px', borderRadius: '9999px', fontSize: '14px', fontWeight: 500,
                        border: 'none', cursor: 'pointer', transition: 'all 0.3s',
                        backgroundColor: activeLang === lang.code ? 'white' : 'transparent',
                        color: activeLang === lang.code ? '#15803d' : '#6b7280',
                        boxShadow: activeLang === lang.code ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' : 'none',
                      }}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>

                <div style={{ minHeight: '80px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                  {isListening ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#16a34a', gap: '12px' }}>
                      <p style={{ fontSize: '14px', fontWeight: 500 }}>Listening...</p>
                    </div>
                  ) : isProcessing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#6b7280', gap: '8px' }}>
                      <Loader2 className="animate-spin" style={{ color: '#22c55e' }} size={24} />
                      <p style={{ fontSize: '14px' }}>Thinking...</p>
                    </div>
                  ) : response ? (
                    <div style={{ width: '100%', textAlign: 'left' }}>
                      <div style={{ backgroundColor: '#f9fafb', borderRadius: '16px', padding: '16px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: '1px solid #f3f4f6', position: 'relative' }}>
                         {isSpeaking ? (
                           <motion.div
                             animate={{ opacity: [0.4, 1, 0.4], scale: [0.95, 1.1, 0.95] }}
                             transition={{ repeat: Infinity, duration: 1.5 }}
                             style={{ position: 'absolute', top: '12px', right: '12px' }}
                           >
                             <Volume2 size={16} style={{ color: '#10b981' }} />
                           </motion.div>
                         ) : (
                           <Volume2 size={16} style={{ position: 'absolute', top: '12px', right: '12px', color: '#9ca3af' }} />
                         )}
                         <p style={{ fontSize: '12px', color: '#4b5563', marginBottom: '4px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Krishimithran</p>
                         <p style={{ color: '#1f2937', fontSize: '14px', lineHeight: 1.5, paddingRight: '24px' }}>{response}</p>
                      </div>
                    </div>
                  ) : transcript ? (
                    <div style={{ width: '100%', textAlign: 'left' }}>
                       <p style={{ fontSize: '14px', color: '#6b7280', fontStyle: 'italic' }}>"{transcript}"</p>
                    </div>
                  ) : (
                    <p style={{ color: '#9ca3af', fontSize: '14px' }}>How can I help with your farm today?</p>
                  )}
                </div>

                <button
                  onClick={toggleListening}
                  disabled={isProcessing}
                  style={{
                    width: '100%', padding: '16px', borderRadius: '16px', fontSize: '18px', fontWeight: 600,
                    border: isListening ? '1px solid #fee2e2' : 'none', cursor: isProcessing ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.3s',
                    backgroundColor: isListening ? '#fef2f2' : '#10b981',
                    color: isListening ? '#dc2626' : 'white',
                    boxShadow: isListening ? 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)' : '0 20px 25px -5px rgba(16, 185, 129, 0.2), 0 10px 10px -5px rgba(16, 185, 129, 0.1)',
                    opacity: isProcessing ? 0.5 : 1
                  }}
                >
                  <Mic size={22} />
                  {isListening ? 'Stop Listening' : 'Tap to Speak'}
                </button>
                
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

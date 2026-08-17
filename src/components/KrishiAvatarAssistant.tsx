import React, { useState, useEffect, useRef, useCallback } from 'react';

/* ─────────────────────────────────────────────────────────────────────────────
   KrishiAvatarAssistant  –  v3.0  (Production-Ready)
   ─ Bulletproof Malayalam TTS / STT with intelligent voice fallback
   ─ Draggable FAB with boundary collision and tap-vs-drag disambiguation
   ─ 7-second silence timeout + full STT error recovery
   ─ Gemini response sanitization for clean voice output
   ─ Subtitle overlay fallback when no native voice engine is available
   ─ Fully isolated: zero shared CSS, zero layout mutations
   ───────────────────────────────────────────────────────────────────────────── */

// ─────────────────────────────────────────────────────────────────────────────
// STYLES  –  injected once into <head> as a scoped <style> tag
// ─────────────────────────────────────────────────────────────────────────────
const STYLE_ID = 'krishi-avatar-v3-styles';

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Malayalam:wght@400;600&display=swap');

    @keyframes ka-glow {
      0%   { box-shadow: 0 0 0 0 rgba(34,197,94,.75), 0 8px 32px rgba(0,0,0,.3); }
      70%  { box-shadow: 0 0 0 20px rgba(34,197,94,0), 0 8px 32px rgba(0,0,0,.3); }
      100% { box-shadow: 0 0 0 0  rgba(34,197,94,0), 0 8px 32px rgba(0,0,0,.3); }
    }
    @keyframes ka-float {
      0%,100% { transform: translateY(0); }
      50%      { transform: translateY(-5px); }
    }
    @keyframes ka-ripple {
      0%   { transform: scale(1);   opacity: .75; }
      100% { transform: scale(2.1); opacity: 0; }
    }
    @keyframes ka-nod {
      0%,100% { transform: rotate(0deg); }
      30%      { transform: rotate(4deg); }
      70%      { transform: rotate(-4deg); }
    }
    @keyframes ka-slide-up {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes ka-listening-ring {
      0%   { box-shadow: 0 0 0 0 rgba(239,68,68,.55); }
      70%  { box-shadow: 0 0 0 16px rgba(239,68,68,0); }
      100% { box-shadow: 0 0 0 0  rgba(239,68,68,0); }
    }
    @keyframes ka-bounce-idle {
      0%,100% { transform: scale(1); }
      50%      { transform: scale(1.07); }
    }
    @keyframes ka-pulse-dot {
      0%,100% { opacity: 1; }
      50%      { opacity: .2; }
    }

    /* ── Panel ── */
    .ka-panel {
      font-family: 'Noto Sans Malayalam', 'Manjari', system-ui, sans-serif;
      position: fixed;
      bottom: 100px;
      right: 20px;
      z-index: 2147483640;
      width: min(300px, calc(100vw - 40px));
      background: rgba(255,255,255,.97);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border: 1.5px solid rgba(34,197,94,.22);
      border-radius: 22px;
      padding: 28px 18px 20px;
      box-shadow: 0 16px 56px rgba(0,0,0,.18), 0 4px 16px rgba(22,163,74,.12);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      opacity: 0;
      transform: scale(.93) translateY(12px);
      pointer-events: none;
      transition: opacity .28s ease, transform .28s ease;
      will-change: opacity, transform;
    }
    .ka-panel.ka-open {
      opacity: 1;
      transform: scale(1) translateY(0);
      pointer-events: auto;
    }
    .ka-close {
      position: absolute;
      top: 10px; right: 10px;
      width: 28px; height: 28px;
      border-radius: 50%;
      border: none; background: none;
      font-size: 15px; cursor: pointer;
      color: #888;
      display: flex; align-items: center; justify-content: center;
      transition: background .18s, color .18s;
    }
    .ka-close:hover { background: rgba(0,0,0,.06); color: #333; }

    /* ── FAB ── */
    .ka-fab {
      position: fixed;
      z-index: 2147483641;
      width: 58px; height: 58px;
      border-radius: 50%;
      border: none; outline: none;
      background: linear-gradient(135deg, #16a34a, #15803d);
      box-shadow: 0 4px 18px rgba(22,163,74,.5);
      cursor: grab;
      display: flex; align-items: center; justify-content: center;
      transition: box-shadow .22s, opacity .25s, transform .25s;
      touch-action: none;
      user-select: none;
      -webkit-user-select: none;
    }
    .ka-fab:active { cursor: grabbing; }
    .ka-fab.ka-fab-hidden {
      opacity: 0;
      transform: scale(.45);
      pointer-events: none;
    }
    .ka-fab:not(.ka-fab-hidden):hover {
      box-shadow: 0 6px 24px rgba(22,163,74,.65);
    }

    /* ── Avatar ── */
    .ka-avatar-wrap {
      position: relative;
      cursor: pointer;
      user-select: none;
      -webkit-user-select: none;
    }
    .ka-avatar-circle {
      width: 86px; height: 86px;
      border-radius: 50%;
      background: linear-gradient(145deg, #16a34a, #166534);
      display: flex; align-items: center; justify-content: center;
      position: relative; overflow: visible;
      transition: transform .2s;
    }
    .ka-avatar-circle:hover { transform: scale(1.04); }
    .ka-avatar-circle.ka-idle   { animation: ka-float 3.6s ease-in-out infinite; box-shadow: 0 8px 28px rgba(0,0,0,.28); }
    .ka-avatar-circle.ka-busy   { animation: ka-glow 1.15s ease-in-out infinite; }
    .ka-svg-head.ka-speaking    { animation: ka-nod .72s ease-in-out infinite; transform-origin: center 18px; }
    .ka-ripple {
      position: absolute;
      inset: -10px;
      border-radius: 50%;
      border: 2px solid rgba(239,68,68,.55);
      animation: ka-ripple 1.1s ease-out infinite;
    }
    .ka-ripple-2 { animation-delay: .55s; }
    .ka-badge {
      position: absolute;
      top: -3px; right: -3px;
      width: 18px; height: 18px;
      background: #f59e0b;
      border: 2px solid #fff;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 9px;
    }
    .ka-status-lbl {
      position: absolute;
      bottom: -24px;
      font-size: 10px; font-weight: 600;
      color: rgba(255,255,255,.88);
      background: rgba(0,0,0,.3);
      border-radius: 8px;
      padding: 1px 8px;
      white-space: nowrap;
      letter-spacing: .3px;
    }

    /* ── Transcript / subtitle bubble ── */
    .ka-bubble {
      background: #f0fdf4;
      border: 1px solid rgba(34,197,94,.3);
      border-radius: 14px;
      padding: 10px 13px;
      font-size: 12.5px;
      width: 100%;
      color: #14532d;
      line-height: 1.6;
      animation: ka-slide-up .28s ease forwards;
    }
    .ka-bubble strong {
      display: block;
      color: #15803d;
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: .35px;
      margin-bottom: 3px;
      text-transform: uppercase;
    }

    /* ── Subtitle fallback box ── */
    .ka-subtitle {
      background: linear-gradient(135deg, rgba(22,163,74,.07), rgba(22,163,74,.03));
      border: 1px solid rgba(34,197,94,.25);
      border-radius: 14px;
      padding: 12px 14px;
      font-size: 13px;
      width: 100%;
      color: #1a3a1a;
      line-height: 1.7;
      animation: ka-slide-up .28s ease forwards;
      font-family: 'Noto Sans Malayalam', system-ui, sans-serif;
    }
    .ka-subtitle strong {
      display: block;
      color: #16a34a;
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: .3px;
      margin-bottom: 4px;
      text-transform: uppercase;
    }
    .ka-text-mode-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: rgba(22,163,74,.08);
      color: #15803d;
      font-size: 10px;
      font-weight: 700;
      border-radius: 20px;
      padding: 4px 10px;
      margin-bottom: 6px;
      letter-spacing: .2px;
      border: 1px solid rgba(22,163,74,.15);
    }

    /* ── Language buttons ── */
    .ka-lang-row {
      display: flex;
      gap: 7px;
      flex-wrap: wrap;
      justify-content: center;
      width: 100%;
    }
    .ka-lang-btn {
      padding: 9px 14px;
      min-height: 40px;
      border-radius: 12px;
      border: 1.5px solid rgba(34,197,94,.3);
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      background: rgba(255,255,255,.95);
      color: #14532d;
      box-shadow: 0 2px 8px rgba(0,0,0,.08);
      transition: all .2s;
      font-family: inherit;
    }
    .ka-lang-btn.ka-active {
      background: #16a34a;
      border-color: #16a34a;
      color: #fff;
      box-shadow: 0 3px 12px rgba(22,163,74,.35);
    }
    .ka-lang-btn:hover:not(.ka-active) {
      background: #f0fdf4;
      border-color: rgba(34,197,94,.6);
    }

    /* ── Mic button ── */
    .ka-mic-btn {
      display: flex; align-items: center; justify-content: center;
      gap: 7px;
      padding: 11px 22px;
      min-height: 44px;
      border-radius: 24px;
      border: none; outline: none;
      font-size: 13px; font-weight: 700;
      cursor: pointer;
      font-family: inherit;
      letter-spacing: .2px;
      transition: all .22s;
      white-space: nowrap;
      width: 100%;
    }
    .ka-mic-btn.ka-idle-btn {
      background: linear-gradient(135deg, #16a34a, #15803d);
      color: #fff;
      box-shadow: 0 4px 16px rgba(22,163,74,.42);
      animation: ka-bounce-idle 2.8s ease-in-out infinite;
    }
    .ka-mic-btn.ka-idle-btn:hover {
      background: linear-gradient(135deg, #15803d, #14532d);
      box-shadow: 0 6px 22px rgba(22,163,74,.56);
    }
    .ka-mic-btn.ka-listening-btn {
      background: linear-gradient(135deg, #dc2626, #b91c1c);
      color: #fff;
      animation: ka-listening-ring 1s ease-out infinite;
    }
    .ka-mic-btn:disabled {
      opacity: .55;
      cursor: not-allowed;
      animation: none;
    }

    /* ── Thinking dots ── */
    .ka-dots span {
      display: inline-block;
      width: 6px; height: 6px;
      border-radius: 50%;
      background: #16a34a;
      margin: 0 2px;
      animation: ka-pulse-dot .9s ease-in-out infinite;
    }
    .ka-dots span:nth-child(2) { animation-delay: .2s; }
    .ka-dots span:nth-child(3) { animation-delay: .4s; }

    /* ── Error toast inside panel ── */
    .ka-error {
      width: 100%;
      background: rgba(220,38,38,.06);
      border: 1px solid rgba(220,38,38,.22);
      border-radius: 10px;
      padding: 8px 12px;
      font-size: 12px;
      color: #b91c1c;
      display: flex; align-items: center; gap: 6px;
      animation: ka-slide-up .25s ease;
    }

    /* ── Responsive ── */
    @media (max-width: 1023px) {
      .ka-panel   { bottom: 88px; right: 14px; }
      .ka-avatar-circle { width: 72px; height: 72px; }
      .ka-mic-btn { font-size: 12px; padding: 10px 16px; }
    }
    @media (max-width: 480px) {
      .ka-panel   { bottom: 82px; right: 10px; width: min(290px, calc(100vw - 20px)); }
      .ka-avatar-circle { width: 64px; height: 64px; }
      .ka-bubble, .ka-subtitle { font-size: 12px; }
    }
  `;
  document.head.appendChild(el);
}

// ─────────────────────────────────────────────────────────────────────────────
// AVATAR SVG
// ─────────────────────────────────────────────────────────────────────────────
const AvatarSVG: React.FC<{ speaking: boolean }> = ({ speaking }) => (
  <svg
    className={`ka-svg-head${speaking ? ' ka-speaking' : ''}`}
    width="60" height="60" viewBox="0 0 34 34"
    fill="none" xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="14" y="23" width="6" height="4" rx="1.5" fill="#f5c49a" />
    <ellipse cx="17" cy="31" rx="9" ry="5" fill="#fff" opacity=".22" />
    <ellipse cx="17" cy="14" rx="9" ry="10" fill="#f5c49a" />
    <ellipse cx="17" cy="5.5" rx="10.5" ry="2.2" fill="#92400e" />
    <rect x="11" y="2" width="12" height="5" rx="2" fill="#b45309" />
    <rect x="11" y="5.5" width="12" height="1.2" fill="#78350f" />
    <ellipse cx="13" cy="14" rx="1.4" ry="1.6" fill="#1a1a2e" />
    <ellipse cx="21" cy="14" rx="1.4" ry="1.6" fill="#1a1a2e" />
    <circle cx="13.6" cy="13.3" r=".45" fill="white" />
    <circle cx="21.6" cy="13.3" r=".45" fill="white" />
    <path d="M11.5 12 Q13 11.2 14.5 12" stroke="#78350f" strokeWidth=".8" strokeLinecap="round" fill="none" />
    <path d="M19.5 12 Q21 11.2 22.5 12" stroke="#78350f" strokeWidth=".8" strokeLinecap="round" fill="none" />
    <ellipse cx="17" cy="17" rx="1" ry=".7" fill="#e8a87c" />
    <ellipse
      cx="17" cy="20"
      rx="3.5" ry={speaking ? 2.3 : 1}
      fill={speaking ? '#c2704f' : 'none'}
      stroke="#c2704f" strokeWidth="1"
    />
    {speaking && <ellipse cx="17" cy="19.5" rx="2.4" ry=".85" fill="white" opacity=".82" />}
    <ellipse cx="10.5" cy="17" rx="2" ry="1.2" fill="#f4a261" opacity=".33" />
    <ellipse cx="23.5" cy="17" rx="2" ry="1.2" fill="#f4a261" opacity=".33" />
    <ellipse cx="8"  cy="14.5" rx="1.2" ry="1.8" fill="#f5c49a" />
    <ellipse cx="26" cy="14.5" rx="1.2" ry="1.8" fill="#f5c49a" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const FAB_SIZE = 58;     // px — matches .ka-fab width/height
const DRAG_THRESHOLD = 5; // px — movement below this = tap, above = drag

const KrishiAvatarAssistant: React.FC = () => {

  // ── UI State ──────────────────────────────────────────────────────────────
  const [isOpen,     setIsOpen]     = useState(false);
  const [transcript, setTranscript] = useState('');         // what user said
  const [aiReply,    setAiReply]    = useState('');         // cleaned AI reply
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking,  setIsSpeaking]  = useState(false);
  const [isThinking,  setIsThinking]  = useState(false);
  const [errorMsg,    setErrorMsg]    = useState('');
  const [selectedLang, setSelectedLang] = useState<'ml-IN'|'en-IN'|'hi-IN'>('ml-IN');
  const [hasNativeVoice, setHasNativeVoice] = useState(true); // subtitle fallback flag

  // ── TTS voices list ───────────────────────────────────────────────────────
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // ── Drag State ────────────────────────────────────────────────────────────
  const [fabPos, setFabPos] = useState({
    x: window.innerWidth  - FAB_SIZE - 20,
    y: window.innerHeight - FAB_SIZE - 20,
  });
  const dragState = useRef({
    dragging: false,
    startX: 0, startY: 0,
    originX: 0, originY: 0,
    moved: false,
  });

  // ── Refs ──────────────────────────────────────────────────────────────────
  const silenceTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoCollapseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recognitionRef = useRef<any>(null);
  const fallbackAudioRef = useRef<HTMLAudioElement | null>(null);

  const stopAudio = useCallback(() => {
    window.speechSynthesis.cancel();
    if (fallbackAudioRef.current) {
      fallbackAudioRef.current.pause();
      fallbackAudioRef.current.currentTime = 0;
    }
    setIsSpeaking(false);
    clearTimeout(autoCollapseTimer.current!);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // INIT: styles + voice loading
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    injectStyles();

    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) setVoices(v);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    // Keep FAB on-screen on window resize
    const onResize = () => {
      setFabPos(prev => ({
        x: Math.min(prev.x, window.innerWidth  - FAB_SIZE - 10),
        y: Math.min(prev.y, window.innerHeight - FAB_SIZE - 10),
      }));
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      window.removeEventListener('resize', onResize);
      clearTimeout(silenceTimer.current!);
      clearTimeout(autoCollapseTimer.current!);
    };
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // VOICE SELECTION — best-match per locale
  // ─────────────────────────────────────────────────────────────────────────
  const selectBestVoice = useCallback((lang: string): SpeechSynthesisVoice | null => {
    if (voices.length === 0) return null;

    if (lang === 'ml-IN') {
      return (
        voices.find(v => v.lang === 'ml-IN') ||
        voices.find(v => v.lang.startsWith('ml')) ||
        voices.find(v => v.name.toLowerCase().includes('malayalam')) ||
        null
      );
    }
    if (lang === 'hi-IN') {
      return (
        voices.find(v => v.lang === 'hi-IN') ||
        voices.find(v => v.lang.startsWith('hi')) ||
        voices.find(v => v.name.toLowerCase().includes('hindi')) ||
        null
      );
    }
    // en-IN
    return (
      voices.find(v => v.lang === 'en-IN') ||
      voices.find(v => v.lang.startsWith('en')) ||
      null
    );
  }, [voices]);

  // ─────────────────────────────────────────────────────────────────────────
  // SANITIZE GEMINI RESPONSE for speech output
  // ─────────────────────────────────────────────────────────────────────────
  const sanitizeForSpeech = (text: string): string => {
    return text
      // Remove markdown bold/italic/headers/code
      .replace(/[*#_~`]/g, '')
      // Remove URLs
      .replace(/https?:\/\/\S+/g, '')
      // Remove markdown links [text](url)
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove list markers
      .replace(/^\s*[-•>+]\s/gm, '')
      // Remove emoji unicode ranges
      .replace(/[\u{1F300}-\u{1FFFF}]/gu, '')
      .replace(/[\u{2600}-\u{27BF}]/gu, '')
      // Remove special symbols: | = { } [ ] ( ) \ /
      .replace(/[|={}[\]()\\/]/g, '')
      // Collapse multiple spaces/newlines
      .replace(/\s{2,}/g, ' ')
      .trim();
  };

  // ─────────────────────────────────────────────────────────────────────────
  // TTS — speak with voice priority, subtitle fallback, auto-collapse
  // ─────────────────────────────────────────────────────────────────────────
  const speak = useCallback((text: string, lang: string) => {
    const synth = window.speechSynthesis;
    // Queue reset — clears any hung stream (Chrome bug)
    synth.cancel();
    if (fallbackAudioRef.current) {
      fallbackAudioRef.current.pause();
      fallbackAudioRef.current.currentTime = 0;
    }

    const voice = selectBestVoice(lang);
    if (voice) {
      setHasNativeVoice(true);
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang  = lang;
      utterance.rate  = 0.88;   // natural regional inflection
      utterance.pitch = 1.0;
      utterance.voice = voice;

      utterance.onstart = () => setIsSpeaking(true);

      utterance.onend = () => {
        setIsSpeaking(false);
        // Auto-collapse panel 3 s after speech finishes
        clearTimeout(autoCollapseTimer.current!);
        autoCollapseTimer.current = setTimeout(() => setIsOpen(false), 3000);
      };

      utterance.onerror = (e) => {
        // Synthesis errors are non-fatal — subtitle is already showing
        console.warn('[KrishiAI] TTS error:', e.error);
        setIsSpeaking(false);
      };

      synth.speak(utterance);
    } else {
      // No native voice engine found — Cloud TTS Fallback + Subtitle mode
      setHasNativeVoice(false);
      
      const langPrefix = lang.split('-')[0]; // extracts 'ml' from 'ml-IN'
      // Google Translate free TTS endpoint
      const audioUrl = "https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=" + langPrefix + "&q=" + encodeURIComponent(text);
      
      const fallbackAudio = new Audio(audioUrl);
      fallbackAudioRef.current = fallbackAudio;
      
      fallbackAudio.onplay = () => setIsSpeaking(true);
      
      fallbackAudio.onended = () => {
        setIsSpeaking(false);
        clearTimeout(autoCollapseTimer.current!);
        autoCollapseTimer.current = setTimeout(() => setIsOpen(false), 3000);
      };
      
      fallbackAudio.onerror = () => {
        console.warn('[KrishiAI] Cloud TTS fallback error');
        setIsSpeaking(false);
      };
      
      fallbackAudio.play().catch(err => {
        console.warn('[KrishiAI] Audio play blocked:', err);
        setIsSpeaking(false);
      });
    }
  }, [selectBestVoice]);

  // ─────────────────────────────────────────────────────────────────────────
  // GEMINI API CALL
  // ─────────────────────────────────────────────────────────────────────────
  const processCommand = useCallback(async (command: string) => {
    setIsThinking(true);
    setErrorMsg('');

    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    const endpoint =
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

    const systemPrompt =
      `You are Krishimithram, a helpful voice assistant for farmers in Kerala. ` +
      `Answer in 1 to 2 short sentences using clear, plain text only. ` +
      `Do NOT use markdown formatting, lists, asterisks, or emojis. ` +
      `Language locale: ${selectedLang}. Question: ${command}`;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: systemPrompt }] }] }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const raw  = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      const clean = sanitizeForSpeech(raw);

      setAiReply(clean);
      speak(clean, selectedLang);

    } catch (err) {
      console.error('[KrishiAI] Gemini error:', err);
      stopAudio();
      setErrorMsg('Could not connect. Please check your internet and try again.');
    } finally {
      setIsThinking(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLang, speak]);

  // ─────────────────────────────────────────────────────────────────────────
  // STT — Speech-to-Text with silence timeout + full error recovery
  // ─────────────────────────────────────────────────────────────────────────
  const stopListening = useCallback(() => {
    clearTimeout(silenceTimer.current!);
    try { recognitionRef.current?.stop(); } catch { /* already stopped */ }
    setIsListening(false);
  }, []);

  const startListening = useCallback(() => {
    if (isListening || isThinking || isSpeaking) return;

    // Cancel any ongoing speech before listening
    stopAudio();
    setErrorMsg('');
    setAiReply('');
    setTranscript('');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let Rec: any;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Rec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!Rec) throw new Error('not supported');
    } catch {
      setErrorMsg('Speech recognition is not supported by your browser. Please use Chrome.');
      return;
    }

    try {
      const rec = new Rec();
      recognitionRef.current = rec;

      rec.lang = selectedLang;
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.continuous = false;

      rec.onstart = () => {
        setIsListening(true);

        // 7-second silence auto-stop
        clearTimeout(silenceTimer.current!);
        silenceTimer.current = setTimeout(() => {
          rec.stop();
          setIsListening(false);
          setErrorMsg('No speech detected. Please try speaking again. 🎤');
        }, 7000);
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rec.onresult = (event: any) => {
        clearTimeout(silenceTimer.current!);
        const text = event.results[0][0].transcript;
        setTranscript(text);
        processCommand(text);
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rec.onerror = (event: any) => {
        clearTimeout(silenceTimer.current!);
        setIsListening(false);

        const friendlyErrors: Record<string, string> = {
          'no-speech':       'No speech detected. Please try again. 🎤',
          'audio-capture':   'Microphone not found. Please connect a microphone.',
          'not-allowed':     'Microphone permission denied. Please allow mic access in browser settings.',
          'network':         'Network error during speech recognition. Check your connection.',
          'aborted':         '', // silent — user or timeout triggered it
        };
        const msg = friendlyErrors[event.error] ?? `Speech error: ${event.error}`;
        if (msg) setErrorMsg(msg);
      };

      rec.onend = () => {
        clearTimeout(silenceTimer.current!);
        setIsListening(false);
      };

      rec.start();

    } catch (err) {
      console.error('[KrishiAI] STT init error:', err);
      setIsListening(false);
      setErrorMsg('Could not start the microphone. Please try again.');
    }
  }, [isListening, isThinking, isSpeaking, selectedLang, processCommand]);

  // ─────────────────────────────────────────────────────────────────────────
  // DRAGGABLE FAB
  // ─────────────────────────────────────────────────────────────────────────
  const clampX = (x: number) => Math.max(10, Math.min(window.innerWidth  - FAB_SIZE - 10, x));
  const clampY = (y: number) => Math.max(10, Math.min(window.innerHeight - FAB_SIZE - 10, y));

  const onDragMove = useCallback((clientX: number, clientY: number) => {
    const ds = dragState.current;
    const dx = clientX - ds.startX;
    const dy = clientY - ds.startY;

    if (!ds.moved && (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD)) {
      ds.moved = true;
    }
    if (ds.moved) {
      setFabPos({ x: clampX(ds.originX + dx), y: clampY(ds.originY + dy) });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDragEnd = useCallback(() => {
    dragState.current.dragging = false;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup',   handleMouseUp);
    window.removeEventListener('touchmove', handleTouchMove);
    window.removeEventListener('touchend',  handleTouchEnd);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Non-reactive references to stable handlers (avoid stale closures)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleMouseMove = useCallback((e: MouseEvent)       => onDragMove(e.clientX, e.clientY), [onDragMove]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleTouchMove = useCallback((e: TouchEvent)       => { if (dragState.current.moved) e.preventDefault(); onDragMove(e.touches[0].clientX, e.touches[0].clientY); }, [onDragMove]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleMouseUp   = useCallback(()                    => onDragEnd(), [onDragEnd]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleTouchEnd  = useCallback(()                    => onDragEnd(), [onDragEnd]);

  const onDragStart = useCallback((clientX: number, clientY: number) => {
    dragState.current = {
      dragging: true,
      startX: clientX, startY: clientY,
      originX: fabPos.x, originY: fabPos.y,
      moved: false,
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup',   handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend',  handleTouchEnd);
  }, [fabPos.x, fabPos.y, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // Tap to toggle panel (only if not a drag)
  const handleFabClick = useCallback(() => {
    if (!dragState.current.moved) {
      clearTimeout(autoCollapseTimer.current!);
      setIsOpen(prev => !prev);
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // AVATAR click — stop or start
  // ─────────────────────────────────────────────────────────────────────────
  const handleAvatarClick = useCallback(() => {
    if (isSpeaking) {
      stopAudio();
    } else if (isListening) {
      stopListening();
    } else if (!isThinking) {
      startListening();
    }
  }, [isSpeaking, isListening, isThinking, startListening, stopListening, stopAudio]);

  // ─────────────────────────────────────────────────────────────────────────
  // Derived values for display
  // ─────────────────────────────────────────────────────────────────────────
  const statusLabel = isThinking ? 'Thinking...'
    : isSpeaking   ? 'Speaking...'
    : isListening  ? 'Listening...'
    : 'Krishimithram';

  const micLabel = isListening ? 'Listening...'
    : isThinking  ? 'Thinking...'
    : 'Tap to Speak';

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Expanded Panel ──────────────────────────────────────────────── */}
      <div className={`ka-panel${isOpen ? ' ka-open' : ''}`} role="dialog" aria-label="Krishimithram Voice Assistant">

        <button className="ka-close" onClick={() => { setIsOpen(false); stopListening(); stopAudio(); }} aria-label="Close assistant">✕</button>

        {/* Transcript bubble — what the user said */}
        {transcript && (
          <div className="ka-bubble">
            <strong>🎤 You said</strong>
            {transcript}
          </div>
        )}

        {/* Thinking dots */}
        {isThinking && (
          <div className="ka-dots" aria-live="polite" aria-label="Processing">
            <span /><span /><span />
          </div>
        )}

        {/* AI response — subtitle fallback box */}
        {aiReply && !isThinking && (
          <div className="ka-subtitle">
            {!hasNativeVoice && (
              <div className="ka-text-mode-badge">
                📝 Text Mode Active
              </div>
            )}
            <strong>🌾 Krishimithram</strong>
            {aiReply}
          </div>
        )}

        {/* Error display */}
        {errorMsg && (
          <div className="ka-error" role="alert">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Avatar */}
        <div
          className="ka-avatar-wrap"
          onClick={handleAvatarClick}
          role="button"
          tabIndex={0}
          aria-label={isSpeaking ? 'Speaking — click to stop' : isListening ? 'Listening — click to stop' : 'Click to start speaking'}
          onKeyDown={e => e.key === 'Enter' && handleAvatarClick()}
        >
          {isListening && (
            <>
              <div className="ka-ripple" />
              <div className="ka-ripple ka-ripple-2" />
            </>
          )}
          <div className={`ka-avatar-circle${(isSpeaking || isThinking) ? ' ka-busy' : ' ka-idle'}`}>
            <AvatarSVG speaking={isSpeaking} />
            {isSpeaking  && <div className="ka-badge">🔊</div>}
            {isThinking && !isSpeaking && <div className="ka-badge">⏳</div>}
          </div>
          <span className="ka-status-lbl">{statusLabel}</span>
        </div>

        {/* Language selector */}
        <div className="ka-lang-row" role="group" aria-label="Select language">
          {([
            { code: 'en-IN' as const, label: 'English' },
            { code: 'ml-IN' as const, label: 'മലയാളം' },
            { code: 'hi-IN' as const, label: 'हिंदी' },
          ]).map(({ code, label }) => (
            <button
              key={code}
              className={`ka-lang-btn${selectedLang === code ? ' ka-active' : ''}`}
              onClick={() => { setSelectedLang(code); setErrorMsg(''); setAiReply(''); }}
              aria-pressed={selectedLang === code}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Mic button */}
        <button
          className={`ka-mic-btn${isListening ? ' ka-listening-btn' : ' ka-idle-btn'}`}
          onClick={startListening}
          disabled={isSpeaking || isThinking}
          aria-label={isListening ? 'Listening in progress' : 'Start voice input'}
        >
          <span style={{ fontSize: '17px' }}>{isListening ? '🎙️' : '🎤'}</span>
          {micLabel}
        </button>

      </div>

      {/* ── Floating Action Button ───────────────────────────────────────── */}
      <button
        className={`ka-fab${isOpen ? ' ka-fab-hidden' : ''}`}
        style={{ left: fabPos.x, top: fabPos.y, bottom: 'auto', right: 'auto' }}
        onClick={handleFabClick}
        onMouseDown={e  => { e.preventDefault(); onDragStart(e.clientX, e.clientY); }}
        onTouchStart={e => onDragStart(e.touches[0].clientX, e.touches[0].clientY)}
        aria-label="Open Krishimithram Voice Assistant"
        aria-expanded={isOpen}
      >
        <span style={{ fontSize: '26px', lineHeight: 1 }}>🎙️</span>
      </button>
    </>
  );
};

export default KrishiAvatarAssistant;

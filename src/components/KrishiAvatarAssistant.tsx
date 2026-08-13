import React, { useState, useEffect } from 'react';

/* ─────────────────────────────────────────────────────────────────────────────
   KrishiAvatarAssistant
   A floating Malayalam voice-assistant overlay.
   ─ Strictly isolated: no shared CSS classes, no layout mutations.
   ─ All styles live inside this file (inline or injected <style> tag).
   ───────────────────────────────────────────────────────────────────────────── */

// ── Inject keyframe animations once into the document head ──────────────────
const STYLE_ID = 'krishi-avatar-styles';

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Malayalam:wght@400;600&display=swap');

    /* Outer glow pulse when speaking */
    @keyframes krishi-glow-pulse {
      0%   { box-shadow: 0 0 0 0 rgba(34,197,94,0.7), 0 8px 32px rgba(0,0,0,0.35); }
      70%  { box-shadow: 0 0 0 18px rgba(34,197,94,0), 0 8px 32px rgba(0,0,0,0.35); }
      100% { box-shadow: 0 0 0 0 rgba(34,197,94,0), 0 8px 32px rgba(0,0,0,0.35); }
    }

    /* Avatar idle gentle float */
    @keyframes krishi-float {
      0%, 100% { transform: translateY(0px); }
      50%       { transform: translateY(-6px); }
    }

    /* Listening ring ripple */
    @keyframes krishi-ripple {
      0%   { transform: scale(1);   opacity: 0.8; }
      100% { transform: scale(1.9); opacity: 0;   }
    }

    /* Head nod while speaking */
    @keyframes krishi-nod {
      0%, 100% { transform: rotate(0deg);   }
      25%       { transform: rotate(3deg);   }
      75%       { transform: rotate(-3deg);  }
    }

    /* Transcript fade-in slide */
    @keyframes krishi-slide-up {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* Button press ripple */
    @keyframes krishi-btn-ripple {
      0%   { box-shadow: 0 0 0 0 rgba(239,68,68,0.5); }
      70%  { box-shadow: 0 0 0 14px rgba(239,68,68,0); }
      100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
    }

    /* Bounce for talk button */
    @keyframes krishi-bounce {
      0%, 100% { transform: scale(1); }
      50%       { transform: scale(1.06); }
    }

    /* Mouth open/close while speaking */
    @keyframes krishi-mouth-open {
      0%, 100% { ry: 1px; }
      50%       { ry: 3px; }
    }

    .krishi-container {
      font-family: 'Noto Sans Malayalam', 'Manjari', sans-serif;
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      pointer-events: none;
    }

    .krishi-transcript {
      background: rgba(255,255,255,0.97);
      border: 1px solid rgba(34,197,94,0.25);
      border-radius: 16px;
      padding: 10px 14px;
      font-size: 12px;
      max-width: 220px;
      color: #1a2e1a;
      line-height: 1.6;
      box-shadow: 0 4px 20px rgba(0,0,0,0.12);
      animation: krishi-slide-up 0.3s ease forwards;
      pointer-events: auto;
    }

    .krishi-transcript strong {
      color: #15803d;
      display: block;
      margin-bottom: 2px;
      font-size: 11px;
      letter-spacing: 0.3px;
    }

    .krishi-avatar-wrapper {
      position: relative;
      pointer-events: auto;
      cursor: pointer;
      user-select: none;
    }

    .krishi-ripple {
      position: absolute;
      inset: -8px;
      border-radius: 50%;
      border: 2px solid rgba(239,68,68,0.6);
      animation: krishi-ripple 1.1s ease-out infinite;
    }

    .krishi-ripple-2 {
      animation-delay: 0.55s;
    }

    .krishi-avatar-bg {
      width: 88px;
      height: 88px;
      border-radius: 50%;
      background: linear-gradient(145deg, #16a34a, #166534);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: visible;
      transition: transform 0.2s ease;
    }

    .krishi-avatar-bg:hover {
      transform: scale(1.05);
    }

    .krishi-avatar-bg.speaking {
      animation: krishi-glow-pulse 1.2s ease-in-out infinite;
    }

    .krishi-avatar-bg.idle {
      animation: krishi-float 4s ease-in-out infinite;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    }

    .krishi-svg-head.speaking {
      animation: krishi-nod 0.7s ease-in-out infinite;
      transform-origin: center 18px;
    }

    .krishi-mouth-ellipse.speaking {
      animation: krishi-mouth-open 0.35s ease-in-out infinite alternate;
    }

    .krishi-label {
      font-size: 10px;
      font-weight: 600;
      color: rgba(255,255,255,0.85);
      letter-spacing: 0.5px;
      margin-top: 2px;
      text-align: center;
      background: rgba(0,0,0,0.3);
      border-radius: 8px;
      padding: 1px 7px;
      position: absolute;
      bottom: -22px;
      white-space: nowrap;
    }

    .krishi-mic-btn {
      pointer-events: auto;
      border: none;
      outline: none;
      padding: 10px 18px;
      border-radius: 24px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: background 0.25s, transform 0.15s, box-shadow 0.25s;
      font-family: 'Noto Sans Malayalam', 'Manjari', sans-serif;
      letter-spacing: 0.2px;
      white-space: nowrap;
    }

    .krishi-mic-btn.idle {
      background: linear-gradient(135deg, #16a34a, #15803d);
      color: #fff;
      box-shadow: 0 4px 14px rgba(22,163,74,0.45);
      animation: krishi-bounce 2.5s ease-in-out infinite;
    }

    .krishi-mic-btn.idle:hover {
      background: linear-gradient(135deg, #15803d, #14532d);
      transform: scale(1.04);
      box-shadow: 0 6px 20px rgba(22,163,74,0.55);
    }

    .krishi-mic-btn.listening {
      background: linear-gradient(135deg, #dc2626, #b91c1c);
      color: #fff;
      animation: krishi-btn-ripple 1s ease-out infinite;
    }

    .krishi-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      width: 18px;
      height: 18px;
      background: #f59e0b;
      border-radius: 50%;
      border: 2px solid #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 9px;
    }

    /* ── Mobile: reposition above bottom nav, scale down ── */
    @media (max-width: 1023px) {
      .krishi-container {
        bottom: 90px;
        right: 16px;
      }

      .krishi-avatar-bg {
        width: 72px;
        height: 72px;
      }

      .krishi-mic-btn {
        font-size: 12px;
        padding: 9px 14px;
      }

      .krishi-transcript {
        max-width: 180px;
        font-size: 11px;
      }
    }

    @media (max-width: 480px) {
      .krishi-container {
        bottom: 84px;
        right: 12px;
        gap: 7px;
      }

      .krishi-avatar-bg {
        width: 64px;
        height: 64px;
      }

      .krishi-transcript {
        max-width: 160px;
      }
    }
  `;
  document.head.appendChild(style);
}

// ── SVG Avatar: a clean illustrated farmer face ───────────────────────────
interface AvatarSVGProps {
  speaking: boolean;
}

const AvatarSVG: React.FC<AvatarSVGProps> = ({ speaking }) => (
  <svg
    className={`krishi-svg-head ${speaking ? 'speaking' : ''}`}
    width="62"
    height="62"
    viewBox="0 0 34 34"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Neck */}
    <rect x="14" y="23" width="6" height="4" rx="1.5" fill="#f5c49a" />

    {/* Shirt / body hint */}
    <ellipse cx="17" cy="31" rx="9" ry="5" fill="#ffffff" opacity="0.25" />

    {/* Head */}
    <ellipse cx="17" cy="14" rx="9" ry="10" fill="#f5c49a" />

    {/* Farmer hat brim */}
    <ellipse cx="17" cy="5.5" rx="10.5" ry="2.2" fill="#92400e" />
    {/* Hat top */}
    <rect x="11" y="2" width="12" height="5" rx="2" fill="#b45309" />
    {/* Hat band */}
    <rect x="11" y="5.5" width="12" height="1.2" fill="#78350f" />

    {/* Eyes */}
    <ellipse cx="13" cy="14" rx="1.4" ry="1.6" fill="#1a1a2e" />
    <ellipse cx="21" cy="14" rx="1.4" ry="1.6" fill="#1a1a2e" />
    {/* Eye shine */}
    <circle cx="13.6" cy="13.3" r="0.45" fill="white" />
    <circle cx="21.6" cy="13.3" r="0.45" fill="white" />

    {/* Eyebrows */}
    <path d="M11.5 12 Q13 11.2 14.5 12" stroke="#78350f" strokeWidth="0.8" strokeLinecap="round" fill="none" />
    <path d="M19.5 12 Q21 11.2 22.5 12" stroke="#78350f" strokeWidth="0.8" strokeLinecap="round" fill="none" />

    {/* Nose */}
    <ellipse cx="17" cy="17" rx="1" ry="0.7" fill="#e8a87c" />

    {/* Mouth - speaking open state toggled via cx/ry */}
    <ellipse
      className={`krishi-mouth-ellipse ${speaking ? 'speaking' : ''}`}
      cx="17"
      cy="20"
      rx="3.5"
      ry={speaking ? 2.2 : 1}
      fill={speaking ? '#c2704f' : 'none'}
      stroke="#c2704f"
      strokeWidth="1"
    />
    {/* Teeth hint when speaking */}
    {speaking && (
      <ellipse cx="17" cy="19.5" rx="2.5" ry="0.9" fill="white" opacity="0.85" />
    )}

    {/* Cheeks */}
    <ellipse cx="10.5" cy="17" rx="2" ry="1.2" fill="#f4a261" opacity="0.35" />
    <ellipse cx="23.5" cy="17" rx="2" ry="1.2" fill="#f4a261" opacity="0.35" />

    {/* Ears */}
    <ellipse cx="8" cy="14.5" rx="1.2" ry="1.8" fill="#f5c49a" />
    <ellipse cx="26" cy="14.5" rx="1.2" ry="1.8" fill="#f5c49a" />
  </svg>
);

// ── Main Component ────────────────────────────────────────────────────────────
const KrishiAvatarAssistant: React.FC = () => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    injectStyles();
  }, []);

  // 3. Speak back in Malayalam
  const speak = (replyText: string) => {
    const synth = window.speechSynthesis;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(replyText);
    utterance.lang = 'ml-IN';
    utterance.rate = 0.95;
    utterance.pitch = 1.05;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synth.speak(utterance);
  };

  // 2. Process Malayalam commands
  const processCommand = (command: string) => {
    const text = command.toLowerCase();

    if (text.includes('കാലാവസ്ഥ') || text.includes('മഴ')) {
      speak('ഇന്ന് നല്ല കാലാവസ്ഥയാണ്. കൃഷിക്ക് അനുയോജ്യമാണ്.');
    } else if (text.includes('വില') || text.includes('മാർക്കറ്റ്')) {
      speak('ഇന്നത്തെ വിപണി വില വിവരങ്ങൾ പരിശോധിക്കുക. ടൊമാറ്റോ ഒരു കിലോ ഇരുപത് രൂപ.');
    } else if (text.includes('വളം') || text.includes('കൃഷി')) {
      speak('കൃഷിമിത്രം ആപ്പ് ഉപയോഗിച്ച് ഏറ്റവും നല്ല കൃഷി ഉപദേശം നേടൂ.');
    } else if (text.includes('രോഗം') || text.includes('ചെടി')) {
      speak('ചെടിയുടെ ഫോട്ടോ എടുത്ത് ഡിസീസ് ഡോക്ടർ ഫീച്ചർ ഉപയോഗിക്കൂ.');
    } else if (text.includes('സ്കീം') || text.includes('സർക്കാർ')) {
      speak('പ്രധാൻ മന്ത്രി കൃഷി സിഞ്ചായി യോജന, കിസാൻ ക്രെഡിറ്റ് കാർഡ് തുടങ്ങിയ സർക്കാർ പദ്ധതികൾ ലഭ്യമാണ്.');
    } else {
      speak('താങ്കൾ പറഞ്ഞത്: ' + command + '. കൃഷിയുമായി ബന്ധപ്പെട്ട് എന്ത് സഹായമാണ് വേണ്ടത്?');
    }
  };

  // 1. Listen in Malayalam
  const startListening = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      speak('ക്ഷമിക്കണം. ഈ ബ്രൗസർ ശബ്ദ തിരിച്ചറിയൽ പിന്തുണയ്ക്കുന്നില്ല. ദയവായി Chrome ഉപയോഗിക്കൂ.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ml-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const command = event.results[0][0].transcript;
      setTranscript(command);
      processCommand(command);
    };

    recognition.start();
  };

  const handleAvatarClick = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else if (!isListening) {
      startListening();
    }
  };

  return (
    <div className="krishi-container">
      {/* Transcript bubble */}
      {transcript && (
        <div className="krishi-transcript">
          <strong>നിങ്ങൾ ചോദിച്ചത്:</strong>
          {transcript}
        </div>
      )}

      {/* Avatar */}
      <div
        className="krishi-avatar-wrapper"
        onClick={handleAvatarClick}
        title="മലയാളത്തിൽ സംസാരിക്കൂ"
        role="button"
        aria-label={isSpeaking ? 'Avatar speaking — click to stop' : 'Click to start Malayalam voice assistant'}
      >
        {/* Ripple rings when listening */}
        {isListening && (
          <>
            <div className="krishi-ripple" />
            <div className="krishi-ripple krishi-ripple-2" />
          </>
        )}

        <div className={`krishi-avatar-bg ${isSpeaking ? 'speaking' : 'idle'}`}>
          <AvatarSVG speaking={isSpeaking} />
          {isSpeaking && <div className="krishi-badge">🔊</div>}
        </div>

        {/* Status label below avatar */}
        <span className="krishi-label">
          {isSpeaking ? 'സംസാരിക്കുന്നു...' : isListening ? 'കേൾക്കുന്നു...' : 'കൃഷിമിത്രം'}
        </span>
      </div>

      {/* Mic trigger button */}
      <button
        className={`krishi-mic-btn ${isListening ? 'listening' : 'idle'}`}
        onClick={startListening}
        disabled={isSpeaking}
        aria-label={isListening ? 'Listening in Malayalam' : 'Start Malayalam voice assistant'}
        style={{ marginTop: '28px' }}
      >
        <span style={{ fontSize: '16px' }}>{isListening ? '🎙️' : '🎤'}</span>
        {isListening ? 'കേൾക്കുന്നു...' : 'സംസാരിക്കൂ'}
      </button>
    </div>
  );
};

export default KrishiAvatarAssistant;

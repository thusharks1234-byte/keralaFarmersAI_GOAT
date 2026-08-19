import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/*
     * KrishiAvatarAssistant has been moved inside App.tsx so it can
     * access VoiceNavigationProvider (which requires being inside <Router>).
     * It still renders as a globally floating overlay with no layout impact.
     */}
    <App />
  </StrictMode>,
);

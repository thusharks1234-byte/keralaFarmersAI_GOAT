import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import KrishiAvatarAssistant from './components/KrishiAvatarAssistant.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    {/* KrishiAvatarAssistant: isolated floating overlay — does not affect any layout or route */}
    <KrishiAvatarAssistant />
  </StrictMode>,
);

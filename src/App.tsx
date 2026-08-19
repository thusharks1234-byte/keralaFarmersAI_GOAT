import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';


import { AppShell } from './layouts/AppShell';
import { PublicLayout } from './layouts/PublicLayout';

// Public pages
import Home from './pages/Home';
import Features from './pages/Features';
import About from './pages/About';
import Resources from './pages/Resources';
import Support from './pages/Support';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Login from './pages/Login';
import Signup from './pages/Signup';
import NotFound from './pages/NotFound';

// App pages
import Dashboard from './pages/Dashboard';
import AIAssistant from './pages/AIAssistant';
import CropAdvisor from './pages/CropAdvisor';
import Weather from './pages/Weather';
import MarketPrices from './pages/MarketPrices';
import GovtSchemes from './pages/GovtSchemes';
import FarmCalendar from './pages/FarmCalendar';
import DiseaseDoctor from './pages/DiseaseDoctor';
import SmartAlerts from './pages/SmartAlerts';
import FarmProfile from './pages/FarmProfile';
import Settings from './pages/Settings';

import VoiceAssistant from './components/VoiceAssistant';

export default function App() {
  return (
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <Routes>
            {/* Public Marketing Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/features" element={<Features />} />
              <Route path="/about" element={<About />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/support" element={<Support />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
            </Route>

            {/* Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected App Routes */}
            <Route element={<AppShell />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/ai-assistant" element={<AIAssistant />} />
              <Route path="/crop-advisor" element={<CropAdvisor />} />
              <Route path="/weather" element={<Weather />} />
              <Route path="/market-prices" element={<MarketPrices />} />
              <Route path="/govt-schemes" element={<GovtSchemes />} />
              <Route path="/farm-calendar" element={<FarmCalendar />} />
              <Route path="/disease-doctor" element={<DiseaseDoctor />} />
              <Route path="/smart-alerts" element={<SmartAlerts />} />
              <Route path="/farm-profile" element={<FarmProfile />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>

          {/* Global floating Voice Assistant */}
          <VoiceAssistant />
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
}

# 🌱 Krishimithram

**The AI Companion for Kerala's Farmers.** 

Krishimithram is a modern, mobile-responsive web application designed to empower farmers with accessible, data-driven agricultural advice. Built with an emphasis on accessibility, the platform features a native multilingual voice assistant, an AI-powered crop scanner, real-time market insights, and localized weather metrics to help farmers improve their yield without needing to type a single word.

---

## ✨ Features

*   🎙️ **Multilingual Voice Assistant (`KrishiAvatarAssistant`):** A collapsible, floating UI widget that listens and speaks in Malayalam, Hindi, and English. Powered by the native Web Speech API and routed through ultra-low-latency LLMs for seamless interactions.
*   🧠 **Intelligent Agricultural Advice:** Integrated with the **Google Gemini API** and failover routes, providing farmers with real-time, context-aware farming solutions strictly in their chosen language.
*   📷 **AI Crop Scanner:** Utilizes computer vision APIs (Pl@ntNet/Gemini). Users can snap a photo of their crops to instantly identify the plant, detect visible diseases or pests, and receive organic remedy suggestions.
*   📊 **Live Market & Weather Data:** Geo-targeted dashboards that pull real-time Mandi market crop prices and precise Open-Meteo climate forecasts based on the user's location.
*   📱 **Fully Mobile-Responsive:** A meticulously audited CSS layout ensuring a perfect, app-like experience on mobile devices with zero horizontal scrolling and touch-friendly interface elements.
*   🔐 **Secure User Data:** Backed by a cloud PostgreSQL database for seamless user authentication and personalized farming data storage.

---

## 🛠️ Tech Stack

### Core Frontend & Deployment
*   **Frontend:** React (JavaScript/JSX)
*   **Styling:** Native CSS (Flexbox, CSS Animations, Media Queries)
*   **Hosting/Deployment:** Vercel

### Project Infrastructure & External APIs

**Backend Infrastructure**
*   **Supabase Platform:** Cloud PostgreSQL database, user authentication, and secure data storage.

**Artificial Intelligence & Voice Engine**
*   **Google Gemini API:** Core intelligence driving native multilingual speech & query resolution.
*   **Groq API & OpenAI / OpenRouter:** Ultra-low-latency LLM inference and failover API routing.
*   **Native Web Speech API:** HTML5 engine (`SpeechRecognition` & `SpeechSynthesis`) for local voice handling.

**Agricultural Intelligence & Computer Vision**
*   **Mandi Market API:** Real-time fetching of local crop market prices.
*   **Pl@ntNet API:** Computer vision for crop disease detection and plant health diagnostics.

**Climate & Geolocation**
*   **Open-Meteo API:** Precise weather metrics and forecast data for farm management.
*   **IPStack & Location APIs:** Geo-targeting user location to provide regional language, weather, and market data.

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
*   Node.js installed on your machine.
*   Active API keys for Gemini, Supabase, Groq/OpenRouter, and the external data APIs.

### Installation
1. **Clone the repository:**
   ```bash
   git clone "https://github.com/thusharks1234-byte/krishimithramthush.git"
   cd krishimithram
  Install dependencies:

Bash
npm install

2.**Set up Environment Variables:**
Create a .env file in the root of your project and add your Gemini API key:

  Code snippet
VITE_GEMINI_API_KEY=your_actual_api_key_here
(Note: If using Create React App instead of Vite, name the variable REACT_APP_GEMINI_API_KEY)

3.**Run the development server:**

Bash
npm run dev
Open http://localhost:5173 (or the port specified in your terminal) to view it in your browser.

📱 Mobile Optimization
This application is built with a "Mobile-First" philosophy. To test the mobile view locally:

Open Developer Tools in your browser (F12 or Ctrl+Shift+I).

Toggle the Device Toolbar (Ctrl+Shift+M).

Select a mobile device to ensure the Floating Action Button and layout render perfectly.

👨‍💻 Developer
Developed by Thushar K S.

📄 License
This project is for educational and developmental purposes.

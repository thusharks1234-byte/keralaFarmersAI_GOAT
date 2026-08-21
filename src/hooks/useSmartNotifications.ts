import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const MANDI_API_KEY = import.meta.env.VITE_MANDI_API_KEY as string;
const MANDI_API_URL = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${MANDI_API_KEY}&format=json`;

export function useSmartNotifications() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !('Notification' in window)) return;

    const checkAndNotify = async () => {
      const today = new Date().toDateString();
      const lastNotified = localStorage.getItem('km_last_notified');
      
      // Only run the background check once per day to avoid API spam and notification fatigue
      if (lastNotified === today) return;

      try {
        // We need permission first before doing heavy API calls just for notifications
        if (Notification.permission !== 'granted') {
          const perm = await Notification.requestPermission();
          if (perm !== 'granted') return;
        }

        const notificationsToSend: { title: string; body: string }[] = [];

        // 1. Weather Check
        const { data: farm } = await supabase.from('farms').select('latitude, longitude, district').eq('owner_id', user.id).single();
        if (farm?.latitude && farm?.longitude) {
          const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${farm.latitude}&longitude=${farm.longitude}&daily=precipitation_sum,temperature_2m_max&timezone=auto`);
          const wData = await wRes.json();
          if (wData.daily) {
            const maxPrecip = Math.max(wData.daily.precipitation_sum[0] || 0, wData.daily.precipitation_sum[1] || 0);
            const maxTemp = wData.daily.temperature_2m_max[0] || 0;
            
            if (maxPrecip > 20) {
              notificationsToSend.push({
                title: 'Heavy Rainfall Alert 🌧️',
                body: `Heavy rainfall (${maxPrecip}mm) expected in your area (${farm.district || 'Farm'}). Ensure proper drainage.`
              });
            }
            if (maxTemp > 35) {
              notificationsToSend.push({
                title: 'Extreme Heat Warning ☀️',
                body: `Temperatures may reach ${maxTemp}°C. Ensure adequate irrigation.`
              });
            }
          }
        }

        // 2. Market Prices Check
        const preferredCrops: string[] = JSON.parse(localStorage.getItem('km_preferred_crops') || '[]');
        if (preferredCrops.length > 0) {
          const cropPromises = preferredCrops.map(crop => 
            fetch(`${MANDI_API_URL}&filters[commodity]=${encodeURIComponent(crop)}&limit=10`)
              .then(r => r.json())
              .catch(() => null)
          );
          
          const results = await Promise.all(cropPromises);

          results.forEach((mData, index) => {
            const crop = preferredCrops[index];
            if (mData && mData.records && mData.records.length > 0) {
              let highestPrice = 0;
              mData.records.forEach((r: any) => {
                const price = parseFloat(r.modal_price);
                if (price > highestPrice) highestPrice = price;
              });

              if (highestPrice > 0) {
                notificationsToSend.push({
                  title: `${crop} Market Update 📈`,
                  body: `Your preferred crop ${crop} is trading up to ₹${highestPrice} today.`
                });
              }
            }
          });
        }

        // Send them
        notificationsToSend.forEach(n => {
          new Notification(n.title, { body: n.body, icon: '/favicon.ico' });
        });

        // Mark as notified for today
        localStorage.setItem('km_last_notified', today);

      } catch (e) {
        console.error('Background notification check failed:', e);
      }
    };

    // Delay the check slightly so it doesn't block immediate UI rendering on login
    const timer = setTimeout(checkAndNotify, 3000);
    return () => clearTimeout(timer);
  }, [user]);
}

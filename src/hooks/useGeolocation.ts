/**
 * useGeolocation - Requests the browser to share the user's current location.
 * Returns { lat, lng, locationName, loading, error, retry }.
 *
 * Strategy:
 *  1. Ask navigator.geolocation for current position
 *  2. Use Open-Meteo's free reverse-geocoding via timezone offset to infer a
 *     region name (no extra API key needed).
 *  3. On denial / unavailability, caller should fall back to saved farm coords.
 */
import { useState, useCallback } from 'react';

export async function getIpstackLocation(): Promise<{lat: number, lng: number, locationName: string} | null> {
  const IPSTACK_KEY = import.meta.env.VITE_IPSTACK_API_KEY;
  if (!IPSTACK_KEY) return null;
  try {
    const res = await fetch(`https://api.ipstack.com/check?access_key=${IPSTACK_KEY}`);
    if (res.ok) {
      const data = await res.json();
      if (data.latitude && data.longitude) {
        return {
          lat: data.latitude,
          lng: data.longitude,
          locationName: data.city || data.region_name || 'My Location'
        };
      }
    }
  } catch (err) {
    console.error('IPStack failed:', err);
  }
  return null;
}

export interface GeoLocation {
  lat: number;
  lng: number;
  locationName: string;
}

interface UseGeolocationResult {
  location: GeoLocation | null;
  loading: boolean;
  error: string;
  denied: boolean;
  retry: () => void;
}

import { KERALA_DISTRICTS, KARNATAKA_DISTRICTS } from '../lib/crop-rules';

export interface LocationDetails {
  district: string | null;
  village: string | null;
  pincode: string | null;
  locationName: string;
}

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const details = await reverseGeocodePerfect(lat, lng);
  return details.locationName;
}

export async function reverseGeocodePerfect(lat: number, lng: number): Promise<LocationDetails> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      { headers: { 'Accept-Language': 'en', 'User-Agent': 'KrishiMithram/1.0' } }
    );
    if (!res.ok) throw new Error('Geocoding failed');
    const json = await res.json();
    const addr = json.address || {};

    const rawDistrict = addr.county || addr.state_district || addr.city || addr.town || '';
    const allDistricts = [...KERALA_DISTRICTS, ...KARNATAKA_DISTRICTS];
    
    let matchedDistrict = null;
    if (rawDistrict) {
      const rawLower = rawDistrict.toLowerCase().replace(' district', '').trim();
      matchedDistrict = allDistricts.find(d => {
        const dl = d.toLowerCase();
        return dl === rawLower || dl.includes(rawLower) || rawLower.includes(dl.split(' ')[0]);
      }) || rawDistrict;
    }

    const detectedVillage = addr.village || addr.suburb || addr.town || addr.city || null;
    const detectedPincode = addr.postcode || null;

    const parts = [matchedDistrict, detectedVillage].filter(Boolean);
    const locationName = parts.length > 0 ? parts.join(', ') : 'My Location';

    return {
      district: matchedDistrict,
      village: detectedVillage,
      pincode: detectedPincode,
      locationName,
    };
  } catch {
    return { district: null, village: null, pincode: null, locationName: 'My Location' };
  }
}

export function useGeolocation(): UseGeolocationResult {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [denied, setDenied] = useState(false);

  const getLocation = useCallback(async () => {
    setLoading(true);
    setError('');
    setDenied(false);

    const tryBrowserGeo = () => {
      if (!navigator.geolocation) {
        setError('Geolocation is not supported by your browser.');
        setDenied(true);
        setLoading(false);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude: lat, longitude: lng } = pos.coords;
          const locationName = await reverseGeocode(lat, lng);
          setLocation({ lat, lng, locationName });
          setLoading(false);
        },
        (err) => {
          if (err.code === GeolocationPositionError.PERMISSION_DENIED) {
            setDenied(true);
            setError('Location access was denied. Using saved farm coordinates instead.');
          } else {
            setError('Could not determine your location. Using saved farm coordinates.');
          }
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    };

    const ipLocation = await getIpstackLocation();
    if (ipLocation) {
      setLocation(ipLocation);
      setLoading(false);
    } else {
      tryBrowserGeo();
    }
  }, []);

  return { location, loading, error, denied, retry: getLocation };
}

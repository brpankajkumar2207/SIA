// src/services/arinLocationService.ts

export interface Zone {
  id: string;
  name: string;
  type: 'hostel' | 'campus' | 'office' | 'residential';
  display_name: string;
  center: { lat: number; lng: number };
  radius_km: number;
}

export interface Zone {
  id: string;
  name: string;
  type: 'city';
  display_name: string;
  center: { lat: number; lng: number };
  radius_km: number; // Approximate city radius
}

export const PREDEFINED_ZONES: Zone[] = [
  {
    id: "city_bangalore",
    name: "Bengaluru",
    type: "city",
    display_name: "BANGALORE CITY",
    center: { lat: 12.9716, lng: 77.5946 },
    radius_km: 25.0
  },
  {
    id: "city_mumbai",
    name: "Mumbai",
    type: "city",
    display_name: "MUMBAI REGION",
    center: { lat: 19.0760, lng: 72.8777 },
    radius_km: 30.0
  },
  {
    id: "city_delhi",
    name: "New Delhi",
    type: "city",
    display_name: "DELHI NCR",
    center: { lat: 28.6139, lng: 77.2090 },
    radius_km: 40.0
  },
  {
    id: "city_hyderabad",
    name: "Hyderabad",
    type: "city",
    display_name: "HYDERABAD CITY",
    center: { lat: 17.3850, lng: 78.4867 },
    radius_km: 20.0
  }
];

export const getDistanceKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const detectZoneLocal = (latitude: number, longitude: number): Zone | null => {
  let matchedZone: Zone | null = null;
  let closestDistance = Infinity;

  for (const zone of PREDEFINED_ZONES) {
    const distance = getDistanceKm(
      latitude, longitude,
      zone.center.lat, zone.center.lng
    );

    if (distance <= zone.radius_km && distance < closestDistance) {
      matchedZone = zone;
      closestDistance = distance;
    }
  }

  return matchedZone;
};

export const getZoneWithCache = async (onManualPicker: () => void): Promise<Zone | null> => {
  const ZONE_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  const cached = sessionStorage.getItem('arin_zone');
  const cachedAt = sessionStorage.getItem('arin_zone_cached_at');

  const isFresh = cached && cachedAt && 
    (Date.now() - parseInt(cachedAt)) < ZONE_CACHE_DURATION;

  if (isFresh) {
    return JSON.parse(cached);
  }

  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      onManualPicker();
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const zone = detectZoneLocal(latitude, longitude);
        if (zone) {
          sessionStorage.setItem('arin_zone', JSON.stringify(zone));
          sessionStorage.setItem('arin_zone_cached_at', Date.now().toString());
          resolve(zone);
        } else {
          onManualPicker();
          resolve(null);
        }
      },
      () => {
        onManualPicker();
        resolve(null);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  });
};

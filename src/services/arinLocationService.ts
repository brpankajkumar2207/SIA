// src/services/arinLocationService.ts

export interface Zone {
  id: string;
  name: string;
  type: 'hostel' | 'campus' | 'office' | 'residential' | 'city';
  display_name: string;
  center: { lat: number; lng: number };
  radius_km: number;
}

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

export const getZoneWithCache = async (forceRefresh = false): Promise<Zone | null> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log(`📍 Raw Coordinates: ${latitude}, ${longitude}`);
        
        // Create a dynamic zone for the current coordinates
        let displayZone: Zone = {
          id: `dynamic_${Date.now()}`,
          name: "Detected Location",
          type: "city",
          display_name: "DETECTING...",
          center: { lat: latitude, lng: longitude },
          radius_km: 10
        };

        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14`, {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'SIA-Wellness-App'
            }
          });
          
          if (response.ok) {
            const data = await response.ok ? await response.json() : null;
            console.log("📍 Reverse Geocoding Result:", data);
            
            if (data && data.address) {
              const addr = data.address;
              const localArea = addr.neighbourhood || addr.suburb || addr.subdivision || 
                               addr.residential || addr.industrial || addr.village || 
                               addr.hamlet || addr.allotments || addr.croft || '';
                               
              const cityArea = addr.city || addr.town || addr.municipality || 
                              addr.city_district || addr.district || addr.county || '';
              
              let preciseName = "";
              if (localArea && cityArea && localArea.toLowerCase() !== cityArea.toLowerCase()) {
                preciseName = `${localArea}, ${cityArea}`;
              } else {
                preciseName = localArea || cityArea || "UNKNOWN LOCATION";
              }
              
              displayZone.display_name = preciseName.trim().toUpperCase();
            }
          }
        } catch (e) {
          console.error("📍 Reverse geocoding failed:", e);
        }

        sessionStorage.setItem('arin_zone', JSON.stringify(displayZone));
        sessionStorage.setItem('arin_zone_cached_at', Date.now().toString());
        resolve(displayZone);
      },
      (error) => {
        console.error("📍 Geolocation Error:", error.message);
        resolve(null);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  });
};

// Utility functions for reverse geocoding and finding nearby places using free APIs
// Uses OpenStreetMap Nominatim for reverse geocoding and OpenTripMap for POIs

export async function reverseGeocode(lat: number, lon: number) {
  // Nominatim API for city, county, state
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'LoreApp/1.0' } });
  if (!res.ok) throw new Error('Failed to fetch location info');
  const data = await res.json();
  return {
    city: data.address.city || data.address.town || data.address.village || '',
    county: data.address.county || '',
    state: data.address.state || '',
    displayName: data.display_name || '',
  };
}

export async function getNearbyAttractions(lat: number, lon: number, radiusMiles = 25) {
  // OpenTripMap API for POIs (free tier, requires API key)
  // You must get a free API key from https://opentripmap.io/
  const apiKey = '5ae2e3f221c38a28845f05b6efaae44672d9da60ae7fb08b8d6a6c5e'; // <-- Replace with your key
  const radius = Math.round(radiusMiles * 1609.34); // meters
  const limit = 10;
  const url = `https://api.opentripmap.com/0.1/en/places/radius?radius=${radius}&lon=${lon}&lat=${lat}&format=json&limit=${limit}&apikey=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch nearby attractions');
  const data = await res.json();
  // Each item has .name and .dist (meters)
  return data.filter((item: any) => item.name).map((item: any) => ({
    name: item.name,
    distance: Math.round(item.dist / 1609.34 * 10) / 10, // miles
  }));
}

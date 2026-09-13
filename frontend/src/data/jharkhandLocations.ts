/**
 * Centralized Jharkhand Geographic Data
 * Official list of all 24 districts of Jharkhand with real administrative
 * headquarters, major subdivisions, blocks, towns, and localities.
 */

export interface JharkhandLocality {
  name: string;
  type?: "town" | "block" | "area" | "subdivision";
}

export interface JharkhandDistrict {
  id: string;
  name: string;
  headquarters: string;
  centerCoordinates: {
    latitude: number;
    longitude: number;
  };
  localities: string[];
}

export const JHARKHAND_STATE_NAME = "Jharkhand";

export const JHARKHAND_DISTRICTS: JharkhandDistrict[] = [
  {
    id: "ranchi",
    name: "Ranchi",
    headquarters: "Ranchi",
    centerCoordinates: { latitude: 23.3441, longitude: 85.3096 },
    localities: [
      "Ranchi City",
      "Doranda",
      "Kanke",
      "Hatia",
      "Namkum",
      "Ratu",
      "Ormanjhi",
      "Bundu",
      "Morabadi",
      "Hinoo",
      "Lalpur",
      "Jagannathpur",
      "Tatisilwai",
      "Bero",
      "Tamar",
      "Mandar",
      "Sonahatu",
      "Nagri",
    ],
  },
  {
    id: "dhanbad",
    name: "Dhanbad",
    headquarters: "Dhanbad",
    centerCoordinates: { latitude: 23.7957, longitude: 86.4304 },
    localities: [
      "Dhanbad City",
      "Jharia",
      "Sindri",
      "Katras",
      "Baghmara",
      "Nirsa",
      "Govindpur",
      "Topchanchi",
      "Chirkunda",
      "Putki",
      "Kenduadih",
      "Tundi",
      "Baliapur",
    ],
  },
  {
    id: "east-singhbhum",
    name: "East Singhbhum",
    headquarters: "Jamshedpur",
    centerCoordinates: { latitude: 22.8046, longitude: 86.2029 },
    localities: [
      "Jamshedpur (Sakchi/Bistupur)",
      "Mango",
      "Golmuri",
      "Jugsalai",
      "Ghatshila",
      "Telco Colony",
      "Baharagora",
      "Potka",
      "Musabani",
      "Jaduguda",
      "Chakulia",
      "Dhalbhumgarh",
      "Dumaria",
    ],
  },
  {
    id: "bokaro",
    name: "Bokaro",
    headquarters: "Bokaro Steel City",
    centerCoordinates: { latitude: 23.6693, longitude: 86.1511 },
    localities: [
      "Bokaro Steel City",
      "Chas",
      "Bermo",
      "Phusro",
      "Gomia",
      "Chandrapura",
      "Jaridih",
      "Petarwar",
      "Kasmar",
      "Nawadih",
      "Chandankiyari",
    ],
  },
  {
    id: "hazaribagh",
    name: "Hazaribagh",
    headquarters: "Hazaribagh",
    centerCoordinates: { latitude: 23.9937, longitude: 85.3551 },
    localities: [
      "Hazaribagh City",
      "Barhi",
      "Barkagaon",
      "Chauparan",
      "Ichak",
      "Bishnugarh",
      "Katkamsandi",
      "Padma",
      "Daru",
      "Keredari",
      "Churchu",
      "Barkatha",
    ],
  },
  {
    id: "deoghar",
    name: "Deoghar",
    headquarters: "Deoghar",
    centerCoordinates: { latitude: 24.4826, longitude: 86.7 },
    localities: [
      "Deoghar City",
      "Madhupur",
      "Jasidih",
      "Sarath",
      "Mohanpur",
      "Palojori",
      "Karon",
      "Devipur",
      "Sonaraythari",
      "Margomunda",
    ],
  },
  {
    id: "giridih",
    name: "Giridih",
    headquarters: "Giridih",
    centerCoordinates: { latitude: 24.186, longitude: 86.3094 },
    localities: [
      "Giridih Town",
      "Dumri",
      "Bagodar",
      "Dhanwar",
      "Bengabad",
      "Tisri",
      "Gandey",
      "Deori",
      "Pirtand",
      "Birni",
      "Jamua",
      "Gawan",
    ],
  },
  {
    id: "ramgarh",
    name: "Ramgarh",
    headquarters: "Ramgarh Cantonment",
    centerCoordinates: { latitude: 23.6332, longitude: 85.5149 },
    localities: [
      "Ramgarh Cantonment",
      "Patratu",
      "Gola",
      "Mandu",
      "Chitarpur",
      "Dulmi",
      "Barkakana",
      "Bhurkunda",
    ],
  },
  {
    id: "palamu",
    name: "Palamu",
    headquarters: "Medininagar (Daltonganj)",
    centerCoordinates: { latitude: 24.0384, longitude: 84.07 },
    localities: [
      "Medininagar (Daltonganj)",
      "Chainpur",
      "Chhaterpur",
      "Hussainabad",
      "Hariharganj",
      "Lesliganj",
      "Pandu",
      "Bishrampur",
      "Patan",
      "Manatu",
      "Tarhassi",
      "Satbarwa",
    ],
  },
  {
    id: "west-singhbhum",
    name: "West Singhbhum",
    headquarters: "Chaibasa",
    centerCoordinates: { latitude: 22.5517, longitude: 85.808 },
    localities: [
      "Chaibasa",
      "Chakradharpur",
      "Noamundi",
      "Kiriburu",
      "Gua",
      "Jagannathpur",
      "Jhinkpani",
      "Manoharpur",
      "Majhgaon",
      "Sonua",
      "Tonto",
      "Kumardungi",
    ],
  },
  {
    id: "saraikela-kharsawan",
    name: "Saraikela Kharsawan",
    headquarters: "Saraikela",
    centerCoordinates: { latitude: 22.7027, longitude: 85.9304 },
    localities: [
      "Saraikela",
      "Adityapur",
      "Gamharia",
      "Kharsawan",
      "Chandil",
      "Rajnagar",
      "Kuchai",
      "Chowka",
      "Nimdih",
      "Ichagarh",
      "Kukru",
    ],
  },
  {
    id: "dumka",
    name: "Dumka",
    headquarters: "Dumka",
    centerCoordinates: { latitude: 24.269, longitude: 87.2483 },
    localities: [
      "Dumka Town",
      "Jarmundi",
      "Ranishwar",
      "Shikaripara",
      "Jama",
      "Saraiyahat",
      "Masalia",
      "Ramgarh (Dumka)",
      "Kathikund",
      "Gopikandar",
    ],
  },
  {
    id: "godda",
    name: "Godda",
    headquarters: "Godda",
    centerCoordinates: { latitude: 24.8267, longitude: 87.214 },
    localities: [
      "Godda Town",
      "Mahagama",
      "Meharma",
      "Pathargama",
      "Boarijor",
      "Porayahat",
      "Sundarpahari",
      "Thakurgangti",
    ],
  },
  {
    id: "sahebganj",
    name: "Sahebganj",
    headquarters: "Sahebganj",
    centerCoordinates: { latitude: 25.2425, longitude: 87.6436 },
    localities: [
      "Sahebganj Town",
      "Rajmahal",
      "Barharwa",
      "Taljhari",
      "Borio",
      "Mandro",
      "Berhait",
      "Pathna",
      "Udhwa",
    ],
  },
  {
    id: "pakur",
    name: "Pakur",
    headquarters: "Pakur",
    centerCoordinates: { latitude: 24.634, longitude: 87.8492 },
    localities: [
      "Pakur Town",
      "Hiranpur",
      "Littipara",
      "Amrapara",
      "Maheshpur",
      "Pakuria",
    ],
  },
  {
    id: "jamtara",
    name: "Jamtara",
    headquarters: "Jamtara",
    centerCoordinates: { latitude: 23.9599, longitude: 86.8016 },
    localities: [
      "Jamtara Town",
      "Mihijam",
      "Narayanpur",
      "Kundhit",
      "Nala",
      "Karmatanr (Vidyasagar)",
      "Fatehpur",
    ],
  },
  {
    id: "chatra",
    name: "Chatra",
    headquarters: "Chatra",
    centerCoordinates: { latitude: 24.212, longitude: 84.8711 },
    localities: [
      "Chatra Town",
      "Hunterganj",
      "Simaria",
      "Itkhori",
      "Tandwa",
      "Pratappur",
      "Lawalong",
      "Gidhour",
      "Kanhachatti",
      "Pathalgada",
      "Mayurhand",
      "Kunda",
    ],
  },
  {
    id: "koderma",
    name: "Koderma",
    headquarters: "Koderma",
    centerCoordinates: { latitude: 24.4674, longitude: 85.5939 },
    localities: [
      "Koderma Town",
      "Jhumri Telaiya",
      "Domchanch",
      "Markacho",
      "Chandwara",
      "Satgawan",
    ],
  },
  {
    id: "garhwa",
    name: "Garhwa",
    headquarters: "Garhwa",
    centerCoordinates: { latitude: 24.1611, longitude: 83.8052 },
    localities: [
      "Garhwa Town",
      "Nagar Untari (Shri Banshidhar Nagar)",
      "Majhiaon",
      "Ranka",
      "Bhawnathpur",
      "Kharaundhi",
      "Meral",
      "Ramna",
      "Dhurki",
      "Chinia",
      "Bhandaria",
      "Danda",
    ],
  },
  {
    id: "latehar",
    name: "Latehar",
    headquarters: "Latehar",
    centerCoordinates: { latitude: 23.7431, longitude: 84.5029 },
    localities: [
      "Latehar Town",
      "Chandwa",
      "Balumath",
      "Mahuadanr",
      "Manika",
      "Barwadih",
      "Garu",
      "Herhanj",
      "Bariyatu",
    ],
  },
  {
    id: "lohardaga",
    name: "Lohardaga",
    headquarters: "Lohardaga",
    centerCoordinates: { latitude: 23.4357, longitude: 84.6806 },
    localities: [
      "Lohardaga Town",
      "Kuru",
      "Bhandra",
      "Senha",
      "Kisko",
      "Peshrar",
      "Kisko Valley",
    ],
  },
  {
    id: "gumla",
    name: "Gumla",
    headquarters: "Gumla",
    centerCoordinates: { latitude: 23.0435, longitude: 84.542 },
    localities: [
      "Gumla Town",
      "Raidih",
      "Sisai",
      "Ghaghra",
      "Chainpur",
      "Basia",
      "Kamdara",
      "Palkot",
      "Bishunpur (Netarhat)",
      "Bharno",
      "Albert Ekka (Jari)",
    ],
  },
  {
    id: "simdega",
    name: "Simdega",
    headquarters: "Simdega",
    centerCoordinates: { latitude: 22.6163, longitude: 84.5103 },
    localities: [
      "Simdega Town",
      "Kolebira",
      "Thethaitangar",
      "Bano",
      "Kurdeg",
      "Bolba",
      "Jaldega",
      "Pakartanr",
      "Kersai",
    ],
  },
  {
    id: "khunti",
    name: "Khunti",
    headquarters: "Khunti",
    centerCoordinates: { latitude: 23.0736, longitude: 85.2789 },
    localities: [
      "Khunti Town",
      "Torpa",
      "Murhu",
      "Karra",
      "Rania",
      "Arki",
    ],
  },
];

/**
 * Returns list of all 24 district names in alphabetical order.
 */
export function getJharkhandDistricts(): string[] {
  return JHARKHAND_DISTRICTS.map((d) => d.name).sort((a, b) =>
    a.localeCompare(b)
  );
}

/**
 * Key cities, urban centers, and industrial hubs of Jharkhand.
 */
export const JHARKHAND_CITIES: string[] = [
  "Ranchi",
  "Jamshedpur",
  "Dhanbad",
  "Bokaro Steel City",
  "Deoghar",
  "Hazaribagh",
  "Giridih",
  "Ramgarh Cantonment",
  "Medininagar (Daltonganj)",
  "Chaibasa",
  "Adityapur",
  "Dumka",
  "Phusro",
  "Chakradharpur",
  "Jharia",
  "Sahibganj",
  "Godda",
  "Pakur",
  "Jamtara",
  "Chatra",
  "Koderma / Jhumri Telaiya",
  "Garhwa",
  "Latehar",
  "Lohardaga",
  "Gumla",
  "Simdega",
  "Khunti",
  "Patratu",
  "Sindri",
  "Madhupur",
  "Ghatshila",
];

export function getJharkhandCities(): string[] {
  return JHARKHAND_CITIES;
}

/**
 * Returns a consolidated, sorted list of Jharkhand cities and districts for selection.
 */
export function getJharkhandCitiesAndDistricts(): string[] {
  const combined = new Set<string>([
    ...JHARKHAND_CITIES,
    ...getJharkhandDistricts(),
  ]);
  return Array.from(combined).sort((a, b) => a.localeCompare(b));
}

/**
 * Returns real localities/towns/blocks for a selected district name.
 */
export function getLocalitiesForDistrict(districtName: string): string[] {
  if (!districtName) return [];
  const normalized = districtName.trim().toLowerCase();
  const district = JHARKHAND_DISTRICTS.find(
    (d) =>
      d.name.toLowerCase() === normalized ||
      d.id.toLowerCase() === normalized ||
      d.name.toLowerCase().includes(normalized)
  );
  return district ? district.localities : [];
}

/**
 * Calculates Haversine distance in kilometers between two GPS coordinates.
 */
function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Matches latitude & longitude to the nearest Jharkhand district centroid.
 */
export function findClosestJharkhandDistrict(
  latitude: number,
  longitude: number
): { district: string; distanceKm: number; headquarters: string } {
  let closest = JHARKHAND_DISTRICTS[0];
  let minDistance = calculateDistanceKm(
    latitude,
    longitude,
    closest.centerCoordinates.latitude,
    closest.centerCoordinates.longitude
  );

  for (let i = 1; i < JHARKHAND_DISTRICTS.length; i++) {
    const d = JHARKHAND_DISTRICTS[i];
    const dist = calculateDistanceKm(
      latitude,
      longitude,
      d.centerCoordinates.latitude,
      d.centerCoordinates.longitude
    );
    if (dist < minDistance) {
      minDistance = dist;
      closest = d;
    }
  }

  return {
    district: closest.name,
    distanceKm: Math.round(minDistance * 10) / 10,
    headquarters: closest.headquarters,
  };
}

/**
 * Complete list of all Indian States and Union Territories.
 */
export const ALL_INDIAN_STATES: string[] = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
  "Other",
];

export interface ReverseGeocodeResult {
  state?: string;
  district?: string;
  city?: string;
  locality?: string;
  formattedAddress?: string;
  country?: string;
}

/**
 * Reverse geocodes latitude & longitude into exact physical location:
 * State, District / City, Locality / Suburb, and human-readable address.
 * Uses BigDataCloud client API with OpenStreetMap Nominatim fallback.
 */
export async function reverseGeocodeCoordinates(
  latitude: number,
  longitude: number
): Promise<ReverseGeocodeResult> {
  // Strategy 1: BigDataCloud Reverse Geocode (fast, no CORS issue, no API key needed)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const resp = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);
    if (resp.ok) {
      const data = await resp.json();
      const state = data.principalSubdivision || "";
      const city = data.city || "";
      const locality = data.locality || "";
      let district = city;

      if (Array.isArray(data.localityInfo?.administrative)) {
        const distObj = data.localityInfo.administrative.find(
          (item: any) =>
            item.description?.toLowerCase().includes("district") ||
            item.name?.toLowerCase().includes("district") ||
            (item.adminLevel >= 5 && item.adminLevel <= 7)
        );
        if (distObj && distObj.name) {
          district = distObj.name.replace(/\s+district/i, "").trim();
        }
      }

      const parts = [locality, district, state, data.countryName].filter(Boolean);
      return {
        state: state || undefined,
        district: district || city || locality || undefined,
        city: city || undefined,
        locality: locality || undefined,
        country: data.countryName || undefined,
        formattedAddress: parts.join(", "),
      };
    }
  } catch (err) {
    console.warn("BigDataCloud reverse geocode fallback:", err);
  }

  // Strategy 2: OpenStreetMap Nominatim fallback
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const resp = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      {
        signal: controller.signal,
        headers: { "Accept-Language": "en" },
      }
    );
    clearTimeout(timeoutId);
    if (resp.ok) {
      const data = await resp.json();
      const addr = data.address || {};
      const state = addr.state || addr.province || addr.region || "";
      const district = (addr.state_district || addr.county || addr.city || addr.district || "")
        .replace(/\s+district/i, "")
        .trim();
      const city = addr.city || addr.town || addr.village || "";
      const locality = addr.suburb || addr.neighbourhood || addr.quarter || addr.road || city || "";
      return {
        state: state || undefined,
        district: district || city || undefined,
        city: city || undefined,
        locality: locality || undefined,
        country: addr.country || undefined,
        formattedAddress: data.display_name,
      };
    }
  } catch (err) {
    console.warn("Nominatim reverse geocode fallback:", err);
  }

  return {};
}

/**
 * Checks if coordinates fall within the approximate geographic bounds of Jharkhand.
 */
export function isWithinJharkhand(latitude: number, longitude: number): boolean {
  return (
    latitude >= 21.95 &&
    latitude <= 25.40 &&
    longitude >= 83.30 &&
    longitude <= 87.98
  );
}

export interface SampleLocationPreset {
  label: string;
  state: string;
  district: string;
  locality: string;
  latitude: number;
  longitude: number;
  description: string;
}

export const SAMPLE_GPS_PRESETS: SampleLocationPreset[] = [
  {
    label: "Hyderabad (Telangana)",
    state: "Telangana",
    district: "Hyderabad",
    locality: "Madhapur",
    latitude: 17.4399,
    longitude: 78.3812,
    description: "Hitec City / Cyberabad tech hub",
  },
  {
    label: "Bengaluru (Karnataka)",
    state: "Karnataka",
    district: "Bengaluru Urban",
    locality: "Koramangala",
    latitude: 12.9352,
    longitude: 77.6245,
    description: "Innovation & Startup Capital",
  },
  {
    label: "Ranchi (Jharkhand)",
    state: "Jharkhand",
    district: "Ranchi",
    locality: "Morabadi",
    latitude: 23.3441,
    longitude: 85.3096,
    description: "Central Administrative Capital of Jharkhand",
  },
  {
    label: "Mumbai (Maharashtra)",
    state: "Maharashtra",
    district: "Mumbai Suburban",
    locality: "Andheri East",
    latitude: 19.1136,
    longitude: 72.8697,
    description: "Financial & Commercial Center",
  },
  {
    label: "New Delhi (Delhi)",
    state: "Delhi",
    district: "New Delhi",
    locality: "Connaught Place",
    latitude: 28.6304,
    longitude: 77.2177,
    description: "National Capital Territory",
  },
  {
    label: "Dhanbad (Jharkhand)",
    state: "Jharkhand",
    district: "Dhanbad",
    locality: "Jharia",
    latitude: 23.7957,
    longitude: 86.4304,
    description: "Eastern Industrial & Energy Region",
  },
];


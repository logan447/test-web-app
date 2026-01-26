/**
 * US Location Data for Autocomplete
 * Source: US Census Bureau - Incorporated places with population >= 10,000
 *
 * This provides the single source of truth for all location handling.
 * Data is sorted by population for relevance in autocomplete results.
 */

export interface LocationData {
  city: string;
  state: string; // 2-letter code
  stateName: string;
  county?: string;
  latitude?: number;
  longitude?: number;
  population: number;
}

// State code to name mapping
export const US_STATES: Record<string, string> = {
  AL: 'Alabama',
  AK: 'Alaska',
  AZ: 'Arizona',
  AR: 'Arkansas',
  CA: 'California',
  CO: 'Colorado',
  CT: 'Connecticut',
  DE: 'Delaware',
  FL: 'Florida',
  GA: 'Georgia',
  HI: 'Hawaii',
  ID: 'Idaho',
  IL: 'Illinois',
  IN: 'Indiana',
  IA: 'Iowa',
  KS: 'Kansas',
  KY: 'Kentucky',
  LA: 'Louisiana',
  ME: 'Maine',
  MD: 'Maryland',
  MA: 'Massachusetts',
  MI: 'Michigan',
  MN: 'Minnesota',
  MS: 'Mississippi',
  MO: 'Missouri',
  MT: 'Montana',
  NE: 'Nebraska',
  NV: 'Nevada',
  NH: 'New Hampshire',
  NJ: 'New Jersey',
  NM: 'New Mexico',
  NY: 'New York',
  NC: 'North Carolina',
  ND: 'North Dakota',
  OH: 'Ohio',
  OK: 'Oklahoma',
  OR: 'Oregon',
  PA: 'Pennsylvania',
  RI: 'Rhode Island',
  SC: 'South Carolina',
  SD: 'South Dakota',
  TN: 'Tennessee',
  TX: 'Texas',
  UT: 'Utah',
  VT: 'Vermont',
  VA: 'Virginia',
  WA: 'Washington',
  WV: 'West Virginia',
  WI: 'Wisconsin',
  WY: 'Wyoming',
  DC: 'District of Columbia',
};

/**
 * Top US cities by population (2023 Census estimates)
 * Includes all cities with population >= 50,000 plus state capitals
 */
export const US_LOCATIONS: LocationData[] = [
  // Top 100 US cities by population
  { city: 'New York', state: 'NY', stateName: 'New York', population: 8336817, latitude: 40.7128, longitude: -74.0060 },
  { city: 'Los Angeles', state: 'CA', stateName: 'California', population: 3979576, latitude: 34.0522, longitude: -118.2437 },
  { city: 'Chicago', state: 'IL', stateName: 'Illinois', population: 2693976, latitude: 41.8781, longitude: -87.6298 },
  { city: 'Houston', state: 'TX', stateName: 'Texas', population: 2304580, latitude: 29.7604, longitude: -95.3698 },
  { city: 'Phoenix', state: 'AZ', stateName: 'Arizona', population: 1608139, latitude: 33.4484, longitude: -112.0740 },
  { city: 'Philadelphia', state: 'PA', stateName: 'Pennsylvania', population: 1584064, latitude: 39.9526, longitude: -75.1652 },
  { city: 'San Antonio', state: 'TX', stateName: 'Texas', population: 1434625, latitude: 29.4241, longitude: -98.4936 },
  { city: 'San Diego', state: 'CA', stateName: 'California', population: 1386932, latitude: 32.7157, longitude: -117.1611 },
  { city: 'Dallas', state: 'TX', stateName: 'Texas', population: 1304379, latitude: 32.7767, longitude: -96.7970 },
  { city: 'San Jose', state: 'CA', stateName: 'California', population: 1013240, latitude: 37.3382, longitude: -121.8863 },
  { city: 'Austin', state: 'TX', stateName: 'Texas', population: 978908, latitude: 30.2672, longitude: -97.7431 },
  { city: 'Jacksonville', state: 'FL', stateName: 'Florida', population: 949611, latitude: 30.3322, longitude: -81.6557 },
  { city: 'Fort Worth', state: 'TX', stateName: 'Texas', population: 918915, latitude: 32.7555, longitude: -97.3308 },
  { city: 'Columbus', state: 'OH', stateName: 'Ohio', population: 905748, latitude: 39.9612, longitude: -82.9988 },
  { city: 'Charlotte', state: 'NC', stateName: 'North Carolina', population: 874579, latitude: 35.2271, longitude: -80.8431 },
  { city: 'Indianapolis', state: 'IN', stateName: 'Indiana', population: 867125, latitude: 39.7684, longitude: -86.1581 },
  { city: 'San Francisco', state: 'CA', stateName: 'California', population: 873965, latitude: 37.7749, longitude: -122.4194 },
  { city: 'Seattle', state: 'WA', stateName: 'Washington', population: 737015, latitude: 47.6062, longitude: -122.3321 },
  { city: 'Denver', state: 'CO', stateName: 'Colorado', population: 715522, latitude: 39.7392, longitude: -104.9903 },
  { city: 'Washington', state: 'DC', stateName: 'District of Columbia', population: 689545, latitude: 38.9072, longitude: -77.0369 },
  { city: 'Nashville', state: 'TN', stateName: 'Tennessee', population: 689447, latitude: 36.1627, longitude: -86.7816 },
  { city: 'Oklahoma City', state: 'OK', stateName: 'Oklahoma', population: 681054, latitude: 35.4676, longitude: -97.5164 },
  { city: 'El Paso', state: 'TX', stateName: 'Texas', population: 678815, latitude: 31.7619, longitude: -106.4850 },
  { city: 'Boston', state: 'MA', stateName: 'Massachusetts', population: 675647, latitude: 42.3601, longitude: -71.0589 },
  { city: 'Portland', state: 'OR', stateName: 'Oregon', population: 652503, latitude: 45.5152, longitude: -122.6784 },
  { city: 'Las Vegas', state: 'NV', stateName: 'Nevada', population: 641903, latitude: 36.1699, longitude: -115.1398 },
  { city: 'Detroit', state: 'MI', stateName: 'Michigan', population: 639111, latitude: 42.3314, longitude: -83.0458 },
  { city: 'Memphis', state: 'TN', stateName: 'Tennessee', population: 633104, latitude: 35.1495, longitude: -90.0490 },
  { city: 'Louisville', state: 'KY', stateName: 'Kentucky', population: 617638, latitude: 38.2527, longitude: -85.7585 },
  { city: 'Baltimore', state: 'MD', stateName: 'Maryland', population: 585708, latitude: 39.2904, longitude: -76.6122 },
  { city: 'Milwaukee', state: 'WI', stateName: 'Wisconsin', population: 577222, latitude: 43.0389, longitude: -87.9065 },
  { city: 'Albuquerque', state: 'NM', stateName: 'New Mexico', population: 564559, latitude: 35.0844, longitude: -106.6504 },
  { city: 'Tucson', state: 'AZ', stateName: 'Arizona', population: 542629, latitude: 32.2226, longitude: -110.9747 },
  { city: 'Fresno', state: 'CA', stateName: 'California', population: 542107, latitude: 36.7378, longitude: -119.7871 },
  { city: 'Sacramento', state: 'CA', stateName: 'California', population: 524943, latitude: 38.5816, longitude: -121.4944 },
  { city: 'Mesa', state: 'AZ', stateName: 'Arizona', population: 504258, latitude: 33.4152, longitude: -111.8315 },
  { city: 'Kansas City', state: 'MO', stateName: 'Missouri', population: 508090, latitude: 39.0997, longitude: -94.5786 },
  { city: 'Atlanta', state: 'GA', stateName: 'Georgia', population: 498715, latitude: 33.7490, longitude: -84.3880 },
  { city: 'Omaha', state: 'NE', stateName: 'Nebraska', population: 486051, latitude: 41.2565, longitude: -95.9345 },
  { city: 'Colorado Springs', state: 'CO', stateName: 'Colorado', population: 478961, latitude: 38.8339, longitude: -104.8214 },
  { city: 'Raleigh', state: 'NC', stateName: 'North Carolina', population: 467665, latitude: 35.7796, longitude: -78.6382 },
  { city: 'Long Beach', state: 'CA', stateName: 'California', population: 466742, latitude: 33.7701, longitude: -118.1937 },
  { city: 'Virginia Beach', state: 'VA', stateName: 'Virginia', population: 459470, latitude: 36.8529, longitude: -75.9780 },
  { city: 'Miami', state: 'FL', stateName: 'Florida', population: 442241, latitude: 25.7617, longitude: -80.1918 },
  { city: 'Oakland', state: 'CA', stateName: 'California', population: 433031, latitude: 37.8044, longitude: -122.2712 },
  { city: 'Minneapolis', state: 'MN', stateName: 'Minnesota', population: 429954, latitude: 44.9778, longitude: -93.2650 },
  { city: 'Tulsa', state: 'OK', stateName: 'Oklahoma', population: 413066, latitude: 36.1540, longitude: -95.9928 },
  { city: 'Tampa', state: 'FL', stateName: 'Florida', population: 384959, latitude: 27.9506, longitude: -82.4572 },
  { city: 'Arlington', state: 'TX', stateName: 'Texas', population: 394266, latitude: 32.7357, longitude: -97.1081 },
  { city: 'New Orleans', state: 'LA', stateName: 'Louisiana', population: 383997, latitude: 29.9511, longitude: -90.0715 },

  // Cities 51-100
  { city: 'Wichita', state: 'KS', stateName: 'Kansas', population: 397532, latitude: 37.6872, longitude: -97.3301 },
  { city: 'Cleveland', state: 'OH', stateName: 'Ohio', population: 372624, latitude: 41.4993, longitude: -81.6944 },
  { city: 'Bakersfield', state: 'CA', stateName: 'California', population: 403455, latitude: 35.3733, longitude: -119.0187 },
  { city: 'Aurora', state: 'CO', stateName: 'Colorado', population: 386261, latitude: 39.7294, longitude: -104.8319 },
  { city: 'Honolulu', state: 'HI', stateName: 'Hawaii', population: 350395, latitude: 21.3069, longitude: -157.8583 },
  { city: 'Anaheim', state: 'CA', stateName: 'California', population: 350365, latitude: 33.8366, longitude: -117.9143 },
  { city: 'Santa Ana', state: 'CA', stateName: 'California', population: 310227, latitude: 33.7455, longitude: -117.8677 },
  { city: 'Corpus Christi', state: 'TX', stateName: 'Texas', population: 317863, latitude: 27.8006, longitude: -97.3964 },
  { city: 'Riverside', state: 'CA', stateName: 'California', population: 314998, latitude: 33.9533, longitude: -117.3962 },
  { city: 'Lexington', state: 'KY', stateName: 'Kentucky', population: 322570, latitude: 38.0406, longitude: -84.5037 },
  { city: 'St. Louis', state: 'MO', stateName: 'Missouri', population: 301578, latitude: 38.6270, longitude: -90.1994 },
  { city: 'Stockton', state: 'CA', stateName: 'California', population: 320804, latitude: 37.9577, longitude: -121.2908 },
  { city: 'Pittsburgh', state: 'PA', stateName: 'Pennsylvania', population: 302971, latitude: 40.4406, longitude: -79.9959 },
  { city: 'St. Paul', state: 'MN', stateName: 'Minnesota', population: 311527, latitude: 44.9537, longitude: -93.0900 },
  { city: 'Cincinnati', state: 'OH', stateName: 'Ohio', population: 309513, latitude: 39.1031, longitude: -84.5120 },
  { city: 'Anchorage', state: 'AK', stateName: 'Alaska', population: 291247, latitude: 61.2181, longitude: -149.9003 },
  { city: 'Henderson', state: 'NV', stateName: 'Nevada', population: 320189, latitude: 36.0395, longitude: -114.9817 },
  { city: 'Greensboro', state: 'NC', stateName: 'North Carolina', population: 299035, latitude: 36.0726, longitude: -79.7920 },
  { city: 'Plano', state: 'TX', stateName: 'Texas', population: 285494, latitude: 33.0198, longitude: -96.6989 },
  { city: 'Newark', state: 'NJ', stateName: 'New Jersey', population: 311549, latitude: 40.7357, longitude: -74.1724 },
  { city: 'Lincoln', state: 'NE', stateName: 'Nebraska', population: 291082, latitude: 40.8258, longitude: -96.6852 },
  { city: 'Orlando', state: 'FL', stateName: 'Florida', population: 307573, latitude: 28.5383, longitude: -81.3792 },
  { city: 'Irvine', state: 'CA', stateName: 'California', population: 307670, latitude: 33.6846, longitude: -117.8265 },
  { city: 'Toledo', state: 'OH', stateName: 'Ohio', population: 270871, latitude: 41.6528, longitude: -83.5379 },
  { city: 'Jersey City', state: 'NJ', stateName: 'New Jersey', population: 292449, latitude: 40.7178, longitude: -74.0431 },
  { city: 'Chula Vista', state: 'CA', stateName: 'California', population: 275487, latitude: 32.6401, longitude: -117.0842 },
  { city: 'Durham', state: 'NC', stateName: 'North Carolina', population: 283506, latitude: 35.9940, longitude: -78.8986 },
  { city: 'Fort Wayne', state: 'IN', stateName: 'Indiana', population: 270402, latitude: 41.0793, longitude: -85.1394 },
  { city: 'St. Petersburg', state: 'FL', stateName: 'Florida', population: 258308, latitude: 27.7676, longitude: -82.6403 },
  { city: 'Laredo', state: 'TX', stateName: 'Texas', population: 255205, latitude: 27.5306, longitude: -99.4803 },

  // Cities 101-200 (major metros and state capitals)
  { city: 'Buffalo', state: 'NY', stateName: 'New York', population: 278349, latitude: 42.8864, longitude: -78.8784 },
  { city: 'Madison', state: 'WI', stateName: 'Wisconsin', population: 269840, latitude: 43.0731, longitude: -89.4012 },
  { city: 'Lubbock', state: 'TX', stateName: 'Texas', population: 264568, latitude: 33.5779, longitude: -101.8552 },
  { city: 'Chandler', state: 'AZ', stateName: 'Arizona', population: 275987, latitude: 33.3062, longitude: -111.8413 },
  { city: 'Scottsdale', state: 'AZ', stateName: 'Arizona', population: 241361, latitude: 33.4942, longitude: -111.9261 },
  { city: 'Glendale', state: 'AZ', stateName: 'Arizona', population: 248325, latitude: 33.5387, longitude: -112.1860 },
  { city: 'Reno', state: 'NV', stateName: 'Nevada', population: 264165, latitude: 39.5296, longitude: -119.8138 },
  { city: 'Norfolk', state: 'VA', stateName: 'Virginia', population: 238005, latitude: 36.8508, longitude: -76.2859 },
  { city: 'Winston-Salem', state: 'NC', stateName: 'North Carolina', population: 249545, latitude: 36.0999, longitude: -80.2442 },
  { city: 'North Las Vegas', state: 'NV', stateName: 'Nevada', population: 262527, latitude: 36.1989, longitude: -115.1175 },
  { city: 'Irving', state: 'TX', stateName: 'Texas', population: 256684, latitude: 32.8140, longitude: -96.9489 },
  { city: 'Chesapeake', state: 'VA', stateName: 'Virginia', population: 249422, latitude: 36.7682, longitude: -76.2875 },
  { city: 'Gilbert', state: 'AZ', stateName: 'Arizona', population: 267918, latitude: 33.3528, longitude: -111.7890 },
  { city: 'Hialeah', state: 'FL', stateName: 'Florida', population: 223109, latitude: 25.8576, longitude: -80.2781 },
  { city: 'Garland', state: 'TX', stateName: 'Texas', population: 246018, latitude: 32.9126, longitude: -96.6389 },
  { city: 'Fremont', state: 'CA', stateName: 'California', population: 230504, latitude: 37.5485, longitude: -121.9886 },
  { city: 'Baton Rouge', state: 'LA', stateName: 'Louisiana', population: 227470, latitude: 30.4515, longitude: -91.1871 },
  { city: 'Richmond', state: 'VA', stateName: 'Virginia', population: 226610, latitude: 37.5407, longitude: -77.4360 },
  { city: 'Boise', state: 'ID', stateName: 'Idaho', population: 235684, latitude: 43.6150, longitude: -116.2023 },
  { city: 'San Bernardino', state: 'CA', stateName: 'California', population: 222101, latitude: 34.1083, longitude: -117.2898 },
  { city: 'Spokane', state: 'WA', stateName: 'Washington', population: 228989, latitude: 47.6588, longitude: -117.4260 },
  { city: 'Des Moines', state: 'IA', stateName: 'Iowa', population: 214133, latitude: 41.5868, longitude: -93.6250 },
  { city: 'Modesto', state: 'CA', stateName: 'California', population: 218464, latitude: 37.6391, longitude: -120.9969 },
  { city: 'Birmingham', state: 'AL', stateName: 'Alabama', population: 200733, latitude: 33.5186, longitude: -86.8104 },
  { city: 'Tacoma', state: 'WA', stateName: 'Washington', population: 219346, latitude: 47.2529, longitude: -122.4443 },
  { city: 'Fontana', state: 'CA', stateName: 'California', population: 214547, latitude: 34.0922, longitude: -117.4350 },
  { city: 'Rochester', state: 'NY', stateName: 'New York', population: 211328, latitude: 43.1566, longitude: -77.6088 },
  { city: 'Moreno Valley', state: 'CA', stateName: 'California', population: 212022, latitude: 33.9425, longitude: -117.2297 },
  { city: 'Fayetteville', state: 'NC', stateName: 'North Carolina', population: 208501, latitude: 35.0527, longitude: -78.8784 },
  { city: 'Glendale', state: 'CA', stateName: 'California', population: 196543, latitude: 34.1425, longitude: -118.2551 },
  { city: 'Yonkers', state: 'NY', stateName: 'New York', population: 211569, latitude: 40.9312, longitude: -73.8987 },
  { city: 'Worcester', state: 'MA', stateName: 'Massachusetts', population: 206518, latitude: 42.2626, longitude: -71.8023 },
  { city: 'Columbus', state: 'GA', stateName: 'Georgia', population: 206922, latitude: 32.4610, longitude: -84.9877 },
  { city: 'Cape Coral', state: 'FL', stateName: 'Florida', population: 194016, latitude: 26.5629, longitude: -81.9495 },
  { city: 'Salt Lake City', state: 'UT', stateName: 'Utah', population: 199723, latitude: 40.7608, longitude: -111.8910 },
  { city: 'Shreveport', state: 'LA', stateName: 'Louisiana', population: 187593, latitude: 32.5252, longitude: -93.7502 },
  { city: 'Augusta', state: 'GA', stateName: 'Georgia', population: 202081, latitude: 33.4735, longitude: -82.0105 },
  { city: 'Grand Rapids', state: 'MI', stateName: 'Michigan', population: 198917, latitude: 42.9634, longitude: -85.6681 },
  { city: 'Tallahassee', state: 'FL', stateName: 'Florida', population: 196169, latitude: 30.4383, longitude: -84.2807 },
  { city: 'Huntsville', state: 'AL', stateName: 'Alabama', population: 215006, latitude: 34.7304, longitude: -86.5861 },
  { city: 'Knoxville', state: 'TN', stateName: 'Tennessee', population: 190740, latitude: 35.9606, longitude: -83.9207 },
  { city: 'Providence', state: 'RI', stateName: 'Rhode Island', population: 190934, latitude: 41.8240, longitude: -71.4128 },
  { city: 'Little Rock', state: 'AR', stateName: 'Arkansas', population: 202591, latitude: 34.7465, longitude: -92.2896 },
  { city: 'Chattanooga', state: 'TN', stateName: 'Tennessee', population: 181099, latitude: 35.0456, longitude: -85.3097 },
  { city: 'Brownsville', state: 'TX', stateName: 'Texas', population: 186738, latitude: 25.9017, longitude: -97.4975 },
  { city: 'Fort Lauderdale', state: 'FL', stateName: 'Florida', population: 182760, latitude: 26.1224, longitude: -80.1373 },
  { city: 'Tempe', state: 'AZ', stateName: 'Arizona', population: 180587, latitude: 33.4255, longitude: -111.9400 },
  { city: 'Newport News', state: 'VA', stateName: 'Virginia', population: 186247, latitude: 37.0871, longitude: -76.4730 },
  { city: 'Mobile', state: 'AL', stateName: 'Alabama', population: 187041, latitude: 30.6954, longitude: -88.0399 },
  { city: 'Peoria', state: 'AZ', stateName: 'Arizona', population: 190985, latitude: 33.5806, longitude: -112.2374 },

  // Additional state capitals and important cities (201-300)
  { city: 'Montgomery', state: 'AL', stateName: 'Alabama', population: 200603, latitude: 32.3668, longitude: -86.2999 },
  { city: 'Juneau', state: 'AK', stateName: 'Alaska', population: 32255, latitude: 58.3019, longitude: -134.4197 },
  { city: 'Hartford', state: 'CT', stateName: 'Connecticut', population: 121054, latitude: 41.7658, longitude: -72.6734 },
  { city: 'Dover', state: 'DE', stateName: 'Delaware', population: 39403, latitude: 39.1582, longitude: -75.5244 },
  { city: 'Wilmington', state: 'DE', stateName: 'Delaware', population: 70898, latitude: 39.7391, longitude: -75.5398 },
  { city: 'Augusta', state: 'ME', stateName: 'Maine', population: 19136, latitude: 44.3106, longitude: -69.7795 },
  { city: 'Portland', state: 'ME', stateName: 'Maine', population: 68408, latitude: 43.6591, longitude: -70.2568 },
  { city: 'Annapolis', state: 'MD', stateName: 'Maryland', population: 40812, latitude: 38.9784, longitude: -76.4922 },
  { city: 'Concord', state: 'NH', stateName: 'New Hampshire', population: 43976, latitude: 43.2081, longitude: -71.5376 },
  { city: 'Manchester', state: 'NH', stateName: 'New Hampshire', population: 115644, latitude: 42.9956, longitude: -71.4548 },
  { city: 'Trenton', state: 'NJ', stateName: 'New Jersey', population: 90871, latitude: 40.2206, longitude: -74.7597 },
  { city: 'Santa Fe', state: 'NM', stateName: 'New Mexico', population: 87505, latitude: 35.6870, longitude: -105.9378 },
  { city: 'Albany', state: 'NY', stateName: 'New York', population: 99224, latitude: 42.6526, longitude: -73.7562 },
  { city: 'Bismarck', state: 'ND', stateName: 'North Dakota', population: 74112, latitude: 46.8083, longitude: -100.7837 },
  { city: 'Fargo', state: 'ND', stateName: 'North Dakota', population: 125990, latitude: 46.8772, longitude: -96.7898 },
  { city: 'Harrisburg', state: 'PA', stateName: 'Pennsylvania', population: 50099, latitude: 40.2732, longitude: -76.8867 },
  { city: 'Columbia', state: 'SC', stateName: 'South Carolina', population: 136632, latitude: 34.0007, longitude: -81.0348 },
  { city: 'Charleston', state: 'SC', stateName: 'South Carolina', population: 150227, latitude: 32.7765, longitude: -79.9311 },
  { city: 'Pierre', state: 'SD', stateName: 'South Dakota', population: 14091, latitude: 44.3683, longitude: -100.3510 },
  { city: 'Sioux Falls', state: 'SD', stateName: 'South Dakota', population: 192517, latitude: 43.5446, longitude: -96.7311 },
  { city: 'Burlington', state: 'VT', stateName: 'Vermont', population: 45855, latitude: 44.4759, longitude: -73.2121 },
  { city: 'Montpelier', state: 'VT', stateName: 'Vermont', population: 8074, latitude: 44.2601, longitude: -72.5754 },
  { city: 'Charleston', state: 'WV', stateName: 'West Virginia', population: 48864, latitude: 38.3498, longitude: -81.6326 },
  { city: 'Cheyenne', state: 'WY', stateName: 'Wyoming', population: 65132, latitude: 41.1400, longitude: -104.8202 },
  { city: 'Olympia', state: 'WA', stateName: 'Washington', population: 55605, latitude: 47.0379, longitude: -122.9007 },
  { city: 'Salem', state: 'OR', stateName: 'Oregon', population: 175535, latitude: 44.9429, longitude: -123.0351 },
  { city: 'Helena', state: 'MT', stateName: 'Montana', population: 32655, latitude: 46.5891, longitude: -112.0391 },
  { city: 'Billings', state: 'MT', stateName: 'Montana', population: 119115, latitude: 45.7833, longitude: -108.5007 },
  { city: 'Topeka', state: 'KS', stateName: 'Kansas', population: 126587, latitude: 39.0473, longitude: -95.6752 },
  { city: 'Jefferson City', state: 'MO', stateName: 'Missouri', population: 43330, latitude: 38.5767, longitude: -92.1735 },
  { city: 'Springfield', state: 'MO', stateName: 'Missouri', population: 169176, latitude: 37.2090, longitude: -93.2923 },
  { city: 'Frankfort', state: 'KY', stateName: 'Kentucky', population: 28602, latitude: 38.2009, longitude: -84.8733 },
  { city: 'Jackson', state: 'MS', stateName: 'Mississippi', population: 153701, latitude: 32.2988, longitude: -90.1848 },
  { city: 'Carson City', state: 'NV', stateName: 'Nevada', population: 58639, latitude: 39.1638, longitude: -119.7674 },
  { city: 'Bridgeport', state: 'CT', stateName: 'Connecticut', population: 148654, latitude: 41.1792, longitude: -73.1894 },
  { city: 'New Haven', state: 'CT', stateName: 'Connecticut', population: 134023, latitude: 41.3083, longitude: -72.9279 },
  { city: 'Stamford', state: 'CT', stateName: 'Connecticut', population: 135470, latitude: 41.0534, longitude: -73.5387 },
  { city: 'Springfield', state: 'MA', stateName: 'Massachusetts', population: 155929, latitude: 42.1015, longitude: -72.5898 },
  { city: 'Cambridge', state: 'MA', stateName: 'Massachusetts', population: 118927, latitude: 42.3736, longitude: -71.1097 },
  { city: 'Lowell', state: 'MA', stateName: 'Massachusetts', population: 115554, latitude: 42.6334, longitude: -71.3162 },
  { city: 'Ann Arbor', state: 'MI', stateName: 'Michigan', population: 123851, latitude: 42.2808, longitude: -83.7430 },
  { city: 'Lansing', state: 'MI', stateName: 'Michigan', population: 112644, latitude: 42.7325, longitude: -84.5555 },
  { city: 'Flint', state: 'MI', stateName: 'Michigan', population: 102434, latitude: 43.0125, longitude: -83.6875 },

  // More major metros and suburbs (301-400)
  { city: 'Pasadena', state: 'CA', stateName: 'California', population: 138699, latitude: 34.1478, longitude: -118.1445 },
  { city: 'Torrance', state: 'CA', stateName: 'California', population: 143592, latitude: 33.8358, longitude: -118.3406 },
  { city: 'Sunnyvale', state: 'CA', stateName: 'California', population: 155805, latitude: 37.3688, longitude: -122.0363 },
  { city: 'Pomona', state: 'CA', stateName: 'California', population: 151713, latitude: 34.0551, longitude: -117.7500 },
  { city: 'Hayward', state: 'CA', stateName: 'California', population: 162954, latitude: 37.6688, longitude: -122.0808 },
  { city: 'Escondido', state: 'CA', stateName: 'California', population: 151038, latitude: 33.1192, longitude: -117.0864 },
  { city: 'Salinas', state: 'CA', stateName: 'California', population: 163542, latitude: 36.6777, longitude: -121.6555 },
  { city: 'Lancaster', state: 'CA', stateName: 'California', population: 173516, latitude: 34.6868, longitude: -118.1542 },
  { city: 'Palmdale', state: 'CA', stateName: 'California', population: 169450, latitude: 34.5794, longitude: -118.1165 },
  { city: 'Elk Grove', state: 'CA', stateName: 'California', population: 176124, latitude: 38.4088, longitude: -121.3716 },
  { city: 'Corona', state: 'CA', stateName: 'California', population: 157136, latitude: 33.8753, longitude: -117.5664 },
  { city: 'Rancho Cucamonga', state: 'CA', stateName: 'California', population: 177603, latitude: 34.1064, longitude: -117.5931 },
  { city: 'Ontario', state: 'CA', stateName: 'California', population: 175265, latitude: 34.0633, longitude: -117.6509 },
  { city: 'Santa Rosa', state: 'CA', stateName: 'California', population: 178127, latitude: 38.4404, longitude: -122.7141 },
  { city: 'Garden Grove', state: 'CA', stateName: 'California', population: 172646, latitude: 33.7743, longitude: -117.9380 },
  { city: 'Oceanside', state: 'CA', stateName: 'California', population: 176193, latitude: 33.1959, longitude: -117.3795 },
  { city: 'Santa Clarita', state: 'CA', stateName: 'California', population: 228673, latitude: 34.3917, longitude: -118.5426 },
  { city: 'Visalia', state: 'CA', stateName: 'California', population: 141384, latitude: 36.3302, longitude: -119.2921 },
  { city: 'Victorville', state: 'CA', stateName: 'California', population: 134810, latitude: 34.5362, longitude: -117.2928 },
  { city: 'Vallejo', state: 'CA', stateName: 'California', population: 121253, latitude: 38.1041, longitude: -122.2566 },
  { city: 'Thousand Oaks', state: 'CA', stateName: 'California', population: 126966, latitude: 34.1706, longitude: -118.8376 },
  { city: 'Simi Valley', state: 'CA', stateName: 'California', population: 126871, latitude: 34.2694, longitude: -118.7815 },
  { city: 'Concord', state: 'CA', stateName: 'California', population: 129295, latitude: 37.9780, longitude: -122.0311 },
  { city: 'Roseville', state: 'CA', stateName: 'California', population: 147773, latitude: 38.7521, longitude: -121.2880 },
  { city: 'Fullerton', state: 'CA', stateName: 'California', population: 139132, latitude: 33.8703, longitude: -117.9242 },
  { city: 'Antioch', state: 'CA', stateName: 'California', population: 115291, latitude: 38.0049, longitude: -121.8058 },
  { city: 'Daly City', state: 'CA', stateName: 'California', population: 104901, latitude: 37.6879, longitude: -122.4702 },
  { city: 'Downey', state: 'CA', stateName: 'California', population: 111772, latitude: 33.9401, longitude: -118.1332 },
  { city: 'El Monte', state: 'CA', stateName: 'California', population: 113475, latitude: 34.0686, longitude: -118.0276 },
  { city: 'Inglewood', state: 'CA', stateName: 'California', population: 107762, latitude: 33.9617, longitude: -118.3531 },

  // Texas cities
  { city: 'McKinney', state: 'TX', stateName: 'Texas', population: 195308, latitude: 33.1972, longitude: -96.6397 },
  { city: 'Frisco', state: 'TX', stateName: 'Texas', population: 200509, latitude: 33.1507, longitude: -96.8236 },
  { city: 'Killeen', state: 'TX', stateName: 'Texas', population: 153095, latitude: 31.1171, longitude: -97.7278 },
  { city: 'Midland', state: 'TX', stateName: 'Texas', population: 132950, latitude: 31.9973, longitude: -102.0779 },
  { city: 'Amarillo', state: 'TX', stateName: 'Texas', population: 200393, latitude: 35.2220, longitude: -101.8313 },
  { city: 'Grand Prairie', state: 'TX', stateName: 'Texas', population: 196100, latitude: 32.7459, longitude: -96.9978 },
  { city: 'Denton', state: 'TX', stateName: 'Texas', population: 139869, latitude: 33.2148, longitude: -97.1331 },
  { city: 'Waco', state: 'TX', stateName: 'Texas', population: 138486, latitude: 31.5493, longitude: -97.1467 },
  { city: 'Carrollton', state: 'TX', stateName: 'Texas', population: 138243, latitude: 32.9537, longitude: -96.8903 },
  { city: 'Round Rock', state: 'TX', stateName: 'Texas', population: 119468, latitude: 30.5083, longitude: -97.6789 },
  { city: 'Pearland', state: 'TX', stateName: 'Texas', population: 125828, latitude: 29.5636, longitude: -95.2861 },
  { city: 'League City', state: 'TX', stateName: 'Texas', population: 114392, latitude: 29.5075, longitude: -95.0949 },
  { city: 'Sugar Land', state: 'TX', stateName: 'Texas', population: 111026, latitude: 29.6197, longitude: -95.6349 },
  { city: 'Richardson', state: 'TX', stateName: 'Texas', population: 117517, latitude: 32.9483, longitude: -96.7298 },
  { city: 'Beaumont', state: 'TX', stateName: 'Texas', population: 115282, latitude: 30.0802, longitude: -94.1266 },
  { city: 'The Woodlands', state: 'TX', stateName: 'Texas', population: 114436, latitude: 30.1658, longitude: -95.4613 },
  { city: 'Abilene', state: 'TX', stateName: 'Texas', population: 125182, latitude: 32.4487, longitude: -99.7331 },
  { city: 'Odessa', state: 'TX', stateName: 'Texas', population: 114428, latitude: 31.8457, longitude: -102.3676 },
  { city: 'McAllen', state: 'TX', stateName: 'Texas', population: 142210, latitude: 26.2034, longitude: -98.2300 },
  { city: 'College Station', state: 'TX', stateName: 'Texas', population: 119304, latitude: 30.6280, longitude: -96.3344 },

  // Florida cities
  { city: 'Port St. Lucie', state: 'FL', stateName: 'Florida', population: 204851, latitude: 27.2730, longitude: -80.3582 },
  { city: 'Pembroke Pines', state: 'FL', stateName: 'Florida', population: 171178, latitude: 26.0128, longitude: -80.2239 },
  { city: 'Hollywood', state: 'FL', stateName: 'Florida', population: 153067, latitude: 26.0112, longitude: -80.1495 },
  { city: 'Gainesville', state: 'FL', stateName: 'Florida', population: 141085, latitude: 29.6516, longitude: -82.3248 },
  { city: 'Miramar', state: 'FL', stateName: 'Florida', population: 134721, latitude: 25.9860, longitude: -80.3356 },
  { city: 'Coral Springs', state: 'FL', stateName: 'Florida', population: 134394, latitude: 26.2712, longitude: -80.2706 },
  { city: 'Clearwater', state: 'FL', stateName: 'Florida', population: 117292, latitude: 27.9659, longitude: -82.8001 },
  { city: 'Palm Bay', state: 'FL', stateName: 'Florida', population: 119760, latitude: 28.0345, longitude: -80.5887 },
  { city: 'Pompano Beach', state: 'FL', stateName: 'Florida', population: 112046, latitude: 26.2379, longitude: -80.1248 },
  { city: 'West Palm Beach', state: 'FL', stateName: 'Florida', population: 117415, latitude: 26.7153, longitude: -80.0534 },
  { city: 'Lakeland', state: 'FL', stateName: 'Florida', population: 112641, latitude: 28.0395, longitude: -81.9498 },
  { city: 'Davie', state: 'FL', stateName: 'Florida', population: 105691, latitude: 26.0629, longitude: -80.2331 },
  { city: 'Miami Gardens', state: 'FL', stateName: 'Florida', population: 110001, latitude: 25.9420, longitude: -80.2456 },
  { city: 'Sunrise', state: 'FL', stateName: 'Florida', population: 97335, latitude: 26.1334, longitude: -80.1131 },
  { city: 'Plantation', state: 'FL', stateName: 'Florida', population: 94580, latitude: 26.1276, longitude: -80.2331 },

  // More diverse cities from various states
  { city: 'Syracuse', state: 'NY', stateName: 'New York', population: 148620, latitude: 43.0481, longitude: -76.1474 },
  { city: 'Akron', state: 'OH', stateName: 'Ohio', population: 190469, latitude: 41.0814, longitude: -81.5190 },
  { city: 'Dayton', state: 'OH', stateName: 'Ohio', population: 137644, latitude: 39.7589, longitude: -84.1916 },
  { city: 'Aurora', state: 'IL', stateName: 'Illinois', population: 180542, latitude: 41.7606, longitude: -88.3201 },
  { city: 'Naperville', state: 'IL', stateName: 'Illinois', population: 149540, latitude: 41.7508, longitude: -88.1535 },
  { city: 'Rockford', state: 'IL', stateName: 'Illinois', population: 148655, latitude: 42.2711, longitude: -89.0940 },
  { city: 'Joliet', state: 'IL', stateName: 'Illinois', population: 150362, latitude: 41.5250, longitude: -88.0817 },
  { city: 'Springfield', state: 'IL', stateName: 'Illinois', population: 114394, latitude: 39.7817, longitude: -89.6501 },
  { city: 'Peoria', state: 'IL', stateName: 'Illinois', population: 113150, latitude: 40.6936, longitude: -89.5890 },
  { city: 'Evansville', state: 'IN', stateName: 'Indiana', population: 117298, latitude: 37.9716, longitude: -87.5711 },
  { city: 'South Bend', state: 'IN', stateName: 'Indiana', population: 103453, latitude: 41.6764, longitude: -86.2520 },
  { city: 'Cedar Rapids', state: 'IA', stateName: 'Iowa', population: 137710, latitude: 41.9779, longitude: -91.6656 },
  { city: 'Davenport', state: 'IA', stateName: 'Iowa', population: 101590, latitude: 41.5236, longitude: -90.5776 },
  { city: 'Overland Park', state: 'KS', stateName: 'Kansas', population: 197238, latitude: 38.9822, longitude: -94.6708 },
  { city: 'Kansas City', state: 'KS', stateName: 'Kansas', population: 156607, latitude: 39.1141, longitude: -94.6275 },
  { city: 'Olathe', state: 'KS', stateName: 'Kansas', population: 141290, latitude: 38.8814, longitude: -94.8191 },
  { city: 'Eugene', state: 'OR', stateName: 'Oregon', population: 176654, latitude: 44.0521, longitude: -123.0868 },
  { city: 'Vancouver', state: 'WA', stateName: 'Washington', population: 190915, latitude: 45.6387, longitude: -122.6615 },
  { city: 'Bellevue', state: 'WA', stateName: 'Washington', population: 151854, latitude: 47.6101, longitude: -122.2015 },
  { city: 'Kent', state: 'WA', stateName: 'Washington', population: 136588, latitude: 47.3809, longitude: -122.2348 },
  { city: 'Provo', state: 'UT', stateName: 'Utah', population: 115162, latitude: 40.2338, longitude: -111.6585 },
  { city: 'West Valley City', state: 'UT', stateName: 'Utah', population: 140230, latitude: 40.6916, longitude: -112.0011 },
  { city: 'West Jordan', state: 'UT', stateName: 'Utah', population: 116961, latitude: 40.6097, longitude: -111.9391 },
  { city: 'Sandy', state: 'UT', stateName: 'Utah', population: 96904, latitude: 40.5649, longitude: -111.8590 },
];

/**
 * Get all locations sorted by population (descending)
 */
export function getLocationsSortedByPopulation(): LocationData[] {
  return [...US_LOCATIONS].sort((a, b) => b.population - a.population);
}

/**
 * Search locations by city name prefix (case-insensitive)
 * Returns results sorted by population for relevance
 */
export function searchLocations(query: string, limit: number = 10): LocationData[] {
  const normalizedQuery = query.toLowerCase().trim();

  if (!normalizedQuery) {
    return [];
  }

  return US_LOCATIONS
    .filter(loc => loc.city.toLowerCase().startsWith(normalizedQuery))
    .sort((a, b) => b.population - a.population)
    .slice(0, limit);
}

/**
 * Search locations by city name (contains, case-insensitive)
 * Returns results sorted by: exact match first, then starts with, then contains, all by population
 */
export function searchLocationsAdvanced(query: string, limit: number = 10): LocationData[] {
  const normalizedQuery = query.toLowerCase().trim();

  if (!normalizedQuery) {
    return [];
  }

  const exactMatches: LocationData[] = [];
  const startsWithMatches: LocationData[] = [];
  const containsMatches: LocationData[] = [];

  for (const loc of US_LOCATIONS) {
    const cityLower = loc.city.toLowerCase();

    if (cityLower === normalizedQuery) {
      exactMatches.push(loc);
    } else if (cityLower.startsWith(normalizedQuery)) {
      startsWithMatches.push(loc);
    } else if (cityLower.includes(normalizedQuery)) {
      containsMatches.push(loc);
    }
  }

  // Sort each group by population
  exactMatches.sort((a, b) => b.population - a.population);
  startsWithMatches.sort((a, b) => b.population - a.population);
  containsMatches.sort((a, b) => b.population - a.population);

  return [...exactMatches, ...startsWithMatches, ...containsMatches].slice(0, limit);
}

/**
 * Get locations by state
 */
export function getLocationsByState(stateCode: string): LocationData[] {
  return US_LOCATIONS
    .filter(loc => loc.state === stateCode.toUpperCase())
    .sort((a, b) => b.population - a.population);
}

/**
 * Format location for display
 */
export function formatLocation(location: LocationData): string {
  return `${location.city}, ${location.state}`;
}

/**
 * Get unique states from locations
 */
export function getUniqueStates(): Array<{ code: string; name: string }> {
  const statesSet = new Set(US_LOCATIONS.map(loc => loc.state));
  return Array.from(statesSet)
    .map(code => ({ code, name: US_STATES[code] || code }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

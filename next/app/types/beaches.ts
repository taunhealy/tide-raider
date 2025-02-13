import type { WindData } from "./wind";

export type { WindData };
export interface SharkIncident {
  hasAttack: boolean;
  incidents?: {
    date: string;
    outcome: "Fatal" | "Non-fatal" | "Unknown";
    details: string;
  }[];
}

// Or if using type instead of interface:

export interface Beach {
  id: string;
  name: string;
  continent: string;
  country: string;
  region: string;
  location: string;
  distanceFromCT: number;
  optimalWindDirections: string[];
  optimalSwellDirections: {
    min: number;
    max: number;
    cardinal?: string;
  };
  sheltered?: boolean; // Made optional with ?
  bestSeasons: string[];
  optimalTide:
    | "Low"
    | "Mid"
    | "High"
    | "All"
    | "Low to Mid"
    | "Mid to High"
    | "unknown";
  description: string;
  difficulty:
    | "Beginner"
    | "Intermediate"
    | "Advanced"
    | "All Levels"
    | "Expert";
  waveType: string;
  swellSize: {
    min: number;
    max: number;
  };
  idealSwellPeriod: {
    min: number;
    max: number;
  };
  waterTemp: {
    summer: number;
    winter: number;
  };
  hazards: string[];
  crimeLevel: "Low" | "Medium" | "High";
  sharkAttack: SharkIncident;
  image: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  videos?: {
    url: string;
    title: string;
    platform: "youtube" | "vimeo";
  }[];
  profileImage?: string;
  advertisingPrice?: number;
  advertising?: {
    pricePerMonth: number;
    maxSlots: number;
    currentAds?: AdSlot[];
  };
  coffeeShop?: {
    url: string;
    name: string;
  }[];
  hasSharkAlert?: boolean;
}

export interface AdSlot {
  id: string;
  imageUrl: string;
  linkUrl: string;
  companyName: string;
  contactEmail: string;
  startDate: string;
  endDate: string;
  status: "active" | "pending" | "rejected";
  rejectionReason?: string;
}

// Beach data array should be declared FIRST
export const beachData: Beach[] = [
  {
    id: "muizenberg-beach",
    name: "Muizenberg Beach",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "False Bay",
    distanceFromCT: 25,
    optimalWindDirections: ["NW", "N", "NE"],
    optimalSwellDirections: {
      min: 225,
      max: 247.5,
    }, // single closing brace for optimalSwellDirections
    bestSeasons: ["winter"], // continue with the rest of the properties
    optimalTide: "All",
    description: "Gentle beach break, perfect for beginners",
    difficulty: "Beginner",
    waveType: "Beach Break",
    swellSize: {
      min: 1.7,
      max: 4.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 24,
    },
    waterTemp: {
      summer: 20,
      winter: 15,
    },
    hazards: ["Rip currents", "Crowds", "Sharks"],
    crimeLevel: "Medium",
    sharkAttack: {
      hasAttack: true,
      incidents: [
        {
          date: "2014-03-29",
          outcome: "Non-fatal",
          details: "Bite to surfboard, surfer unharmed",
        },
        {
          date: "2008-11-15",
          outcome: "Non-fatal",
          details: "Minor injury to surfer's leg",
        },
      ],
    },
    image:
      "https://images.unsplash.com/photo-1576913959343-420023e37b55?q=80&w=2626&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    coordinates: {
      lat: -34.1083,
      lng: 18.4702,
    },
    videos: [
      {
        url: "https://www.youtube.com/watch?v=2uqps13F8WU&ab_channel=021DRONE",
        title: "Surfing Muizenberg",
        platform: "youtube",
      },
    ],
    profileImage: "/images/profile/hero-cover.jpg", // Removed /public prefix
    coffeeShop: [{ url: "Harvest Café, Muizenberg", name: "Harvest Café" }],
  },
  {
    id: "long-beach",
    name: "Long Beach",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Kommetjie",
    distanceFromCT: 40,
    optimalWindDirections: ["SE", "SSE", "ESE", "S"],
    optimalSwellDirections: {
      min: 255,
      max: 285,
      cardinal: "W",
    },
    bestSeasons: ["winter"],
    optimalTide: "All",
    description: "Consistent waves, good for all levels",
    difficulty: "Intermediate",
    waveType: "Beach Break",
    swellSize: {
      min: 1.8,
      max: 5.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 24,
    },
    waterTemp: {
      summer: 18,
      winter: 14,
    },
    hazards: [
      "Strong currents",
      "Crowds",
      "Dangerous shorey",
      "Rocks on the inside",
    ],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image:
      "https://images.unsplash.com/photo-1552842256-2b5a9e2d3659?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGtvbW1ldGppZXxlbnwwfHwwfHx8MA%3D%3D",
    coordinates: {
      lat: -34.1361,
      lng: 18.3278,
    },
    videos: [
      {
        url: "https://www.youtube.com/watch?v=uSNalo_DZpc&pp=ygUcbG9uZyBiZWFjaCBrb21tZXRqaWUgc3VyZmluZw%3D%3D",
        title: "Morning Session",
        platform: "youtube",
      },
      {
        url: "https://www.youtube.com/watch?v=vzNZR3j5G54&ab_channel=taichesselet",
        title: "Pebbles, Long Beach",
        platform: "youtube",
      },
    ],
    coffeeShop: [
      { url: "Good Riddance Coffee Co", name: "Good Riddance Coffee Co." },
    ],
    advertisingPrice: 1000,
  },

  {
    id: "llandudno",
    name: "Llandudno",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Llandudno",
    distanceFromCT: 30,
    optimalWindDirections: ["SE", "E"],
    optimalSwellDirections: {
      min: 225,
      max: 250,
      cardinal: "SW",
    },
    bestSeasons: ["winter"],
    optimalTide: "Low to Mid",
    description:
      "Powerful beach break with multiple peaks along boulder-strewn beach for advanced surfers unless it's small. Main A-frame peak offers hollow right-handers and longer left walls. Best performance on SW swell with SE winds and mid tide. Wave size ranges from 2-12ft, ideal at 4-8ft. Strong currents between peaks - use southern rip for paddle out. Often crowded on good days. Limited parking requires early arrival. Summer afternoons typically blown out by SE winds. No shark attacks reported. Spectacular setting in affluent suburb.",
    difficulty: "Advanced",
    waveType: "Beach Break",
    swellSize: {
      min: 1.5,
      max: 2.5,
    },
    idealSwellPeriod: {
      min: 13,
      max: 24,
    },
    waterTemp: {
      summer: 16,
      winter: 12,
    },
    hazards: ["Strong currents", "powerful waves"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "/images/beaches/td-llands.jpg",
    coordinates: {
      lat: -34.0058,
      lng: 18.3397,
    },
    videos: [
      {
        url: "hhttps://www.youtube.com/watch?v=5uCat78yUzU&pp=ygUObGxhbmR1ZG5vIHN1cmY%3D",
        title: "Jordy Smith | Llanduno",
        platform: "youtube",
      },
      {
        url: "https://www.youtube.com/watch?v=L_3Cl3Ae4oQ&ab_channel=PsychedOut",
        title:
          "A Quick surf at Llandudno: Mikey February, Eli Beukes, Luke Slijpen, Dylan Muhlenburg, Benjy Oliver and more scoring some fun waves at Llandudno ",
        platform: "youtube",
      },
    ],
    coffeeShop: [{ url: "Sentinel Cafe", name: "Sentinel Cafe" }],
    advertisingPrice: 1000,
  },
  {
    id: "big-bay",
    name: "Big Bay",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Bloubergstrand",
    distanceFromCT: 35,
    optimalWindDirections: ["SE", "SSE", "S"],
    optimalSwellDirections: {
      min: 225,
      max: 315,
    },
    bestSeasons: ["winter"],
    optimalTide: "Mid",
    description:
      "Expansive beach break with multiple peaks across 1.5km stretch. Three distinct areas: 'Big Rock' (southern end) offers longer right-handers up to 150m with occasional barrels on bigger swells, 'Middle Peak' provides consistent A-frame waves ideal for intermediate surfers, and 'Kite Beach' (northern end) reserved for kitesurfing. Wave mechanics vary significantly with tide - low tide exposes rock shelf creating hollow, punchy waves especially at Big Rock, while high tide offers fuller, more forgiving walls better for longboarding and beginners. Best performance on 4-6ft SW swell with 12-15 second period and SE-SSE winds under 15 knots. Morning sessions (before 11am) typically glassy with light offshore conditions before the Cape Doctor kicks in. Multiple rip channels between sandbars provide easy paddle-outs but create strong lateral currents - use landmarks to maintain position. Peak hierarchy strictly observed at Big Rock, while beach breaks offer more relaxed vibe. Winter (May-August) brings bigger swells and cleaner conditions with NW winds, while summer offers reliable 2-4ft waves perfect for learning. Shark spotters present during daylight hours. Facilities include showers, toilets, restaurants, and surf shops. Parking can be challenging on weekends - arrive early. Watch for bluebottles in summer months and seal activity near rocks. Wave quality highly dependent on sand movement - banks shift significantly after big storms.",
    difficulty: "Intermediate",
    waveType: "Beach Break",
    swellSize: {
      min: 0.3,
      max: 0.6,
    },
    idealSwellPeriod: {
      min: 12,
      max: 24,
    },
    waterTemp: {
      summer: 18,
      winter: 14,
    },
    hazards: ["Rip currents", "Wind chop", "Kitesurfers"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image:
      "https://images.unsplash.com/photo-1563656157432-67560011e209?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8QmxvdWJlcmdzdHJhbmR8ZW58MHx8MHx8fDA%3D",
    coordinates: {
      lat: -33.7947,
      lng: 18.4553,
    },
    videos: [
      {
        url: "https://www.youtube.com/watch?v=W5IOP63ALvE&ab_channel=CapeTownSurf",
        title: "Big Bay Surf Report - 3 June 2021",
        platform: "youtube",
      },
    ],
    coffeeShop: [{ url: "The Surf Cafe, Big Bay", name: "The Surf Cafe" }],
  },
  {
    id: "dunes",
    name: "Dunes",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Noordhoek",
    distanceFromCT: 40,
    optimalWindDirections: ["ESE", "SE", "E"],
    optimalSwellDirections: {
      min: 225.5,
      max: 275.5,
    },
    bestSeasons: ["winter"],
    optimalTide: "Low",
    description:
      "Fast waves with hollow sections make Dunes in Cape Peninsula a standout surf spot. This fairly exposed beach break delivers consistent surf, with winter being the prime season. Ideal offshore winds blow from the east-southeast, while the best swells roll in from the southwest, often as distant groundswells. The beach break provides both lefts and rights, offering variety for surfers. It's rarely crowded, but caution is advised due to strong and potentially dangerous rips and theft.",
    difficulty: "Advanced",
    waveType: "Beach Break",
    swellSize: {
      min: 2.1,
      max: 5,
    },
    idealSwellPeriod: {
      min: 12,
      max: 24,
    },
    waterTemp: {
      summer: 16,
      winter: 12,
    },
    hazards: [
      "Rip currents",
      "Strong currents",
      "Shallow sandbanks",
      "Sharks",
      "Theft",
    ],
    crimeLevel: "Medium",
    sharkAttack: {
      hasAttack: false,
    },
    image:
      "https://images.unsplash.com/photo-1537045864092-892b7de76421?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bm9vcmRob2VrfGVufDB8fDB8fHww",
    coordinates: {
      lat: -34.1012,
      lng: 18.4987,
    },
    videos: [
      {
        url: "https://www.youtube.com/watch?v=jhb5kM51q2g&ab_channel=Billabong",
        title:
          "The Cape | Billabong Adventure Division: Taj Burrow, Shaun Manners, Jaleesa Vincent and South African charger Matt Bromley test their staying power in this newest Adventure Division strike mission.",
        platform: "youtube",
      },
    ],
    coffeeShop: [
      { url: "Aegir Project Brewery Noordhoek", name: "Aegir Project Brewery" },
    ],
  },
  {
    id: "scarborough",
    name: "Scarborough",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Scarborough",
    distanceFromCT: 35,
    optimalWindDirections: ["SE", "E", "NE"],
    optimalSwellDirections: {
      min: 225,
      max: 315,
    },
    bestSeasons: ["winter"],
    optimalTide: "Mid to High",
    description:
      "Powerful beach break with multiple peaks along 2km stretch. Main peak offers hollow lefts and rights, especially punchy on low tide. Outside bank holds bigger swells, creating long walls and occasional barrels. Best on SW swell with light easterly winds. Morning sessions crucial as wind typically picks up by 11am. Strong rips provide good paddle-out channels but create hazardous currents. Remote location means uncrowded sessions but bring all supplies. Watch for hidden rocks on inside section at low tide.",
    difficulty: "Advanced",
    waveType: "Beach Break",
    swellSize: {
      min: 1.8,
      max: 6,
    },
    idealSwellPeriod: {
      min: 12,
      max: 24,
    },
    waterTemp: {
      summer: 18,
      winter: 14,
    },
    hazards: ["Rip currents", "Strong currents", "Sharks", "Remote location"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1123,
      lng: 18.4876,
    },
    videos: [
      {
        url: "https://www.youtube.com/watch?v=fX_E3_QsHWI&ab_channel=GeoffHautman",
        title: "Scarborough Cape Town Windsurf RAW 2nd Jan 2023 Aerials galore",
        platform: "youtube",
      },
    ],
    coffeeShop: [
      { url: "Whole Earth Cafe & Accommodation", name: "Whole Earth Cafe" },
    ],
  },
  {
    id: "dungeons",
    name: "Dungeons 💀",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Hout Bay",
    distanceFromCT: 40,
    optimalWindDirections: ["SE", "SSE"],
    optimalSwellDirections: {
      min: 157.5,
      max: 247.5,
    },
    bestSeasons: ["winter"],
    optimalTide: "High",
    description:
      "Legendary big wave spot breaking over three distinct reef sections. Outside peak ('The Ridge') starts working at 15ft and holds up to 60ft faces, producing steep drops into massive walls. Middle section ('The Bowl') creates perfect giant barrels, while inside section ('The Finger') offers slightly smaller but still challenging waves. Needs minimum 15ft SW-WSW groundswell with 15+ second period to break properly. SE winds under 15 knots provide best conditions. Deep-water channel allows boat access but extremely challenging paddle-out (30+ minutes) even for elite surfers. Multiple boils and ledges create unpredictable wave behavior - extensive local knowledge essential. Strong currents can sweep surfers kilometers out to sea. Only attempt with proper big wave equipment, safety team, and serious experience. Best during winter months (June-August) when large groundswells are most consistent.",
    difficulty: "Advanced",
    waveType: "Reef Break",
    swellSize: {
      min: 3.5,
      max: 20.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 24,
    },
    waterTemp: {
      summer: 16,
      winter: 12,
    },
    hazards: [
      "Big waves",
      "Strong currents",
      "Sharks",
      "Rocks",
      "Remote location",
    ],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.0576,
      lng: 18.3497,
    },
  },
  {
    id: "hout-bay-harbour-wedge",
    name: "Hout Bay Harbour Wedge",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Hout Bay",
    distanceFromCT: 40,
    optimalWindDirections: ["SE", "SSE"],
    optimalSwellDirections: {
      min: 225,
      max: 240,
    },
    bestSeasons: ["winter"],
    optimalTide: "High",
    description: "Rarely works.",
    difficulty: "Advanced",
    waveType: "Beach Break",
    swellSize: {
      min: 3.2,
      max: 20.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 24,
    },
    waterTemp: {
      summer: 16,
      winter: 12,
    },
    hazards: ["Potential theft."],
    crimeLevel: "Medium",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: 0,
      lng: 0,
    },
  },
  {
    id: "glen-beach",
    name: "Glen Beach",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Camps Bay",
    distanceFromCT: 7,
    optimalWindDirections: ["SE", "SSE", "S"],
    optimalSwellDirections: {
      min: 157.5,
      max: 247.5,
    },
    bestSeasons: ["winter"],
    optimalTide: "Mid",
    description:
      "Wedgy peaks between Camps Bay and Clifton, works best with bigger swells",
    difficulty: "Intermediate",
    waveType: "Beach Break",
    swellSize: {
      min: 0.3,
      max: 0.6,
    },
    idealSwellPeriod: {
      min: 12,
      max: 24,
    },
    waterTemp: {
      summer: 18,
      winter: 14,
    },
    hazards: ["Rip currents", "Rocks", "Wind chop"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image:
      "https://images.unsplash.com/photo-1519941459598-a1588781b56e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2FtcHMlMjBiYXl8ZW58MHx8MHx8fDA%3D",
    coordinates: {
      lat: -33.9397,
      lng: 18.3775,
    },
  },
  {
    id: "kalk-bay-reef",
    name: "Kalk Bay Reef",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Kalk Bay",
    distanceFromCT: 35,
    optimalWindDirections: ["WNW", "NW"], // Simplified to primary optimal wind
    optimalSwellDirections: {
      min: 135,
      max: 165,
      cardinal: "SE", // Keeping the cardinal direction as SE
    },
    bestSeasons: ["winter"],
    optimalTide: "High",
    description:
      "Right-hand reef break that handles size well. Can get very hollow and powerful, especially on bigger swells. Best performance on mid to high tide with SE swell and WNW winds. Wave face heights can range from 3-12ft, with optimal conditions producing fast, barreling sections over shallow reef. Advanced surfers only on bigger days. Rarely breaks with optimal conditions.",
    difficulty: "Advanced",
    waveType: "Reef Break",
    swellSize: {
      min: 1.6,
      max: 4.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 24,
    },
    waterTemp: {
      summer: 16,
      winter: 12,
    },
    hazards: ["Rocks", "Strong currents", "Sharks", "Shallow reef"],
    crimeLevel: "Medium",
    sharkAttack: {
      hasAttack: true,
      incidents: [
        {
          date: "2013-07-14",
          outcome: "Non-fatal",
          details: "Surfer bitten on foot while surfing",
        },
      ],
    },
    image:
      "https://images.unsplash.com/photo-1631733515300-14f788f68e16?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8a2FsayUyMGJheSUyMHJlZWZ8ZW58MHx8MHx8fDA%3D",
    coordinates: {
      lat: -34.1275,
      lng: 18.4486,
    },
    videos: [
      {
        url: "https://www.youtube.com/watch?v=POA2k1wADxA&pp=ygUVa2FsayBiYXkgcmVlZiBzdXJmaW5n",
        title: "Kalk Bay Reef, Cape Town, South Africa",
        platform: "youtube",
      },
    ],
    coffeeShop: [
      { url: "Chardonnay Deli Kalk Bay", name: "Chardonnay Deli Kalk Bay" },
    ],
  },
  {
    id: "crayfish-factory",
    name: "Crayfish Factory",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Witsand",
    distanceFromCT: 30,
    optimalWindDirections: ["SE", "E"],
    optimalSwellDirections: {
      min: 150,
      max: 180,
    },
    bestSeasons: ["winter"],
    optimalTide: "Mid",
    description:
      "Long right-hander that works best on bigger swells, relatively consistent",
    difficulty: "Intermediate",
    waveType: "Point Break",
    swellSize: {
      min: 2.3,
      max: 8.6,
    },
    idealSwellPeriod: {
      min: 12,
      max: 24,
    },
    waterTemp: {
      summer: 18,
      winter: 14,
    },
    hazards: ["Rocks", "Strong currents", "Remote location"],
    crimeLevel: "Medium",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1123,
      lng: 18.4876,
    },
  },
  {
    id: "betty's-bay",
    name: "Betty's Bay",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Betty's Bay",
    distanceFromCT: 95,
    optimalWindDirections: ["W", "NW"],
    optimalSwellDirections: {
      min: 137.5,
      max: 180.5,
      cardinal: "S",
    },
    bestSeasons: ["winter"],
    optimalTide: "Low",
    description:
      "Series of beach and reef breaks along 3km stretch. Main peak ('Die Plaat') offers powerful rights over reef, while beach breaks provide mellower options. Works best on winter SW swells with NW winds. Multiple takeoff zones spread crowds but watch for strong currents between peaks. Deep channels between reefs create strong rips - good for paddle outs but dangerous for inexperienced surfers. Known shark territory, luckily not Great Whites - stay alert and avoid dawn/dusk sessions.",
    difficulty: "Intermediate",
    waveType: "Beach Break",
    swellSize: {
      min: 0.3,
      max: 0.6,
    },
    idealSwellPeriod: {
      min: 12,
      max: 24,
    },
    waterTemp: {
      summer: 18,
      winter: 14,
    },
    hazards: ["Sharks", "Rip currents", "Remote location"],
    crimeLevel: "Medium",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1234,
      lng: 18.4567,
    },
    videos: [
      {
        url: "https://www.youtube.com/watch?v=QEm65Je_5LY&ab_channel=NicoJooste",
        title: "This is why Betty's bay is my favorite place in South Africa!",
        platform: "youtube",
      },
    ],
  },
  {
    id: "pringle-bay",
    name: "Pringle Bay",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Pringle Bay",
    distanceFromCT: 85,
    optimalWindDirections: ["SE", "SSE"],
    optimalSwellDirections: {
      min: 200.5,
      max: 245.5,
      cardinal: "SW",
    },
    bestSeasons: ["sumer"],
    optimalTide: "Mid",
    description:
      "Protected right-hand point break that works best when surrounding spots are too big. Wave wraps around headland creating long, tapering walls perfect for carving. Three main sections depending on size: outside peak (hollow), middle (long walls), inside reform (good for longboarding). Best on mid to high tide with SW swell. Morning offshores typically clean but watch for strong side-shore winds by midday. Rocky bottom requires careful entry point selection.",
    difficulty: "Intermediate",
    waveType: "Beach Break",
    swellSize: {
      min: 1.3,
      max: 3.5,
    },
    idealSwellPeriod: {
      min: 12,
      max: 24,
    },
    waterTemp: {
      summer: 18,
      winter: 14,
    },
    hazards: ["Rip currents", "Strong currents", "Remote location", "Sharks"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1234,
      lng: 18.4567,
    },
    videos: [
      {
        url: "https://www.youtube.com/watch?v=KblHPXpvJmo&ab_channel=WilliamEveleigh",
        title: "Pringle Bay Surf",
        platform: "youtube",
      },
      {
        url: "https://www.youtube.com/watch?v=8Tt3UD9E6Zs&ab_channel=Bodyboarding4Fun",
        title:
          "Bodyboarding 4Fun - Pringle Bay, Offshore and spectacular [4 May 22]",
        platform: "youtube",
      },
    ],
  },
  {
    id: "elands-bay-the-point",
    name: "Elands Bay The Point",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Elands Bay",
    distanceFromCT: 220,
    optimalWindDirections: ["SE", "E", "NE"],
    optimalSwellDirections: {
      min: 225,
      max: 270,
      cardinal: "SW",
    },
    bestSeasons: ["winter"],
    optimalTide: "High",
    description:
      "World-class left-hand point break. Long walls and barrel sections on bigger swells.",
    difficulty: "Advanced",
    waveType: "Point Break",
    swellSize: {
      min: 1.6,
      max: 3.8,
    },
    idealSwellPeriod: {
      min: 12,
      max: 24,
    },
    waterTemp: {
      summer: 16,
      winter: 12,
    },
    hazards: ["Rocks", "Strong currents", "Remote location", "Sharks"],
    crimeLevel: "Medium",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -32.3127,
      lng: 18.3331,
    },
  },
  {
    id: "derdesteen",
    name: "Derdesteen",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Bloubergstrand",
    distanceFromCT: 30,
    optimalWindDirections: ["ENE", "NE", "E"],
    optimalSwellDirections: {
      min: 225,
      max: 270,
      cardinal: "SW",
    },
    bestSeasons: ["winter"],
    optimalTide: "All",
    description:
      "Consistent beach break with multiple peaks. Good for all tides. Popular with locals.",
    difficulty: "Intermediate",
    waveType: "Beach Break",
    swellSize: {
      min: 0.3,
      max: 3.5,
    },
    idealSwellPeriod: {
      min: 12,
      max: 24,
    },
    waterTemp: {
      summer: 18,
      winter: 14,
    },
    hazards: ["Rip currents", "Strong currents", "Wind chop"],
    crimeLevel: "Medium",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1012,
      lng: 18.4987,
    },
  },
  {
    id: "melkbos",
    name: "Melkbos",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Melkbosstrand",
    distanceFromCT: 35,
    optimalWindDirections: ["NE", "E"],
    optimalSwellDirections: {
      min: 195,
      max: 225,
    },
    bestSeasons: ["winter"],
    optimalTide: "Low",
    description:
      "Long beach break with multiple peaks over 3km stretch. Northern end offers better shape with both lefts and rights. Sand bottom creates shifting peaks - scout banks before paddling out. Works well in summer when south spots are blown out. Best on SW swell with SE winds. Waves typically fuller on high tide, punchier on low. Good learner spot on smaller days but can handle size in winter. Strong currents run parallel to beach - stay in front of access point.",
    difficulty: "Beginner",
    waveType: "Beach Break",
    swellSize: {
      min: 0.3,
      max: 3.5,
    },
    idealSwellPeriod: {
      min: 12,
      max: 24,
    },
    waterTemp: {
      summer: 18,
      winter: 14,
    },
    hazards: ["Rip currents", "Wind chop", "Strong currents"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1123,
      lng: 18.4876,
    },
    videos: [
      {
        url: "https://www.youtube.com/watch?v=Vvra_KSQNQc&ab_channel=BirdsEyeViewZA",
        title: "Melkbos Surfing May 2024",
        platform: "youtube",
      },
      {
        url: "https://www.youtube.com/watch?v=JfeDzDN1toM&ab_channel=SimonDowdles",
        title: "Surfing Winter Swell At Melkbosstrand, Cape Town, South Africa",
        platform: "youtube",
      },
      {
        url: "https://www.youtube.com/watch?v=qaZ2xS8x1Xo&ab_channel=DylanKrause",
        title: "Surfing POV / Cape Town Melkbos",
        platform: "youtube",
      },
    ],
  },
  {
    id: "kogel-bay",
    name: "Kogel Bay",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Gordons Bay",
    distanceFromCT: 75,
    optimalWindDirections: ["NW", "W"],
    optimalSwellDirections: {
      min: 225,
      max: 315,
    },
    bestSeasons: ["winter"],
    optimalTide: "Low",
    description:
      "Powerful beach break with multiple peaks along curved bay. 'Caves' section offers hollow rights, while beach breaks provide both lefts and rights. Wave quality highly dependent on sandbank conditions. Best on SW swell with NW winds. Deep water behind breaks creates strong currents - use rip channels for paddle out but stay alert. Notorious shark territory - spotters often present but exercise caution. Early morning sessions recommended before winds increase.",
    difficulty: "Advanced",
    waveType: "Beach Break",
    swellSize: {
      min: 0.6,
      max: 3.5,
    },
    idealSwellPeriod: {
      min: 12,
      max: 24,
    },
    waterTemp: {
      summer: 16,
      winter: 12,
    },
    hazards: ["Sharks", "Strong currents", "Rip currents", "Remote location"],
    crimeLevel: "Medium",
    sharkAttack: {
      hasAttack: true,
      incidents: [
        {
          date: "2013-04-19",
          outcome: "Fatal",
          details:
            "David Lilienfeld (20) was attacked while bodyboarding at Caves section. Fatal attack by ~15ft great white",
        },
      ],
    },
    image: "",
    coordinates: {
      lat: -34.1012,
      lng: 18.4987,
    },
  },
  {
    id: "strand",
    name: "Strand",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Strand",
    distanceFromCT: 50,
    optimalWindDirections: ["W", "NW"],
    optimalSwellDirections: {
      min: 225,
      max: 315,
    },
    bestSeasons: ["winter"],
    optimalTide: "Low",
    description:
      "Long beach with multiple peaks. Protected from summer SE winds. Good for learners.",
    difficulty: "Beginner",
    waveType: "Beach Break",
    swellSize: {
      min: 0.3,
      max: 3.5,
    },
    idealSwellPeriod: {
      min: 12,
      max: 24,
    },
    waterTemp: {
      summer: 18,
      winter: 14,
    },
    hazards: ["Rip currents", "Wind chop", "Crowds"],
    crimeLevel: "Medium",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1123,
      lng: 18.4876,
    },
  },
  {
    id: "langebaan",
    name: "Langebaan",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Langebaan",
    distanceFromCT: 120,
    optimalWindDirections: ["S", "SW"],
    optimalSwellDirections: {
      min: 285, // WNW
      max: 300, // WNW
      cardinal: "WNW", // More precise single direction
    },
    bestSeasons: ["winter"],
    optimalTide: "Low",
    description:
      "Lagoon waves, perfect for beginners. Only works on big WNW swells pushing into the lagoon.",
    difficulty: "Beginner",
    waveType: "Beach Break",
    swellSize: {
      min: 2.8,
      max: 3.5,
    },
    idealSwellPeriod: {
      min: 12,
      max: 24,
    },
    waterTemp: {
      summer: 18,
      winter: 14,
    },
    hazards: ["Wind chop", "Kitesurfers", "Shallow sandbanks"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1012,
      lng: 18.4987,
    },
  },
  {
    id: "bruce's-beauties",
    name: "Bruce's Beauties",
    continent: "Africa",
    country: "South Africa",
    region: "Eastern Cape",
    location: "Cape St Francis",
    distanceFromCT: 750,
    optimalWindDirections: ["ESE"],
    optimalSwellDirections: {
      min: 100,
      max: 120,
      cardinal: "E",
    },
    bestSeasons: ["winter"],
    optimalTide: "Low",
    description:
      "Legendary point break with multiple sections: 'The Cauldron', 'The Bowl', 'The Tubes', and 'The Wall'. Best performance on ESE swell with low tide. Wave quality varies by section - 'The Cauldron' offers fast, hollow barrels, 'The Bowl' provides long walls, 'The Tubes' offers mellow sections, and 'The Wall' offers powerful, long rights. Rarely breaks with optimal conditions. Remote location means uncrowded sessions but bring all supplies. Watch for hidden rocks and strong currents.",
    difficulty: "Advanced",
    waveType: "Point Break",
    swellSize: {
      min: 1.2,
      max: 4.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 24,
    },
    waterTemp: {
      summer: 22,
      winter: 18,
    },
    hazards: ["Rocks", "Strong currents", "Remote location", "Sharks"],
    crimeLevel: "Medium",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.0507,
      lng: 24.9281,
    },
  },
  {
    id: "seal-point",
    name: "Seal Point",
    continent: "Africa",
    country: "South Africa",
    region: "Eastern Cape",
    location: "Cape St Francis",
    distanceFromCT: 750,
    optimalWindDirections: ["NW"],
    optimalSwellDirections: {
      min: 135, // Changed from 200 to 135 (SE)
      max: 180, // Changed from 220 to 180 (S)
      cardinal: "S/SE", // Changed from "SSW" to "S/SE"
    },
    bestSeasons: ["winter"],
    optimalTide: "Low",
    description:
      "Consistent point break with multiple sections: 'The Cove', 'The Bowl', 'The Tubes', and 'The Wall'. Best performance on SSE swell with low tide. Wave quality varies by section - 'The Cove' offers fast, hollow barrels, 'The Bowl' provides long walls, 'The Tubes' offers mellow sections, and 'The Wall' offers powerful, long rights. Year-round reliability. Watch for strong currents and hidden rocks.",
    difficulty: "Advanced",
    waveType: "Point Break",
    swellSize: {
      min: 1.2,
      max: 4.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 24,
    },
    waterTemp: {
      summer: 22,
      winter: 18,
    },
    hazards: ["Rocks", "Strong currents", "Sharks"],
    crimeLevel: "Medium",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.0507,
      lng: 24.9281,
    },
  },
  {
    id: "clapton's-coils",
    name: "Clapton's Coils",
    continent: "Africa",
    country: "South Africa",
    region: "Eastern Cape",
    location: "Eastern Cape (South)",
    distanceFromCT: 750,
    optimalWindDirections: ["NW"],
    optimalSwellDirections: {
      min: 90,
      max: 110,
      cardinal: "E",
    },
    bestSeasons: ["winter"],
    optimalTide: "Low",
    description:
      "Quality point break with multiple sections: 'The Cove', 'The Bowl', 'The Tubes', and 'The Wall'. Best performance on E swell with low tide. Wave quality varies by section - 'The Cove' offers fast, hollow barrels, 'The Bowl' provides long walls, 'The Tubes' offers mellow sections, and 'The Wall' offers powerful, long rights. Inconsistent but high-quality waves. Watch for strong currents and hidden rocks.",
    difficulty: "Advanced",
    waveType: "Point Break",
    swellSize: {
      min: 1.2,
      max: 4.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 24,
    },
    waterTemp: {
      summer: 22,
      winter: 18,
    },
    hazards: ["Rocks", "Strong currents", "Sharks"],
    crimeLevel: "Medium",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.0507,
      lng: 24.9281,
    },
  },
  {
    id: "jeffreys-bay",
    name: "Jeffreys Bay",
    continent: "Africa",
    country: "South Africa",
    region: "Eastern Cape",
    location: "Jeffreys Bay",
    distanceFromCT: 750,
    optimalWindDirections: ["WNW", "W", "NW"], // Added WNW as primary optimal wind
    optimalSwellDirections: {
      min: 220, // S
      max: 240, // SSW
      cardinal: "S", // Updated to South as primary direction
    },
    bestSeasons: ["winter"],
    optimalTide: "Low to Mid",
    description:
      "World-class right-hand point break consisting of several sections: Kitchen Windows, Magnatubes, Boneyards, Supertubes, Impossibles, and Point. Supertubes section considered one of the best waves globally, offering perfect barrels over reef. Wave quality varies by section - Supertubes most hollow and fast, Point more manageable. Best performance on 4-8ft south swell with WNW winds. Handles all sizes while maintaining shape. Strong currents between sections require good fitness. Extremely competitive lineup - strict priority system observed. Winter brings consistent groundswells and optimal winds. Popular international destination - expect crowds during peak season.",
    difficulty: "Advanced",
    waveType: "Point Break",
    swellSize: {
      min: 1.5,
      max: 3,
    },
    idealSwellPeriod: {
      min: 14,
      max: 18,
    },
    waterTemp: {
      summer: 22,
      winter: 18,
    },
    hazards: ["Rocks", "Strong currents", "Crowds", "Sharks"],
    crimeLevel: "Medium",
    sharkAttack: {
      hasAttack: true,
      incidents: [
        {
          date: "2013-10-11",
          outcome: "Fatal",
          details:
            "Burgert van der Westhuizen (74) attacked while swimming at Lower Point",
        },
        {
          date: "2015-07-01",
          outcome: "Non-fatal",
          details:
            "Mick Fanning attacked during J-Bay Open final, escaped unharmed",
        },
        {
          date: "2024-05-03",
          outcome: "Non-fatal",
          details:
            "2024: A surfer was bitten but survived at Jeffrey's Bay, a popular surfing location in the Eastern Cape ",
        },
      ],
    },
    image: "/images/beaches/td-jbay.jpg",
    coordinates: {
      lat: -34.0507,
      lng: 24.9281,
    },
    videos: [
      {
        url: "https://www.youtube.com/watch?v=DcsMk4NYAkY&pp=ygURamVmZnJleXMgYmF5IHN1cmY%3D",
        title: "J-Bay's Surfer Boat Rides Supertubes. Rider: Oliver Tonkin",
        platform: "youtube",
      },
      {
        url: "https://www.youtube.com/watch?v=RrgWj1uYyhE&ab_channel=Surfline",
        title: "Visiting Pros and Locals Score Best Jeffrey's Bay in Years!",
        platform: "youtube",
      },
      {
        url: "https://www.youtube.com/watch?v=Kw8G7qugOJk&ab_channel=NextOffshoreAdventure",
        title: "J BAY XXXL SWELL TOUCHDOWN !! ITS FIRING!!",
        platform: "youtube",
      },
    ],
  },
  {
    id: "witsand",
    name: "Witsand",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Kommetjie",
    distanceFromCT: 30,
    optimalWindDirections: ["N", "NE"],
    optimalSwellDirections: {
      min: 220,
      max: 247.5,
      cardinal: "SW",
    },
    bestSeasons: ["winter"],
    optimalTide: "All",
    description:
      "Consistent beach break offering multiple peaks across 1km stretch. Main peak provides powerful A-frames with both left and right options up to 100m long. Wave shape varies significantly with tide - steeper on low, more forgiving on high. Best performance on 4-6ft SW swell with SE winds under 15 knots. Morning sessions typically offer cleanest conditions before thermal winds increase. Multiple rip channels between sandbars aid paddle-outs but create strong currents - maintain position using land markers. Winter brings bigger swells and better winds, while summer offers reliable smaller waves. Popular local spot - respect peak hierarchy especially on good days. Limited parking near beach access. Watch for exposed rocks at low tide on southern end. Strong currents can develop with outgoing tide.",
    difficulty: "Intermediate",
    waveType: "Beach Break",
    swellSize: {
      min: 1.4,
      max: 4.5,
    },
    idealSwellPeriod: {
      min: 12,
      max: 24,
    },
    waterTemp: {
      summer: 18,
      winter: 14,
    },
    hazards: ["Rip currents", "Wind chop", "Strong currents"],
    crimeLevel: "Medium",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1234,
      lng: 18.4567,
    },
    videos: [
      {
        url: "https://www.youtube.com/watch?v=XdDFfXcaCGU&pp=ygUNd2l0c2FuZHMgc3VyZg%3D%3D",
        title: "Witsands Surf....a wintery dip",
        platform: "youtube",
      },
    ],
  },
  {
    id: "hermanus",
    name: "Hermanus",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Hermanus",
    distanceFromCT: 120,
    optimalWindDirections: ["NW", "W"],
    optimalSwellDirections: {
      min: 225,
      max: 315,
    },
    bestSeasons: ["winter"],
    optimalTide: "Low",
    description:
      "Several spots including reef and beach breaks. Best during winter months.",
    difficulty: "Intermediate",
    waveType: "Beach Break",
    swellSize: {
      min: 0.3,
      max: 3.5,
    },
    idealSwellPeriod: {
      min: 12,
      max: 24,
    },
    waterTemp: {
      summer: 18,
      winter: 14,
    },
    hazards: ["Sharks", "Rocks", "Strong currents"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1123,
      lng: 18.4876,
    },
  },
  {
    id: "sandy-bay",
    name: "Sandy Bay （人 人）",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Cape Peninsula",
    distanceFromCT: 25,
    optimalWindDirections: ["SE"],
    optimalSwellDirections: {
      min: 225,
      max: 270,
      cardinal: "SW to W",
    },
    bestSeasons: ["winter"],
    optimalTide: "Low to Mid",
    description:
      "Powerful beach break known for its punchy shore break barrels. Multiple peaks offer waves that break for up to 50 meters over sand bottom. Wave quality varies from hollow barrels to more manageable shoulders depending on swell size and sand configuration. Consistent (7/10) with moderate crowds during prime conditions (5/10). Best performance in SE winds with SW to W swells. Watch for strong rips and sudden size increases during large swells.",
    difficulty: "All Levels",
    waveType: "Beach Break",
    swellSize: {
      min: 2.2,
      max: 6,
    },
    idealSwellPeriod: {
      min: 12,
      max: 18,
    },
    waterTemp: {
      summer: 16,
      winter: 12,
    },
    hazards: ["Rip currents", "Shore break", "Remote location"],
    crimeLevel: "Medium",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1012,
      lng: 18.4987,
    },
  },
  {
    id: "outer-kom",
    name: "Outer Kom",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Kommetjie",
    distanceFromCT: 40,
    optimalWindDirections: ["NE"],
    optimalSwellDirections: {
      min: 260.5,
      max: 280.5,
    },
    bestSeasons: ["winter"],
    optimalTide: "High",
    description:
      "Powerful right-hand reef break with three distinct sections over 300m ride. Outside peak ('The Bowl') offers steep drops and critical barrel sections, middle ('The Wall') provides powerful canvas for turns, while inside ('The Run') offers softer reform for finish. Needs minimum 4ft to start working, handles up to 15ft. Best on SE-ESE winds with SW swell and 12-15 second period. 15-20 minute paddle out through channel - good fitness essential. Deep water channel on outside but extremely shallow reef on takeoff zone and inside sections. Local knowledge crucial for safe navigation and wave selection. Strong localism - respect peak hierarchy. Best early morning before onshore flow develops. Winter brings consistent groundswells but also more cleanup sets. Summer sessions possible on bigger swells but typically inconsistent. Serious wave for experienced surfers only - heavy consequences for mistakes.",
    difficulty: "Advanced",
    waveType: "Reef Break",
    swellSize: {
      min: 1.5,
      max: 3,
    },
    idealSwellPeriod: {
      min: 12,
      max: 24,
    },
    waterTemp: {
      summer: 16,
      winter: 12,
    },
    hazards: ["Rocks", "Strong currents", "Big waves", "Sharks"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1123,
      lng: 18.4876,
    },
  },
  {
    id: "inner-kom",
    name: "Inner Kom",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Kommetjie",
    distanceFromCT: 40,
    optimalWindDirections: ["ESE"], // Corrected to East-southeast
    optimalSwellDirections: {
      min: 270, // W
      max: 270, // W
      cardinal: "W",
    },
    bestSeasons: ["winter"],
    optimalTide: "High",
    description:
      "Left-point break characterized by boulders on the bottom, offering fun waves primarily at high tide during rising tide conditions. Located within a 5-minute walk from parking. Can handle decent-sized swells and popular among experienced surfers. While generally consistent, wave quality varies. Gets crowded, especially on weekends with seasoned local surfers. Watch for strengthening rips away from the harbor and be prepared for rogue sets. Rewards those who can read the often shifting conditions. Works best with west swell and ESE winds.",
    difficulty: "Intermediate",
    waveType: "Point Break",
    swellSize: {
      min: 0.6,
      max: 3.0, // Was 2.0
    },
    idealSwellPeriod: {
      min: 12,
      max: 18,
    },
    waterTemp: {
      summer: 16,
      winter: 13,
    },
    hazards: ["Rocks", "Rip currents", "Rogue sets", "Crowds"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    sheltered: true,
    image: "",
    coordinates: {
      lat: -34.1012,
      lng: 18.4987,
    },
    videos: [
      {
        url: "https://www.youtube.com/watch?v=AO0z4J5WSmA&ab_channel=LiseWessels",
        title: "BEST SURF SPOTS | POWER HOUR",
        platform: "youtube",
      },
      {
        url: "https://www.youtube.com/watch?v=7wxGPK_AL30&ab_channel=TristanLock",
        title: "BEST SURF SPOTS | POWER HOUR",
        platform: "youtube",
      },
      {
        url: "https://www.youtube.com/watch?v=NOxjaX9-j3o&ab_channel=cape%7Cdoctor",
        title: "BEST SURF SPOTS | POWER HOUR",
        platform: "youtube",
      },
    ],
  },
  {
    id: "noordhoek",
    name: "Noordhoek",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Noordhoek",
    distanceFromCT: 30,
    optimalWindDirections: ["SE"],
    optimalSwellDirections: {
      min: 225.5,
      max: 275.5,
    },
    bestSeasons: ["winter"],
    optimalTide: "Low",
    description:
      "Long beach with multiple peaks. Best on bigger swells. Watch out for rips.",
    difficulty: "Intermediate",
    waveType: "Beach Break",
    swellSize: {
      min: 2.2,
      max: 4.0, // Was 4.0 - accurate
    },
    idealSwellPeriod: {
      min: 12,
      max: 24,
    },
    waterTemp: {
      summer: 18,
      winter: 14,
    },
    hazards: ["Rip currents", "Strong currents", "Remote location", "Sharks"],
    crimeLevel: "Medium",
    sharkAttack: {
      hasAttack: true,
      incidents: [
        {
          date: "2009-01-15",
          outcome: "Non-fatal",
          details: "Surfer sustained minor injuries",
        },
      ],
    },
    image: "",
    coordinates: {
      lat: -34.1012,
      lng: 18.4987,
    },
    videos: [
      {
        url: "https://www.youtube.com/watch?v=Q8NjWeBXrAU&ab_channel=Let%27sGoSakhubuntu%21",
        title: "POV WEDGE SURFING NOORDHOEK CAPE TOWN (3-4FT) / EP4",
        platform: "youtube",
      },
      {
        url: "https://youtu.be/vjSgpkuZbY8",
        title: "POV CRYSTAL clear cape town beach break (SURFING)",
        platform: "youtube",
      },
    ],
  },
  {
    id: "clovelly",
    name: "Clovelly",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Clovelly",
    distanceFromCT: 35,
    optimalWindDirections: ["NW", "W"],
    optimalSwellDirections: {
      min: 90,
      max: 120,
    },
    bestSeasons: ["winter"],
    optimalTide: "Low",
    description:
      "Right-hand point break in False Bay. Works best in winter with NW winds.",
    difficulty: "Intermediate",
    waveType: "Point Break",
    swellSize: {
      min: 1.3,
      max: 3.0, // Was 0.6
    },
    idealSwellPeriod: {
      min: 12,
      max: 24,
    },
    waterTemp: {
      summer: 18,
      winter: 14,
    },
    hazards: ["Rocks", "Rip currents", "Wind chop"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: true,
      incidents: [
        {
          date: "2004-09-13",
          outcome: "Fatal",
          details: "Fatal attack on spearfisherman",
        },
      ],
    },
    image: "",
    coordinates: {
      lat: -34.1123,
      lng: 18.4876,
    },
    videos: [
      {
        url: "https://www.youtube.com/watch?v=EtuL36D_2lY&ab_channel=RobbiePOV",
        title: "RAW BODYBOARD POV: MICROWEDGE",
        platform: "youtube",
      },
    ],
  },

  {
    id: "misty-cliffs",
    name: "Misty Cliffs",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Misty Cliffs",
    distanceFromCT: 30,
    optimalWindDirections: ["NE", "E"],
    optimalSwellDirections: {
      min: 150,
      max: 190,
    },
    bestSeasons: ["winter"],
    optimalTide: "Low to Mid",
    description:
      "Best at low to mid tide. Strong currents. Theft area, be careful.",
    difficulty: "Advanced",
    waveType: "Beach Break",
    swellSize: {
      min: 1.1,
      max: 3.0, // Was 0.6
    },
    idealSwellPeriod: {
      min: 12,
      max: 24,
    },
    waterTemp: {
      summer: 16,
      winter: 12,
    },
    hazards: ["Strong currents", "Rocks", "Remote location", "Sharks"],
    crimeLevel: "Medium",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1012,
      lng: 18.4987,
    },
    videos: [
      {
        url: "https://www.youtube.com/watch?v=xYZPvEYotgM&ab_channel=Taun",
        title: "MISTY CLIFFS SURFING | Jono Leader",
        platform: "youtube",
      },
      {
        url: "https://www.youtube.com/watch?v=rVfEISz30yw&pp=ygUUbWlzdHkgY2xpZmZzIHN1cmZpbmc%3D&ab_channel=Taun",
        title: "Best surf spots. Cape Town - Misty's 2020 03 21",
        platform: "youtube",
      },
    ],
  },
  {
    id: "buffels-bay",
    name: "Buffels Bay",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Cape Point",
    distanceFromCT: 35,
    optimalWindDirections: ["NW", "W"],
    optimalSwellDirections: {
      min: 225,
      max: 315,
    },
    bestSeasons: ["winter"],
    optimalTide: "Low",
    description:
      "Protected bay with gentle waves. Good for beginners and longboarding.",
    difficulty: "Beginner",
    waveType: "Beach Break",
    swellSize: {
      min: 0.3,
      max: 3.5,
    },
    idealSwellPeriod: {
      min: 12,
      max: 24,
    },
    waterTemp: {
      summer: 18,
      winter: 14,
    },
    hazards: ["Rip currents", "Rocks", "Remote location"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1123,
      lng: 18.4876,
    },
  },
  {
    id: "hawston",
    name: "Hawston 💀🔫",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Hawston",
    distanceFromCT: 35,
    optimalWindDirections: ["NW", "W"],
    optimalSwellDirections: {
      min: 225,
      max: 315,
    },
    bestSeasons: ["winter"],
    optimalTide: "Low",
    description:
      "Powerful reef break near Hermanus. Works best in winter swells. High crime risk area.",
    difficulty: "Advanced",
    waveType: "Reef Break",
    swellSize: {
      min: 1.5,
      max: 3,
    },
    idealSwellPeriod: {
      min: 12,
      max: 24,
    },
    waterTemp: {
      summer: 16,
      winter: 12,
    },
    hazards: ["Rocks", "Strong currents", "Sharks", "Remote location"],
    crimeLevel: "High",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1123,
      lng: 18.4876,
    },
  },
  {
    id: "yzerfontein",
    name: "Yzerfontein",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "West Coast",
    distanceFromCT: 30,
    optimalWindDirections: ["E"], // Changed from ["SE", "E"]
    optimalSwellDirections: {
      min: 247.5, // WSW
      max: 270, // W
      cardinal: "WSW", // Changed from "S to SW"
    },
    bestSeasons: ["winter"],
    optimalTide: "All",
    description:
      "Beach break with multiple peaks. Can handle big swells. Best in morning offshore.",
    difficulty: "Intermediate",
    waveType: "Beach Break",
    swellSize: {
      min: 1.3,
      max: 3.5,
    },
    idealSwellPeriod: {
      min: 12,
      max: 24,
    },
    waterTemp: {
      summer: 18,
      winter: 14,
    },
    hazards: [
      "Rip currents",
      "Wind chop",
      "Strong currents",
      "Remote location",
    ],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1234,
      lng: 18.4567,
    },
    videos: [
      {
        url: "https://www.youtube.com/watch?app=desktop&v=N-y_UZWMinU&ab_channel=ZacKruyer",
        title:
          "Surfing Winter West Coast of South Africa 2020 - Riders: @adinmasencamp @ducky_staples @dietakhaarman @mafooslombard @iaincampbell_ @robbie_berman @mark_reitz @teegan_c @jordy_maree @jordysmith88 ",
        platform: "youtube",
      },
      {
        url: "https://www.youtube.com/watch?v=0fKS4ZLIH6Q&ab_channel=TheRegularGuy",
        title:
          "West Kegs - Perfect Tubes on South Africa's West Coast with Surfers, Dale Staples, Davey Van Zyl, Shane Sykes, Justin Sykes, Brian Furcy, Calvin Goor, Llewellyn Whittaker, Robbie Schofield and photographers, Alan van Gysen & Ian Thurtel",
        platform: "youtube",
      },
    ],
  },
  {
    id: "horse-trails",
    name: "Horse Trails",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Noordhoek",
    distanceFromCT: 30,
    optimalWindDirections: ["SE", "E"],
    optimalSwellDirections: {
      min: 225.5,
      max: 275.5,
    },
    bestSeasons: ["winter"],
    optimalTide: "Low",
    description:
      "Right-hand point break near Noordhoek. Works on bigger swells. Long walk required.",
    difficulty: "Intermediate",
    waveType: "Point Break",
    swellSize: {
      min: 2.1,
      max: 3.5,
    },
    idealSwellPeriod: {
      min: 12,
      max: 24,
    },
    waterTemp: {
      summer: 18,
      winter: 14,
    },
    hazards: ["Remote location", "Rocks", "Strong currents"],
    crimeLevel: "Medium",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1012,
      lng: 18.4987,
    },
    videos: [
      {
        url: "https://www.youtube.com/watch?v=jEoPsP3yW9s&ab_channel=MaderChod",
        title: "POV Surfing Horse Trails, Cape Town at Dawn",
        platform: "youtube",
      },
    ],
  },
  {
    id: "cemetery",
    name: "Cemetery",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Kalk Bay",
    distanceFromCT: 30,
    optimalWindDirections: ["NW"],
    optimalSwellDirections: {
      min: 135,
      max: 165,
    },
    bestSeasons: ["winter"],
    optimalTide: "Low",
    description:
      "Right-hand point break in Kalk Bay offering rides up to 200m in ideal conditions. Three distinct sections: outside peak ('The Point') provides steep drops and occasional barrels, middle section offers long walls perfect for carving, inside section ('The Reef') reforms for finish. Best performance on SW-W swells with light NW winds. Needs minimum 3ft to start working properly, handles up to 12ft. Wave quality highly tide-dependent - low tide exposes hazardous reef sections while high tide can swamp the break. Key takeoff zone is small and competitive - local hierarchy strictly enforced. Watch for strong backwash bouncing off harbor wall during bigger swells. Deep channel along harbor wall provides paddle-out option but creates dangerous current on bigger days. Early morning sessions recommended before onshore flow develops. Winter brings consistent groundswells and ideal wind conditions. Summer sessions possible but typically smaller and more inconsistent. Parking available at harbor but watch for break-ins. Local knowledge essential for navigating rocks and currents.",
    difficulty: "Intermediate",
    waveType: "Point Break",
    swellSize: {
      min: 0.6,
      max: 3.5, // Was 0.6
    },
    idealSwellPeriod: {
      min: 12,
      max: 24,
    },
    waterTemp: {
      summer: 18,
      winter: 14,
    },
    hazards: ["Rocks", "Strong currents", "Shallow reef"],
    crimeLevel: "Medium",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1012,
      lng: 18.4987,
    },
  },
  {
    id: "the-hoek",
    name: "The Hoek",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Noordhoek",
    distanceFromCT: 30,
    optimalWindDirections: ["SE", "E"],
    optimalSwellDirections: {
      min: 220,
      max: 247.5,
      cardinal: "SW", // Added cardinal direction
    },
    bestSeasons: ["autumn", "winter"], // Updated seasons
    optimalTide: "Low", // Updated tide
    description:
      "Exposed beach break offering both left and right-handers. Wave quality is inconsistent and highly dependent on conditions. Best performance comes from SW groundswell combined with SE offshore winds. Can get crowded when working, making surfing potentially hazardous. Despite inconsistency, can produce quality waves during autumn and winter months when conditions align. Watch for strong currents and rips between sandbars.",
    difficulty: "Intermediate",
    waveType: "Beach Break", // Updated to match info
    swellSize: {
      min: 2.1,
      max: 4.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 24,
    },
    waterTemp: {
      summer: 18,
      winter: 14,
    },
    hazards: ["Rocks", "Strong currents", "Rip currents"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1012,
      lng: 18.4987,
    },
    videos: [
      {
        url: "https://www.youtube.com/watch?v=6GSV3qg_3IU&ab_channel=DCShoesAfrica",
        title: "The Hoek DC Edit.mp4",
        platform: "youtube",
      },
      {
        url: "https://www.youtube.com/watch?v=T67RYh6k2a4&ab_channel=MrCapediver",
        title: "Noordhoek Vibes",
        platform: "youtube",
      },
    ],
  },
  {
    id: "silverstroom",
    name: "Silverstroom",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Melkbosstrand",
    distanceFromCT: 35,
    optimalWindDirections: ["SE", "E"],
    optimalSwellDirections: {
      min: 225,
      max: 315,
    },
    bestSeasons: ["winter"],
    optimalTide: "Low",
    description:
      "Remote beach break with multiple peaks spanning 2km of coastline. Main peak offers A-frame waves with both left and right options up to 150m long. Wave quality highly dependent on sandbank configuration - best banks typically form after winter storms. Handles swells from 3-8ft, but excels at 4-6ft. Works best on SW swell with SE winds under 12 knots. Early sessions crucial as wind typically ruins it by 10am. Deep channels between banks create strong rips - good for paddle outs but dangerous for swimmers. Outside peaks handle bigger swells and offer longer rides, while inside reforms provide shorter but cleaner waves. Limited facilities - bring all supplies. Watch for exposed rocks at low tide near southern end. Less crowded alternative to Big Bay but requires more swell to work.",
    difficulty: "Intermediate",
    waveType: "Beach Break",
    swellSize: {
      min: 0.6,
      max: 3.5, // Was 0.6
    },
    idealSwellPeriod: {
      min: 12,
      max: 24,
    },
    waterTemp: {
      summer: 18,
      winter: 14,
    },
    hazards: ["Rip currents", "Remote location", "Strong currents"],
    crimeLevel: "Medium",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1234,
      lng: 18.4567,
    },
  },
  {
    id: "boneyards",
    name: "Boneyards",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Boneyards",
    distanceFromCT: 40,
    optimalWindDirections: ["ESE"],
    optimalSwellDirections: {
      min: 265,
      max: 275,
      cardinal: "W",
    },

    bestSeasons: ["winter"],
    optimalTide: "High",
    description:
      "Heavy right-hand reef break that requires precise positioning. Fast, shallow takeoff leads into barrel section before wall section. Only breaks properly on low to mid tide with solid swell (6ft+). Best on SE winds with SW swell direction. Extremely shallow reef creates perfect shape but poses serious hazard - not suitable for inexperienced surfers. Local knowledge essential for safe navigation. Strong currents on outside require good fitness level. Early morning sessions recommended before wind shift.",
    difficulty: "Advanced",
    waveType: "Reef Break",
    swellSize: {
      min: 0.3,
      max: 3.4, // Was 0.6
    },
    idealSwellPeriod: {
      min: 12,
      max: 24,
    },
    waterTemp: {
      summer: 16,
      winter: 12,
    },
    hazards: ["Rocks", "Shallow reef", "Strong currents", "Sharks"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1123,
      lng: 18.4876,
    },
  },
  {
    id: "nine-miles",
    name: "Nine Miles",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Nine Miles",
    distanceFromCT: 40,
    optimalWindDirections: ["N", "NW"],
    optimalSwellDirections: {
      min: 157.5,
      max: 180.5,
    },
    bestSeasons: ["winter"],
    optimalTide: "All",
    description:
      "Remote beach break with multiple peaks. Long drive and walk required.",
    difficulty: "Intermediate",
    waveType: "Beach Break",
    swellSize: {
      min: 1.6,
      max: 3.0, // Was 0.6
    },
    idealSwellPeriod: {
      min: 12,
      max: 24,
    },
    waterTemp: {
      summer: 18,
      winter: 14,
    },
    hazards: ["Remote location", "Rip currents", "Strong currents"],
    crimeLevel: "Medium",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1234,
      lng: 18.4567,
    },
  },
  {
    id: "crons",
    name: "Crons",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Kommetjie",
    distanceFromCT: 35,
    optimalWindDirections: ["SE", "ESE"],
    optimalSwellDirections: {
      min: 330,
      max: 345,
      cardinal: "SW", // Updated to just SW as primary direction
    },
    bestSeasons: ["winter"],
    optimalTide: "High",
    description:
      "Exposed beach break offering both lefts and rights. Best performance on SW groundswell with ESE winds. While fairly consistent, summer tends to be mostly flat. Wave quality varies with sandbank conditions. Watch out for dangerous rips, especially during bigger swells. Can get crowded when conditions are good.",
    difficulty: "Advanced",
    waveType: "Beach Break", // Confirmed as Beach Break
    swellSize: {
      min: 1.5,
      max: 8.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 24,
    },
    waterTemp: {
      summer: 16,
      winter: 12,
    },
    hazards: [
      "Rocks",
      "Strong currents",
      "Shallow sandbanks",
      "Remote location",
    ],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1012,
      lng: 18.4987,
    },
  },
  {
    id: "rivermouth",
    name: "Rivermouth",
    continent: "Africa",
    country: "South Africa",
    region: "Eastern Cape",
    location: "East London",
    distanceFromCT: 1000,
    optimalWindDirections: ["SW", "W"],
    optimalSwellDirections: {
      min: 135,
      max: 225,
    },
    bestSeasons: ["winter"],
    optimalTide: "All",
    description:
      "Exposed beach break that provides consistent waves year-round, though summer tends to be mostly flat. Located at the Buffalo River mouth, this spot offers reliable waves when other spots aren't working.",
    difficulty: "Intermediate",
    waveType: "Beach Break",
    swellSize: {
      min: 0.3,
      max: 4.6,
    },
    idealSwellPeriod: {
      min: 12,
      max: 16,
    },
    waterTemp: {
      summer: 22,
      winter: 18,
    },
    hazards: ["Rip currents", "Strong currents", "River mouth hazards"],
    crimeLevel: "Medium",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1234,
      lng: 18.4567,
    },
  },
  {
    id: "paranoia",
    name: "Paranoia",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Koeel Baai, Overberg",
    distanceFromCT: 40,
    optimalWindDirections: ["ESE"],
    optimalSwellDirections: {
      min: 180.5,
      max: 183.5,
    },
    bestSeasons: ["winter"],
    optimalTide: "High",
    description:
      "Hidden reef break requiring specific conditions and local knowledge. Works on SW groundswell from 6-15ft with precise SE wind angle. Wave breaks over shallow rock shelf creating fast, hollow rights up to 150m long. Three sections: steep takeoff zone leading into barrel section, followed by wall, ending in inside bowl. Only breaks properly on mid to low tide. Extremely location-sensitive - slight wind or swell direction changes can render it unsurfable. Multiple hazards including exposed rocks, strong rips, and sudden closeouts. Access requires long paddle or boat trip. Rarely crowded due to fickle nature and difficult access, but locals protective of spot information. Best during winter months when conditions align. Not suitable for inexperienced surfers - consequences for mistakes severe.",
    difficulty: "Advanced",
    waveType: "Reef Break",
    swellSize: {
      min: 1.7,
      max: 5.1,
    },
    idealSwellPeriod: {
      min: 12,
      max: 24,
    },
    waterTemp: {
      summer: 16,
      winter: 12,
    },
    hazards: [
      "Big waves",
      "Rocks",
      "Strong currents",
      "Remote location",
      "Sharks",
    ],
    crimeLevel: "Medium",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1123,
      lng: 18.4876,
    },
    videos: [
      {
        url: "https://www.youtube.com/watch?v=ypvKKEGyB9M&ab_channel=CJ%27scinema",
        title: "Adin Masencamp // Overberg surf",
        platform: "youtube",
      },
      {
        url: "https://www.youtube.com/watch?v=nr2xjbn-2c8&ab_channel=zlipperyEEL",
        title: "Paranoia overberg surfing clarence drive",
        platform: "youtube",
      },
    ],
  },

  {
    id: "platboom",
    name: "Platboom",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Cape Point",
    distanceFromCT: 35,
    optimalWindDirections: ["NW"],
    optimalSwellDirections: {
      min: 255,
      max: 285,
    },
    bestSeasons: ["winter"],
    optimalTide: "Low",
    description:
      "Remote beach break in Cape Point Reserve offering multiple peaks across 3km of pristine coastline. Wave quality varies with constantly shifting sandbanks - scout before paddling out. Main peak provides powerful A-frames, with rights typically offering longer rides. Handles all swell sizes but excels in 4-8ft SW groundswell with 12+ second period. Best conditions with light NW-NE winds early morning. Strong currents and multiple rip channels require good ocean knowledge. Extremely isolated location - bring all supplies and never surf alone. Notable wildlife activity including seals, sharks, and occasional whales. Access requires Cape Point Reserve entry fee and 20-minute drive on dirt road. Best during winter months when groundswells are most consistent. No facilities or cell reception - emergency assistance far away. Watch for sudden weather changes typical of peninsula location.",
    difficulty: "Intermediate",
    waveType: "Beach Break",
    swellSize: {
      min: 1.2,
      max: 3.2,
    },
    idealSwellPeriod: {
      min: 12,
      max: 24,
    },
    waterTemp: {
      summer: 18,
      winter: 14,
    },
    hazards: ["Remote location", "Rip currents", "Strong currents", "Sharks"],
    crimeLevel: "Medium",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1123,
      lng: 18.4876,
    },
    videos: [
      {
        url: "https://www.youtube.com/watch?v=bY1Gopk-oSw&ab_channel=JordyMaree",
        title: "Scoring at Heavy Slab in Cape Town",
        platform: "youtube",
      },
    ],
  },
  {
    id: "dias-beach",
    name: "Dias Beach",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Cape Point",
    distanceFromCT: 40,
    optimalWindDirections: ["N", "NE"],
    optimalSwellDirections: {
      min: 160.5,
      max: 200.5,
      cardinal: "S to SW",
    },
    bestSeasons: ["winter"],
    optimalTide: "High",
    description:
      "Secluded break at Cape Point. Long stairs access. Works on bigger swells.",
    difficulty: "Advanced",
    waveType: "Beach Break",
    swellSize: {
      min: 1.3,
      max: 3.6,
    },
    idealSwellPeriod: {
      min: 12,
      max: 24,
    },
    waterTemp: {
      summer: 16,
      winter: 12,
    },
    hazards: [
      "Remote location, entry fee to Cape Point Reserve",
      "Difficult access",
      "Strong currents",
      "Sharks",
    ],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1012,
      lng: 18.4987,
    },
    videos: [
      {
        url: "https://www.youtube.com/watch?v=TaPts0L_Af0&pp=ygUSZGlhcyBiZWFjaCBzdXJmaW5n",
        title: "Pumping Surf at Dias Beach",
        platform: "youtube",
      },
      {
        url: "https://www.youtube.com/watch?v=Tzzo84OPrYY&ab_channel=MatthewOrnellas",
        title: "Cape Point Nature Reserve / Dias Beach",
        platform: "youtube",
      },
    ],
  },
  {
    id: "cape-st-francis",
    name: "Cape St Francis",
    continent: "Africa",
    country: "South Africa",
    region: "Eastern Cape",
    location: "Cape St Francis",
    distanceFromCT: 730,
    optimalWindDirections: ["WNW", "W", "NW"], // Added WNW as primary optimal wind
    optimalSwellDirections: {
      min: 90, // Changed to E (90°)
      max: 135, // To SE (135°)
      cardinal: "E to SE", // Updated cardinal directions
    },
    bestSeasons: ["winter", "summer"], // Added summer as it works year-round
    optimalTide: "All",
    description:
      "World-class right-hand point break made famous by The Endless Summer. Offers perfect, peeling waves with multiple sections along a 300m ride. Best performance comes from east swell with WNW winds. Consistent year-round with good wave quality. Popular spot that can get crowded, especially during peak conditions. Protected from south winds by headland. Watch for strong currents around point.",
    difficulty: "Intermediate",
    waveType: "Point Break",
    swellSize: {
      min: 1.3,
      max: 4.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 24,
    },
    waterTemp: {
      summer: 22,
      winter: 17,
    },
    hazards: ["Rocks", "Strong currents"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.2044,
      lng: 24.8366,
    },
  },
  {
    id: "glencairn",
    name: "Glencairn",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "False Bay",
    distanceFromCT: 35,
    optimalWindDirections: ["WNW", "NW", "W"], // Added WNW as it's offshore here
    optimalSwellDirections: {
      min: 225,
      max: 315,
    },
    bestSeasons: ["winter"],
    optimalTide: "Mid",
    description:
      "Protected beach break in False Bay, works best with NW winds. Good for beginners on smaller days.",
    difficulty: "Beginner",
    waveType: "Beach Break",
    swellSize: {
      min: 2.1,
      max: 5.6,
    },
    idealSwellPeriod: {
      min: 12,
      max: 24,
    },
    waterTemp: {
      summer: 18,
      winter: 14,
    },
    hazards: ["Rip currents", "Rocks", "Sharks"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image:
      "https://images.unsplash.com/photo-1666022392607-2890a8b85b8f?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    coordinates: {
      lat: -34.1123,
      lng: 18.4876,
    },
  },
  {
    id: "st-james",
    name: "St James",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "False Bay",
    distanceFromCT: 30,
    optimalWindDirections: ["WNW", "NW", "W"], // Added WNW as it's offshore here
    optimalSwellDirections: {
      min: 225,
      max: 315,
    },
    bestSeasons: ["winter"],
    optimalTide: "Mid",
    description:
      "Small reef break next to tidal pool. Protected spot good for beginners when small.",
    difficulty: "Beginner",
    waveType: "Reef Break",
    swellSize: {
      min: 1.3,
      max: 4.6,
    },
    idealSwellPeriod: {
      min: 12,
      max: 24,
    },
    waterTemp: {
      summer: 18,
      winter: 14,
    },
    hazards: ["Rocks", "Sharks", "Shallow reef"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: true,
      incidents: [
        {
          date: "2004-09-13",
          outcome: "Fatal",
          details: "Fatal attack on spearfisherman",
        },
      ],
    },
    image: "",
    coordinates: {
      lat: -34.1123,
      lng: 18.4876,
    },
  },
  {
    id: "fish-hoek",
    name: "Fish Hoek",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "False Bay",
    distanceFromCT: 35,
    optimalWindDirections: ["WNW", "NW", "W"], // Added WNW as it's offshore here
    optimalSwellDirections: {
      min: 225,
      max: 315,
    },
    bestSeasons: ["winter"],
    optimalTide: "All",
    description:
      "Long beach break with multiple peaks. Protected from SE winds. Good for beginners.",
    difficulty: "Beginner",
    waveType: "Beach Break",
    swellSize: {
      min: 1.3,
      max: 5.6,
    },
    idealSwellPeriod: {
      min: 12,
      max: 24,
    },
    waterTemp: {
      summer: 18,
      winter: 14,
    },
    hazards: ["Rip currents", "Sharks"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: true,
      incidents: [
        {
          date: "2011-09-28",
          outcome: "Fatal",
          details:
            "Fatal attack on swimmer despite shark spotters' warning flags",
        },
        {
          date: "2004-11-13",
          outcome: "Non-fatal",
          details: "Swimmer survived attack in shallow water",
        },
      ],
    },
    image: "",
    coordinates: {
      lat: -34.1123,
      lng: 18.4876,
    },
  },
  {
    id: "second-beach",
    name: "Second Beach",
    continent: "Africa",
    country: "South Africa",
    region: "Eastern Cape",
    location: "Port St Johns",
    distanceFromCT: 1200,
    optimalWindDirections: ["W", "SW"],
    optimalSwellDirections: {
      min: 135,
      max: 225,
    },
    bestSeasons: ["summer"],
    optimalTide: "Mid",
    description:
      "Powerful beach break known for its consistent waves and unfortunately, frequent shark activity. Multiple peaks along the beach with both lefts and rights. Best on SW swell with light offshore winds.",
    difficulty: "Advanced",
    waveType: "Beach Break",
    swellSize: {
      min: 1.6,
      max: 6.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 16,
    },
    waterTemp: {
      summer: 22,
      winter: 18,
    },
    hazards: ["Sharks", "Strong currents", "Rip currents"],
    crimeLevel: "Medium",
    sharkAttack: {
      hasAttack: true,
      incidents: [
        {
          date: "2012-01-15",
          outcome: "Fatal",
          details: "Lungisani Msungubana (25) attacked in waist-deep water",
        },
        {
          date: "2011-01-15",
          outcome: "Fatal",
          details: "Zama Ndamase (16) fatal attack while surfing",
        },
        {
          date: "2009-12-18",
          outcome: "Fatal",
          details: "Tshintshekile Nduva (22) attacked while paddle boarding",
        },
        {
          date: "2009-01-24",
          outcome: "Fatal",
          details: "Sikhanyiso Bangilizwe (27) fatal attack while swimming",
        },
        {
          date: "2007-01-14",
          outcome: "Fatal",
          details: "Sibulele Masiza (24) disappeared while bodyboarding",
        },
      ],
    },
    image: "",
    coordinates: {
      lat: -31.6271,
      lng: 29.5444,
    },
  },
  {
    id: "plettenberg-bay",
    name: "Plettenberg Bay",
    continent: "Africa",
    country: "South Africa",
    region: "Eastern Cape",
    location: "Plettenberg Bay",
    distanceFromCT: 520,
    optimalWindDirections: ["W", "SW"],
    optimalSwellDirections: {
      min: 180,
      max: 225,
    },
    bestSeasons: ["winter"],
    optimalTide: "All",
    description:
      "Multiple beach breaks and point breaks offering various wave types. Popular surf destination with consistent waves.",
    difficulty: "Intermediate",
    waveType: "Beach Break",
    swellSize: {
      min: 1.3,
      max: 4.0,
    },
    idealSwellPeriod: {
      min: 10,
      max: 16,
    },
    waterTemp: {
      summer: 21,
      winter: 17,
    },
    hazards: ["Sharks", "Rip currents", "Strong currents"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: true,
      incidents: [
        {
          date: "2022-09-25",
          outcome: "Fatal",
          details:
            "Kimon Bisogno (39) attacked by great white shark while swimming",
        },
        {
          date: "2022-06-28",
          outcome: "Fatal",
          details:
            "Bruce Wolov (63) attacked by great white shark while swimming",
        },
      ],
    },
    image: "",
    coordinates: {
      lat: -34.0527,
      lng: 23.3716,
    },
    videos: [
      {
        url: "https://www.youtube.com/watch?v=BotuctY6XzI&ab_channel=PsychedOut",
        title: "Bodyboarding // Plett Wedge // Plettenberg Bay",
        platform: "youtube",
      },
    ],
  },
  {
    id: "nahoon-reef",
    name: "Nahoon Reef",
    continent: "Africa",
    country: "South Africa",
    region: "Eastern Cape",
    location: "East London",
    distanceFromCT: 1000,
    optimalWindDirections: ["SW", "W"],
    optimalSwellDirections: {
      min: 135,
      max: 225,
    },
    bestSeasons: ["winter", "summer"],
    optimalTide: "Mid",
    description:
      "Premier right-hand reef break. Powerful waves breaking over shallow reef. Best on SW swell with offshore winds.",
    difficulty: "Advanced",
    waveType: "Reef Break",
    swellSize: {
      min: 1.6,
      max: 3.5,
    },
    idealSwellPeriod: {
      min: 12,
      max: 16,
    },
    waterTemp: {
      summer: 22,
      winter: 18,
    },
    hazards: ["Rocks", "Sharks", "Strong currents"],
    crimeLevel: "Medium",
    sharkAttack: {
      hasAttack: true,
      incidents: [
        {
          date: "1994-07-09",
          outcome: "Fatal",
          details: "Bruce Corby (22) fatal attack while surfing at Nahoon Reef",
        },
      ],
    },
    image: "",
    coordinates: {
      lat: -34.1234,
      lng: 18.4567,
    },
  },
  {
    id: "mossel-bay",
    name: "Mossel Bay",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Mossel Bay",
    distanceFromCT: 400,
    optimalWindDirections: ["NW", "W", "SW"],
    optimalSwellDirections: {
      min: 90,
      max: 120,
    },
    bestSeasons: ["winter"],
    optimalTide: "All",
    description:
      "Various reef and beach breaks offering different wave types. Inner Pool and Outer Pool provide good right-handers.  The local surfing community is known for its welcoming nature, making it an ideal destination for surfers of all skill levels. Whether you're a seasoned pro or just starting out, Mossel Bay offers a supportive environment to hone your skills and enjoy the waves.",
    difficulty: "Intermediate",
    waveType: "Beach Break",
    swellSize: {
      min: 1.3,
      max: 5.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 18,
    },
    waterTemp: {
      summer: 20,
      winter: 16,
    },
    hazards: ["Rocks", "Strong currents", "Sharks"],
    crimeLevel: "Medium",
    sharkAttack: {
      hasAttack: true,
      incidents: [
        {
          date: "1990-06-24",
          outcome: "Fatal",
          details:
            "Monique Price (21) attacked while diving to recover an anchor",
        },
      ],
    },
    image: "",
    coordinates: {
      lat: -34.1234,
      lng: 18.4567,
    },
    videos: [
      {
        url: "https://www.youtube.com/watch?v=WnYnXiONb_U&ab_channel=StokedTheBrand",
        title: "Stoked Sessions • Surfing Mossel Bay - Stoked X Kane Johnstone",
        platform: "youtube",
      },
      {
        url: "https://www.youtube.com/watch?v=D3BJLfvuf3g&pp=ygUPbW9zc2VsIGJheSBzdXJm",
        title: "RAW: Mossel Bay, 5 July 2021 (Featuring Adin Masencamp)",
        platform: "youtube",
      },
      {
        url: "https://www.youtube.com/watch?v=vqSUqsLv1HA&ab_channel=SandyMarwick",
        title: "Surfing at Outer Pool, Mossel Bay",
        platform: "youtube",
      },
    ],
  },
  {
    id: "stilbaai",
    name: "Stilbaai",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Stilbaai",
    distanceFromCT: 350,
    optimalWindDirections: ["N", "W", "NW"],
    optimalSwellDirections: {
      min: 90,
      max: 150,
    },
    bestSeasons: ["winter"],
    optimalTide: "All",
    description:
      "Long right-hand point break with multiple sections. Works best on SW swell with offshore winds.",
    difficulty: "Intermediate",
    waveType: "Point Break",
    swellSize: {
      min: 1.3,
      max: 4.2,
    },
    idealSwellPeriod: {
      min: 12,
      max: 18,
    },
    waterTemp: {
      summer: 21,
      winter: 17,
    },
    hazards: ["Rocks", "Strong currents"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: true,
      incidents: [
        {
          date: "1999-07-15",
          outcome: "Fatal",
          details: "Hercules Pretorius (15) attacked while body boarding",
        },
      ],
    },
    image: "",
    coordinates: {
      lat: -34.1234,
      lng: 18.4567,
    },
    videos: [
      {
        url: "https://www.youtube.com/watch?v=Fuv6jdUOK-U&ab_channel=BonzovanRooyen",
        title: "Stilbaai March 2018",
        platform: "youtube",
      },
    ],
  },
  {
    id: "wilderness",
    name: "Wilderness",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Wilderness",
    distanceFromCT: 440,
    optimalWindDirections: ["SW", "W"],
    optimalSwellDirections: {
      min: 180,
      max: 270,
    },
    bestSeasons: ["summer", "winter"],
    optimalTide: "All",
    description:
      "Long stretch of beach break with multiple peaks. Best known for its consistent waves and beautiful setting within the Garden Route. Works in most conditions but excels with SW swell and light offshore winds. Multiple peaks spread crowds well. Good for all skill levels depending on conditions. Beach access is easy with multiple parking areas and facilities nearby. Watch for strong rip currents, especially during bigger swells.",
    difficulty: "Intermediate",
    waveType: "Beach Break",
    swellSize: {
      min: 1.3,
      max: 3.0,
    },
    idealSwellPeriod: {
      min: 10,
      max: 16,
    },
    waterTemp: {
      summer: 21,
      winter: 17,
    },
    hazards: ["Rip currents", "Strong currents"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: true,
      incidents: [
        {
          date: "1996-05-28",
          outcome: "Non-fatal",
          details:
            "Donovan Kohne (17) attacked by great white shark while surfing",
        },
      ],
    },
    image: "",
    coordinates: {
      lat: -34.1234,
      lng: 18.4567,
    },
  },
  {
    id: "coffee-bay",
    name: "Coffee Bay",
    continent: "Africa",
    country: "South Africa",
    region: "Eastern Cape",
    location: "Transkei",
    distanceFromCT: 1200,
    optimalWindDirections: ["SW", "W"],
    optimalSwellDirections: {
      min: 135,
      max: 225,
    },
    bestSeasons: ["summer", "winter"],
    optimalTide: "Mid",
    description:
      "Remote point break in the heart of the Wild Coast. Multiple surf spots including the main beach break and right-hand point. Best on SW swell with offshore winds. Warm water and uncrowded waves, but remote location requires planning. Beautiful setting with traditional Xhosa villages nearby. Access requires 4x4 or long walk. Basic accommodations available in town.",
    difficulty: "Intermediate",
    waveType: "Point Break",
    swellSize: {
      min: 1.6,
      max: 3.2,
    },
    idealSwellPeriod: {
      min: 12,
      max: 16,
    },
    waterTemp: {
      summer: 23,
      winter: 19,
    },
    hazards: [
      "Remote location",
      "Strong currents",
      "Rocks",
      "Limited facilities",
    ],
    crimeLevel: "Medium",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1234,
      lng: 18.4567,
    },
    videos: [
      {
        url: "https://www.youtube.com/watch?v=lcCVkBHMq5k&ab_channel=StokedForTravel",
        title:
          "Welcome To The Wild Coast - Surfing In Coffee Bay, South Africa | Stoked For Travel",
        platform: "youtube",
      },
    ],
  },
  {
    id: "mdumbi",
    name: "Mdumbi",
    continent: "Africa",
    country: "South Africa",
    region: "Eastern Cape",
    location: "Transkei",
    distanceFromCT: 1220,
    optimalWindDirections: ["SW", "W"],
    optimalSwellDirections: {
      min: 135,
      max: 225,
    },
    bestSeasons: ["summer", "winter"],
    optimalTide: "All",
    description:
      "Perfect right-hand point break considered one of South Africa's best waves. Long, peeling walls offer multiple sections. Works best on SW swell with light offshore winds. Remote location and basic facilities, but consistent quality waves. Strong local community presence with eco-lodge accommodation. Access requires 4x4 vehicle.",
    difficulty: "Intermediate",
    waveType: "Point Break",
    swellSize: {
      min: 1.6,
      max: 4.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 16,
    },
    waterTemp: {
      summer: 23,
      winter: 19,
    },
    hazards: [
      "Remote location",
      "Strong currents",
      "Limited facilities",
      "Sharks",
    ],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: true,
      incidents: [
        {
          date: "2024-01-15",
          outcome: "Non-fatal",
          details:
            "Local freediver in his 40s sustained lacerations from shark bite, airlifted to hospital in stable condition",
        },
      ],
    },
    image: "",
    coordinates: {
      lat: -34.1234,
      lng: 18.4567,
    },
    videos: [
      {
        url: "https://www.youtube.com/watch?v=DhrP6Koc_vI&ab_channel=Cars.co.za",
        title:
          "Road Trip South Africa: 4x4 surf adventure through Transkei - Mdumbi, Coffee Bay, Hole in the wall",
        platform: "youtube",
      },
    ],
  },
  {
    id: "ntlonyane-breezy-point",
    name: "Ntlonyane (Breezy Point)",
    continent: "Africa",
    country: "South Africa",
    region: "Eastern Cape",
    location: "Transkei",
    distanceFromCT: 1150,
    optimalWindDirections: ["SW", "W"],
    optimalSwellDirections: {
      min: 135,
      max: 225,
    },
    bestSeasons: ["summer", "winter"],
    optimalTide: "Mid to High",
    description:
      "World-class right-hand point break producing long, perfect waves. Multiple sections offering barrels and walls. Requires solid swell to break properly. Very remote location with minimal facilities - camping or basic accommodation only. Access difficult without 4x4. Local guide recommended for first visit.",
    difficulty: "Advanced",
    waveType: "Point Break",
    swellSize: {
      min: 0.9,
      max: 4.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 16,
    },
    waterTemp: {
      summer: 23,
      winter: 19,
    },
    hazards: [
      "Remote location",
      "Rocks",
      "Strong currents",
      "Limited facilities",
    ],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1234,
      lng: 18.4567,
    },
  },
  {
    id: "hole-in-the-wall",
    name: "Hole in the Wall",
    continent: "Africa",
    country: "South Africa",
    region: "Eastern Cape",
    location: "Transkei",
    distanceFromCT: 1180,
    optimalWindDirections: ["SW", "W"],
    optimalSwellDirections: {
      min: 135,
      max: 225,
    },
    bestSeasons: ["summer", "winter"],
    optimalTide: "Mid",
    description:
      "Powerful right-hand point break next to iconic rock formation. Works best on SW swell with offshore winds. Multiple sections including hollow inside bowl. Remote location requires planning. Basic accommodation available nearby. Strong currents and rocky bottom demand respect.",
    difficulty: "Advanced",
    waveType: "Point Break",
    swellSize: {
      min: 0.6,
      max: 2.5,
    },
    idealSwellPeriod: {
      min: 12,
      max: 16,
    },
    waterTemp: {
      summer: 23,
      winter: 19,
    },
    hazards: [
      "Remote location",
      "Rocks",
      "Strong currents",
      "Limited facilities",
    ],
    crimeLevel: "Medium",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1234,
      lng: 18.4567,
    },
    videos: [
      {
        url: "https://www.youtube.com/watch?v=DhrP6Koc_vI&ab_channel=Cars.co.za",
        title:
          "Road Trip South Africa: 4x4 surf adventure through Transkei - Mdumbi, Coffee Bay, Hole in the wall",
        platform: "youtube",
      },
    ],
  },

  {
    id: "lamberts-bay",
    name: "Lamberts Bay",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Lamberts Bay",
    distanceFromCT: 280,
    optimalWindDirections: ["E"],
    optimalSwellDirections: {
      min: 225,
      max: 270,
    },
    bestSeasons: ["winter"],
    optimalTide: "Mid",
    description:
      "Long right-hand point break with multiple sections. Works best on SW swell with SE winds. Known for its consistency and quality during winter months. Protected from summer SE winds by headland. Multiple take-off zones spread crowds. Watch for local territorial vibes.",
    difficulty: "Intermediate",
    waveType: "Point Break",
    swellSize: {
      min: 1.6,
      max: 5.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 18,
    },
    waterTemp: {
      summer: 16,
      winter: 12,
    },
    hazards: ["Rocks", "Strong currents", "Remote location", "Sharks"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1234,
      lng: 18.4567,
    },
  },
  {
    id: "doring-bay",
    name: "Doring Bay",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Doring Bay",
    distanceFromCT: 300,
    optimalWindDirections: ["SE", "E"],
    optimalSwellDirections: {
      min: 240.5,
      max: 285.5,
    },
    bestSeasons: ["winter"],
    optimalTide: "Mid to High",
    description:
      "Powerful right-hand point break that handles big swells well. Multiple sections including hollow inside bowl. Best on SW swell with SE winds. Remote location means uncrowded sessions but bring all supplies. Strong currents and rocky bottom require experience.",
    difficulty: "Advanced",
    waveType: "Point Break",
    swellSize: {
      min: 1.6,
      max: 4.5,
    },
    idealSwellPeriod: {
      min: 12,
      max: 18,
    },
    waterTemp: {
      summer: 16,
      winter: 12,
    },
    hazards: ["Rocks", "Strong currents", "Remote location", "Sharks"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1234,
      lng: 18.4567,
    },
  },
  {
    id: "paternoster",
    name: "Paternoster",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Paternoster",
    distanceFromCT: 155,
    optimalWindDirections: ["SE", "E"],
    optimalSwellDirections: {
      min: 340.5,
      max: 345.5,
    },
    bestSeasons: ["winter"],
    optimalTide: "Mid",
    description:
      "Beach break with multiple peaks along scenic West Coast beach. Works best on SW swell with SE winds. Relatively consistent year-round but excels in winter. Good for all skill levels depending on conditions. Watch for strong currents and seasonal bluebottles.",
    difficulty: "Intermediate",
    waveType: "Beach Break",
    swellSize: {
      min: 3.3,
      max: 7.5,
    },
    idealSwellPeriod: {
      min: 12,
      max: 18,
    },
    waterTemp: {
      summer: 16,
      winter: 12,
    },
    hazards: ["Rip currents", "Strong currents", "Remote location"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1234,
      lng: 18.4567,
    },
  },
  {
    id: "famous",
    name: "Famous",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Elands Bay",
    distanceFromCT: 220,
    optimalWindDirections: ["E"],
    optimalSwellDirections: {
      min: 225,
      max: 270,
    },
    bestSeasons: ["winter"],
    optimalTide: "Mid to High",
    description:
      "Powerful A-frame beach break just south of Elands Bay's main point. Known for producing hollow barrels, especially on bigger swells. Multiple peaks along the beach, with the main peak offering both left and right options. Works best on SW-W swell with SE winds. Wave quality highly dependent on sandbank conditions. Early morning sessions recommended before onshore winds develop. Strong rips provide good paddle-out channels but create hazardous currents.",
    difficulty: "Advanced",
    waveType: "Beach Break",
    swellSize: {
      min: 2.9,
      max: 6.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 18,
    },
    waterTemp: {
      summer: 16,
      winter: 12,
    },
    hazards: ["Strong currents", "Rip currents", "Remote location", "Sharks"],
    crimeLevel: "Medium",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1123,
      lng: 18.4876,
    },
  },
  {
    id: "britannia-bay",
    name: "Britannia Bay",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "St Helena Bay",
    distanceFromCT: 175,
    optimalWindDirections: ["SE", "S"],
    optimalSwellDirections: {
      min: 135.5,
      max: 180.5,
    },
    bestSeasons: ["winter"],
    optimalTide: "Mid",
    description:
      "Series of right-hand point breaks along rocky coastline. Main point offers long walls on bigger swells. Multiple take-off zones spread crowds. Best on SW swell with SE winds. Remote location means uncrowded sessions. Watch for strong currents around headlands.",
    difficulty: "Intermediate",
    waveType: "Point Break",
    swellSize: {
      min: 1.6,
      max: 3.7,
    },
    idealSwellPeriod: {
      min: 12,
      max: 18,
    },
    waterTemp: {
      summer: 16,
      winter: 12,
    },
    hazards: ["Rocks", "Strong currents", "Remote location"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1234,
      lng: 18.4567,
    },
    videos: [
      {
        url: "https://www.youtube.com/watch?v=BFumTBHAOwo&pp=ygUPZWxhbmRzIGJheSBzdXJm",
        title: "Surfing the best Elands Bay in Years!",
        platform: "youtube",
      },
    ],
  },
  {
    id: "tietiesbaai",
    name: "Tietiesbaai",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Paternoster",
    distanceFromCT: 160,
    optimalWindDirections: ["NE", "E"],
    optimalSwellDirections: {
      min: 180.5,
      max: 247.5,
    },
    bestSeasons: ["winter"],
    optimalTide: "Mid to High",
    description:
      "Right-hand point break in scenic Cape Columbine Nature Reserve. Works best on solid SW swell with SE winds. Multiple sections including hollow inside bowl. Remote location requires planning. Basic camping facilities nearby. Rocky entry/exit requires careful timing.",
    difficulty: "Advanced",
    waveType: "Point Break",
    swellSize: {
      min: 1.6,
      max: 5.0, // Was 2.0
    },
    idealSwellPeriod: {
      min: 12,
      max: 18,
    },
    waterTemp: {
      summer: 16,
      winter: 12,
    },
    hazards: [
      "Rocks",
      "Strong currents",
      "Remote location",
      "Limited facilities",
    ],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1234,
      lng: 18.4567,
    },
  },
  {
    id: "hondeklip-bay",
    name: "Hondeklip Bay",
    continent: "Africa",
    country: "South Africa",
    region: "Northern Cape",
    location: " Namakwa district",
    distanceFromCT: 515,
    optimalWindDirections: ["SE", "E"],
    optimalSwellDirections: {
      min: 220.5,
      max: 260.5,
    },
    bestSeasons: ["winter"],
    optimalTide: "Mid to High",
    description:
      "Hondeklip Bay is a coastal village in the Namakwa district of the Northern Cape province of South Africa. It lies about 95 km south west of the district capital Springbok.",
    difficulty: "Intermediate",
    waveType: "Reef Break",
    swellSize: {
      min: 1.6,
      max: 4.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 18,
    },
    waterTemp: {
      summer: 14,
      winter: 10,
    },
    hazards: ["Cold water", "Remote location", "Strong currents", "Fog"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1234,
      lng: 18.4567,
    },
    videos: [
      {
        url: "https://www.youtube.com/watch?v=_G-o3tPliek&ab_channel=AmandlaSurfFoundation",
        title: "Help bring surfing to Hondeklip Bay Kids",
        platform: "youtube",
      },
    ],
  },
  {
    id: "port-nolloth",
    name: "Port Nolloth",
    continent: "Africa",
    country: "South Africa",
    region: "Northern Cape",
    location: "Port Nolloth",
    distanceFromCT: 770,
    optimalWindDirections: ["SE", "E"],
    optimalSwellDirections: {
      min: 220.5,
      max: 280.5,
    },
    bestSeasons: ["winter"],
    optimalTide: "Mid to High",
    description:
      "Port Nolloth is a coastal village in the Northern Cape province of South Africa. It lies about 770 km north of the provincial capital, Kimberley.",
    difficulty: "Intermediate",
    waveType: "Beach Break",
    swellSize: {
      min: 1.6,
      max: 4.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 18,
    },
    waterTemp: {
      summer: 14,
      winter: 10,
    },
    hazards: ["Cold water", "Remote location", "Strong currents", "Fog"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1234,
      lng: 18.4567,
    },
  },
  {
    id: "heaven",
    name: "Heaven",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "West Coast",
    distanceFromCT: 230,
    optimalWindDirections: ["S"], // Updated: offshore winds from the south
    optimalSwellDirections: {
      min: 222.5, // WSW swell direction
      max: 270,
    },
    bestSeasons: ["summer"], // Updated: best in summer, particularly January
    optimalTide: "All", // Updated: surfable at all stages of tide
    description:
      "Reasonably exposed reef and point break that's inconsistent but can produce quality waves. Best conditions occur with WSW swell and offshore southerly winds. Can handle light onshore winds. Groundswells more frequent than windswells. Take care of rocks in the lineup. Rarely crowded. Clean surfable waves found 69% of the time in January.",
    difficulty: "Advanced",
    waveType: "Reef Break", // Updated: it's primarily a reef break with point characteristics
    swellSize: {
      min: 1.6,
      max: 4.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 16,
    },
    waterTemp: {
      summer: 15, // Updated based on current reading
      winter: 12,
    },
    hazards: ["Rocks", "Inconsistent waves", "Remote location"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1123,
      lng: 18.4876,
    },
  },
  {
    id: "baboon-point",
    name: "Baboon Point",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Elands Bay",
    distanceFromCT: 220,
    optimalWindDirections: ["E"], // Best wind direction is from the east
    optimalSwellDirections: {
      min: 240, // WSW swell direction
      max: 270,
    },
    bestSeasons: ["winter"], // Best in winter, particularly July
    optimalTide: "All", // No specific tide mentioned, assuming works at all tides
    description:
      "Exposed reef break that's fairly consistent throughout the year. Left-breaking reef that works best with WSW groundswell and easterly winds. Can get crowded when conditions are good. Clean surfable waves found 39% of the time in July, though can be frequently blown out (60% of the time in peak season).",
    difficulty: "Advanced",
    waveType: "Reef Break",
    swellSize: {
      min: 2.2,
      max: 4.0, // Was 2.5
    },
    idealSwellPeriod: {
      min: 12,
      max: 16,
    },
    waterTemp: {
      summer: 15, // Based on current reading
      winter: 12,
    },
    hazards: ["Rocks", "Crowds", "Strong winds", "Petrol Price"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1123,
      lng: 18.4876,
    },
  },
  {
    id: "donkin-bay",
    name: "Donkin Bay",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "West Coast",
    distanceFromCT: 240, // Approximate distance, please adjust if needed
    optimalWindDirections: ["ESE"], // Best wind direction is from the east-southeast
    optimalSwellDirections: {
      min: 202.5, // SW swell direction
      max: 247.5,
    },
    bestSeasons: ["winter"], // Assuming winter based on SW swell direction
    optimalTide: "All", // No specific tide mentioned
    description:
      "Fairly consistent reef and point break combination. Works best with Southwest swell and ESE offshore winds. Multiple sections offering different wave characteristics due to the mixed reef and point setup.",
    difficulty: "Advanced",
    waveType: "Reef Break", // Listed as both reef and point, but primary characteristic seems to be reef
    swellSize: {
      min: 2.1,
      max: 4.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 16,
    },
    waterTemp: {
      summer: 16, // Based on current reading
      winter: 12,
    },
    hazards: ["Rocks", "Strong currents", "Remote location"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1234,
      lng: 18.4567,
    },
  },
  {
    id: "strandfontein",
    name: "Strandfontein",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "West Coast",
    distanceFromCT: 300, // Approximate distance, please adjust if needed
    optimalWindDirections: ["E"], // Best wind direction is from the east
    optimalSwellDirections: {
      min: 227.5, // SW swell direction
      max: 270.5,
    },
    bestSeasons: ["winter"], // Assuming winter based on SW swell direction
    optimalTide: "All", // No specific tide mentioned
    description:
      "Inconsistent beach break that can produce quality waves when conditions align. Works best with Southwest swell and easterly offshore winds. Multiple peaks along the beach offering different wave options.",
    difficulty: "Intermediate",
    waveType: "Beach Break",
    swellSize: {
      min: 2.1,
      max: 4.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 16,
    },
    waterTemp: {
      summer: 16, // Based on current reading
      winter: 12,
    },
    hazards: ["Rip currents", "Strong currents", "Remote location"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1234,
      lng: 18.4567,
    },
  },
  {
    id: "hangklip-lighthouse",
    name: "Hangklip Lighthouse",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Pringle Bay",
    distanceFromCT: 250, // Approximate distance, please adjust if needed
    optimalWindDirections: ["NW"], // Best wind direction is from the northwest
    optimalSwellDirections: {
      min: 180, // W swell direction
      max: 230,
    },
    bestSeasons: ["winter"], // Assuming winter based on W swell direction
    optimalTide: "All", // No specific tide mentioned
    description:
      "Consistent reef break offering reliable conditions when other spots might not be working.",
    difficulty: "Intermediate",
    waveType: "Reef Break",
    swellSize: {
      min: 2.1,
      max: 3.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 16,
    },
    waterTemp: {
      summer: 20, // Based on current reading
      winter: 15,
    },
    hazards: ["Rocks", "Strong currents", "Remote location"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1234,
      lng: 18.4567,
    },
  },
  {
    id: "moonlight-bay",
    name: "Moonlight Bay",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Betty's Bay",
    distanceFromCT: 90, // Approximate distance from Cape Town in km
    optimalWindDirections: ["E", "NE", "SE"],
    optimalSwellDirections: {
      min: 180, // S
      max: 200, // SW
      cardinal: "S to SW",
    },
    bestSeasons: ["winter"], // Added based on swell direction preference
    optimalTide: "All",
    description:
      "Right-hand reef break in Betty's Bay offering waves suitable for intermediate surfers. Works on all tides but conditions vary. Multiple sections with rocky bottom require careful navigation. Local knowledge beneficial due to strong local surf community presence.",
    difficulty: "Intermediate",
    waveType: "Reef Break",
    swellSize: {
      min: 2.1,
      max: 4.6,
    },
    idealSwellPeriod: {
      min: 12,
      max: 24,
    },
    waterTemp: {
      summer: 18,
      winter: 14,
    },
    hazards: ["Rocks", "Rip currents", "Localism"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1234,
      lng: 18.4567,
    },
  },
  {
    id: "harold-porter",
    name: "Harold Porter",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Betty's Bay",
    distanceFromCT: 90, // Approximate distance from Cape Town in km
    optimalWindDirections: ["N", "NE", "NW"],
    optimalSwellDirections: {
      min: 150, // S
      max: 200, // SW
      cardinal: "S to SW",
    },
    bestSeasons: ["winter"], // Added based on swell direction preference
    optimalTide: "Mid",
    description:
      "Incredible reef break that breaks rarely, only on massive swell.",
    difficulty: "Advanced",
    waveType: "Reef Break",
    swellSize: {
      min: 3,
      max: 4.6,
    },
    idealSwellPeriod: {
      min: 12,
      max: 24,
    },
    waterTemp: {
      summer: 18,
      winter: 14,
    },
    hazards: ["Rocks", "Rip currents", "Sharks", "Remote location"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1234,
      lng: 18.4567,
    },
  },
  {
    id: "thermopylae",
    name: "Thermopylae",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Cape Peninsula",
    distanceFromCT: 40, // Approximate distance, please adjust if needed
    optimalWindDirections: ["SE"],
    optimalSwellDirections: {
      min: 225, // SW
      max: 247.5, // WSW
      cardinal: "SW to WSW",
    },
    bestSeasons: ["winter"], // Added based on big swell requirement
    optimalTide: "Mid to High",
    description:
      "Powerful left-hand reef break that works only on big to massive swells. Wave wraps around and creates powerful sections along its 200m length. Located just inside a shipwreck with a critical takeoff. Despite being more protected than exposed breaks, experiences very strong currents. Inconsistent (3/10) but moderately crowded (5/10) when working. Requires solid swell to break but offers quality waves when conditions align.",
    difficulty: "Advanced",
    waveType: "Reef Break",
    swellSize: {
      min: 1.8, // Chest high
      max: 4.7, // Double overhead
    },
    idealSwellPeriod: {
      min: 12,
      max: 18,
    },
    waterTemp: {
      summer: 16,
      winter: 12,
    },
    hazards: ["Rocks", "Strong currents", "Shipwreck", "Critical takeoff"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1012,
      lng: 18.4987,
    },
  },
  {
    id: "virgin-point",
    name: "Virgin Point",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Cape Peninsula",
    distanceFromCT: 40, // Approximate distance, please adjust if needed
    optimalWindDirections: ["SE"],
    optimalSwellDirections: {
      min: 225, // SW
      max: 247.5, // WSW
      cardinal: "SW to WSW",
    },
    bestSeasons: ["winter"], // Added based on big swell requirement
    optimalTide: "Mid to High",
    description:
      "Quality left-hand point break offering heavy barrels and performance walls along a 200m stretch. Wave breaks over boulder-covered bottom. Extremely difficult access requiring steep mountain descent and rock hop to reach lineup. Return climb equally challenging. Despite heavy conditions, spot maintains moderate consistency (5/10) and relatively uncrowded (3/10) due to access difficulty. Handles large swells well but demands advanced skill level.",
    difficulty: "Advanced",
    waveType: "Point Break",
    swellSize: {
      min: 2.0, // Head high
      max: 5.5, // Triple overhead
    },
    idealSwellPeriod: {
      min: 12,
      max: 18,
    },
    waterTemp: {
      summer: 16,
      winter: 12,
    },
    hazards: ["Rocks", "Difficult access", "Heavy waves", "Strong currents"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1012,
      lng: 18.4987,
    },
  },
  {
    id: "bellows",
    name: "Bellows 💀", // Added skull emoji
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Cape Peninsula",
    distanceFromCT: 45, // Approximate distance to offshore location
    optimalWindDirections: ["N", "NE", "NW"],
    optimalSwellDirections: {
      min: 135, // SE
      max: 225, // SW
      cardinal: "SE to SW",
    },
    bestSeasons: ["winter"], // Added based on big swell requirement
    optimalTide: "All",
    description:
      "Offshore big wave break located southwest of Seal Island. Offers both left and right options with the left being superior, capable of producing quality barrels. Boat access only and extremely sharky due to proximity to Seal Island's large Great White population. Wave consistency is moderate (4/10) but spot remains virtually empty (1/10) due to location and hazards. Best surfed on calm days due to unpredictable offshore winds. Requires significant experience and proper big wave equipment.",
    difficulty: "Advanced",
    waveType: "Reef Break",
    swellSize: {
      min: 3.0, // Double overhead
      max: 12.0, // Was 5.5
    },
    idealSwellPeriod: {
      min: 12,
      max: 18,
    },
    waterTemp: {
      summer: 16,
      winter: 12,
    },
    hazards: ["Sharks", "Remote location", "Boat access only", "Big waves"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false, // While shark population is high, no recorded attacks at this specific break
    },
    image: "",
    coordinates: {
      lat: -34.1012,
      lng: 18.4987,
    },
  },
  {
    id: "i&js",
    name: "I&J's",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Cape Peninsula",
    distanceFromCT: 40, // Approximate distance
    optimalWindDirections: ["NE"],
    optimalSwellDirections: {
      min: 225, // SW
      max: 247.5, // WSW
      cardinal: "SW to WSW",
    },
    bestSeasons: ["winter"], // Added based on SW swell requirement
    optimalTide: "Low to Mid",
    description:
      "High-performance right-hand reef break offering multiple sections along a 300m stretch. Main peak provides long, rippable walls with good reform section inside. Several distinct takeoff zones spread across interconnected reef systems. Wave quality ranges from performance walls to more forgiving reform sections, making it suitable for varying skill levels. Relatively consistent (6/10) with moderate crowd levels (3/10). Rock bottom requires careful navigation, especially on lower tides. Best performance on SW swell with clean NE winds. Location near K365 offers alternative options when conditions align.",
    difficulty: "Intermediate",
    waveType: "Reef Break",
    swellSize: {
      min: 1.6, // Waist high
      max: 3.7, // Double overhead
    },
    idealSwellPeriod: {
      min: 12,
      max: 18,
    },
    waterTemp: {
      summer: 16,
      winter: 12,
    },
    hazards: ["Rocks", "Reef", "Strong currents"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1234,
      lng: 18.4567,
    },
  },

  {
    id: "yellow-sands",
    name: "Yellow Sands",
    continent: "Africa",
    country: "South Africa",
    region: "Eastern Cape",
    location: "Amatola Coastal",
    distanceFromCT: 950, // Approximate distance
    optimalWindDirections: ["SW", "W"], // Based on regional patterns
    optimalSwellDirections: {
      min: 135, // SE
      max: 225, // SW
      cardinal: "SE to SW",
    },
    bestSeasons: ["winter", "summer"], // Works year-round with right conditions
    optimalTide: "Low to Mid",
    description:
      "Classic right-hand point break in the Eastern Cape offering long, peeling waves over a rock and reef bottom. Known for its consistency and quality when conditions align. Multiple sections provide opportunities for both barrel sections and performance surfing. Remote location helps keep crowds moderate despite quality waves. Local knowledge valuable for navigating rocks and optimal tide timing. Watch for sea urchins on rocks during entry/exit.",
    difficulty: "Intermediate",
    waveType: "Point Break",
    swellSize: {
      min: 1.6, // Shoulder high
      max: 3.5, // Double overhead
    },
    idealSwellPeriod: {
      min: 12,
      max: 16,
    },
    waterTemp: {
      summer: 21,
      winter: 17,
    },
    hazards: ["Rocks", "Sharks", "Urchins", "Localism"],
    crimeLevel: "Medium",
    sharkAttack: {
      hasAttack: false, // No recorded incidents at this specific break
    },
    image: "",
    coordinates: {
      lat: -34.1234,
      lng: 18.4567,
    },
  },
  {
    id: "365s",
    name: "365s",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Kommetjie",
    distanceFromCT: 25,
    optimalWindDirections: ["NE"],
    optimalSwellDirections: {
      min: 270, // Changed: West swell (270°)
      max: 280, // Allowing some variation
      cardinal: "W", // Updated to match description
    },
    bestSeasons: ["winter", "autumn"], // Updated: works year-round but summer tends to be flat
    optimalTide: "Low to Mid",
    description:
      "Exposed reef break offering both left and right options. Fairly consistent waves except during summer months. Best conditions occur with west swell and northeast winds, though can handle light onshore conditions. Clean groundswells prevail. Usually uncrowded even with good waves. Access requires careful navigation of rocks and kelp beds.",
    difficulty: "Intermediate", // Changed from "All Levels" given reef break nature
    waveType: "Reef Break", // Changed from "Beach Break" to match description
    swellSize: {
      min: 1.6, // Adjusted to more typical reef break minimums
      max: 3.0, // Adjusted based on typical conditions
    },
    idealSwellPeriod: {
      min: 12,
      max: 18,
    },
    waterTemp: {
      summer: 19, // Updated based on current reading of 18.8°C
      winter: 12,
    },
    hazards: ["Rocks", "Sharks", "Kelp"], // Updated to match description
    crimeLevel: "Medium",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1234,
      lng: 18.4567,
    },
  },
  {
    id: "olifants-bos",
    name: "Olifants Bos",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Cape Peninsula",
    distanceFromCT: 40, // Approximate distance, please adjust if needed
    optimalWindDirections: ["SE"],
    optimalSwellDirections: {
      min: 247.5, // WSW
      max: 270, // W
      cardinal: "WSW to W",
    },
    bestSeasons: ["winter"], // Added based on typical swell patterns
    optimalTide: "All", // No specific tide information provided
    description:
      "Fairly consistent reef and point break combination offering quality waves when conditions align. Works best with WSW swell and SE offshore winds. Multiple sections available due to mixed reef and point setup. Despite good rating, rarely crowded.",
    difficulty: "Intermediate",
    waveType: "Reef Break", // Listed as both reef and point, but primary characteristic seems to be reef
    swellSize: {
      min: 1.6,
      max: 2.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 16,
    },
    waterTemp: {
      summer: 19, // Based on current reading of 18.9°C
      winter: 14,
    },
    hazards: ["Rocks", "Strong currents", "Remote location"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1234,
      lng: 18.4567,
    },
  },
  {
    id: "extensions",
    name: "Extensions",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Cape Peninsula",
    distanceFromCT: 35, // Approximate distance, please adjust if needed
    optimalWindDirections: ["E"],
    optimalSwellDirections: {
      min: 270, // W
      max: 280, // Allowing some variation
      cardinal: "W",
    },
    bestSeasons: ["winter"], // Added based on typical Cape Peninsula patterns
    optimalTide: "All", // No specific tide information provided
    description:
      "Mixed beach and reef break setup offering fairly consistent waves. Best performance comes from west swell combined with easterly offshore winds. Multiple peak options available due to combined beach and reef configuration. Despite good rating, typically uncrowded.",
    difficulty: "Intermediate",
    waveType: "Beach and Reef Break", // Listed as both beach and reef
    swellSize: {
      min: 1.6,
      max: 4.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 16,
    },
    waterTemp: {
      summer: 20, // Based on current reading of 19.9°C
      winter: 14,
    },
    hazards: ["Rocks", "Rip currents", "Strong currents"],
    crimeLevel: "Medium",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1234,
      lng: 18.4567,
    },
  },
  {
    id: "bikini-beach",
    name: "Bikini Beach",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Gordon's Bay",
    distanceFromCT: 50, // Approximate distance in km
    optimalWindDirections: ["ESE"], // Wind coming FROM ESE (offshore)
    optimalSwellDirections: {
      min: 225, // SW
      max: 247.5, // Allowing some variation towards WSW
      cardinal: "SW",
    },
    bestSeasons: ["winter"], // SW swell typically more common in winter
    optimalTide: "All", // No specific tide information provided
    description:
      "Point break in Gordon's Bay that rarely breaks but can produce quality waves when conditions align. Best performance comes from SW swell with ESE offshore winds.",
    difficulty: "Intermediate",
    waveType: "Point Break",
    swellSize: {
      min: 2.8,
      max: 4.6,
    },
    idealSwellPeriod: {
      min: 12,
      max: 24,
    },
    waterTemp: {
      summer: 20, // Based on current reading of 19.9°C
      winter: 16,
    },
    hazards: ["Inconsistent waves", "Rocks"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1234,
      lng: 18.4567,
    },
  },
  {
    id: "second-beach",
    name: "Second Beach 💀", // Added skull emoji due to multiple fatal shark attacks
    continent: "Africa",
    country: "South Africa",
    region: "Eastern Cape",
    location: "Port St Johns",
    distanceFromCT: 1200,
    optimalWindDirections: ["W", "SW"],
    optimalSwellDirections: {
      min: 135,
      max: 225,
    },
    bestSeasons: ["summer"],
    optimalTide: "Mid",
    description:
      "Powerful beach break known for its consistent waves and unfortunately, frequent shark activity. Multiple peaks along the beach with both lefts and rights. Best on SW swell with light offshore winds.",
    difficulty: "Advanced",
    waveType: "Beach Break",
    swellSize: {
      min: 1.6,
      max: 4.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 16,
    },
    waterTemp: {
      summer: 22,
      winter: 18,
    },
    hazards: ["Sharks", "Strong currents", "Rip currents"],
    crimeLevel: "Medium",
    sharkAttack: {
      hasAttack: true,
      incidents: [
        {
          date: "2012-01-15",
          outcome: "Fatal",
          details: "Lungisani Msungubana (25) attacked in waist-deep water",
        },
        {
          date: "2011-01-15",
          outcome: "Fatal",
          details: "Zama Ndamase (16) fatal attack while surfing",
        },
        {
          date: "2009-12-18",
          outcome: "Fatal",
          details: "Tshintshekile Nduva (22) attacked while paddle boarding",
        },
        {
          date: "2009-01-24",
          outcome: "Fatal",
          details: "Sikhanyiso Bangilizwe (27) fatal attack while swimming",
        },
        {
          date: "2007-01-14",
          outcome: "Fatal",
          details: "Sibulele Masiza (24) disappeared while bodyboarding",
        },
      ],
    },
    image: "",
    coordinates: {
      lat: -34.1234,
      lng: 18.4567,
    },
  },
  {
    id: "black-rocks",
    name: "Black Rocks 💀", // Added skull emoji due to extreme wave conditions
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Cape Peninsula",
    distanceFromCT: 40, // Approximate distance, please adjust if needed
    optimalWindDirections: ["NE"],
    optimalSwellDirections: {
      min: 180, // S
      max: 225, // SW
      cardinal: "S to SW",
    },
    bestSeasons: ["winter"], // Added based on massive swell requirement
    optimalTide: "Mid to High",
    description:
      "World-class reef break offering massive barreling A-frame waves breaking both left and right for up to 100m over shallow rock shelf. Requires huge swell to start working properly - minimum double overhead. Extremely heavy wave with serious consequences. Strong localism - lineup limited to 10 surfers maximum and local knowledge/connections essential. Step-up or gun recommended as size increases. Despite needing massive swell, offers moderate consistency (5/10) when conditions align. Very crowded (8/10) on working days due to limited takeoff zone and strict hierarchy.",
    difficulty: "Advanced",
    waveType: "Reef Break",
    swellSize: {
      min: 2.0, // Double overhead minimum
      max: 6.0, // Was 4.0
    },
    idealSwellPeriod: {
      min: 12,
      max: 18,
    },
    waterTemp: {
      summer: 16,
      winter: 12,
    },
    hazards: ["Rocks", "Heavy waves", "Shallow reef", "Strong localism"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1012,
      lng: 18.4987,
    },
  },
  {
    id: "sunset-reef",
    name: "Sunset Reef 💀", // Added skull emoji due to big wave conditions and shark presence
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Kommetjie",
    distanceFromCT: 40,
    optimalWindDirections: ["SE", "SSE"],
    optimalSwellDirections: {
      min: 157.5,
      max: 247.5,
    },
    bestSeasons: ["winter"],
    optimalTide: "High",
    description:
      "Legendary big wave reef break located off Long Beach. Starts working at 12ft and holds up to 40ft faces. Three distinct sections: 'The Peak' (main outside bowl), 'The Wall' (middle section), and 'The Inside' (end section). Requires solid SW-WSW groundswell with 15+ second period and light SE winds under 12 knots. Deep water channel on south side aids boat access, but paddle-outs extremely challenging (45+ minutes) and recommended only for elite surfers. Wave faces pitch steeply over reef creating critical takeoff zone - precise positioning essential. Multiple boils indicate shallow sections. Strong currents can push surfers far outside lineup - boat support strongly recommended. Best during winter months (June-August) when large groundswells coincide with favorable winds. Heavy localism - respect established hierarchy. Only attempt with proper big wave equipment, safety team, and significant experience. Known great white shark territory - multiple encounters reported.",
    difficulty: "Advanced",
    waveType: "Reef Break",
    swellSize: {
      min: 3.5,
      max: 6,
    },
    idealSwellPeriod: {
      min: 12,
      max: 24,
    },
    waterTemp: {
      summer: 16,
      winter: 12,
    },
    hazards: ["Rocks", "Strong currents", "Big waves"],
    crimeLevel: "Medium",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1234,
      lng: 18.4567,
    },
    videos: [
      {
        url: "https://www.youtube.com/watch?v=9ITLxvOHLaE&ab_channel=TonyLindeque%28LearntoDiveToday%29",
        title: "Swell at Sunset Reef, Kommetjie",
        platform: "youtube",
      },
    ],
  },
  {
    id: "gabathan",
    name: "Gabathan",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Muizenberg",
    distanceFromCT: 26,
    optimalWindDirections: ["NW", "N", "NE", "WNW"], // Removed WNW as it's more cross-shore
    optimalSwellDirections: {
      min: 112.5, // ESE
      max: 157.5, // SSE
      cardinal: "SE", // Keeping the cardinal direction as SE
    },
    bestSeasons: ["winter"],
    optimalTide: "All",
    description:
      "Second circle toward Baden Powell Drive from Muizenberg beach, opposite the bottle store. Consistent beach break offering both lefts and rights. Similar wave mechanics to main Muizenberg but typically less crowded. Wave quality varies with sand bank conditions. Best early morning before wind picks up. Popular with locals who want to avoid main beach crowds.",
    difficulty: "Beginner",
    waveType: "Beach Break",
    swellSize: {
      min: 1.8,
      max: 4.6,
    },
    idealSwellPeriod: {
      min: 12,
      max: 24,
    },
    waterTemp: {
      summer: 20,
      winter: 15,
    },
    hazards: ["Potential theft", "Sharks"],
    crimeLevel: "Medium",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1234,
      lng: 18.4567,
    },
  },

  {
    id: "herolds-bay",
    name: "Herolds Bay",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Garden Route",
    distanceFromCT: 430, // Approximate distance
    optimalWindDirections: ["NNW", "N"], // North-northwest as specified
    optimalSwellDirections: {
      min: 112.5, // ESE is approximately 112.5°
      max: 135, // SE is 135°
      cardinal: "ESE",
    },
    bestSeasons: ["winter"], // Typical for Western Cape
    optimalTide: "Mid", // Using mid tide as default since not specified
    description:
      "Protected bay break that works best with East-southeast swell and North-northwest winds. Offers both lefts and rights depending on swell direction and sand banks.",
    difficulty: "All Levels",
    waveType: "Beach Break",
    swellSize: {
      min: 2,
      max: 4.2,
    },
    idealSwellPeriod: {
      min: 12,
      max: 18,
    },
    waterTemp: {
      summer: 21, // Typical for this region
      winter: 17,
    },
    hazards: ["Rocks", "Rip currents"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1234, // Please update with actual coordinates
      lng: 18.4567,
    },
  },
  {
    id: "gerickes-point",
    name: "Gerickes Point",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Sedgefield",
    distanceFromCT: 485, // Approximate distance
    optimalWindDirections: ["E"], // East as specified
    optimalSwellDirections: {
      min: 170, // South swell as specified
      max: 190,
      cardinal: "S",
    },
    bestSeasons: ["winter", "summer"], // Fairly consistent year-round
    optimalTide: "Mid", // Using mid tide as default since not specified
    description:
      "Highly rated point break known for its fairly consistent waves. Works best with South swell and East winds. Located near Sedgefield, this spot offers quality waves when conditions align.",
    difficulty: "Intermediate",
    waveType: "Point Break",
    swellSize: {
      min: 1.6,
      max: 4.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 18,
    },
    waterTemp: {
      summer: 23, // Based on provided current temp
      winter: 17,
    },
    hazards: ["Rocks", "Strong currents", "Remote location"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1234,
      lng: 18.4567,
    },
  },
  {
    id: "reunion",
    name: "Reunion",
    continent: "Africa",
    country: "South Africa",
    region: "KwaZulu-Natal",
    location: "Durban South",
    distanceFromCT: 1600,
    optimalWindDirections: ["NE"],
    optimalSwellDirections: {
      min: 180, // S
      max: 202.5, // SSW
      cardinal: "S",
    },
    bestSeasons: ["winter"],
    optimalTide: "All",
    description:
      "Consistent beach break located along Durban's Golden Mile. Multiple peaks offering both lefts and rights. Protected by shark nets and regular lifeguard patrols. Best performance on southerly swells with offshore NE winds. Wave quality ranges from punchy closeouts to longer workable walls depending on sandbank configuration. Works year-round but winter brings cleaner conditions. Popular spot that can get crowded during peak times. Good facilities including parking, showers, and restaurants nearby. Reunion Beach is located south of Durban, near Isipingo in KwaZulu-Natal, South Africa. It is further down the coast and is known for its less crowded and tranquil environment. It's a favorite among locals for fishing and relaxing away from the hustle of Durban's central beaches.",
    difficulty: "All Levels",
    waveType: "Beach Break",
    swellSize: {
      min: 1.6,
      max: 5.5,
    },
    idealSwellPeriod: {
      min: 10,
      max: 14,
    },
    waterTemp: {
      summer: 24,
      winter: 20,
    },
    hazards: ["Crowds", "Rip currents", "Strong currents"],
    crimeLevel: "Medium",
    sharkAttack: {
      hasAttack: false, // Protected by shark nets
    },
    image: "",
    coordinates: {
      lat: -29.8584,
      lng: 31.0384,
    },
    videos: [
      {
        url: "https://www.youtube.com/watch?v=pyGKFdswk_k&ab_channel=KulumaTv",
        title: "Surfing South of Durban 9th April 2016 Big Swell",
        platform: "youtube",
      },
      {
        url: "https://www.youtube.com/watch?v=sDGlPLtHhk0",
        title:
          "Finding waves in KwaZulu-Natal, South Africa. Billabong team riders Emma Smith, Zoe Steyn, Crystal Hulett and Tanika Hoffman show us life on their side of the pond in South Africa. ",
        platform: "youtube",
      },
    ],
  },
  {
    id: "ansteys",
    name: "Ansteys",
    continent: "Africa",
    country: "South Africa",
    region: "KwaZulu-Natal",
    location: "Durban",
    distanceFromCT: 1600,
    optimalWindDirections: ["NW"],
    optimalSwellDirections: {
      min: 90, // E
      max: 112.5, // ESE
      cardinal: "E",
    },
    bestSeasons: ["winter"],
    optimalTide: "All",
    description:
      "Beach break with a rating of 4/5, known for its inconsistent but quality waves when conditions align. Requires specific east swell direction with northwest winds to work properly. Part of Durban's beach break system, protected by shark nets and regular lifeguard patrols. Wave quality can vary significantly depending on swell direction and sandbank configuration. Despite inconsistency, can produce excellent waves during ideal conditions. Good facilities including parking, showers, and restaurants nearby.",
    difficulty: "Intermediate",
    waveType: "Beach Break",
    swellSize: {
      min: 1.6,
      max: 5.5,
    },
    idealSwellPeriod: {
      min: 10,
      max: 14,
    },
    waterTemp: {
      summer: 24,
      winter: 20,
    },
    hazards: ["Crowds", "Rip currents", "Strong currents"],
    crimeLevel: "Medium",
    sharkAttack: {
      hasAttack: false, // Protected by shark nets
    },
    image: "",
    coordinates: {
      lat: -29.8622,
      lng: 31.0389,
    },
  },
  {
    id: "baggies",
    name: "Baggies",
    continent: "Africa",
    country: "South Africa",
    region: "KwaZulu-Natal",
    location: "Umkomaas",
    distanceFromCT: 1650,
    optimalWindDirections: ["NW"],
    optimalSwellDirections: {
      min: 135, // SE
      max: 157.5, // SSE
      cardinal: "SE",
    },
    bestSeasons: ["winter"],
    optimalTide: "Mid",
    description:
      "Fairly consistent point break rated 3/5, located south of Durban. Right-hand wave that works best with southeast swell and northwest winds. Protected by shark nets. Wave offers multiple sections with both hollow and wall sections depending on size and direction. While not as famous as some nearby breaks, provides reliable waves when conditions align. Popular with locals and can get crowded on good days. Access via stairs from parking area. Watch for strong currents around point.",
    difficulty: "Intermediate",
    waveType: "Point Break",
    swellSize: {
      min: 1.6,
      max: 5.5,
    },
    idealSwellPeriod: {
      min: 10,
      max: 14,
    },
    waterTemp: {
      summer: 24,
      winter: 20,
    },
    hazards: ["Rocks", "Strong currents", "Crowds"],
    crimeLevel: "Medium",
    sharkAttack: {
      hasAttack: false, // Protected by shark nets
    },
    image: "",
    coordinates: {
      lat: -30.2066,
      lng: 30.8026,
    },
  },
  {
    id: "salt-rock",
    name: "Salt Rock",
    continent: "Africa",
    country: "South Africa",
    region: "KwaZulu-Natal",
    location: "Salt Rock",
    distanceFromCT: 1700,
    optimalWindDirections: ["NW"],
    optimalSwellDirections: {
      min: 180, // S
      max: 202.5, // SSW
      cardinal: "S",
    },
    bestSeasons: ["winter"],
    optimalTide: "Mid",
    description:
      "Reef break rated 2/5, offering fairly consistent waves north of Durban. Works best with south swell and northwest winds. Despite lower rating, provides reliable options when conditions align. Wave breaks over shallow reef creating both lefts and rights. Protected by shark nets. Popular with local surfers and can get crowded on weekends. Good facilities including parking, showers, and nearby restaurants. Watch for exposed reef at low tide.",
    difficulty: "Intermediate",
    waveType: "Reef Break",
    swellSize: {
      min: 1.6,
      max: 5.0,
    },
    idealSwellPeriod: {
      min: 10,
      max: 14,
    },
    waterTemp: {
      summer: 25,
      winter: 21,
    },
    hazards: ["Shallow reef", "Rocks", "Strong currents"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false, // Protected by shark nets
    },
    image: "",
    coordinates: {
      lat: -29.4974,
      lng: 31.2337,
    },
  },
  {
    id: "scottburgh-point",
    name: "Scottburgh Point",
    continent: "Africa",
    country: "South Africa",
    region: "KwaZulu-Natal",
    location: "Scottburgh",
    distanceFromCT: 1630,
    optimalWindDirections: ["WSW"],
    optimalSwellDirections: {
      min: 180, // S
      max: 202.5, // SSW
      cardinal: "S",
    },
    bestSeasons: ["winter"],
    optimalTide: "Mid",
    description:
      "Fairly consistent point break rated 3/5, located south of Durban. Right-hand wave that works best with south swell and west-southwest winds. Protected by shark nets. Wave offers multiple sections that can link up on good days, providing long rides. Popular spot that can handle size while remaining relatively manageable. Gets crowded on weekends and during good conditions. Good facilities including parking, lifeguards, and nearby amenities. Watch for strong currents around the point and rocks at low tide.",
    difficulty: "Intermediate",
    waveType: "Point Break",
    swellSize: {
      min: 0.6,
      max: 5.5,
    },
    idealSwellPeriod: {
      min: 10,
      max: 14,
    },
    waterTemp: {
      summer: 24,
      winter: 20,
    },
    hazards: ["Rocks", "Strong currents", "Crowds"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false, // Protected by shark nets
    },
    image: "",
    coordinates: {
      lat: -30.2853,
      lng: 30.7544,
    },
  },
  {
    id: "skeleton-bay",
    name: "Skeleton Bay",
    continent: "Africa",
    country: "Namibia", // Changed from South Africa to Namibia
    region: "Swakopmund",
    location: "Skeleton Coast",
    distanceFromCT: 1800,
    optimalWindDirections: ["NE", "ENE", "E"],
    optimalSwellDirections: {
      min: 205.5, // SSW
      max: 232.5, // WSW
      cardinal: "SW",
    },
    bestSeasons: ["winter"],
    optimalTide: "Low to Mid",
    description:
      "World-renowned left-hand point break producing incredibly long barrels. One of the longest waves in the world, offering rides up to 2km long. Extremely challenging wave that breaks over a sand bottom. Works best with large SW swells and offshore NE winds. Very consistent during winter months but highly sensitive to conditions. Remote location requires careful planning.",
    difficulty: "Expert",
    waveType: "Point Break",
    swellSize: {
      min: 2.5,
      max: 5.5,
    },
    idealSwellPeriod: {
      min: 15,
      max: 20,
    },
    waterTemp: {
      summer: 16,
      winter: 14,
    },
    hazards: [
      "Remote location",
      "Strong currents",
      "Long paddle back",
      "Desert environment",
      "No easy access to hospitals or surf rescue",
      "Strong currents & heavy paddle back",
      "Extremely fast and powerful",
    ],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "/images/beaches/td-skeleton.jpg",
    coordinates: {
      lat: -22.6847,
      lng: 14.5267,
    },
    videos: [
      {
        url: "https://www.youtube.com/watch?v=5QVedTOKVyE&pp=ygUbbmFtaWJpYSBza2VsZXRvbiBjb2FzdCBzdXJm",
        title: "Mirage: The ever-changing story of Skeleton Bay",
        platform: "youtube",
      },
      {
        url: "https://www.youtube.com/watch?v=nokOsu_jaf4&pp=ygUbbmFtaWJpYSBza2VsZXRvbiBjb2FzdCBzdXJm",
        title: "Surfing Skeleton Bay, Namibia",
        platform: "youtube",
      },
      {
        url: "https://www.youtube.com/watch?v=g_iS1VM8dFc&pp=ygUbbmFtaWJpYSBza2VsZXRvbiBjb2FzdCBzdXJm",
        title: "Koa Smith Skeleton Bay 2018: POV GoPro angle",
        platform: "youtube",
      },
      {
        url: "https://www.youtube.com/watch?v=A9_ylHhkzdw&pp=ygUZbWF0dCBicm9tbGV5IHNrZWxldG9uIGJheQ%3D%3D",
        title: "Kite Surfer tows Matt Bromley into Donkey Bay Namibia",
        platform: "youtube",
      },
      {
        url: "https://www.youtube.com/watch?v=F7JuK1d5Zvg&ab_channel=BillabongSouthAfrica",
        title: "The Donkey | Unleashed",
        platform: "youtube",
      },
    ],
  },

  {
    id: "off-the-wall",
    name: "Off The Wall",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Sea Point",
    distanceFromCT: 5,
    optimalWindDirections: ["SE", "ESE"],
    optimalSwellDirections: {
      min: 245, // SW
      max: 270, // W
      cardinal: "SW",
    },
    bestSeasons: ["winter"],
    optimalTide: "Mid to High",
    description:
      "Powerful reef break located along Sea Point's promenade. Wave quality highly dependent on swell size and direction - needs significant swell to break properly. Best performance comes from SW groundswell combined with SE winds. Creates intense peaks and occasional barrels during bigger swells. Popular spot for experienced surfers during winter storms. Watch for exposed rocks and strong currents. Easy access from promenade but challenging paddle-out.",
    difficulty: "Advanced",
    waveType: "Reef Break",
    swellSize: {
      min: 2.1,
      max: 6.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 18,
    },
    waterTemp: {
      summer: 18,
      winter: 14,
    },
    hazards: ["Rocks", "Strong currents", "Shallow reef"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -33.9144,
      lng: 18.3879,
    },
    videos: [
      {
        url: "https://www.youtube.com/watch?v=7wTdB-5o1F4&pp=ygUjc2VhIHBvaW50IHN1cmZpbmcgaGFyYm9yIHdlZGdlIHRhdW4%3D",
        title: "ALL IS SWELL - Harbour Wedge & Sea Point Surfing | Cape Town",
        platform: "youtube",
      },
    ],
  },
  {
    id: "guns",
    name: "Guns",
    continent: "Africa",
    country: "Namibia", // Changed from South Africa to Namibia
    region: "Swakopmund",
    location: "Skeleton Coast",
    distanceFromCT: 1800,
    optimalWindDirections: ["ENE", "E", "NE"],
    optimalSwellDirections: {
      min: 247.5, // WSW
      max: 270, // W
      cardinal: "WSW",
    },
    bestSeasons: ["winter"],
    optimalTide: "All",
    description:
      "Powerful point break located along Namibia's remote Skeleton Coast. Offers long, hollow right-handers that can reach exceptional sizes. Best performance comes from WSW groundswells with ENE winds. Wave provides multiple barrel sections over a 300m+ ride. Extremely isolated location requires careful planning and permits. Handles large swells while maintaining shape. Strong currents demand excellent fitness. Early morning sessions typically offer cleanest conditions. Watch for strong rip currents and shifting sandbanks. Remote location means bringing all supplies essential. Winter brings most consistent conditions with powerful groundswells.",
    difficulty: "Advanced",
    waveType: "Point Break",
    swellSize: {
      min: 2.2,
      max: 8.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 20,
    },
    waterTemp: {
      summer: 17,
      winter: 14,
    },
    hazards: [
      "Remote location",
      "Strong currents",
      "Rocks",
      "No facilities",
      "Desert environment",
    ],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -22.6792,
      lng: 14.5272,
    },
    videos: [
      {
        url: "https://www.youtube.com/watch?v=2qVJuzh1TQU&ab_channel=ShannonVolschenk",
        title: "29 - 01 - 2016 Surfing Guns, Namibia *dolphins included!",
        platform: "youtube",
      },
      {
        url: "https://www.youtube.com/watch?v=ika_dV3KUT8&ab_channel=DamienLackey",
        title: "namibia surfing 2014 guns",
        platform: "youtube",
      },
    ],
  },
  {
    id: "anchor-point",
    name: "Anchor Point",
    continent: "Africa",
    country: "Morocco",
    region: "Morocco",
    location: "Taghazout",
    distanceFromCT: 7500, // Approximate distance from Cape Town in km
    optimalWindDirections: ["NE"],
    optimalSwellDirections: {
      min: 292.5, // NW
      max: 315, // NNW
      cardinal: "NW",
    },
    bestSeasons: ["winter"], // October to March
    optimalTide: "Mid to High",
    description:
      "World-class right-hand point break producing long, perfect waves. Multiple sections offering steep drops, barrels, and walls over 500m rides. Best performance on NW groundswell with NE winds. Handles all sizes while maintaining shape. Very consistent during winter months. Rock bottom creates perfect shape but demands respect. Popular international destination - expect crowds during peak season.",
    difficulty: "Advanced",
    waveType: "Point Break",
    swellSize: {
      min: 1.0,
      max: 5.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 20,
    },
    waterTemp: {
      summer: 21,
      winter: 18,
    },
    hazards: ["Rocks", "Strong currents", "Crowds", "Urchins"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: 30.5453,
      lng: -9.7097,
    },
    videos: [
      {
        url: "https://www.youtube.com/watch?v=Pq7jVrmRLWI&ab_channel=SurfRawFiles",
        title:
          "Anchor Point - Morocco - RAWFILES - Anchor Point is located in Central Morocco, the north side of the small surf town, Taghazout. Its probably the best wave in Morocco and one of the best in Africa!",
        platform: "youtube",
      },
      {
        url: "https://www.youtube.com/watch?v=CucTAx7eRro&ab_channel=TheAdventureLocker",
        title: "Surfing in Africa 🏄🗺️ #surf #surffilm",
        platform: "youtube",
      },
    ],
  },
  {
    id: "koeel-bay",
    name: "Koeel Bay",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Boland",
    distanceFromCT: 45, // Approximate distance
    optimalWindDirections: ["NE", "E"],
    optimalSwellDirections: {
      min: 180, // S
      max: 240, // S
      cardinal: "S",
    },
    bestSeasons: ["winter"], // Added based on typical Western Cape patterns
    optimalTide: "All",
    description:
      "Quite exposed beach break offering fairly consistent waves. Works best with South swell and ESE winds. Multiple peaks provide both lefts and rights. Wave quality highly dependent on swell direction and sand bank conditions. Can get crowded when working. Watch for strong rips.",
    difficulty: "Intermediate",
    waveType: "Beach Break",
    swellSize: {
      min: 2.0,
      max: 5.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 18,
    },
    waterTemp: {
      summer: 21, // Based on current reading of 21.3°C
      winter: 17,
    },
    hazards: ["Rip currents", "Strong currents"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1234, // Please update with actual coordinates
      lng: 18.4567,
    },
  },
  {
    id: "jongensfontein",
    name: "Jongensfontein",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Overberg",
    distanceFromCT: 330, // Approximate distance
    optimalWindDirections: ["NW"],
    optimalSwellDirections: {
      min: 170, // S
      max: 190, // S
      cardinal: "S",
    },
    bestSeasons: ["winter"], // Typical for Western Cape reef breaks
    optimalTide: "All",
    description:
      "Consistent reef break rated 4/5 stars. Works best with South swell and Northwest offshore winds. Multiple sections offering quality waves when conditions align. Protected location helps maintain wave quality across various conditions.",
    difficulty: "Intermediate",
    waveType: "Reef Break",
    swellSize: {
      min: 0.6,
      max: 5.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 18,
    },
    waterTemp: {
      summer: 23, // Based on current reading of 22.9°C
      winter: 17,
    },
    hazards: ["Rocks", "Strong currents"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1234, // Please update with actual coordinates
      lng: 18.4567,
    },
  },
  {
    id: "dolphin-point",
    name: "Dolphin Point",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Overberg",
    distanceFromCT: 330, // Approximate distance, similar to nearby Jongensfontein
    optimalWindDirections: ["W"],
    optimalSwellDirections: {
      min: 170, // S
      max: 190, // S
      cardinal: "S",
    },
    bestSeasons: ["winter"], // Typical for Western Cape point breaks
    optimalTide: "All",
    description:
      "Consistent point break rated 4/5 stars. Works best with South swell and West offshore winds. Protected location helps maintain quality waves across various conditions. Multiple sections offering different wave characteristics depending on swell size and direction.",
    difficulty: "Intermediate",
    waveType: "Point Break",
    swellSize: {
      min: 1.6,
      max: 6.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 18,
    },
    waterTemp: {
      summer: 23, // Based on current reading of 22.9°C
      winter: 17,
    },
    hazards: ["Rocks", "Strong currents"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1234, // Please update with actual coordinates
      lng: 18.4567,
    },
  },
  {
    id: "kanon",
    name: "Kanon",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Overberg",
    distanceFromCT: 330, // Approximate distance based on region
    optimalWindDirections: ["WNW"],
    optimalSwellDirections: {
      min: 135, // SE
      max: 157.5, // SSE
      cardinal: "SE",
    },
    bestSeasons: ["winter"],
    optimalTide: "All", // "Surfable at all stages of the tide"
    description:
      "Sheltered reef break that rarely breaks but offers excellent quality waves when conditions align. Works best with Southeast groundswell and WNW offshore winds. Provides both left and right options over reef bottom. Despite high quality potential (5/5 rating), wave's rarity keeps crowds minimal. Location known for significant shark presence.",
    difficulty: "Advanced", // Given shark hazards and reef break nature
    waveType: "Reef Break",
    swellSize: {
      min: 2.2, // Higher minimum due to "rarely breaks"
      max: 6.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 18,
    },
    waterTemp: {
      summer: 23, // Based on current reading of 23.1°C
      winter: 17,
    },
    hazards: ["Sharks", "Reef", "Strong currents"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false, // While sharks are a major hazard, no specific attacks mentioned
    },
    image: "",
    coordinates: {
      lat: -34.1234, // Please update with actual coordinates
      lng: 18.4567,
    },
  },
  {
    id: "outer-pool",
    name: "Outer Pool",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Mossel Bay",
    distanceFromCT: 450, // Approximate distance
    optimalWindDirections: ["W"],
    optimalSwellDirections: {
      min: 157.5, // SSE
      max: 167.5, // SSE
      cardinal: "SSE",
    },
    bestSeasons: ["winter", "autumn", "spring"], // "Summer tends to be mostly flat"
    optimalTide: "Low to Mid", // "Best around low tide when the tide is rising"
    description:
      "Fairly exposed reef and point break combination offering reliable right-hand waves. Works best with SSE groundswell and westerly offshore winds. Despite consistent conditions, spot remains relatively uncrowded. Multiple sections available due to mixed reef and point setup. Summer months typically too small to surf. Careful navigation required due to urchins and rocks.",
    difficulty: "Intermediate",
    waveType: "Reef Break", // Listed as both reef and point, but primary characteristic seems to be reef
    swellSize: {
      min: 1.9,
      max: 6.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 18,
    },
    waterTemp: {
      summer: 23, // Based on current reading of 23.2°C
      winter: 17,
    },
    hazards: ["Rocks", "Urchins", "Rip currents"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1234, // Please update with actual coordinates
      lng: 18.4567,
    },
    videos: [
      {
        url: "https://www.youtube.com/watch?v=WnYnXiONb_U&ab_channel=StokedTheBrand",
        title: "Stoked Sessions • Surfing Mossel Bay - Stoked X Kane Johnstone",
        platform: "youtube",
      },
      {
        url: "https://www.youtube.com/watch?v=D3BJLfvuf3g&pp=ygUPbW9zc2VsIGJheSBzdXJm",
        title: "RAW: Mossel Bay, 5 July 2021 (Featuring Adin Masencamp)",
        platform: "youtube",
      },
      {
        url: "https://www.youtube.com/watch?v=vqSUqsLv1HA&ab_channel=SandyMarwick",
        title: "Surfing at Outer Pool, Mossel Bay",
        platform: "youtube",
      },
    ],
  },
  {
    id: "ding-dangs",
    name: "Ding Dangs",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Garden Route",
    distanceFromCT: 450, // Approximate distance based on Mossel Bay location
    optimalWindDirections: ["SW"],
    optimalSwellDirections: {
      min: 135, // SE
      max: 157.5, // SSE
      cardinal: "SE",
    },
    bestSeasons: ["winter"],
    optimalTide: "Low", // "Best around low tide"
    description:
      "Sheltered reef break offering fairly consistent waves with both left and right options. Works best with Southeast groundswell and Southwest offshore winds. Protected location helps maintain clean conditions. Despite good quality (4/5 rating), spot remains uncrowded. Careful navigation required due to urchins and rocks.",
    difficulty: "Intermediate",
    waveType: "Reef Break",
    swellSize: {
      min: 2.1,
      max: 7.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 18,
    },
    waterTemp: {
      summer: 23, // Based on current reading of 23.1°C
      winter: 17,
    },
    hazards: ["Rocks", "Urchins", "Rip currents"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1234, // Please update with actual coordinates
      lng: 18.4567,
    },
    videos: [
      {
        url: "https://www.youtube.com/watch?v=WnYnXiONb_U&ab_channel=StokedTheBrand",
        title: "Stoked Sessions • Surfing Mossel Bay - Stoked X Kane Johnstone",
        platform: "youtube",
      },
      {
        url: "https://www.youtube.com/watch?v=D3BJLfvuf3g&pp=ygUPbW9zc2VsIGJheSBzdXJm",
        title: "RAW: Mossel Bay, 5 July 2021 (Featuring Adin Masencamp)",
        platform: "youtube",
      },
      {
        url: "https://www.youtube.com/watch?v=vqSUqsLv1HA&ab_channel=SandyMarwick",
        title: "Surfing at Outer Pool, Mossel Bay",
        platform: "youtube",
      },
    ],
  },
  {
    id: "victoria-bay",
    name: "Victoria Bay",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Garden Route",
    distanceFromCT: 450, // Approximate distance
    optimalWindDirections: ["NNW"],
    optimalSwellDirections: {
      min: 170, // S
      max: 190, // S
      cardinal: "S",
    },
    bestSeasons: ["winter", "summer"], // Very consistent year-round
    optimalTide: "All",
    description:
      "Very consistent reef and point break combination rated 3/5. Works best with South swell and North-northwest offshore winds. Protected location helps maintain quality waves across various conditions. Multiple sections offering different wave characteristics. Popular spot that can get crowded during peak season.",
    difficulty: "Intermediate",
    waveType: "Reef Break",
    swellSize: {
      min: 2.1,
      max: 7.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 18,
    },
    waterTemp: {
      summer: 23, // Based on current reading of 23.3°C
      winter: 17,
    },
    hazards: ["Rocks", "Strong currents", "Crowds"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1234, // Please update with actual coordinates
      lng: 18.4567,
    },
    videos: [
      {
        url: "https://www.youtube.com/watch?v=mW4g6PQ9LcY&ab_channel=daboys",
        title: "Massive waves at Victoria Bay: 4 brothers explore Grom comp!!",
        platform: "youtube",
      },
    ],
  },
  {
    id: "ferme-aux-cochons",
    name: "Ferme aux Cochons 🦛",
    continent: "Africa",
    country: "Gabon",
    region: "Gabon Coast",
    location: "Gabon Coast",
    distanceFromCT: 3500, // Approximate distance from Cape Town
    optimalWindDirections: ["ENE"],
    optimalSwellDirections: {
      min: 202.5, // SW
      max: 247.5, // WSW
      cardinal: "SW",
    },
    bestSeasons: ["winter"],
    optimalTide: "All", // "Good surf at all stages of the tide"
    description:
      "Exposed beach break rated 5/5 for wave quality but known for inconsistent conditions. Works best with Southwest groundswell and East-northeast offshore winds. Beach offers both left and right options. Despite excellent wave quality when working, spot remains uncrowded. Poor performance in light onshore conditions. Remote location and shark presence require careful consideration.",
    difficulty: "Intermediate",
    waveType: "Beach Break",
    swellSize: {
      min: 0.6,
      max: 6.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 18,
    },
    waterTemp: {
      summer: 29, // Based on current reading of 28.6°C
      winter: 25,
    },
    hazards: ["Sharks", "Remote location", "Inconsistent waves"],
    crimeLevel: "Medium",
    sharkAttack: {
      hasAttack: false, // While sharks are present, no specific attacks mentioned
    },
    image: "",
    coordinates: {
      lat: 0.0, // Please update with actual coordinates
      lng: 0.0,
    },
    videos: [
      {
        url: "https://www.youtube.com/watch?v=mH9JoE0IrR4&ab_channel=ErwanSimon",
        title: "Gabon - Surfing Hippos",
        platform: "youtube",
      },
      {
        url: "https://www.youtube.com/watch?v=nQJkdq5gF80&ab_channel=SamBleakley",
        title: "Sam Bleakley surfEXPLORE© Gabon",
        platform: "youtube",
      },
      {
        url: "https://www.youtube.com/watch?v=fUpxoItNkZE&ab_channel=Lostintheswell",
        title: "Lost in the swell - Season 3.2 - Episode 0 - Paradise Lost",
        platform: "youtube",
      },
    ],
  },
  {
    id: "petit-loango",
    name: "Petit Loango 🦛",
    continent: "Africa",
    country: "Gabon",
    region: "Gabon Coast",
    location: "Gabon Coast",
    distanceFromCT: 3500, // Approximate distance from Cape Town
    optimalWindDirections: ["ENE"],
    optimalSwellDirections: {
      min: 202.5, // SW
      max: 247.5, // WSW
      cardinal: "SW",
    },
    bestSeasons: ["winter"],
    optimalTide: "All",
    description:
      "Exposed beach break rated 5/5 for wave quality but highly inconsistent. Works best with Southwest groundswell and East-northeast offshore winds. Beach offers both left and right options. Despite excellent wave quality when working, spot remains uncrowded due to remote location and wildlife hazards. Unique hazard of hippos in addition to sharks requires extreme caution. Receives primarily distant groundswells. Hippos: https://www.youtube.com/watch?v=mnHG290CS70&ab_channel=GabonUntouched",
    difficulty: "Advanced", // Due to wildlife hazards and remote location
    waveType: "Beach Break",
    swellSize: {
      min: 1.2,
      max: 6.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 18,
    },
    waterTemp: {
      summer: 28, // Based on current reading of 28.4°C
      winter: 25,
    },
    hazards: ["Sharks", "Hippos", "Remote location", "Inconsistent waves"],
    crimeLevel: "Medium",
    sharkAttack: {
      hasAttack: false, // While sharks are present, no specific attacks mentioned
    },
    image: "",
    coordinates: {
      lat: 0.0, // Please update with actual coordinates
      lng: 0.0,
    },
  },
  {
    id: "mussels",
    name: "Mussels",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Mossel Bay",
    distanceFromCT: 1800, // Approximate distance from Cape Town
    optimalWindDirections: ["ENE"],
    optimalSwellDirections: {
      min: 247.5, // WSW
      max: 270, // W
      cardinal: "WSW",
    },
    bestSeasons: ["winter"],
    optimalTide: "All", // No specific tide information provided
    description:
      "Exposed reef break that works inconsistently but offers quality waves (4/5) when conditions align. Best performance comes from WSW groundswell with ENE offshore winds. Reef provides both left and right options. Despite good rating, rarely crowded due to remote location. Watch for local wildlife including seals. Groundswells more common than windswells.",
    difficulty: "Intermediate",
    waveType: "Reef Break",
    swellSize: {
      min: 1.2,
      max: 6.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 18,
    },
    waterTemp: {
      summer: 19, // Based on current reading of 17.3°C, allowing for seasonal variation
      winter: 15,
    },
    hazards: ["Rocks", "Sharks", "Seals", "Inconsistent waves"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -22.6792, // Approximate for Swakopmund
      lng: 14.5272,
    },
    videos: [
      {
        url: "https://www.youtube.com/watch?v=q8q_A6r4dh0&ab_channel=SamBleakley",
        title: "surfEXPLORE© Gabon - Sam Bleakley",
        platform: "youtube",
      },
    ],
  },
  {
    id: "farmer-burgers",
    name: "Farmer Burgers",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "West Coast",
    distanceFromCT: 200, // Approximate distance, please adjust if needed
    optimalWindDirections: ["E", "ENE"],
    optimalSwellDirections: {
      min: 225,
      max: 270,
    },
    bestSeasons: ["spring", "summer"], // Notably different from most spots which favor winter
    optimalTide: "All", // No specific tide mentioned
    description:
      "Exposed reef break offering fairly consistent right-hand waves rated 4/5. Works best with WSW groundswell and ENE offshore winds. Clean groundswells are typical here. Despite being a quality wave, the spot can get crowded during optimal conditions. Careful navigation of rocks required.",
    difficulty: "Intermediate",
    waveType: "Reef Break",
    swellSize: {
      min: 1.2,
      max: 5.5,
    },

    idealSwellPeriod: {
      min: 12,
      max: 18,
    },
    waterTemp: {
      summer: 16, // Based on current reading of 13.9°C
      winter: 12,
    },
    hazards: ["Rocks", "Strong currents", "Remote location"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1234, // Please update with actual coordinates
      lng: 18.4567,
    },
  },
  {
    id: "tofinho",
    name: "Tofinho",
    continent: "Africa",
    country: "Mozambique",
    region: "Inhambane Province",
    location: "Tofo Beach",
    distanceFromCT: 2800, // Approximate distance from Cape Town
    optimalWindDirections: ["SSW"],
    optimalSwellDirections: {
      min: 112.5, // SE
      max: 157.5, // SSE
      cardinal: "SE",
    },
    bestSeasons: ["winter"],
    optimalTide: "All",
    description:
      "Fairly exposed reef and point break combination rated 4/5 with reliable conditions. Works best with Southeast swell and South-southwest offshore winds. Offers predominantly right-hand waves over reef. Despite quality waves, rarely gets crowded. Location provides consistent waves but requires careful navigation of reef sections. Watch out for sharks and rocks.",
    difficulty: "Advanced",
    waveType: "Reef Break",
    swellSize: {
      min: 1.2,
      max: 6.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 18,
    },
    waterTemp: {
      summer: 29, // Based on current reading
      winter: 24,
    },
    hazards: ["Sharks", "Rocks", "Strong currents", "Remote location"],
    crimeLevel: "Medium",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -23.8516,
      lng: 35.5472,
    },
    videos: [
      {
        url: "https://www.youtube.com/watch?v=f93I2SR9YVI&ab_channel=TheSardineNewsbySeanLange",
        title: "013 Tofinho Diaries 2",
        platform: "youtube",
      },
    ],
  },
  {
    id: "shipwreck",
    name: "Shipwreck",
    continent: "Africa",
    country: "Liberia",
    region: "Liberia",
    location: "Robertsport", // Generic location since specific area wasn't provided
    distanceFromCT: 5500, // Approximate distance from Cape Town
    optimalWindDirections: ["NE"],
    optimalSwellDirections: {
      min: 202.5, // SW
      max: 247.5, // WSW
      cardinal: "SW",
    },
    bestSeasons: ["summer", "winter"], // Works all year round
    optimalTide: "High", // "Best around high tide when the tide is falling"
    description:
      "Very consistent exposed reef break rated 3/5. Works best with Southwest groundswell and Northeast offshore winds. Wave quality remains reliable throughout the year. Remote location ensures uncrowded conditions. Best surfed on falling high tide. Careful navigation required due to rocks and strong rips.",
    difficulty: "Intermediate",
    waveType: "Reef Break",
    swellSize: {
      min: 1.2,
      max: 6.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 18,
    },
    waterTemp: {
      summer: 29, // Based on current reading of 29.0°C
      winter: 26,
    },
    hazards: [
      "Rocks",
      "Rip currents",
      "Remote location",
      "Poor infrastructure",
    ],
    crimeLevel: "Medium",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: 0.0, // Please update with actual coordinates
      lng: 0.0,
    },
    videos: [
      {
        url: "https://www.youtube.com/watch?v=_dyrA2KZu5g&ab_channel=RamiRamitto",
        title: "RobertsPort Shipwreck",
        platform: "youtube",
      },
      {
        url: "https://www.youtube.com/watch?v=jUoNQ_KsAd0&ab_channel=ShannonAinslie",
        title:
          "African Surf Adventure | West Africa Surfing | Post War Surf Trip",
        platform: "youtube",
      },
      {
        url: "https://www.youtube.com/watch?v=IATNNE_SH48&ab_channel=AFPNewsAgency",
        title: "Tide turns for Liberia's secret surf spot",
        platform: "youtube",
      },
      {
        url: "https://www.youtube.com/watch?v=2HtCZNPwYjg&ab_channel=Rusty%27sOn",
        title: "Liberia's Robertsport Surf Club - October 2022",
        platform: "youtube",
      },
    ],
  },

  {
    id: "plage-du-dahu",
    name: "Plage du Dahu",
    continent: "Africa",
    country: "Gabon", // Based on location and characteristics similar to other Gabon spots
    region: "Gabon Coast",
    location: "Gabon Coast",
    distanceFromCT: 3500, // Approximate distance from Cape Town
    optimalWindDirections: ["ENE"],
    optimalSwellDirections: {
      min: 202.5, // SW
      max: 247.5, // WSW
      cardinal: "SW",
    },
    bestSeasons: ["winter"],
    optimalTide: "All", // "Good surf at all stages of the tide"
    description:
      "Exposed beach break rated 5/5 for wave quality but works only occasionally. Best performance comes from Southwest groundswell with ENE offshore winds. Beach offers both left and right options. Clean groundswells are typical. Despite excellent wave quality when working, spot remains uncrowded due to remote location. Watch for shark activity.",
    difficulty: "Intermediate",
    waveType: "Beach Break",
    swellSize: {
      min: 1.2,
      max: 6.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 18,
    },
    waterTemp: {
      summer: 29, // Based on current reading of 28.5°C
      winter: 25,
    },
    hazards: ["Sharks", "Remote location", "Inconsistent waves"],
    crimeLevel: "Medium",
    sharkAttack: {
      hasAttack: false, // While sharks are present, no specific attacks mentioned
    },
    image: "",
    coordinates: {
      lat: 0.0, // Please update with actual coordinates
      lng: 0.0,
    },
  },
  {
    id: "ambriz-point",
    name: "Ambriz Point",
    continent: "Africa",
    country: "Angola",
    region: "Luanda Province",
    location: "Ambriz",
    distanceFromCT: 3200, // Approximate distance from Cape Town
    optimalWindDirections: ["NE"],
    optimalSwellDirections: {
      min: 202.5, // SW
      max: 247.5, // WSW
      cardinal: "SW",
    },
    bestSeasons: ["winter"],
    optimalTide: "All", // No specific tide information provided
    description:
      "Fairly consistent and quite exposed point break rated 4/5. Works best with Southwest swell (both wind and groundswells) and Northeast offshore winds. No shelter from cross-shore breezes. Remote location ensures uncrowded conditions. Note that despite the name, there is no actual point break formation - wave breaks over rocks.",
    difficulty: "Intermediate",
    waveType: "Point Break",
    swellSize: {
      min: 1.2,
      max: 6.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 18,
    },
    waterTemp: {
      summer: 28, // Based on current reading of 28.0°C
      winter: 24,
    },
    hazards: ["Rocks", "Remote location", "Cross-shore winds"],
    crimeLevel: "Medium",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: 0.0, // Please update with actual coordinates
      lng: 0.0,
    },
    videos: [
      {
        url: "https://www.youtube.com/watch?v=uvygYXDiCvw&ab_channel=DavidClancy",
        title: "ANGOLA WAVES - Professional Surfer: Tomas Valente",
        platform: "youtube",
      },
    ],
  },
  {
    id: "cabo-ledo",
    name: "Cabo Ledo",
    continent: "Africa",
    country: "Angola",
    region: "Luanda Province",
    location: "Cabo Ledo",
    distanceFromCT: 3000, // Approximate distance from Cape Town
    optimalWindDirections: ["NE"],
    optimalSwellDirections: {
      min: 202.5, // SW
      max: 247.5, // WSW
      cardinal: "SW",
    },
    bestSeasons: ["winter"],
    optimalTide: "All", // "The quality of the surf isn't affected by the tide"
    description:
      "Very consistent exposed point break rated 4/5. Works best with Southwest groundswell and Northeast offshore winds. Offers quality left-hand waves. Despite reliable conditions, spot remains relatively uncrowded due to remote location. Wave quality maintains consistency across all tide levels.",
    difficulty: "Intermediate",
    waveType: "Point Break",
    swellSize: {
      min: 1.2,
      max: 6.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 18,
    },
    waterTemp: {
      summer: 27, // Based on current reading of 26.3°C
      winter: 23,
    },
    hazards: ["Rip currents", "Remote location"],
    crimeLevel: "Medium",
    sharkAttack: {
      hasAttack: false,
    },
    image: "/images/beaches/td-cabo-ledo.webp",

    coordinates: {
      lat: 0.0, // Please update with actual coordinates
      lng: 0.0,
    },
    videos: [
      {
        url: "https://www.youtube.com/watch?v=pRju2Vkss-o&ab_channel=TAAGAngolaAirlines",
        title: "Surf Angola - Cabo Ledo",
        platform: "youtube",
      },
    ],
  },
  {
    id: "praia-do-buraco",
    name: "Praia do Buraco",
    continent: "Africa",
    country: "Angola",
    region: "Luanda Province",
    location: "Ramiros",
    distanceFromCT: 3200, // Approximate distance from Cape Town
    optimalWindDirections: ["SSE"],
    optimalSwellDirections: {
      min: 202.5, // SW
      max: 247.5, // WSW
      cardinal: "SW",
    },
    bestSeasons: ["winter"],
    optimalTide: "All", // No specific tide information provided
    description:
      "Quite exposed point break rated 3/5 that rarely breaks. Works best with Southwest swell (mix of ground and windswells) and South-southeast offshore winds. Offers left-hand waves when working. Despite inconsistent conditions, spot remains uncrowded. Shark presence reported in the area.",
    difficulty: "Intermediate",
    waveType: "Point Break",
    swellSize: {
      min: 1.2,
      max: 6.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 18,
    },
    waterTemp: {
      summer: 28, // Based on current reading of 27.5°C
      winter: 24,
    },
    hazards: ["Sharks", "Remote location", "Inconsistent waves"],
    crimeLevel: "Medium",
    sharkAttack: {
      hasAttack: false, // While sharks are reported, no specific attacks mentioned
    },
    image: "",
    coordinates: {
      lat: 0.0, // Please update with actual coordinates
      lng: 0.0,
    },
  },
  {
    id: "bocock's-bay",
    name: "Bocock's Bay",
    continent: "Africa",
    country: "Namibia",
    region: "Swakopmund",
    location: "Mile 108",
    distanceFromCT: 1800, // Approximate distance from Cape Town
    optimalWindDirections: ["SSE"],
    optimalSwellDirections: {
      min: 247.5, // WSW
      max: 270, // W
      cardinal: "WSW",
    },
    bestSeasons: ["winter"],
    optimalTide: "All", // "Good surf at all stages of the tide"
    description:
      "Fairly consistent and exposed break rated 4/5. Works best with WSW groundswell and SSE offshore winds, with some protection from southerly winds. Despite being labeled as a point break, note that there is no actual point formation. Wave quality remains consistent across all tide levels. Remote location ensures uncrowded conditions.",
    difficulty: "Intermediate",
    waveType: "Point Break", // Keeping type as listed in spot info despite description contradiction
    swellSize: {
      min: 1.2,
      max: 6.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 18,
    },
    waterTemp: {
      summer: 20, // Based on current reading of 18.0°C
      winter: 16,
    },
    hazards: ["Sharks", "Remote location"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false, // While sharks are present, no specific attacks mentioned
    },
    image: "",
    coordinates: {
      lat: -22.6792, // Approximate for Swakopmund
      lng: 14.5272,
    },
  },
  {
    id: "vredenberg-point",
    name: "Vredenberg Point",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "West Coast",
    distanceFromCT: 150, // Approximate distance from Cape Town
    optimalWindDirections: ["ENE"],
    optimalSwellDirections: {
      min: 225.5, // SW
      max: 255.5, // WSW
      cardinal: "SW",
    },
    bestSeasons: ["summer"], // Notably different from most Western Cape spots
    optimalTide: "High",
    description:
      "Fairly consistent exposed point break rated 4/5. Works best with Southwest groundswell and East-northeast offshore winds. Offers left-peeling waves off the point. Wave quality suffers in light onshore conditions. Clean groundswells are typical here. Can get crowded during optimal conditions. Best surfed around high tide.",
    difficulty: "Intermediate",
    waveType: "Point Break",
    swellSize: {
      min: 1.2,
      max: 6.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 18,
    },
    waterTemp: {
      summer: 16, // Based on current reading of 14.5°C
      winter: 13,
    },
    hazards: ["Rocks", "Strong currents"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -32.9046, // Please verify coordinates
      lng: 17.9891,
    },
  },
  {
    id: "jacobs-bay",
    name: "Jacobs Bay",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "West Coast",
    distanceFromCT: 140, // Approximate distance from Cape Town
    optimalWindDirections: ["E"],
    optimalSwellDirections: {
      min: 247.5, // WSW
      max: 270, // W
      cardinal: "WSW",
    },
    bestSeasons: ["summer", "winter"], // "can work at any time of the year"
    optimalTide: "All", // "The quality of the surf isn't affected by the tide"
    description:
      "Fairly consistent exposed beach break rated 4/5. Works best with WSW groundswell and easterly offshore winds, but can handle light onshore conditions. Offers both left and right-breaking waves. Wave quality maintains consistency across all tide levels. Can get crowded during good conditions. Known for strong, dangerous rip currents.",
    difficulty: "Intermediate",
    waveType: "Beach Break",
    swellSize: {
      min: 1.2,
      max: 6.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 18,
    },
    waterTemp: {
      summer: 18, // Based on current reading of 15.9°C
      winter: 14,
    },
    hazards: ["Rip currents", "Crowds"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -32.971, // Please verify coordinates
      lng: 17.8931,
    },
  },
  {
    id: "treskostraal",
    name: "Treskostraal",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "West Coast",
    distanceFromCT: 160, // Approximate distance from Cape Town
    optimalWindDirections: ["ESE"],
    optimalSwellDirections: {
      min: 202.5, // SW
      max: 247.5, // WSW
      cardinal: "SW",
    },
    bestSeasons: ["summer", "winter"], // "no particular seasonal pattern"
    optimalTide: "All", // No specific tide information provided
    description:
      "Exposed point break rated 4/5 but works inconsistently with no seasonal preference. Best performance comes from Southwest groundswell with ESE offshore winds, though can handle light onshore conditions. Groundswells more common than windswells. Remote location ensures uncrowded conditions. Rocky break requires careful navigation.",
    difficulty: "Intermediate",
    waveType: "Point Break",
    swellSize: {
      min: 1.2,
      max: 6.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 18,
    },
    waterTemp: {
      summer: 16, // Based on current reading of 14.4°C
      winter: 13,
    },
    hazards: ["Rocks", "Inconsistent waves", "Remote location"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -32.9046, // Please verify coordinates
      lng: 17.9891,
    },
    videos: [
      {
        url: "https://www.youtube.com/watch?v=c0oormvmT-U&ab_channel=PsychedOut",
        title: "Surfing // West Coast South Africa",
        platform: "youtube",
      },
    ],
  },
  {
    id: "cape-st-martin",
    name: "Cape St Martin",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "West Coast",
    distanceFromCT: 180, // Approximate distance from Cape Town
    optimalWindDirections: ["SSE", "S"],
    optimalSwellDirections: {
      min: 240, // WSW
      max: 260, // W
      cardinal: "WSW",
    },
    bestSeasons: ["summer", "winter"], // "can work at any time of the year"
    optimalTide: "All", // No specific tide information provided
    description:
      "Consistent exposed reef break rated 4/5. Works best with WSW groundswell and SSE offshore winds, though remains surfable in onshore conditions. Offers left-breaking waves over reef. Clean groundswells are typical here. Despite reliable conditions, spot remains uncrowded. Kelp beds and rocky sections require careful navigation.",
    difficulty: "Intermediate",
    waveType: "Reef Break",
    swellSize: {
      min: 1.2,
      max: 6.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 18,
    },
    waterTemp: {
      summer: 16, // Based on current reading of 14.3°C
      winter: 13,
    },
    hazards: ["Rocks", "Kelp", "Remote location"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -32.7031, // Please verify coordinates
      lng: 17.9891,
    },
  },
  {
    id: "pastures",
    name: "Pastures",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "West Coast",
    distanceFromCT: 170, // Approximate distance from Cape Town
    optimalWindDirections: ["SE"],
    optimalSwellDirections: {
      min: 247.5, // WSW
      max: 270, // W
      cardinal: "WSW",
    },
    bestSeasons: ["winter"],
    optimalTide: "All", // "Surfable at all stages of the tide"
    description:
      "Reasonably exposed combination beach and reef break rated 4/5, though works inconsistently. Best performance in winter with WSW groundswell and SE offshore winds. Can handle onshore breezes. Despite being described as both beach and reef, offers primarily left-hand point waves. Can get crowded when working. Strong rip currents present significant hazard.",
    difficulty: "Intermediate",
    waveType: "Beach Break", // Listed as both beach and reef, but description mentions point break
    swellSize: {
      min: 1.2,
      max: 6.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 18,
    },
    waterTemp: {
      summer: 16, // Based on current reading of 14.2°C
      winter: 13,
    },
    hazards: ["Rip currents", "Rocks", "Inconsistent waves"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -32.8046, // Please verify coordinates
      lng: 17.9891,
    },
  },
  {
    id: "holbaai",
    name: "Holbaai",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Melkbosstrand",
    distanceFromCT: 35,
    optimalWindDirections: ["E"], // Changed to be more specific
    optimalSwellDirections: {
      min: 225,
      max: 250,
      cardinal: "SW", // Updated to match the reported optimal direction
    },
    bestSeasons: ["winter"],
    optimalTide: "Low",
    description:
      "Holbaai, located in the Western Cape, is an exposed beach break known for its consistent surf conditions. The best time for surfing is during the summer, when the conditions are optimal. The ideal wind direction comes from the east, while the best swell direction is from the southwest, often provided by distant groundswells.",
    difficulty: "Intermediate",
    waveType: "Beach Break",
    swellSize: {
      min: 1.8,
      max: 6.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 24,
    },
    waterTemp: {
      summer: 18,
      winter: 14,
    },
    hazards: ["Remote location", "Rip currents", "Strong currents", "Sharks"],
    crimeLevel: "Medium",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1123,
      lng: 18.4876,
    },
  },
  {
    id: "beachroad",
    name: "Beach Road",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Melkbosstrand",
    distanceFromCT: 35,
    optimalWindDirections: ["SE"], // Changed to be more specific
    optimalSwellDirections: {
      min: 225,
      max: 250,
      cardinal: "SW", // Updated to match the reported optimal direction
    },
    bestSeasons: ["winter"],
    optimalTide: "Low",
    description:
      "Beach Road, located in the Western Cape, is an exposed point break known for its consistent surf conditions. The prime surfing season here is during winter, when the waves are at their best. The ideal wind direction comes from the southeast, while the most favorable swell direction is from the southwest, typically generated by distant groundswells.",
    difficulty: "Intermediate",
    waveType: "Beach Break",
    swellSize: {
      min: 1.8,
      max: 6.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 24,
    },
    waterTemp: {
      summer: 18,
      winter: 14,
    },
    hazards: ["Remote location", "Rip currents", "Strong currents", "Sharks"],
    crimeLevel: "Medium",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1123,
      lng: 18.4876,
    },
  },
  {
    id: "vanriebeek",
    name: "Van Riebeek",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Van Riebeek",
    distanceFromCT: 40,
    optimalWindDirections: ["NE"],
    optimalSwellDirections: {
      min: 240,
      max: 255,
      cardinal: "WSW",
    },
    bestSeasons: ["winter"],
    optimalTide: "Low",
    description:
      "Van Riebeek offers variable conditions in June, with a mix of opportunities for surfers of different skill levels.",
    difficulty: "Intermediate",
    waveType: "Beach Break",
    swellSize: {
      min: 1.6,
      max: 6.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 24,
    },
    waterTemp: {
      summer: 18,
      winter: 14,
    },
    hazards: ["Strong currents", "Sharks"],
    crimeLevel: "Medium",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1123,
      lng: 18.4876,
    },
  },
  {
    id: "kreefte-reef",
    name: "Kreefte Reef",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "West Coast",
    distanceFromCT: 150, // Approximate distance from Cape Town
    optimalWindDirections: ["ENE"],
    optimalSwellDirections: {
      min: 247.5, // WSW
      max: 270, // W
      cardinal: "WSW",
    },
    bestSeasons: ["winter"], // Typical for West Coast spots
    optimalTide: "All", // No specific tide information provided
    description:
      "Fairly consistent beach break rated 4/5. Works best with WSW swell and ENE offshore winds. Despite being named as a reef, spot is classified as a beach break. Location on West Coast provides reliable conditions when swell direction and winds align.",
    difficulty: "Intermediate",
    waveType: "Beach Break",
    swellSize: {
      min: 1.2,
      max: 6.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 18,
    },
    waterTemp: {
      summer: 17, // Based on current reading of 15.5°C
      winter: 14,
    },
    hazards: ["Rocks", "Strong currents"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -33.1046, // Please verify coordinates
      lng: 18.0891,
    },
  },
  {
    id: "pointe-dimessouane",
    name: "Pointe d'Imessouane",
    continent: "Africa",
    country: "Morocco",
    region: "Central Morocco",
    location: "Central Morocco",
    distanceFromCT: 7500, // Approximate distance from Cape Town
    optimalWindDirections: ["ENE", "NE"], // Both mentioned in descriptions
    optimalSwellDirections: {
      min: 292.5, // WNW
      max: 337.5, // NNW
      cardinal: "NW",
    },
    bestSeasons: ["winter"],
    optimalTide: "All", // No specific tide information provided
    description:
      "Consistent exposed point break rated 4/5. Works best with Northwest groundswell and ENE/NE offshore winds. Groundswells more common than windswells. Despite quality waves, spot remains relatively uncrowded. Strong rip currents require attention.",
    difficulty: "Intermediate",
    waveType: "Point Break",
    swellSize: {
      min: 1.2,
      max: 6.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 18,
    },
    waterTemp: {
      summer: 20, // Based on current reading of 18.5°C
      winter: 17,
    },
    hazards: ["Rip currents", "Remote location"],
    crimeLevel: "Medium",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: 30.8384, // Please verify coordinates
      lng: -9.8183,
    },
  },
  {
    id: "dracula",
    name: "Dracula",
    continent: "Africa",
    country: "Morocco",
    region: "Central Morocco",
    location: "Central Morocco",
    distanceFromCT: 7500, // Approximate distance from Cape Town
    optimalWindDirections: ["E"],
    optimalSwellDirections: {
      min: 270, // W
      max: 292.5, // WNW
      cardinal: "W",
    },
    bestSeasons: ["winter"],
    optimalTide: "All", // No specific tide information provided
    description:
      "Very consistent exposed reef break rated 5/5. Works best with West groundswell and easterly offshore winds. Groundswells predominate over windswells. Despite remote location, can get crowded during optimal conditions. High quality waves but requires careful navigation of rocks and rip currents.",
    difficulty: "Advanced", // Based on 5/5 rating and hazards
    waveType: "Reef Break",
    swellSize: {
      min: 1.2,
      max: 6.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 18,
    },
    waterTemp: {
      summer: 20, // Based on current reading of 18.4°C
      winter: 17,
    },
    hazards: ["Rocks", "Rip currents", "Remote location"],
    crimeLevel: "Medium",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: 30.8384, // Please verify coordinates
      lng: -9.8183,
    },
  },
  {
    id: "the-wedge",
    name: "The Wedge",
    continent: "Africa",
    country: "South Africa",
    region: "Western Cape",
    location: "Cape Town",
    distanceFromCT: 20, // Approximate distance, please adjust if needed
    optimalWindDirections: ["E"],
    optimalSwellDirections: {
      min: 270, // W
      max: 280, // Allowing some variation
      cardinal: "W",
    },
    bestSeasons: ["winter"],
    optimalTide: "Mid",
    description:
      "Very sheltered beach break that has reasonably consistent surf. Needs very large swell to work properly. Best performance comes from west swell with easterly offshore winds. Offers left-hand waves. Despite being sheltered, can get crowded when working. Watch for pollution in the area.",
    difficulty: "Intermediate",
    waveType: "Beach Break",
    swellSize: {
      min: 3,
      max: 9.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 18,
    },
    waterTemp: {
      summer: 19,
      winter: 15,
    },
    hazards: ["Crowds", "Pollution"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -34.1234, // Please update with actual coordinates
      lng: 18.4567,
    },
    videos: [
      {
        url: "https://www.youtube.com/watch?v=7wTdB-5o1F4&t=1s",
        title: "The Wedge Surfing",
        platform: "youtube",
      },
    ],
  },
  {
    id: "ilha-do-cabo",
    name: "Ilha do Cabo",
    continent: "Africa",
    country: "Angola",
    region: "Luanda Province",
    location: "Luanda",
    distanceFromCT: 3200,
    optimalWindDirections: ["W", "WNW"],
    optimalSwellDirections: {
      min: 210, // SSW
      max: 240, // WSW
      cardinal: "SW",
    },
    bestSeasons: ["winter", "summer"],
    optimalTide: "All",
    description:
      "Popular beach break in Luanda offering consistent waves year-round. Protected location provides good conditions even when other spots are blown out. Best on SW swells with light westerly winds.",
    difficulty: "Intermediate",
    waveType: "Beach Break",
    swellSize: {
      min: 0.9,
      max: 2.5,
    },
    idealSwellPeriod: {
      min: 10,
      max: 16,
    },
    waterTemp: {
      summer: 28,
      winter: 24,
    },
    hazards: ["Crowds", "Rip currents"],
    crimeLevel: "Medium",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -8.8147,
      lng: 13.2302,
    },
  },
  {
    id: "palmeirinhas",
    name: "Palmeirinhas",
    continent: "Africa",
    country: "Angola",
    region: "Luanda Province",
    location: "Luanda",
    distanceFromCT: 3200,
    optimalWindDirections: ["W", "NW"],
    optimalSwellDirections: {
      min: 210,
      max: 250,
      cardinal: "SW to WSW",
    },
    bestSeasons: ["winter"],
    optimalTide: "Mid",
    description:
      "Long stretch of beach south of Luanda offering multiple peaks. Works best with SW-WSW swells and offshore morning winds. Less crowded than city beaches.",
    difficulty: "All Levels",
    waveType: "Beach Break",
    swellSize: {
      min: 1.0,
      max: 3.0,
    },
    idealSwellPeriod: {
      min: 11,
      max: 16,
    },
    waterTemp: {
      summer: 28,
      winter: 24,
    },
    hazards: ["Rip currents", "Remote location"],
    crimeLevel: "Medium",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -9.0679,
      lng: 13.1969,
    },
  },
  {
    id: "ngor-right",
    name: "Ngor Right",
    continent: "Africa",
    country: "Senegal",
    region: "Dakar",
    location: "Ngor Island",
    distanceFromCT: 6800, // Approximate distance from Cape Town
    optimalWindDirections: ["NE"],
    optimalSwellDirections: {
      min: 315, // NW
      max: 337.5, // NNW
      cardinal: "NW",
    },
    bestSeasons: ["winter"], // Northern Hemisphere winter (Nov-Mar)
    optimalTide: "Mid",
    description:
      "World-class right-hand reef break off Ngor Island. Offers long, perfect waves when conditions align. Best on NW swells with NE winds. Multiple sections providing both barrels and walls. Very consistent during winter months. Popular spot that can get crowded during peak season. Access via boat from Ngor village. Watch for strong currents around reef.",
    difficulty: "Advanced",
    waveType: "Reef Break",
    swellSize: {
      min: 1.2,
      max: 4.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 18,
    },
    waterTemp: {
      summer: 28,
      winter: 22,
    },
    hazards: ["Rocks", "Strong currents", "Crowds", "Boat access only"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: 14.7507,
      lng: -17.5156,
    },
    videos: [
      {
        url: "https://www.youtube.com/watch?v=sBVFNw6_4UY",
        title: "Surfing Ngor Rights, Dakar, Senegal",
        platform: "youtube",
      },
    ],
  },
  {
    id: "ngor-left",
    name: "Ngor Left",
    continent: "Africa",
    country: "Senegal",
    region: "Dakar",
    location: "Ngor Island",
    distanceFromCT: 6800,
    optimalWindDirections: ["NE"],
    optimalSwellDirections: {
      min: 292.5, // WNW
      max: 315, // NW
      cardinal: "WNW",
    },
    bestSeasons: ["winter"],
    optimalTide: "Mid",
    description:
      "Powerful left-hand reef break adjacent to Ngor Right. Works best with WNW swell and NE winds. Shorter but more intense than its right-hand neighbor. Handles size well while maintaining shape. Access requires boat ride from Ngor village. Popular with experienced surfers during winter swells.",
    difficulty: "Advanced",
    waveType: "Reef Break",
    swellSize: {
      min: 1.2,
      max: 4.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 18,
    },
    waterTemp: {
      summer: 28,
      winter: 22,
    },
    hazards: ["Rocks", "Strong currents", "Boat access only"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: 14.7507,
      lng: -17.5156,
    },
  },
  {
    id: "ouakam",
    name: "Ouakam",
    continent: "Africa",
    country: "Senegal",
    region: "Dakar",
    location: "Ouakam",
    distanceFromCT: 6800,
    optimalWindDirections: ["NE"],
    optimalSwellDirections: {
      min: 292.5, // WNW
      max: 315, // NW
      cardinal: "WNW",
    },
    bestSeasons: ["winter"],
    optimalTide: "Mid to High",
    description:
      "Powerful reef break beneath the African Renaissance Monument. Long right-handers that can hold serious size. Best on WNW swell with NE winds. Multiple sections offering both barrels and walls. Very consistent during winter months. Local spot that demands respect both in and out of water.",
    difficulty: "Advanced",
    waveType: "Reef Break",
    swellSize: {
      min: 1.5,
      max: 5.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 18,
    },
    waterTemp: {
      summer: 28,
      winter: 22,
    },
    hazards: ["Rocks", "Strong currents", "Localism"],
    crimeLevel: "Medium",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: 14.7219,
      lng: -17.4994,
    },
    videos: [
      {
        url: "https://www.youtube.com/watch?v=1kYWWxNwAYk",
        title: "Ouakam | The Endless Winter II",
        platform: "youtube",
      },
    ],
  },
  {
    id: "club-med",
    name: "Club Med",
    continent: "Africa",
    country: "Senegal",
    region: "Dakar",
    location: "Almadies",
    distanceFromCT: 6800,
    optimalWindDirections: ["NE"],
    optimalSwellDirections: {
      min: 292.5, // WNW
      max: 315, // NW
      cardinal: "WNW",
    },
    bestSeasons: ["winter"],
    optimalTide: "All",
    description:
      "Consistent reef break offering both lefts and rights. Works best with WNW swell and NE winds. Multiple peaks provide options for different skill levels. Popular spot that can get crowded. Good access and facilities nearby. Watch for strong currents around reef sections.",
    difficulty: "Intermediate",
    waveType: "Reef Break",
    swellSize: {
      min: 1.0,
      max: 3.5,
    },
    idealSwellPeriod: {
      min: 10,
      max: 16,
    },
    waterTemp: {
      summer: 28,
      winter: 22,
    },
    hazards: ["Rocks", "Crowds", "Strong currents"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: 14.7438,
      lng: -17.5131,
    },
  },
  {
    id: "virage",
    name: "Virage",
    continent: "Africa",
    country: "Senegal",
    region: "Dakar",
    location: "Almadies",
    distanceFromCT: 6800,
    optimalWindDirections: ["NE"],
    optimalSwellDirections: {
      min: 292.5, // WNW
      max: 315, // NW
      cardinal: "WNW",
    },
    bestSeasons: ["winter"],
    optimalTide: "Mid",
    description:
      "Beach break with occasional reef sections. Works best with WNW swell and NE winds. Multiple peaks offering both lefts and rights. Good spot for beginners when small. Gets more challenging as swell increases. Popular with local surf schools.",
    difficulty: "All Levels",
    waveType: "Beach Break",
    swellSize: {
      min: 0.8,
      max: 3.0,
    },
    idealSwellPeriod: {
      min: 10,
      max: 16,
    },
    waterTemp: {
      summer: 28,
      winter: 22,
    },
    hazards: ["Rocks", "Crowds"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: 14.7397,
      lng: -17.5092,
    },
  },
  {
    id: "mtsanga-boueni",
    name: "Mtsanga Bouéni",
    continent: "Africa",
    country: "Mayotte",
    region: "Mayotte",
    location: "Southwest Coast",
    distanceFromCT: 3200,
    optimalWindDirections: ["NNW", "N", "NW"],
    optimalSwellDirections: {
      min: 210, // SSW
      max: 230, // SW
      cardinal: "SW",
    },
    bestSeasons: ["winter"], // Southern Hemisphere winter (May-Sept)
    optimalTide: "Mid",
    description:
      "Premier reef break on Mayotte's southwest coast. Works best with SW swells and NNW winds. Multiple sections offering both hollow and wall sections. Best during southern hemisphere winter when SW swells are most consistent. Remote location requires boat access from Bouéni village.",
    difficulty: "Advanced",
    waveType: "Reef Break",
    swellSize: {
      min: 1.2,
      max: 3.5,
    },
    idealSwellPeriod: {
      min: 12,
      max: 18,
    },
    waterTemp: {
      summer: 29,
      winter: 25,
    },
    hazards: ["Reef", "Strong currents", "Remote location", "Boat access"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -12.9167,
      lng: 45.0833,
    },
  },
  {
    id: "mtsanga-saziley",
    name: "Mtsanga Saziley",
    continent: "Africa",
    country: "Mayotte",
    region: "Mayotte",
    location: "East Coast",
    distanceFromCT: 3200,
    optimalWindDirections: ["NW", "N"],
    optimalSwellDirections: {
      min: 90, // E
      max: 112.5, // ESE
      cardinal: "E",
    },
    bestSeasons: ["summer"], // Works better with summer easterly swells
    optimalTide: "Mid to High",
    description:
      "Left-hand reef break on Mayotte's east coast. Best during summer months when easterly swells wrap around the island. Multiple sections with both hollow and wall opportunities. Remote location with beautiful setting. Watch for strong currents and shallow reef sections.",
    difficulty: "Advanced",
    waveType: "Reef Break",
    swellSize: {
      min: 1.0,
      max: 3.0,
    },
    idealSwellPeriod: {
      min: 10,
      max: 16,
    },
    waterTemp: {
      summer: 29,
      winter: 25,
    },
    hazards: ["Reef", "Strong currents", "Remote location"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -12.9833,
      lng: 45.2,
    },
    videos: [
      {
        url: "https://www.youtube.com/watch?v=ApsaRk8Bfhg&ab_channel=JulieB",
        title: "MAYOTTE LA MAGNIFIQUE plongée surf choungui bivouac eps LOVE",
        platform: "youtube",
      },
    ],
  },
  {
    id: "mtsanga-mtsamoudou",
    name: "Mtsanga Mtsamoudou",
    continent: "Africa",
    country: "Mayotte",
    region: "Mayotte",
    location: "South Coast",
    distanceFromCT: 3200,
    optimalWindDirections: ["N", "NE"],
    optimalSwellDirections: {
      min: 157.5, // SSE
      max: 180, // S
      cardinal: "SSE",
    },
    bestSeasons: ["winter", "summer"], // Works year-round
    optimalTide: "All",
    description:
      "Versatile reef break offering multiple peaks. Works with both southern hemisphere winter swells and summer easterly swells. More accessible than other spots with good road access. Multiple take-off zones suitable for different skill levels. Watch for strong currents during bigger swells.",
    difficulty: "Intermediate",
    waveType: "Reef Break",
    swellSize: {
      min: 0.8,
      max: 2.5,
    },
    idealSwellPeriod: {
      min: 10,
      max: 16,
    },
    waterTemp: {
      summer: 29,
      winter: 25,
    },
    hazards: ["Reef", "Currents"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -12.95,
      lng: 45.15,
    },
    videos: [
      {
        url: "https://www.youtube.com/watch?v=6MfHfIFc3uI&ab_channel=JulieBrendl%C3%A9",
        title: "SURF MAYOTTE",
        platform: "youtube",
      },
    ],
  },
  {
    id: "baia-azul",
    name: "Baia Azul",
    continent: "Africa",
    country: "Angola",
    region: "Benguela",
    location: "Benguela Coast",
    distanceFromCT: 2800,
    optimalWindDirections: ["SSW", "S"],
    optimalSwellDirections: {
      min: 225, // SW
      max: 247.5, // WSW
      cardinal: "SW",
    },
    bestSeasons: ["winter"], // Southern Hemisphere winter
    optimalTide: "Mid",
    description:
      "Consistent beach break in Benguela's Baia Azul (Blue Bay). Works best with SW swells and southerly winds. Multiple peaks offering both lefts and rights. Best during winter months when SW swells are most consistent. Popular spot with local surfers.",
    difficulty: "Intermediate",
    waveType: "Beach Break",
    swellSize: {
      min: 0.5,
      max: 2.0,
    },
    idealSwellPeriod: {
      min: 10,
      max: 14,
    },
    waterTemp: {
      summer: 26,
      winter: 20,
    },
    hazards: ["Strong currents", "Crowds on weekends"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -12.5934,
      lng: 13.4127,
    },
  },
  {
    id: "praia-morena",
    name: "Praia Morena",
    continent: "Africa",
    country: "Angola",
    region: "Benguela",
    location: "Benguela City",
    distanceFromCT: 2800,
    optimalWindDirections: ["SSW", "S"],
    optimalSwellDirections: {
      min: 225, // SW
      max: 247.5, // WSW
      cardinal: "SW",
    },
    bestSeasons: ["winter"],
    optimalTide: "All",
    description:
      "City beach break offering consistent waves throughout the year. Multiple peaks with both left and right options. Wave quality varies with swell direction and size. Popular with locals and good for beginners when small. Based on swell.co.za data, typically receives 0.5-0.7m waves with periods around 11-12 seconds.",
    difficulty: "All Levels",
    waveType: "Beach Break",
    swellSize: {
      min: 0.5,
      max: 2.0,
    },
    idealSwellPeriod: {
      min: 10,
      max: 14,
    },
    waterTemp: {
      summer: 26,
      winter: 20,
    },
    hazards: ["Crowds", "Strong currents"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -12.5778,
      lng: 13.4097,
    },
    videos: [
      {
        url: "https://www.youtube.com/watch?v=-k4ux8OsJ10&ab_channel=NomadSurfCamps",
        title: "NOMAD SURFERS: ANGOLA",
        platform: "youtube",
      },
    ],
  },
  {
    id: "anza",
    name: "Anza",
    continent: "Africa",
    country: "Morocco",
    region: "Central Morocco",
    location: "Central Morocco",
    distanceFromCT: 7500, // Approximate distance from Cape Town
    optimalWindDirections: ["NE"],
    optimalSwellDirections: {
      min: 292.5, // NW
      max: 315, // NW
      cardinal: "NW",
    },
    bestSeasons: ["winter"],
    optimalTide: "All", // No specific tide information provided
    description:
      "Fairly exposed beach break offering consistent surf conditions. Works best with Northwest groundswell and Northeast offshore winds. Beach offers predominantly right-hand waves. Despite reliable conditions, spot remains uncrowded. Water quality can be questionable. Location provides good access to waves throughout winter season.",
    difficulty: "Intermediate",
    waveType: "Beach Break",
    swellSize: {
      min: 1.2,
      max: 6.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 18,
    },
    waterTemp: {
      summer: 21,
      winter: 18,
    },
    hazards: ["Water quality", "Strong currents"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: 30.4467, // Please verify coordinates
      lng: -9.6431,
    },
    videos: [
      {
        url: "https://www.youtube.com/watch?v=z5P_LA1NYSs",
        title: "Surfing Anza - Kale Brock",
        platform: "youtube",
      },
    ],
  },
  {
    id: "back-beach",
    name: "Back Beach",
    continent: "Africa",
    country: "Mozambique",
    region: "Inhambane Province",
    location: "Tofo",
    distanceFromCT: 2800, // Similar to Tofinho as they're in the same region
    optimalWindDirections: ["NW"],
    optimalSwellDirections: {
      min: 112.5, // SE
      max: 157.5, // SSE
      cardinal: "SE",
    },
    bestSeasons: ["winter"],
    optimalTide: "All",
    description:
      "Exposed beach and reef break combination rated 4/5 with fairly consistent surf. Works best with Southeast swell and Northwest offshore winds. Features right-hand beach breaks and a left-hand reef break. Receives a mix of groundswells and windswells. Despite quality waves, spot remains relatively uncrowded even on good days. Watch out for sharks and rocks.",
    difficulty: "Intermediate",
    waveType: "Beach Break", // Primary characteristic, though it has reef sections
    swellSize: {
      min: 1.2,
      max: 6.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 18,
    },
    waterTemp: {
      summer: 29, // Based on current reading
      winter: 24,
    },
    hazards: ["Sharks", "Rocks", "Strong currents"],
    crimeLevel: "Medium",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -23.8516, // Approximate, near Tofo Beach
      lng: 35.5472,
    },
  },
  {
    id: "dinos-left",
    name: "Dinos Left",
    continent: "Africa",
    country: "Mozambique",
    region: "Inhambane Province",
    location: "Tofo Beach",
    distanceFromCT: 2800, // Similar to other Inhambane spots
    optimalWindDirections: ["SW"],
    optimalSwellDirections: {
      min: 67.5, // ENE
      max: 112.5, // ESE
      cardinal: "E",
    },
    bestSeasons: ["winter"],
    optimalTide: "All",
    description:
      "Quite exposed reef break rated 4/5 that works inconsistently. Works best with East swell and Southwest offshore winds. Left-hand reef break that receives both groundswells and windswells. Despite quality waves when working, spot remains very uncrowded. Watch out for sharks and rocks.",
    difficulty: "Advanced",
    waveType: "Reef Break",
    swellSize: {
      min: 1.5,
      max: 5.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 18,
    },
    waterTemp: {
      summer: 29, // Based on current reading
      winter: 24,
    },
    hazards: ["Sharks", "Rocks", "Remote location"],
    crimeLevel: "Medium",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -23.8516, // Approximate, near Tofo Beach
      lng: 35.5472,
    },
  },
  {
    id: "ponta-do-ouro",
    name: "Ponta do Ouro",
    continent: "Africa",
    country: "Mozambique",
    region: "Ponta do Ouro", // Corrected from Inhambane to Maputo Province
    location: "Ponta do Ouro",
    distanceFromCT: 2600, // Approximate distance from Cape Town
    optimalWindDirections: ["NW"],
    optimalSwellDirections: {
      min: 112.5, // SE
      max: 157.5, // SSE
      cardinal: "SE",
    },
    bestSeasons: ["summer"],
    optimalTide: "All",
    description:
      "Exposed point break rated 4/5 with fairly consistent surf. Works best with Southeast groundswell and Northwest offshore winds. Predominantly groundswell-driven spot that offers quality waves. Despite good conditions, rarely gets crowded. Watch out for submerged rocks.",
    difficulty: "Intermediate",
    waveType: "Point Break",
    swellSize: {
      min: 1.2,
      max: 4.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 18,
    },
    waterTemp: {
      summer: 28, // Based on current reading
      winter: 23,
    },
    hazards: ["Rocks", "Strong currents"],
    crimeLevel: "Medium",
    sharkAttack: {
      hasAttack: false,
    },
    image: "/images/beaches/td-ponta.jpg",
    coordinates: {
      lat: -26.8496, // Actual coordinates for Ponta do Ouro
      lng: 32.8989,
    },
    videos: [
      {
        url: "https://www.youtube.com/watch?v=vaF4GROKAno&ab_channel=BaronMedia",
        title:
          "Surfing Mozambique Ponta do Ouro Skhanyiso ( Enlighten ) Short Film",
        platform: "youtube",
      },
    ],
  },
  {
    id: "cape-vidal",
    name: "Cape Vidal",
    continent: "Africa",
    country: "South Africa",
    region: "KwaZulu-Natal",
    location: "KwaZulu-Natal North Coast",
    distanceFromCT: 1800, // Approximate distance from Cape Town
    optimalWindDirections: ["W"],
    optimalSwellDirections: {
      min: 67.5, // ENE
      max: 112.5, // ESE
      cardinal: "E",
    },
    bestSeasons: ["summer"],
    optimalTide: "All",
    description:
      "Exposed reef break rated 3/5 with very consistent waves. Works best with East swell and Westerly offshore winds. Receives both local windswells and distant groundswells. No shelter from cross-shore breezes. Despite consistent conditions, rarely gets crowded. Notable shark presence in the area.",
    difficulty: "Intermediate",
    waveType: "Reef Break",
    swellSize: {
      min: 1.0,
      max: 3.5,
    },
    idealSwellPeriod: {
      min: 10,
      max: 16,
    },
    waterTemp: {
      summer: 28, // Based on current reading of 27.7°C
      winter: 22,
    },
    hazards: ["Sharks", "Cross-shore winds", "Remote location"],
    crimeLevel: "Low",
    sharkAttack: {
      hasAttack: true,
    },
    image: "",
    coordinates: {
      lat: -28.1269,
      lng: 32.5522,
    },
  },
  {
    id: "oyster-bay-beach",
    name: "Oyster Bay Beach - Coco Beach",
    continent: "Africa",
    country: "Tanzania",
    region: "Dar es Salaam",
    location: "Tanzania (Mainland)",
    distanceFromCT: 3800, // Approximate distance from Cape Town
    optimalWindDirections: ["W"],
    optimalSwellDirections: {
      min: 67.5, // ENE
      max: 112.5, // ESE
      cardinal: "E",
    },
    bestSeasons: ["winter"], // Summer noted as mostly flat
    optimalTide: "High",
    description:
      "Exposed beach and reef break rated 3/5 with fairly consistent surf, though summer tends to be flat. Works best with East swell and Westerly offshore winds. Receives both windswells and groundswells equally. Features a left-hand reef break that's better than the right. Best conditions during rising high tide. Despite good waves when working, crowds are unknown. Watch out for sea urchins and sharks.",
    difficulty: "Intermediate",
    waveType: "Beach and Reef Break",
    swellSize: {
      min: 1.0,
      max: 3.0,
    },
    idealSwellPeriod: {
      min: 10,
      max: 16,
    },
    waterTemp: {
      summer: 29, // Based on current reading of 28.7°C
      winter: 25,
    },
    hazards: [
      "Sharks",
      "Sea urchins",
      "Poor conditions in light onshore winds",
    ],
    crimeLevel: "Medium",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -6.7924,
      lng: 39.2083,
    },
  },
  {
    id: "ambinanibe",
    name: "Ambinanibe",
    continent: "Africa",
    country: "Madagascar",
    region: "Madagascar East",
    location: "Antanosy",
    distanceFromCT: 2800, // Approximate distance from Cape Town
    optimalWindDirections: ["NNW"],
    optimalSwellDirections: {
      min: 202.5, // SSW
      max: 247.5, // WSW
      cardinal: "SW",
    },
    bestSeasons: ["winter"],
    optimalTide: "All",
    description:
      "Exposed beach break rated 2/5 with consistent surf conditions. Works best with Southwest groundswell and North-northwest offshore winds. Predominantly right-hand waves. Despite lower rating, spot can get crowded. Winter offers the best conditions. Watch out for rips, rocks, and sharks.",
    difficulty: "All Levels",
    waveType: "Beach Break",
    swellSize: {
      min: 1.0,
      max: 3.0,
    },
    idealSwellPeriod: {
      min: 10,
      max: 14,
    },
    waterTemp: {
      summer: 28, // Based on current reading
      winter: 24,
    },
    hazards: ["Rip currents", "Rocks", "Sharks"],
    crimeLevel: "Medium",
    sharkAttack: {
      hasAttack: false,
    },
    image: "",
    coordinates: {
      lat: -25.0419, // Approximate coordinates for Antanosy region
      lng: 46.9953,
    },
  },
  {
    id: "flameballs",
    name: "Flameballs",
    continent: "Africa",
    country: "Madagascar",
    region: "Madagascar West",
    location: "Vezo Reefs",
    distanceFromCT: 2900, // Approximate distance from Cape Town
    optimalWindDirections: ["SE", "ESE", "E"],
    optimalSwellDirections: {
      min: 157.5, // SSE
      max: 202.5, // SSW
      cardinal: "S",
    },
    bestSeasons: ["winter"],
    optimalTide: "Low to Mid",
    description:
      "Fairly exposed reef break with fairly consistent surf. Predominantly groundswell-driven spot offering a left-hand reef break. Despite consistent conditions, rarely gets crowded. Reaching Flame Bowls typically involves a 30-minute boat trip from Anakao, often via Nosy Ve Island. The area is part of the Vezo Reef system, which includes other notable surf spots like Chefs, Googles, Jelly Babies, Puss Puss, and Resorts. Watch out for coral, sharks, and rocks.",
    difficulty: "Advanced",
    waveType: "Reef Break",
    swellSize: {
      min: 1.5,
      max: 3.0,
    },
    idealSwellPeriod: {
      min: 12,
      max: 16,
    },
    waterTemp: {
      summer: 30, // Based on current reading of 29.6°C
      winter: 25,
    },
    hazards: ["Sharp, jagged coral reef", "Sharks", "Rocks"],
    crimeLevel: "Medium",
    sharkAttack: {
      hasAttack: false,
    },
    image: "/images/beaches/td-flame.jpg",
    coordinates: {
      lat: -20.2833, // Approximate coordinates for Vezo region
      lng: 43.6667,
    },
    videos: [
      {
        url: "https://www.youtube.com/watch?v=UvXFDy5fNX0&ab_channel=TheSurfer%27sJournal",
        title:
          "Notes from the Channel | Finding Waves in Madagascar - Flame Bowls",
        platform: "youtube",
      },
      {
        url: "https://www.youtube.com/watch?v=ZppVg6OlcoA&ab_channel=madagascarsurf",
        title: "perfect set @flameballs ~ Surf Madagascar 2012",
        platform: "youtube",
      },
    ],
  },
];

export const REGIONS = [
  ...new Set(beachData.map((beach) => beach.region)),
] as const;

export type Region = (typeof REGIONS)[number]; // Ensure this line exists and is exported

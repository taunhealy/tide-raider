export interface SectionData {
  title: string;
  description: string;
  // Add other properties as needed
}

// Blog Types
export interface Category {
  title: string;
  slug: { current: string };
}

export interface Post {
  _id?: string;
  title: string;
  template?: {
    name: string;
    sidebar: string;
    sidebarWidgets: Array<Widget>;
  };
  location?: {
    beachName: string;
    region: string;
    country: string;
    continent: string;
    weatherCity: string;
  };
  slug: { current: string };
  mainImage: any;
  hoverImage?: any;
  publishedAt: string;
  description: string;
  categories: Category[];
  content: Array<{
    type: "intro" | "content" | "conclusion";
    text: any;
    image: any;
  }>;
  relatedPosts?: Post[];
  travelCosts?: TravelCosts;
}

// Widget Types
export interface Widget {
  type: string;
  order: number;
  config?: any;
}

// Travel Types
export interface Airport {
  code: string;
  name: string;
  baseCost: number;
}

export interface TravelCosts {
  airports: Airport[];
  accommodation: {
    costPerNight: number;
    hotelName: string;
    bookingLink: string;
  };
  dailyExpenses: {
    food: number;
    transport: number;
    activities: number;
    medical: number;
  };
}

export interface Post {
  _id?: string;
  title: string;
  slug: { current: string };
  mainImage: any;
  publishedAt: string;
  description: string;
  categories?: { title: string; slug?: { current: string } }[];
  template?: {
    name: string;
    sidebar: string;
    sidebarWidgets: Array<Widget>;
  };
}

// Base Widget Interface
export interface BaseWidget {
  _type: string;
  _key?: string;
  title: string;
  order: number;
}

// Specific Widget Types
export interface SurfSpotsWidget extends BaseWidget {
  _type: "surfSpotsWidget";
  region: string;
}

export interface WeatherWidget extends BaseWidget {
  _type: "weatherWidget";
  region: string;
}

export interface TravelWidget extends BaseWidget {
  _type: "travelWidget";
  destinationCode: string;
}

export interface LocationMapWidget extends BaseWidget {
  _type: "locationMap";
  region: string;
  country: string;
  continent: string;
}

export interface CategoryListWidget extends BaseWidget {
  _type: "categoryListWidget";
  displayStyle: string;
  showPostCount: boolean;
}

export interface TagCloudWidget extends BaseWidget {
  _type: "tagCloudWidget";
  maxTags?: number;
  orderBy?: "popularity" | "alphabetical" | "recent";
  showTagCount?: boolean;
}

export interface RelatedPostsWidget extends BaseWidget {
  _type: "relatedPostsWidget";
  numberOfPosts?: number;
}

export interface FlightSearchWidget extends BaseWidget {
  _type: "flightSearchWidget";
  destinationCode?: string;
}

// Union type for all widgets
export type Widget =
  | SurfSpotsWidget
  | WeatherWidget
  | TravelWidget
  | LocationMapWidget
  | CategoryListWidget
  | TagCloudWidget
  | RelatedPostsWidget


// Props Types for Widget Components
export type SurfSpotsWidgetProps = Pick<SurfSpotsWidget, "title" | "region">;
export type WeatherWidgetProps = Pick<WeatherWidget, "title" | "region">;
export type TravelWidgetProps = Pick<TravelWidget, "title" | "destinationCode">;

// Then update the props type in CategoryListWidget.tsx
type CategoryListWidgetProps = Pick<
  CategoryListWidget,
  "title" | "displayStyle" | "showPostCount"
>;

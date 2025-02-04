import SidebarWidgetFactory from "../widgets/SidebarWidgetFactory";
import { Post } from "@/app/types";

interface BlogSidebarProps {
  posts?: Post[];
  widgets: Widget[];
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

// Union type for all widgets
export type Widget =
  | SurfSpotsWidget
  | WeatherWidget
  | TravelWidget
  | LocationMapWidget
  | CategoryListWidget;

// Props Types for Widget Components
export type SurfSpotsWidgetProps = Pick<SurfSpotsWidget, "title" | "region">;
export type WeatherWidgetProps = Pick<WeatherWidget, "title" | "region">;
export type TravelWidgetProps = Pick<TravelWidget, "title" | "destinationCode">;

export default function BlogSidebar({ posts, widgets }: BlogSidebarProps) {
  console.log("BlogSidebar widgets:", { widgets, posts });

  // Just sort widgets by order, no flattening needed
  const sortedWidgets = [...(widgets || [])].sort((a, b) => a.order - b.order);

  if (!widgets?.length) {
    return (
      <div className="bg-gray-50 p-4 rounded">
        <p className="text-gray-500">No widgets configured</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedWidgets.map((widget, index) => (
        <SidebarWidgetFactory
          key={`${widget._type}-${index}`}
          widget={widget}
          posts={posts}
        />
      ))}
    </div>
  );
}

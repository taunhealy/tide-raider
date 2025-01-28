import { ReactNode } from "react";
import RelatedPostsWidget from "./RelatedPostsWidget";
import LocationMapWidget from "./LocationMapWidget";
import CategoryListWidget from "./CategoryListWidget";
import TagCloudWidget from "./TagCloudWidget";
import WeatherWidget from "./WeatherWidget";
import FlightSearchWidget from "../FlightSearchWidget";

interface WidgetConfig {
  type: string;
  order: number;
  config: any;
  title?: string;
}

interface SidebarWidgetFactoryProps {
  widget: WidgetConfig;
  location?: {
    beachName: string;
    region: string;
    country: string;
  };
  posts?: any[];
}

export default function SidebarWidgetFactory({
  widget,
  location,
  posts,
}: SidebarWidgetFactoryProps): ReactNode {
  // Add detailed widget logging
  console.log("🎯 SidebarWidgetFactory: Widget details:", {
    type: widget.type, // Just use type, not _type
    title: widget.title,
    order: widget.order,
  });

  // Debug log to check widget configuration
  console.log("🔧 SidebarWidgetFactory: Processing widget:", {
    type: widget.type,
    config: widget.config,
    location: location,
  });

  // Debug log to check location data
  console.log("Location data in SidebarWidgetFactory:", location);

  // Default placeholder component for missing data
  const PlaceholderWidget = ({ type }: { type: string }) => (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <p className="text-gray-500 text-sm">Loading {type} widget...</p>
    </div>
  );

  switch (widget.type) {
    case "relatedPosts":
      return posts ? (
        <RelatedPostsWidget
          posts={posts}
          title={widget.config?.title || "Related Posts"}
          maxPosts={widget.config?.maxPosts || 3}
        />
      ) : (
        <PlaceholderWidget type="Related Posts" />
      );

    case "locationMap":
      return location ? (
        <LocationMapWidget location={location} {...widget.config} />
      ) : (
        <PlaceholderWidget type="Location Map" />
      );

    case "categoryList":
      return <CategoryListWidget {...widget.config} />;

    case "tagCloud":
      return <TagCloudWidget {...widget.config} />;

    case "weather":
      console.log("🌤️ SidebarWidgetFactory: Weather widget case hit", {
        location,
        widget,
      });
      return location ? (
        <WeatherWidget
          location={location}
          key={`weather-${location.beachName}`}
        />
      ) : (
        <PlaceholderWidget type="Weather" />
      );

    case "flightSearch":
      return location ? (
        <FlightSearchWidget destination={location.country} {...widget.config} />
      ) : (
        <PlaceholderWidget type="Flight Search" />
      );

    default:
      return <PlaceholderWidget type={widget.type || "Unknown"} />;
  }
}

import { ReactNode } from "react";
import { Post, Widget } from "@/app/types/blog";
import RelatedPostsWidget from "./RelatedPostsWidget";
import LocationMapWidget from "./LocationMapWidget";
import CategoryListWidget from "./CategoryListWidget";
import TagCloudWidget from "./TagCloudWidget";
import WeatherWidget from "./WeatherWidget";
import SurfSpotsWidget from "./SurfSpotsWidget";
import TravelWidget from "./TravelWidget";

interface SidebarWidgetFactoryProps {
  widget: Widget;
  posts?: Post[];
}

export default function SidebarWidgetFactory({
  widget,
  posts,
}: SidebarWidgetFactoryProps): ReactNode {
  // Add detailed widget logging
  console.log("🎯 SidebarWidgetFactory: Widget details:", {
    type: widget._type, // Just use type, not _type
    title: widget.title,
    order: widget.order,
  });

  // Default placeholder component for missing data
  const PlaceholderWidget = ({ type }: { type: string }) => (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <p className="text-gray-500 text-sm">Loading {type} widget...</p>
    </div>
  );

  switch (widget._type) {
    case "tagCloudWidget":
      return (
        <TagCloudWidget
          title={widget.title}
          maxTags={widget.maxTags}
          orderBy={widget.orderBy}
          showTagCount={widget.showTagCount}
        />
      );

    case "travelWidget":
      return (
        <TravelWidget
          title={widget.title}
          destinationCode={widget.destinationCode}
        />
      );

    case "weatherWidget":
      console.log("🌤️ Weather widget config:", widget.region);
      return <WeatherWidget title={widget.title} region={widget.region} />;

    case "relatedPostsWidget":
      return posts ? (
        <RelatedPostsWidget
          title={widget.title}
          posts={posts}
          maxPosts={widget.numberOfPosts}
        />
      ) : null;

    case "locationMap":
      return (
        <LocationMapWidget
          location={{
            beachName: widget.title,
            region: widget.region,
            country: widget.country || "Unknown",
            continent: widget.continent || "Unknown",
          }}
        />
      );

    case "categoryListWidget":
      return (
        <CategoryListWidget
          title={widget.title}
          displayStyle={widget.displayStyle}
          showPostCount={widget.showPostCount}
        />
      );
      return (
        <FlightSearchWidget
          title={widget.title}
          destinationCode={widget.destinationCode || "CPT"}
        />
      );

    case "surfSpotsWidget":
      console.log("🏄‍♂️ Surf spots config:", widget.region);
      return <SurfSpotsWidget title={widget.title} region={widget.region} />;

    default:
      console.warn(
        `Unknown widget type: ${(widget as { _type: string })._type}`
      );
      return null;
  }
}

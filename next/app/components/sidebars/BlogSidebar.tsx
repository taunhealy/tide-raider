"use client";

import FlightSearchWidget from "../FlightSearchWidget";
import WeatherWidget from "../WeatherWidget";
import QuestLogSidebar from "../QuestLogSidebar";
import EventsSidebar from "../EventsSidebar";
import BlogPostsSidebar from "../BlogPostsSidebar";
import { urlForImage } from "@/app/lib/urlForImage";
import { FormattedDate } from "../FormattedDate";
import { Inter } from "next/font/google";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

interface Widget {
  type: string;
  order: number;
  config?: any;
}

interface BlogSidebarProps {
  location?: {
    beachName: string;
    region: string;
    country: string;
  };
  posts: any[];
  widgets: Widget[];
}

const WidgetComponents: Record<string, React.FC<any>> = {
  FlightWidget: FlightSearchWidget,
  WeatherWidget: WeatherWidget,
  QuestLogWidget: QuestLogSidebar,
  EventsWidget: EventsSidebar,
  RelatedPostsWidget: BlogPostsSidebar,
};

export default function BlogSidebar({
  location,
  posts,
  widgets = [],
}: BlogSidebarProps) {
  // Sort widgets by order
  const sortedWidgets = [...widgets].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      {sortedWidgets.map((widget, index) => {
        const WidgetComponent = WidgetComponents[widget.type];
        if (!WidgetComponent) return null;

        return (
          <div key={`${widget.type}-${index}`}>
            <WidgetComponent
              location={location}
              posts={posts}
              {...widget.config}
            />
          </div>
        );
      })}
    </div>
  );
}

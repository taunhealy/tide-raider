import SidebarWidgetFactory from "../widgets/SidebarWidgetFactory";
import { Post } from "@/app/types";

interface BlogSidebarProps {
  location?: {
    beachName: string;
    region: string;
    country: string;
  };
  posts?: Post[];
  widgets: Array<{
    type: string;
    order: number;
    config: any;
  }>;
}

export default function BlogSidebar({
  location,
  posts,
  widgets,
}: BlogSidebarProps) {
  console.log("BlogSidebar widgets:", {
    widgets,
    location,
    posts,
  });

  // Sort widgets by order
  const sortedWidgets = [...(widgets || [])].sort((a, b) => a.order - b.order);

  if (!widgets || widgets.length === 0) {
    console.log("No widgets found in BlogSidebar");
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
          key={`${widget.type}-${index}`}
          widget={widget}
          location={location}
          posts={posts}
        />
      ))}
    </div>
  );
}

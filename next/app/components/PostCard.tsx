"use client";

import { useState } from "react";
import { Story, StoryCategory } from "@/app/types/stories";
import { useSession } from "next-auth/react";
import { Edit2, Trash2, Calendar, MapPin, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/app/lib/utils";
import { Inter } from "next/font/google";
import { EditPostModal } from "./EditPostModal";
import { useQueryClient, useMutation } from "@tanstack/react-query";

const inter = Inter({ subsets: ["latin"] });

const categoryColors: Record<StoryCategory, { bg: string; text: string }> = {
  Travel: { bg: "bg-blue-100", text: "text-blue-700" },
  Wipeouts: { bg: "bg-red-100", text: "text-red-700" },
  Crime: { bg: "bg-purple-100", text: "text-purple-700" },
  "Favourite Sessions": { bg: "bg-green-100", text: "text-green-700" },
  "Wildlife Encounters": { bg: "bg-yellow-100", text: "text-yellow-700" },
};

interface PostCardProps {
  story: Story;
  isAuthor: boolean;
}

export function PostCard({ story, isAuthor }: PostCardProps) {
  const { data: session } = useSession();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const queryClient = useQueryClient();

  const CHARACTER_LIMIT = 280;
  const truncatedDetails =
    story.details.length > CHARACTER_LIMIT && !isExpanded
      ? `${story.details.substring(0, CHARACTER_LIMIT)}...`
      : story.details;

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/stories/${story.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete story");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
  });

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this story?")) {
      deleteMutation.mutate();
    }
  };

  return (
    <>
      <article
        className={cn(
          "group bg-[var(--color-bg-primary)] rounded-lg p-[32px]",
          "border border-[var(--color-border-light)]",
          "transition-all duration-300",
          "hover:border-[var(--color-border-medium)] hover:shadow-sm"
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div>
              <h3 className={cn("heading-5 text-[var(--color-text-primary)]")}>
                {story.author.name}
              </h3>
              <p className="text-[var(--color-text-secondary)] text-sm">
                {formatDistanceToNow(new Date(story.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>

          <span
            className={cn(
              "px-3 py-1 rounded-full text-sm font-medium",
              categoryColors[story.category].bg,
              categoryColors[story.category].text
            )}
          >
            {story.category}
          </span>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h2
            className={cn(
              "text-xl font-semibold text-[var(--color-text-primary)]"
            )}
          >
            {story.title}
          </h2>

          {/* Location and Date */}
          <div className="flex items-center gap-4 text-sm text-[var(--color-text-secondary)]">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{story.customBeach || story.beach?.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(story.date).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Story Details */}
          <p className="text-[var(--color-text-primary)] whitespace-pre-line">
            {truncatedDetails}
            {story.details.length > CHARACTER_LIMIT && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="ml-1 text-blue-600 hover:text-blue-700 font-medium"
              >
                {isExpanded ? "Show less" : "Read more"}
              </button>
            )}
          </p>

          {/* Link */}
          {story.link && (
            <a
              href={story.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>View Related Content</span>
            </a>
          )}
        </div>

        {/* Action Buttons */}
        {isAuthor && (
          <div className="flex items-center gap-2 mt-6 pt-4 border-t border-[var(--color-border-light)]">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-3 py-1 text-sm text-red-600 hover:text-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        )}
      </article>

      <EditPostModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        story={story}
      />
    </>
  );
}

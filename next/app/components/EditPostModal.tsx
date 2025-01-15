"use client";

import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { X, Loader2, Link as LinkIcon } from "lucide-react";
import { Inter } from "next/font/google";
import { cn } from "@/app/lib/utils";
import type { Story, StoryCategory } from "@/app/types/stories";
import { beachData } from "@/app/types/beaches";

const inter = Inter({ subsets: ["latin"] });

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  story: Story;
}

const CATEGORIES: StoryCategory[] = [
  "Travel",
  "Wipeouts",
  "Crime",
  "Favourite Sessions",
  "Wildlife Encounters",
];

export function EditPostModal({ isOpen, onClose, story }: EditPostModalProps) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState(story.beach?.name || "");

  const [formData, setFormData] = useState({
    title: story.title,
    beach: story.beach?.id || "other",
    date: new Date(story.date).toISOString().split("T")[0],
    details: story.details,
    category: story.category,
    link: story.link || "",
  });

  // Filter beaches based on search term
  const filteredBeaches = beachData.filter((beach) =>
    beach.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle beach selection
  const handleBeachSelect = (beachId: string, beachName: string) => {
    setFormData({
      ...formData,
      beach: beachId,
    });
    setSearchTerm(beachName);
  };

  // Beach selection JSX
  const beachSelectionJSX = (
    <div>
      <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
        Beach
      </label>
      <select
        required
        value={formData.beach}
        onChange={(e) => {
          setFormData({ ...formData, beach: e.target.value });
          setSearchTerm(e.target.value === "other" ? "Other" : beachData.find(b => b.id === e.target.value)?.name || "");
        }}
        className="w-full px-3 py-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border-light)] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="other">Other</option>
        {beachData.map((beach) => (
          <option key={beach.id} value={beach.id}>
            {beach.name}
          </option>
        ))}
      </select>
    </div>
  );

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("date", formData.date);
    formDataToSend.append("details", formData.details);
    formDataToSend.append("category", formData.category);
    formDataToSend.append("beach", formData.beach);
    formDataToSend.append("link", formData.link);

    editStoryMutation.mutate(formDataToSend);
  };

  const editStoryMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch(`/api/stories/${story.id}`, {
        method: "PUT",
        body: data,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update story");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      onClose();
    },
    onError: (error) => {
      console.error("Failed to update story:", error);
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        <div className="inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-[var(--color-bg-primary)] rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-[var(--color-border-light)]">
            <h3
              className={cn(
                "text-lg font-semibold text-[var(--color-text-primary)]",
                inter.className
              )}
            >
              Edit Story
            </h3>
            <button
              onClick={onClose}
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-3 py-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border-light)] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Beach Selection */}
            {beachSelectionJSX}

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                Category
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value as StoryCategory,
                  })
                }
                className="w-full px-3 py-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border-light)] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full px-3 py-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border-light)] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Story Details */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                Story Details
              </label>
              <textarea
                required
                value={formData.details}
                onChange={(e) =>
                  setFormData({ ...formData, details: e.target.value })
                }
                rows={6}
                className="w-full px-3 py-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border-light)] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Link */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                Related Link
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LinkIcon className="h-5 w-5 text-[var(--color-text-secondary)]" />
                </div>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) =>
                    setFormData({ ...formData, link: e.target.value })
                  }
                  className="w-full pl-10 px-3 py-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border-light)] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] bg-[var(--color-bg-secondary)] border border-[var(--color-border-light)] rounded-md hover:bg-[var(--color-bg-tertiary)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={editStoryMutation.isPending}
                className={cn(
                  "px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md",
                  "hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "flex items-center gap-2"
                )}
              >
                {editStoryMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

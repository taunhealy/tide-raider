"use client";

import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/Button";
import { toast } from "sonner";
import confetti from "canvas-confetti";

export default function BioSection({
  initialBio,
  initialLink,
  isOwnProfile,
  userId,
}: {
  initialBio?: string;
  initialLink?: string;
  isOwnProfile: boolean;
  userId: string;
}) {
  const [bio, setBio] = useState(initialBio || "");
  const [link, setLink] = useState(initialLink || "");
  const [isSaving, setIsSaving] = useState(false);

  // Sync with parent updates
  useEffect(() => {
    setBio(initialBio || "");
    setLink(initialLink || "");
  }, [initialBio, initialLink]);

  const handleSaveBio = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/user/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio, link }),
      });
      if (!response.ok) throw new Error("Failed to save bio");

      toast.success("Bio updated successfully!");
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (error) {
      toast.error("Failed to save bio");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Bio</label>
        {isOwnProfile ? (
          <>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-4 border rounded-sm min-h-[100px]"
              placeholder="A bit about you..."
            />
            <Button
              onClick={handleSaveBio}
              className="mt-2"
              variant="outline"
              isLoading={isSaving}
            >
              {isSaving ? "Saving..." : "Save Bio"}
            </Button>
          </>
        ) : (
          <p className="text-gray-600">{bio || "No bio yet..."}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Website</label>
        {isOwnProfile ? (
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="w-full p-2 border rounded-md"
            placeholder="https://www.lekkersoosafirekrekker.com"
          />
        ) : (
          link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-tertiary)] hover:underline"
            >
              {link}
            </a>
          )
        )}
      </div>
    </div>
  );
}

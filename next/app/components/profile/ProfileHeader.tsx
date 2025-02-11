"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/app/components/ui/Button";
import { User } from "@prisma/client"; // Assuming you have a User type

interface ProfileHeaderProps {
  userData: {
    name: string;
    image: string | null;
    id: string;
    createdAt?: Date | string;
  };
  isOwnProfile?: boolean;
}

export default function ProfileHeader({
  userData,
  isOwnProfile,
}: ProfileHeaderProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    setIsUploading(true);
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/user/avatar", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload avatar");
      }

      // Force a page refresh to show the new avatar
      window.location.reload();
    } catch (error) {
      console.error("Error uploading avatar:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-4 mb-8">
      <div className="relative group">
        {userData.image ? (
          <Image
            src={userData.image}
            alt={`${userData.name}'s profile picture`}
            width={100}
            height={100}
            className="rounded-full"
          />
        ) : (
          <div className="w-[100px] h-[100px] bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-2xl font-primary text-gray-500">
              {userData.name?.[0]?.toUpperCase() || "?"}
            </span>
          </div>
        )}

        {isOwnProfile && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-center text-sm py-1 rounded-b-full opacity-0 group-hover:opacity-100 transition-opacity">
            <label className="cursor-pointer w-full block">
              {isUploading ? "Uploading..." : "Change"}
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={isUploading}
              />
            </label>
          </div>
        )}
      </div>

      <div>
        <h1 className="text-2xl font-bold font-primary">
          {userData?.name || "Anonymous"}
        </h1>
        <p className="text-gray-600 font-primary">
          Joined{" "}
          {userData?.createdAt
            ? new Date(userData.createdAt).toLocaleDateString()
            : "Unknown"}
        </p>
      </div>
    </div>
  );
}

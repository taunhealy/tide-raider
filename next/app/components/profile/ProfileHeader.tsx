"use client";

import Image from "next/image";
import { useState } from "react";
import { countries } from "countries-list";

type CountryWithEmoji = {
  name: string;
  emoji: string;
};

interface ProfileHeaderProps {
  userData: {
    name: string;
    image: string | null;
    id: string;
    createdAt?: Date | string;
    link?: string;
    nationality?: string;
    nationalityName?: string;
  };
  isOwnProfile?: boolean;
  nationalitySelector?: React.ReactNode;
}

function getFlagEmoji(countryCode: string) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export default function ProfileHeader({
  userData,
  isOwnProfile,
  nationalitySelector,
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
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold font-primary">
            {userData?.name || "Anonymous"}
          </h1>
          {nationalitySelector}
        </div>
        {userData?.nationality && (
          <div className="text-sm text-gray-600 mt-1">
            From{" "}
            {
              (countries as Record<string, { name: string }>)[
                userData.nationality
              ]?.name
            }{" "}
            {getFlagEmoji(userData.nationality)}
          </div>
        )}
        {userData?.link && (
          <div className="mt-1">
            <a
              href={userData.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-tertiary)] hover:underline text-sm"
            >
              {userData.link.replace(/(^\w+:|^)\/\//, "")}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

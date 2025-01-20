"use client";

import { useState } from "react";
import { AD_CATEGORIES, type AdCategory } from "../lib/constants";
import type { Region } from "../types/beaches";

export default function AdvertisingPage() {
  const [selectedCategory, setSelectedCategory] = useState<AdCategory | "">("");
  const [selectedRegion, setSelectedRegion] = useState<Region>("");
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    websiteUrl: "",
    region: "",
  });

  const REGIONS: Region[] = ["Western Cape", "Eastern Cape", "Northern Cape"];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, String(value));
      });
      submitData.append("category", selectedCategory);
      submitData.append("region", selectedRegion);

      const submitResponse = await fetch("/api/advertising/submit", {
        method: "POST",
        body: submitData,
      });

      if (!submitResponse.ok) {
        throw new Error("Failed to submit ad request");
      }

      const { id } = await submitResponse.json();

      // Get PayFast checkout URL and payload
      const checkoutResponse = await fetch("/api/advertising/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adId: id }),
      });

      if (!checkoutResponse.ok) {
        throw new Error("Failed to create checkout");
      }

      const { url, payload } = await checkoutResponse.json();

      // Create and submit PayFast form
      const form = document.createElement("form");
      form.method = "POST";
      form.action = url;

      Object.entries(payload).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value as string;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      console.error("Submission error:", error);
      setError(
        error instanceof Error ? error.message : "Failed to submit request"
      );
    }
  };
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Advertise Your Business</h1>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Advertisement Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as AdCategory)}
            className="w-full p-2 border rounded-md"
            required
          >
            <option value="">Select a category</option>
            {Object.entries(AD_CATEGORIES).map(([id, category]) => (
              <option key={id} value={id}>
                {category.label} - R{category.monthlyPrice}/month
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Region
          </label>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value as Region)}
            className="w-full p-2 border rounded-md"
            required
          >
            <option value="">Select a region</option>
            {REGIONS.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full p-2 border rounded-md"
            rows={4}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Website URL
          </label>
          <input
            type="url"
            value={formData.websiteUrl}
            onChange={(e) =>
              setFormData({ ...formData, websiteUrl: e.target.value })
            }
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Continue to Payment - R
          {selectedCategory ? AD_CATEGORIES[selectedCategory].monthlyPrice : 0}
          /month
        </button>
      </form>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  AD_CATEGORIES,
  ADVENTURE_AD_CATEGORIES,
} from "@/app/lib/advertising/constants";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/app/components/ui/Button";

export default function EditAdPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    companyName: "",
    linkUrl: "",
    imageUrl: "",
    category: "",
    regionId: "",
    categoryType: "local", // Default to local, will be updated when ad loads
    description: "", // Add description field
  });

  // Fetch ad data
  const { data: ad, isLoading } = useQuery({
    queryKey: ["ad", params.id],
    queryFn: async () => {
      const response = await fetch(`/api/ads/${params.id}/edit`);
      if (!response.ok) throw new Error("Failed to fetch ad");
      return response.json();
    },
  });

  // Update form data when ad data is loaded
  useEffect(() => {
    if (ad) {
      setFormData({
        title: ad.title || "",
        companyName: ad.companyName || "",
        linkUrl: ad.linkUrl || "",
        imageUrl: ad.imageUrl || "",
        category: ad.category || "",
        regionId: ad.regionId || "",
        categoryType: ad.categoryType || "local", // Get the category type from the ad
        description: ad.description || "", // Get description from the ad
      });
    }
  }, [ad]);

  // Update ad mutation
  const updateAdMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch(`/api/ads/${params.id}/edit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to update ad");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ad", params.id] });
      toast.success("Ad updated successfully");
      router.push(`/dashboard/ads/${params.id}`);
      router.refresh();
    },
    onError: (error) => {
      console.error("Error updating ad:", error);
      toast.error("Failed to update advertisement");
    },
    onSettled: () => {
      setIsSaving(false);
    },
  });

  // Image upload mutation
  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload image");
      return response.json();
    },
    onSuccess: async (data) => {
      console.log("Image uploaded successfully, URL:", data.imageUrl);

      // Update the form state
      setFormData((prev) => ({ ...prev, imageUrl: data.imageUrl }));

      // Directly update the image URL in the database
      try {
        // Check if we have a valid URL
        if (!data.imageUrl) {
          throw new Error("No image URL returned from upload");
        }

        const response = await fetch(`/api/ads/${params.id}/edit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: data.imageUrl }),
        });

        if (!response.ok) {
          throw new Error("Failed to update image URL in database");
        }

        const result = await response.json();
        console.log("Image URL updated in database:", result);

        toast.success("Image uploaded and saved successfully");

        // Refresh the ad data
        queryClient.invalidateQueries({ queryKey: ["ad", params.id] });
      } catch (error) {
        console.error("Error updating image URL in database:", error);
        toast.error("Image uploaded but failed to save to database");
      }
    },
    onError: (error) => {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    },
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Create a complete data object with all fields explicitly included
    const dataToSubmit = {
      title: formData.title,
      companyName: formData.companyName,
      linkUrl: formData.linkUrl,
      imageUrl: formData.imageUrl, // Ensure this is included
      category: formData.category,
      regionId: formData.regionId,
      categoryType: formData.categoryType,
      description: formData.description, // Include description in submission
    };

    console.log("Submitting data with imageUrl:", dataToSubmit.imageUrl);

    updateAdMutation.mutate(dataToSubmit);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    console.log("Uploading file:", file.name); // Add logging
    uploadImageMutation.mutate(file);
  };

  // Toggle between local and adventure category types
  const toggleCategoryType = (type: "local" | "adventure") => {
    setFormData((prev) => ({
      ...prev,
      categoryType: type,
      category: "", // Reset category when switching types
    }));
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6 font-primary">
        <div className="text-center py-12">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 font-primary">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Edit Advertisement</h1>
          <p className="text-[var(--color-text-secondary)]">
            Update your advertisement details
          </p>
        </div>
        <div className="flex space-x-3">
          <Link href="/dashboard/ads">
            <Button variant="outline" size="default">
              Back To Your Ads
            </Button>
          </Link>
          <Link href={`/dashboard/ads/${params.id}`}>
            <Button variant="outline" size="default">
              Cancel
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-sm p-6 border border-[var(--color-border-light)]">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                Company Name
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Ad Title (optional)
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Link URL</label>
              <input
                type="url"
                name="linkUrl"
                value={formData.linkUrl}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                rows={4}
                placeholder="Enter a brief description of your advertisement"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Image</label>
              {formData.imageUrl && (
                <div className="mb-2">
                  <img
                    src={formData.imageUrl}
                    alt="Ad preview"
                    className="h-40 object-cover rounded-md"
                  />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Ad Type</label>
              <div className="flex space-x-4 mb-4">
                <Button
                  type="button"
                  variant={
                    formData.categoryType === "local" ? "default" : "outline"
                  }
                  onClick={() => toggleCategoryType("local")}
                >
                  Local Services
                </Button>
                <Button
                  type="button"
                  variant={
                    formData.categoryType === "adventure"
                      ? "default"
                      : "outline"
                  }
                  onClick={() => toggleCategoryType("adventure")}
                >
                  Adventure Experiences
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select a category</option>
                {formData.categoryType === "local"
                  ? // Local service categories
                    Object.entries(AD_CATEGORIES).map(([key, { label }]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))
                  : // Adventure experience categories
                    Object.entries(ADVENTURE_AD_CATEGORIES).map(
                      ([key, { label }]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      )
                    )}
              </select>
            </div>

            <div className="flex justify-end mt-4">
              <Button
                type="submit"
                variant="default"
                isLoading={isSaving || uploadImageMutation.isPending}
                disabled={isSaving || uploadImageMutation.isPending}
                className="px-6 py-2"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

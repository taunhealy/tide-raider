"use client";

import { useState, useEffect } from "react";
import { AD_CATEGORIES, type AdCategory } from "@/app/lib/constants";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Beach } from "@/app/types/beaches";
import { z } from "zod";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { AdvertisingFormData, CreateAdRequestPayload } from "@/app/types/ads";

// Define Zod schema for form validation
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  websiteUrl: z
    .string()
    .min(1, "URL is required")
    .transform((url) => {
      // Add https:// if missing
      if (!/^https?:\/\//i.test(url)) {
        return `https://${url}`;
      }
      return url;
    })
    .refine((url) => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    }, "Please enter a valid URL"),
});

export default function AdvertisingForm() {
  const { data: session } = useSession();
  const [selectedCategory, setSelectedCategory] = useState<AdCategory | null>(
    null
  );
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedBeach, setSelectedBeach] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<AdvertisingFormData>({
    title: "",
    websiteUrl: "",
  });

  // Your existing queries for regions, beaches, and availability
  const { data: regions } = useQuery({
    queryKey: ["regions"],
    queryFn: async () => {
      const res = await fetch("/api/regions");
      return res.json();
    },
  });

  const { data: beaches } = useQuery({
    queryKey: ["beaches", selectedRegion],
    queryFn: async () => {
      if (!selectedRegion) return [];
      const res = await fetch(`/api/beaches?region=${selectedRegion}`);
      return res.json();
    },
    enabled: !!selectedRegion,
  });

  const { data: categoryAvailability } = useQuery({
    queryKey: ["categoryAvailability", selectedBeach, selectedCategory],
    queryFn: async () => {
      if (!selectedBeach || !selectedCategory) return null;
      const res = await fetch(
        `/api/advertising/check-availability?beachId=${selectedBeach}&category=${selectedCategory}`
      );
      return res.json();
    },
    enabled: !!selectedBeach && !!selectedCategory,
  });

  // Function to trigger confetti on success
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!selectedCategory || !selectedRegion || !selectedBeach) {
      console.log("Missing required fields");
      setError("Please fill in all required fields");
      setIsLoading(false);
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate form data with Zod
    const validationResult = formSchema.safeParse(formData);

    if (!validationResult.success) {
      console.error("Validation errors:", validationResult.error.format());
      const errors = validationResult.error.format();

      if (errors.title?._errors?.length) {
        setError(errors.title._errors[0]);
        toast.error(errors.title._errors[0]);
        setIsLoading(false);
        return;
      }

      if (errors.websiteUrl?._errors?.length) {
        setError(errors.websiteUrl._errors[0]);
        toast.error(errors.websiteUrl._errors[0]);
        setIsLoading(false);
        return;
      }

      setError("Please check your form inputs");
      toast.error("Please check your form inputs");
      setIsLoading(false);
      return;
    }

    // Get validated and transformed data
    const validatedData = validationResult.data;

    if (!session?.user?.email) {
      setError("You must be logged in to create an ad");
      toast.error("You must be logged in to create an ad");
      setIsLoading(false);
      return;
    }

    try {
      console.log("Submitting ad with URL:", validatedData.websiteUrl);
      toast.loading("Creating your ad...");

      // Create ad request payload
      const payload: CreateAdRequestPayload = {
        title: validatedData.title,
        companyName: validatedData.title, // Using title as company name
        contactEmail: session.user.email,
        linkUrl: validatedData.websiteUrl,
        category: selectedCategory,
        regionId: selectedRegion,
        targetedBeaches: [selectedBeach],
        status: "PENDING",
        yearlyPrice: selectedCategory
          ? AD_CATEGORIES[selectedCategory as keyof typeof AD_CATEGORIES]
              .monthlyPrice * 12
          : 0,
      };

      // Create ad record first
      const adResponse = await fetch("/api/advertising/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!adResponse.ok) {
        const errorData = await adResponse.json();
        console.error("Ad creation error response:", errorData);
        toast.dismiss();
        toast.error(errorData.error || "Failed to create ad");
        throw new Error(errorData.error || "Failed to create ad");
      }

      const { adId } = await adResponse.json();
      console.log("Ad created successfully with ID:", adId);
      toast.dismiss();
      toast.success("Ad created successfully!");

      // Trigger confetti on successful ad creation
      triggerConfetti();

      // Create PayPal subscription
      toast.loading("Preparing payment...");
      const checkoutResponse = await fetch("/api/advertising/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adId }),
      });

      if (!checkoutResponse.ok) {
        const errorData = await checkoutResponse.json();
        console.error("Checkout error response:", errorData);
        toast.dismiss();
        toast.error("Failed to create checkout");
        throw new Error("Failed to create checkout");
      }

      const { url } = await checkoutResponse.json();
      console.log("Redirecting to payment URL:", url);
      toast.dismiss();
      toast.success("Redirecting to payment...");

      // Redirect to PayPal
      window.location.href = url;
    } catch (error) {
      console.error("Submission error:", error);
      setError(
        error instanceof Error ? error.message : "Failed to submit request"
      );
      toast.error(
        error instanceof Error ? error.message : "Failed to submit request"
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 font-primary">Create Your Ad</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 font-primary">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block mb-2 font-primary">Ad Category</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(AD_CATEGORIES).map(([key, category]) => (
              <div
                key={key}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedCategory === key
                    ? "border-[var(--color-tertiary)] bg-[var(--color-tertiary-light)]"
                    : "border-gray-200 hover:border-[var(--color-tertiary)]"
                }`}
                onClick={() => setSelectedCategory(key as AdCategory)}
              >
                <h3 className="font-bold mb-1 font-primary">
                  {category.label}
                </h3>
                <p className="font-bold font-primary">
                  R{category.monthlyPrice}/month
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="region" className="block mb-2 font-primary">
            Region
          </label>
          <select
            id="region"
            className="w-full p-2 border border-gray-300 rounded-md font-primary"
            value={selectedRegion || ""}
            onChange={(e) => {
              setSelectedRegion(e.target.value || null);
              setSelectedBeach(null);
            }}
          >
            <option value="">Select a region</option>
            {regions?.map((region: { id: string; name: string }) => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label htmlFor="beach" className="block mb-2 font-primary">
            Beach
          </label>
          <select
            id="beach"
            className="w-full p-2 border border-gray-300 rounded-md font-primary"
            value={selectedBeach || ""}
            onChange={(e) => setSelectedBeach(e.target.value || null)}
            disabled={!selectedRegion}
          >
            <option value="">Select a beach</option>
            {beaches?.map((beach: Beach) => (
              <option key={beach.id} value={beach.id}>
                {beach.name}
              </option>
            ))}
          </select>
        </div>

        {selectedBeach && selectedCategory && categoryAvailability && (
          <div
            className={`mb-6 p-4 rounded-md ${
              categoryAvailability.available
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            <p className="font-primary">
              {categoryAvailability.available
                ? "This ad slot is available!"
                : "This ad slot is currently taken. Please choose another beach or category."}
            </p>
          </div>
        )}

        <div className="mb-6">
          <label htmlFor="title" className="block mb-2 font-primary">
            Ad Title
          </label>
          <input
            type="text"
            id="title"
            className="w-full p-2 border border-gray-300 rounded-md font-primary"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
        </div>

        <div className="mb-6">
          <label htmlFor="websiteUrl" className="block mb-2 font-primary">
            Website URL
          </label>
          <input
            type="text"
            id="websiteUrl"
            className="w-full p-2 border border-gray-300 rounded-md font-primary"
            placeholder="https://example.com"
            value={formData.websiteUrl}
            onChange={(e) =>
              setFormData({ ...formData, websiteUrl: e.target.value })
            }
          />
          <p className="text-sm text-gray-500 mt-1 font-primary">
            Enter your website URL (https:// will be added if missing)
          </p>
        </div>

        <button
          type="submit"
          className="w-full bg-[var(--color-tertiary)] text-white py-3 px-6 rounded-md hover:bg-[var(--color-tertiary)] hover:opacity-80 transition-colors mt-8 font-primary flex justify-center items-center"
          disabled={
            isLoading ||
            !session ||
            (!!selectedBeach &&
              !!selectedCategory &&
              !categoryAvailability?.available)
          }
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              Continue to Payment - R
              {selectedCategory
                ? AD_CATEGORIES[selectedCategory].monthlyPrice
                : 0}
              /month
            </>
          )}
        </button>
      </form>
    </div>
  );
}

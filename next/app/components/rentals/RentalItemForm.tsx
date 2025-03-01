"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Beach } from "@prisma/client";
import { ImageUploader } from "@/app/components/ImageUploader";
import {
  RentalItemWithRelations,
  SurfboardSpecifications,
  MotorbikeSpecifications,
  ScooterSpecifications,
  RentalSpecifications,
} from "@/app/types/rentals";
import { beachData } from "@/app/types/beaches";

interface RentalItemFormProps {
  beaches?: Beach[];
  initialData?: RentalItemWithRelations;
}

export function RentalItemForm({ beaches, initialData }: RentalItemFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [itemType, setItemType] = useState<string>(
    initialData?.itemType || "SURFBOARD"
  );

  // Form fields
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [rentPrice, setRentPrice] = useState(initialData?.rentPrice || 0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBeaches, setSelectedBeaches] = useState<string[]>(
    initialData?.availableBeaches?.map((c) => c.beach.id) || []
  );

  // Type-specific specifications
  const [specifications, setSpecifications] = useState<RentalSpecifications>(
    (initialData?.specifications as RentalSpecifications) || {}
  );

  // Filter beaches based on search term
  const filteredBeaches = beachData.filter(
    (beach) =>
      beach.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      beach.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      beach.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = {
        name,
        description,
        rentPrice: parseFloat(rentPrice.toString()),
        images,
        thumbnail: images.length > 0 ? images[0] : null,
        itemType,
        specifications,
        availableBeaches: selectedBeaches,
      };

      const url = initialData
        ? `/api/rental-items/${initialData.id}`
        : "/api/rental-items";

      const response = await fetch(url, {
        method: initialData ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save rental item");
      }

      const data = await response.json();
      setSuccess("Rental item saved successfully!");

      // Redirect after a short delay
      setTimeout(() => {
        router.push(`/rentals/${data.id}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Render different specification forms based on item type
  const renderSpecificationsForm = () => {
    switch (itemType) {
      case "SURFBOARD":
        return (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Board Type
              </label>
              <select
                className="modal-select w-full px-3 py-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border-light)] rounded-md input-focus-ring"
                value={(specifications as SurfboardSpecifications)?.type || ""}
                onChange={(e) =>
                  setSpecifications({
                    ...(specifications as SurfboardSpecifications),
                    type: e.target.value,
                  })
                }
              >
                <option value="">Select Type</option>
                <option value="SHORTBOARD">Shortboard</option>
                <option value="LONGBOARD">Longboard</option>
                <option value="FISH">Fish</option>
                <option value="FUNBOARD">Funboard</option>
                <option value="SUP">SUP</option>
                <option value="GUN">Gun</option>
                <option value="MINI_MAL">Mini Mal</option>
              </select>
            </div>

            <div className="mt-5">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Length (inches)
              </label>
              <input
                type="number"
                className="modal-input w-full px-3 py-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border-light)] rounded-md input-focus-ring"
                value={
                  (specifications as SurfboardSpecifications)?.length || ""
                }
                onChange={(e) =>
                  setSpecifications({
                    ...(specifications as SurfboardSpecifications),
                    length: parseFloat(e.target.value),
                  })
                }
              />
            </div>

            <div className="mt-5">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Fin Setup
              </label>
              <select
                className="modal-select w-full px-3 py-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border-light)] rounded-md input-focus-ring"
                value={
                  (specifications as SurfboardSpecifications)?.finSetup || ""
                }
                onChange={(e) =>
                  setSpecifications({
                    ...(specifications as SurfboardSpecifications),
                    finSetup: e.target.value,
                  })
                }
              >
                <option value="">Select Fin Setup</option>
                <option value="THRUSTER">Thruster</option>
                <option value="TWIN">Twin</option>
                <option value="QUAD">Quad</option>
                <option value="SINGLE">Single</option>
                <option value="FIVE">Five</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>
        );

      case "MOTORBIKE":
        return (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Make
              </label>
              <input
                type="text"
                className="modal-input w-full px-3 py-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border-light)] rounded-md input-focus-ring"
                value={(specifications as MotorbikeSpecifications)?.make || ""}
                onChange={(e) =>
                  setSpecifications({
                    ...(specifications as MotorbikeSpecifications),
                    make: e.target.value,
                  })
                }
              />
            </div>

            <div className="mt-5">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Model
              </label>
              <input
                type="text"
                className="modal-input w-full px-3 py-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border-light)] rounded-md input-focus-ring"
                value={(specifications as MotorbikeSpecifications)?.model || ""}
                onChange={(e) =>
                  setSpecifications({
                    ...(specifications as MotorbikeSpecifications),
                    model: e.target.value,
                  })
                }
              />
            </div>

            <div className="mt-5">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Year
              </label>
              <input
                type="number"
                className="modal-input w-full px-3 py-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border-light)] rounded-md input-focus-ring"
                value={(specifications as MotorbikeSpecifications)?.year || ""}
                onChange={(e) =>
                  setSpecifications({
                    ...(specifications as MotorbikeSpecifications),
                    year: parseInt(e.target.value),
                  })
                }
              />
            </div>

            <div className="mt-5">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Engine Size (cc)
              </label>
              <input
                type="number"
                className="modal-input w-full px-3 py-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border-light)] rounded-md input-focus-ring"
                value={
                  (specifications as MotorbikeSpecifications)?.engineSize || ""
                }
                onChange={(e) =>
                  setSpecifications({
                    ...(specifications as MotorbikeSpecifications),
                    engineSize: parseInt(e.target.value),
                  })
                }
              />
            </div>
          </div>
        );

      case "SCOOTER":
        return (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Make
              </label>
              <input
                type="text"
                className="modal-input w-full px-3 py-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border-light)] rounded-md input-focus-ring"
                value={(specifications as ScooterSpecifications)?.make || ""}
                onChange={(e) =>
                  setSpecifications({
                    ...(specifications as ScooterSpecifications),
                    make: e.target.value,
                  })
                }
              />
            </div>

            <div className="mt-5">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Model
              </label>
              <input
                type="text"
                className="modal-input w-full px-3 py-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border-light)] rounded-md input-focus-ring"
                value={(specifications as ScooterSpecifications)?.model || ""}
                onChange={(e) =>
                  setSpecifications({
                    ...(specifications as ScooterSpecifications),
                    model: e.target.value,
                  })
                }
              />
            </div>

            <div className="mt-5">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Year
              </label>
              <input
                type="number"
                className="modal-input w-full px-3 py-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border-light)] rounded-md input-focus-ring"
                value={(specifications as ScooterSpecifications)?.year || ""}
                onChange={(e) =>
                  setSpecifications({
                    ...(specifications as ScooterSpecifications),
                    year: parseInt(e.target.value),
                  })
                }
              />
            </div>

            <div className="mt-5">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Max Speed (km/h)
              </label>
              <input
                type="number"
                className="modal-input w-full px-3 py-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border-light)] rounded-md input-focus-ring"
                value={
                  (specifications as ScooterSpecifications)?.maxSpeed || ""
                }
                onChange={(e) =>
                  setSpecifications({
                    ...(specifications as ScooterSpecifications),
                    maxSpeed: parseInt(e.target.value),
                  })
                }
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-primary">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          {success}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Item Type
        </label>
        <select
          className="modal-select w-full px-3 py-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border-light)] rounded-md input-focus-ring"
          value={itemType}
          onChange={(e) => {
            setItemType(e.target.value);
            // Reset specifications when type changes
            if (e.target.value === "SURFBOARD") {
              setSpecifications({} as SurfboardSpecifications);
            } else if (e.target.value === "MOTORBIKE") {
              setSpecifications({} as MotorbikeSpecifications);
            } else if (e.target.value === "SCOOTER") {
              setSpecifications({} as ScooterSpecifications);
            }
          }}
        >
          <option value="SURFBOARD">Surfboard</option>
          <option value="MOTORBIKE">Motorbike</option>
          <option value="SCOOTER">Scooter</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name
        </label>
        <input
          type="text"
          className="modal-input w-full px-3 py-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border-light)] rounded-md input-focus-ring"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          className="modal-textarea w-full px-3 py-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border-light)] rounded-md input-focus-ring"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Rental Price (per day)
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">R</span>
          </div>
          <input
            type="number"
            className="pl-7 block w-full rounded-md bg-[var(--color-bg-secondary)] border border-[var(--color-border-light)] input-focus-ring py-2 px-3"
            value={rentPrice}
            onChange={(e) => setRentPrice(parseFloat(e.target.value))}
            required
            min="0"
            step="0.01"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Available Pickup/Dropoff Locations
        </label>

        <div className="mb-3">
          <input
            type="text"
            placeholder="Search beaches by name, location or country..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border-light)] rounded-md input-focus-ring font-primary"
          />
        </div>

        <div className="max-h-60 overflow-y-auto border border-[var(--color-border-light)] rounded-md">
          {filteredBeaches.length > 0 ? (
            filteredBeaches.map((beach) => (
              <div
                key={beach.id}
                className="flex items-center p-3 hover:bg-gray-100 transition-colors border-b border-[var(--color-border-light)] last:border-b-0"
              >
                <input
                  type="checkbox"
                  id={`beach-${beach.id}`}
                  checked={selectedBeaches.includes(beach.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedBeaches([...selectedBeaches, beach.id]);
                    } else {
                      setSelectedBeaches(
                        selectedBeaches.filter((id) => id !== beach.id)
                      );
                    }
                  }}
                  className="h-4 w-4 text-[var(--color-tertiary)] focus:ring-[var(--color-tertiary)] border-gray-300 rounded"
                />
                <label
                  htmlFor={`beach-${beach.id}`}
                  className="ml-2 text-sm font-primary text-gray-700 flex-1"
                >
                  <span className="font-medium">{beach.name}</span>
                  <span className="text-gray-500 ml-1">
                    ({beach.location}, {beach.country})
                  </span>
                </label>
              </div>
            ))
          ) : (
            <p className="p-4 text-sm text-gray-500">
              No beaches found matching "{searchTerm}"
            </p>
          )}
        </div>

        {selectedBeaches.length > 0 && (
          <div className="mt-3">
            <p className="text-sm text-gray-700 mb-2">
              Selected beaches ({selectedBeaches.length}):
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedBeaches.map((beachId) => {
                const beach = beachData.find((b) => b.id === beachId);
                return beach ? (
                  <div
                    key={beach.id}
                    className="inline-flex items-center bg-[var(--color-bg-secondary)] px-2 py-1 rounded-md text-sm"
                  >
                    <span>{beach.name}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedBeaches(
                          selectedBeaches.filter((id) => id !== beach.id)
                        )
                      }
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}

        {beachData && beachData.length > 0 && selectedBeaches.length === 0 && (
          <p className="mt-2 text-sm text-red-500">
            Please select at least one pickup/dropoff location
          </p>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Images (optional)
        </label>
        <ImageUploader images={images} setImages={setImages} maxImages={5} />
        <p className="text-sm text-gray-500 mt-2">
          Upload up to 5 images. The first image will be used as the cover.
        </p>
      </div>

      <div className="bg-[var(--color-bg-secondary)] p-6 rounded-lg border border-[var(--color-border-light)] shadow-sm">
        <h3 className="text-lg font-medium mb-5 text-gray-800">
          Item Specifications
        </h3>
        {renderSpecificationsForm()}
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={loading}
          className="btn-tertiary inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm bg-[var(--color-tertiary)] text-white hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? "Saving..."
            : initialData
              ? "Update Rental Item"
              : "Create Rental Item"}
        </button>
      </div>
    </form>
  );
}

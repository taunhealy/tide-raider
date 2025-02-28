"use client";

import { useState } from "react";
import { BoardImageUpload } from "./BoardImageUpload";
import { BoardType, FinType } from "@prisma/client";
import { beachData } from "@/app/types/beaches";
import { X } from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import { Select, SelectItem } from "@/app/components/ui/Select";

interface CreateBoardFormProps {
  isOpen?: boolean;
  onClose?: () => void;
  board?: any; // Add proper type if editing
  isEditing?: boolean;
}

export function CreateBoardForm({
  isOpen,
  onClose,
  board,
  isEditing,
}: CreateBoardFormProps) {
  const [selectedBeaches, setSelectedBeaches] = useState<string[]>(
    board?.availableBeaches?.map((b: { beachId: string }) => b.beachId) || []
  );
  const [isRental, setIsRental] = useState(board?.isForRent || false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [boardData, setBoardData] = useState({
    images: [] as string[],
  });

  const filteredBeaches = beachData.filter(
    (beach) =>
      beach.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      beach.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
      beach.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.target as HTMLFormElement);

      const boardData = {
        name: formData.get("name"),
        type: formData.get("type") as BoardType,
        length: Number(formData.get("length")),
        finSetup: formData.get("finSetup") as FinType,
        isForRent: isRental,
        rentPrice: isRental ? 1000 : null,
        availableBeaches: selectedBeaches,
        images: [], // Will be populated by image upload
      };

      const response = await fetch("/api/boards", {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          isEditing ? { ...boardData, id: board.id } : boardData
        ),
      });

      if (!response.ok) throw new Error("Failed to save board");

      if (onClose) onClose();
    } catch (error) {
      console.error("Error saving board:", error);
      alert("Failed to save board");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        role="button"
        tabIndex={0}
      />

      <div className="relative bg-white rounded-lg shadow-xl w-full mx-4 md:max-w-[500px] p-4 lg:p-6 overflow-y-auto max-h-[90vh] z-[101]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
          type="button"
        >
          <X className="h-6 w-6" />
        </button>

        <h2 className="text-xl font-semibold mb-4 font-primary">
          {isEditing ? "Edit Board" : "Add New Board"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Board Info */}
          <div className="step">
            <h4 className="text-[12px] font-semibold mb-2 font-primary">
              1. Board Details
            </h4>
            <div className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Board Name"
                defaultValue={board?.name}
                className="w-full p-2 border rounded"
                required
              />

              <Select name="type" defaultValue={board?.type || ""}>
                <SelectItem value="" disabled>
                  Choose board type...
                </SelectItem>
                {Object.values(BoardType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replace("_", " ")}
                  </SelectItem>
                ))}
              </Select>

              <input
                type="number"
                name="length"
                placeholder="Length (inches)"
                defaultValue={board?.length}
                className="w-full p-2 border rounded"
                required
                min={36}
                max={120}
              />

              <Select name="finSetup" defaultValue={board?.finSetup || ""}>
                <SelectItem value="" disabled>
                  Choose fin setup...
                </SelectItem>
                {Object.values(FinType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replace("_", " ")}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </div>

          {/* Rental Options */}
          <div className="step">
            <h4 className="text-[12px] font-semibold mb-2 font-primary">
              2. Rental Options
            </h4>
            <div className="space-y-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isRental}
                  onChange={(e) => setIsRental(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="font-primary">
                  Available for Rent (R1000/2 weeks)
                </span>
              </label>

              {isRental && (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Search beaches..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 border rounded"
                  />

                  <div className="max-h-60 overflow-y-auto border rounded">
                    {filteredBeaches.map((beach) => (
                      <label
                        key={beach.id}
                        className="flex items-center p-2 hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={selectedBeaches.includes(beach.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedBeaches([
                                ...selectedBeaches,
                                beach.id,
                              ]);
                            } else {
                              setSelectedBeaches(
                                selectedBeaches.filter((id) => id !== beach.id)
                              );
                            }
                          }}
                          className="mr-2 rounded border-gray-300"
                        />
                        <div>
                          <div className="font-medium font-primary">
                            {beach.name}
                          </div>
                          <div className="text-sm text-gray-500 font-primary">
                            {beach.region}, {beach.country}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Image Upload */}
          <div className="step">
            <h4 className="text-[12px] font-semibold mb-2 font-primary">
              3. Add Images
            </h4>
            <BoardImageUpload
              onUpload={(urls) =>
                setBoardData((prev) => ({ ...prev, images: urls }))
              }
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[var(--color-tertiary)] text-white font-primary"
          >
            {isSubmitting
              ? "Saving..."
              : isEditing
                ? "Save Changes"
                : "Create Board"}
          </Button>
        </form>
      </div>
    </div>
  );
}

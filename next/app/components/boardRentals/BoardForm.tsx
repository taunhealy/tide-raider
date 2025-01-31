"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Board, BoardType, FinType } from "@prisma/client";
import { cn } from "@/app/lib/utils";

interface BoardFormProps {
  userEmail: string;
  isOpen: boolean;
  onClose: () => void;
  editBoard?: Board;
}

export function BoardForm({ userEmail, isOpen, onClose, editBoard }: BoardFormProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: editBoard?.name || "",
    type: editBoard?.type || BoardType.SHORTBOARD,
    length: editBoard?.length || "",
    finSetup: editBoard?.finSetup || FinType.THRUSTER,
    rentPrice: editBoard?.rentPrice?.toString() || "",
  });

  const createBoard = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch("/api/boards", {
        method: editBoard ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          id: editBoard?.id,
          isForRent: true,
          rentPrice: parseFloat(data.rentPrice),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save board");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards"] });
      onClose();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createBoard.mutateAsync(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full m-4 p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
        >
          <X className="h-6 w-6" />
        </button>

        <h2 className="text-xl font-semibold mb-4">
          {editBoard ? "Edit Board" : "List a Board"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Board Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full p-2 border rounded-lg"
              required
              placeholder="e.g., Summer Longboard"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Board Type</label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  type: e.target.value as BoardType,
                }))
              }
              className="w-full p-2 border rounded-lg"
              required
            >
              {Object.values(BoardType).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Length</label>
            <input
              type="text"
              value={formData.length}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, length: e.target.value }))
              }
              className="w-full p-2 border rounded-lg"
              required
              placeholder="e.g., 6'2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Fin Setup</label>
            <select
              value={formData.finSetup}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  finSetup: e.target.value as FinType,
                }))
              }
              className="w-full p-2 border rounded-lg"
              required
            >
              {Object.values(FinType).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Rental Price per Day ($)
            </label>
            <input
              type="number"
              value={formData.rentPrice}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, rentPrice: e.target.value }))
              }
              className="w-full p-2 border rounded-lg"
              required
              min="0"
              step="0.01"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-[var(--color-tertiary)] text-white rounded-lg hover:bg-[var(--color-tertiary)]"
            disabled={createBoard.isPending}
          >
            {createBoard.isPending
              ? "Saving..."
              : editBoard
              ? "Save Changes"
              : "List Board"}
          </button>
        </form>
      </div>
    </div>
  );
}
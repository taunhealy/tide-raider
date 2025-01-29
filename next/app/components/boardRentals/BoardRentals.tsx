"use client";

import React, { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/app/lib/utils";
import { BoardTable } from "./BoardTable";
import { BoardFilter } from "./BoardFilter";
import { BoardForm } from "./BoardForm";
import type { Board } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

interface BoardWithUser extends Board {
  user: {
    name: string | null;
    email: string;
  };
}

interface BoardRentalsProps {
  initialBoards: BoardWithUser[];
}

export default function BoardRentals({ initialBoards }: BoardRentalsProps) {
  const { data: session, status } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"boards" | "new">("boards");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filteredBoards, setFilteredBoards] =
    useState<BoardWithUser[]>(initialBoards);

  const { data: boards = [], isLoading } = useQuery({
    queryKey: ["boards"],
    queryFn: async () => {
      const response = await fetch("/api/boards");
      if (!response.ok) throw new Error("Failed to fetch boards");
      return response.json();
    },
    initialData: initialBoards,
  });

  useEffect(() => {
    if (boards && Array.isArray(boards)) {
      setFilteredBoards(boards);
    }
  }, [boards]);

  const handleFilterChange = (filters: any) => {
    let filtered = [...boards];

    if (filters.type) {
      filtered = filtered.filter((board) => board.type === filters.type);
    }

    if (filters.maxPrice) {
      filtered = filtered.filter(
        (board) => board.rentPrice && board.rentPrice <= filters.maxPrice
      );
    }

    setFilteredBoards(filtered);
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  if (status === "loading") return null;

  if (!session) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-secondary)] flex flex-col items-center justify-center p-9">
        <h2 className="text-center text-lg font-semibold mb-4">
          Sign in to view and list board rentals
        </h2>
        <Link
          href="/auth/signin"
          className="flex items-center gap-3 px-6 py-3 bg-white text-gray-800 rounded-lg 
                   shadow-sm hover:shadow-md transition-all"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)] p-9">
      <div className="max-w-[1600px] mx-auto">
        {/* Tabs */}
        <div className="mb-12">
          <div className="flex items-center justify-start overflow-x-auto no-scrollbar border-b border-gray-200">
            <button
              onClick={() => setActiveTab("boards")}
              className={`px-6 py-4 font-medium text-sm transition-colors duration-200 ${
                activeTab === "boards"
                  ? "text-gray-900"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="whitespace-nowrap">Board Rentals</span>
            </button>
            <button
              onClick={handleOpenModal}
              className={`px-6 py-4 font-medium text-sm transition-colors duration-200 ${
                activeTab === "new"
                  ? "text-gray-900"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="whitespace-nowrap">List A Board</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm p-9">
          <div className="w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className={cn("text-[21px] font-semibold")}>
                Available Boards
              </h2>
              <button
                onClick={() => setIsFilterOpen(true)}
                className="px-4 py-2 text-sm font-medium bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Filter Boards
              </button>
            </div>
            {isLoading ? (
              <div>Loading...</div>
            ) : filteredBoards.length > 0 ? (
              <BoardTable boards={filteredBoards} />
            ) : (
              <div>No boards available</div>
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar Filter */}
      <BoardFilter
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onFilterChange={handleFilterChange}
      />

      {/* Modal for Board Listing Form */}
      <BoardForm
        userEmail={session.user?.email || ""}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}

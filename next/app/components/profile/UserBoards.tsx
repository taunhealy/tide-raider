"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { CloudflareImage } from "@/app/components/CloudflareImage";
import RippleLoader from "@/app/components/ui/RippleLoader";
import { Button } from "@/app/components/ui/Button";
import { useState } from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/app/components/ui/Tabs";

interface Board {
  id: string;
  name: string;
  type: string;
  length: number;
  finSetup: string;
  thumbnail: string;
  isForRent: boolean;
  rentPrice: number | null;
  isForSale: boolean;
  salePrice: number | null;
  isRented?: boolean;
  isSold?: boolean;
}

interface UserBoardsProps {
  userId: string;
  isOwnProfile: boolean;
}

type BoardFilter = "all" | "for-rent" | "rented" | "for-sale" | "sold";

export default function UserBoards({ userId, isOwnProfile }: UserBoardsProps) {
  const [filter, setFilter] = useState<BoardFilter>("all");

  const {
    data: boards,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["userBoards", userId],
    queryFn: async () => {
      const res = await fetch(`/api/user/${userId}/boards`);
      if (!res.ok) throw new Error("Failed to fetch boards");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <RippleLoader isLoading={true} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 font-primary">
        <p>Failed to load boards. Please try again later.</p>
      </div>
    );
  }

  if (!boards || boards.length === 0) {
    return (
      <div className="text-center py-10 font-primary">
        {isOwnProfile ? (
          <div>
            <p className="mb-4">You haven't added any boards yet.</p>
            <Link href="/boards/new">
              <Button>Add Your First Board</Button>
            </Link>
          </div>
        ) : (
          <p>This user hasn't added any boards yet.</p>
        )}
      </div>
    );
  }

  // Filter boards based on the selected filter
  const filteredBoards = boards.filter((board: Board) => {
    switch (filter) {
      case "for-rent":
        return board.isForRent && !board.isRented;
      case "rented":
        return board.isForRent && board.isRented;
      case "for-sale":
        return board.isForSale && !board.isSold;
      case "sold":
        return board.isForSale && board.isSold;
      default:
        return true;
    }
  });

  const handleTabChange = (value: string) => {
    setFilter(value as BoardFilter);
  };

  return (
    <div className="font-primary">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          {isOwnProfile ? "Your Boards" : "User's Boards"}
        </h2>
        {isOwnProfile && (
          <Link href="/boards/new">
            <Button>Add New Board</Button>
          </Link>
        )}
      </div>

      <Tabs defaultValue="all" className="mb-6" onValueChange={handleTabChange}>
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="for-rent">For Rent</TabsTrigger>
          <TabsTrigger value="rented">Rented</TabsTrigger>
          <TabsTrigger value="for-sale">For Sale</TabsTrigger>
          <TabsTrigger value="sold">Purchased</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <BoardsGrid boards={filteredBoards} />
        </TabsContent>
        <TabsContent value="for-rent">
          <BoardsGrid boards={filteredBoards} />
        </TabsContent>
        <TabsContent value="rented">
          <BoardsGrid boards={filteredBoards} />
        </TabsContent>
        <TabsContent value="for-sale">
          <BoardsGrid boards={filteredBoards} />
        </TabsContent>
        <TabsContent value="sold">
          <BoardsGrid boards={filteredBoards} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Extracted BoardsGrid component for reuse across tab contents
function BoardsGrid({ boards }: { boards: Board[] }) {
  if (boards.length === 0) {
    return (
      <div className="text-center py-10 font-primary">
        <p>No boards match the selected filter.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {boards.map((board: Board) => (
        <Link href={`/boards/${board.id}`} key={board.id}>
          <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative h-48 w-full">
              {board.thumbnail ? (
                <CloudflareImage
                  id={board.thumbnail}
                  alt={board.name}
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 font-primary">No image</span>
                </div>
              )}
              <div className="absolute top-2 right-2 flex flex-col gap-1">
                {board.isForRent && (
                  <div
                    className={`px-2 py-1 rounded-md text-sm text-white ${board.isRented ? "bg-orange-500" : "bg-blue-500"}`}
                  >
                    {board.isRented ? "Rented" : "For Rent"}
                  </div>
                )}
                {board.isForSale && (
                  <div
                    className={`px-2 py-1 rounded-md text-sm text-white ${board.isSold ? "bg-purple-500" : "bg-green-500"}`}
                  >
                    {board.isSold ? "Purchased" : "For Sale"}
                  </div>
                )}
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-1">{board.name}</h3>
              <p className="text-sm text-gray-600 mb-2">
                {board.type.replace("_", " ")} • {board.length}" •{" "}
                {board.finSetup.replace("_", " ")}
              </p>
              <div className="flex flex-col gap-1">
                {board.isForRent && board.rentPrice && (
                  <p className="text-blue-600 font-medium">
                    R{board.rentPrice} for 2 weeks
                  </p>
                )}
                {board.isForSale && board.salePrice && (
                  <p className="text-green-600 font-medium">
                    R{board.salePrice}
                  </p>
                )}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

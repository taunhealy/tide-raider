import Image from "next/image";
import Link from "next/link";
import { Board } from "@prisma/client";

interface BoardCardProps {
  board: Board & {
    user?: {
      name: string;
      image?: string | null;
    };
    availableBeaches?: {
      beach: {
        name: string;
        region: {
          name: string;
        };
      };
    }[];
  };
}

export function BoardCard({ board }: BoardCardProps) {
  return (
    <Link href={`/boards/${board.id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
        {/* Board Image */}
        <div className="relative h-48 w-full">
          {board.thumbnail ? (
            <Image
              src={board.thumbnail}
              alt={board.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No image available</span>
            </div>
          )}
        </div>

        {/* Board Details */}
        <div className="p-4 flex-grow">
          <h3 className="text-lg font-semibold mb-1 font-primary">
            {board.name}
          </h3>
          <p className="text-sm text-gray-600 mb-2 font-primary">
            {board.length}ft {board.type.toLowerCase().replace("_", " ")}
          </p>

          {/* Location */}
          {board.availableBeaches && board.availableBeaches.length > 0 && (
            <p className="text-sm text-gray-500 font-primary">
              <span className="font-medium">Location:</span>{" "}
              {board.availableBeaches[0].beach.name},{" "}
              {board.availableBeaches[0].beach.region.name}
            </p>
          )}

          {/* Owner */}
          {board.user && (
            <div className="flex items-center mt-3">
              {board.user.image ? (
                <Image
                  src={board.user.image}
                  alt={board.user.name}
                  width={24}
                  height={24}
                  className="rounded-full mr-2"
                />
              ) : (
                <div className="w-6 h-6 bg-gray-200 rounded-full mr-2"></div>
              )}
              <span className="text-sm text-gray-600 font-primary">
                {board.user.name}
              </span>
            </div>
          )}
        </div>

        {/* Price */}
        {board.isForRent && board.rentPrice && (
          <div className="bg-blue-50 p-3 border-t border-blue-100">
            <p className="text-blue-600 font-semibold font-primary">
              R{board.rentPrice}/day
            </p>
          </div>
        )}
      </div>
    </Link>
  );
}

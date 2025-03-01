import Image from "next/image";
import Link from "next/link";
import { CloudflareImage } from "@/app/components/CloudflareImage";
import { BoardWithRelations } from "@/app/types/boards";

interface BoardCardProps {
  board: BoardWithRelations;
}

export function BoardCard({ board }: BoardCardProps) {
  console.log("Board data in card:", board);

  // Check if board has all required properties
  if (!board || !board.id || !board.name) {
    console.error("Invalid board data:", board);
    return <div>Invalid board data</div>;
  }

  return (
    <Link href={`/boards/${board.id}`}>
      <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col border border-[var(--color-border-light)]">
        {/* Board Image */}
        <div className="relative h-48 w-full">
          {board.thumbnail ? (
            <div className="w-full h-full relative">
              <CloudflareImage
                id={board.thumbnail}
                alt={board.name}
                className="object-cover"
              />
              <div className="absolute top-2 right-2 flex flex-col gap-1">
                {board.isForRent && (
                  <div className="bg-blue-500 text-white px-2 py-1 rounded-md text-small">
                    For Rent
                  </div>
                )}
                {board.isForSale && (
                  <div className="bg-green-500 text-white px-2 py-1 rounded-md text-small">
                    For Sale
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full h-full bg-[var(--color-bg-secondary)] flex items-center justify-center">
              <span className="text-[var(--color-text-tertiary)] font-primary">
                No image available
              </span>
            </div>
          )}
        </div>

        {/* Board Details */}
        <div className="p-4 flex-grow">
          <h3 className="heading-5 mb-1">{board.name}</h3>
          <p className="text-small text-[var(--color-text-secondary)] mb-2">
            {board.length}ft {board.type.toLowerCase().replace("_", " ")}
          </p>

          {/* Location */}
          {board.availableBeaches && board.availableBeaches.length > 0 && (
            <p className="text-small text-[var(--color-text-tertiary)]">
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
                <div className="w-6 h-6 bg-[var(--color-bg-secondary)] rounded-full mr-2"></div>
              )}
              <span className="text-small text-[var(--color-text-secondary)]">
                {board.user.name}
              </span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="bg-[var(--color-bg-secondary)] p-3 border-t border-[var(--color-border-light)]">
          {board.isForRent && board.rentPrice && (
            <p className="text-blue-600 font-semibold font-primary">
              R{board.rentPrice}/day
            </p>
          )}
          {board.isForSale && board.salePrice && (
            <p className="text-green-600 font-semibold font-primary">
              R{board.salePrice}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

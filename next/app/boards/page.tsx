import BoardRentals from "@/app/components/boardRentals/BoardRentals";
import { getBoards } from "@/app/lib/data";

export default async function BoardsPage() {
  const boards = await getBoards();

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)]">
      <BoardRentals initialBoards={boards} />
    </div>
  );
}

import { Board, User } from "@prisma/client";
import { format } from "date-fns";
import { Edit, Trash } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BoardForm } from "./BoardForm";

interface BoardWithUser extends Board {
  user: {
    name: string | null;
    email: string;
  };
}

interface BoardTableProps {
  boards: BoardWithUser[];
}

export function BoardTable({ boards }: BoardTableProps) {
  const { data: session } = useSession();
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const queryClient = useQueryClient();

  const deleteBoard = useMutation({
    mutationFn: async (boardId: string) => {
      const response = await fetch(`/api/boards/${boardId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete board");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards"] });
    },
  });

  const handleDelete = async (boardId: string) => {
    if (confirm("Are you sure you want to delete this board?")) {
      await deleteBoard.mutateAsync(boardId);
    }
  };

  return (
    <div className="w-full">
      {/* Mobile View - Cards */}
      <div className="md:hidden space-y-4">
        {boards.map((board) => (
          <div
            key={board.id}
            className="bg-white rounded-lg border border-gray-200 shadow p-4 space-y-3"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{board.name}</h3>
                <p className="text-sm text-gray-500">
                  {board.type} - {board.length}
                </p>
              </div>
              <p className="font-medium text-green-600">
                ${board.rentPrice}/day
              </p>
            </div>

            <div className="text-sm">
              <p className="text-gray-600">
                Owner: {board.user.name || board.user.email}
              </p>
              <p className="text-gray-600">
                Fin Setup: {board.finSetup}
              </p>
            </div>

            {session?.user?.email === board.user.email && (
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingBoard(board)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(board.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop View - Table */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200 shadow">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Board Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Length
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Fin Setup
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Price/Day
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Owner
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {boards.map((board) => (
              <tr key={board.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">{board.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{board.type}</td>
                <td className="px-6 py-4 whitespace-nowrap">{board.length}</td>
                <td className="px-6 py-4 whitespace-nowrap">{board.finSetup}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  ${board.rentPrice}/day
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {board.user.name || board.user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {session?.user?.email === board.user.email && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingBoard(board)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(board.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingBoard && (
        <BoardForm
          isOpen={true}
          onClose={() => setEditingBoard(null)}
          userEmail={session?.user?.email || ""}
          editBoard={editingBoard}
        />
      )}
    </div>
  );
}
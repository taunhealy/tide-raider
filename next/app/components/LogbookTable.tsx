import {
  LogEntry,
  LogbookTableColumn,
  DEFAULT_COLUMNS,
} from "../types/logbook";
import { format } from "date-fns";
import { Star } from "lucide-react";
import { cn } from "@/app/lib/utils";
import {
  getWindEmoji,
  getSwellEmoji,
  getDirectionEmoji,
} from "@/app/lib/forecastUtils";

interface LogbookTableProps {
  entries: LogEntry[];
  columns?: LogbookTableColumn[];
}

export function LogbookTable({
  entries = [],
  columns = DEFAULT_COLUMNS,
}: LogbookTableProps) {
  const safeEntries = Array.isArray(entries) ? entries : [];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {safeEntries.map((entry) => (
            <tr key={entry.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                {format(new Date(entry.date), "MMM d, yyyy")}
              </td>
              <td className="px-6 py-4">{entry.beachName}</td>
              <td className="px-6 py-4">{entry.surferName}</td>
              <td className="px-6 py-4">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-4 h-4",
                        i < entry.surferRating
                          ? "fill-yellow-400"
                          : "fill-gray-200"
                      )}
                    />
                  ))}
                </div>
              </td>
              <td className="px-6 py-4">{entry.comments}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

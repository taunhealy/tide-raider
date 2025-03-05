import { useState } from "react";
import { UserRole } from "@prisma/client";
import { ROLE_OPTIONS } from "@/lib/users/constants";
import { Button } from "@/app/components/ui/Button";

interface RoleManagerProps {
  initialRoles: UserRole[];
  onUpdate: (roles: UserRole[]) => Promise<void>;
}

export function RoleManager({ initialRoles, onUpdate }: RoleManagerProps) {
  const [roles, setRoles] = useState<UserRole[]>(initialRoles);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await onUpdate(roles);
    } catch (error) {
      console.error("Failed to update roles:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-primary text-lg font-medium">Manage Roles</h3>

      <div className="grid grid-cols-2 gap-2">
        {ROLE_OPTIONS.map((role) => (
          <label
            key={role.value}
            className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 cursor-pointer"
          >
            <input
              type="checkbox"
              value={role.value}
              checked={roles.includes(role.value as UserRole)}
              onChange={(e) => {
                if (e.target.checked) {
                  setRoles([...roles, role.value as UserRole]);
                } else {
                  setRoles(roles.filter((r) => r !== role.value));
                }
              }}
              className="rounded border-gray-300"
            />
            <span className="font-primary">{role.label}</span>
          </label>
        ))}
      </div>

      <Button
        onClick={handleUpdate}
        disabled={isUpdating}
        isLoading={isUpdating}
        variant="outline"
      >
        Update Roles
      </Button>
    </div>
  );
}

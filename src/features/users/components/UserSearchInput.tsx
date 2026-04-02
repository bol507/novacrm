import { useState, useEffect } from "react";
import { User, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSearchUsers } from "@/features/users/hooks/use-search-users";

export interface UserSearchInputProps {
  value?: number | null;
  onChange?: (userId: number | null) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  initialData?: { id?: number | null; name?: string };
}

export const UserSearchInput = ({
  value,
  onChange,
  placeholder = "Search user by name...",
  label = "Assigned to",
  required = false,
  disabled = false,
  initialData,
}: UserSearchInputProps) => {
  const [searchTerm, setUserSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(
    initialData?.id ?? value ?? null
  );
  const [selectedUserName, setSelectedUserName] = useState(
    initialData?.name ?? ""
  );

  const { data: userResults, isLoading } = useSearchUsers(searchTerm);

  useEffect(() => {
    if (value !== selectedUserId) {
      setSelectedUserId(value ?? null);
    }
  }, [value]);

  const handleSelectUser = (user: any) => {
    const userId = user.id || user.user_id;
    if (!userId) return;

    const displayName =
      `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
      user.user_name;

    setSelectedUserId(userId);
    setSelectedUserName(displayName);
    setUserSearchTerm("");
    onChange?.(userId);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUserSearchTerm(val);
    if (val === "") {
      setSelectedUserId(null);
      onChange?.(null);
    }
  };

  const isValid = selectedUserId !== null;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium flex items-center gap-2">
        <User className="w-4 h-4" />
        {label}
        {required && <span className="text-destructive">*</span>}
      </label>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          className={`pl-10 ${
            isValid && required
              ? "border-green-500 focus-visible:ring-green-500"
              : ""
          }`}
          value={selectedUserName || searchTerm}
          onChange={handleInputChange}
          disabled={disabled}
        />

        {(userResults?.length > 0 || isLoading) && (
          <div className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-popover rounded-md border border-border z-10 shadow-md">
            {isLoading ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                Searching...
              </div>
            ) : (
              userResults?.map((user: any) => {
                const userId = user.id || user.user_id;
                const displayName =
                  `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
                  user.user_name;
                return (
                  <button
                    key={userId}
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center justify-between"
                    onClick={() => handleSelectUser(user)}
                  >
                    <span>{displayName}</span>
                    <span className="text-xs text-muted-foreground">
                      @{user.user_name}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {required && !isValid && (
        <p className="text-sm text-destructive">Please select a user</p>
      )}
    </div>
  );
};
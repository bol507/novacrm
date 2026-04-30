"use client"

import { useEffect, useState, useRef } from "react"
import { useDebounce } from "@/shared/hooks/use-debounce"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader2, Search, X, Users } from "lucide-react"
import { cn } from "@/shared/lib/utils"
import { useUsers } from "@/features/users/hooks/use-users"
import { useUser } from "@/features/users/hooks/use-user"

interface UserSearchProps {
  value: number | null | undefined
  onChange: (value: number | null) => void
  label?: string
  placeholder?: string
  required?: boolean
  showAllOption?: boolean
}

/**
 * User search component with autocomplete dropdown.
 *
 * Features:
 * - Debounced search (300ms) to prevent excessive API calls
 * - Displays selected user information when a user is chosen
 * - Optional "All Users" option for team-wide visibility
 * - Keyboard navigation (Escape to close dropdown)
 * - Loading states for search and selected user data
 * - Accessible with ARIA labels and keyboard interactions
 *
 * @component
 * @param props - Component props
 * @param props.value - Currently selected user ID or null for none
 * @param props.onChange - Callback invoked when user selection changes
 * @param props.label - Label text for the input field (optional)
 * @param props.placeholder - Placeholder text for the search input (default: "Search user...")
 * @param props.required - Whether the field is required (adds asterisk to label) (default: false)
 * @param props.showAllOption - Whether to show the "All Users" option (default: true)
 * @returns The rendered user search component
 *
 * @example
 * // Basic usage
 * <UserSearch
 *   value={assignedUserId}
 *   onChange={setAssignedUserId}
 *   label="Assign to"
 * />
 *
 * @example
 * // Without "All Users" option
 * <UserSearch
 *   value={userId}
 *   onChange={handleUserChange}
 *   showAllOption={false}
 * />
 *
 * @example
 * // Required field
 * <UserSearch
 *   value={ownerId}
 *   onChange={setOwnerId}
 *   label="Owner"
 *   required={true}
 * />
 */
export function UserSearch({
  value,
  onChange,
  label,
  placeholder = "Search user...",
  required = false,
  showAllOption = true
}: UserSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const { data: selectedUser, isLoading: loadingSelectedUser } = useUser(value)

  const { data: usersData, isLoading: loadingUsers, error } = useUsers({
    page: 1,
    perPage: 10,
    search: debouncedSearchTerm,
    enabled: debouncedSearchTerm.length >= 3,
  })
  const users = usersData?.data || []

  useEffect(() => {
    if (value === 2 && showAllOption) {
      setSearchTerm("All Users")
    } else if (selectedUser && selectedUser.first_name && selectedUser.last_name) {
      setSearchTerm(`${selectedUser.first_name} ${selectedUser.last_name}`)
    } else if (!value || value === 0) {
      setSearchTerm("")
    }
  }, [selectedUser, value, showAllOption])

  useEffect(() => {
    if (debouncedSearchTerm.length >= 2 || (showAllOption && debouncedSearchTerm.toLowerCase().includes('all'))) {
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
  }, [debouncedSearchTerm, showAllOption])

  const handleSelectUser = (userId: number | null) => {
    onChange(userId)
    setIsOpen(false)
    if (inputRef.current) {
      inputRef.current.blur()
    }
  }

  const handleClear = () => {
    onChange(null)
    setSearchTerm("")
    setIsOpen(false)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <div className="relative space-y-2">
      {label && (
        <Label htmlFor="user-search" className={required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
          {label}
        </Label>
      )}

      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground">
          <Search className="h-4 w-4" />
        </div>

        <Input
          ref={inputRef}
          id="user-search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="pl-9"
          disabled={loadingSelectedUser}
        />

        {(value && value > 0) && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
            onClick={handleClear}
            disabled={loadingSelectedUser}
          >
            {loadingSelectedUser ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {isOpen && (
        <div
          className={cn(
            "absolute z-50 w-full mt-1 rounded-md border border-border bg-popover text-popover-foreground shadow-lg",
            "max-h-60 overflow-y-auto"
          )}
          onMouseDown={(e) => e.preventDefault()}
        >
          {loadingUsers ? (
            <div className="p-4 flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span>Searching users...</span>
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">
              Error searching users: {(error as any).message}
            </div>
          ) : (
            <div className="space-y-1">
              {showAllOption && (
                <div
                  className={cn(
                    "p-3 hover:bg-accent cursor-pointer border-b border-border",
                    value === 2 && "bg-accent"
                  )}
                  onClick={() => handleSelectUser(2)}
                >
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <div className="font-medium">All Users</div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    The project will be visible to the entire team
                  </div>
                </div>
              )}

              {users.length > 0 ? (
                users.map((user) => (
                  <div
                    key={user.id}
                    className={cn(
                      "p-3 hover:bg-accent cursor-pointer border-b border-border last:border-b-0",
                      value === user.id && "bg-accent"
                    )}
                    onClick={() => handleSelectUser(user.id)}
                  >
                    <div className="font-medium">{user.first_name} {user.last_name}</div>

                    {/* ✅ Actualizado: prioriza flag de sistema sobre rol jerárquico */}
                    <div className="text-sm text-muted-foreground truncate">
                      {user.email || "No email"} • {user.is_admin ? "Admin" : (user.rolename || "No role")}
                    </div>
                  </div>
                ))
              ) : debouncedSearchTerm.length >= 2 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No users found
                </div>
              ) : null}
            </div>
          )}
        </div>
      )}

      {value === 2 && showAllOption ? (
        <div className="mt-2 p-2 bg-muted rounded-md border border-border text-sm">
          <div className="font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            All Users
          </div>
          <div className="text-muted-foreground">
            The project will be visible to the entire team
          </div>
        </div>
      ) : selectedUser && value && value > 0 ? (
        <div className="mt-2 p-2 bg-muted rounded-md border border-border text-sm">
          <div className="font-medium">{selectedUser.first_name} {selectedUser.last_name}</div>
          <div className="text-muted-foreground">
            {selectedUser.email} • {selectedUser.rolename}
          </div>
        </div>
      ) : null}
    </div>
  )
}
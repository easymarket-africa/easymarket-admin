"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAdminUsers } from "@/hooks/use-admin-users";
import { useDebounce } from "@/hooks/use-debounce";
import { AdminUserListItem } from "@/types/api";

type MinimalUser = Pick<AdminUserListItem, "id" | "fullName" | "email">;

interface UserSingleSelectProps {
  selectedUser: MinimalUser | null;
  onChange: (user: AdminUserListItem | null) => void;
  placeholder?: string;
}

/**
 * Single-selection variant of UserMultiSelect, built on the same
 * GET /admin/users?search= plumbing. Used to assign a coupon to one
 * specific customer by email/name lookup instead of a manual SQL query.
 */
export function UserSingleSelect({
  selectedUser,
  onChange,
  placeholder = "Search by name or email...",
}: UserSingleSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data, isLoading } = useAdminUsers(
    { search: debouncedSearch, limit: 20 },
    { enabled: open },
  );

  const selectUser = (user: AdminUserListItem) => {
    onChange(user);
    setOpen(false);
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
          >
            {selectedUser ? selectedUser.fullName : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Type a name or email..."
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandList>
              <CommandEmpty>
                {isLoading ? "Searching..." : "No customers found."}
              </CommandEmpty>
              <CommandGroup>
                {(data?.users ?? []).map((user) => (
                  <CommandItem
                    key={user.id}
                    value={String(user.id)}
                    onSelect={() => selectUser(user)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedUser?.id === user.id ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{user.fullName}</span>
                      <span className="text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedUser && (
        <div className="flex flex-wrap gap-1">
          <Badge variant="secondary" className="gap-1">
            {selectedUser.fullName}
            <button
              type="button"
              onClick={() => onChange(null)}
              className="ml-1 rounded-full outline-none hover:bg-muted"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        </div>
      )}
    </div>
  );
}

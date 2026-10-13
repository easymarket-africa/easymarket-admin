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

interface UserMultiSelectProps {
  selectedUsers: AdminUserListItem[];
  onChange: (users: AdminUserListItem[]) => void;
  placeholder?: string;
}

/**
 * Searchable, debounced multi-select of customers by name/email.
 * Built on the existing GET /admin/users?search= endpoint — no new backend
 * work needed. Reused by the campaign audience picker; the coupon
 * assignment picker uses the same search plumbing in single-select mode.
 */
export function UserMultiSelect({
  selectedUsers,
  onChange,
  placeholder = "Search by name or email...",
}: UserMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data, isLoading } = useAdminUsers(
    { search: debouncedSearch, limit: 20 },
    { enabled: open },
  );

  const selectedIds = new Set(selectedUsers.map((u) => u.id));

  const toggleUser = (user: AdminUserListItem) => {
    if (selectedIds.has(user.id)) {
      onChange(selectedUsers.filter((u) => u.id !== user.id));
    } else {
      onChange([...selectedUsers, user]);
    }
  };

  const removeUser = (id: number) => {
    onChange(selectedUsers.filter((u) => u.id !== id));
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
            {selectedUsers.length > 0
              ? `${selectedUsers.length} customer${selectedUsers.length === 1 ? "" : "s"} selected`
              : placeholder}
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
                    onSelect={() => toggleUser(user)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedIds.has(user.id) ? "opacity-100" : "opacity-0",
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

      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedUsers.map((user) => (
            <Badge key={user.id} variant="secondary" className="gap-1">
              {user.fullName}
              <button
                type="button"
                onClick={() => removeUser(user.id)}
                className="ml-1 rounded-full outline-none hover:bg-muted"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

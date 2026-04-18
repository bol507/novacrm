// src/features/vendors/components/VendorSearch.tsx

import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Store, Loader2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useSearchVendors, type VendorSearchResult } from "../hooks/use-search-vendors";

export interface VendorSearchProps {
  value?: number | null;
  onChange: (vendorId: number | null, vendorName?: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const VendorSearch = ({
  value,
  onChange,
  placeholder = "Search vendor...",
  disabled = false,
  className,
}: VendorSearchProps) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVendor, setSelectedVendor] = useState<VendorSearchResult | null>(null);
  
  const { data: vendors, isLoading } = useSearchVendors(searchTerm);
  
  useEffect(() => {
    if (value && vendors && vendors.length > 0) {
      const found = vendors.find((v) => v.id === value);
      if (found) setSelectedVendor(found);
    } else if (!value) {
      setSelectedVendor(null);
    }
  }, [value, vendors]);

  const handleSelect = (vendor: VendorSearchResult) => {
    setSelectedVendor(vendor);
    onChange(vendor.id, vendor.vendorname);
    setOpen(false);
    setSearchTerm(""); // Limpiar búsqueda tras seleccionar
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedVendor(null);
    onChange(null);
    setSearchTerm("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-normal",
            !selectedVendor && "text-muted-foreground",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
          disabled={disabled}
        >
          <span className="truncate">
            {selectedVendor ? selectedVendor.vendorname : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={placeholder}
            value={searchTerm}
            onValueChange={setSearchTerm} 
            className="h-9"
          />
          <CommandList>
            {isLoading && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Buscando...</span>
              </div>
            )}

            {!isLoading && (!vendors || vendors.length === 0) && searchTerm.length >= 2 && (
              <CommandEmpty>
                <div className="flex flex-col items-center py-6 text-center">
                  <Store className="h-8 w-8 text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">No se encontraron proveedores</p>
                </div>
              </CommandEmpty>
            )}

            {!isLoading && searchTerm.length > 0 && searchTerm.length < 2 && (
              <CommandEmpty>
                <p className="text-sm text-muted-foreground text-center py-4">
                  Escribe al menos 2 caracteres
                </p>
              </CommandEmpty>
            )}

            <CommandGroup>
              {vendors?.map((vendor) => (
                <CommandItem
                  key={vendor.id}
                  value={vendor.vendorname}
                  onSelect={() => handleSelect(vendor)}
                  className="flex flex-col items-start gap-1 py-3 px-4 cursor-pointer"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium text-sm">{vendor.vendorname}</span>
                    <Check
                      className={cn(
                        "h-4 w-4 shrink-0",
                        value === vendor.id ? "opacity-100 text-primary" : "opacity-0"
                      )}
                    />
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {vendor.category && (
                      <span className="bg-muted/50 px-2 py-0.5 rounded">{vendor.category}</span>
                    )}
                    {vendor.email && <span className="truncate max-w-[150px]">{vendor.email}</span>}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>

        {selectedVendor && (
          <div className="border-t p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-muted-foreground hover:text-destructive"
              onClick={handleClear}
            >
              Limpiar selección
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
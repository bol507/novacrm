import { useState, useEffect } from "react";
import { Building2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSearchClients } from "@/features/clients/hooks/use-search-clients";

export interface ClientSearchInputProps {
  value?: number | null;
  onChange?: (clientId: number | null) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  initialData?: { id?: number | null; name?: string };
}

export const ClientSearchInput = ({
  value,
  onChange,
  placeholder = "Search client by name...",
  label = "Related client",
  required = false,
  disabled = false,
  initialData,
}: ClientSearchInputProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<number | null>(
    initialData?.id ?? value ?? null
  );
  const [selectedClientName, setSelectedClientName] = useState(
    initialData?.name ?? ""
  );

  const { data: clientResults, isLoading } = useSearchClients(searchTerm);

  useEffect(() => {
    if (value !== selectedClientId) {
      setSelectedClientId(value ?? null);
    }
  }, [value]);

  const handleSelectClient = (client: any) => {
    const clientId = client.accountid || client.crmid || client.id;
    if (!clientId) return;

    setSelectedClientId(clientId);
    setSelectedClientName(client.accountname);
    setSearchTerm("");
    onChange?.(clientId);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (val === "") {
      setSelectedClientId(null);
      onChange?.(null);
    }
  };

  const isValid = selectedClientId !== null;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium flex items-center gap-2">
        <Building2 className="w-4 h-4" />
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
          value={selectedClientName || searchTerm}
          onChange={handleInputChange}
          disabled={disabled}
        />

        {(clientResults?.length > 0 || isLoading) && (
          <div className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-popover rounded-md border border-border z-10 shadow-md">
            {isLoading ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                Searching...
              </div>
            ) : (
              clientResults?.map((client: any) => {
                const clientId = client.accountid || client.crmid || client.id;
                return (
                  <button
                    key={clientId}
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center justify-between"
                    onClick={() => handleSelectClient(client)}
                  >
                    <span>{client.accountname}</span>
                    <span className="text-xs text-muted-foreground">
                      ID: {clientId}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {required && !isValid && (
        <p className="text-sm text-destructive">Please select a client</p>
      )}
    </div>
  );
};
"use client"

import { useEffect, useState, useRef } from "react"
import { useDebounce } from "@/shared/hooks/use-debounce"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader2, Search, X } from "lucide-react"
import { cn } from "@/shared/lib/utils"
import { useClients } from "@/features/clients/hooks/use-clients"
import { useClient } from "@/features/clients/hooks/use-client"
import type { Client } from "@/features/clients/types/client"

interface ClientSearchProps {
  value: number | null | undefined
  onChange: (value: number | null) => void
  label?: string
  placeholder?: string
  required?: boolean
}

export function ClientSearch({ 
  value, 
  onChange, 
  label, 
  placeholder = "Buscar cliente...",
  required = false 
}: ClientSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debouncedSearchTerm = useDebounce(searchTerm, 300)


  const { data: selectedClient, isLoading: loadingSelectedClient } = useClient(value)

 
  const { data: clientsData, isLoading: loadingClients, error } = useClients(1, 10, debouncedSearchTerm)
  const clients = clientsData?.data || []

  useEffect(() => {
    if (value && value > 0 && selectedClient?.accountname && !loadingSelectedClient) {
      setSearchTerm(selectedClient.accountname)
    } else if (!value || value === 0) {
      setSearchTerm("")
    }
  }, [selectedClient, value, loadingSelectedClient])


  useEffect(() => {
    if (debouncedSearchTerm.length >= 2) {
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
  }, [debouncedSearchTerm])


  const handleSelectClient = (client: Client) => {
    onChange(client.accountid)
    setSearchTerm(client.accountname)
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
        <Label htmlFor="client-search" className={required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
          {label}
        </Label>
      )}
      
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground">
          <Search className="h-4 w-4" />
        </div>
        
        <Input
          ref={inputRef}
          id="client-search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="pl-9"
          disabled={loadingSelectedClient}
        />
        
        {(value && value > 0) && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
            onClick={handleClear}
            disabled={loadingSelectedClient}
          >
            {loadingSelectedClient ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Sugerencias de búsqueda */}
      {isOpen && debouncedSearchTerm.length >= 2 && (
        <div 
          className={cn(
            "absolute z-50 w-full mt-1 rounded-md border border-border bg-popover text-popover-foreground shadow-lg",
            "max-h-60 overflow-y-auto"
          )}
          onMouseDown={(e) => e.preventDefault()} // ✅ Prevenir pérdida de foco
        >
          {loadingClients ? (
            <div className="p-4 flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span>Buscando clientes...</span>
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">
              Error al buscar clientes: {(error as any).message}
            </div>
          ) : clients.length > 0 ? (
            clients.map((client) => (
              <div
                key={client.accountid}
                className="p-3 hover:bg-accent cursor-pointer border-b border-border last:border-b-0"
                onClick={() => handleSelectClient(client)}
              >
                <div className="font-medium">{client.accountname}</div>
                <div className="text-sm text-muted-foreground">
                  ID: {client.accountid} • {client.phone || "Sin teléfono"}
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No se encontraron clientes
            </div>
          )}
        </div>
      )}
      
      {/* Cliente seleccionado (solo para información visual) */}
      {selectedClient && value && value > 0 && (
        <div className="mt-2 p-2 bg-muted rounded-md border border-border text-sm">
          <div className="font-medium">{selectedClient.accountname}</div>
          <div className="text-muted-foreground">
            ID: {selectedClient.accountid} • {selectedClient.phone || "Sin teléfono"}
          </div>
        </div>
      )}
    </div>
  )
}
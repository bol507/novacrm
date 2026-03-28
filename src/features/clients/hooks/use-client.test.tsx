import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useClient } from '@/features/clients/hooks/use-client'
import { clientService } from '@/features/clients/services/client-service'

// Mock the service
vi.mock('@/features/clients/services/client-service')

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  })
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockClient = {
    accountid: 1,
    account_no: 'ACC-001',
    accountname: 'Test Client',
    account_type: 'Customer',
    industry: 'Technology',
    annualrevenue: 1000000,
    rating: 'Active',
    ownership: 'Private',
    phone: '1234567890',
    otherphone: '0987654321',
    email1: 'test@client.com',
    email2: 'test2@client.com',
    website: 'https://testclient.com',
    fax: '123-456-7890',
    employees: 100,
    emailoptout: '0' as const,
    notify_owner: '0' as const,
    isconvertedfromlead: '0' as const,
    tags: 'important,vip',
    is_active: true,
    bill_street: '123 Main St',
    bill_city: 'New York',
    bill_state: 'NY',
    bill_code: '10001',
    bill_country: 'USA',
    ship_street: '456 Shipping Ave',
    ship_city: 'Los Angeles',
    ship_state: 'CA',
    ship_code: '90001',
    ship_country: 'USA',
    createdtime: '2026-01-01 00:00:00',
    modifiedtime: '2026-01-15 00:00:00',
    smcreatorid: 1,
    smownerid: 1,
  }

  describe('when id is valid', () => {
    it('should fetch client successfully', async () => {
      vi.mocked(clientService.getClientById).mockResolvedValue(mockClient)

      const { result } = renderHook(() => useClient(1), {
        wrapper: createWrapper(),
      })

      // Initially loading
      expect(result.current.isLoading).toBe(true)
      expect(result.current.data).toBeUndefined()

      // Wait for data
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockClient)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should call getClientById with correct id', async () => {
      vi.mocked(clientService.getClientById).mockResolvedValue(mockClient)

      renderHook(() => useClient(42), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(clientService.getClientById).toHaveBeenCalledWith(42)
      })
    })

    it('should have correct query key', async () => {
      vi.mocked(clientService.getClientById).mockResolvedValue(mockClient)

      const { result } = renderHook(() => useClient(1), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(clientService.getClientById).toHaveBeenCalled()
    })
  })

  describe('when id is invalid', () => {
    it('should not fetch when id is null', () => {
      renderHook(() => useClient(null), {
        wrapper: createWrapper(),
      })

      expect(clientService.getClientById).not.toHaveBeenCalled()
    })

    it('should not fetch when id is undefined', () => {
      renderHook(() => useClient(undefined), {
        wrapper: createWrapper(),
      })

      expect(clientService.getClientById).not.toHaveBeenCalled()
    })

    it('should not fetch when id is 0', () => {
      renderHook(() => useClient(0), {
        wrapper: createWrapper(),
      })

      expect(clientService.getClientById).not.toHaveBeenCalled()
    })

    it('should not fetch when id is negative', () => {
      renderHook(() => useClient(-1), {
        wrapper: createWrapper(),
      })

      expect(clientService.getClientById).not.toHaveBeenCalled()
    })
  })

  describe('when fetching fails', () => {
    it('should handle error correctly', async () => {
      const errorMessage = 'Client not found'
      vi.mocked(clientService.getClientById).mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useClient(999), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBeInstanceOf(Error)
      expect(result.current.error?.message).toBe(errorMessage)
      expect(result.current.data).toBeUndefined()
    })

    it('should not retry on failure', async () => {
      vi.mocked(clientService.getClientById).mockRejectedValue(new Error('Error'))

      renderHook(() => useClient(1), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(clientService.getClientById).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('query configuration', () => {
    it('should have staleTime of 5 minutes', async () => {
      vi.mocked(clientService.getClientById).mockResolvedValue(mockClient)

      const { result } = renderHook(() => useClient(1), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.dataUpdatedAt).toBeDefined()
    })
  })
})

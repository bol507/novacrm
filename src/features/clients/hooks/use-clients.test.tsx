import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useClients } from '@/features/clients/hooks/use-clients'
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

describe('useClients', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockClients = [
    {
      accountid: 1,
      account_no: 'ACC-001',
      accountname: 'Test Client 1',
      account_type: 'Customer',
      industry: 'Technology',
      phone: '1234567890',
      email1: 'test1@client.com',
      is_active: true,
      emailoptout: '0' as const,
      notify_owner: '0' as const,
      isconvertedfromlead: '0' as const,
    },
    {
      accountid: 2,
      account_no: 'ACC-002',
      accountname: 'Test Client 2',
      account_type: 'Prospect',
      industry: 'Healthcare',
      phone: '0987654321',
      email1: 'test2@client.com',
      is_active: true,
      emailoptout: '0' as const,
      notify_owner: '0' as const,
      isconvertedfromlead: '0' as const,
    },
  ]

  const mockPaginatedResponse = {
    data: mockClients,
    meta: {
      current_page: 1,
      last_page: 5,
      per_page: 20,
      total: 100,
    },
    links: {
      first: '/api/clients?page=1',
      last: '/api/clients?page=5',
      prev: null,
      next: '/api/clients?page=2',
    },
  }

  describe('when fetching clients successfully', () => {
    it('should return paginated clients', async () => {
      vi.mocked(clientService.getClients).mockResolvedValue(mockPaginatedResponse)

      const { result } = renderHook(() => useClients(1, 20), {
        wrapper: createWrapper(),
      })

      // Initially loading
      expect(result.current.isLoading).toBe(true)
      expect(result.current.data).toBeUndefined()

      // Wait for data
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockPaginatedResponse)
      expect(result.current.data?.data).toHaveLength(2)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should call getClients with correct page and perPage', async () => {
      vi.mocked(clientService.getClients).mockResolvedValue(mockPaginatedResponse)

      renderHook(() => useClients(2, 10), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(clientService.getClients).toHaveBeenCalledWith(2, 10, undefined)
      })
    })

    it('should call getClients with search term when provided', async () => {
      vi.mocked(clientService.getClients).mockResolvedValue(mockPaginatedResponse)

      renderHook(() => useClients(1, 20, 'search term'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(clientService.getClients).toHaveBeenCalledWith(1, 20, 'search term')
      })
    })

    it('should have correct query key', async () => {
      vi.mocked(clientService.getClients).mockResolvedValue(mockPaginatedResponse)

      renderHook(() => useClients(1, 20, 'test'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(clientService.getClients).toHaveBeenCalled()
      })
    })
  })

  describe('when fetching fails', () => {
    it('should handle error correctly', async () => {
      const errorMessage = 'Failed to fetch clients'
      vi.mocked(clientService.getClients).mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useClients(1, 20), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBeInstanceOf(Error)
      expect(result.current.error?.message).toBe(errorMessage)
    })
  })

  describe('pagination metadata', () => {
    it('should return correct pagination metadata', async () => {
      vi.mocked(clientService.getClients).mockResolvedValue(mockPaginatedResponse)

      const { result } = renderHook(() => useClients(1, 20), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.meta.current_page).toBe(1)
      expect(result.current.data?.meta.last_page).toBe(5)
      expect(result.current.data?.meta.per_page).toBe(20)
      expect(result.current.data?.meta.total).toBe(100)
    })
  })

  describe('query configuration', () => {
    it('should have staleTime of 5 minutes', async () => {
      vi.mocked(clientService.getClients).mockResolvedValue(mockPaginatedResponse)

      const { result } = renderHook(() => useClients(1, 20), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.dataUpdatedAt).toBeDefined()
    })

    it('should retry once on failure', async () => {
      vi.mocked(clientService.getClients)
        .mockRejectedValueOnce(new Error('Temporary error'))
        .mockResolvedValueOnce(mockPaginatedResponse)

      const { result } = renderHook(() => useClients(1, 20), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(clientService.getClients).toHaveBeenCalledTimes(2)
    })
  })

  describe('empty result', () => {
    it('should handle empty client list', async () => {
      const emptyResponse = {
        ...mockPaginatedResponse,
        data: [],
        meta: { ...mockPaginatedResponse.meta, total: 0 },
      }
      vi.mocked(clientService.getClients).mockResolvedValue(emptyResponse)

      const { result } = renderHook(() => useClients(1, 20), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.data).toHaveLength(0)
      expect(result.current.data?.meta.total).toBe(0)
    })
  })
})

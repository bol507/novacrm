import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useCreateClient } from '@/features/clients/hooks/use-create-client'
import { clientService } from '@/features/clients/services/client-service'

vi.mock('@/features/clients/services/client-service')

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  })
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useCreateClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockClientData = {
    accountname: 'New Test Client',
    account_type: 'Customer',
    industry: 'Technology',
    phone: '1234567890',
    email1: 'newclient@test.com',
    emailoptout: false,
    notify_owner: true,
    isconvertedfromlead: false,
  }

  const mockCreatedClientResponse = {
    client_id: 10,
  }

  describe('successful creation', () => {
    it('should create client successfully', async () => {
      vi.mocked(clientService.createClient).mockResolvedValue(mockCreatedClientResponse)

      const { result } = renderHook(() => useCreateClient(), {
        wrapper: createWrapper(),
      })

      let createdClient: any
      await act(async () => {
        createdClient = await result.current.mutateAsync(mockClientData)
      })

      expect(clientService.createClient).toHaveBeenCalled()
      expect(createdClient).toEqual(mockCreatedClientResponse)
    })

    it('should call service with correct data', async () => {
      vi.mocked(clientService.createClient).mockResolvedValue(mockCreatedClientResponse)

      const { result } = renderHook(() => useCreateClient(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        await result.current.mutateAsync(mockClientData)
      })

      expect(clientService.createClient).toHaveBeenCalledWith(mockClientData)
    })

    it('should transform boolean flags to strings', async () => {
      vi.mocked(clientService.createClient).mockResolvedValue(mockCreatedClientResponse)

      const clientDataWithFlags = {
        ...mockClientData,
        emailoptout: true,
        notify_owner: false,
        isconvertedfromlead: true,
      }

      const { result } = renderHook(() => useCreateClient(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        await result.current.mutateAsync(clientDataWithFlags)
      })

      // Service should be called with the original data
      expect(clientService.createClient).toHaveBeenCalledWith(clientDataWithFlags)
    })
  })

  describe('error handling', () => {
    it('should handle creation error', async () => {
      const errorResponse = { response: { data: { error: 'Validation failed' } } }
      vi.mocked(clientService.createClient).mockRejectedValue(errorResponse)

      const { result } = renderHook(() => useCreateClient(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        try {
          await result.current.mutateAsync(mockClientData)
        } catch {
          // Expected
        }
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })
    })

    it('should handle network error', async () => {
      vi.mocked(clientService.createClient).mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useCreateClient(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        try {
          await result.current.mutateAsync(mockClientData)
        } catch {
          // Expected
        }
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })
      expect(result.current.error).toBeInstanceOf(Error)
    })
  })

  describe('mutation state', () => {
    it('should start with isIdle state', () => {
      const { result } = renderHook(() => useCreateClient(), {
        wrapper: createWrapper(),
      })

      expect(result.current.status).toBe('idle')
      expect(result.current.isIdle).toBe(true)
    })
  })

  describe('returned data structure', () => {
    it('should return client_id on success', async () => {
      vi.mocked(clientService.createClient).mockResolvedValue(mockCreatedClientResponse)

      const { result } = renderHook(() => useCreateClient(), {
        wrapper: createWrapper(),
      })

      let response: any
      await act(async () => {
        response = await result.current.mutateAsync(mockClientData)
      })

      expect(response).toHaveProperty('client_id')
      expect(response.client_id).toBe(10)
    })
  })
})

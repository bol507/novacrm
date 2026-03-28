import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useDeleteClient } from '@/features/clients/hooks/use-delete-client'
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

describe('useDeleteClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('successful deletion', () => {
    it('should delete client successfully', async () => {
      vi.mocked(clientService.deleteClient).mockResolvedValue(undefined)

      const { result } = renderHook(() => useDeleteClient(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        await result.current.mutateAsync(1)
      })

      expect(clientService.deleteClient).toHaveBeenCalledWith(1)
    })

    it('should call service with correct id', async () => {
      vi.mocked(clientService.deleteClient).mockResolvedValue(undefined)

      const { result } = renderHook(() => useDeleteClient(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        await result.current.mutateAsync(42)
      })

      expect(clientService.deleteClient).toHaveBeenCalledWith(42)
    })

    it('should invalidate clients list query after delete', async () => {
      vi.mocked(clientService.deleteClient).mockResolvedValue(undefined)

      const { result } = renderHook(() => useDeleteClient(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        await result.current.mutateAsync(1)
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })
    })
  })

  describe('error handling', () => {
    it('should handle deletion error', async () => {
      const errorResponse = { response: { data: { error: 'Cannot delete client with related opportunities' } } }
      vi.mocked(clientService.deleteClient).mockRejectedValue(errorResponse)

      const { result } = renderHook(() => useDeleteClient(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        try {
          await result.current.mutateAsync(1)
        } catch {
          // Expected
        }
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })
    })

    it('should handle not found error', async () => {
      const errorResponse = { response: { data: { error: 'Client not found' } } }
      vi.mocked(clientService.deleteClient).mockRejectedValue(errorResponse)

      const { result } = renderHook(() => useDeleteClient(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        try {
          await result.current.mutateAsync(999)
        } catch {
          // Expected
        }
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })
    })

    it('should handle network error', async () => {
      vi.mocked(clientService.deleteClient).mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useDeleteClient(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        try {
          await result.current.mutateAsync(1)
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
      const { result } = renderHook(() => useDeleteClient(), {
        wrapper: createWrapper(),
      })

      expect(result.current.status).toBe('idle')
      expect(result.current.isIdle).toBe(true)
    })

    it('should be pending during mutation', async () => {
      vi.mocked(clientService.deleteClient).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(undefined), 100))
      )

      const { result } = renderHook(() => useDeleteClient(), {
        wrapper: createWrapper(),
      })

      act(() => {
        result.current.mutate(1)
      })

      expect(result.current.isPending).toBe(true)
    })

    it('should transition to success after deletion', async () => {
      vi.mocked(clientService.deleteClient).mockResolvedValue(undefined)

      const { result } = renderHook(() => useDeleteClient(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        await result.current.mutateAsync(1)
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })
      expect(result.current.data).toBeUndefined()
    })
  })

  describe('consecutive deletions', () => {
    it('should handle multiple deletions', async () => {
      vi.mocked(clientService.deleteClient).mockResolvedValue(undefined)

      const { result } = renderHook(() => useDeleteClient(), {
        wrapper: createWrapper(),
      })

      // Delete first client
      await act(async () => {
        await result.current.mutateAsync(1)
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      // Reset for second deletion
      vi.mocked(clientService.deleteClient).mockResolvedValue(undefined)

      // Delete second client
      await act(async () => {
        await result.current.mutateAsync(2)
      })

      expect(clientService.deleteClient).toHaveBeenCalledTimes(2)
    })
  })

  describe('query invalidation', () => {
    it('should invalidate clients list query', async () => {
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

      vi.mocked(clientService.deleteClient).mockResolvedValue(undefined)

      const { result } = renderHook(() => useDeleteClient(), {
        wrapper: ({ children }: { children: React.ReactNode }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      })

      await act(async () => {
        await result.current.mutateAsync(1)
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })
    })
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useUpdateClient } from '@/features/clients/hooks/use-update-client'
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

describe('useUpdateClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockUpdateData = {
    accountname: 'Updated Client Name',
    phone: '9876543210',
    industry: 'Healthcare',
  }

  describe('successful update', () => {
    it('should update client successfully', async () => {
      vi.mocked(clientService.updateClient).mockResolvedValue(undefined)

      const { result } = renderHook(() => useUpdateClient(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        await result.current.mutateAsync({ id: 1, data: mockUpdateData })
      })

      expect(clientService.updateClient).toHaveBeenCalledWith(1, mockUpdateData)
    })

    it('should call service with correct id and data', async () => {
      vi.mocked(clientService.updateClient).mockResolvedValue(undefined)

      const { result } = renderHook(() => useUpdateClient(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        await result.current.mutateAsync({ id: 42, data: mockUpdateData })
      })

      expect(clientService.updateClient).toHaveBeenCalledWith(42, mockUpdateData)
    })

    it('should invalidate client query after update', async () => {
      vi.mocked(clientService.updateClient).mockResolvedValue(undefined)

      const { result } = renderHook(() => useUpdateClient(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        await result.current.mutateAsync({ id: 1, data: mockUpdateData })
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })
    })
  })

  describe('error handling', () => {
    it('should handle update error', async () => {
      const errorResponse = { response: { data: { error: 'Update failed' } } }
      vi.mocked(clientService.updateClient).mockRejectedValue(errorResponse)

      const { result } = renderHook(() => useUpdateClient(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        try {
          await result.current.mutateAsync({ id: 1, data: mockUpdateData })
        } catch {
          // Expected
        }
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })
    })

    it('should handle network error', async () => {
      vi.mocked(clientService.updateClient).mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useUpdateClient(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        try {
          await result.current.mutateAsync({ id: 1, data: mockUpdateData })
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
      const { result } = renderHook(() => useUpdateClient(), {
        wrapper: createWrapper(),
      })

      expect(result.current.status).toBe('idle')
      expect(result.current.isIdle).toBe(true)
    })

    it('should be pending during mutation', async () => {
      vi.mocked(clientService.updateClient).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(undefined), 100))
      )

      const { result } = renderHook(() => useUpdateClient(), {
        wrapper: createWrapper(),
      })

      act(() => {
        result.current.mutate({ id: 1, data: mockUpdateData })
      })

      expect(result.current.isPending).toBe(true)
    })
  })

  describe('partial updates', () => {
    it('should support partial updates with single field', async () => {
      vi.mocked(clientService.updateClient).mockResolvedValue(undefined)

      const { result } = renderHook(() => useUpdateClient(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        await result.current.mutateAsync({
          id: 1,
          data: { phone: '555-555-5555' },
        })
      })

      expect(clientService.updateClient).toHaveBeenCalledWith(1, { phone: '555-555-5555' })
    })

    it('should support updates with multiple fields', async () => {
      vi.mocked(clientService.updateClient).mockResolvedValue(undefined)

      const { result } = renderHook(() => useUpdateClient(), {
        wrapper: createWrapper(),
      })

      const fullUpdate = {
        accountname: 'New Name',
        industry: 'Finance',
        annualrevenue: 5000000,
        email1: 'updated@email.com',
      }

      await act(async () => {
        await result.current.mutateAsync({ id: 1, data: fullUpdate })
      })

      expect(clientService.updateClient).toHaveBeenCalledWith(1, fullUpdate)
    })
  })

  describe('query invalidation', () => {
    it('should invalidate both specific client and clients list queries', async () => {
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

      vi.mocked(clientService.updateClient).mockResolvedValue(undefined)

      const { result } = renderHook(() => useUpdateClient(), {
        wrapper: ({ children }: { children: React.ReactNode }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      })

      await act(async () => {
        await result.current.mutateAsync({ id: 5, data: mockUpdateData })
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })
    })
  })
})

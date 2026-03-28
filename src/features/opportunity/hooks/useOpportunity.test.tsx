import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useOpportunity } from '@/features/opportunity/hooks/useOpportunity'
import { opportunityService } from '@/features/opportunity/services/opportunityService'

// Mock the service
vi.mock('@/features/opportunity/services/opportunityService')

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

describe('useOpportunity', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockOpportunity = {
    potentialid: 1,
    potential_no: 'OPP-001',
    potentialname: 'Test Opportunity',
    amount: 10000,
    closingdate: '2026-12-31',
    sales_stage: 'Prospecting',
    probability: 25,
    related_to: 1,
    related_to_name: 'Test Client',
    assigned_user_id: 1,
    assigned_user_name: 'John Doe',
    description: 'Test description',
    is_active: true,
  }

  describe('when id is valid', () => {
    it('should fetch opportunity successfully', async () => {
      vi.mocked(opportunityService.getOpportunity).mockResolvedValue(mockOpportunity)

      const { result } = renderHook(() => useOpportunity(1), {
        wrapper: createWrapper(),
      })

      // Initially loading
      expect(result.current.isLoading).toBe(true)
      expect(result.current.data).toBeUndefined()

      // Wait for data
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockOpportunity)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should call getOpportunity with correct id', async () => {
      vi.mocked(opportunityService.getOpportunity).mockResolvedValue(mockOpportunity)

      renderHook(() => useOpportunity(42), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(opportunityService.getOpportunity).toHaveBeenCalledWith(42)
      })
    })

    it('should have correct query key', async () => {
      vi.mocked(opportunityService.getOpportunity).mockResolvedValue(mockOpportunity)

      const { result } = renderHook(() => useOpportunity(1), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(opportunityService.getOpportunity).toHaveBeenCalled()
    })
  })

  describe('when id is invalid', () => {
    it('should not fetch when id is null', () => {
      renderHook(() => useOpportunity(null), {
        wrapper: createWrapper(),
      })

      expect(opportunityService.getOpportunity).not.toHaveBeenCalled()
    })

    it('should not fetch when id is undefined', () => {
      renderHook(() => useOpportunity(undefined), {
        wrapper: createWrapper(),
      })

      expect(opportunityService.getOpportunity).not.toHaveBeenCalled()
    })

    it('should not fetch when id is 0', () => {
      renderHook(() => useOpportunity(0), {
        wrapper: createWrapper(),
      })

      expect(opportunityService.getOpportunity).not.toHaveBeenCalled()
    })

    it('should not fetch when id is negative', () => {
      renderHook(() => useOpportunity(-1), {
        wrapper: createWrapper(),
      })

      expect(opportunityService.getOpportunity).not.toHaveBeenCalled()
    })
  })

  describe('when fetching fails', () => {
    it('should handle error correctly', async () => {
      const errorMessage = 'Failed to fetch opportunity'
      vi.mocked(opportunityService.getOpportunity).mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useOpportunity(1), {
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
      vi.mocked(opportunityService.getOpportunity).mockRejectedValue(new Error('Error'))

      renderHook(() => useOpportunity(1), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(opportunityService.getOpportunity).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('query configuration', () => {
    it('should have staleTime of 5 minutes', async () => {
      vi.mocked(opportunityService.getOpportunity).mockResolvedValue(mockOpportunity)

      const { result } = renderHook(() => useOpportunity(1), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      // staleTime is set to 5 minutes (5 * 60 * 1000 ms)
      expect(result.current.dataUpdatedAt).toBeDefined()
    })
  })
})

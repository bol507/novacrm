import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useCreateOpportunity } from '@/features/opportunity/hooks/useCreateOpportunity'
import { opportunityService } from '@/features/opportunity/services/opportunityService'

vi.mock('@/features/opportunity/services/opportunityService')

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

describe('useCreateOpportunity', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockOpportunityData = {
    potentialname: 'New Opportunity',
    amount: 5000,
    sales_stage: 'Prospecting',
    closingdate: '2026-12-31',
    related_to: 1,
  }

  const mockCreatedOpportunity = {
    potentialid: 10,
    potential_no: 'OPP-010',
    ...mockOpportunityData,
  }

  describe('successful creation', () => {
    it('should create opportunity successfully', async () => {
      vi.mocked(opportunityService.createOpportunity).mockResolvedValue(mockCreatedOpportunity)

      const { result } = renderHook(() => useCreateOpportunity(), {
        wrapper: createWrapper(),
      })

      let createdOpportunity: any
      await act(async () => {
        createdOpportunity = await result.current.mutateAsync(mockOpportunityData)
      })

      expect(opportunityService.createOpportunity).toHaveBeenCalledWith(mockOpportunityData)
      expect(createdOpportunity).toEqual(mockCreatedOpportunity)
    })

    it('should call service with correct data', async () => {
      vi.mocked(opportunityService.createOpportunity).mockResolvedValue(mockCreatedOpportunity)

      const { result } = renderHook(() => useCreateOpportunity(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        await result.current.mutateAsync(mockOpportunityData)
      })

      expect(opportunityService.createOpportunity).toHaveBeenCalledWith(mockOpportunityData)
    })
  })

  describe('error handling', () => {
    it('should handle creation error', async () => {
      const errorResponse = { response: { data: { error: 'Validation failed' } } }
      vi.mocked(opportunityService.createOpportunity).mockRejectedValue(errorResponse)

      const { result } = renderHook(() => useCreateOpportunity(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        try {
          await result.current.mutateAsync(mockOpportunityData)
        } catch {
          // Expected
        }
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })
    })
  })

  describe('mutation state', () => {
    it('should start with isIdle state', () => {
      const { result } = renderHook(() => useCreateOpportunity(), {
        wrapper: createWrapper(),
      })

      expect(result.current.status).toBe('idle')
      expect(result.current.isIdle).toBe(true)
    })
  })
})

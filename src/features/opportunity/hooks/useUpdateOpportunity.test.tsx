import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useUpdateOpportunity } from '@/features/opportunity/hooks/useUpdateOpportunity'
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

describe('useUpdateOpportunity', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockUpdateData = {
    potentialname: 'Updated Opportunity',
    amount: 7500,
    sales_stage: 'Qualification',
  }

  const mockUpdatedOpportunity = {
    potentialid: 1,
    potential_no: 'OPP-001',
    ...mockUpdateData,
    closingdate: '2026-12-31',
    related_to: 1,
  }

  describe('successful update', () => {
    it('should update opportunity successfully', async () => {
      vi.mocked(opportunityService.updateOpportunity).mockResolvedValue(mockUpdatedOpportunity)

      const { result } = renderHook(() => useUpdateOpportunity(), {
        wrapper: createWrapper(),
      })

      let updatedOpportunity: any
      await act(async () => {
        updatedOpportunity = await result.current.mutateAsync({
          id: 1,
          data: mockUpdateData,
        })
      })

      expect(opportunityService.updateOpportunity).toHaveBeenCalledWith(1, mockUpdateData)
      expect(updatedOpportunity).toEqual(mockUpdatedOpportunity)
    })

    it('should pass correct id and data to service', async () => {
      vi.mocked(opportunityService.updateOpportunity).mockResolvedValue(mockUpdatedOpportunity)

      const { result } = renderHook(() => useUpdateOpportunity(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        await result.current.mutateAsync({
          id: 42,
          data: { potentialname: 'Test' },
        })
      })

      expect(opportunityService.updateOpportunity).toHaveBeenCalledWith(42, { potentialname: 'Test' })
    })
  })

  describe('error handling', () => {
    it('should handle update error', async () => {
      const errorResponse = { response: { data: { error: 'Not found' } } }
      vi.mocked(opportunityService.updateOpportunity).mockRejectedValue(errorResponse)

      const { result } = renderHook(() => useUpdateOpportunity(), {
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
  })

  describe('mutation state', () => {
    it('should start with isIdle state', () => {
      const { result } = renderHook(() => useUpdateOpportunity(), {
        wrapper: createWrapper(),
      })

      expect(result.current.status).toBe('idle')
      expect(result.current.isIdle).toBe(true)
    })
  })
})

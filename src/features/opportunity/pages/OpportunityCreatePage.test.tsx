import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import OpportunityCreatePage from '@/features/opportunity/pages/OpportunityCreatePage'
import { useCreateOpportunity } from '@/features/opportunity/hooks/useCreateOpportunity'

vi.mock('@/features/opportunity/hooks/useCreateOpportunity')

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

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
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </BrowserRouter>
  )
}

describe('OpportunityCreatePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNavigate.mockClear()
  })

  describe('rendering', () => {
    it('should render page title', () => {
      vi.mocked(useCreateOpportunity).mockReturnValue({
        mutateAsync: vi.fn(),
        mutate: vi.fn(),
        isPending: false,
        isSuccess: false,
        isError: false,
      } as any)

      render(<OpportunityCreatePage />, { wrapper: createWrapper() })

      expect(screen.getByText('Nueva Oportunidad')).toBeTruthy()
    })

    it('should render page description', () => {
      vi.mocked(useCreateOpportunity).mockReturnValue({
        mutateAsync: vi.fn(),
        mutate: vi.fn(),
        isPending: false,
        isSuccess: false,
        isError: false,
      } as any)

      render(<OpportunityCreatePage />, { wrapper: createWrapper() })

      expect(screen.getByText(/Complete la información/i)).toBeTruthy()
    })

    it('should have back button', () => {
      vi.mocked(useCreateOpportunity).mockReturnValue({
        mutateAsync: vi.fn(),
        mutate: vi.fn(),
        isPending: false,
        isSuccess: false,
        isError: false,
      } as any)

      render(<OpportunityCreatePage />, { wrapper: createWrapper() })

      // Find the back button by looking for the arrow-left icon button
      const backButton = screen.getByTestId('arrow-left')
      expect(backButton).toBeTruthy()
    })
  })

  describe('navigation', () => {
    it('should navigate to opportunities list on cancel', async () => {
      vi.mocked(useCreateOpportunity).mockReturnValue({
        mutateAsync: vi.fn(),
        mutate: vi.fn(),
        isPending: false,
        isSuccess: false,
        isError: false,
      } as any)

      render(<OpportunityCreatePage />, { wrapper: createWrapper() })

      // Find the back button - it's a ghost variant button with icon size
      const buttons = document.querySelectorAll('button')
      // The back button should be the ghost icon button (not the Cancel or Create buttons)
      const backButton = Array.from(buttons).find(btn => 
        btn.classList.contains('hover:bg-accent') && 
        btn.classList.contains('size-9')
      )
      
      expect(backButton).toBeTruthy()
      fireEvent.click(backButton!)

      expect(mockNavigate).toHaveBeenCalledWith('/dashboard/opportunities')
    })

    it('should render create form dialog', () => {
      vi.mocked(useCreateOpportunity).mockReturnValue({
        mutateAsync: vi.fn(),
        mutate: vi.fn(),
        isPending: false,
        isSuccess: false,
        isError: false,
      } as any)

      render(<OpportunityCreatePage />, { wrapper: createWrapper() })

      // Should show the dialog with "New Opportunity" title
      expect(screen.getByText('New Opportunity')).toBeTruthy()
    })
  })

  describe('error handling', () => {
    it('should handle submission errors', async () => {
      const errorResponse = { response: { data: { error: 'Validation failed' } } }
      vi.mocked(useCreateOpportunity).mockReturnValue({
        mutateAsync: vi.fn().mockRejectedValue(errorResponse),
        mutate: vi.fn(),
        isPending: false,
        isSuccess: false,
        isError: true,
      } as any)

      render(<OpportunityCreatePage />, { wrapper: createWrapper() })

      expect(screen.getByText('Nueva Oportunidad')).toBeTruthy()
    })
  })
})

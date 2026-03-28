import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import OpportunityDetailPage from '@/features/opportunity/pages/OpportunityDetailPage'
import { useOpportunity } from '@/features/opportunity/hooks/useOpportunity'

vi.mock('@/features/opportunity/hooks/useOpportunity')

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: '1' }),
  }
})

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
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

describe('OpportunityDetailPage', () => {
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

  describe('loading state', () => {
    it('should show loading skeleton while fetching', () => {
      vi.mocked(useOpportunity).mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
        isSuccess: false,
        isFetching: true,
        refetch: vi.fn(),
      } as any)

      render(<OpportunityDetailPage />, { wrapper: createWrapper() })

      expect(document.body.querySelector('.animate-pulse')).toBeTruthy()
    })
  })

  describe('error state', () => {
    it('should show error message when opportunity not found', () => {
      vi.mocked(useOpportunity).mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Not found'),
        isSuccess: false,
        refetch: vi.fn(),
      } as any)

      render(<OpportunityDetailPage />, { wrapper: createWrapper() })

      expect(screen.getByText(/Oportunidad no encontrada/i)).toBeTruthy()
    })

    it('should have a link to go back to opportunities list', () => {
      vi.mocked(useOpportunity).mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Not found'),
        isSuccess: false,
        refetch: vi.fn(),
      } as any)

      render(<OpportunityDetailPage />, { wrapper: createWrapper() })

      const backLink = screen.getByRole('link', { name: /Volver a oportunidades/i })
      expect(backLink).toBeTruthy()
      expect(backLink).toHaveAttribute('href', '/dashboard/opportunities')
    })
  })

  describe('success state', () => {
    beforeEach(() => {
      vi.mocked(useOpportunity).mockReturnValue({
        data: mockOpportunity,
        isLoading: false,
        isError: false,
        error: null,
        isSuccess: true,
        refetch: vi.fn(),
      } as any)
    })

    it('should render opportunity name in header', () => {
      render(<OpportunityDetailPage />, { wrapper: createWrapper() })

      expect(screen.getByText('Test Opportunity')).toBeTruthy()
    })

    it('should render opportunity number', () => {
      render(<OpportunityDetailPage />, { wrapper: createWrapper() })

      expect(screen.getByText('OPP-001')).toBeTruthy()
    })

    it('should render sales stage badge', () => {
      render(<OpportunityDetailPage />, { wrapper: createWrapper() })

      expect(screen.getByText('Prospecting')).toBeTruthy()
    })

    it('should render client name', () => {
      render(<OpportunityDetailPage />, { wrapper: createWrapper() })

      expect(screen.getByText('Test Client')).toBeTruthy()
    })

    it('should render assigned user name', () => {
      render(<OpportunityDetailPage />, { wrapper: createWrapper() })

      expect(screen.getByText('John Doe')).toBeTruthy()
    })

    it('should render description section when description exists', () => {
      render(<OpportunityDetailPage />, { wrapper: createWrapper() })

      expect(screen.getByText('Test description')).toBeTruthy()
    })

    it('should have Edit button that navigates to edit page', async () => {
      render(<OpportunityDetailPage />, { wrapper: createWrapper() })

      const editButton = screen.getByRole('button', { name: /Editar/i })
      expect(editButton).toBeTruthy()

      await userEvent.click(editButton)
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard/opportunities/1/edit')
    })

    it('should have back button that navigates to opportunities list', async () => {
      render(<OpportunityDetailPage />, { wrapper: createWrapper() })

      // Find the back button by looking for the arrow-left icon button
      const backButton = screen.getByTestId('arrow-left')
      expect(backButton).toBeTruthy()
      
      const parentButton = backButton.closest('button')
      await userEvent.click(parentButton!)
      
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard/opportunities')
    })

    it('should show inactive badge when is_active is false', () => {
      vi.mocked(useOpportunity).mockReturnValue({
        data: { ...mockOpportunity, is_active: false },
        isLoading: false,
        isError: false,
        error: null,
        isSuccess: true,
        refetch: vi.fn(),
      } as any)

      render(<OpportunityDetailPage />, { wrapper: createWrapper() })

      expect(screen.getByText('Inactiva')).toBeTruthy()
    })
  })
})

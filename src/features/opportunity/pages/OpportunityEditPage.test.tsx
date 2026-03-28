import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import OpportunityEditPage from '@/features/opportunity/pages/OpportunityEditPage'
import { useOpportunity } from '@/features/opportunity/hooks/useOpportunity'
import { useUpdateOpportunity } from '@/features/opportunity/hooks/useUpdateOpportunity'

vi.mock('@/features/opportunity/hooks/useOpportunity')
vi.mock('@/features/opportunity/hooks/useUpdateOpportunity')

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

describe('OpportunityEditPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNavigate.mockClear()
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
    it('should show loading skeleton while fetching opportunity', () => {
      vi.mocked(useOpportunity).mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
        isSuccess: false,
      } as any)

      vi.mocked(useUpdateOpportunity).mockReturnValue({
        mutateAsync: vi.fn(),
        mutate: vi.fn(),
        isPending: false,
      } as any)

      render(<OpportunityEditPage />, { wrapper: createWrapper() })

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
      } as any)

      vi.mocked(useUpdateOpportunity).mockReturnValue({
        mutateAsync: vi.fn(),
        mutate: vi.fn(),
        isPending: false,
      } as any)

      render(<OpportunityEditPage />, { wrapper: createWrapper() })

      expect(screen.getByText(/Error/i)).toBeTruthy()
      expect(screen.getByText(/Not found/i)).toBeTruthy()
    })

    it('should show back button in error state', () => {
      vi.mocked(useOpportunity).mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Not found'),
        isSuccess: false,
      } as any)

      vi.mocked(useUpdateOpportunity).mockReturnValue({
        mutateAsync: vi.fn(),
        mutate: vi.fn(),
        isPending: false,
      } as any)

      render(<OpportunityEditPage />, { wrapper: createWrapper() })

      const backButton = screen.getByRole('button', { name: /Volver a Oportunidades/i })
      expect(backButton).toBeTruthy()
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
      } as any)

      vi.mocked(useUpdateOpportunity).mockReturnValue({
        mutateAsync: vi.fn().mockResolvedValue(mockOpportunity),
        mutate: vi.fn(),
        isPending: false,
        isSuccess: false,
      } as any)
    })

    it('should render page title', () => {
      render(<OpportunityEditPage />, { wrapper: createWrapper() })

      expect(screen.getByText('Editar Oportunidad')).toBeTruthy()
    })

    it('should render opportunity name in subtitle', () => {
      render(<OpportunityEditPage />, { wrapper: createWrapper() })

      expect(screen.getByText(/Test Opportunity/i)).toBeTruthy()
      expect(screen.getByText(/\(OPP-001\)/i)).toBeTruthy()
    })

    it('should have back button', () => {
      render(<OpportunityEditPage />, { wrapper: createWrapper() })

      const backButton = screen.getByTestId('arrow-left')
      expect(backButton).toBeTruthy()
    })

    it('should render edit form dialog', () => {
      render(<OpportunityEditPage />, { wrapper: createWrapper() })

      expect(screen.getByText('Edit Opportunity')).toBeTruthy()
    })
  })

  describe('navigation', () => {
    it('should navigate back to detail page on cancel', () => {
      vi.mocked(useOpportunity).mockReturnValue({
        data: mockOpportunity,
        isLoading: false,
        isError: false,
        error: null,
        isSuccess: true,
      } as any)

      vi.mocked(useUpdateOpportunity).mockReturnValue({
        mutateAsync: vi.fn(),
        mutate: vi.fn(),
        isPending: false,
      } as any)

      render(<OpportunityEditPage />, { wrapper: createWrapper() })

      // Find the back button - it's a ghost variant button with icon size
      const buttons = document.querySelectorAll('button')
      const backButton = Array.from(buttons).find(btn => 
        btn.classList.contains('hover:bg-accent') && 
        btn.classList.contains('size-9')
      )
      
      expect(backButton).toBeTruthy()
      fireEvent.click(backButton!)

      expect(mockNavigate).toHaveBeenCalledWith('/dashboard/opportunities/1')
    })
  })
})

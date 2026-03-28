import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ClientDetailPage from '@/features/clients/pages/ClientDetailPage'
import { useClient } from '@/features/clients/hooks/use-client'
import { useDeleteClient } from '@/features/clients/hooks/use-delete-client'

vi.mock('@/features/clients/hooks/use-client')
vi.mock('@/features/clients/hooks/use-delete-client')

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

const mockClient = {
  accountid: 1,
  account_no: 'ACC-001',
  accountname: 'Test Client',
  account_type: 'Customer',
  industry: 'Technology',
  annualrevenue: 1000000,
  rating: 'Active',
  ownership: 'Private',
  phone: '1234567890',
  otherphone: '0987654321',
  email1: 'test@client.com',
  email2: 'test2@client.com',
  website: 'https://testclient.com',
  fax: '123-456-7890',
  employees: 100,
  emailoptout: '0' as const,
  notify_owner: '0' as const,
  isconvertedfromlead: '0' as const,
  tags: 'important,vip',
  is_active: true,
  bill_street: '123 Main St',
  bill_city: 'New York',
  bill_state: 'NY',
  bill_code: '10001',
  bill_country: 'USA',
  ship_street: '456 Shipping Ave',
  ship_city: 'Los Angeles',
  ship_state: 'CA',
  ship_code: '90001',
  ship_country: 'USA',
  createdtime: '2026-01-01 00:00:00',
  modifiedtime: '2026-01-15 00:00:00',
}

describe('ClientDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNavigate.mockClear()
  })

  describe('loading state', () => {
    it('should show loading skeleton while fetching', () => {
      vi.mocked(useClient).mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
        isSuccess: false,
        isFetching: true,
        refetch: vi.fn(),
      } as any)

      vi.mocked(useDeleteClient).mockReturnValue({
        mutateAsync: vi.fn(),
        mutate: vi.fn(),
        isPending: false,
        isSuccess: false,
        isError: false,
      } as any)

      render(<ClientDetailPage />, { wrapper: createWrapper() })

      expect(document.body.querySelector('.animate-pulse')).toBeTruthy()
    })
  })

  describe('error state', () => {
    it('should show error message when client not found', () => {
      vi.mocked(useClient).mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Not found'),
        isSuccess: false,
        refetch: vi.fn(),
      } as any)

      vi.mocked(useDeleteClient).mockReturnValue({
        mutateAsync: vi.fn(),
        mutate: vi.fn(),
        isPending: false,
        isSuccess: false,
        isError: false,
      } as any)

      render(<ClientDetailPage />, { wrapper: createWrapper() })

      expect(screen.getByText(/Cliente no encontrado/i)).toBeTruthy()
    })

    it('should have a link to go back to clients list', () => {
      vi.mocked(useClient).mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Not found'),
        isSuccess: false,
        refetch: vi.fn(),
      } as any)

      vi.mocked(useDeleteClient).mockReturnValue({
        mutateAsync: vi.fn(),
        mutate: vi.fn(),
        isPending: false,
        isSuccess: false,
        isError: false,
      } as any)

      render(<ClientDetailPage />, { wrapper: createWrapper() })

      const backLink = screen.getByRole('link', { name: /Volver a clientes/i })
      expect(backLink).toBeTruthy()
      expect(backLink).toHaveAttribute('href', '/dashboard/clients')
    })
  })

  describe('success state', () => {
    beforeEach(() => {
      vi.mocked(useClient).mockReturnValue({
        data: mockClient,
        isLoading: false,
        isError: false,
        error: null,
        isSuccess: true,
        refetch: vi.fn(),
      } as any)

      vi.mocked(useDeleteClient).mockReturnValue({
        mutateAsync: vi.fn(),
        mutate: vi.fn(),
        isPending: false,
        isSuccess: false,
        isError: false,
      } as any)
    })

    it('should Render client name in header', async () => {
      render(<ClientDetailPage />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(screen.getByText('Test Client')).toBeTruthy()
      })
    })

    it('should Render account number', async () => {
      render(<ClientDetailPage />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(screen.getByText('ACC-001')).toBeTruthy()
      })
    })

    it('should Render account type', async () => {
      render(<ClientDetailPage />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(screen.getByText('Customer')).toBeTruthy()
      })
    })

    it('should Render industry', async () => {
      render(<ClientDetailPage />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(screen.getByText('Technology')).toBeTruthy()
      })
    })

    it('should Render phone number', async () => {
      render(<ClientDetailPage />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(screen.getByText('1234567890')).toBeTruthy()
      })
    })

    it('should Render email', async () => {
      render(<ClientDetailPage />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(screen.getByText('test@client.com')).toBeTruthy()
      })
    })

    it('should Render website', async () => {
      render(<ClientDetailPage />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(screen.getByText('https://testclient.com')).toBeTruthy()
      })
    })

    it('should Render annual revenue', async () => {
      render(<ClientDetailPage />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(screen.getByText(/\$1,000,000/i)).toBeTruthy()
      })
    })

    it('should Render billing address', async () => {
      render(<ClientDetailPage />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(screen.getByText('123 Main St')).toBeTruthy()
        expect(screen.getByText('New York, NY 10001')).toBeTruthy()
      })
    })

    it('should Render shipping address', async () => {
      render(<ClientDetailPage />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(screen.getByText('456 Shipping Ave')).toBeTruthy()
        expect(screen.getByText('Los Angeles, CA 90001')).toBeTruthy()
      })
    })

    it('should have Edit button that navigates to edit page', async () => {
      render(<ClientDetailPage />, { wrapper: createWrapper() })

      await waitFor(() => {
        const editButton = screen.getByRole('button', { name: /Editar/i })
        expect(editButton).toBeTruthy()

        userEvent.click(editButton)
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard/clients/1/edit')
      })
    })

    it('should have back button that navigates to clients list', async () => {
      render(<ClientDetailPage />, { wrapper: createWrapper() })

      await waitFor(() => {
        const backButton = document.querySelector('button')
        expect(backButton).toBeTruthy()

        if (backButton) {
          userEvent.click(backButton)
        }
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard/clients')
      })
    })

    it('should show inactive badge when is_active is false', async () => {
      vi.mocked(useClient).mockReturnValue({
        data: { ...mockClient, is_active: false },
        isLoading: false,
        isError: false,
        error: null,
        isSuccess: true,
        refetch: vi.fn(),
      } as any)

      render(<ClientDetailPage />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(screen.getByText('Inactivo')).toBeTruthy()
      })
    })
  })
})

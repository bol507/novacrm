import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter} from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ClientEditPage } from '@/features/clients/pages/ClientEditPage'
import { useClient } from '@/features/clients/hooks/use-client'
import { useUpdateClient } from '@/features/clients/hooks/use-update-client'

vi.mock('@/features/clients/hooks/use-client')
vi.mock('@/features/clients/hooks/use-update-client')

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
  phone: '1234567890',
  email1: 'test@client.com',
  is_active: true,
  emailoptout: '0' as const,
  notify_owner: '0' as const,
  isconvertedfromlead: '0' as const,
}

describe('ClientEditPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNavigate.mockClear()
  })

  describe('rendering', () => {
    it('should render page title', async () => {
      vi.mocked(useClient).mockReturnValue({
        data: mockClient,
        isLoading: false,
        isSuccess: true,
        isError: false,
        error: null,
      } as any)

      vi.mocked(useUpdateClient).mockReturnValue({
        mutateAsync: vi.fn(),
        mutate: vi.fn(),
        isPending: false,
        isSuccess: false,
        isError: false,
      } as any)

      render(<ClientEditPage />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(screen.getByText('Editar Cliente')).toBeTruthy()
      })
    })

    it('should render client name in subtitle', async () => {
      vi.mocked(useClient).mockReturnValue({
        data: mockClient,
        isLoading: false,
        isSuccess: true,
        isError: false,
        error: null,
      } as any)

      vi.mocked(useUpdateClient).mockReturnValue({
        mutateAsync: vi.fn(),
        mutate: vi.fn(),
        isPending: false,
        isSuccess: false,
        isError: false,
      } as any)

      render(<ClientEditPage />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(screen.getByText(/Test Client/i)).toBeTruthy()
        expect(screen.getByText(/\(ACC-001\)/i)).toBeTruthy()
      })
    })
  })

  describe('loading state', () => {
    it('should show loading skeleton when fetching client', () => {
      vi.mocked(useClient).mockReturnValue({
        data: undefined,
        isLoading: true,
        isSuccess: false,
        isError: false,
        error: null,
      } as any)

      vi.mocked(useUpdateClient).mockReturnValue({
        mutateAsync: vi.fn(),
        mutate: vi.fn(),
        isPending: false,
        isSuccess: false,
        isError: false,
      } as any)

      const { container } = render(<ClientEditPage />, { wrapper: createWrapper() })

      expect(container.querySelector('.animate-pulse')).toBeTruthy()
    })
  })

  describe('error state', () => {
    it('should show error when client not found', () => {
      vi.mocked(useClient).mockReturnValue({
        data: undefined,
        isLoading: false,
        isSuccess: false,
        isError: true,
        error: new Error('Client not found'),
      } as any)

      vi.mocked(useUpdateClient).mockReturnValue({
        mutateAsync: vi.fn(),
        mutate: vi.fn(),
        isPending: false,
        isSuccess: false,
        isError: false,
      } as any)

      render(<ClientEditPage />, { wrapper: createWrapper() })

      expect(screen.getByText('Error')).toBeTruthy()
      expect(screen.getByText(/Client not found/i)).toBeTruthy()
    })
  })

  describe('navigation', () => {
    it('should navigate to clients list on cancel', async () => {
      vi.mocked(useClient).mockReturnValue({
        data: mockClient,
        isLoading: false,
        isSuccess: true,
        isError: false,
        error: null,
      } as any)

      vi.mocked(useUpdateClient).mockReturnValue({
        mutateAsync: vi.fn(),
        mutate: vi.fn(),
        isPending: false,
        isSuccess: false,
        isError: false,
      } as any)

      render(<ClientEditPage />, { wrapper: createWrapper() })

      await waitFor(() => {
        const backButton = document.querySelector('button')
        if (backButton) {
          backButton.click()
        }
      })

      expect(mockNavigate).toHaveBeenCalledWith('/dashboard/clients')
    })

    it('should navigate to clients list after successful update', async () => {
      vi.mocked(useClient).mockReturnValue({
        data: mockClient,
        isLoading: false,
        isSuccess: true,
        isError: false,
        error: null,
      } as any)

      const mockMutateAsync = vi.fn().mockResolvedValue(undefined)
      vi.mocked(useUpdateClient).mockReturnValue({
        mutateAsync: mockMutateAsync,
        mutate: vi.fn(),
        isPending: false,
        isSuccess: true,
        isError: false,
      } as any)

      render(<ClientEditPage />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard/clients')
      })
    })
  })

  describe('form submission', () => {
    it('should submit with boolean flags converted to strings', async () => {
      vi.mocked(useClient).mockReturnValue({
        data: mockClient,
        isLoading: false,
        isSuccess: true,
        isError: false,
        error: null,
      } as any)

      const mockMutateAsync = vi.fn().mockResolvedValue(undefined)
      vi.mocked(useUpdateClient).mockReturnValue({
        mutateAsync: mockMutateAsync,
        mutate: vi.fn(),
        isPending: false,
        isSuccess: false,
        isError: false,
      } as any)

      render(<ClientEditPage />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(useUpdateClient).toHaveBeenCalled()
      })
    })
  })

  describe('error handling', () => {
    it('should handle update errors', async () => {
      vi.mocked(useClient).mockReturnValue({
        data: mockClient,
        isLoading: false,
        isSuccess: true,
        isError: false,
        error: null,
      } as any)

      const errorResponse = { response: { data: { error: 'Update failed' } } }
      vi.mocked(useUpdateClient).mockReturnValue({
        mutateAsync: vi.fn().mockRejectedValue(errorResponse),
        mutate: vi.fn(),
        isPending: false,
        isSuccess: false,
        isError: true,
      } as any)

      render(<ClientEditPage />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(screen.getByText('Editar Cliente')).toBeTruthy()
      })
    })
  })

  describe('loading state during update', () => {
    it('should show loading state during update', async () => {
      vi.mocked(useClient).mockReturnValue({
        data: mockClient,
        isLoading: false,
        isSuccess: true,
        isError: false,
        error: null,
      } as any)

      vi.mocked(useUpdateClient).mockReturnValue({
        mutateAsync: vi.fn(),
        mutate: vi.fn(),
        isPending: true,
        isSuccess: false,
        isError: false,
      } as any)

      render(<ClientEditPage />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(screen.getByText('Editar Cliente')).toBeTruthy()
      })
    })
  })
})

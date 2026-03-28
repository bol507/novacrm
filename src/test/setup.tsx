import '@testing-library/jest-dom'
import { vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Polyfill for ResizeObserver
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = ResizeObserver

// Mock React Router
vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => vi.fn(),
  useParams: () => ({ id: '1' }),
  useLocation: () => ({ pathname: '/dashboard/opportunities' }),
  Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,
  Navigate: ({ to, ...props }: any) => <a href={to} {...props} />,
}))

// Mock React Query
export const createQueryWrapper = () => {
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

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}))

// Mock Confirm Dialog
vi.mock('@/components/confirm-dialog', () => ({
  useConfirm: () => () => Promise.resolve(true),
}))

// Mock Lucide icons
vi.mock('lucide-react', async () => {
  const actual = await vi.importActual('lucide-react')
  return {
    ...actual,
    ArrowLeft: () => <span data-testid="arrow-left">ArrowLeft</span>,
    Pencil: () => <span data-testid="pencil">Pencil</span>,
    Trash2: () => <span data-testid="trash2">Trash2</span>,
    DollarSign: () => <span data-testid="dollar-sign">DollarSign</span>,
    Calendar: () => <span data-testid="calendar">Calendar</span>,
    Users: () => <span data-testid="users">Users</span>,
    Building2: () => <span data-testid="building2">Building2</span>,
    TrendingUp: () => <span data-testid="trending-up">TrendingUp</span>,
    Plus: () => <span data-testid="plus">Plus</span>,
    X: () => <span data-testid="x">X</span>,
  }
})

// Mock axios
;(vi.mock as Function)('@/shared/lib/axios', () => {
  const mockAxios = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    })),
  }
  return { default: mockAxios }
});

// Global fetch mock
(globalThis as any).fetch = vi.fn()

// Reset all mocks after each test
afterEach(() => {
  vi.clearAllMocks()
})

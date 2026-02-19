import { ThemeProvider } from "@/components/theme-provider";
import { RouterProvider } from 'react-router-dom';
import { router } from '@/app/routes';
import { Toaster } from 'sonner';
import { TooltipProvider } from './components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfirmDialogProvider } from "./components/confirm-dialog";
import { ErrorBoundary } from "./components/ErrorBoundary";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
        },
    },
});

function AppHookContainer() {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider defaultTheme="dark" storageKey="nova-crm-theme">
                <TooltipProvider>
                    <ConfirmDialogProvider>
                        <ErrorBoundary>
                        <Toaster />
                        <RouterProvider router={router} />
                        </ErrorBoundary>
                    </ConfirmDialogProvider>
                </TooltipProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
}

export default AppHookContainer;
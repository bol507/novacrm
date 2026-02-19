import { Component, type ErrorInfo, type ReactNode} from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
    toast.error('Ha ocurrido un error inesperado. Por favor, recarga la página.');
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              Algo salió mal
            </h2>
            <p className="text-muted-foreground mb-4">
              Ha ocurrido un error inesperado. No te preocupes, esto no afecta tus datos.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={this.handleReset}
                className="w-full gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Recargar página
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.location.href = '/dashboard'}
              >
                Volver al inicio
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
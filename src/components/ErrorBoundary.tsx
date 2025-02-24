import { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);

    // Log to monitoring service (if available)
    if (process.env.NODE_ENV === 'production') {
      // TODO: Add your error monitoring service here
      // Example: Sentry.captureException(error);
    }

    // Show user-friendly toast
    toast.error('Something went wrong', {
      description: 'The application encountered an error. Please try again.',
      duration: 5000,
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="m-4">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Something went wrong
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-muted-foreground space-y-2">
              <p>
                {this.state.error?.message || 'An error occurred while loading this component'}
              </p>
              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={this.handleReset}
              >
                Try again
              </Button>
              <Button
                variant="ghost"
                onClick={() => window.location.href = '/dashboard'}
              >
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}


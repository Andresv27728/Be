import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center">
            <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>

            <h1 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">
              Algo salió mal
            </h1>

            <p className="text-slate-400 mb-8 text-sm leading-relaxed">
              Hubo un error al cargar la aplicación. Esto puede deberse a un problema temporal de conexión o un fallo en el sistema.
            </p>

            {this.state.error && (
              <div className="bg-slate-950 rounded-xl p-4 mb-8 text-left overflow-auto max-h-32 border border-slate-800">
                <code className="text-xs text-red-400 font-mono">
                  {this.state.error.toString()}
                </code>
              </div>
            )}

            <Button
              onClick={this.handleReset}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold h-12 shadow-lg shadow-teal-600/20"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              REINTENTAR CARGAR
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

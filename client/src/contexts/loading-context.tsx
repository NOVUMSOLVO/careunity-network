import { createContext, useContext, ReactNode } from "react";
import { useLoadingState } from "@/hooks/use-loading-state";
import { LoadingState, LoaderType } from "@/components/ui/loading-state";

interface LoadingContextType {
  loading: boolean;
  loadingMessage: string;
  loaderStyle: LoaderType;
  startLoading: (message?: string, type?: LoaderType) => void;
  stopLoading: () => void;
  updateLoadingMessage: (message: string) => void;
  updateLoaderType: (type: LoaderType) => void;
  withLoading: <T>(
    operation: () => Promise<T>,
    options?: {
      loadingMessage?: string;
      loaderType?: LoaderType;
      successMessage?: string;
    }
  ) => Promise<T>;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: ReactNode;
  initialLoadingState?: boolean;
  initialLoaderType?: LoaderType;
  initialLoadingMessage?: string;
}

export function LoadingProvider({
  children,
  initialLoadingState = false,
  initialLoaderType = "random",
  initialLoadingMessage = "Loading...",
}: LoadingProviderProps) {
  const loadingState = useLoadingState({
    initialState: initialLoadingState,
    loaderType: initialLoaderType,
    loadingText: initialLoadingMessage,
  });

  return (
    <LoadingContext.Provider value={loadingState}>
      {children}
      {loadingState.loading && (
        <LoadingState
          type={loadingState.loaderStyle}
          text={loadingState.loadingMessage}
          fullPage
        />
      )}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
}
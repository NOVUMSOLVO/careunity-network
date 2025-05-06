import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { LoaderType } from "@/components/ui/loading-state";

interface UseLoadingStateOptions {
  initialState?: boolean;
  loaderType?: LoaderType;
  loadingText?: string;
}

export function useLoadingState({
  initialState = false,
  loaderType = "random",
  loadingText = "Loading...",
}: UseLoadingStateOptions = {}) {
  const [loading, setLoading] = useState(initialState);
  const [loadingMessage, setLoadingMessage] = useState(loadingText);
  const [loaderStyle, setLoaderStyle] = useState<LoaderType>(loaderType);
  const { toast } = useToast();

  const startLoading = useCallback((message?: string, type?: LoaderType) => {
    setLoading(true);
    if (message) setLoadingMessage(message);
    if (type) setLoaderStyle(type);
  }, []);

  const stopLoading = useCallback(() => {
    setLoading(false);
  }, []);

  const updateLoadingMessage = useCallback((message: string) => {
    setLoadingMessage(message);
  }, []);

  const updateLoaderType = useCallback((type: LoaderType) => {
    setLoaderStyle(type);
  }, []);

  // A utility function that wraps an async operation with loading state
  const withLoading = useCallback(
    async <T>(
      operation: () => Promise<T>,
      options?: {
        loadingMessage?: string;
        loaderType?: LoaderType;
        successMessage?: string;
      }
    ): Promise<T> => {
      try {
        startLoading(
          options?.loadingMessage || loadingText,
          options?.loaderType || loaderType
        );
        const result = await operation();
        stopLoading();
        
        if (options?.successMessage) {
          toast({
            title: "Success",
            description: options.successMessage,
          });
        }
        
        return result;
      } catch (error) {
        stopLoading();
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "An unknown error occurred",
          variant: "destructive",
        });
        throw error;
      }
    },
    [loadingText, loaderType, startLoading, stopLoading, toast]
  );

  return {
    loading,
    loadingMessage,
    loaderStyle,
    startLoading,
    stopLoading,
    updateLoadingMessage,
    updateLoaderType,
    withLoading,
  };
}
import { useState, useCallback } from "react";
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
  const [loading, setLoading] = useState<boolean>(initialState);
  const [loadingMessage, setLoadingMessage] = useState<string>(loadingText);
  const [loaderStyle, setLoaderStyle] = useState<LoaderType>(loaderType);

  const startLoading = useCallback((message?: string, type?: LoaderType) => {
    setLoading(true);
    if (message) setLoadingMessage(message);
    if (type) setLoaderStyle(type);
  }, []);

  const stopLoading = useCallback(() => {
    setLoading(false);
    setLoadingMessage(loadingText);
  }, [loadingText]);

  const updateLoadingMessage = useCallback((message: string) => {
    setLoadingMessage(message);
  }, []);

  const updateLoaderType = useCallback((type: LoaderType) => {
    setLoaderStyle(type);
  }, []);

  const withLoading = useCallback(
    async <T,>(
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
          options?.loaderType || loaderStyle
        );
        const result = await operation();
        return result;
      } finally {
        stopLoading();
      }
    },
    [startLoading, stopLoading, loadingText, loaderStyle]
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
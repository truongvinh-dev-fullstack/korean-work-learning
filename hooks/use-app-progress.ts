import { useCallback, useState } from 'react';

import { appStorage, defaultProgress } from '@/storage/appStorage';
import type { AppProgress } from '@/types';

export function useAppProgress() {
  const [progress, setProgress] = useState<AppProgress>(defaultProgress);
  const [isLoading, setIsLoading] = useState(true);

  const loadProgress = useCallback(async () => {
    setIsLoading(true);

    try {
      const storedProgress = await appStorage.getProgress();
      setProgress(storedProgress);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    progress,
    isLoading,
    loadProgress,
    setProgress,
  };
}

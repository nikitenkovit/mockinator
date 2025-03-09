import { useEffect, useState } from 'react';

export const useErrorHandling = () => {
  const [error, setError] = useState<string | null>(null);

  // Слушаем сообщения об ошибках из background.ts
  useEffect(() => {
    const listener = (message: { action: string; error: string }) => {
      if (message.action === 'error') {
        setError(message.error);
      }
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => {
      chrome.runtime.onMessage.removeListener(listener);
    };
  }, []);

  return {
    error,
    setError,
  };
};

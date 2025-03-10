import { RulesState } from '@/types';
import { useEffect, useState } from 'react';

/**
 * Хук для управления состоянием расширения.
 * @param setError - Функция для установки ошибки.
 * @param rulesState - Состояние правил.
 * @returns Объект с состоянием и функцией для переключения состояния.
 */
export const useExtensionState = (
  setError: (error: string) => void,
  rulesState: RulesState,
) => {
  const [isExtensionActive, setIsExtensionActive] = useState(false);

  useEffect(() => {
    chrome.storage.local.get(['isExtensionActive'], (result) => {
      if (chrome.runtime.lastError) {
        setError(
          `Ошибка при загрузке состояния расширения: ${chrome.runtime.lastError.message}`,
        );
        return;
      }

      if (result.isExtensionActive !== undefined) {
        setIsExtensionActive(result.isExtensionActive);
      }
    });
  }, []);

  const toggleExtension = async () => {
    const newIsExtensionActive = !isExtensionActive;
    setIsExtensionActive(newIsExtensionActive);

    try {
      chrome.storage.local.set(
        { isExtensionActive: newIsExtensionActive },
        () => {
          if (chrome.runtime.lastError) {
            setError(
              `Ошибка при сохранении состояния расширения: ${chrome.runtime.lastError.message}`,
            );
            return;
          }

          chrome.runtime.sendMessage({
            action: newIsExtensionActive
              ? 'activateExtension'
              : 'deactivateExtension',
            rules: rulesState,
          });
        },
      );
    } catch (error) {
      setError(
        'Ошибка при обновлении состояния расширения: ' +
          (error as Error).message,
      );
    }
  };

  return {
    isExtensionActive,
    toggleExtension,
  };
};

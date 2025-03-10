import { ResponseSuccessTypeEnum, ResponseTypeEnum } from '@/constants';
import { Rule, RulesState } from '@/types';
import { useCallback, useEffect, useState } from 'react';

/**
 * Кастомный хук для управления правилами перехвата запросов.
 * Возвращает:
 * - rulesState: Состояние правил (entities и ruleIds).
 * - addRule: Функция для добавления нового правила.
 * - deleteRule: Функция для удаления правила.
 * - updateRule: Функция для обновления отдельного правила.
 * - resetState: Функция для сброса всех правил до начального состояния.
 * - importRules: Функция для импорта правил из файла.
 * - exportRules: Функция для экспорта правил в файл.
 */
export const useRules = (setError: (error: string) => void) => {
  const [rulesState, setRulesState] = useState<RulesState>({
    entities: {},
    ruleIds: [],
  });

  useEffect(() => {
    chrome.storage.local.get(['rules'], (result) => {
      if (result.rules) {
        setRulesState(result.rules);
      }
    });
  }, []);

  const updateRules = useCallback((newRulesState: RulesState) => {
    chrome.storage.local.set({ rules: newRulesState }, () => {
      if (chrome.runtime.lastError) {
        return;
      }

      chrome.runtime.sendMessage({
        action: 'updateRules',
        rules: newRulesState,
      });
    });
  }, []);

  const addRule = useCallback(() => {
    const newRule: Rule = {
      id: Date.now().toString(),
      name: '',
      method: 'GET',
      path: '',
      data: '{"title": "Пример JSON ответа"}',
      isActive: false,
      delay: 0,
      responseType: ResponseTypeEnum.Success,
      successResponseType: ResponseSuccessTypeEnum.JSON,
      errorResponse: JSON.stringify({
        error: 'Bad Request',
        message: 'Invalid data',
      }),
      redirectUrl: 'http://',
    };

    const newRulesState: RulesState = {
      entities: { ...rulesState.entities, [newRule.id]: newRule },
      ruleIds: [...rulesState.ruleIds, newRule.id],
    };

    setRulesState(newRulesState);
    updateRules(newRulesState);
  }, [rulesState, updateRules]);

  const deleteRule = useCallback(
    (id: string) => {
      const { [id]: _, ...remainingEntities } = rulesState.entities;
      const newRulesState: RulesState = {
        entities: remainingEntities,
        ruleIds: rulesState.ruleIds.filter((ruleId) => ruleId !== id),
      };

      setRulesState(newRulesState);
      updateRules(newRulesState);
    },
    [rulesState, updateRules],
  );

  const updateRule = useCallback(
    (
      id: string,
      field: keyof Rule | Partial<Rule>,
      value?: string | boolean | number,
    ) => {
      const updatedRule = {
        ...rulesState.entities[id],
        ...(typeof field !== 'object' ? { [field]: value } : field),
      };

      const newRulesState: RulesState = {
        entities: { ...rulesState.entities, [id]: updatedRule },
        ruleIds: rulesState.ruleIds,
      };

      setRulesState(newRulesState);
      updateRules(newRulesState);
    },
    [rulesState, updateRules],
  );

  const resetState = useCallback(() => {
    const newRulesState: RulesState = {
      entities: {},
      ruleIds: [],
    };

    setRulesState(newRulesState);
    updateRules(newRulesState);
  }, [updateRules]);

  const generateFileName = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `rules_${day}-${month}-${year}_${hours}-${minutes}-${seconds}.txt`;
  };

  const exportRules = useCallback(() => {
    try {
      const data = JSON.stringify(rulesState, null, 2);
      const blob = new Blob([data], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = generateFileName();
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setError('Ошибка при экспорте правил: ' + (error as Error).message);
    }
  }, [rulesState, setError]);

  const importRules = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const content = reader.result as string;
          const parsedRulesState = JSON.parse(content) as RulesState;
          setRulesState(parsedRulesState);
          updateRules(parsedRulesState);
        } catch (error) {
          setError('Ошибка при импорте правил: ' + (error as Error).message);
        }
      };
      reader.onerror = () => {
        setError('Ошибка при чтении файла: ' + reader.error?.message);
      };
      reader.readAsText(file);
    },
    [setError, updateRules],
  );

  return {
    rulesState,
    addRule,
    deleteRule,
    updateRule,
    resetState,
    importRules,
    exportRules,
  };
};

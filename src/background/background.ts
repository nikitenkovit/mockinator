import { Rule } from '../types';

// Эти enum дублируются из constants/response.ts, чтобы избежать проблем с импортом в Chrome Extensions.
// FIXMEL вернуться к решению с importScripts или перейти на другой подход.
enum ResponseTypeEnum {
  Success = 'SUCCESS',
  Error = 'ERROR',
  Redirect = 'REDIRECT',
}
enum ResponseSuccessTypeEnum {
  JSON = 'JSON',
  Text = 'Text',
  HTML = 'HTML',
  XML = 'XML',
}

let rules: Rule[] = [];

/*
 * Расширение глобального интерфейса Window для добавления кастомного свойства originalFetch.
 * Это свойство будет хранить оригинальную реализацию функции fetch.
 */
declare global {
  interface Window {
    originalFetch: typeof fetch;
  }
}

/*
 * Функция для переопределения глобальной функции fetch.
 * Перехватывает все fetch-запросы и возвращает mock-данные, если URL и метод запроса соответствуют одному из активных правил.
 * Если для правила указана задержка (delay), она будет применена перед возвратом mock-ответа.
 * Если выбран тип ответа "redirect", выполняется ручной редирект с использованием window.location.href.
 * @param rules - Массив правил для перехвата запросов.
 */
function overrideFetch(rules: Rule[]): void {
  if (!window.originalFetch) {
    window.originalFetch = window.fetch;
  }

  window.fetch = async (
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> => {
    const url =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.href
          : input.url;

    const method = init?.method || 'GET';

    for (const rule of rules) {
      if (
        rule.isActive &&
        rule.path &&
        url.includes(rule.path) &&
        rule.method === method
      ) {
        if (rule.delay && rule.delay > 0) {
          await new Promise((resolve) => setTimeout(resolve, rule.delay));
        }

        let status = 200;
        let headers: Record<string, string> = {};
        let body = rule.data || '{"title": "Пример JSON ответа"}';

        if (rule.responseType === ResponseTypeEnum.Error) {
          status = 400;
          body =
            rule.errorResponse ||
            JSON.stringify({ error: 'Bad Request', message: 'Invalid data' });
          headers['Content-Type'] = 'application/json';
        } else if (rule.responseType === ResponseTypeEnum.Redirect) {
          status = 301;
          headers['Location'] = rule.redirectUrl || 'http://';
        } else {
          switch (rule.successResponseType) {
            case ResponseSuccessTypeEnum.JSON:
              headers['Content-Type'] = 'application/json';
              break;
            case ResponseSuccessTypeEnum.Text:
              headers['Content-Type'] = 'text/plain';
              break;
            case ResponseSuccessTypeEnum.HTML:
              headers['Content-Type'] = 'text/html';
              break;
            case ResponseSuccessTypeEnum.XML:
              headers['Content-Type'] = 'application/xml';
              break;
            default:
              headers['Content-Type'] = 'application/json';
          }
        }

        return new Response(body, {
          status,
          headers,
        });
      }
    }

    return window.originalFetch(input, init);
  };
}

/*
 * Функция для восстановления оригинальной реализации fetch.
 * Используется при деактивации расширения.
 */
function restoreFetch(): void {
  if (window.originalFetch) {
    window.fetch = window.originalFetch;
  }
}

/*
 * Функция для внедрения скрипта в активную вкладку.
 * Внедряет функцию overrideFetch в контекст активной вкладки.
 * @param rules - Массив правил для перехвата запросов.
 * @param tabId - Идентификатор вкладки, в которую нужно внедрить скрипт.
 */
async function injectScript(rules: Rule[], tabId: number): Promise<void> {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: overrideFetch,
      args: [rules],
      world: 'MAIN',
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Неизвестная ошибка';

    chrome.runtime.sendMessage({
      action: 'error',
      error: `Ошибка при внедрении скрипта: ${errorMessage}`,
    });
  }
}

/*
 * Обработчик сообщений от popup.
 * Реагирует на сообщения с действиями: обновление правил, активация/деактивация расширения.
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateRules') {
    rules = message.rules;

    chrome.storage.local.set({ rules }, () => {
      if (chrome.runtime.lastError) {
        return;
      }

      chrome.storage.local.get(['isExtensionActive'], (result) => {
        if (result.isExtensionActive) {
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tabId = tabs[0]?.id;
            if (tabId) {
              injectScript(rules, tabId);
            }
          });
        }
      });
    });
  } else if (message.action === 'activateExtension') {
    chrome.storage.local.set({ isExtensionActive: true }, () => {
      if (chrome.runtime.lastError) {
        return;
      }

      // Устанавливаем активную иконку
      chrome.action.setIcon({
        path: {
          16: 'assets/icons/active/icon16.png',
          48: 'assets/icons/active/icon48.png',
          128: 'assets/icons/active/icon128.png',
        },
      });

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0]?.id;
        if (tabId) {
          injectScript(message.rules, tabId);
        }
      });
    });
  } else if (message.action === 'deactivateExtension') {
    chrome.storage.local.set({ isExtensionActive: false }, () => {
      if (chrome.runtime.lastError) {
        return;
      }

      // Устанавливаем неактивную иконку
      chrome.action.setIcon({
        path: {
          16: 'assets/icons/inactive/icon16.png',
          48: 'assets/icons/inactive/icon48.png',
          128: 'assets/icons/inactive/icon128.png',
        },
      });

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0]?.id;
        if (tabId) {
          chrome.scripting.executeScript({
            target: { tabId },
            func: restoreFetch,
            world: 'MAIN',
          });
        }
      });
    });
  }
});

/*
 * Обработчик события смены вкладки.
 * Деактивирует расширение при смене вкладки.
 */
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.storage.local.set({ isExtensionActive: false }, () => {
    // Устанавливаем неактивную иконку
    chrome.action.setIcon({
      path: {
        16: 'assets/icons/inactive/icon16.png',
        48: 'assets/icons/inactive/icon48.png',
        128: 'assets/icons/inactive/icon128.png',
      },
    });

    chrome.scripting.executeScript({
      target: { tabId: activeInfo.tabId },
      func: restoreFetch,
      world: 'MAIN',
    });
  });
});

/*
 * Обработчик события загрузки страницы.
 * Восстанавливает правила перехвата при загрузке новой страницы, если расширение активно.
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    chrome.storage.local.get(['rules', 'isExtensionActive'], (result) => {
      if (result.rules && result.isExtensionActive) {
        injectScript(result.rules, tabId);
      }
    });
  }
});

/*
 * Загрузка данных при старте расширения.
 * Восстанавливает правила и состояние расширения из хранилища.
 */
chrome.storage.local.get(['rules', 'isExtensionActive'], (result) => {
  if (chrome.runtime.lastError) {
    return;
  }

  if (result.rules) {
    rules = result.rules;
  }

  const isExtensionActive = result.isExtensionActive || false;

  if (isExtensionActive) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (tabId) {
        injectScript(rules, tabId);
      }
    });
  }
});

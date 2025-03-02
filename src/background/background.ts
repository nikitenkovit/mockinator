import { Rule } from '../types';

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
 * Перехватывает все fetch-запросы и возвращает mock-данные, если URL соответствует одному из активных правил.
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
		init?: RequestInit
	): Promise<Response> => {
		const url =
			typeof input === 'string'
				? input
				: input instanceof URL
				? input.href
				: input.url;

		for (const rule of rules) {
			if (rule.isActive && rule.path && url.includes(rule.path)) {
				if (rule.delay && rule.delay > 0) {
					await new Promise((resolve) => setTimeout(resolve, rule.delay));
				}

				let status = 200;
				let headers: Record<string, string> = {};
				let body = rule.data || '{"title": "Пример JSON ответа"}';

				switch (rule.successResponseType) {
					case 'json':
						headers['Content-Type'] = 'application/json';
						break;
					case 'text':
						headers['Content-Type'] = 'text/plain';
						break;
					case 'html':
						headers['Content-Type'] = 'text/html';
						break;
					case 'xml':
						headers['Content-Type'] = 'application/xml';
						break;
					default:
						headers['Content-Type'] = 'application/json';
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
	} else {
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
 * Функция для обновления иконки расширения.
 * Меняет иконку в зависимости от состояния расширения (активно/неактивно).
 * @param isExtensionActive - Флаг, указывающий, активно ли расширение.
 */
function updateIcon(isExtensionActive: boolean) {
	const iconPath = isExtensionActive
		? {
				16: 'assets/icons/active/icon16.png',
				48: 'assets/icons/active/icon48.png',
				128: 'assets/icons/active/icon128.png',
		  }
		: {
				16: 'assets/icons/inactive/icon16.png',
				48: 'assets/icons/inactive/icon48.png',
				128: 'assets/icons/inactive/icon128.png',
		  };

	// Устанавливаем новую иконку на расширение.
	chrome.action.setIcon({ path: iconPath });
}

/*
 * Обработчик сообщений от popup.
 * Реагирует на сообщения с действиями: обновление правил, активация/деактивация расширения.
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.action === 'updateRules') {
		// Обновляем правила и сохраняем их в хранилище.
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

			updateIcon(true);

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

			updateIcon(false);

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
 * Обработчик события перехода на другую вкладку.
 * Деактивирует расширение при смене вкладки.
 */
chrome.tabs.onActivated.addListener((activeInfo) => {
	chrome.storage.local.set({ isExtensionActive: false }, () => {
		updateIcon(false);
	});
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

	if (result.isExtensionActive !== undefined) {
		updateIcon(result.isExtensionActive);

		if (result.isExtensionActive) {
			chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
				const tabId = tabs[0]?.id;
				if (tabId) {
					injectScript(rules, tabId);
				}
			});
		}
	}
});

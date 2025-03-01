import { Rule } from '../types';

// Глобальный массив для хранения правил перехвата запросов.
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
	// Сохраняем оригинальную реализацию fetch, если она еще не сохранена.
	if (!window.originalFetch) {
		window.originalFetch = window.fetch;
	}

	// Переопределяем глобальную функцию fetch.
	window.fetch = async (
		input: RequestInfo | URL,
		init?: RequestInit
	): Promise<Response> => {
		// Получаем URL из входных данных.
		const url =
			typeof input === 'string'
				? input
				: input instanceof URL
				? input.href
				: input.url;

		// Проверяем все активные правила.
		for (const rule of rules) {
			if (rule.isActive && rule.path && url.includes(rule.path)) {
				// Задержка, если указана.
				if (rule.delay && rule.delay > 0) {
					await new Promise((resolve) => setTimeout(resolve, rule.delay));
				}

				// Определяем статус, заголовки и тело ответа.
				let status = 200;
				let headers: Record<string, string> = {
					'Content-Type': 'application/json',
				};
				let body = '';

				switch (rule.responseType) {
					case 'success':
						status = 200;
						body = rule.data || ''; // Используем data для успешного ответа.
						break;
					case 'error':
						status = 400; // Статус ошибки по умолчанию.
						body = rule.errorMessage || 'Bad Request'; // Используем errorMessage для ошибки.
						break;
					case 'redirect':
						status = 301;
						headers['Location'] = rule.redirectUrl || '/'; // По умолчанию '/', если URL не указан.
						body = ''; // Тело не нужно для редиректа.

						// Ручной редирект, если указан redirectUrl.
						if (rule.redirectUrl) {
							window.location.href = rule.redirectUrl;
							return new Response(null, { status: 301, headers });
						}
						break;
				}

				// Возвращаем mock-ответ.
				return new Response(body, {
					status,
					headers,
				});
			}
		}

		// Если правило не найдено, выполняем оригинальный fetch.
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
		// Внедряем скрипт с помощью chrome.scripting.executeScript.
		await chrome.scripting.executeScript({
			target: { tabId },
			func: overrideFetch,
			args: [rules],
			world: 'MAIN',
		});
	} catch (error) {
		// Преобразуем ошибку в строку и отправляем сообщение об ошибке в popup.
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

			// Внедряем скрипт в активную вкладку, если расширение активно.
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
		// Активируем расширение и обновляем иконку.
		chrome.storage.local.set({ isExtensionActive: true }, () => {
			if (chrome.runtime.lastError) {
				return;
			}

			updateIcon(true);

			// Внедряем скрипт в активную вкладку.
			chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
				const tabId = tabs[0]?.id;
				if (tabId) {
					injectScript(message.rules, tabId);
				}
			});
		});
	} else if (message.action === 'deactivateExtension') {
		// Деактивируем расширение и восстанавливаем оригинальный fetch.
		chrome.storage.local.set({ isExtensionActive: false }, () => {
			if (chrome.runtime.lastError) {
				return;
			}

			updateIcon(false);

			// Восстанавливаем оригинальный fetch в активной вкладке.
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
		// Обновляем иконку.
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

	// Восстанавливаем правила.
	if (result.rules) {
		rules = result.rules;
	}

	// Восстанавливаем состояние расширения.
	if (result.isExtensionActive !== undefined) {
		// Обновляем иконку.
		updateIcon(result.isExtensionActive);

		// Внедряем скрипт в активную вкладку, если расширение активно.
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

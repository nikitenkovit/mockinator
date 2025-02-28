console.log('Фоновый скрипт загружен.');

/*
 * Интерфейс для описания правил перехвата запросов.
 * Каждое правило содержит:
 * - id: Уникальный идентификатор правила.
 * - path: Часть URL, которую нужно перехватывать.
 * - data: Mock-данные, которые будут возвращены вместо реального ответа.
 * - isActive: Флаг, указывающий, активно ли правило.
 */
interface Rule {
	id: string;
	path: string;
	data: string;
	isActive: boolean;
}

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
 * @param rules - Массив правил для перехвата запросов.
 */
function overrideFetch(rules: Rule[]): void {
	console.log('Переопределение fetch начато.');

	// Сохраняем оригинальную реализацию fetch, если она еще не сохранена.
	if (!window.originalFetch) {
		window.originalFetch = window.fetch;
		console.log('Оригинальный fetch сохранен.');
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
		console.log('Обнаружен fetch-запрос:', url);

		// Проверяем все активные правила.
		for (const rule of rules) {
			if (rule.isActive && rule.path && url.includes(rule.path)) {
				console.log('Перехвачен запрос:', url);
				console.log('Возвращаем mock-данные:', rule.data);

				// Возвращаем mock-данные в виде Response.
				return new Response(rule.data, {
					status: 200,
					headers: { 'Content-Type': 'application/json' },
				});
			}
		}

		// Если правило не найдено, выполняем оригинальный fetch.
		console.log('Запрос не перехвачен, выполняется оригинальный fetch.');
		return window.originalFetch(input, init);
	};

	console.log('Перехват fetch-запросов активирован.');
}

/*
 * Функция для восстановления оригинальной реализации fetch.
 * Используется при деактивации расширения.
 */
function restoreFetch(): void {
	if (window.originalFetch) {
		window.fetch = window.originalFetch;
		console.log('Оригинальный fetch восстановлен.');
	} else {
		console.log('Оригинальный fetch не найден.');
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
		console.log('Попытка внедрения скрипта на вкладку:', tabId);

		// Внедряем скрипт с помощью chrome.scripting.executeScript.
		await chrome.scripting.executeScript({
			target: { tabId },
			func: overrideFetch,
			args: [rules],
			world: 'MAIN',
		});
		console.log('Скрипт успешно внедрен на вкладку:', tabId);
	} catch (error) {
		console.error('Ошибка при внедрении скрипта:', error);

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

	// Устанавливаем новую иконку.
	chrome.action.setIcon({ path: iconPath }, () => {
		if (chrome.runtime.lastError) {
			console.error(
				'Ошибка при обновлении иконки:',
				chrome.runtime.lastError.message
			);
		} else {
			console.log(
				'Иконка обновлена:',
				isExtensionActive ? 'активная' : 'неактивная'
			);
		}
	});
}

/*
 * Обработчик сообщений от popup.
 * Реагирует на сообщения с действиями: обновление правил, активация/деактивация расширения.
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	console.log('Получено сообщение:', message);

	if (message.action === 'updateRules') {
		// Обновляем правила и сохраняем их в хранилище.
		rules = message.rules;

		chrome.storage.local.set({ rules }, () => {
			if (chrome.runtime.lastError) {
				console.error(
					'Ошибка при сохранении правил:',
					chrome.runtime.lastError.message
				);
				return;
			}

			console.log('Правила сохранены:', rules);

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
				console.error(
					'Ошибка при сохранении состояния расширения:',
					chrome.runtime.lastError.message
				);
				return;
			}

			console.log('Расширение активировано.');

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
				console.error(
					'Ошибка при сохранении состояния расширения:',
					chrome.runtime.lastError.message
				);
				return;
			}

			console.log('Расширение деактивировано.');

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
		console.log('Переход на другую вкладку, расширение деактивировано.');

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
		console.error(
			'Ошибка при загрузке данных:',
			chrome.runtime.lastError.message
		);
		return;
	}

	// Восстанавливаем правила.
	if (result.rules) {
		rules = result.rules;
		console.log('Правила загружены из хранилища:', rules);
	}

	// Восстанавливаем состояние расширения.
	if (result.isExtensionActive !== undefined) {
		console.log('Состояние расширения загружено:', result.isExtensionActive);

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

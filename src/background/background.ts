console.log('Фоновый скрипт загружен.');

interface Rule {
	id: string;
	path: string;
	data: string;
	isActive: boolean;
}

let rules: Rule[] = [];

// Расширяем интерфейс Window для добавления кастомных свойств
declare global {
	interface Window {
		originalFetch: typeof fetch;
	}
}

// Функция для переопределения fetch
function overrideFetch(rules: Rule[]): void {
	console.log('Переопределение fetch начато.');

	if (!window.originalFetch) {
		window.originalFetch = window.fetch;
		console.log('Оригинальный fetch сохранен.');
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
		console.log('Обнаружен fetch-запрос:', url);

		// Проверяем все активные правила
		for (const rule of rules) {
			if (rule.isActive && rule.path && url.includes(rule.path)) {
				console.log('Перехвачен запрос:', url);
				console.log('Возвращаем mock-данные:', rule.data);
				return new Response(rule.data, {
					status: 200,
					headers: { 'Content-Type': 'application/json' },
				});
			}
		}

		console.log('Запрос не перехвачен, выполняется оригинальный fetch.');
		return window.originalFetch(input, init);
	};

	console.log('Перехват fetch-запросов активирован.');
}

// Функция для восстановления оригинального fetch
function restoreFetch(): void {
	if (window.originalFetch) {
		window.fetch = window.originalFetch;
		console.log('Оригинальный fetch восстановлен.');
	} else {
		console.log('Оригинальный fetch не найден.');
	}
}

// Внедрение скрипта в активную вкладку
async function injectScript(rules: Rule[], tabId: number): Promise<void> {
	try {
		console.log('Попытка внедрения скрипта на вкладку:', tabId);

		// Внедряем основной скрипт
		await chrome.scripting.executeScript({
			target: { tabId },
			func: overrideFetch,
			args: [rules],
			world: 'MAIN',
		});
		console.log('Скрипт успешно внедрен на вкладку:', tabId);
	} catch (error) {
		console.error('Ошибка при внедрении скрипта:', error);

		// Приводим error к типу Error и проверяем наличие свойства message
		const errorMessage =
			error instanceof Error ? error.message : 'Неизвестная ошибка';

		// Отправляем сообщение об ошибке в popup
		chrome.runtime.sendMessage({
			action: 'error',
			error: `Ошибка при внедрении скрипта: ${errorMessage}`,
		});
	}
}

// Обработка сообщений от popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	console.log('Получено сообщение:', message);

	if (message.action === 'updateRules') {
		rules = message.rules;

		// Сохраняем правила в хранилище
		chrome.storage.local.set({ rules }, () => {
			if (chrome.runtime.lastError) {
				console.error(
					'Ошибка при сохранении правил:',
					chrome.runtime.lastError.message
				);
				// Отправляем сообщение об ошибке в popup
				chrome.runtime.sendMessage({
					action: 'error',
					error: `Ошибка при сохранении правил: ${chrome.runtime.lastError.message}`,
				});
				return;
			}

			console.log('Правила сохранены:', rules);

			// Внедряем скрипт в активную вкладку, если расширение активно
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
				console.error(
					'Ошибка при сохранении состояния расширения:',
					chrome.runtime.lastError.message
				);
				// Отправляем сообщение об ошибке в popup
				chrome.runtime.sendMessage({
					action: 'error',
					error: `Ошибка при сохранении состояния расширения: ${chrome.runtime.lastError.message}`,
				});
				return;
			}

			console.log('Расширение активировано.');

			// Внедряем скрипт в активную вкладку
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
				console.error(
					'Ошибка при сохранении состояния расширения:',
					chrome.runtime.lastError.message
				);
				// Отправляем сообщение об ошибке в popup
				chrome.runtime.sendMessage({
					action: 'error',
					error: `Ошибка при сохранении состояния расширения: ${chrome.runtime.lastError.message}`,
				});
				return;
			}

			console.log('Расширение деактивировано.');

			// Восстанавливаем оригинальный fetch в активной вкладке
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

// Отслеживание перехода на другую вкладку
chrome.tabs.onActivated.addListener((activeInfo) => {
	chrome.storage.local.set({ isExtensionActive: false }, () => {
		console.log('Переход на другую вкладку, расширение деактивировано.');
	});
});

// Загрузка данных при старте
chrome.storage.local.get(['rules', 'isExtensionActive'], (result) => {
	if (chrome.runtime.lastError) {
		console.error(
			'Ошибка при загрузке данных:',
			chrome.runtime.lastError.message
		);
		// Отправляем сообщение об ошибке в popup
		chrome.runtime.sendMessage({
			action: 'error',
			error: `Ошибка при загрузке данных: ${chrome.runtime.lastError.message}`,
		});
		return;
	}

	if (result.rules) {
		rules = result.rules;
		console.log('Правила загружены из хранилища:', rules);
	}
});

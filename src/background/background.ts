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

// Внедрение скрипта в активную вкладку
async function injectScript(rules: Rule[], tabId: number): Promise<void> {
	try {
		await chrome.scripting.executeScript({
			target: { tabId },
			func: overrideFetch,
			args: [rules],
			world: 'MAIN',
		});
		console.log('Скрипт успешно внедрен на вкладку:', tabId);
	} catch (error) {
		console.error('Ошибка при внедрении скрипта:', error);
	}
}

// Обработка сообщений от popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	console.log('Получено сообщение:', message);

	if (message.action === 'updateRules') {
		rules = message.rules;

		// Сохраняем правила в хранилище
		chrome.storage.local.set({ rules }, () => {
			console.log('Правила сохранены:', rules);

			// Внедряем скрипт в активную вкладку
			chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
				const tabId = tabs[0]?.id;
				if (tabId) {
					injectScript(rules, tabId);
				}
			});
		});
	}
});

// Загрузка данных при старте
chrome.storage.local.get(['rules'], (result) => {
	if (result.rules) {
		rules = result.rules;
		console.log('Правила загружены из хранилища:', rules);

		// Внедряем скрипт в активную вкладку
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			const tabId = tabs[0]?.id;
			if (tabId) {
				injectScript(rules, tabId);
			}
		});
	}
});

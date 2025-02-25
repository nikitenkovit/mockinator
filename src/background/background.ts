console.log('Фоновый скрипт загружен.');

// Состояние перехвата
let isActive = false;
let mockPath = '';
let mockData = '';

// Расширяем интерфейс Window для добавления кастомных свойств
declare global {
	interface Window {
		originalFetch: typeof fetch;
	}
}

// Функция для переопределения fetch
function overrideFetch(mockPath: string, mockData: string) {
	console.log('Переопределение fetch начато.');

	if (!window.originalFetch) {
		window.originalFetch = window.fetch;
		console.log('Оригинальный fetch сохранен.');
	}

	window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
		const url =
			typeof input === 'string'
				? input
				: input instanceof URL
				? input.href
				: input.url;
		console.log('Обнаружен fetch-запрос:', url);

		if (mockPath && url.includes(mockPath)) {
			console.log('Перехвачен запрос:', url);
			console.log('Возвращаем mock-данные:', mockData);
			return new Response(mockData, {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		console.log('Запрос не перехвачен, выполняется оригинальный fetch.');
		return window.originalFetch(input, init);
	};

	console.log('Перехват fetch-запросов активирован.');
}

// Функция для восстановления оригинального fetch
function restoreFetch() {
	if (window.originalFetch) {
		window.fetch = window.originalFetch;
		console.log('Оригинальный fetch восстановлен.');
	} else {
		console.log('Оригинальный fetch не найден.');
	}
}

// Обработка сообщений от popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	console.log('Получено сообщение:', message);

	if (message.action === 'activate') {
		isActive = true;
		mockPath = message.path;
		mockData = message.data;

		// Сохраняем данные в хранилище
		chrome.storage.local.set({ isActive, mockPath, mockData }, () => {
			console.log('Данные сохранены:', { isActive, mockPath, mockData });

			// Внедряем скрипт перехвата в активную вкладку
			chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
				if (tabs[0]?.id) {
					chrome.scripting.executeScript({
						target: { tabId: tabs[0].id },
						func: overrideFetch,
						args: [mockPath, mockData],
						world: 'MAIN',
					});
				}
			});
		});
	} else if (message.action === 'deactivate') {
		isActive = false;
		mockPath = '';
		mockData = '';

		// Сохраняем данные в хранилище
		chrome.storage.local.set({ isActive, mockPath, mockData }, () => {
			console.log('Данные сохранены:', { isActive, mockPath, mockData });

			// Восстанавливаем оригинальный fetch в активной вкладке
			chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
				if (tabs[0]?.id) {
					chrome.scripting.executeScript({
						target: { tabId: tabs[0].id },
						func: restoreFetch,
						world: 'MAIN',
					});
				}
			});
		});
	}
});

// Загрузка данных при старте
chrome.storage.local.get(['path', 'data', 'isActive'], (result) => {
	mockPath = result.path || '';
	mockData = result.data || '';
	isActive = result.isActive || false;
	console.log('Данные загружены из хранилища:', {
		mockPath,
		mockData,
		isActive,
	});

	if (isActive) {
		injectContentScriptWithRetry(mockPath, mockData);
	}
});

// Внедрение скрипта с активацией вкладки
async function injectContentScriptWithRetry(
	mockPath: string,
	mockData: string
) {
	try {
		const [tab] = await chrome.tabs.query({
			active: true,
			currentWindow: true,
		});
		if (tab) {
			// "Будим" вкладку, выполняя простой скрипт
			await wakeUpTab(tab.id);
			await injectScript(mockPath, mockData, tab.id);
		} else {
			console.error('Активная вкладка не найдена.');
		}
	} catch (error) {
		console.error('Ошибка при поиске активной вкладки:', error);
	}
}

// Функция для "пробуждения" вкладки
async function wakeUpTab(tabId: number) {
	try {
		await chrome.scripting.executeScript({
			target: { tabId },
			func: () => {
				console.log('Вкладка активирована.');
			},
			world: 'MAIN',
		});
		console.log('Вкладка успешно активирована.');
	} catch (error) {
		console.error('Ошибка при активации вкладки:', error);
	}
}

// Внедрение основного скрипта
async function injectScript(mockPath: string, mockData: string, tabId: number) {
	try {
		await chrome.scripting.executeScript({
			target: { tabId },
			func: overrideFetch,
			args: [mockPath, mockData],
			world: 'MAIN',
		});
		console.log('Скрипт успешно внедрен на вкладку:', tabId);
	} catch (error) {
		console.error('Ошибка при внедрении скрипта:', error);
	}
}

// Функция для восстановления оригинального fetch
async function restoreOriginalFetch() {
	try {
		const [tab] = await chrome.tabs.query({
			active: true,
			currentWindow: true,
		});
		if (tab) {
			await chrome.scripting.executeScript({
				target: { tabId: tab.id },
				func: restoreFetch,
				world: 'MAIN',
			});
			console.log('Оригинальный fetch восстановлен.');
		} else {
			console.error('Активная вкладка не найдена.');
		}
	} catch (error) {
		console.error('Ошибка при восстановлении оригинального fetch:', error);
	}
}

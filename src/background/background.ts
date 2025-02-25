console.log('Фоновый скрипт загружен.');

// Состояние перехвата
interface InterceptState {
	isActive: boolean;
	mockPath: string;
	mockData: string;
}

let interceptState: InterceptState = {
	isActive: false,
	mockPath: '',
	mockData: '',
};

// Расширяем интерфейс Window для добавления кастомных свойств
declare global {
	interface Window {
		originalFetch: typeof fetch;
	}
}

// Функция для переопределения fetch
function overrideFetch(mockPath: string, mockData: string): void {
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
function restoreFetch(): void {
	if (window.originalFetch) {
		window.fetch = window.originalFetch;
		console.log('Оригинальный fetch восстановлен.');
	} else {
		console.log('Оригинальный fetch не найден.');
	}
}

// Внедрение скрипта в активную вкладку
async function injectScript(
	mockPath: string,
	mockData: string,
	tabId: number
): Promise<void> {
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

// Восстановление оригинального fetch в активной вкладке
async function restoreOriginalFetch(tabId: number): Promise<void> {
	try {
		await chrome.scripting.executeScript({
			target: { tabId },
			func: restoreFetch,
			world: 'MAIN',
		});
		console.log('Оригинальный fetch восстановлен.');
	} catch (error) {
		console.error('Ошибка при восстановлении оригинального fetch:', error);
	}
}

// Обработка сообщений от popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	console.log('Получено сообщение:', message);

	if (message.action === 'activate' || message.action === 'deactivate') {
		interceptState.isActive = message.action === 'activate';
		interceptState.mockPath = message.path || '';
		interceptState.mockData = message.data || '';

		// Сохраняем данные в хранилище
		chrome.storage.local.set({ ...interceptState }, () => {
			console.log('Данные сохранены:', interceptState);

			// Внедряем или восстанавливаем скрипт в активной вкладке
			chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
				const tabId = tabs[0]?.id;
				if (tabId) {
					if (interceptState.isActive) {
						injectScript(
							interceptState.mockPath,
							interceptState.mockData,
							tabId
						);
					} else {
						restoreOriginalFetch(tabId);
					}
				}
			});
		});
	}
});

// Загрузка данных при старте
chrome.storage.local.get(['isActive', 'path', 'data'], (result) => {
	interceptState = {
		isActive: result.isActive || false,
		mockPath: result.path || '',
		mockData: result.data || '',
	};
	console.log('Данные загружены из хранилища:', interceptState);

	if (interceptState.isActive) {
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			const tabId = tabs[0]?.id;
			if (tabId) {
				injectScript(interceptState.mockPath, interceptState.mockData, tabId);
			}
		});
	}
});

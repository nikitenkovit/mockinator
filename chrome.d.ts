declare global {
	interface ChromeStorage {
		local: {
			get(
				keys: string | string[] | null,
				callback: (items: { [key: string]: any }) => void
			): void;
			set(items: { [key: string]: any }, callback?: () => void): void;
			remove(keys: string | string[], callback?: () => void): void;
			clear(callback?: () => void): void;
		};
	}

	interface ChromeRuntime {
		onMessage: {
			addListener(
				callback: (
					message: any,
					sender: any,
					sendResponse: (response?: any) => void
				) => void
			): void;
			removeListener(
				callback: (
					message: any,
					sender: any,
					sendResponse: (response?: any) => void
				) => void
			): void;
		};
		sendMessage(message: any, callback?: (response: any) => void): void;
		lastError?: { message: string };
	}

	interface ChromeTabs {
		query(
			queryInfo: { active?: boolean; currentWindow?: boolean },
			callback: (tabs: any[]) => void
		): void;
		onActivated: {
			addListener(
				callback: (activeInfo: { tabId: number; windowId: number }) => void
			): void;
		};
	}

	interface ChromeScripting {
		executeScript(
			details: {
				target: { tabId: number };
				func: Function;
				args?: any[];
				world?: 'MAIN' | 'ISOLATED';
			},
			callback?: (result: any[]) => void
		): void;
	}

	interface ChromeAction {
		setIcon(
			details: { path: string | { [key: number]: string } },
			callback?: () => void
		): void;
	}

	interface Chrome {
		storage: ChromeStorage;
		runtime: ChromeRuntime;
		tabs: ChromeTabs;
		scripting: ChromeScripting;
		action: ChromeAction;
	}

	const chrome: Chrome;
}

export {};

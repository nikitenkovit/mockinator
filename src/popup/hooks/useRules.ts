import { useCallback, useEffect, useState } from 'react';
import { Rule } from '../../types';

/*
 * Кастомный хук для управления правилами перехвата запросов.
 * Возвращает:
 * - rules: Массив правил.
 * - addRule: Функция для добавления нового правила.
 * - deleteRule: Функция для удаления правила.
 * - updateRule: Функция для обновления отдельного правила.
 * - clearRuleFields: Функция для очистки полей ввода для конкретного правила.
 * - resetState: Функция для сброса всех правил до начального состояния.
 * - importRules: Функция для импорта правил из файла.
 * - exportRules: Функция для экспорта правил в файл.
 */
const useRules = (setError: (error: string) => void) => {
	const [rules, setRules] = useState<Rule[]>([
		{
			id: Date.now().toString(),
			name: '', // Новое поле для названия правила
			method: 'GET',
			path: '',
			data: '{"title": "Пример JSON ответа"}',
			isActive: false,
			delay: 0,
			responseType: 'success' as const,
			successResponseType: 'json' as const,
			errorResponse: JSON.stringify({
				error: 'Bad Request',
				message: 'Invalid data',
			}),
			redirectUrl: 'http://',
		},
	]);

	useEffect(() => {
		chrome.storage.local.get(['rules'], (result) => {
			if (result.rules) {
				setRules(result.rules);
			}
		});
	}, []);

	const updateRules = useCallback((newRules: Rule[]) => {
		chrome.storage.local.set({ rules: newRules }, () => {
			if (chrome.runtime.lastError) {
				return;
			}

			chrome.runtime.sendMessage({ action: 'updateRules', rules: newRules });
		});
	}, []);

	const addRule = useCallback(() => {
		const newRule: Rule = {
			id: Date.now().toString(),
			name: '', // Новое поле для названия правила
			method: 'GET',
			path: '',
			data: '{"title": "Пример JSON ответа"}',
			isActive: false,
			delay: 0,
			responseType: 'success' as const,
			successResponseType: 'json' as const,
			errorResponse: JSON.stringify({
				error: 'Bad Request',
				message: 'Invalid data',
			}),
			redirectUrl: 'http://',
		};
		const newRules = [...rules, newRule];
		setRules(newRules);
		updateRules(newRules);
	}, [rules, updateRules]);

	const deleteRule = useCallback(
		(id: string) => {
			const newRules = rules.filter((rule) => rule.id !== id);
			setRules(newRules);
			updateRules(newRules);
		},
		[rules, updateRules]
	);

	const updateRule = useCallback(
		(
			id: string,
			field: keyof Rule | Partial<Rule>,
			value?: string | boolean | number
		) => {
			const newRules = rules.map((rule) =>
				rule.id === id
					? typeof field !== 'object'
						? { ...rule, [field]: value }
						: { ...rule, ...field }
					: rule
			);
			setRules(newRules);
			updateRules(newRules);
		},
		[rules, updateRules]
	);

	const clearRuleFields = useCallback(
		(id: string) => {
			const newRules = rules.map((rule) =>
				rule.id === id
					? {
							...rule,
							name: '', // Очищаем название правила
							method: 'GET',
							path: '',
							data: '{"title": "Пример JSON ответа"}',
							delay: 0,
							isActive: false,
							responseType: 'success' as const,
							successResponseType: 'json' as const,
							errorResponse: JSON.stringify({
								error: 'Bad Request',
								message: 'Invalid data',
							}),
							redirectUrl: 'http://',
					  }
					: rule
			);
			setRules(newRules);
			updateRules(newRules);
		},
		[rules, updateRules]
	);

	const resetState = useCallback(() => {
		const initialRule: Rule = {
			id: Date.now().toString(),
			name: '', // Новое поле для названия правила
			method: 'GET',
			path: '',
			data: '{"title": "Пример JSON ответа"}',
			isActive: false,
			delay: 0,
			responseType: 'success' as const,
			successResponseType: 'json' as const,
			errorResponse: JSON.stringify({
				error: 'Bad Request',
				message: 'Invalid data',
			}),
			redirectUrl: 'http://',
		};
		setRules([initialRule]);
		updateRules([initialRule]);
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
			const data = JSON.stringify(rules, null, 2);
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
	}, [rules, setError]);

	const importRules = useCallback(
		(file: File) => {
			const reader = new FileReader();
			reader.onload = () => {
				try {
					const content = reader.result as string;
					const parsedRules = JSON.parse(content) as Rule[];
					setRules(parsedRules);
					updateRules(parsedRules);
				} catch (error) {
					setError('Ошибка при импорте правил: ' + (error as Error).message);
				}
			};
			reader.onerror = () => {
				setError('Ошибка при чтении файла: ' + reader.error?.message);
			};
			reader.readAsText(file);
		},
		[setError, updateRules]
	);

	return {
		rules,
		addRule,
		deleteRule,
		updateRule,
		clearRuleFields,
		resetState,
		importRules,
		exportRules,
	};
};

export default useRules;

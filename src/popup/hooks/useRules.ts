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
 */
const useRules = () => {
	const [rules, setRules] = useState<Rule[]>([
		{
			id: Date.now().toString(),
			method: 'GET',
			path: '',
			data: '{"title": "Пример JSON ответа"}',
			isActive: false,
			delay: 0,
			responseType: 'success' as const,
			successResponseType: 'json' as const,
			errorMessage: 'Bad Request',
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
			method: 'GET',
			path: '',
			data: '{"title": "Пример JSON ответа"}',
			isActive: false,
			delay: 0,
			responseType: 'success' as const,
			successResponseType: 'json' as const,
			errorMessage: 'Bad Request',
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
							method: 'GET',
							path: '',
							data: '{"title": "Пример JSON ответа"}',
							delay: 0,
							isActive: false,
							responseType: 'success' as const,
							successResponseType: 'json' as const,
							errorMessage: 'Bad Request',
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
			method: 'GET',
			path: '',
			data: '{"title": "Пример JSON ответа"}',
			isActive: false,
			delay: 0,
			responseType: 'success' as const,
			successResponseType: 'json' as const,
			errorMessage: 'Bad Request',
			redirectUrl: 'http://',
		};
		setRules([initialRule]);
		updateRules([initialRule]);
	}, [updateRules]);

	return {
		rules,
		addRule,
		deleteRule,
		updateRule,
		clearRuleFields,
		resetState,
	};
};

export default useRules;

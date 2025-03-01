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
			path: '',
			data: '',
			isActive: false,
			delay: 0,
			responseType: 'success',
			errorMessage: 'Bad Request',
			redirectUrl: 'http://',
		},
	]);

	// Загрузка правил из хранилища при монтировании компонента
	useEffect(() => {
		chrome.storage.local.get(['rules'], (result) => {
			if (result.rules && result.rules.length > 0) {
				setRules(result.rules);
			}
		});
	}, []);

	// Обновление правил в хранилище
	const updateRules = useCallback((newRules: Rule[]) => {
		chrome.storage.local.set({ rules: newRules }, () => {
			if (chrome.runtime.lastError) {
				return;
			}

			chrome.runtime.sendMessage({ action: 'updateRules', rules: newRules });
		});
	}, []);

	// Добавление нового правила
	const addRule = useCallback(() => {
		const newRule: Rule = {
			id: Date.now().toString(),
			path: '',
			data: '',
			isActive: false,
			delay: 0,
			responseType: 'success',
			errorMessage: 'Bad Request',
			redirectUrl: 'http://',
		};
		const newRules = [...rules, newRule];
		setRules(newRules);
		updateRules(newRules);
	}, [rules, updateRules]);

	// Удаление правила
	const deleteRule = useCallback(
		(id: string) => {
			const newRules = rules.filter((rule) => rule.id !== id);
			setRules(newRules);
			updateRules(newRules);
		},
		[rules, updateRules]
	);

	// Обновление отдельного правила
	const updateRule = useCallback(
		(id: string, field: keyof Rule, value: string | boolean | number) => {
			const newRules = rules.map((rule) =>
				rule.id === id ? { ...rule, [field]: value } : rule
			);
			setRules(newRules);
			updateRules(newRules);
		},
		[rules, updateRules]
	);

	// Очистка полей ввода для конкретного правила
	const clearRuleFields = useCallback(
		(id: string) => {
			const newRules = rules.map((rule) =>
				rule.id === id
					? {
							...rule,
							path: '',
							data: '',
							delay: 0,
							isActive: false,
							responseType: 'success' as const,
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

	// Сброс всего состояния до первоначального
	const resetState = useCallback(() => {
		const initialRule: Rule = {
			id: Date.now().toString(),
			path: '',
			data: '',
			isActive: false,
			delay: 0,
			responseType: 'success',
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

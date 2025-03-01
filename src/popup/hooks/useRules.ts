import { useCallback, useEffect, useState } from 'react';

/*
 * Интерфейс для описания правил перехвата запросов.
 * Каждое правило содержит:
 * - id: Уникальный идентификатор правила.
 * - path: Часть URL, которую нужно перехватывать.
 * - data: Mock-данные, которые будут возвращены вместо реального ответа (необязательное поле).
 * - isActive: Флаг, указывающий, активно ли правило.
 * - delay: Задержка в миллисекундах перед возвратом mock-ответа (необязательное поле).
 * - responseType: Тип ответа (success, error, redirect).
 * - errorMessage: Текст ошибки.
 * - redirectUrl: URL для редиректа.
 */
interface Rule {
	id: string;
	path: string;
	data?: string;
	isActive: boolean;
	delay?: number;
	responseType: 'success' | 'error' | 'redirect';
	errorMessage?: string;
	redirectUrl?: string;
}

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
				console.error(
					'Ошибка при сохранении правил:',
					chrome.runtime.lastError.message
				);
				return;
			}

			console.log('Правила обновлены:', newRules);
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

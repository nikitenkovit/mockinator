import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import Rule from './Rule';

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

const Popup: React.FC = () => {
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
	const [isExtensionActive, setIsExtensionActive] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Загрузка данных при открытии popup
	useEffect(() => {
		chrome.storage.local.get(['rules', 'isExtensionActive'], (result) => {
			if (chrome.runtime.lastError) {
				setError(
					`Ошибка при загрузке данных: ${chrome.runtime.lastError.message}`
				);
				return;
			}

			if (result.rules && result.rules.length > 0) {
				setRules(result.rules);
			}
			if (result.isExtensionActive !== undefined) {
				setIsExtensionActive(result.isExtensionActive);
			}
		});

		// Слушаем сообщения об ошибках из background.ts
		chrome.runtime.onMessage.addListener((message) => {
			if (message.action === 'error') {
				setError(message.error);
			}
		});
	}, []);

	// Обновление правил в хранилище
	const updateRules = (newRules: Rule[]) => {
		chrome.storage.local.set({ rules: newRules }, () => {
			if (chrome.runtime.lastError) {
				setError(
					`Ошибка при сохранении правил: ${chrome.runtime.lastError.message}`
				);
				return;
			}

			console.log('Правила обновлены:', newRules);
			chrome.runtime.sendMessage({ action: 'updateRules', rules: newRules });
		});
	};

	// Добавление нового правила
	const addRule = () => {
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
	};

	// Удаление правила
	const deleteRule = (id: string) => {
		const newRules = rules.filter((rule) => rule.id !== id);
		setRules(newRules);
		updateRules(newRules);
	};

	// Обновление отдельного правила
	const updateRule = (
		id: string,
		field: keyof Rule,
		value: string | boolean | number
	) => {
		const newRules = rules.map((rule) =>
			rule.id === id ? { ...rule, [field]: value } : rule
		);
		setRules(newRules);
		updateRules(newRules);
	};

	// Очистка полей ввода для конкретного правила
	const clearRuleFields = (id: string) => {
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
	};

	// Сброс всего состояния до первоначального
	const resetState = () => {
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
	};

	// Переключение состояния расширения
	const toggleExtension = () => {
		const newIsExtensionActive = !isExtensionActive;
		setIsExtensionActive(newIsExtensionActive);

		// Сохраняем состояние расширения в хранилище
		chrome.storage.local.set(
			{ isExtensionActive: newIsExtensionActive },
			() => {
				if (chrome.runtime.lastError) {
					setError(
						`Ошибка при сохранении состояния расширения: ${chrome.runtime.lastError.message}`
					);
					return;
				}

				console.log('Состояние расширения обновлено:', newIsExtensionActive);

				// Отправляем сообщение в фоновый скрипт
				chrome.runtime.sendMessage({
					action: newIsExtensionActive
						? 'activateExtension'
						: 'deactivateExtension',
					rules,
				});
			}
		);
	};

	return (
		<div>
			<h1>Mockinator</h1>
			<p>Перехват fetch-запросов и возврат mock-данных.</p>

			{/* Отображение ошибки */}
			{error && (
				<div style={{ color: 'red', marginBottom: '10px' }}>
					Ошибка: {error}
				</div>
			)}

			{/* Чекбокс для активации/деактивации расширения */}
			<label>
				Активировать расширение:
				<input
					type="checkbox"
					checked={isExtensionActive}
					onChange={toggleExtension}
				/>
			</label>

			<ul style={{ listStyle: 'none', padding: 0 }}>
				{rules.map((rule) => (
					<Rule
						key={rule.id}
						rule={rule}
						isExtensionActive={isExtensionActive}
						updateRule={updateRule}
						clearRuleFields={clearRuleFields}
						deleteRule={deleteRule}
						rulesCount={rules.length}
					/>
				))}
			</ul>

			<button onClick={addRule} disabled={!isExtensionActive}>
				Add Rule
			</button>
			<button onClick={resetState} disabled={!isExtensionActive}>
				Reset State
			</button>
		</div>
	);
};

const root = ReactDOM.createRoot(
	document.getElementById('root') as HTMLElement
);
root.render(<Popup />);

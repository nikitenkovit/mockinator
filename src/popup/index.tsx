import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';

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
				{rules.map((rule, index) => (
					<li key={rule.id} style={{ marginBottom: '10px' }}>
						<label>
							PATH:
							<input
								type="text"
								value={rule.path}
								onChange={(e) => updateRule(rule.id, 'path', e.target.value)}
								placeholder="Введите часть пути URL"
								disabled={!isExtensionActive}
							/>
						</label>

						{rule.responseType === 'success' && (
							<label>
								DATA:
								<textarea
									value={rule.data || ''}
									onChange={(e) => updateRule(rule.id, 'data', e.target.value)}
									placeholder="Введите mock-данные"
									disabled={!isExtensionActive}
								/>
							</label>
						)}

						<label>
							Задержка (мс):
							<input
								type="number"
								value={rule.delay || 0}
								onChange={(e) =>
									updateRule(rule.id, 'delay', parseInt(e.target.value, 10))
								}
								placeholder="Задержка в миллисекундах"
								min="0"
								disabled={!isExtensionActive}
							/>
						</label>

						<label>
							Тип ответа:
							<select
								value={rule.responseType}
								onChange={(e) =>
									updateRule(rule.id, 'responseType', e.target.value)
								}
								disabled={!isExtensionActive}
							>
								<option value="success">Успешный ответ (200)</option>
								<option value="error">Ошибка (400)</option>
								<option value="redirect">Редирект (301/302)</option>
							</select>
						</label>

						{rule.responseType === 'error' && (
							<div>
								<label>
									Текст ошибки:
									<textarea
										value={rule.errorMessage || 'Bad Request'}
										onChange={(e) =>
											updateRule(rule.id, 'errorMessage', e.target.value)
										}
										placeholder="Текст ошибки (например, Bad Request)"
										disabled={!isExtensionActive}
									/>
								</label>
							</div>
						)}

						{rule.responseType === 'redirect' && (
							<div>
								<label>
									URL для редиректа:
									<input
										type="text"
										value={rule.redirectUrl || 'http://'}
										onChange={(e) =>
											updateRule(rule.id, 'redirectUrl', e.target.value)
										}
										placeholder="URL для редиректа"
										disabled={!isExtensionActive}
									/>
								</label>
							</div>
						)}

						{/* Кнопка "Активировать перехват" */}
						<label>
							Активировать перехват:
							<input
								type="checkbox"
								checked={rule.isActive}
								onChange={(e) =>
									updateRule(rule.id, 'isActive', e.target.checked)
								}
								disabled={!isExtensionActive}
							/>
						</label>

						{/* Кнопка для очистки полей ввода */}
						<button
							onClick={() => clearRuleFields(rule.id)}
							disabled={!isExtensionActive}
						>
							Clear Fields
						</button>

						{/* Кнопка "Delete Rule" отображается, если это не последний элемент */}
						{rules.length > 1 && (
							<button
								onClick={() => deleteRule(rule.id)}
								disabled={!isExtensionActive}
							>
								Delete Rule
							</button>
						)}
					</li>
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

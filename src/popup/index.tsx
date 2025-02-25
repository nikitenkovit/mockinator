import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';

interface Rule {
	id: string;
	path: string;
	data: string;
	isActive: boolean;
}

const Popup: React.FC = () => {
	const [rules, setRules] = useState<Rule[]>([
		{ id: Date.now().toString(), path: '', data: '', isActive: false },
	]);
	const [isExtensionActive, setIsExtensionActive] = useState(false); // Состояние расширения (включено/выключено)

	// Загрузка данных при открытии popup
	useEffect(() => {
		chrome.storage.local.get(['rules', 'isExtensionActive'], (result) => {
			if (result.rules && result.rules.length > 0) {
				setRules(result.rules);
			}
			if (result.isExtensionActive !== undefined) {
				setIsExtensionActive(result.isExtensionActive);
			}
		});
	}, []);

	// Обновление правил в хранилище
	const updateRules = (newRules: Rule[]) => {
		chrome.storage.local.set({ rules: newRules }, () => {
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
		value: string | boolean
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
			rule.id === id ? { ...rule, path: '', data: '', isActive: false } : rule
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
								disabled={!isExtensionActive} // Блокировка, если расширение выключено
							/>
						</label>

						<label>
							DATA:
							<textarea
								value={rule.data}
								onChange={(e) => updateRule(rule.id, 'data', e.target.value)}
								placeholder="Введите mock-данные"
								disabled={!isExtensionActive} // Блокировка, если расширение выключено
							/>
						</label>

						<label>
							Активировать перехват:
							<input
								type="checkbox"
								checked={rule.isActive}
								onChange={(e) =>
									updateRule(rule.id, 'isActive', e.target.checked)
								}
								disabled={!isExtensionActive} // Блокировка, если расширение выключено
							/>
						</label>

						{/* Кнопка для очистки полей ввода */}
						<button
							onClick={() => clearRuleFields(rule.id)}
							disabled={!isExtensionActive} // Блокировка, если расширение выключено
						>
							Clear Fields
						</button>

						{/* Кнопка "Delete Rule" отображается, если это не последний элемент */}
						{rules.length > 1 && (
							<button
								onClick={() => deleteRule(rule.id)}
								disabled={!isExtensionActive} // Блокировка, если расширение выключено
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

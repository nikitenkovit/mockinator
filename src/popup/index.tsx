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

	// Загрузка данных при открытии popup
	useEffect(() => {
		chrome.storage.local.get(['rules'], (result) => {
			if (result.rules && result.rules.length > 0) {
				setRules(result.rules);
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

	return (
		<div>
			<h1>Mockinator</h1>
			<p>Перехват fetch-запросов и возврат mock-данных.</p>

			<ul style={{ listStyle: 'none', padding: 0 }}>
				{rules.map((rule) => (
					<li key={rule.id} style={{ marginBottom: '10px' }}>
						<label>
							PATH:
							<input
								type="text"
								value={rule.path}
								onChange={(e) => updateRule(rule.id, 'path', e.target.value)}
								placeholder="Введите часть пути URL"
							/>
						</label>

						<label>
							DATA:
							<textarea
								value={rule.data}
								onChange={(e) => updateRule(rule.id, 'data', e.target.value)}
								placeholder="Введите mock-данные"
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
							/>
						</label>

						{/* Кнопка "Delete Rule" отображается, если это не последний элемент */}
						{rules.length > 1 && (
							<button onClick={() => deleteRule(rule.id)}>Delete Rule</button>
						)}
					</li>
				))}
			</ul>

			<button onClick={addRule}>Add Rule</button>
		</div>
	);
};

const root = ReactDOM.createRoot(
	document.getElementById('root') as HTMLElement
);
root.render(<Popup />);

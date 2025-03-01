import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import Rule from './Rule';
import { useRules } from './hooks';

const Popup: React.FC = () => {
	const [isExtensionActive, setIsExtensionActive] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const {
		rules,
		addRule,
		deleteRule,
		updateRule,
		clearRuleFields,
		resetState,
	} = useRules();

	// Загрузка данных при открытии popup
	useEffect(() => {
		chrome.storage.local.get(['rules', 'isExtensionActive'], (result) => {
			if (chrome.runtime.lastError) {
				setError(
					`Ошибка при загрузке данных: ${chrome.runtime.lastError.message}`
				);
				return;
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

import React from 'react';
import ReactDOM from 'react-dom/client';
import Rule from './Rule';
import { useErrorHandling, useExtensionState, useRules } from './hooks';

const Popup: React.FC = () => {
	const { error, setError } = useErrorHandling();
	const {
		rules,
		addRule,
		deleteRule,
		updateRule,
		clearRuleFields,
		resetState,
	} = useRules();
	const { isExtensionActive, toggleExtension } = useExtensionState(
		setError,
		rules
	);

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

			{/* Список правил */}
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

			{/* Кнопки для управления правилами */}
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

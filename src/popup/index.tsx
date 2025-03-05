import React from 'react';
import ReactDOM from 'react-dom/client';
import '../global.css';
import { useErrorHandling, useExtensionState, useRules } from './hooks';
import styles from './Popup.module.css';
import Rule from './Rule';

const Popup: React.FC = () => {
	const { error, setError } = useErrorHandling();
	const {
		rules,
		addRule,
		deleteRule,
		updateRule,
		clearRuleFields,
		resetState,
		importRules,
		exportRules,
	} = useRules(setError);
	const { isExtensionActive, toggleExtension } = useExtensionState(
		setError,
		rules
	);

	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<h1 className={styles.title}>Mockinator</h1>
				<p className={styles.description}>
					Перехват fetch-запросов и возврат mock-данных.
				</p>
			</div>

			{error && <div className={styles.error}>Ошибка: {error}</div>}

			<div className={styles.importExportSection}>
				<button
					className={styles.button}
					onClick={exportRules}
					disabled={!isExtensionActive}
				>
					Экспорт правил
				</button>
				<button
					className={styles.button}
					onClick={() => {
						const input = document.createElement('input');
						input.type = 'file';
						input.accept = '.txt';
						input.onchange = (e) => {
							const file = (e.target as HTMLInputElement).files?.[0];
							if (file) {
								importRules(file);
							}
						};
						input.click();
					}}
					disabled={!isExtensionActive}
				>
					Импорт правил
				</button>
			</div>

			<div className={styles.toggleSection}>
				<label>
					Активировать расширение:
					<input
						type="checkbox"
						checked={isExtensionActive}
						onChange={toggleExtension}
					/>
				</label>
			</div>

			<div className={styles.rulesSection}>
				<ul style={{ listStyle: 'none', padding: 0 }}>
					{rules.map((rule) => (
						<li key={rule.id} className={styles.ruleItem}>
							<Rule
								rule={rule}
								isExtensionActive={isExtensionActive}
								updateRule={updateRule}
								clearRuleFields={clearRuleFields}
								deleteRule={deleteRule}
								rulesCount={rules.length}
							/>
						</li>
					))}
				</ul>
			</div>

			<div className={styles.controlsSection}>
				<button
					className={styles.button}
					onClick={addRule}
					disabled={!isExtensionActive}
				>
					Add Rule
				</button>
				<button
					className={styles.button}
					onClick={resetState}
					disabled={!isExtensionActive}
				>
					Reset State
				</button>
			</div>
		</div>
	);
};

const root = ReactDOM.createRoot(
	document.getElementById('root') as HTMLElement
);
root.render(<Popup />);

import React from 'react';
import { RuleProps } from '../types';

const Rule: React.FC<RuleProps> = React.memo(
	({
		rule,
		isExtensionActive,
		updateRule,
		clearRuleFields,
		deleteRule,
		rulesCount,
	}) => {
		return (
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
						onChange={(e) => updateRule(rule.id, 'isActive', e.target.checked)}
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
				{rulesCount > 1 && (
					<button
						onClick={() => deleteRule(rule.id)}
						disabled={!isExtensionActive}
					>
						Delete Rule
					</button>
				)}
			</li>
		);
	}
);

export default Rule;

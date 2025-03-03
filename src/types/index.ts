/*
 * Интерфейс для описания правил перехвата запросов.
 * Каждое правило содержит:
 * - id: Уникальный идентификатор правила.
 * - method: Метод запроса (GET, POST, PUT, DELETE и т.д.).
 * - path: Часть URL, которую нужно перехватывать.
 * - data: Mock-данные, которые будут возвращены вместо реального ответа (необязательное поле).
 * - isActive: Флаг, указывающий, активно ли правило.
 * - delay: Задержка в миллисекундах перед возвратом mock-ответа (необязательное поле).
 * - responseType: Тип ответа (success, error, redirect).
 * - successResponseType: Тип успешного ответа (json, text, html, xml).
 * - errorMessage: Текст ошибки.
 * - redirectUrl: URL для редиректа.
 */
export interface Rule {
	id: string;
	method: string;
	path: string;
	data?: string;
	isActive: boolean;
	delay?: number;
	responseType: 'success' | 'error' | 'redirect';
	successResponseType?: 'json' | 'text' | 'html' | 'xml';
	errorMessage?: string;
	redirectUrl?: string;
}

/*
 * Интерфейс для пропсов компонента Rule.
 */
export interface RuleProps {
	rule: Rule;
	isExtensionActive: boolean;
	updateRule: (
		id: string,
		field: keyof Rule | Partial<Rule>,
		value?: string | boolean | number
	) => void;
	clearRuleFields: (id: string) => void;
	deleteRule: (id: string) => void;
	rulesCount: number;
}

/*
 * Интерфейс для сообщений, отправляемых между popup и background.
 */
export interface ExtensionMessage {
	action: 'updateRules' | 'activateExtension' | 'deactivateExtension' | 'error';
	rules?: Rule[];
	error?: string;
}

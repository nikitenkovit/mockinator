/*
 * Интерфейс для описания правил перехвата запросов.
 * Каждое правило содержит:
 * - id: Уникальный идентификатор правила.
 * - name: Название правила.
 * - method: Метод запроса (GET, POST, PUT, DELETE и т.д.).
 * - path: Часть URL, которую нужно перехватывать.
 * - data: Mock-данные, которые будут возвращены вместо реального ответа (необязательное поле).
 * - isActive: Флаг, указывающий, активно ли правило.
 * - delay: Задержка в миллисекундах перед возвратом mock-ответа (необязательное поле).
 * - responseType: Тип ответа (success, error, redirect).
 * - successResponseType: Тип успешного ответа (json, text, html, xml).
 * - errorResponse: JSON-ответ на ошибку.
 * - redirectUrl: URL для редиректа.
 */
export interface Rule {
	id: string;
	name: string;
	method: string;
	path: string;
	data?: string;
	isActive: boolean;
	delay?: number;
	responseType: 'success' | 'error' | 'redirect';
	successResponseType?: 'json' | 'text' | 'html' | 'xml';
	errorResponse?: string;
	redirectUrl?: string;
}

/*
 * Интерфейс для сообщений, отправляемых между popup и background.
 */
export interface ExtensionMessage {
	action: 'updateRules' | 'activateExtension' | 'deactivateExtension' | 'error';
	rules?: Rule[];
	error?: string;
}

import { useEffect, useState } from 'react';

/*
 * Интерфейс для описания правил перехвата запросов.
 * Каждое правило содержит:
 * - id: Уникальный идентификатор правила.
 * - path: Часть URL, которую нужно перехватывать.
 * - data: Mock-данные, которые будут возвращены вместо реального ответа (необязательное поле).
 * - isActive: Флаг, указывающий, активно ли правило.
 * - delay: Задержка в миллисекундах перед возвратом mock-ответа (необязательное поле).
 * - responseType: Тип ответа (success, error, redirect).
 * - errorMessage: Текст ошибки.
 * - redirectUrl: URL для редиректа.
 */
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

const useExtensionState = (
	setError: (error: string) => void,
	rules: Rule[] = []
) => {
	const [isExtensionActive, setIsExtensionActive] = useState(false);

	// Загрузка состояния расширения из хранилища при монтировании компонента
	useEffect(() => {
		chrome.storage.local.get(['isExtensionActive'], (result) => {
			if (chrome.runtime.lastError) {
				setError(
					`Ошибка при загрузке состояния расширения: ${chrome.runtime.lastError.message}`
				);
				return;
			}

			if (result.isExtensionActive !== undefined) {
				setIsExtensionActive(result.isExtensionActive);
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

	return {
		isExtensionActive,
		toggleExtension,
	};
};

export default useExtensionState;

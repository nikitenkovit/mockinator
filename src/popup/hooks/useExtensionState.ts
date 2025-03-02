import { useEffect, useState } from 'react';
import { Rule } from '../../types';

/*
 * Хук для управления состоянием расширения
 * Возвращает:
 * -isExtensionActive: флаг активности расширения
 * -toggleExtension: функция переключения состояния расширения
 */
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

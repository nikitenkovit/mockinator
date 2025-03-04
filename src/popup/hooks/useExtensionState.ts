import { useEffect, useState } from 'react';
import { Rule } from '../../types';

/**
 * Конвертирует SVG в Data URL (PNG) с помощью Canvas.
 * @param svg - Строка с SVG-кодом.
 * @param size - Размер иконки (16, 48, 128).
 * @returns Promise, который разрешается в Data URL (PNG).
 */
function svgToPng(svg: string, size: number): Promise<string> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => {
			const canvas = document.createElement('canvas');
			canvas.width = size;
			canvas.height = size;
			const ctx = canvas.getContext('2d');
			if (!ctx) {
				reject(new Error('Could not create canvas context'));
				return;
			}
			ctx.drawImage(img, 0, 0, size, size);
			resolve(canvas.toDataURL('image/png'));
		};
		img.onerror = () => reject(new Error('Failed to load SVG'));
		img.src = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
	});
}

/**
 * Загружает SVG из файла и конвертирует его в PNG.
 * @param path - Путь к SVG-файлу.
 * @param size - Размер иконки.
 * @returns Promise, который разрешается в Data URL (PNG).
 */
async function loadSvgAndConvertToPng(
	path: string,
	size: number
): Promise<string> {
	const response = await fetch(path);
	const svg = await response.text();
	return svgToPng(svg, size);
}

/**
 * Создает ImageData из Data URL (PNG).
 * @param dataUrl - Data URL изображения.
 * @param size - Размер иконки.
 * @returns Promise, который разрешается в ImageData.
 */
function createImageData(dataUrl: string, size: number): Promise<ImageData> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => {
			const canvas = document.createElement('canvas');
			canvas.width = size;
			canvas.height = size;
			const ctx = canvas.getContext('2d');
			if (!ctx) {
				reject(new Error('Could not create canvas context'));
				return;
			}
			ctx.drawImage(img, 0, 0, size, size);
			resolve(ctx.getImageData(0, 0, size, size));
		};
		img.onerror = () => reject(new Error('Failed to load image'));
		img.src = dataUrl;
	});
}

/**
 * Хук для управления состоянием расширения.
 * @param setError - Функция для установки ошибки.
 * @param rules - Массив правил.
 * @returns Объект с состоянием и функцией для переключения состояния.
 */
const useExtensionState = (
	setError: (error: string) => void,
	rules: Rule[]
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
	const toggleExtension = async () => {
		const newIsExtensionActive = !isExtensionActive;
		setIsExtensionActive(newIsExtensionActive);

		try {
			const iconPath = newIsExtensionActive
				? {
						16: 'assets/icons/active/icon16.svg',
						48: 'assets/icons/active/icon48.svg',
						128: 'assets/icons/active/icon128.svg',
				  }
				: {
						16: 'assets/icons/inactive/icon16.svg',
						48: 'assets/icons/inactive/icon48.svg',
						128: 'assets/icons/inactive/icon128.svg',
				  };

			const icon16 = await loadSvgAndConvertToPng(iconPath[16], 16);
			const icon48 = await loadSvgAndConvertToPng(iconPath[48], 48);
			const icon128 = await loadSvgAndConvertToPng(iconPath[128], 128);

			// Устанавливаем иконку с использованием imageData
			chrome.action.setIcon({
				imageData: {
					16: await createImageData(icon16, 16),
					48: await createImageData(icon48, 48),
					128: await createImageData(icon128, 128),
				},
			});
		} catch (error) {
			setError('Ошибка при обновлении иконки: ' + (error as Error).message);
		}

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

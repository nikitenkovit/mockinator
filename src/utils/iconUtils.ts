/**
 * Конвертирует SVG в Data URL (PNG) с помощью Canvas.
 * @param svg - Строка с SVG-кодом.
 * @param size - Размер иконки (16, 48, 128).
 * @returns Promise, который разрешается в Data URL (PNG).
 */
export function svgToPng(svg: string, size: number): Promise<string> {
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
export async function loadSvgAndConvertToPng(
	path: string,
	size: number
): Promise<string> {
	const response = await fetch(path);
	const svg = await response.text();
	return svgToPng(svg, size);
}

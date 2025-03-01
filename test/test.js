// Обработчик для первой кнопки (запрос на /posts)
document.getElementById('fetchButton').addEventListener('click', () => {
	fetch('https://jsonplaceholder.typicode.com/posts')
		.then((response) => {
			if (!response.ok) {
				// Если статус ответа не в диапазоне 200-299, возвращаем текст ошибки.
				return response.text().then((text) => {
					throw new Error(text);
				});
			}
			return response.json(); // Если ответ успешный, парсим JSON.
		})
		.then((data) => console.log('Результат fetch-запроса (posts):', data))
		.catch((error) =>
			console.error('Ошибка fetch-запроса (posts):', error.message)
		);
});

// Обработчик для второй кнопки (запрос на /comments)
document.getElementById('fetchButton2').addEventListener('click', () => {
	fetch('https://jsonplaceholder.typicode.com/comments')
		.then((response) => {
			if (!response.ok) {
				// Если статус ответа не в диапазоне 200-299, возвращаем текст ошибки.
				return response.text().then((text) => {
					throw new Error(text);
				});
			}
			return response.json(); // Если ответ успешный, парсим JSON.
		})
		.then((data) => console.log('Результат fetch-запроса (comments):', data))
		.catch((error) =>
			console.error('Ошибка fetch-запроса (comments):', error.message)
		);
});

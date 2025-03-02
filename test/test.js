document.getElementById('fetchButton').addEventListener('click', () => {
	fetch('https://jsonplaceholder.typicode.com/posts')
		.then((response) => {
			if (!response.ok) {
				return response.text().then((text) => {
					throw new Error(text);
				});
			}
			const contentType = response.headers.get('content-type');
			if (contentType?.includes('application/json')) {
				return response.json();
			} else if (contentType?.includes('text/plain')) {
				return response.text();
			} else if (contentType?.includes('text/html')) {
				return response.text();
			} else if (contentType?.includes('application/xml')) {
				return response.text();
			} else {
				return response.text();
			}
		})
		.then((data) => {
			console.log('Результат fetch-запроса (posts):', data);
		})
		.catch((error) =>
			console.error('Ошибка fetch-запроса (posts):', error.message)
		);
});

document.getElementById('fetchButton2').addEventListener('click', () => {
	fetch('https://jsonplaceholder.typicode.com/comments')
		.then((response) => {
			if (!response.ok) {
				return response.text().then((text) => {
					throw new Error(text);
				});
			}
			const contentType = response.headers.get('content-type');
			if (contentType?.includes('application/json')) {
				return response.json();
			} else if (contentType?.includes('text/plain')) {
				return response.text();
			} else if (contentType?.includes('text/html')) {
				return response.text();
			} else if (contentType?.includes('application/xml')) {
				return response.text();
			} else {
				return response.text();
			}
		})
		.then((data) => {
			console.log('Результат fetch-запроса (comments):', data);
		})
		.catch((error) =>
			console.error('Ошибка fetch-запроса (comments):', error.message)
		);
});

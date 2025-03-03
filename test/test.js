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
			console.log('Результат fetch-запроса (GET posts):', data);
		})
		.catch((error) =>
			console.error('Ошибка fetch-запроса (GET posts):', error.message)
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
			console.log('Результат fetch-запроса (GET comments):', data);
		})
		.catch((error) =>
			console.error('Ошибка fetch-запроса (GET comments):', error.message)
		);
});

document.getElementById('fetchButton3').addEventListener('click', () => {
	fetch('https://jsonplaceholder.typicode.com/posts', {
		method: 'POST',
		body: JSON.stringify({
			title: 'foo',
			body: 'bar',
			userId: 1,
		}),
		headers: {
			'Content-type': 'application/json; charset=UTF-8',
		},
	})
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
			console.log('Результат fetch-запроса (POST posts):', data);
		})
		.catch((error) =>
			console.error('Ошибка fetch-запроса (POST posts):', error.message)
		);
});

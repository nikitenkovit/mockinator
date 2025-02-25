import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';

const Popup: React.FC = () => {
	const [path, setPath] = useState('');
	const [data, setData] = useState('');
	const [isActive, setIsActive] = useState(false);

	// Загрузка данных при открытии popup
	useEffect(() => {
		chrome.storage.local.get(['path', 'data', 'isActive'], (result) => {
			setPath(result.path || '');
			setData(result.data || '');
			setIsActive(result.isActive || false);
			console.log('Данные загружены в popup:', result);
		});
	}, []);

	// Переключение состояния перехвата
	const toggleIntercept = () => {
		const newIsActive = !isActive;
		setIsActive(newIsActive);

		// Сохраняем данные в хранилище
		chrome.storage.local.set({ path, data, isActive: newIsActive }, () => {
			console.log('Данные сохранены в хранилище:', {
				path,
				data,
				isActive: newIsActive,
			});

			// Отправляем сообщение в фоновый скрипт
			chrome.runtime.sendMessage({
				action: newIsActive ? 'activate' : 'deactivate',
				path,
				data,
			});
		});
	};

	// Синхронизация состояния при изменении хранилища
	useEffect(() => {
		const listener = (
			changes: { [key: string]: chrome.storage.StorageChange },
			area: string
		) => {
			if (area === 'local' && changes.isActive) {
				const newIsActive = changes.isActive.newValue;
				setIsActive(newIsActive);
				console.log('Состояние isActive изменено в хранилище:', newIsActive);
			}
		};

		chrome.storage.onChanged.addListener(listener);
		return () => chrome.storage.onChanged.removeListener(listener);
	}, []);

	return (
		<div>
			<h1>Mockinator</h1>
			<p>Перехват fetch-запросов и возврат mock-данных.</p>

			<label>
				PATH:
				<input
					type="text"
					value={path}
					onChange={(e) => setPath(e.target.value)}
					placeholder="Введите часть пути URL"
				/>
			</label>

			<label>
				DATA:
				<textarea
					value={data}
					onChange={(e) => setData(e.target.value)}
					placeholder="Введите mock-данные"
				/>
			</label>

			<label>
				Активировать перехват:
				<input type="checkbox" checked={isActive} onChange={toggleIntercept} />
			</label>
		</div>
	);
};

const root = ReactDOM.createRoot(
	document.getElementById('root') as HTMLElement
);

root.render(<Popup />);

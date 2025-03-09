import ReactDOM from 'react-dom/client';
import '../global.css';
import { Popup } from './popup';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(<Popup />);

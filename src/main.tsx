import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { App } from './App';
import './styles/base.css';

const root = document.getElementById('root')!;
const app = <StrictMode><App /></StrictMode>;
if (new URLSearchParams(location.search).get('review') === 'still') {
  createRoot(root).render(<StrictMode><App stillFrame /></StrictMode>);
} else if (root.querySelector('main')) hydrateRoot(root, app);
else createRoot(root).render(app);

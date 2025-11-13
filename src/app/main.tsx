import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/_globals.scss';
import { App } from '@app/App.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

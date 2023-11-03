import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import App from './App';
import store, { persistor } from './store';
import 'bootstrap/dist/css/bootstrap.min.css';
import './i18n/config';
import { CookiesProvider } from 'react-cookie';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <CookiesProvider>
      <BrowserRouter basename={process.env.PUBLIC_URL}>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <App />
          </PersistGate>
        </Provider>
      </BrowserRouter>
    </CookiesProvider>
  </React.StrictMode>,
);

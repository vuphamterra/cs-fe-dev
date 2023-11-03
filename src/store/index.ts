import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import userReducer from './UserSlice';
import authReducer from './AuthSlice';
import dbReducer from './DatabaseSlice';
import folderReducer from './FolderSlice';
import drawReducer from './DrawerSlice';
import dashboardReducer from './DashboardSlice';
import fileReducer from './FileSlice';
import indexField from './IndexField';
import { REDUX_PERSIST_KEY } from '~/constants';
import auditReducer from './AuditSlice';
import { scannerSlice } from './ScannerSlice';
import themeReducer from './ThemeSlice';
// import { authMiddleware } from './middleware';

const persistConfig = {
  key: REDUX_PERSIST_KEY,
  storage,
};

const rootReducer = combineReducers({
  user: userReducer,
  auth: authReducer,
  db: dbReducer,
  folder: folderReducer,
  draw: drawReducer,
  dashboard: dashboardReducer,
  audit: auditReducer,
  indexField,
  file: fileReducer,
  scanner: scannerSlice.reducer,
  theme: themeReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  // middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(authMiddleware),
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const persistor = persistStore(store);
export default store;

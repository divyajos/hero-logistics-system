import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { 
  persistStore, 
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER 
} from 'redux-persist';
// Custom persistent storage adapter to bypass Vite ESM packaging bugs
const localPersistStorage = {
  getItem: (key) => {
    return Promise.resolve(localStorage.getItem(key));
  },
  setItem: (key, value) => {
    localStorage.setItem(key, value);
    return Promise.resolve();
  },
  removeItem: (key) => {
    localStorage.removeItem(key);
    return Promise.resolve();
  }
};

// Import slices
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import companyReducer from './slices/companySlice';
import loadsReducer from './slices/loadsSlice';
import dispatchReducer from './slices/dispatchSlice';
import driversReducer from './slices/driversSlice';
import vehiclesReducer from './slices/vehiclesSlice';
import warehouseReducer from './slices/warehouseSlice';
import accountsReducer from './slices/accountsSlice';
import customersReducer from './slices/customersSlice';

const persistConfig = {
  key: 'hero_root',
  storage: localPersistStorage,
  whitelist: ['auth'], // Persist login state and session tokens
};

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  company: companyReducer,
  loads: loadsReducer,
  dispatch: dispatchReducer,
  drivers: driversReducer,
  vehicles: vehiclesReducer,
  warehouse: warehouseReducer,
  accounts: accountsReducer,
  customers: customersReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

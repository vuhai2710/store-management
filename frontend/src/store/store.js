import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import ordersReducer from './slices/ordersSlice';
import productsReducer from './slices/productsSlice';
import customersReducer from './slices/customersSlice';
import inventoryReducer from './slices/inventorySlice';
import employeesReducer from './slices/employeesSlice';
import financeReducer from './slices/financeSlice';
import suppliersReducer from './slices/suppliersSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    orders: ordersReducer,
    products: productsReducer,
    customers: customersReducer,
    inventory: inventoryReducer,
    employees: employeesReducer,
    finance: financeReducer,
    suppliers: suppliersReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});



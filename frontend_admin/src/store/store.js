import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import ordersReducer from "./slices/ordersSlice";
import productsReducer from "./slices/productsSlice";
import customersReducer from "./slices/customersSlice";
import inventoryReducer from "./slices/inventorySlice";
import employeesReducer from "./slices/employeesSlice";
import financeReducer from "./slices/financeSlice";
import suppliersReducer from "./slices/suppliersSlice";
import usersReducer from "./slices/usersSlice";
import categoriesReducer from "./slices/categoriesSlice";
import importOrdersReducer from "./slices/importOrdersSlice";
import shipmentsReducer from "./slices/shipmentsSlice";
import reviewsReducer from "./slices/reviewsSlice";
import promotionsReducer from "./slices/promotionsSlice";

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
    users: usersReducer,
    categories: categoriesReducer,
    importOrders: importOrdersReducer,
    shipments: shipmentsReducer,
    reviews: reviewsReducer,
    promotions: promotionsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
});



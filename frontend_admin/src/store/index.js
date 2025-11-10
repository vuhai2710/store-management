import { combineReducers } from "redux";
import authReducer from "./slices/authSlice";
import customersReducer from "./slices/customersSlice";
import usersReducer from "./slices/usersSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  customers: customersReducer,
  users: usersReducer, // thêm vào store
});

export default rootReducer;
import { createStore, combineReducers, applyMiddleware } from "redux";
import usersReducer from "./reducers/usersReducers";
import generalParamsReducer from "./reducers/generalReducer";
import thunk from "redux-thunk"; //for async actions
import journalReducer from "./reducers/journalEntryReducers";

const rootReducer = combineReducers({
  users: usersReducer,
  general: generalParamsReducer,
  journalEntries: journalReducer,
})

const store = createStore(rootReducer, applyMiddleware(thunk))

export default store;
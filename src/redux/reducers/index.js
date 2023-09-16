import { combineReducers } from "redux"
import overviewReducers from "./overview/overview.reducer"
import authReducer from "./auth/auth.reducer";

const rootReducers = combineReducers({
    overviewPage: overviewReducers,
    auth: authReducer,
});

export default rootReducers
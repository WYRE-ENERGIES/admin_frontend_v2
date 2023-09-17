import { combineReducers } from "redux"
import overviewReducers from "./overview/overview.reducer"
import authReducer from "./auth/auth.reducer";
import headersReducers from "./header/headers.reducer";

const rootReducers = combineReducers({
    overviewPage: overviewReducers,
    auth: authReducer,
    headers: headersReducers,
});

export default rootReducers
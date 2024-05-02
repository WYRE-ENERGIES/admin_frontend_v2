import { combineReducers } from "redux"
import overviewReducers from "./overview/overview.reducer"
import authReducer from "./auth/auth.reducer";
import headersReducers from "./header/headers.reducer";
import clientUserReducers from "./clientUser/clientUser.reducer";
import targetReducers from "./target/target.reducer";
import dieselReducers from "./diesel/diesel.reducer";

const rootReducers = combineReducers({
    overviewPage: overviewReducers,
    auth: authReducer,
    headers: headersReducers,
    clientUsersPage: clientUserReducers,
    targetPage: targetReducers,
    dieselPage: dieselReducers
});

export default rootReducers
import { combineReducers } from "redux"
import overviewReducers from "./overview/overview.reducer"
import authReducer from "./auth/auth.reducer";
import headersReducers from "./header/headers.reducer";
import clientUserReducers from "./clientUser/clientUser.reducer";
import targetReducers from "./target/target.reducer";
import dieselReducers from "./diesel/diesel.reducer";
import locationReducers from "./location/location.reducer";
import branchReducers from "./branch/branch.reducer";

const rootReducers = combineReducers({
    overviewPage: overviewReducers,
    auth: authReducer,
    headers: headersReducers,
    clientUsersPage: clientUserReducers,
    targetPage: targetReducers,
    dieselPage: dieselReducers,
    locationPage: locationReducers,
    branchPage: branchReducers,
});

export default rootReducers
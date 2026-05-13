import { combineReducers } from "redux"
import overviewReducers from "./overview/overview.reducer"
import authReducer from "./auth/auth.reducer";
import headersReducers from "./header/headers.reducer";
import clientUserReducers from "./clientUser/clientUser.reducer";
import targetReducers from "./target/target.reducer";
import dieselReducers from "./diesel/diesel.reducer";
import locationReducers from "./location/location.reducer";
import branchReducers from "./branch/branch.reducer";
import overviewReducersBulkMonitoring from "./bulkMonitoring/overview/overview.reducer";
import systemConstantsReducer from "./systemConstants/system.constants.reducer";
import solarReducer from "./solar/solar.reducer";
import solarMgtReducer from "./solarMgt/solarMgt.reducer";
import installChecklistReducer from "./installChecklist/installChecklist.reducer";

const rootReducers = combineReducers({
    overviewPage: overviewReducers,
    bMonitoringOverviewPage: overviewReducersBulkMonitoring,
    auth: authReducer,
    headers: headersReducers,
    clientUsersPage: clientUserReducers,
    targetPage: targetReducers,
    dieselPage: dieselReducers,
    locationPage: locationReducers,
    branchPage: branchReducers,
    systemConstants: systemConstantsReducer,
    solar: solarReducer,
    solarMgt: solarMgtReducer,
    installChecklist: installChecklistReducer,
});

export default rootReducers
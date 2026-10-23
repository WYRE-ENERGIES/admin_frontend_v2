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
import clientSolarReducer from "./clientSolar/clientSolar.reducer";
import installChecklistReducer from "./installChecklist/installChecklist.reducer";
import investorReducer from "./investor/investor.reducer";
import adminInvestorUserReducer from "./adminInvestorUser/adminInvestorUser.reducer";
import adminInvestorProjectReducer from "./adminInvestorProject/adminInvestorProject.reducer";
import adminInvestorInvestmentReducer from "./adminInvestorInvestment/adminInvestorInvestment.reducer";
import adminCustomerPaymentReducer from "./adminCustomerPayment/adminCustomerPayment.reducer";
import adminInvestorPayoutReducer from "./adminInvestorPayout/adminInvestorPayout.reducer";
import adminInvestorOverviewReducer from "./adminInvestorOverview/adminInvestorOverview.reducer";
import adminInvestorDirectoryReducer from "./adminInvestorDirectory/adminInvestorDirectory.reducer";
import adminInvestorSupportTicketReducer from "./adminInvestorSupportTicket/adminInvestorSupportTicket.reducer";

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
    clientSolar: clientSolarReducer,
    installChecklist: installChecklistReducer,
    investorPage: investorReducer,
    adminInvestorUsersPage: adminInvestorUserReducer,
    adminInvestorProjectsPage: adminInvestorProjectReducer,
    adminInvestorInvestmentsPage: adminInvestorInvestmentReducer,
    adminCustomerPaymentsPage: adminCustomerPaymentReducer,
    adminInvestorPayoutsPage: adminInvestorPayoutReducer,
    adminInvestorOverviewPage: adminInvestorOverviewReducer,
    adminInvestorDirectoryPage: adminInvestorDirectoryReducer,
    adminInvestorSupportTicketsPage: adminInvestorSupportTicketReducer,
});

export default rootReducers
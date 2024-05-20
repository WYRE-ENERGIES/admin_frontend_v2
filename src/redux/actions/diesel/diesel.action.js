import { APIService } from "../../../config/Api/apiServices";
import { getDieselConsumptionLoading, getDieselConsumptionSuccess, getDieselLoading, getDieselProcurementLoading, getDieselProcurementSuccess, getDieselSuccess } from "./diesel.creator";

export const getDieselData = (clientId, paginationQuery=1) => async (dispatch) => {

    dispatch(getDieselLoading(true));
  
    const requestUrl = `/api/v2/client-diesel-overview/${clientId}/?page=${paginationQuery}`;
    try {
      const response = await APIService.get(requestUrl);
  
      dispatch(getDieselSuccess(response.data));
  
      dispatch(getDieselLoading(false))
      return { fulfilled: true, message: 'successful' }
    } catch (error) {
      dispatch(getDieselLoading(false));
      return { fulfilled: false, message: error.response.data.detail }
    }
};

export const getDieselProcurementData = (branchId, paginationQuery=1) => async (dispatch) => {

    dispatch(getDieselProcurementLoading(true));
  
    const requestUrl = `/api/v2/procurements/${branchId}/?page=${paginationQuery}`;
    try {
      const response = await APIService.get(requestUrl);
  
      dispatch(getDieselProcurementSuccess(response.data));
  
      dispatch(getDieselProcurementLoading(false))
      return { fulfilled: true, message: 'successful' }
    } catch (error) {
      dispatch(getDieselProcurementLoading(false));
      return { fulfilled: false, message: error.response.data.detail }
    }
};

export const getDieselConsumptionData = (branchId, paginationQuery=1) => async (dispatch) => {

    dispatch(getDieselConsumptionLoading(true));
  
    const requestUrl = `/api/v2/consumptions/${branchId}/?page=${paginationQuery}`;
    try {
      const response = await APIService.get(requestUrl);
  
      dispatch(getDieselConsumptionSuccess(response.data));
  
      dispatch(getDieselConsumptionLoading(false))
      return { fulfilled: true, message: 'successful' }
    } catch (error) {
      dispatch(getDieselConsumptionLoading(false));
      return { fulfilled: false, message: error.response.data.detail }
    }
};
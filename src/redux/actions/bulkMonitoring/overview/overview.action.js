// import { APIService } from "../../../config/Api/apiServices";
import { APIService } from "../../../../config/Api/apiServices";
import { getAllTimeEnergyConsumptionLoading, getAllTimeEnergyConsumptionSuccess, getAmountLoading, getAmountSuccess, getDevicesListLoading, getDevicesListSuccess, getLastMonthEnergyConsumptionLoading, getLastMonthEnergyConsumptionSuccess, getThisMonthEnergyConsumptionLoading, getThisMonthEnergyConsumptionSuccess,  } from "./overview.creator";

export const getAllTimeEnergyConsumptionData = (clientId) => async (dispatch) => {

    dispatch(getAllTimeEnergyConsumptionLoading(true));
  
    const requestUrl = `/api/v2/all-time-consumption/${clientId}`;
    try {
      const response = await APIService.get(requestUrl);
  
      dispatch(getAllTimeEnergyConsumptionSuccess(response.data));
  
      dispatch(getAllTimeEnergyConsumptionLoading(false))
      return { fulfilled: true, message: 'successful' }
    } catch (error) {
      dispatch(getAllTimeEnergyConsumptionLoading(false));
      return { fulfilled: false, message: error.response.data.detail }
    }
};
  
export const getLastmonthEnergyConsumptionData = (clientId) => async (dispatch) => {

    dispatch(getLastMonthEnergyConsumptionLoading(true));
  
    const requestUrl = `/api/v2/last-month-consumption/${clientId}`;
    // const initUrl = `/api/v2/client-branches-energy/${clientId}/${startDate}/${endDate}/?page=${paginationQuery}`
    // const reqUrl = branchName ? initUrl + `&search=${branchName}` : initUrl
    try {
      const response = await APIService.get(requestUrl);
  
      dispatch(getLastMonthEnergyConsumptionSuccess(response.data));
  
      dispatch(getLastMonthEnergyConsumptionLoading(false))
      return { fulfilled: true, message: 'successful' }
    } catch (error) {
      dispatch(getLastMonthEnergyConsumptionLoading(false));
      return { fulfilled: false, message: error.response.data.detail }
    }
};

export const getThisMonthEnergyConsumptionData = (clientId) => async (dispatch) => {

    dispatch(getThisMonthEnergyConsumptionLoading(true));
  
    const requestUrl = `/api/v2/this-month-consumption/${clientId}`;
    try {
      const response = await APIService.get(requestUrl);
  
      dispatch(getThisMonthEnergyConsumptionSuccess(response.data));
  
      dispatch(getThisMonthEnergyConsumptionLoading(false))
      return { fulfilled: true, message: 'successful' }
    } catch (error) {
      dispatch(getThisMonthEnergyConsumptionLoading(false));
      return { fulfilled: false, message: error.response.data.detail }
    }
};

export const getAmountData = (clientId) => async (dispatch) => {

    dispatch(getAmountLoading(true));
  
    const requestUrl = `/api/v2/amount/${clientId}`;
    try {
      const response = await APIService.get(requestUrl);
  
      dispatch(getAmountSuccess(response.data));
  
      dispatch(getAmountLoading(false))
      return { fulfilled: true, message: 'successful' }
    } catch (error) {
      dispatch(getAmountLoading(false));
      return { fulfilled: false, message: error.response.data.detail }
    }
};

export const getDevicesListData = (clientId) => async (dispatch) => {

    dispatch(getDevicesListLoading(true));
  
    const requestUrl = `/api/v2/devices-list/${clientId}`;
    try {
      const response = await APIService.get(requestUrl);
  
      dispatch(getDevicesListSuccess(response.data));
  
      dispatch(getDevicesListLoading(false))
      return { fulfilled: true, message: 'successful' }
    } catch (error) {
      dispatch(getDevicesListLoading(false));
      return { fulfilled: false, message: error.response.data.detail }
    }
};
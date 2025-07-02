import { APIService } from "../../../config/Api/apiServices";
import { getDieselCostBarChartLoading, getDieselCostBarChartSuccess, getDieselLitresBarChartLoading, getDieselLitresBarChartSuccess, getKeyMetricsLoading, getKeyMetricsSuccess, getTotalCostBarChartLoading, getTotalCostBarChartSuccess, getTotalEnergyBarChartLoading, getTotalEnergyTopCardLoading, getTotalEnergyTopCardSuccess, getUtilityEnergyBarChartLoading, getUtilityEnergyBarChartSuccess, gettTotalEnergyBarChartSuccess, getUtilityCostPerBranchLoading, getUtilityCostPerBranchSuccess } from "./overview.creator";

export const getTotalEnergyTopCard = (clientId, startDate, endDate) => async (dispatch) => {

    dispatch(getTotalEnergyTopCardLoading(true));
  
    const requestUrl = `/api/v1/client-header-endpoints/${clientId}/${startDate}/${endDate}`;
    try {
      const response = await APIService.get(requestUrl);
  
      dispatch(getTotalEnergyTopCardSuccess(response.data.data));
  
      dispatch(getTotalEnergyTopCardLoading(false))
      return { fulfilled: true, message: 'successful' }
    } catch (error) {
      dispatch(getTotalEnergyTopCardLoading(false));
      return { fulfilled: false, message: error.response.data.detail }
    }
};
  
export const getTotalEnergyBarChartData = (clientId, startDate, endDate, paginationQuery=1, branchName=null) => async (dispatch) => {

    dispatch(getTotalEnergyBarChartLoading(true));
  
    // const requestUrl = `/api/v2/client-branches-energy/${startDate}/${endDate}/?client_id=${clientId}${paginationQuery? paginationQuery: ''}`;
    // const requestUrl = `/api/v2/client-branches-energy/${clientId}/${startDate}/${endDate}/?page=${paginationQuery}`;
    const initUrl = `/api/v2/client-branches-energy/${clientId}/${startDate}/${endDate}/?page=${paginationQuery}`
    const reqUrl = branchName ? initUrl + `&search=${branchName}` : initUrl
    try {
      const response = await APIService.get(reqUrl);
  
      dispatch(gettTotalEnergyBarChartSuccess(response.data));
  
      dispatch(getTotalEnergyBarChartLoading(false))
      return { fulfilled: true, message: 'successful' }
    } catch (error) {
      dispatch(getTotalEnergyBarChartLoading(false));
      return { fulfilled: false, message: error.response.data.detail }
    }
};

export const getClientUtilityCostData = (clientId, year=null) => async (dispatch) => {

    dispatch(getTotalCostBarChartLoading(true));
  
    const requestUrl = `/api/v2/client-utility-cost/?client_id=${clientId}`;
    const queriedRequest = year ? requestUrl + `&year=${year}` : requestUrl
    try {
      const response = await APIService.get(queriedRequest);
  
      dispatch(getTotalCostBarChartSuccess(response.data));
  
      dispatch(getTotalCostBarChartLoading(false))
      return { fulfilled: true, message: 'successful' }
    } catch (error) {
      dispatch(getTotalCostBarChartLoading(false));
      
      return { fulfilled: false, message: error.response.data.detail }
    }
};

export const getClientUtilityEnergyData = (clientId, year=null) => async (dispatch) => {
    dispatch(getUtilityEnergyBarChartLoading(true));
    const requestUrl = `/api/v2/client-utility-energy/?client_id=${clientId}`;
    const queriedRequest = year ? requestUrl + `&year=${year}` : requestUrl
    try {
      const response = await APIService.get(queriedRequest);
  
      dispatch(getUtilityEnergyBarChartSuccess(response.data));
  
      dispatch(getUtilityEnergyBarChartLoading(false))
      return { fulfilled: true, message: 'successful' }
    } catch (error) {
      dispatch(getUtilityEnergyBarChartLoading(false));
      return { fulfilled: false, message: error.response.data.detail }
    }
};

export const getClientDieselCostData = (clientId, year=null) => async (dispatch) => {

    dispatch(getDieselCostBarChartLoading(true));
    const requestUrl = `/api/v2/client-diesel-cost/?client_id=${clientId}`;
    const queriedRequest = year ? requestUrl + `&year=${year}` : requestUrl
    try {
      const response = await APIService.get(queriedRequest);
  
      dispatch(getDieselCostBarChartSuccess(response.data));
  
      dispatch(getDieselCostBarChartLoading(false))
      return { fulfilled: true, message: 'successful' }
    } catch (error) {
      dispatch(getDieselCostBarChartLoading(false));
      return { fulfilled: false, message: error.response.data.detail }
    }
};

export const getClientDieselLitresData = (clientId, year=null) => async (dispatch) => {

    dispatch(getDieselLitresBarChartLoading(true));
  
    const requestUrl = `/api/v2/client-diesel-litres?client_id=${clientId}`;
    // const queriedRequest = `/api/v2/client-diesel-litres?client_id=${clientId}&year=${year}`;
    const queriedRequest = year ? requestUrl + `&year=${year}` : requestUrl
    try {
      const response = await APIService.get(queriedRequest);
  
      dispatch(getDieselLitresBarChartSuccess(response.data));
  
      dispatch(getDieselLitresBarChartLoading(false))
      return { fulfilled: true, message: 'successful' }
    } catch (error) {
      dispatch(getDieselLitresBarChartLoading(false));
      return { fulfilled: false, message: error.response.data.detail }
    }
};

export const getKeyMetricsData = (clientId, startDate, endDate, paginationQuery=1, branchName=null) => async (dispatch) => {

  dispatch(getKeyMetricsLoading(true));

  const initUrl = `/api/v2/key-metrics/${clientId}/${startDate}/${endDate}/?page=${paginationQuery}`
  const reqUrl = branchName ? initUrl + `&search=${branchName}` : initUrl
  try {
    const response = await APIService.get(reqUrl);

    dispatch(getKeyMetricsSuccess(response.data));

    dispatch(getKeyMetricsLoading(false))
    return { fulfilled: true, message: 'successful' }
  } catch (error) {
    dispatch(getKeyMetricsLoading(false));
    return { fulfilled: false, message: error.response.data.detail }
  }
};

export const getUtilityCostPerBranch = (clientId, month, year) => async (dispatch) => {
  dispatch(getUtilityCostPerBranchLoading(true));
  const requestUrl = `/api/v2/client/${clientId}/monthly-utility-cost/?month=${month}&year=${year}`;
  try {
    const response = await APIService.get(requestUrl);
    dispatch(getUtilityCostPerBranchSuccess(response.data));
    dispatch(getUtilityCostPerBranchLoading(false));
    return { fulfilled: true, message: 'successful' }
  } catch (error) {
    dispatch(getUtilityCostPerBranchLoading(false));
    return { fulfilled: false, message: error.response?.data?.detail || "Error" }
  }
};
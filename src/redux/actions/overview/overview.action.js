import { APIService } from "../../../config/Api/apiServices";
import { getKeyMetricsLoading, getKeyMetricsSuccess, getTotalCostBarChartLoading, getTotalCostBarChartSuccess, getTotalEnergyBarChartLoading, getTotalEnergyTopCardLoading, getTotalEnergyTopCardSuccess, gettTotalEnergyBarChartSuccess } from "./overview.creator";

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
  
export const getTotalEnergyBarChartData = (startDate, endDate, clientId, paginationQuery=null) => async (dispatch) => {

    dispatch(getTotalEnergyBarChartLoading(true));
  
    const requestUrl = `/api/v2/client-branches-energy/${startDate}/${endDate}/?client_id=${clientId}${paginationQuery? paginationQuery: ''}`;
    try {
      const response = await APIService.get(requestUrl);
  
      dispatch(gettTotalEnergyBarChartSuccess(response.data));
  
      dispatch(getTotalEnergyBarChartLoading(false))
      return { fulfilled: true, message: 'successful' }
    } catch (error) {
      dispatch(getTotalEnergyBarChartLoading(false));
      return { fulfilled: false, message: error.response.data.detail }
    }
};

export const getTotalCostBarChartData = (clientId) => async (dispatch) => {

    dispatch(getTotalCostBarChartLoading(true));
  
    const requestUrl = `/api/v2/client-energy-cost/?client_id=${clientId}`;
    try {
      const response = await APIService.get(requestUrl);
  
      dispatch(getTotalCostBarChartSuccess(response.data));
  
      dispatch(getTotalCostBarChartLoading(false))
      return { fulfilled: true, message: 'successful' }
    } catch (error) {
      dispatch(getTotalCostBarChartLoading(false));
      return { fulfilled: false, message: error.response.data.detail }
    }
};

export const getKeyMetricsData = (clientId, paginationQuery=1) => async (dispatch) => {

  dispatch(getKeyMetricsLoading(true));

  // const requestUrl = `/api/v2/key-metrics/${clientId}/?page=${paginationQuery}?search=${branchName}`;
  const requestUrl = `/api/v2/key-metrics/${clientId}/?page=${paginationQuery}`;
  try {
    const response = await APIService.get(requestUrl);

    dispatch(getKeyMetricsSuccess(response.data));

    dispatch(getKeyMetricsLoading(false))
    return { fulfilled: true, message: 'successful' }
  } catch (error) {
    dispatch(getKeyMetricsLoading(false));
    return { fulfilled: false, message: error.response.data.detail }
  }
};
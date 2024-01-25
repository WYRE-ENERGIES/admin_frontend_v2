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
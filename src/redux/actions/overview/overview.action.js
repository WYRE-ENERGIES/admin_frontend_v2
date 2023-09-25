import { APIService } from "../../../config/Api/apiServices";
import { getTotalEnergyBarChartLoading, getTotalEnergyTopCardLoading, getTotalEnergyTopCardSuccess, gettTotalEnergyBarChartSuccess } from "./overview.creator";

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
  
export const getTotalEnergyBarChartData = (startDate, endDate, clientId) => async (dispatch) => {

    dispatch(getTotalEnergyBarChartLoading(true));
  
    const requestUrl = `/api/v2/client-branches-energy/${startDate}/${endDate}/?client_id=${clientId}`;
    // const requestUrl = `/api/v2/client-branches-energy/01-09-2023%2000:00/30-09-2023%2000:00/?client_id=15&current_page=4&items_per_page=5`;
    // const requestUrl = `/api/v2/client-branches-energy/01-08-2023%2000:00/05-08-2023%2000:00/?client_id=15`;
    try {
      const response = await APIService.get(requestUrl);
  
      dispatch(gettTotalEnergyBarChartSuccess(response.data.chart));
  
      dispatch(getTotalEnergyBarChartLoading(false))
      return { fulfilled: true, message: 'successful' }
    } catch (error) {
      dispatch(getTotalEnergyBarChartLoading(false));
      return { fulfilled: false, message: error.response.data.detail }
    }
  };
import { APIService } from "../../../config/Api/apiServices";
import { getTotalEnergyTopCardLoading, getTotalEnergyTopCardSuccess } from "./overview.creator";

export const getTotalEnergyTopCard = (clientId, startDate, endDate) => async (dispatch) => {
  console.log('Ccheck the Action call>>>>>>>>>>>');

    dispatch(getTotalEnergyTopCardLoading(true));
  
    // const requestUrl = `/15/01-08-2023%2000:00/02-08-2023%2000:00`;
    const requestUrl = `/api/v1/${clientId}/${startDate}/${endDate}`;
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
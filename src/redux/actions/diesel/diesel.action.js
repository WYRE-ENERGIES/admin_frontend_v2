import { APIService } from "../../../config/Api/apiServices";
import { getDieselLoading, getDieselSuccess } from "./diesel.creator";

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
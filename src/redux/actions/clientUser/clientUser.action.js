import { APIService } from "../../../config/Api/apiServices";
import { getClientUserLoading, getClientUserSuccess } from "./clientUser.creator";

export const getClientUsersData = (clientId) => async (dispatch) => {

    dispatch(getClientUserLoading(true));
  
    const requestUrl = `/api/v2/clients/${clientId}/users/`;
    try {
      const response = await APIService.get(requestUrl);
  
      dispatch(getClientUserSuccess(response.data));
  
      dispatch(getClientUserLoading(false))
      return { fulfilled: true, message: 'successful' }
    } catch (error) {
      dispatch(getClientUserLoading(false));
      return { fulfilled: false, message: error.response.data.detail }
    }
  };
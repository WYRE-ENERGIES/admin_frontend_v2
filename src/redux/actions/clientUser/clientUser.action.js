import { APIService } from "../../../config/Api/apiServices";
import { addClientUserLoading, addClientUserSuccess, deleteClientUserLoading, deleteClientUserSuccess, editClientUserLoading, editClientUserSuccess, getClientUserLoading, getClientUserSuccess } from "./clientUser.creator";

export const addClientUsersData = (clientId, values) => async (dispatch) => {

    dispatch(addClientUserLoading(true));
  
    const requestUrl = `/api/v2/clients/${clientId}/users/`;
    try {
      const response = await APIService.post(requestUrl, values);
  
      dispatch(addClientUserSuccess(response.data));
  
      dispatch(addClientUserLoading(false))
      return { fulfilled: true, message: 'successful' }
    } catch (error) {
      dispatch(addClientUserLoading(false));
      return { fulfilled: false, message: error.response.data.detail }
    }
};

export const getClientUsersData = (clientId, paginationQuery=1, branchName) => async (dispatch) => {

    dispatch(getClientUserLoading(true));
  
    const requestUrl = `/api/v2/clients/${clientId}/users/?page=${paginationQuery}`;
    const initUrl = `/api/v2/clients/${clientId}/users/?page=${paginationQuery}`
    const reqUrl = branchName ? initUrl + `&search=${branchName}` : initUrl
    try {
      const response = await APIService.get(reqUrl);
  
      dispatch(getClientUserSuccess(response.data));
  
      dispatch(getClientUserLoading(false))
      return { fulfilled: true, message: 'successful' }
    } catch (error) {
      dispatch(getClientUserLoading(false));
      return { fulfilled: false, message: error.response.data.detail }
    }
};

export const updateClientUsersData = (clientId, id, values) => async (dispatch) => {

    dispatch(editClientUserLoading(true));
  
    const requestUrl = `/api/v2/clients/${clientId}/users/${id}`;
    try {
      const response = await APIService.put(requestUrl, values);
  
      dispatch(editClientUserSuccess(response.data));
  
      dispatch(editClientUserLoading(false))
      return { fulfilled: true, message: 'successful' }
    } catch (error) {
      dispatch(editClientUserLoading(false));
      return { fulfilled: false, message: error.response.data.detail }
    }
  };

export const removeClientUsersData = (clientId) => async (dispatch) => {

    dispatch(deleteClientUserLoading(true));
  
    const requestUrl = `/api/v2/clients/${clientId}/users/`;
    try {
      const response = await APIService.get(requestUrl);
  
      dispatch(deleteClientUserSuccess(response.data));
  
      dispatch(deleteClientUserLoading(false))
      return { fulfilled: true, message: 'successful' }
    } catch (error) {
      dispatch(deleteClientUserLoading(false));
      return { fulfilled: false, message: error.response.data.detail }
    }
  };
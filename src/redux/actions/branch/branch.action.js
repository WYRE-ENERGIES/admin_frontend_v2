import { APIService } from "../../../config/Api/apiServices";
import { getBranchDetailsLoading, getBranchDetailsSuccess } from "./branch.creator";

export const getBranchDetailsData = (branchId, start_date, end_date) => async (dispatch) => {

    dispatch(getBranchDetailsLoading(true));
  
    const requestUrl = `/api/v2/branch-detail/${branchId}/?start_date=${start_date}&end_date=${end_date}`;
    try {
      const response = await APIService.get(requestUrl);
  
      dispatch(getBranchDetailsSuccess(response.data));
  
      dispatch(getBranchDetailsLoading(false))
      return { fulfilled: true, message: 'successful', data: response.data }
    } catch (error) {
      dispatch(getBranchDetailsLoading(false));
      return { fulfilled: false, message: error.response.data.detail }
    }
};
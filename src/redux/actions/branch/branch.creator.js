import branchTypes from "../../reducers/branch/branch.type";
import { APIService } from '../../../config/Api/apiServices';

export const getBranchDetailsLoading = (payload = true) => ({
    type: branchTypes.GET_BRANCH_DETAILS_LOADING,
    payload,
});
export const getBranchDetailsSuccess = (payload = true) => ({
    type: branchTypes.GET_BRANCH_DETAILS_SUCCESS,
    payload,
});

export const getPermittedBranchesLoading = (payload = true) => ({
    type: branchTypes.GET_PERMITTED_BRANCHES_LOADING,
    payload,
});
export const getPermittedBranchesSuccess = (payload) => ({
    type: branchTypes.GET_PERMITTED_BRANCHES_SUCCESS,
    payload,
});
export const getPermittedBranchesFail = (payload) => ({
    type: branchTypes.GET_PERMITTED_BRANCHES_FAIL,
    payload,
});

export const forceLoginBranchLoading = (payload = true) => ({
    type: branchTypes.FORCE_LOGIN_BRANCH_LOADING,
    payload,
});
export const forceLoginBranchSuccess = (payload) => ({
    type: branchTypes.FORCE_LOGIN_BRANCH_SUCCESS,
    payload,
});
export const forceLoginBranchFail = (payload) => ({
    type: branchTypes.FORCE_LOGIN_BRANCH_FAIL,
    payload,
});

export const fetchPermittedBranches = () => async (dispatch) => {
    dispatch(getPermittedBranchesLoading(true));
    try {
        const res = await APIService.getPermittedBranches();
        dispatch(getPermittedBranchesSuccess(res.data.branches));
    } catch (err) {
        dispatch(getPermittedBranchesFail(err));
    } finally {
        dispatch(getPermittedBranchesLoading(false));
    }
};

export const forceLoginBranchAction = (branchId) => async (dispatch) => {
    dispatch(forceLoginBranchLoading(true));
    try {
        const res = await APIService.forceLoginBranch(branchId);
        dispatch(forceLoginBranchSuccess(res.data.data));
        return res.data.data;
    } catch (err) {
        dispatch(forceLoginBranchFail(err));
        throw err;
    } finally {
        dispatch(forceLoginBranchLoading(false));
    }
};
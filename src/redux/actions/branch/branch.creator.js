import branchTypes from "../../reducers/branch/branch.type";

export const getBranchDetailsLoading = (payload = true) => ({
    type: branchTypes.GET_BRANCH_DETAILS_LOADING,
    payload,
});
export const getBranchDetailsSuccess = (payload = true) => ({
    type: branchTypes.GET_BRANCH_DETAILS_SUCCESS,
    payload,
});
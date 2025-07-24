import branchTypes from "./branch.type"

const initialState = {
    fetchBranchDetailsLoading: false,
    branchDetailsData: false,
    permittedBranchesLoading: false,
    permittedBranches: [],
    permittedBranchesError: null,
    forceLoginBranchLoading: false,
    forceLoginBranchData: null,
    forceLoginBranchError: null,
}

const branchReducers = (state = initialState, action) => {
    switch (action.type) { 
        case branchTypes.GET_BRANCH_DETAILS_LOADING:
            return {
                ...state,
                fetchBranchDetailsLoading: action.payload
            }
        case branchTypes.GET_BRANCH_DETAILS_SUCCESS:
            return {
                ...state,
                branchDetailsData: action.payload
            }
        case branchTypes.GET_PERMITTED_BRANCHES_LOADING:
            return {
                ...state,
                permittedBranchesLoading: action.payload
            }
        case branchTypes.GET_PERMITTED_BRANCHES_SUCCESS:
            return {
                ...state,
                permittedBranches: action.payload,
                permittedBranchesError: null
            }
        case branchTypes.GET_PERMITTED_BRANCHES_FAIL:
            return {
                ...state,
                permittedBranchesError: action.payload
            }
        case branchTypes.FORCE_LOGIN_BRANCH_LOADING:
            return {
                ...state,
                forceLoginBranchLoading: action.payload
            }
        case branchTypes.FORCE_LOGIN_BRANCH_SUCCESS:
            return {
                ...state,
                forceLoginBranchData: action.payload,
                forceLoginBranchError: null
            }
        case branchTypes.FORCE_LOGIN_BRANCH_FAIL:
            return {
                ...state,
                forceLoginBranchError: action.payload
            }
    
        default: return state;
    }
}

export default branchReducers
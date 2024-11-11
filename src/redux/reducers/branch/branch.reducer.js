import branchTypes from "./branch.type"

const initialState = {
    fetchBranchDetailsLoading: false,
    branchDetailsData: false,
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
    
        default: return state;
    }
}

export default branchReducers
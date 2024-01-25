// import overviewTypes from "./overview.type";

import clientUserTypes from "./clientUser.type";

const initialState = {
    fetchClientUserLoading: false,
    fetchedClientUser: false
}

const clientUserReducers = (state = initialState, action) => {
    switch (action.type) { 
        case clientUserTypes.GET_CLIENT_USER_LOADING:
            return {
                ...state,
                fetchClientUserLoading: action.payload
            }
        case clientUserTypes.GET_CLIENT_USER_SUCCESS:
            return {
                ...state,
                fetchedClientUser: action.payload
            }
    
        default: return state;
    }
}

export default clientUserReducers
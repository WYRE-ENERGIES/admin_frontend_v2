// import overviewTypes from "./overview.type";

import clientUserTypes from "./clientUser.type";

const initialState = {
    newClientUserLoading: false,
    newClientUser: false,
    fetchClientUserLoading: false,
    fetchedClientUser: false,
    updateClientUserLoading: false,
    updatedClientUser: false,
    removeClientUserLoading: false,
    removedClientUser: false
}

const clientUserReducers = (state = initialState, action) => {
    switch (action.type) { 
        case clientUserTypes.ADD_CLIENT_USER_LOADING:
            return {
                ...state,
                newClientUserLoading: action.payload
            }
        case clientUserTypes.ADD_CLIENT_USER_SUCCESS:
            return {
                ...state,
                newClientUser: action.payload
            }

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

        case clientUserTypes.EDIT_CLIENT_USER_LOADING:
            return {
                ...state,
                updateClientUserLoading: action.payload
            }
        case clientUserTypes.EDIT_CLIENT_USER_SUCCESS:
            return {
                ...state,
                updatedClientUser: action.payload
            }

        case clientUserTypes.DELETE_CLIENT_USER_LOADING:
            return {
                ...state,
                removeClientUserLoading: action.payload
            }
        case clientUserTypes.DELETE_CLIENT_USER_SUCCESS:
            return {
                ...state,
                removedClientUser: action.payload
            }
    
        default: return state;
    }
}

export default clientUserReducers
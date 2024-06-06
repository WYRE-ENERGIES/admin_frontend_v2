import targetTypes from "./target.type";

const initialState = {
    addTargetLoading: false,
    fetchTargetLoading: false,
    updateTargetLoading: false,
    resetTargetLoading: false,
    newTarget: false,
    fetchedTarget: false,
    updatedTarget: false,
    resetTarget: false,
}

const targetReducers = (state = initialState, action) => {
    switch (action.type) {
        case targetTypes.SET_TARGET_LOADING:
            return {
                ...state,
                addTargetLoading: action.payload
            }
        case targetTypes.SET_TARGET_SUCCESS:
            return {
                ...state,
                newTarget: action.payload
            }

        case targetTypes.GET_TARGET_LOADING:
            return {
                ...state,
                fetchTargetLoading: action.payload
            }
        case targetTypes.GET_TARGET_SUCCESS:
            return {
                ...state,
                fetchedTarget: action.payload
            }

        case targetTypes.EDIT_TARGET_LOADING:
            return {
                ...state,
                updateTargetLoading: action.payload
            }
        case targetTypes.EDIT_TARGET_SUCCESS:
            return {
                ...state,
                updatedTarget: action.payload
            }

        case targetTypes.RESET_TARGET_LOADING:
            return {
                ...state,
                resetTargetLoading: action.payload
            }
        case targetTypes.RESET_TARGET_SUCCESS:
            return {
                ...state,
                resetTarget: action.payload
            }
    
        default: return state;
    }
}

export default targetReducers
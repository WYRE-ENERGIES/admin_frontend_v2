import targetTypes from "../../reducers/target/target.type";

export const setTargetLoading = (payload = true) => ({
    type: targetTypes.SET_TARGET_LOADING,
    payload,
});  
export const setTargetSuccess = (payload = true) => ({
    type: targetTypes.SET_TARGET_SUCCESS,
    payload,
});

export const getTargetLoading = (payload = true) => ({
    type: targetTypes.GET_TARGET_LOADING,
    payload,
});  
export const getTargetSuccess = (payload = true) => ({
    type: targetTypes.GET_TARGET_SUCCESS,
    payload,
});

export const editTargetLoading = (payload = true) => ({
    type: targetTypes.EDIT_TARGET_LOADING,
    payload,
});  
export const editTargetSuccess = (payload = true) => ({
    type: targetTypes.EDIT_TARGET_SUCCESS,
    payload,
});

export const resetTargetLoading = (payload = true) => ({
    type: targetTypes.RESET_TARGET_LOADING,
    payload,
});  
export const resetTargetSuccess = (payload = true) => ({
    type: targetTypes.RESET_TARGET_SUCCESS,
    payload,
});
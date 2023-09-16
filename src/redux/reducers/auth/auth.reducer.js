import authTypes from "./auth.types";

const INITIAL_STATE = {
    loginUserLoading: false,
    userData: false,
    fetchedRoles: false,
    fetchedRolesLoading: false,
    allDevicesfetched: false,
    allDevicesfetchLoading: false,
    fetchedDeviceReadings: false,
    fetchDeviceReadingsLoading: false,
    newUserLoading: false,
    newUsers: false,
    newUserBranchLoading: false,
    newUserBranch: false,
};

const authReducer = (state = INITIAL_STATE, action) => {

    switch (action.type) {

        case authTypes.LOGIN_USER_LOADING:

            return {

                ...state,
                loginUserLoading: action.payload,

            };
        case authTypes.LOGIN_USER_SUCCESS:

            return {

                ...state,
                userData: action.payload,

            };

        case authTypes.GET_ROLES_LOADING:

            return {

                ...state,
                fetchedRolesLoading: action.payload,

            };
        case authTypes.GET_ROLES_SUCCESS:

            return {
                ...state,
                fetchedRoles: action.payload,
            };

        case authTypes.GET_ALL_DEVICES_LOADING:

            return {

                ...state,
                allDevicesfetchLoading: action.payload,

            };
        case authTypes.GET_ALL_DEVICES_SUCCESS:

            return {
                ...state,
                allDevicesfetched: action.payload,
            };

        case authTypes.GET_DEVICE_READINGS_LOADING:

            return {

                ...state,
                fetchDeviceReadingsLoading: action.payload,

            };
        case authTypes.GET_DEVICE_READINGS_SUCCESS:

            return {
                ...state,
                fetchedDeviceReadings: action.payload,
            };

        case authTypes.ADD_USERS_LOADING:

            return {

                ...state,
                newUserLoading: action.payload,

            };
        case authTypes.ADD_USER_SUCCESS:

            return {
                ...state,
                newUsers: action.payload,
            };

        case authTypes.ADD_USER_BRANCH_LOADING:

            return {

                ...state,
                newUserBranchLoading: action.payload,

            };
        case authTypes.ADD_USER_BRANCH_SUCCESS:

            return {
                ...state,
                newUserBranch: action.payload,
            };

        case authTypes.EDIT_USER_SUCCESS:

            return {

                ...state,
                updatedUser: action.payload,

            };

        case authTypes.EDIT_USER_LOADING:

            return {

                ...state,
                updateUserLoading: action.payload,

            };

        default: return state;

    }

};

export default authReducer;
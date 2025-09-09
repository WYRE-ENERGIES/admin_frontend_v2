/* eslint-disable import/no-cycle */
import axios from 'axios';
// import { getNewRefreshToken } from '../../redux/actions/auth/auth.action';

// import { logoutOnUnauthorized, tokenIsExpired } from '../../helpers/authHelper';
import EnvData from '../EnvData';

export const instance = axios.create({
    baseURL: EnvData.REACT_APP_API_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 200000,
});

export const instanceMultipart = axios.create({
    baseURL: EnvData.REACT_APP_API_URL,
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 200000,
});

export const instanceNoAuth = axios.create({
    baseURL: EnvData.REACT_APP_API_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 200000,
});



const useConfig = async (config) => {

    // if access token has expire call refresh token
    // if (tokenIsExpired()) {
    //     // call refresh right here
    //     await getNewRefreshToken()
    // }
    const customConfig = config;
    if (localStorage.loggedWyreUserAdmin) {
        const user = JSON.parse(localStorage.loggedWyreUserAdmin);
        customConfig.headers.Authorization = `Bearer ${user.access}`;
    }

    return config;
};

const responseOk = (response) => response;

const responseError = async (error) => {
    // logoutOnUnauthorized(error);
    return Promise.reject(error);
};

instance.interceptors.request.use(useConfig);
instance.interceptors.response.use(responseOk, responseError);
instanceMultipart.interceptors.request.use(useConfig);
instanceMultipart.interceptors.response.use(responseOk, responseError);

export const APIService = {
    get(endpoint, config = null) {
        return config ? instance.get(endpoint, config) : instance.get(endpoint);
    },

    post(endpoint, data, config = {}) {
        return instance.post(endpoint, data, config);
    },

    patch(endpoint, data) {
        return instance.patch(endpoint, data);
    },

    delete(endpoint, data ={}) {
        return instance.delete(endpoint, { data });
    },

    put(endpoint, data) {
        return instance.put(endpoint, data);
    },

    postMultipart(endpoint, data, config = {}) {
        return instanceMultipart.post(endpoint, data, config);
    },

    patchMultipart(endpoint, data) {
        return instanceMultipart.patch(endpoint, data);
    },

    putMultipart(endpoint, data) {
        return instanceMultipart.put(endpoint, data);
    },

    suspendClient(clientId, isActive) {
        return instance.patch(`/api/v2/suspend_client/${clientId}/`, { is_active: isActive });
    },

    suspendBranch(branchId, isActive) {
        return instance.patch(`/api/v2/suspend_branch/${branchId}/`, { is_active: isActive });
    },

    forceLoginClientAdmin(clientId) {
        return instance.post(`/api/v2/force-login-client-admin/${clientId}/`);
    },

    forceLoginBranch(branchId) {
        return instance.post(`/api/v1/force-login/${branchId}/`);
    },

    getPermittedBranches() {
        return instance.get('/api/v1/accounts/user/permitted-branches/');
    },
};

export const APIServiceNoAuth = {
    get(endpoint, config = null) {
        return config ? instanceNoAuth.get(endpoint, config) : instanceNoAuth.get(endpoint);
    },

    post(endpoint, data) {
        return instanceNoAuth.post(endpoint, data);
    },

    patch(endpoint, data) {
        return instanceNoAuth.patch(endpoint, data);
    },

    delete(endpoint) {
        return instanceNoAuth.delete(endpoint);
    },

    put(endpoint, data) {
        return instanceNoAuth.put(endpoint, data);
    },
};

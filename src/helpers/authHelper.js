import jwtDecode from 'jwt-decode';
import store from '../redux/store/store';


import { loginUserSuccess } from '../redux/actions/auth/auth.creator';
import { logUserOut } from '../redux/actions/auth/auth.action';


const authHelper = () => {
    const getToken = localStorage.getItem('loggedWyreUserAdmin')
    if (getToken) {
        // decode the token
        const accessToken = JSON.parse(getToken);
        const decodedUserDetails = jwtDecode(accessToken.access)
        store.dispatch(loginUserSuccess(decodedUserDetails));

        const currentTime = Date.now() / 1000;
        if (decodedUserDetails.exp < currentTime) {
            // eslint-disable-next-line no-return-assign
            store.dispatch(logUserOut());
            return null;
        }
        return decodedUserDetails;
    } else {
        return null;
    }
};

export default authHelper;
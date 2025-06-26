import React from 'react';
import { Route, Routes } from 'react-router-dom';

import Login from '../../Pages/AuthPages/Login';

// import ScrollToTop from '../helpers/ScrollToTop';
import AuthHeader from '../../Pages/OtherPages/AuthHeader';
import Report from '../../Pages/AuthPages/Report';
import DownloadPage from '../../Pages/AuthPages/DownloadPage';
import ForceLoginHandler from "../../Pages/AuthPages/ForceLoginHandler";
import ForceLoginAdminHandler from "../../Pages/AuthPages/ForceLoginAdminHandler";

function AuthRoute() {
  return (
    <div>\
      <AuthHeader />

      <main className='auth-container'>
        {/* <ScrollToTop> */}
          <Routes>
          <Route exact path='/' element={<Login />} />
            {/* <Route exact path='/report' element={<Report/>} /> */}
            {/* <Route exact path='/in-mail' element={<InMail />} /> */}
            {/* <Route path='/about' element={<About />} /> */}
            {/* <Route path='/contact' element={<Contact />} /> */}
          {/* <Route path='/reset-password' element={<ResetPassword />} /> */}
          <Route path="/force-login" element={<ForceLoginHandler />}></Route>
          <Route path='/force-login-admin' element={<ForceLoginAdminHandler />} />
            <Route path='/download-csv' element={<DownloadPage />} />
          </Routes>
        {/* </ScrollToTop> */}
      </main>

      {/* <Footer /> */}
    </div>
  );
}

export default AuthRoute;

import React from 'react';
import { Route, Routes } from 'react-router-dom';

import Login from '../../Pages/AuthPages/Login';

// import ScrollToTop from '../helpers/ScrollToTop';
import Footer from '../../Pages/OtherPages/Footer';
import AuthHeader from '../../Pages/OtherPages/AuthHeader';

function AuthRoute() {
  return (
    <div>
      <AuthHeader />

      <main className='auth-container'>
        {/* <ScrollToTop> */}
          <Routes>
            <Route exact path='/' element={<Login />} />
            {/* <Route path='/about' element={<About />} /> */}
            {/* <Route path='/contact' element={<Contact />} /> */}
            {/* <Route path='/reset-password' element={<ResetPassword />} /> */}
            {/* <Route path='/download-csv' element={<DownloadPage />} /> */}
          </Routes>
        {/* </ScrollToTop> */}
      </main>

      <Footer />
    </div>
  );
}

export default AuthRoute;

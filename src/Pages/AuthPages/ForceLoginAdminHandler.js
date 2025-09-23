import React, { useEffect } from 'react';
import { Spin } from 'antd';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUserSuccess } from '../../redux/actions/auth/auth.creator';

const ForceLoginAdminHandler = (props) => {
  const navigate = useNavigate();

  useEffect(() => {
    const adminBackup = localStorage.getItem('adminUserBackup');
    if (adminBackup) {
      // Restore the stringified user object
      localStorage.setItem('loggedWyreUserAdmin', adminBackup);
      localStorage.removeItem('adminUserBackup');
      
      try {
        // Parse the user object and dispatch the login action
        const adminUser = JSON.parse(adminBackup);
        props.loginUserSuccess(adminUser);
      } catch (error) {
        console.error("Failed to parse admin backup data", error);
      }

      // Redirect to home page after restoring
      setTimeout(() => {
        window.location.replace('/');
      }, 500);

    } else {
      // If no backup, just go to the home page
      setTimeout(() => {
        window.location.replace('/');
      }, 1000);
    }
  }, [navigate, props]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Spin size="large" tip="Switching back to admin..." />
    </div>
  );
};

const mapDispatchToProps = {
  loginUserSuccess,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps, mapDispatchToProps)(ForceLoginAdminHandler); 
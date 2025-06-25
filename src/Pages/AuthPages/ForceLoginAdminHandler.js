import React, { useEffect } from 'react';
import { Spin } from 'antd';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUserSuccess } from '../../redux/actions/auth/auth.creator';

const ForceLoginAdminHandler = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const adminBackup = localStorage.getItem('adminUserBackup');
    if (adminBackup) {
      // Restore the stringified user object
      localStorage.setItem('loggedWyreUserAdmin', adminBackup);
      localStorage.removeItem('adminUserBackup');
      
      try {
        // Parse the user object and dispatch the login action
        const adminUser = JSON.parse(adminBackup);
        dispatch(loginUserSuccess(adminUser));
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
  }, [navigate, dispatch]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Spin size="large" tip="Switching back to admin..." />
    </div>
  );
};

export default ForceLoginAdminHandler; 
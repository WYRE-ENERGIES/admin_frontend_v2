import React, { useEffect } from 'react';
import { Spin } from 'antd';
import { useNavigate } from 'react-router-dom';

const ForceLoginHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const access = params.get('access');
    const refresh = params.get('refresh');
    const username = params.get('username');
    const email = params.get('email');
    const first_name = params.get('first_name');
    const last_name = params.get('last_name');

    if (access && refresh) {
      const userObj = {
        access,
        refresh,
        username,
        email,
        first_name,
        last_name,
      };
      localStorage.setItem('loggedWyreUserAdmin', JSON.stringify(userObj));
      setTimeout(() => {
        window.location.replace('/');
      }, 500);
    } else {
      // If tokens are missing, redirect to login
      setTimeout(() => {
        window.location.replace('/');
      }, 1000);
    }
  }, [navigate]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Spin size="large" tip="Switching user..." />
    </div>
  );
};

export default ForceLoginHandler; 
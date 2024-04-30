/* eslint-disable no-restricted-globals */
import React, { useState } from 'react';

import { Spin, Form, notification } from 'antd';
import { Input } from 'antd';
import { loginAUser } from '../../redux/actions/auth/auth.action';
import { connect } from 'react-redux';



function Login(props) {
  const [errorMessage, setErrorMessage] = useState(undefined);
  const [form] = Form.useForm();


  const onSubmit = async ({ username, password }) => {
    const request = await props.loginAUser({ username, password });

    if (!request.fulfilled) {
      return notification.error({
        message: 'Failed',
        description: request.message,
      });
    }
    const query = new URLSearchParams(location.search);
    const from = query.get('from') || '/';
    window.location.href = '/';
  };


  return (
    <div className='auth-page-container'>
      <Spin spinning={props.auth.loginUserLoading} >
        <div
          className='signup-login-contact-form'
        >
          <Form
            form={form}
            name='loginForm'
            onFinish={onSubmit}
            layout='vertical'
            labelAlign="center"
            style={{ display: 'block' }}
          >
            <h1 className='signup-login-heading first-heading--auth'>
              Welcome Back
            </h1>
            <Form.Item
              name='username'
              label='Username'
              rules={[
                { required: true, message: 'Please enter user name' },
                { max: 40, message: 'username cannot be more than 40 characters' }
              ]}

            >
              <Input className='signup-login-contact-input outlined-input' size='large' />
            </Form.Item>

            <Form.Item
              name='password'
              label='Password'
              validateTrigger={['onChange', 'onBlur']}
              rules={[
                { required: true, message: 'Please enter password' },
                { max: 60, message: 'username cannot be more than 60 characters' }
              ]}
            >
              <Input size='large' className='signup-login-contact-input outlined-input' type='password' />
            </Form.Item>


            <p className='signup-login-contact-error-message'>{errorMessage}</p>

            <div className='forgot-password-wrapper'>
              {/* <Link className='forgot-password' to='/reset-password'>
            Forgot Password?
          </Link> */}
            </div>
            <Form.Item>
              <button type='submit' className='signup-login-contact-button'>Log in</button>
            </Form.Item>


          </Form>
        </div>

        {/* <SocialCluster /> */}
      </Spin>
    </div>
    // @media screen and (max-width: 991px) {
  );
}

const mapDispatchToProps = {
  loginAUser
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps, mapDispatchToProps)(Login);






// end of script
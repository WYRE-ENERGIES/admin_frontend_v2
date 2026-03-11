import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { Spin, notification, Input } from 'antd';

import { confirmResetPasswordAction, validateResetTokenAction } from '../../redux/actions/auth/auth.action';
import { validateResetTokenSuccess } from '../../redux/actions/auth/auth.creator';
import HiddenInputLabel from '../smallComponents/HiddenInputLabel';
import SocialCluster from '../smallComponents/SocialCluster';

function ConfirmResetPassword() {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';

  const dispatch = useDispatch();
  const {
    confirmResetPasswordLoading: loading,
    validateResetTokenLoading: validatingToken,
    validateResetTokenData: tokenValidation,
  } = useSelector((state) => state.auth);
  const [errorMessage, setErrorMessage] = useState(null);
  const [success, setSuccess] = useState(false);
  const { control, handleSubmit } = useForm();

  useEffect(() => {
    if (tokenFromUrl) {
      dispatch(validateResetTokenSuccess(null));
      dispatch(validateResetTokenAction(tokenFromUrl));
    }
  }, [tokenFromUrl, dispatch]);

  const onSubmit = async ({ new_password, confirm_password }) => {
    setErrorMessage(null);
    if (new_password !== confirm_password) {
      setErrorMessage('New password and confirm password do not match.');
      return;
    }
    const result = await dispatch(
      confirmResetPasswordAction({ token: tokenFromUrl, new_password })
    );
    if (result?.fulfilled) {
      setSuccess(true);
      notification.success({ message: result.message || 'Password reset successfully.' });
    } else {
      setErrorMessage(result?.message || 'Something went wrong.');
      notification.error({ message: result?.message || 'Request failed' });
    }
  };

  if (success) {
    return (
      <div className='auth-page-container'>
        <div className='signup-login-contact-form'>
          <h1 className='signup-login-heading first-heading--auth'>Password Reset</h1>
          <p className='reset-password-note'>Your password has been reset successfully. You can now log in with your new password.</p>
          <Link
            className='signup-login-contact-button'
            to='/'
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', maxWidth: '350px', margin: '0 auto', textDecoration: 'none' }}
          >
            Log in
          </Link>
        </div>
        <SocialCluster />
      </div>
    );
  }

  if (!tokenFromUrl) {
    return (
      <div className='auth-page-container'>
        <div className='signup-login-contact-form'>
          <h1 className='signup-login-heading first-heading--auth'>Invalid or Expired Link</h1>
          <p className='reset-password-note'>
            This link is invalid or expired. Please request a new password reset using the link below.
          </p>
          <Link
            className='signup-login-contact-button'
            to='/reset-password'
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', maxWidth: '350px', margin: '0 auto', textDecoration: 'none' }}
          >
            Reset password
          </Link>
        </div>
        <SocialCluster />
      </div>
    );
  }

  if (validatingToken || tokenValidation === null) {
    return (
      <div className='auth-page-container'>
        <Spin spinning={true}>
          <div className='signup-login-contact-form'>
            <h1 className='signup-login-heading first-heading--auth'>Set New Password</h1>
            <p className='reset-password-note'>Checking your reset link…</p>
          </div>
          <SocialCluster />
        </Spin>
      </div>
    );
  }

  if (tokenValidation && !tokenValidation.valid) {
    const reasonText = tokenValidation.reason === 'expired' ? 'This link has expired.' : 'This link is no longer valid.';
    return (
      <div className='auth-page-container'>
        <div className='signup-login-contact-form'>
          <h1 className='signup-login-heading first-heading--auth'>Invalid or Expired Link</h1>
          <p className='reset-password-note'>
            {reasonText} Please request a new password reset using the link below.
          </p>
          <Link
            className='signup-login-contact-button'
            to='/reset-password'
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', maxWidth: '350px', margin: '0 auto', textDecoration: 'none' }}
          >
            Reset password
          </Link>
        </div>
        <SocialCluster />
      </div>
    );
  }

  return (
    <div className='auth-page-container'>
      <Spin spinning={loading}>
        <form
          className='signup-login-contact-form'
          action='#'
          onSubmit={handleSubmit(onSubmit)}
        >
          <h1 className='signup-login-heading first-heading--auth'>Set New Password</h1>

          <p className='reset-password-note'>
            Enter your new password below.
          </p>

          <p className='outlined-input-container'>
            <HiddenInputLabel htmlFor='new-password' />
            <Controller
              name='new_password'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  id='new-password'
                  className='signup-login-contact-input outlined-input'
                  placeholder='New password'
                  autoComplete='new-password'
                  size='large'
                />
              )}
            />
          </p>

          <p className='outlined-input-container'>
            <HiddenInputLabel htmlFor='confirm-password' />
            <Controller
              name='confirm_password'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  id='confirm-password'
                  className='signup-login-contact-input outlined-input'
                  placeholder='Confirm new password'
                  autoComplete='new-password'
                  size='large'
                />
              )}
            />
          </p>

          {errorMessage && <p className='signup-login-contact-error-message'>{errorMessage}</p>}

          <button className='signup-login-contact-button' type='submit' disabled={loading}>
            Set New Password
          </button>
        </form>

        <SocialCluster />
      </Spin>
    </div>
  );
}

export default ConfirmResetPassword;

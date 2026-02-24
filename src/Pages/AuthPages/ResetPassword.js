import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { Spin, notification } from 'antd';

import { resetPasswordAction } from '../../redux/actions/auth/auth.action';
import HiddenInputLabel from '../smallComponents/HiddenInputLabel';
import OutlinedInput from '../smallComponents/OutlinedInput';
import SocialCluster from '../smallComponents/SocialCluster';

function ResetPassword() {
  const dispatch = useDispatch();
  const { resetPasswordLoading: loading, resetPasswordData: successMessage } = useSelector((state) => state.auth);
  const [errorMessage, setErrorMessage] = useState(null);
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async ({ email }) => {
    setErrorMessage(null);
    const result = await dispatch(resetPasswordAction({ email }));
    if (result?.fulfilled) {
      reset();
      notification.success({ message: result.message || successMessage || 'Check your email for reset instructions.' });
    } else {
      setErrorMessage(result?.message || 'Something went wrong.');
      notification.error({ message: result?.message || 'Request failed' });
    }
  };

  return (
    <div className='auth-page-container'>
      <Spin spinning={loading}>
        <form
          className='signup-login-contact-form'
          action='#'
          onSubmit={handleSubmit(onSubmit)}
        >
          <h1 className='signup-login-heading first-heading--auth'>Reset Password</h1>

          <p className='reset-password-note'>
            Please fill in the form below with the email address associated with
            your account and click "Reset My Password". Instructions for resetting
            your password will be sent to you.
          </p>

          <p className='outlined-input-container'>
            {/* <HiddenInputLabel htmlFor='login-email' labelText='Email' /> */}
            <OutlinedInput
              className='signup-login-contact-input'
              type='email'
              name='email'
              id='login-email'
              placeholder='Email Address'
              autoComplete='email'
              required={true}
              autoFocus={true}
              register={register('email').ref}
              {...register('email', { required: true })}
            />
          </p>

          {errorMessage && <p className='signup-login-contact-error-message'>{errorMessage}</p>}

          <button className='signup-login-contact-button' type='submit' disabled={loading}>
            Reset Password
          </button>
        </form>

        <SocialCluster />
      </Spin>
    </div>
  );
}

export default ResetPassword;

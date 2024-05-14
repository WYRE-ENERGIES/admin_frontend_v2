import React from 'react';

const OutlinedInput = ({
  type,
  name,
  id,
  placeholder,
  autoComplete,
  required,
  autoFocus,
  register,
  className,
  onChange,
}) => {  
  return (
    <>
      <input
        className={className + ' outlined-input'}
        type={type}
        name={name}
        id={id}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        autoFocus={autoFocus}
        autoCapitalize="off"
        ref={register}
        onChange={onChange}
      /> 
    </>
  );
};

export default OutlinedInput;

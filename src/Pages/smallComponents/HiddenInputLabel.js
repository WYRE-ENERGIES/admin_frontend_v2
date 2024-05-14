import React from 'react';

const HiddenInputLabel = ({ htmlFor, labelText }) => {
  return (
    <label className='h-screen-reader-text' htmlFor={htmlFor}>
      {labelText}
    </label>
  );
};

export default HiddenInputLabel;

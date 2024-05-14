import React from 'react';

function GoogleIcon({ className }) {
  return (
    <svg
      className={className}
      xmlns='http://www.w3.org/2000/svg'
      width='25'
      height='24'
      fill='none'
      viewBox='0 0 25 24'
    >
      <path
        fill='#143861'
        fillRule='evenodd'
        d='M12.6 10.473v3.054h4.32a4.59 4.59 0 01-4.32 3.055A4.587 4.587 0 018.018 12 4.587 4.587 0 0112.6 7.418c1.095 0 2.149.393 2.967 1.106l2.007-2.303A7.568 7.568 0 0012.6 4.364c-4.21 0-7.637 3.425-7.637 7.636 0 4.21 3.426 7.636 7.637 7.636 4.21 0 7.636-3.425 7.636-7.636v-1.527H12.6z'
        clipRule='evenodd'
      ></path>
      <mask width='17' height='16' x='4' y='4' maskUnits='userSpaceOnUse'>
        <path
          fill='#fff'
          fillRule='evenodd'
          d='M12.6 10.473v3.054h4.32a4.59 4.59 0 01-4.32 3.055A4.587 4.587 0 018.018 12 4.587 4.587 0 0112.6 7.418c1.095 0 2.149.393 2.967 1.106l2.007-2.303A7.568 7.568 0 0012.6 4.364c-4.21 0-7.637 3.425-7.637 7.636 0 4.21 3.426 7.636 7.637 7.636 4.21 0 7.636-3.425 7.636-7.636v-1.527H12.6z'
          clipRule='evenodd'
        ></path>
      </mask>
    </svg>
  );
}

export default GoogleIcon;

import React from 'react';

function FacebookIcon({ className }) {
  return (
    <svg
      className={className}
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      fill='none'
      viewBox='0 0 24 24'
    >
      <path
        fill='#143861'
        fillRule='evenodd'
        d='M13.635 20.727v-7.961h2.723l.409-3.104h-3.132V7.681c0-.898.253-1.51 1.568-1.51l1.674-.001V3.394a23.143 23.143 0 00-2.44-.122c-2.415 0-4.069 1.447-4.069 4.102v2.288H7.636v3.104h2.732v7.96h3.267z'
        clipRule='evenodd'
      ></path>
      <mask width='10' height='18' x='7' y='3' maskUnits='userSpaceOnUse'>
        <path
          fill='#fff'
          fillRule='evenodd'
          d='M13.635 20.727v-7.961h2.723l.409-3.104h-3.132V7.681c0-.898.253-1.51 1.568-1.51l1.674-.001V3.394a23.143 23.143 0 00-2.44-.122c-2.415 0-4.069 1.447-4.069 4.102v2.288H7.636v3.104h2.732v7.96h3.267z'
          clipRule='evenodd'
        ></path>
      </mask>
    </svg>
  );
}

export default FacebookIcon;

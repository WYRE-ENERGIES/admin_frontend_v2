import React from 'react';
import { Link } from 'react-router-dom';

function AuthHeaderLink({ linkText, url, onClick, className }) {
  return (
    <li className='header-nav-list__item--auth'>
      <Link className='header-link--auth' onClick={onClick} to={url}>
        {linkText}
      </Link>
    </li>
  );
}

export default AuthHeaderLink;

import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
// import CompleteDataContext from '../Context';

import AuthHeaderLink from '../../components/header/AuthHeaderLink';

import LatestLogo from '../../components/icons/LatestLogo';
import Hamburger from '../../components/icons/Hamburger';

function AuthHeader() {
//   const { isNavOpen, setIsNavOpen } = useContext(CompleteDataContext);

const [ isNavOpen, setIsNavOpen ] = useState(false);

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
    // setIsNavOpen(!false);
  };

  return (
    <header className='header--auth'>
      <div className='header-logo-and-hamburger--auth'>
        <Link className='header-logo--auth' to='/'>
          <LatestLogo className='header-logo-latest-image--auth' />
        </Link>
        {/* <button
          className='hamburger-button--auth h-hidden-medium-up'
          onClick={toggleNav}
        >
          <Hamburger className='hamburger-button__image--auth' />
        </button> */}
      </div>

      <nav
        className={
          isNavOpen
            ? 'header-nav--auth'
            : 
            'header-nav--auth h-hidden-medium-down'
        }
      >
        <ul className='header-links-list--auth'>
          {/* <AuthHeaderLink onClick={toggleNav} url='#' linkText='About' /> */}
          {/* <AuthHeaderLink onClick={toggleNav} url='#' linkText='Features' /> */}
          <AuthHeaderLink
            onClick={toggleNav}
            url='/contact'
            linkText='Contact'
          />
          {/* <AuthHeaderLink onClick={toggleNav} url='/log-in' linkText='Log in' /> */}
          <li className='header-nav-list__item--auth'>
            <a
              target="_blank"
              className='header-short-button--auth header-link--auth'
              href='https://www.wyreng.com/get-started' rel="noreferrer"
            >
              Get Started
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default AuthHeader;





// end of script
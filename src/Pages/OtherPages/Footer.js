import React from 'react';
import { Link } from 'react-router-dom';
import FooterLink from './FooterLink';

// import Logo from '../icons/Logo';

function Footer() {
  return (
    <footer className='footer'>
      <div className='footer-top'>
        <Link className='footer-logo-container' to='/'>
          {/* <Logo className='footer-logo-image' /> */}
        </Link>

        <div className='all-footer-links '>
          <div className='footer-links-container first'>
            <h4 className='footer-heading'>Company</h4>
            <ul className='footer-links-list list-reset'>
              <FooterLink linkText='Home' url='/' />
              <FooterLink linkText='About' url='#' />
              <FooterLink linkText='Features' url='#' />
              <FooterLink linkText='Contact' url='/contact' />
            </ul>
          </div>

          <div className='footer-links-container second'>
            <h4 className='footer-heading'>Legal</h4>
            <ul className='footer-links-list list-reset'>
              <FooterLink linkText='Terms & Conditions' url='#' />
              <FooterLink linkText='Privacy Policy' url='#' />
              <FooterLink linkText='Cookie Policy' url='#' />
            </ul>
          </div>

          <div className='footer-links-container third'>
            <h4 className='footer-heading'>Contacts</h4>
            <address>
              <ul className='footer-links-list list-reset'>
                <li className='footer-links-list-item'>
                  42 Montegomery Street Sabo, Yaba, Lagos State.
                </li>
                <li className='footer-links-list-item'>
                  <a className='footer-link' href='tel:+2348099443659'>
                    (+234) 809 944 3659
                  </a>
                </li>
                <li className='footer-links-list-item'>
                  <a className='footer-link' href='mailto:hello@wyre.com'>
                    hello@wyre.com
                  </a>
                </li>
              </ul>
            </address>
          </div>
        </div>
      </div>

      <div className='footest'>
        <p className='footest-text'>&copy; {new Date().getFullYear()} Wyre</p>
      </div>
    </footer>
  );
}

export default Footer;

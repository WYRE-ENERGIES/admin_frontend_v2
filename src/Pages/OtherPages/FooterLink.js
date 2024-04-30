import React from 'react';
import { Link } from 'react-router-dom';

// const FooterLink = ({ linkText, url }) => {
function FooterLink({ linkText, url, }) {
  return (
    <li className='footer-links-list-item'>
      <Link className='footer-link' to={url}>
        {linkText}
      </Link>
    </li>
  );
};

export default FooterLink;

import React from 'react';
import { Link } from 'react-router-dom';

import FacebookIcon from '../icons/FacebookIcon';
import GoogleIcon from '../icons/GoogleIcon';
import InstagramIcon from '../icons/InstagramIcon';
import TwitterIcon from '../icons/TwitterIcon';

function SocialCluster() {
  return (
    <div className='social-cluster-container'>
      <Link to='/'>
        <FacebookIcon className='social-cluster-item' />
      </Link>
      <Link to='/'>
        <GoogleIcon className='social-cluster-item' />
      </Link>
      <Link to='/'>
        <TwitterIcon className='social-cluster-item' />
      </Link>
      <Link to='/'>
        <InstagramIcon className='social-cluster-item h-no-right-margin' />
      </Link>
    </div>
  );
}

export default SocialCluster;

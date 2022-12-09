import {
  useAuth0
} from '@auth0/auth0-react';

import LoginButton from './LoginButton';
import LogoutButton from './LogoutButton';

import './Navbar.css';

export default function Navbar () {
  const {
    isAuthenticated
  } = useAuth0();

  return (
    <nav className='Navbar navbar-default'>
      {!isAuthenticated &&
        <LoginButton />
      }

      {isAuthenticated &&
        <LogoutButton />
      }
    </nav>
  );
}

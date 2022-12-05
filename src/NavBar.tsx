import { useAuth0 } from "@auth0/auth0-react";

import LoginButton from './LoginButton'
import LogoutButton from './LogoutButton'

export default function Navbar () {
  const { isAuthenticated } = useAuth0();

  return (
    <nav className='navbar navbar-default'>
      <div className='container-fluid'>
        <div className='navbar-form'>

          {!isAuthenticated &&
            <LoginButton />
          }

          {isAuthenticated &&
            <LogoutButton />
          }

        </div>
      </div>
    </nav>
  );
}

/**
 * renshuu.paazmaya.fi
 * https://github.com/paazmaya/renshuu.paazmaya.fi
 * Plan your training journey
 *
 * Copyright (c) Juga Paazmaya <paazmaya@yahoo.com> (https://paazmaya.fi)
 * Licensed under the MIT license.
 */
import React, {Component, PropTypes} from 'react';
import Login from './Login';
import Logout from './Logout';
import {loginUser, logoutUser} from '../actions';


/*
In order to use Auth0, replace loginUser with login

<Login
  errorMessage={errorMessage}
  onLoginClick={ creds => dispatch(login(creds)) }
/>
*/
export default class Navbar extends Component {

  render() {
    const {dispatch, isAuthenticated, errorMessage} = this.props;

    return (
      <nav className='navbar navbar-default'>
        <div className='container-fluid'>
          <a className="navbar-brand" href="#">Quotes App</a>
          <div className='navbar-form'>

            {!isAuthenticated &&
              <Login
                errorMessage={errorMessage}
                onLoginClick={ creds => dispatch(loginUser(creds)) }
              />
            }

            {isAuthenticated &&
              <Logout onLogoutClick={() => dispatch(logoutUser())} />
            }

          </div>
        </div>
      </nav>
    );
  }

}

Navbar.propTypes = {
  dispatch: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string
};

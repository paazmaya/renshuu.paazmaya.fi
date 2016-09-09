/**
 * renshuu.paazmaya.fi
 * https://github.com/paazmaya/renshuu.paazmaya.fi
 * Plan your training journey
 *
 * Copyright (c) Juga Paazmaya <paazmaya@yahoo.com> (https://paazmaya.fi)
 * Licensed under the MIT license.
 */
import React, {Component, PropTypes} from 'react';

export default class Login extends Component {

  render() {
    const {errorMessage} = this.props;

    return (
      <div className="login-form">
        <input type='text' ref='username' className="form-control" placeholder='Username'/>
        <input type='password' ref='password' className="form-control" placeholder='Password'/>
        <button onClick={(event) => this.handleClick(event)} className="btn btn-primary">
          Login
        </button>

        {errorMessage &&
          <p className="error">{errorMessage}</p>
        }
      </div>
    );
  }

  handleClick(event) {
    const username = this.refs.username;
    const password = this.refs.password;
    const creds = {username: username.value.trim(), password: password.value.trim()};
    this.props.onLoginClick(creds);
  }
}

Login.propTypes = {
  onLoginClick: PropTypes.func.isRequired,
  errorMessage: PropTypes.string
};

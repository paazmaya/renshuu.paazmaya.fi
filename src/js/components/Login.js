/**
 * renshuu.paazmaya.fi
 * https://github.com/paazmaya/renshuu.paazmaya.fi
 * Plan your training journey
 *
 * Copyright (c) Juga Paazmaya <paazmaya@yahoo.com> (https://paazmaya.fi)
 * Licensed under the MIT license.
 */
import PropTypes from 'prop-types';

export default function Login (props) {

  const {
    errorMessage
  } = props;

  const handleClick = (event) => {
    const {
      username
    } = this.refs;
    const {
      password
    } = this.refs;
    const creds = {
      username: username.value.trim(),
      password: password.value.trim()
    };
    this.props.onLoginClick(creds);
  };

  return (
    <div className="login-form">
      <input type='text' ref='username' className="form-control" placeholder='Username'/>
      <input type='password' ref='password' className="form-control" placeholder='Password'/>
      <button onClick={(event) => handleClick(event)} className="btn btn-primary">
        Login
      </button>

      {errorMessage &&
        <p className="error">{errorMessage}</p>
      }
    </div>
  );
}

Login.propTypes = {
  onLoginClick: PropTypes.func.isRequired,
  errorMessage: PropTypes.string
};

/**
 * renshuu.paazmaya.fi
 * https://github.com/paazmaya/renshuu.paazmaya.fi
 * Plan your training journey
 *
 * Copyright (c) Juga Paazmaya <paazmaya@yahoo.com> (https://paazmaya.fi)
 * Licensed under the MIT license.
 */

import React, {
  Component, PropTypes
} from 'react';
import {
  connect
} from 'react-redux';
import {
  loginUser, fetchQuote, fetchSecretQuote
} from '../actions';
import Login from '../components/Login';
import Navbar from '../components/Navbar';
import Quotes from '../components/Quotes';


/*
If we comment out the Quotes component pieces of containers/App.js
and remove the api middleware call in our index.js file,
we should be able to log in. There is a default user on the server with
gonto as the username and password.
With a successful login, we get the token saved in local storage.
*/
class App extends Component {
  render() {
    const {
      dispatch, quote, isAuthenticated, errorMessage, isSecretQuote
    } = this.props;

    return (
      <div>
        <Navbar
          isAuthenticated={isAuthenticated}
          errorMessage={errorMessage}
          dispatch={dispatch}
        />
        <div className='container'>
          <Quotes
            onQuoteClick={() => dispatch(fetchQuote())}
            onSecretQuoteClick={() => dispatch(fetchSecretQuote())}
            isAuthenticated={isAuthenticated}
            quote={quote}
            isSecretQuote={isSecretQuote}
          />
        </div>
      </div>
    );
  }
}

App.propTypes = {
  dispatch: PropTypes.func.isRequired,
  quote: PropTypes.string,
  isAuthenticated: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
  isSecretQuote: PropTypes.bool.isRequired
};

// These props come from the application's
// state when it is started
function mapStateToProps(state) {

  const {
    quotes, auth
  } = state;
  const {
    quote, authenticated
  } = quotes;
  const {
    isAuthenticated, errorMessage
  } = auth;

  return {
    quote,
    isSecretQuote: authenticated,
    isAuthenticated,
    errorMessage
  };
}

export default connect(mapStateToProps)(App);

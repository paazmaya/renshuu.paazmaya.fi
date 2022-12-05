/**
 * renshuu.paazmaya.fi
 * https://github.com/paazmaya/renshuu.paazmaya.fi
 * Plan your training journey
 *
 * Copyright (c) Juga Paazmaya <paazmaya@yahoo.com> (https://paazmaya.fi)
 * Licensed under the MIT license.
 */

import {
  render
} from 'react-dom';
import {
  createStore, applyMiddleware
} from 'redux';
import {
  Provider
} from 'react-redux';
import App from './containers/App.js';
import quotesApp from './reducers.js';
import thunkMiddleware from 'redux-thunk';
import api from './middleware/api.js';

const createStoreWithMiddleware = applyMiddleware(thunkMiddleware, api)(createStore);

const store = createStoreWithMiddleware(quotesApp);

const rootElement = document.getElementById('root');

render(
  <Provider store={store}>
    <App />
  </Provider>,
  rootElement
);

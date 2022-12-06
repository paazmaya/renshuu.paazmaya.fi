/**
 * renshuu.paazmaya.fi
 * https://github.com/paazmaya/renshuu.paazmaya.fi
 * Plan your training journey
 *
 * Copyright (c) Juga Paazmaya <paazmaya@yahoo.com> (https://paazmaya.fi)
 * Licensed under the MIT license.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  Auth0Provider
} from '@auth0/auth0-react';
import App from './App';

import './index.css';

const DOMAIN = 'paazmaya.eu.auth0.com';
const CLIENTID = 'Rkp2w5faXZPHT22d8RTbENGt4clCfAmu';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Auth0Provider
      domain={DOMAIN}
      clientId={CLIENTID}
      redirectUri={window.location.origin}
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>
);

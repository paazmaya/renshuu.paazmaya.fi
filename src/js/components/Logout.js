/**
 * renshuu.paazmaya.fi
 * https://github.com/paazmaya/renshuu.paazmaya.fi
 * Plan your training journey
 *
 * Copyright (c) Juga Paazmaya <paazmaya@yahoo.com> (https://paazmaya.fi)
 * Licensed under the MIT license.
 */
import PropTypes from 'prop-types';

export default function Logout (props) {

  const {
    onLogoutClick
  } = props;

  return (
    <button onClick={() => onLogoutClick()} className="btn btn-primary">
      Logout
    </button>
  );
}

Logout.propTypes = {
  onLogoutClick: PropTypes.func.isRequired
};

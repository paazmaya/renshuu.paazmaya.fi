/**
 * renshuu.paazmaya.fi
 * https://github.com/paazmaya/renshuu.paazmaya.fi
 * Plan your training journey
 *
 * Copyright (c) Juga Paazmaya <paazmaya@yahoo.com> (https://paazmaya.fi)
 * Licensed under the MIT license.
 */
import React, {Component, PropTypes} from 'react';

export default class Logout extends Component {

  render() {
    const {onLogoutClick} = this.props;

    return (
      <button onClick={() => onLogoutClick()} className="btn btn-primary">
        Logout
      </button>
    );
  }

}

Logout.propTypes = {
  onLogoutClick: PropTypes.func.isRequired
};

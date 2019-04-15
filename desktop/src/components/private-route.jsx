import React from 'react'
import { Route, Redirect } from 'react-router-dom'
import PropTypes from 'prop-types'

function PrivateRoute({ component: Component, registered, ...rest }) {
  return (
    <Route
      {...rest} 
      render={props =>
        registered === true ? (
          <Component {...props} />
        ) : (
          <Redirect to='/register'/>
        )
      }
    />
  )
}

PrivateRoute.propTypes = {
  component: PropTypes.any,
  registered: PropTypes.bool.isRequired,
}

export default PrivateRoute

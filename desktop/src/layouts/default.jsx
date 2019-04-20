import React, { memo } from 'react'
import PropTypes from 'prop-types'

function DefaultLayout({ children }) {
  return <div className="container my-5">{children}</div>
}

DefaultLayout.propTypes = {
  children: PropTypes.any
}

export default memo(DefaultLayout)

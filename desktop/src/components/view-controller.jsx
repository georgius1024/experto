import React, { memo } from 'react'
import PresenterView from './views/presenter'
import App from './App'
function ViewController({ history }) {
  const query = window.location.search.substring(1)
  if (query) {
    const [, code] = query.split('=')
    return <PresenterView code={code} />
  } else {
    return <App />
  }
}
export default memo(ViewController)

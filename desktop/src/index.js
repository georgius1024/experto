import React, { memo } from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import store from './store'
import App from './App.jsx'
import Presenter from './Presenter'
import './patch_sdp'

function ViewController() {
  const query = window.location.search.substring(1)
  if (query) {
    const [, code] = query.split('=')
    return <Presenter code={code} />
  } else {
    return <App />
  }
}

ReactDOM.render(
  <Provider store={store}>
    <ViewController />
  </Provider>,
  document.getElementById('root')
)

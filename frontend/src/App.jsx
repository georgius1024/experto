import React, { PureComponent } from 'react'
import { HashRouter, Route, Switch } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import RootView from './views/root'
import RoomView from './views/room'
import ErrorView from './views/404'

import './assets/bootstrap.css'
import '@fortawesome/fontawesome-free/css/all.css'
import 'react-toastify/dist/ReactToastify.css'
import './App.scss'

class App extends PureComponent {
  render() {
    return (
      <div className="container full-height">
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar
          newestOnTop={false}
          closeOnClick
          pauseOnVisibilityChange={false}
          draggable
          pauseOnHover
        />
        <HashRouter>
          <Switch>
            <Route exact path="/" component={RootView} />
            <Route path="/room/:code" component={RoomView} />
            <Route path="*" component={ErrorView} />
          </Switch>
        </HashRouter>
      </div>
    )
  }
}

export default App

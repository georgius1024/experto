import React, { PureComponent } from 'react'
import { HashRouter, Route, Switch } from 'react-router-dom'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import Alert from './components/alert'
import Loading from './components/loading'
import RegisterView from './views/register'
import RoomView from './views/presenter'
import ErrorView from './views/404'

import './assets/bootstrap.css'
import '@fortawesome/fontawesome-free/css/all.css'
import './App.scss'

class App extends PureComponent {
  render() {
    return (
      <div className="container full-height">
        <Loading />
        <Alert />
        <HashRouter>
          <Switch>
            <Route exact path="/" component={RegisterView} />
            <Route path="/room/:code" component={RoomView} />
            <Route path="*" component={ErrorView} />
          </Switch>
        </HashRouter>
      </div>
    )
  }
}

App.propTypes = {}

const mapStateToProps = state => {
  return {}
}

const mapDispatchToProps = dispatch => {
  return {}
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App)

import React, { PureComponent } from 'react'
import { MemoryRouter, Route, Switch } from 'react-router-dom'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import Alert from './components/alert'
import Loading from './components/loading'
import PrivateRoute from './components/private-route'
import MainView from './views/main'
import RegisterView from './views/register'
import CreateRoomView from './views/create-room'
import UpdateRoomView from './views/update-room'
import PresenterView from './views/presenter'
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
        <MemoryRouter>
          <Switch>
            <PrivateRoute exact path="/" component={MainView} registered={this.props.registered} />
            <PrivateRoute exact path="/create-first" component={CreateRoomView} registered={this.props.registered} />
            <PrivateRoute exact path="/create" component={CreateRoomView} registered={this.props.registered} />
            <PrivateRoute exact path="/update/:id" component={UpdateRoomView} registered={this.props.registered} />
            <PrivateRoute exact path="/start/:code" component={PresenterView} registered={this.props.registered} />
            <Route path="/register" component={RegisterView} />
            <Route path="*" component={ErrorView} />
          </Switch>
        </MemoryRouter>
      </div>
    )
  }
}

App.propTypes = {
  registered: PropTypes.bool
}

const mapStateToProps = state => {
  return {
    registered: Boolean(state.registration.accessToken)
  }
}

const mapDispatchToProps = dispatch => {
  return {}
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App)

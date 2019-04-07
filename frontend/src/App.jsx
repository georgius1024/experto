import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { HashRouter, Route, Switch } from 'react-router-dom'

import classNames from 'classnames'
import ObservableSocket from './observable-socket'
import actions from './store/actions'

import HomeView from './views/Home'
import CreateAppointmentView from './views/CreateAppointment'
import UpdateAppointmentView from './views/UpdateAppointment'

import PresenterView from './views/Presenter'
import GuestView from './views/Guest'

import ErrorView from './views/404'

import './assets/bootstrap.css'
import '@fortawesome/fontawesome-free/css/all.css'
import './patch_sdp'

const roomMagicCode = 'master'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      socketConected: false,
      errorMessage: '',
      genericMessage: ''
    }
    const BACKEND_URL = process.env.NODE_ENV === 'production' ? window.location.host : '127.0.0.1:6300'
    //'192.168.1.40:6300'

    this.socket = new ObservableSocket(`wss://${BACKEND_URL}/api/${roomMagicCode}`)
    this.socket.reconnectInterval = 1000 * 10
    this.socket.open$.subscribe(() => {
      this.setState({ modalActive: true, socketConected: true })
    })

    this.socket.error$.subscribe(() => {
      this.error('Socket error')
      this.setState({ socketConected: false })
      this.props.appointmentUpdate({})
      this.props.userNameUpdate('')
    })

    this.socket.close$.subscribe(() => {
      this.error('Socket disconnected')
      this.setState({ socketConected: false })
      this.props.appointmentUpdate({})
      this.props.userNameUpdate('')
    })

    this.socket.message$.subscribe(message => {
      switch (message.id) {
      case 'welcome':
        this.props.userNameUpdate(message.userName)
        this.send('list')
        break
      case 'list':
        if (!this.props.appointment.roomId) {
          if (message.data.length) {
            const { id: roomId } = message.data.slice(-1)[0]
            if (roomId) {
              this.send('report', { roomId })
            }
          }
        }
        break
      case 'report':
        {
          const roomData = {
            roomId: message.data.id,
            roomName: message.data.name
          }
          if (message.data.registrations && message.data.registrations['listener']) {
            roomData.personName = message.data.registrations['listener'].name
            roomData.personEmail = message.data.registrations['listener'].email
          }
          roomData.registrations = message.data.registrations
          this.props.appointmentUpdate(roomData)
          window.location.hash = '#/' // <- ГРЯЗНЫЙ ХАК, УСТРАНИТЬ TODO
        }
        break
      case 'error':
        this.error(message.message)
        break
      default:
      }
    })

    this.login = this.login.bind(this)
    this.logout = this.logout.bind(this)
    this.send = this.send.bind(this)

    this.props.controlSocketUpdate(this.socket)
  }

  componentDidMount() {
    this.login()
  }

  componentWillUnmount() {
    this.logout()
  }

  send(id, data) {
    this.socket.sendMessage(id, data)
  }

  login() {
    this.socket.reconnect = true
    this.socket.connect()
  }

  logout() {
    this.props.userNameUpdate('')
    this.props.appointmentUpdate({})
    this.socket.reconnect = false
    this.socket.disconnect()
  }

  error(error) {
    console.error(error)
    if (typeof error !== 'string') {
      if (typeof error.message === 'string') {
        error = error.message
      } else {
        error = JSON.stringify(error)
      }
    }
    this.setState({ errorMessage: error })
    setTimeout(() => {
      this.setState({ errorMessage: '' })
    }, 3000)
  }

  message(message) {
    if (typeof message !== 'string') {
      message = JSON.stringify(message)
    }
    this.setState({ genericMessage: message })
    setTimeout(() => {
      this.setState({ genericMessage: '' })
    }, 3000)
  }

  render() {
    return (
      <div className="container">
        <div
          className={classNames({
            alert: true,
            'alert-primary': true,
            'my-3': true,
            'd-none': !this.state.genericMessage
          })}
          role="alert"
        >
          {String(this.state.genericMessage)}
        </div>
        <div
          className={classNames({
            alert: true,
            'alert-danger': true,
            'my-3': true,
            'd-none': !this.state.errorMessage
          })}
          role="alert"
        >
          {String(this.state.errorMessage)}
        </div>

        <nav className="navbar navbar-light bg-light mb-5">
          <a href="#/" className="navbar-brand mb-0 h1">
            <span className="ml-2">APP-X</span>
          </a>
          <span
            className={classNames({
              'd-none': !this.state.socketConected
            })}
          >
            Вы зашли, как {this.props.userName}
            <button className="btn btn-link ml-2" disabled={!this.state.socketConected} onClick={this.logout}>
              <i className="fas fa-sign-out-alt mr-1" />
              Выйти
            </button>
          </span>
        </nav>
        <div
          className={classNames({
            'mt-5': true,
            jumbotron: true,
            'jumbotron-fluid': true,
            'd-none': this.state.socketConected
          })}
        >
          <div className="container">
            <h1 className="display-4">Подключение</h1>
            <p className="lead">Кликните, чтобы установить соединение</p>
            <hr className="my-4" />
            <button className="btn btn-primary btn-lg" onClick={this.login}>
              <i className="fas fa-sign-in-alt mr-2" />
              Подключиться
            </button>
          </div>
        </div>
        {this.state.socketConected ? (
          <HashRouter>
            <Switch>
              <Route exact path="/" component={HomeView} />
              <Route path="/create" component={CreateAppointmentView} />
              <Route path="/update" component={UpdateAppointmentView} />
              <Route path="/presenter/:code" component={PresenterView} />
              <Route path="/guest/:code" component={GuestView} />
              <Route path="*" component={ErrorView} />
            </Switch>
          </HashRouter>
        ) : null}
      </div>
    )
  }
}

App.propTypes = {
  userName: PropTypes.string,
  userNameUpdate: PropTypes.func,
  appointment: PropTypes.object,
  appointmentUpdate: PropTypes.func,
  controlSocket: PropTypes.object,
  controlSocketUpdate: PropTypes.func
}

const mapStateToProps = state => {
  return {
    userName: state.userName,
    appointment: state.appointment,
    controlSocket: state.controlSocket
  }
}

const mapDispatchToProps = dispatch => {
  return {
    userNameUpdate: payload => dispatch(actions.userNameUpdate(payload)),
    appointmentUpdate: payload => dispatch(actions.appointmentUpdate(payload)),
    controlSocketUpdate: payload => dispatch(actions.controlSocketUpdate(payload))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App)

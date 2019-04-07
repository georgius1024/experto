import React, { Fragment, PureComponent } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Link, withRouter } from 'react-router-dom'
import actions from '../store/actions'
import AppointmentForm from '../Components/AppointmentForm'
import AppointmentsList from '../Components/AppointmentsList'
/* eslint-disable no-script-url*/
class Home extends PureComponent {
  componentDidMount() {
    if (!this.props.appointment.roomId) {
      this.props.history.push('/create')
    } else {
      this.props.controlSocket.sendMessage('list')
    }
  }
  componentDidUpdate() {
    if (!this.props.appointment.roomId) {
      this.props.history.push('/create')
    }
  }
  render() {
    const notification = () => {
      this.props.controlSocket.sendMessage('notify', { roomId: this.props.appointment.roomId })
    }
    const presenterCode =
      this.props.appointment.registrations && this.props.appointment.registrations['presenter']
        ? this.props.appointment.registrations['presenter'].code
        : null
    const listenerCode =
      this.props.appointment.registrations && this.props.appointment.registrations['listener']
        ? this.props.appointment.registrations['listener'].code
        : null
    const guestCode =
      this.props.appointment.registrations && this.props.appointment.registrations['guest']
        ? this.props.appointment.registrations['guest'].code
        : null
    return (
      <Fragment>
        <div className="card mt-5">
          <div className="card-body">
            <Link className="float-right" to="/update">
              Редактировать
            </Link>
            <h5 className="card-title">Встреча назначена</h5>
            <div className="card-text">
              <AppointmentForm readOnly={true} model={this.props.appointment} />
            </div>
          </div>
          <div className="card-footer">
            <Link to="/create" className="btn btn-primary">
              Новая встреча
            </Link>
            <button className="btn btn-primary ml-3" onClick={notification}>
              Уведомление
            </button>
            {guestCode ? (
              <Link to={'/guest/' + guestCode} className="btn btn-link float-right">
                Гость
              </Link>
            ): null}
            {listenerCode ? <button className="btn btn-link float-right">Слушатель</button> : null}
            {presenterCode ? (
              <Link to={'/presenter/' + presenterCode} className="btn btn-link float-right">
                Ведущий
              </Link>
            ) : null}
          </div>
        </div>
        <hr className="my-3" />
        <AppointmentsList />
      </Fragment>
    )
  }
}

Home.propTypes = {
  controlSocket: PropTypes.object,
  appointment: PropTypes.object,
  appointmentUpdate: PropTypes.func,
  history: PropTypes.object
}

const mapStateToProps = state => {
  return {
    appointment: state.appointment,
    controlSocket: state.controlSocket
  }
}

const mapDispatchToProps = dispatch => {
  return {
    appointmentUpdate: payload => dispatch(actions.appointmentUpdate(payload))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(Home))

/*
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { HashRouter, Route, Switch } from 'react-router-dom'

import classNames from 'classnames'
import ObservableSocket from './observable-socket'
import actions from './store/actions'
import ListGroup from 'react-bootstrap/ListGroup'
//import styles from './App.module.scss'

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
      genericMessage: '',
      rooms: [],
      selectedRoomId: ''
    }
    const BACKEND_URL = process.env.NODE_ENV === 'production' ? window.location.host : '192.168.1.40:6300'
    this.socket = new ObservableSocket(`wss://${BACKEND_URL}/api/${roomMagicCode}`)

    this.socket.reconnect = true
    this.socket.reconnectInterval = 1000 * 60

    this.socket.open$.subscribe(() => {
      this.setState({ modalActive: true, socketConected: true })
    })

    this.socket.error$.subscribe(() => {
      this.error('Socket error')
      this.setState({ socketConected: false })
      this.props.userNameUpdate('')
    })

    this.socket.close$.subscribe(() => {
      this.error('Socket disconnected')
      this.setState({ socketConected: false })
      this.props.userNameUpdate('')
    })

    this.socket.message$.subscribe(message => {
      console.log(message)
      switch (message.id) {
      case 'welcome':
        this.props.userNameUpdate(message.userName)
        this.send('list')
        break
      case 'list':
        this.setState(state => {
          const result = { rooms: message.data }
          if (message.data.length && !message.data.find(room => room.id === state.selectedRoomId)) {
            result.selectedRoomId = message.data[0].id
          }
          return result
        })
        break
      case 'report':
        {
          const index = this.state.rooms.findIndex(room => room.id === message.data.id)
          if (index >= 0) {
            this.setState({
              rooms: [...this.state.rooms.map(room => (room.id === message.data.id ? message.data : room))],
              selectedRoomId: message.data.id
            })
          } else {
            this.setState({
              rooms: [...this.state.rooms, message.data],
              selectedRoomId: message.data.id
            })
          }
        }
        break
      case 'error':
        this.error(message.message)
        break
      default:
      }
    })
    this.logging = process.env.NODE_ENV !== 'production'
    this.login = this.login.bind(this)
    this.logout = this.logout.bind(this)
    this.createRoom = this.createRoom.bind(this)
    this.updateRoom = this.updateRoom.bind(this)
    this.deleteRoom = this.deleteRoom.bind(this)
  }

  componentDidMount() {}

  componentWillUnmount() {
    this.logout()
  }

  send(id, data) {
    this.socket.sendMessage(id, data)
  }

  log(message, data) {
    if (this.logging) {
      if (arguments.length === 2) {
        console.log('App:', message, data)
      } else {
        console.log('App:', message)
      }
    }
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
    this.log('got message', message)
    this.setState({ genericMessage: message })
    setTimeout(() => {
      this.setState({ genericMessage: '' })
    }, 3000)
  }

  login() {
    this.socket.connect()
  }

  logout() {
    this.props.userNameUpdate('')
    this.socket.disconnect()
  }

  selectRoom(id) {
    this.setState({
      selectedRoomId: id
    })
  }
  createRoom() {
    this.send('create', {
      name: 'Polska strong!'
    })
  }
  updateRoom(roomId) {
    this.send('update', {
      name: 'Polska strong!%$',
      roomId
    })
  }
  deleteRoom(roomId) {
    this.send('delete', {
      roomId
    })
  }
  render() {
    return (
      <div className="container">
        <div
          className={classNames({
            alert: true,
            'alert-primary': true,
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
            'd-none': !this.state.errorMessage
          })}
          role="alert"
        >
          {String(this.state.errorMessage)}
        </div>

        <nav className="navbar navbar-light bg-light">
          <span className="navbar-brand mb-0 h1">
            <span className="ml-2">Дашборд</span>
          </span>
          <span>{this.props.userName}</span>

          <button className="btn btn-link" disabled={!this.state.socketConected} onClick={this.logout}>
            <i className="fas fa-sign-out-alt mr-1" />
            Выйти
          </button>
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
        <div
          className={classNames({
            'mt-5': true,
            'd-none': !this.state.socketConected || this.state.rooms.length === 0
          })}
        >
          <ListGroup as="ul">
            {this.state.rooms.map(({ name, id }) => {
              const selectRoom = () => this.selectRoom(id)
              const updateRoom = () => this.updateRoom(id)
              const deleteRoom = () => this.deleteRoom(id)
              const selected = id === this.state.selectedRoomId
              return (
                <ListGroup.Item as="li" active={selected} key={id} onClick={selectRoom}>
                  <button disabled={!selected} className="btn btn-sm btn-link float-right" onClick={deleteRoom}>
                    <i className="fas fa-times-circle" />
                  </button>
                  <button disabled={!selected} className="btn btn-sm btn-link float-right" onClick={updateRoom}>
                    <i className="fas fa-chevron-circle-up" />
                  </button>
                  {id} {name}
                </ListGroup.Item>
              )
            })}
            <ListGroup.Item as="li" key={'new-room-item'}>
              <button className="btn btn-primary btn-sm" onClick={this.createRoom}>
                <i className="fas fa-plus-circle mr-1" />
                Создать
              </button>
            </ListGroup.Item>
          </ListGroup>
        </div>
        <div
          className={classNames({
            'mt-5': true,
            jumbotron: true,
            'jumbotron-fluid': true,
            'd-none': !this.state.socketConected || this.state.rooms.length > 0
          })}
        >
          <div className="container">
            <h1 className="display-4">Комнаты не созданы</h1>
            <p className="lead">Щелкните, чтобы создать новую</p>
            <hr className="my-4" />
            <button className="btn btn-primary btn-lg" onClick={this.createRoom}>
              <i className="fas fa-plus-circle mr-1" />
              Создать
            </button>
          </div>
        </div>
      </div>
    )
  }
}

App.propTypes = {
  userName: PropTypes.string,
  userNameUpdate: PropTypes.func
}

const mapStateToProps = state => {
  return {
    userName: state.userName
  }
}

const mapDispatchToProps = dispatch => {
  return {
    userNameUpdate: payload => dispatch(actions.userNameUpdate(payload))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App)
*/

import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { withRouter, Link } from 'react-router-dom'
import { connect } from 'react-redux'
import actions from '../store/actions'
import ObservableSocket from '../utils/observable-socket'
import { CameraSubscription } from '../components/Subscription'

class Guest extends PureComponent {
  constructor(props) {
    super(props)
    this.subscription = null
  }
  componentDidMount() {
    console.log('componentDidMount')
    this.connect()
  }
  componentDidUpdate(prevProps) {
    console.log('componentDidUpdate', prevProps, this.props)
    const sameRoom = prevProps.appointment.roomId === this.props.appointment.roomId
    const sameCode = prevProps.match.params.code === this.props.match.params.code
    if (!sameRoom || !sameCode) {
      this.connect()
    }
  }
  componentWillUnmount() {
    console.log('componentWillUnmount')
    this.props.subscriptionRemoveAll()
    this.signalSocket.disconnect()
  }

  connect() {
    const roomId = this.props.appointment.roomId
    const code = this.props.match.params.code
    const BACKEND_URL = process.env.NODE_ENV === 'production' ? window.location.host : '127.0.0.1:6300'
    this.signalSocket = new ObservableSocket(`wss://${BACKEND_URL}/rtc/${roomId}/${code}`)
    this.signalSocket.reconnect = false

    this.signalSocket.open$.subscribe(() => {
      this.log('Socket open')
    })

    this.signalSocket.error$.subscribe(() => {
      this.error('Socket error')
      this.props.history.push('/')
    })

    this.signalSocket.close$.subscribe(() => {
      this.error('Socket disconnected')
      this.props.history.push('/')
    })

    this.signalSocket.message$.subscribe(message => {
      switch (message.id) {
      case 'publications':
        {
          const subscriptions = []
          message.data.forEach(publisher =>
            publisher.channels.forEach(channel => {
              subscriptions.push({ channel, name: publisher.name })
            })
          )
          this.props.subscriptionUpdateAll(subscriptions)
        }
        break
      default:
      }
    })
    this.logging = process.env.NODE_ENV !== 'production'
    this.signalSocket.reconnect = true
    this.signalSocket.connect()
  }

  error(error) {
    console.error(error)
  }

  log(message) {
    console.log(message)
  }

  roomParticipantrs() {
    return this.props.subscriptions
      .filter(subscription => subscription.channel !== this.props.publication)
      .map(subscription => {
        return (
          <CameraSubscription
            key={subscription.channel}
            channel={subscription.channel}
            displayName={subscription.name}
            socket={this.signalSocket}
            logging={this.logging}
          />
        )
      })
  }

  render() {
    return (
      <div className="card mt-5">
        <div className="card-body">
          <h5 className="card-title">Встреча &quot;{this.props.appointment.roomName}&quot; - гость</h5>
          <div className="card-text">{this.roomParticipantrs()}</div>
        </div>
        <div className="card-footer">
          <Link to="/" className="btn btn-secondary float-right">
            Назад
          </Link>
        </div>
      </div>
    )
  }
}

Guest.propTypes = {
  controlSocket: PropTypes.object,
  appointment: PropTypes.object,
  history: PropTypes.object,
  match: PropTypes.object,
  subscriptions: PropTypes.array,
  subscriptionRemoveAll: PropTypes.func,
  subscriptionUpdateAll: PropTypes.func
}

const mapStateToProps = state => {
  return {
    appointment: state.appointment,
    controlSocket: state.controlSocket,
    subscriptions: state.subscriptions
  }
}

const mapDispatchToProps = dispatch => {
  return {
    subscriptionRemoveAll: payload => dispatch(actions.subscriptionRemoveAll(payload)),
    subscriptionUpdateAll: payload => dispatch(actions.subscriptionUpdateAll(payload))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(Guest))

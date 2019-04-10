import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { withRouter, Link } from 'react-router-dom'
import { connect } from 'react-redux'
import actions from '../store/actions'
import ObservableSocket from '../utils/observable-socket'
import { CameraSubscription, CameraControlSubscription } from '../components/Subscription'
import Publication from '../components/Publication'

class Presenter extends PureComponent {
  constructor(props) {
    super(props)
    this.subscription = null
  }
  componentDidMount() {
    this.connect()
  }
  componentDidUpdate(prevProps) {
    const sameRoom = prevProps.appointment.roomId === this.props.appointment.roomId
    const sameCode = prevProps.match.params.code === this.props.match.params.code
    if (!sameRoom || !sameCode) {
      this.connect()
    }
  }
  componentWillUnmount() {
    this.props.publicationRemove()
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
        case 'welcome':
          this.props.publicationAdd(message.participantId + '-camera')
          break
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
    this.signalSocket.connect()
  }

  error(error) {
    console.error(error)
  }

  log(message) {
    console.log(message)
  }
  myPublication() {
    if (this.props.publication) {
      return (
        <Publication
          key={this.props.publication + 'pub'}
          channel={this.props.publication}
          socket={this.signalSocket}
          logging={this.logging}
          audio={this.props.audio}
          video={this.props.video}
        />
      )
    }
  }

  myCamera() {
    return this.props.subscriptions
      .filter(subscription => subscription.channel === this.props.publication)
      .map(myCamera => {
        const toggleAudio = () => {
          return this.props.audio ? this.props.audioDisable() : this.props.audioEnable()
        }
        const toggleVideo = () => {
          return this.props.video ? this.props.videoDisable() : this.props.videoEnable()
        }
        return (
          <CameraControlSubscription
            key={myCamera.channel}
            channel={myCamera.channel}
            socket={this.signalSocket}
            logging={this.logging}
            audio={this.props.audio}
            video={this.props.video}
            toggleAudio={toggleAudio}
            toggleVideo={toggleVideo}
          />
        )
      })
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
          <h5 className="card-title">Встреча &quot;{this.props.appointment.roomName}&quot; - ведущий</h5>
          <div className="card-text">
            {this.myCamera()}
            {this.roomParticipantrs()}
            {this.myPublication()}
          </div>
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

Presenter.propTypes = {
  controlSocket: PropTypes.object,
  appointment: PropTypes.object,
  history: PropTypes.object,
  match: PropTypes.object,
  publication: PropTypes.string,
  subscriptions: PropTypes.array,
  audio: PropTypes.bool,
  video: PropTypes.bool,
  publicationAdd: PropTypes.func,
  publicationRemove: PropTypes.func,
  subscriptionRemoveAll: PropTypes.func,
  subscriptionUpdateAll: PropTypes.func,
  audioEnable: PropTypes.func,
  audioDisable: PropTypes.func,
  videoEnable: PropTypes.func,
  videoDisable: PropTypes.func
}

const mapStateToProps = state => {
  return {
    appointment: state.appointment,
    controlSocket: state.controlSocket,
    publication: state.publication,
    subscriptions: state.subscriptions,
    audio: state.audio,
    video: state.video
  }
}

const mapDispatchToProps = dispatch => {
  return {
    publicationAdd: payload => dispatch(actions.publicationAdd(payload)),
    publicationRemove: payload => dispatch(actions.publicationRemove(payload)),
    subscriptionRemoveAll: payload => dispatch(actions.subscriptionRemoveAll(payload)),
    subscriptionUpdateAll: payload => dispatch(actions.subscriptionUpdateAll(payload)),
    audioEnable: payload => dispatch(actions.audioEnable(payload)),
    audioDisable: payload => dispatch(actions.audioDisable(payload)),
    videoEnable: payload => dispatch(actions.videoEnable(payload)),
    videoDisable: payload => dispatch(actions.videoDisable(payload))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(Presenter))

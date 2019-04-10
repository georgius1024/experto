import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { withRouter, Link } from 'react-router-dom'
import { connect } from 'react-redux'
import actions from '../store/actions'
import ObservableSocket from '../utils/observable-socket'
import { CameraSubscription, ScreenSubscription, CameraControlSubscription } from '../components/Subscription'
import Publication from '../components/Publication'
const electron = window.require('electron')

const getScreenConstraints = (src, callback) => {
  electron.desktopCapturer.getSources({ types: ['screen'] }, (error, sources) => {
    if (error) {
      callback(error)
    }
    const constraints = {
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: sources[0].id,
          minWidth: 1280,
          maxWidth: 1280,
          minHeight: 720,
          maxHeight: 720
        }
      }
    }
    callback(null, constraints)
  })
}
window.getScreenConstraints = getScreenConstraints

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
    this.props.publicationsRemoveAll()
    this.props.subscriptionsRemoveAll()
    this.signalSocket.disconnect()
  }

  connect() {
    console.log('New connection')
    const roomId = this.props.appointment.roomId
    const code = this.props.match.params.code
    //const BACKEND_URL = process.env.NODE_ENV === 'production' ? window.location.host : '127.0.0.1:6300'
    const BACKEND_URL = '192.168.1.40:6300'
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
          this.props.publicationCameraAdd(message.participantId + '-camera')
          this.props.publicationScreenAdd(message.participantId + '-screen')
          break
        case 'publications':
          {
            const subscriptions = []
            message.data.forEach(publisher =>
              publisher.channels.forEach(channel => {
                subscriptions.push({ channel, name: publisher.name })
              })
            )
            this.props.subscriptionsUpdateAll(subscriptions)
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

  myCameraPublication() {
    if (this.props.publications.camera) {
      return (
        <Publication
          key={this.props.publications.camera + '-pub'}
          channel={this.props.publications.camera}
          socket={this.signalSocket}
          logging={this.logging}
          audio={this.props.cameraAudio}
          video={this.props.cameraVideo}
        />
      )
    }
  }
  myScreenPublication() {
    if (this.props.publications.camera) {
      return (
        <Publication
          key={this.props.publications.screen + '-pub'}
          channel={this.props.publications.screen}
          socket={this.signalSocket}
          device="screen"
          logging={this.logging}
          video={this.props.screenVideo}
        />
      )
    }
  }

  myCamera() {
    return this.props.subscriptions
      .filter(subscription => subscription.channel === this.props.publications.camera)
      .map(myCamera => {
        const toggleAudio = () => {
          return this.props.cameraAudio ? this.props.cameraAudioDisable() : this.props.cameraAudioEnable()
        }
        const toggleVideo = () => {
          return this.props.cameraVideo ? this.props.cameraVideoDisable() : this.props.cameraVideoEnable()
        }
        return (
          <CameraControlSubscription
            key={myCamera.channel}
            channel={myCamera.channel}
            socket={this.signalSocket}
            logging={this.logging}
            audio={this.props.cameraAudio}
            video={this.props.cameraAideo}
            toggleAudio={toggleAudio}
            toggleVideo={toggleVideo}
          />
        )
      })
  }

  myScreen() {
    return this.props.subscriptions
      .filter(subscription => subscription.channel === this.props.publications.screen)
      .map(myScreen => {
        const toggleVideo = () => {
          return this.props.screenVideo ? this.props.screenVideoDisable() : this.props.screenVideoEnable()
        }
        return (
          <ScreenSubscription
            key={myScreen.channel}
            channel={myScreen.channel}
            socket={this.signalSocket}
            logging={this.logging}
            video={this.props.screenAideo}
            toggleVideo={toggleVideo}
          />
        )
      })
  }

  roomParticipantrs() {
    return this.props.subscriptions
      .filter(
        subscription => ![this.props.publications.camera, this.props.publications.screen].includes(subscription.channel)
      )
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
            {this.myScreen()}
            {this.roomParticipantrs()}
            {this.myCameraPublication()}
            {this.myScreenPublication()}
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
  publications: PropTypes.object,
  subscriptions: PropTypes.array,
  cameraAudio: PropTypes.bool,
  cameraVideo: PropTypes.bool,
  screenVideo: PropTypes.bool,
  publicationCameraAdd: PropTypes.func,
  publicationCameraRemove: PropTypes.func,
  publicationScreenAdd: PropTypes.func,
  publicationScreenRemove: PropTypes.func,
  publicationsRemoveAll: PropTypes.func,
  subscriptionsRemoveAll: PropTypes.func,
  subscriptionsUpdateAll: PropTypes.func,
  cameraAudioEnable: PropTypes.func,
  cameraAudioDisable: PropTypes.func,
  cameraVideoEnable: PropTypes.func,
  cameraVideoDisable: PropTypes.func,
  screenVideoEnable: PropTypes.func,
  screenVideoDisable: PropTypes.func
}

const mapStateToProps = state => {
  return {
    appointment: state.appointment,
    controlSocket: state.controlSocket,
    publications: state.publications,
    subscriptions: state.subscriptions,
    cameraAudio: state.cameraAudio,
    cameraVideo: state.cameraVideo,
    screenVideo: state.screenVideo
  }
}

const mapDispatchToProps = dispatch => {
  return {
    publicationCameraAdd: payload => dispatch(actions.publicationCameraAdd(payload)),
    publicationCameraRemove: payload => dispatch(actions.publicationCameraRemove(payload)),
    publicationScreenAdd: payload => dispatch(actions.publicationScreenAdd(payload)),
    publicationScreenRemove: payload => dispatch(actions.publicationScreenRemove(payload)),
    publicationsRemoveAll: payload => dispatch(actions.publicationRemoveAll(payload)),
    subscriptionsRemoveAll: payload => dispatch(actions.subscriptionsRemoveAll(payload)),
    subscriptionsUpdateAll: payload => dispatch(actions.subscriptionsUpdateAll(payload)),
    cameraAudioEnable: payload => dispatch(actions.cameraAudioEnable(payload)),
    cameraAudioDisable: payload => dispatch(actions.cameraAudioDisable(payload)),
    cameraVideoEnable: payload => dispatch(actions.cameraVideoEnable(payload)),
    cameraVideoDisable: payload => dispatch(actions.cameraVideoDisable(payload)),
    screenVideoEnable: payload => dispatch(actions.screenVideoEnable(payload)),
    screenVideoDisable: payload => dispatch(actions.screenVideoDisable(payload))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(Presenter))

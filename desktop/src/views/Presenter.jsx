import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { withRouter, Link } from 'react-router-dom'
import { connect } from 'react-redux'
import actions from '../store/actions'
import ObservableSocket from '../utils/observable-socket'
import { CameraSubscription, ScreenSubscription, CameraControlSubscription } from '../components/subscription'
import Publication from '../components/publication'
import config from '../config'
import { alert, error } from '../components/alert'
const electron = window.require('electron')
// TODO LOGGING
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
    this.state = {
      presenter: null,
      started: false
    }
    this.subscription = null
    this.onStart = this.onStart.bind(this)
    this.onStop = this.onStop.bind(this)
  }
  componentDidMount() {
    this.connect()
  }
  componentDidUpdate(prevProps) {
    const sameCode = prevProps.match.params.code === this.props.match.params.code
    if (!sameCode) {
      this.connect()
    }
  }
  componentWillUnmount() {
    this.props.publicationsRemoveAll()
    this.props.subscriptionsRemoveAll()
    this.signalSocket.disconnect()
  }
  onStart() {
    this.setState({
      started: true
    })
    this.props.publicationCameraAdd(this.state.presenter.participantId + '-camera')
    this.props.publicationScreenAdd(this.state.presenter.participantId + '-screen')
  }
  onStop() {
    this.props.history.push('/')
  }
  connect() {
    console.log('New connection')
    const code = this.props.match.params.code
    this.signalSocket = new ObservableSocket(`${config.rtcEndPoint}/${code}`)
    this.signalSocket.reconnect = false
    this.signalSocket.open$.subscribe(() => {
      //alert('Socket open')
    })

    this.signalSocket.error$.subscribe(() => {
      error('Socket error')
      this.props.history.push('/')
    })

    this.signalSocket.close$.subscribe(() => {
      error('Socket disconnected')
      this.props.history.push('/')
    })

    this.signalSocket.message$.subscribe(message => {
      switch (message.id) {
        case 'welcome':
          const { id, ...rest } = message
          console.log(rest)
          this.setState({
            presenter: rest
          })
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
    error(error)
  }

  log(message) {
    alert(message)
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
    if (this.props.publications.screen) {
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
            video={this.props.cameraVideo}
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
    const presenter = this.state.presenter
    const started = this.state.started
    if (!presenter) {
      return <p>.............loading.............</p>
    }

    return (
      <>
        <nav className="navbar navbar-light bg-light mb-5">
          <span className="navbar-brand mb-0 h1">
            <span className="ml-2">{presenter.roomName}</span>
          </span>
          <span>
            {!started && (
              <button className="btn btn-link ml-2" onClick={this.onStart}>
                <i className="fas fa-video mr-1" />
                Начать вещание
              </button>
            )}
            {started && (
              <button className="btn btn-link ml-2" onClick={this.onStop}>
                <i className="fas fa-video-slash mr-1" />
                Прекрaтить вещание
              </button>
            )}
          </span>
        </nav>
        {started && (
          <div className="card mt-5">
            <div className="card-body">
              <div className="card-text">
                {this.myCamera()}
                {this.myScreen()}
                {this.roomParticipantrs()}
                {this.myCameraPublication()}
                {this.myScreenPublication()}
              </div>
            </div>
          </div>
        )}
      </>
    )
  }
}

Presenter.propTypes = {
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

import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import ChatList from '../components/chat/list'
import ChatForm from '../components/chat/form'
import { message, error } from '../notification'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import actions from '../store/actions'
import ObservableSocket from '../utils/observable-socket'
import {
  CameraSubscription,
  ScreenSubscription,
  CameraControlSubscription
} from '../components/subscription'
import Publication from '../components/publication'
import config from '../config'

class Presenter extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      listenerCamera: '',
      presenterName: '',
      presenterCamera: '',
      presenterScreen: '',
      publicationCamera: '',
      video: true,
      audio: true,
      listener: null,
      chat: []
    }
    this.subscription = null
    this.onStart = this.onStart.bind(this)
    this.onPostMessage = this.onPostMessage.bind(this)
    this.onStop = this.onStop.bind(this)
  }
  componentDidMount() {
    this.connect()
  }
  componentDidUpdate(prevProps) {
    const sameCode =
      prevProps.match.params.code === this.props.match.params.code
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
    const publicationCamera = this.state.listener.participantId + '-camera'
    this.setState({
      publicationCamera
    })
    this.props.publicationCameraAdd(publicationCamera)
  }
  onStop() {
    this.props.history.push('/')
  }
  onPostMessage(body) {
    this.signalSocket.sendMessage('message', { body })
  }
  connect() {
    const code = this.props.match.params.code
    this.signalSocket = new ObservableSocket(`${config.rtcEndPoint}/${code}`)
    this.signalSocket.reconnect = false
    this.signalSocket.open$.subscribe(() => {
      message('Подключено')
    })

    this.signalSocket.error$.subscribe(() => {
      error('Ошибка сокета')
    })

    this.signalSocket.close$.subscribe(() => {
      error('Внезапное отключение')
    })

    this.signalSocket.message$.subscribe(message => {
      switch (message.id) {
        case 'welcome':
          const { id, chat, ...listener } = message
          console.log(listener)
          this.setState(
            {
              listener,
              chat
            },
            () => {
              if (this.state.listener.role === 'listener') {
                this.onStart()
              }
            }
          )
          break
        case 'message':
          {
            const { id, ...rest } = message
            const chat = [...this.state.chat]
            chat.push(rest)
            this.setState({
              chat
            })
          }
          break
        case 'publications':
          {
            const subscriptions = []
            console.log(message.data)
            message.data.forEach(publisher =>
              publisher.channels.forEach(channel => {
                subscriptions.push({ channel, name: publisher.name })
              })
            )
            this.props.subscriptionsUpdateAll(subscriptions)

            const publications = message.data
            const presenter = publications.find(p => p.role === 'presenter')
            let presenterName = '',
              presenterCamera = '',
              presenterScreen = '',
              listenerCamera = ''

            if (presenter) {
              presenterName = presenter.name
              presenterCamera = presenter.channels.find(c =>
                c.includes('camera')
              )
              presenterScreen = presenter.channels.find(c =>
                c.includes('screen')
              )
            }
            const listener = publications.find(p => p.role === 'listener')
            if (listener) {
              listenerCamera = listener.channels.find(c => c.includes('camera'))
            }
            this.setState({
              presenterName,
              presenterCamera,
              presenterScreen,
              listenerCamera
            })
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

  presenterCamera() {
    if (this.state.presenterCamera) {
      return (
        <CameraSubscription
          key={this.state.presenterCamera}
          channel={this.state.presenterCamera}
          displayName={this.state.presenterName}
          socket={this.signalSocket}
          logging={this.logging}
        />
      )
    } else {
      return null
    }
  }

  presenterScreen() {
    if (this.state.presenterScreen) {
      return (
        <ScreenSubscription
          key={this.state.presenterScreen}
          channel={this.state.presenterScreen}
          displayName={this.state.presenterName}
          socket={this.signalSocket}
          logging={this.logging}
        />
      )
    } else {
      return null
    }
  }

  listenerCamera() {
    if (this.state.listenerCamera) {
      const toggleAudio = () => {
        this.setState(state => ({ audio: !state.audio }))
      }
      const toggleVideo = () => {
        this.setState(state => ({ video: !state.video }))
      }

      return (
        <CameraControlSubscription
          key={this.state.listenerCamera}
          channel={this.state.listenerCamera}
          displayName={this.state.listenerName}
          socket={this.signalSocket}
          logging={this.logging}
          toggleAudio={toggleAudio}
          toggleVideo={toggleVideo}
          audio={this.state.audio}
          video={this.state.video}
        />
      )
    } else {
      return null
    }
  }

  publicationCamera() {
    if (this.state.publicationCamera) {
      return (
        <Publication
          key={this.state.publicationCamera + '-pub'}
          channel={this.state.publicationCamera}
          socket={this.signalSocket}
          logging={this.logging}
          audio={this.state.audio}
          video={this.state.video}
        />
      )
    } else {
      return null
    }
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

  myCamera() {
    return this.props.subscriptions
      .filter(
        subscription => subscription.channel === this.props.publications.camera
      )
      .map(myCamera => {
        const toggleAudio = () => {
          return this.props.cameraAudio
            ? this.props.cameraAudioDisable()
            : this.props.cameraAudioEnable()
        }
        const toggleVideo = () => {
          return this.props.cameraVideo
            ? this.props.cameraVideoDisable()
            : this.props.cameraVideoEnable()
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
  roomParticipantrs() {
    return this.props.subscriptions
      .filter(
        subscription =>
          ![this.props.publications.camera].includes(subscription.channel)
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
    const listener = this.state.listener
    const started = Boolean(this.state.publicationCamera)
    if (!listener) {
      return <p>.............loading.............</p>
    }

    return (
      <>
        <nav className="navbar navbar-light bg-light mb-5">
          <span className="navbar-brand mb-0 h1">
            <span className="ml-2">{listener.roomName}</span>
          </span>
          <span>
            {started && (
              <button className="btn btn-link ml-2" onClick={this.onStop}>
                <i className="fas fa-video-slash mr-1" />
                Прекрaтить вещание
              </button>
            )}
          </span>
        </nav>
        <p>Listener camera: {this.state.listenerCamera}</p>
        {this.listenerCamera()}
        {started && this.publicationCamera()}

        <p>Presenter camera: {this.state.presenterCamera}</p>
        {this.presenterCamera()}
        <p>Scr: {this.state.presenterScreen}</p>
        {this.presenterScreen()}
        <div className="chat-column">
          <ChatForm onPostMessage={this.onPostMessage} />
          <div className="chat-list">
            <ChatList messages={this.state.chat} reverse />
          </div>
        </div>
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
  publicationCameraAdd: PropTypes.func,
  publicationCameraRemove: PropTypes.func,
  publicationsRemoveAll: PropTypes.func,
  subscriptionsRemoveAll: PropTypes.func,
  subscriptionsUpdateAll: PropTypes.func,
  cameraAudioEnable: PropTypes.func,
  cameraAudioDisable: PropTypes.func,
  cameraVideoEnable: PropTypes.func,
  cameraVideoDisable: PropTypes.func
}

const mapStateToProps = state => {
  return {
    publications: state.publications,
    subscriptions: state.subscriptions,
    cameraAudio: state.cameraAudio,
    cameraVideo: state.cameraVideo
  }
}

const mapDispatchToProps = dispatch => {
  return {
    publicationCameraAdd: payload =>
      dispatch(actions.publicationCameraAdd(payload)),
    publicationCameraRemove: payload =>
      dispatch(actions.publicationCameraRemove(payload)),
    publicationsRemoveAll: payload =>
      dispatch(actions.publicationRemoveAll(payload)),
    subscriptionsRemoveAll: payload =>
      dispatch(actions.subscriptionsRemoveAll(payload)),
    subscriptionsUpdateAll: payload =>
      dispatch(actions.subscriptionsUpdateAll(payload)),
    cameraAudioEnable: payload => dispatch(actions.cameraAudioEnable(payload)),
    cameraAudioDisable: payload =>
      dispatch(actions.cameraAudioDisable(payload)),
    cameraVideoEnable: payload => dispatch(actions.cameraVideoEnable(payload)),
    cameraVideoDisable: payload => dispatch(actions.cameraVideoDisable(payload))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(Presenter))

import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'

import ChatList from '../components/chat/list'
import ChatForm from '../components/chat/form'
import { message, error } from '../notification'
import ObservableSocket from '../utils/observable-socket'
import { CameraSubscription, ScreenSubscription, CameraControlSubscription } from '../components/subscription'
import Publication from '../components/publication'
import config from '../config'
import './room.scss'

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
    const sameCode = prevProps.match.params.code === this.props.match.params.code
    if (!sameCode) {
      this.connect()
    }
  }
  componentWillUnmount() {
    this.setState(
      {
        role: 'guest',
        listenerName: '',
        listenerCamera: '',
        presenterName: '',
        presenterCamera: '',
        presenterScreen: '',
        publicationCamera: ''
      },
      () => {
        this.signalSocket.disconnect()
      }
    )
  }
  onStart() {
    const publicationCamera = this.state.listener.participantId + '-camera'
    this.setState({
      publicationCamera
    })
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
          const { id, chat = [], ...listener } = message
          this.setState(
            {
              role: listener.role,
              listener,
              chat
            },
            () => {
              if (this.state.role === 'listener') {
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
            const publications = message.data
            const presenter = publications.find(p => p.role === 'presenter')
            let presenterName = '',
              presenterCamera = '',
              presenterScreen = '',
              listenerName = '',
              listenerCamera = ''

            if (presenter) {
              presenterName = presenter.name
              presenterCamera = presenter.channels.find(c => c.includes('camera'))
              presenterScreen = presenter.channels.find(c => c.includes('screen'))
            }
            const listener = publications.find(p => p.role === 'listener')
            if (listener) {
              listenerCamera = listener.channels.find(c => c.includes('camera'))
              listenerName = listener.name
            }
            this.setState({
              presenterName,
              presenterCamera,
              presenterScreen,
              listenerName,
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
      return <div className="camera-placeholder" />
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
      return <div className="screen-placeholder" />
    }
  }
  listenerCamera() {
    if (this.state.listenerCamera) {
      if (this.state.role === 'listener') {
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
        return (
          <CameraSubscription
            key={this.state.listenerCamera}
            channel={this.state.listenerCamera}
            displayName={this.state.listenerName}
            socket={this.signalSocket}
            logging={this.logging}
          />
        )
      }
    } else {
      return <div className="camera-placeholder" />
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

  render() {
    const listener = this.state.listener
    const started = Boolean(this.state.publicationCamera)
    if (!listener) {
      return <p>.............loading.............</p>
    }

    return (
      <div className="room">
        <div className="col1">{this.presenterScreen()}</div>
        <div className="col2">
          <div className="row1">
            {this.presenterCamera()}
            {this.listenerCamera()}
            {started && this.publicationCamera()}
          </div>
          <div className="row2">
            {this.state.role === 'listener' && <ChatForm onPostMessage={this.onPostMessage} />}
          </div>
          <div className="row3">
            <ChatList messages={this.state.chat} reverse />
          </div>
        </div>
      </div>
    )
  }
}

Presenter.propTypes = {
  history: PropTypes.object,
  match: PropTypes.object
}

export default withRouter(Presenter)

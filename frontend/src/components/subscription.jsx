import React, { Component, PureComponent } from 'react'
import classNames from 'classnames'
import { filter } from 'rxjs/operators'
import PropTypes from 'prop-types'
import kurentoUtils from 'kurento-utils'
import styles from './subscription.module.scss'
import microphoneOn from '../assets/microphone-solid.svg'
import microphoneOff from '../assets/microphone-slash-solid.svg'
import videoOn from '../assets/video-solid.svg'
import videoOff from '../assets/video-slash-solid.svg'

class DefaultSubscription extends Component {
  constructor(props) {
    super(props)
    this.video = React.createRef()
    this.webRtcPeer = null
    this.subscription = null
    this.state = {
      connected: false
    }
  }

  componentDidMount() {
    this.connect()
  }

  componentDidUpdate(prevProps) {
    const sameSocket = prevProps.socket === this.props.socket
    const sameChannel = prevProps.channel === this.props.channel
    if (!sameSocket || !sameChannel) {
      this.connect()
    }
    this.adjustVolumeLevel()
  }

  componentWillUnmount() {
    this.disconnect()
  }

  log(message, data) {
    if (this.props.logging) {
      if (arguments.length === 2) {
        console.log('Subscriber on channel', this.props.channel, message, data)
      } else {
        console.log('Subscriber on channel', this.props.channel, message)
      }
    }
  }

  error(message) {
    if (this.props.logging) {
      console.error('Subscriber on channel', this.props.channel, 'throws error', message)
    }
  }

  sendMessage(message) {
    if (this.props.socket.online()) {
      if (typeof message === 'string') {
        message = {
          id: message
        }
      }
      message.channel = this.props.channel
      this.log('sending message', message.id)
      this.props.socket.send(message)
    } else {
      this.error('socket closed, can not send', message)
    }
  }

  connect() {
    this.subscription = this.props.socket.message$
      .pipe(filter(message => message.channel === this.props.channel))
      .subscribe(message => {
        switch (message.id) {
          case 'startResponseForSubscriber':
            this.log('SDP answer received from server. Connecting...')
            this.webRtcPeer.processAnswer(message.sdpAnswer)
            this.onConnected()
            break
          case 'error':
            this.error('Error message from server', message.message)
            break
          case 'iceCandidateForSubscriber':
            this.webRtcPeer.addIceCandidate(message.candidate)
            break
          case 'stopPublishing':
            this.unsubscribe()
            break
          case 'startPublishing':
            this.subscribe()
            break
          default:
        }
      })
    this.subscribe()
  }

  disconnect() {
    this.unsubscribe()
    this.subscription.unsubscribe()
  }

  adjustVolumeLevel() {
    if (this.video.current) {
      if (this.props.muted) {
        this.video.current.volume = 0
        this.video.current.muted = true
      } else {
        this.video.current.volume = this.props.volume / 100
      }
    }
  }

  subscribe() {
    const options = {
      remoteVideo: this.video.current,
      onicecandidate: candidate => {
        this.log('got local candidate')
        this.sendMessage({
          id: 'onIceCandidateFromSubscriber',
          candidate: candidate
        })
      }
    }
    if (this.props.stunServer) {
      options.configuration = {
        iceServers: [
          {
            url: 'stun:' + this.props.stunServer
          }
        ]
      }
    }
    this.webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options, error => {
      if (error) {
        return this.error(error)
      }
      this.adjustVolumeLevel()
      this.webRtcPeer.generateOffer((error, sdpOffer) => {
        if (error) {
          return this.error(error)
        }
        this.log('invoking SDP offer callback function')
        this.sendMessage({
          id: 'subscribe',
          sdpOffer
        })
      })
    })
  }

  unsubscribe() {
    this.sendMessage('unsubscribe')
    if (this.webRtcPeer) {
      this.webRtcPeer.dispose()
      this.webRtcPeer = null
    }
  }

  onConnected() {
    this.setState({ connected: true })
    if (this.props.onConnected) {
      this.props.onConnected(this)
    }
  }

  render() {
    return <video ref={this.video} autoPlay muted={this.props.muted} poster={this.props.poster} />
  }
}

class MutedSubscription extends PureComponent {
  render() {
    return <DefaultSubscription {...this.props} muted={true} />
  }
}

class CameraSubscription extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      muted: true,
      volume: 50,
      initial: true,
      connected: false
    }
    this.unmute = this.unmute.bind(this)
  }
  unmute() {
    this.setState({
      initial: false,
      muted: false
    })
  }

  setVolume(volume) {
    this.setState({
      volume,
      muted: Number(volume) === 0
    })
  }

  render() {
    const setVolume = ({ target: { value } }) => {
      this.setVolume(value)
    }
    const onConnected = () => {
      this.setState({ connected: true })
    }
    return (
      <div className={classNames(styles['subscription'], styles['camera-subscription'])}>
        {this.state.connected && this.state.initial ? (
          <div className={this.state.initial ? styles.overlay : styles.hidden}>
            <button className={styles.unmute} onClick={this.unmute}>
              Щелкните здесь, чтобы включить звук
            </button>
          </div>
        ) : null}

        {this.state.connected ? (
          <div className={styles['controls-panel']}>
            <div className={styles['name-display']}>{this.props.displayName}</div>
            <input type="range" min="0" max="100" className={styles['volume-control']} onChange={setVolume} />
          </div>
        ) : null}

        <DefaultSubscription
          {...this.props}
          muted={this.state.muted}
          volume={this.state.volume}
          onConnected={onConnected}
        />
      </div>
    )
  }
}

class ScreenSubscription extends PureComponent {
  render() {
    return (
      <div className={classNames(styles['subscription'], styles['screen-subscription'])}>
        <DefaultSubscription {...this.props} />
      </div>
    )
  }
}

class CameraControlSubscription extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      connected: false
    }
  }
  render() {
    const onConnected = () => {
      this.setState({ connected: true })
    }
    return (
      <div className={classNames(styles['subscription'], styles['camera-control-subscription'])}>
        {this.state.connected ? (
          <div className={styles['controls-panel']}>
            <div className={styles['buttons']}>
              <button onClick={this.props.toggleAudio} title="Вкл/выкл аудио">
                <img alt="" className={styles.icon} src={this.props.audio ? microphoneOn : microphoneOff} />
              </button>
              <button onClick={this.props.toggleVideo} title="Вкл/выкл видео">
                <img alt="" className={styles.icon} src={this.props.video ? videoOn : videoOff} />
              </button>
            </div>
          </div>
        ) : null}
        <MutedSubscription {...this.props} onConnected={onConnected} />
      </div>
    )
  }
}

DefaultSubscription.propTypes = {
  channel: PropTypes.string.isRequired,
  socket: PropTypes.object.isRequired,
  stunServer: PropTypes.string,
  logging: PropTypes.bool,
  poster: PropTypes.string,
  muted: PropTypes.bool,
  volume: PropTypes.number,
  onConnected: PropTypes.func
}

DefaultSubscription.defaultProps = {
  stunServer: '',
  logging: false,
  volume: 50,
  muted: true
}

CameraSubscription.propTypes = {
  displayName: PropTypes.string.isRequired
}

CameraControlSubscription.propTypes = {
  toggleAudio: PropTypes.func.isRequired,
  toggleVideo: PropTypes.func,
  audio: PropTypes.bool.isRequired,
  video: PropTypes.bool.isRequired
}

export {
  DefaultSubscription as default,
  MutedSubscription,
  ScreenSubscription,
  MutedSubscription as ScreenControlSubscription,
  CameraSubscription,
  CameraControlSubscription
}

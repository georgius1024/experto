import React, { PureComponent } from 'react'
import { filter } from 'rxjs/operators'
import PropTypes from 'prop-types'
import kurentoUtils from 'kurento-utils'

class Publication extends PureComponent {
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
    } else {
      this.checkAudioEnabled()
      this.checkVideoEnabled()
    }
  }

  componentWillUnmount() {
    this.disconnect()
  }

  log(message, data) {
    if (this.props.logging) {
      if (arguments.length === 2) {
        console.log('Publisher on channel', this.props.channel, message, data)
      } else {
        console.log('Publisher on channel', this.props.channel, message)
      }
    }
  }

  error(message) {
    if (this.props.logging) {
      console.error(
        'Publisher on channel',
        this.props.channel,
        'throws error',
        message
      )
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
        case 'startResponseForPublisher':
          this.log('SDP answer received from server. Connecting...')
          this.webRtcPeer.processAnswer(message.sdpAnswer)
          this.connected()
          break
        case 'error':
          this.error('Error message from server', message.message)
          break
        case 'iceCandidateForPublisher':
          this.webRtcPeer.addIceCandidate(message.candidate)
          break
        default:
        }
      })
    this.publish()
  }

  connected() {
    this.setState({ connected: true })
    if (this.props.onConnected) {
      this.props.onConnected(this)
    }
  }

  publish() {
    const constraints = {
      audio: true,
      video: true
    }

    const options = {
      localVideo: this.video.current,
      onicecandidate: candidate => {
        this.log('Local candidate')
        this.sendMessage({
          id: 'onIceCandidateFromPublisher',
          candidate
        })
      },
      mediaConstraints: constraints
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

    this.webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(
      options,
      error => {
        if (error) {
          return this.error(error)
        }
        this.checkAudioEnabled()
        this.checkVideoEnabled()
        this.webRtcPeer.generateOffer((error, sdpOffer) => {
          if (error) {
            return this.error(error)
          }
          this.log('Sending SDP offer')
          this.sendMessage({
            id: 'publish',
            sdpOffer
          })
        })
      }
    )
  }

  unpublish() {
    this.sendMessage('unpublish')
    if (this.webRtcPeer) {
      this.webRtcPeer.dispose()
      this.webRtcPeer = null
    }
  }

  checkAudioEnabled() {
    try {
      const audioTracks = this.webRtcPeer.peerConnection
        .getLocalStreams()[0]
        .getAudioTracks()
      audioTracks[0].enabled = this.props.audio
    } catch (error) {
      this.error(error)
    }
  }

  checkVideoEnabled() {
    try {
      const videoTracks = this.webRtcPeer.peerConnection
        .getLocalStreams()[0]
        .getVideoTracks()
      videoTracks[0].enabled = this.props.video
    } catch (error) {
      this.error(error)
    }
  }

  disconnect() {
    this.unpublish()
    this.subscription.unsubscribe()
  }

  render() {
    return (
      <div className="d-none">
        <video ref={this.video} autoPlay />
      </div>
    )
  }
}

Publication.propTypes = {
  channel: PropTypes.string.isRequired,
  socket: PropTypes.object.isRequired,
  stunServer: PropTypes.string,
  onConnected: PropTypes.func,
  audio: PropTypes.bool,
  video: PropTypes.bool,
  logging: PropTypes.bool
}

Publication.defaultProps = {
  audio: true,
  video: true,
  stunServer: '',
  logging: false
}

export default Publication

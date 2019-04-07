const kurento = require('kurento-client')

const {
  getKurentoClient$,
  createMediaPipeline$,
  createWebRtcEndpoint$,
  createRecorderEndPoint$,
  setOutputBitrate$,
  connectMediaElements$,
  startRecording$,
  pauseRecording$,
  stopRecording$
} = require('../kurento-calls')

class RooomPublication {
  constructor(participant, channel, path = null) {
    this.participant = participant
    this.channel = channel
    this.path = path
    this.pipeline = null
    this.endPoint = null
    this.recorder = null
    this.uri = null
    this.connected = false
    this.recordingStatus = 'Stopped'
    this.candidatesQueue = []
  }

  log(message) {
    console.log(`${this.channel}: ${message}`)
  }
  error(message) {
    console.error(`${this.channel}: ${message}`)
  }

  report() {
    return {
      channel: this.channel,
      pipeline: Boolean(this.pipeline),
      endPoint: Boolean(this.endPoint),
      recorder: Boolean(this.recorder),
      connected: Boolean(this.connected),
      recordingStatus: this.recordingStatus,
      candidatesQueue: this.candidatesQueue.length
    }
  }

  async publish(sdpOffer) {
    try {
      await getKurentoClient$()
      this.pipeline = await createMediaPipeline$()
      this.endPoint = await createWebRtcEndpoint$(this.pipeline)

      this.endPoint.on('OnIceCandidate', event => {
        var candidate = kurento.getComplexType('IceCandidate')(event.candidate)
        this.participant.sendMessageInChannel('iceCandidateForPublisher', this.channel, { candidate })
      })

      var bitrate = this.channel.indexOf('screen') >= 0 ? 340000 : 240000
      await setOutputBitrate$(this.endPoint, bitrate)

      if (this.path) {
        this.recorder = await createRecorderEndPoint$(this.pipeline, this.path)
        this.uri = recorder.uri

        this.recordingStatus = 'Stopped'
        this.recorder.on('Paused', event => {
          this.recordingStatus = 'Paused'
          this.log('recorder paused')
        })
        this.recorder.on('Recording', event => {
          this.recordingStatus = 'Recording'
          this.log('recorder recording')
        })
        this.recorder.on('Stopped', event => {
          this.recordingStatus = 'Stopped'
          this.log('recorder stopped')
        })
        await connectMediaElements$(this.endPoint, this.recorder, this.pipeline)
      }

      if (Array.isArray(this.candidatesQueue)) {
        while (this.candidatesQueue.length) {
          const candidate = this.candidatesQueue.shift()
          this.endPoint.addIceCandidate(candidate)
        }
      }
      return await this.processSdpOffer$(sdpOffer) // SDP ANSWER
    } catch (error) {
      this.error(error)
      return Promise.reject(error)
    }
  }

  processSdpOffer$(sdpOffer) {
    return new Promise((resolve, reject) => {
      this.endPoint.processOffer(sdpOffer, (error, sdpAnswer) => {
        if (error) {
          this.pipeline.release()
          return reject(error)
        }
        this.connected = true
        this.log('Publisher ready')
        this.participant.sendMessageInChannel('startResponseForPublisher', this.channel, { sdpAnswer })
        resolve(sdpAnswer)
      })
      this.endPoint.gatherCandidates(error => {
        if (error) {
          reject(error)
        }
      })
    })
  }

  addIceCandidate(rawData) {
    let candidate = kurento.getComplexType('IceCandidate')(rawData)
    if (this.endPoint) {
      this.log('Publication got candidate')
      this.endPoint.addIceCandidate(candidate)
    } else {
      this.log('Publication queued candidate')
      this.candidatesQueue.push(candidate)
    }
  }

  unpublish() {
    this.log('Publication unpublish')

    if (this.endPoint) {
      this.endPoint.release()
      this.endPoint = null
    }
    if (this.pipeline) {
      this.pipeline.release()
      this.pipeline = null
    }
    if (this.recorder) {
      if (this.recordingStatus !== 'Stopped') {
        this.recorder.stop()
      }
      this.recorder.release()
      this.recorder = null
    }
    this.candidatesQueue = []
    this.connected = false
    this.uri = null
    this.started = null
  }

  async startRecording() {
    await startRecording$(this.recorder)
    this.log('Start recording')
  }

  async pauseRecording() {
    await pauseRecording$(this.recorder)
    this.log('Paused recording')
  }

  async stopRecording() {
    await stopRecording$(this.recorder)
    this.log('Stopped recording')
  }
}

module.exports = RooomPublication

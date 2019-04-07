const kurento = require('kurento-client')

const { createWebRtcEndpoint$ } = require('../kurento-calls')

class RoomSubscription {
  constructor(participant, channel) {
    this.id = participant.id + '.' + channel
    this.participant = participant
    this.channel = channel
    this.endPoint = null
    this.connected = false
    this.publication = null
    this.pipeline = null
    this.candidatesQueue = []
  }

  log(message) {
    console.log(`${this.id}: ${message}`)
  }
  error(message) {
    console.error(`${this.id}: ${message}`)
  }

  report() {
    return {
      id: this.id,
      channel: this.channel,
      endPoint: Boolean(this.endPoint),
      connected: Boolean(this.connected),
      candidatesQueue: this.candidatesQueue.length
    }
  }

  async subscribe(publication, sdpOffer) {
    this.log('Subscription start')
    if (!publication) {
      return Promise.reject('No publisher in channel')
    }
    if (!publication.connected) {
      return Primise.reject('Publisher not connected')
    }
    try {
      this.publication = publication
      this.pipeline = publication.pipeline
      this.endPoint = await createWebRtcEndpoint$(this.pipeline)
      this.endPoint.on('OnIceCandidate', event => {
        var candidate = kurento.getComplexType('IceCandidate')(event.candidate)
        this.participant.sendMessageInChannel('iceCandidateForSubscriber', this.channel, { candidate })
      })

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
          reject(error)
        }
        this.publication.endPoint.connect(this.endPoint, error => {
          if (error) {
            reject(error)
          }
          this.connected = true
          this.log('Subscribed')
          this.participant.sendMessageInChannel('startResponseForSubscriber', this.channel, { sdpAnswer })
          resolve(sdpAnswer)
        })
      })
      this.endPoint.gatherCandidates(error => {
        if (error) {
          reject(error)
        }
      })
    })
  }

  unsubscribe() {
    this.log('unsubscribe')
    if (this.endPoint) {
      this.endPoint.release()
      this.endPoint = null
    }
    this.candidatesQueue = []
    this.connected = false
  }

  addIceCandidate(rawData) {
    let candidate = kurento.getComplexType('IceCandidate')(rawData)
    if (this.endPoint) {
      this.log('Subscription got candidate')
      this.endPoint.addIceCandidate(candidate)
    } else {
      this.log('Subscription queued candidate')
      this.candidatesQueue.push(candidate)
    }
  }
}

module.exports = RoomSubscription

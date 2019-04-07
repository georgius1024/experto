const moment = require('moment')
const RoomParticipant = require('./room-participant')
const RoomPublication = require('./room-publication')
const RoomSubscription = require('./room-subscription')
// TODO create LOG, TRACE, DEBUG, ERROR funcs
class RoomController {
  constructor(id, roomName) {
    this.id = id
    this.name = roomName
    this.participants = {}
    this.registrations = {}
    this.lastActivity = new Date()
    this.log('created')
  }

  log(message) {
    console.log(`Room ${this.id}: ${message}`)
  }

  error(error) {
    console.log(`Room ${this.id}: ${error.message}`)
    console.error(error)
  }

  report() {
    return {
      id: this.id,
      name: this.name,
      registrations: this.registrations,
      participants: Object.keys(this.participants).map(key => this.participants[key].report()),
      lastActivity: moment(this.lastActivity).format('YYYY-MM-DD HH:mm:ss.SSS'),
      fromNow: moment(this.lastActivity).fromNow()
    }
  }

  parseMessage(data) {
    try {
      return JSON.parse(data)
    } catch (error) {
      return String(data)
    }
  }

  join(socket, participantId, role, userName) {
    this.lastActivity = new Date()
    this.log(`${participantId} connected`)
    const participant = new RoomParticipant(participantId, userName, role, socket)
    this.attach(participant, participantId)
    participant.sendMessage('welcome', { participantId, role, userName: userName })
    if (['presenter', 'listener'].includes(role)) {
      // only 1 presenter and listener in room
      const keys = Object.keys(this.participants)
      for (let id of keys) {
        if (this.participants[id].role === role && this.participants[id].id !== participantId) {
          this.detach(id)
        }
      }
    }
    this.broadcastRoomPublications()

    socket.on('message', data => {
      this.lastActivity = new Date()
      const message = this.parseMessage(data)
      const channel = message.channel
      switch (message.id) {
      case 'publish':
        if (participant.role === 'guest') {
          const error = 'You can not publish anything in this room'
          this.error(error)
          return participant.sendMessage('error', { message: error })
        }
        participant.publications[channel] = new RoomPublication(participant, channel)
        participant.publications[channel]
          .publish(message.sdpOffer)
          .then(() => {
            this.broadcastRoomPublications()
            this.log(`published ${channel}`)
          })
          .catch(error => {
            delete participant.publications[channel]
            this.error(error)
            return participant.sendMessage('error', { message: error })
          })

        break
      case 'onIceCandidateFromPublisher':
        this.log('onIceCandidateFromPublisher')
        if (participant && participant.publications[channel]) {
          participant.publications[channel].addIceCandidate(message.candidate)
        }
        break
      case 'unpublish':
        {
          let publisher = this.findPublisherForChannel(channel)
          if (publisher) {
            this.unpublishFromPublication(channel)
            publisher.publications[channel].unpublish()
            delete publisher.publications[channel]
            this.broadcastRoomPublications()
          } else {
            const error = 'Wrong channel'
            this.error(error)
            return participant.sendMessage('error', { message: error })
          }
        }
        break
      case 'subscribe':
        {
          let publisher = this.findPublisherForChannel(channel)
          if (publisher) {
            participant.subscriptions[channel] = new RoomSubscription(participant, channel)
            participant.subscriptions[channel]
              .subscribe(publisher.publications[channel], message.sdpOffer)
              .then(() => {
                this.log('subscribed on ' + channel)
              })
              .catch(error => this.error(error))
          } else {
            const error = 'Wrong channel'
            this.error(error)
            return participant.sendMessage('error', { message: error })
          }
        }
        break
      case 'onIceCandidateFromSubscriber':
        if (participant && participant.subscriptions[channel]) {
          participant.subscriptions[channel].addIceCandidate(message.candidate)
        }
        break
      case 'unsubscribe':
        if (participant && participant.subscriptions[channel]) {
          participant.subscriptions[channel].unsubscribe()
          delete participant.subscriptions[channel]
        }
        break
      case 'ping':
      case 'pong':
        participant.sendMessage(message.id === 'ping' ? 'pong' : 'ping')
        break
      default:
        participant.sendMessage('error', { message: 'Wrong message' })
        this.log('Error message')
      }
    })

    socket.on('close', () => {
      this.lastActivity = new Date()
      this.log(`${participantId} disconnected`)
      this.detach(participantId)
      this.broadcastRoomPublications()
    })

    socket.on('error', error => {
      this.lastActivity = new Date()
      this.log(`${participantId} throws error: ${error.message} and left the room`)
      this.detach(participantId)
      this.broadcastRoomPublications()
    })
  }

  broadcast(data, excluded = []) {
    const keys = Object.keys(this.participants)
    for (let id of keys) {
      if (!excluded.includes(id)) {
        this.participants[id].sendRaw(data)
      }
    }
  }

  broadcastRoomPublications() {
    const publishers = []
    const keys = Object.keys(this.participants)
    for (let key of keys) {
      const participant = this.participants[key]
      const channels = Object.keys(participant.publications)
      if (channels.length) {
        const publisher = {
          name: participant.name,
          id: participant.id,
          role: participant.role,
          channels
        }
        publishers.push(publisher)
      }
    }
    this.broadcastMessage('publications', { data: publishers })
  }

  broadcastMessage(id, payload, excluded = []) {
    const data = JSON.stringify({ id, ...payload })
    this.broadcast(data, excluded)
  }

  attach(participant, id) {
    this.participants[id] = participant
  }

  findPublisherForChannel(channel) {
    const keys = Object.keys(this.participants)
    for (let id of keys) {
      if (this.participants[id].publications && this.participants[id].publications[channel]) {
        return this.participants[id]
      }
    }
  }

  unpublish(participant) {
    if (participant && participant.publications) {
      const channels = Object.keys(participant.publications)
      for (let channel of channels) {
        participant.publications[channel].unpublish()
        this.unpublishFromPublication(channel)
      }
    }
  }
  // Unsubscribe all from this publication
  unpublishFromPublication(channel) {
    const keys = Object.keys(this.participants)
    for (let id of keys) {
      const participant = this.participants[id]
      if (participant.subscriptions[channel]) {
        participant.subscriptions[channel].unsubscribe()
        delete participant.subscriptions[channel]
      }
    }
  }

  unsubscribe(participant) {
    if (participant && participant.subscriptions) {
      const channels = Object.keys(participant.subscriptions)
      for (let channel of channels) {
        participant.subscriptions[channel].unsubscribe()
      }
    }
  }

  detach(id) {
    const participant = this.participants[id]
    if (participant) {
      this.unpublish(participant)
      this.unsubscribe(participant)
      if (participant.online()) {
        participant.sendRaw('bye')
        participant.disconnect()
      }
      delete this.participants[id]
    } else {
      this.error(`participant not exists ${id}`)
    }
  }

  shutdown() {
    this.log('shut down')
    const keys = Object.keys(this.participants)
    for (let id of keys) {
      this.detach(id)
    }
  }
}

module.exports = RoomController

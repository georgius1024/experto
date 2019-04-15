const moment = require('moment')
const logger = require('../classes/logger')
const roomsDb = require('../db/rooms-db')
const RoomParticipant = require('./room-participant')
const RoomPublication = require('./room-publication')
const RoomSubscription = require('./room-subscription')

class RoomController {
  constructor(room) {
    this.id = room._id
    this.room = room
    this.participants = {}
    this.updateLastActivity()
    this.log('created')
  }

  update(room) {
    this.room = { ...this.room, ...room }
  }

  updateLastActivity() {
    this.room.lastActivity = new Date()
    roomsDb.updateLastActivity(this.id)
  }

  log(message) {
    logger.trace(`Room ${this.id}: ${message}`)
  }

  error(error) {
    logger.error(`Room ${this.id}: ${error.message}`)
  }

  report() {
    const { _id: id, lastActivity, ...room } = this.room
    return {
      id,
      room,
      participants: Object.keys(this.participants).map(key => this.participants[key].report()),
      lastActivity: moment(lastActivity).fromNow(),
      lastActivityAt: moment(lastActivity).format('YYYY-MM-DD HH:mm:ss.SSS')
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
    this.updateLastActivity()
    this.log(`${participantId} connected`)
    const participant = new RoomParticipant(participantId, userName, role, socket)
    this.attach(participant, participantId)
    participant.sendMessage('welcome', { participantId, role, userName, roomName: this.room.roomName })
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
      this.updateLastActivity()
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
              this.unsubscribeFromPublication(channel)
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
      this.updateLastActivity()
      this.log(`${participantId} disconnected`)
      this.detach(participantId)
      this.broadcastRoomPublications()
    })

    socket.on('error', error => {
      this.updateLastActivity()
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
        this.unsubscribeFromPublication(channel)
      }
    }
  }
  unsubscribeFromPublication(channel) {
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
        delete participant.subscriptions[channel]
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

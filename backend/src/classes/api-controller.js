const RoomParticipant = require('./room-participant')
const RoomController = require('./room-controller')
const moment = require('moment')
const uuidv1 = require('uuid/v1')

class ApiController {
  constructor(Rtc) {
    this.Rtc = Rtc
    this.lastActivity = new Date()
    this.log('created')
  }

  log(message) {
    console.info(`Api controller: ${message}`)
  }

  error(error) {
    console.error(`Api controller: ${error.message}`)
    console.error(error)
  }

  report() {
    return {
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

  createRoom(roomId, roomName, userId) {
    const room = new RoomController(roomId, roomName, userId)
    this.Rtc.attach(room, roomId)
    return roomId
  }

  updateRoom(roomId, roomName) {
    const room = this.Rtc.get(roomId)
    if (!room) {
      return this.error(`wrong room id ${roomId}`)
    }
    room.name = roomName
  }

  deleteRoom(roomId) {
    this.Rtc.detach(roomId)
  }

  registerPerson(roomId, role, name = undefined, email = undefined) {
    const room = this.Rtc.get(roomId)
    if (!room) {
      return this.error(`wrong room id ${roomId}`)
    }
    const code = room.registrations[role] ? room.registrations[role].code : uuidv1() // Preserve old code if exists
    room.registrations[role] = {
      name,
      email,
      code
    }
    return code
  }

  sendNotification(roomId, role = 'listener') {
    const room = this.Rtc.get(roomId)
    if (!room) {
      return this.error(`wrong room id ${roomId}`)
    }
    const registration = room.registrations[role]
    if (!registration) {
      return this.error(`wrong registration ${role}`)
    }
    console.log('-'.repeat(80))
    console.log('-'.repeat(80))
    console.log(`sending invitation email to ${role} ${registration.name}`)
    console.log('From: %APP_EMAIL% <%APP_NAME%>')
    console.log(`To: ${registration.email}`)
    console.log('Subject: Your invitation link in %APP_NAME%')
    console.log('Body:')
    console.log(`Dear ${registration.name}`)
    console.log(`U r invited to room ${room.name}`)
    console.log(`Ur link is https://app-url-/index.html?entry=${registration.code}`)
    console.log('Please follow the link and we are waiting for you')
    console.log('-'.repeat(80))
    console.log('-'.repeat(80))
  }

  listRooms() {
    const keys = Object.keys(this.Rtc.pool)
    return keys.map(key => {
      const { id, name } = this.Rtc.pool[key]
      return { id, name }
    })
  }

  reportRoom(roomId) {
    const room = this.Rtc.get(roomId)
    if (!room) {
      return this.error(`wrong room id ${roomId}`)
    }
    const { id, name, registrations } = room
    return { id, name, registrations }
  }

  join(socket, sessionId, userName, userId) {
    this.lastActivity = new Date()
    this.log(`${sessionId} connected`)
    const participant = new RoomParticipant(sessionId, userName, 'presenter', socket)
    participant.sendMessage('welcome', { sessionId, userName })
    this.log(`${sessionId} connected`)

    socket.on('message', data => {
      this.lastActivity = new Date()
      const message = this.parseMessage(data)
      switch (message.id) {
      case 'create-appointment':
        {
          // TODO VALIDATE MESSAGE: roomName, personName, personEmail is required
          const roomId = uuidv1()
          if (this.createRoom(roomId, message.roomName, userId)) {
            this.registerPerson(roomId, participant.role, participant.name)
            this.registerPerson(roomId, 'listener', message.personName, message.personEmail)
            this.registerPerson(roomId, 'guest')
            participant.sendMessage('report', { data: this.reportRoom(roomId) })
          }
        }
        break
      case 'update-appointment':
        {
          // TODO VALIDATE MESSAGE: roomId, roomName, personName, personEmail is required
          this.updateRoom(message.roomId, message.roomName)
          this.registerPerson(message.roomId, participant.role, participant.name)
          this.registerPerson(message.roomId, 'listener', message.personName, message.personEmail)
          this.registerPerson(message.roomId, 'guest')
          participant.sendMessage('report', { data: this.reportRoom(message.roomId) })
        }
        break
      case 'create':
        {
          // TODO VALIDATE MESSAGE: roomName is required
          const roomId = uuidv1()
          if (this.createRoom(roomId, message.roomName, userId)) {
            participant.sendMessage('report', { data: this.reportRoom(roomId) })
          }
        }
        break
      case 'update':
        // TODO VALIDATE MESSAGE: roomId, roomName is required
        this.updateRoom(message.roomId, message.name)
        participant.sendMessage('report', { data: this.reportRoom(message.roomId) })
        break
      case 'delete':
        // TODO VALIDATE MESSAGE: roomId is required
        this.deleteRoom(message.roomId)
        participant.sendMessage('list', { data: this.listRooms() })
        break
      case 'register':
        // TODO VALIDATE MESSAGE: roomId, personName, personEmail is required
        if (this.registerPerson(message.roomId, message.role, message.personName, message.personEmail)) {
          participant.sendMessage('report', { data: this.reportRoom(message.roomId) })
        }
        break
      case 'notify':
        // TODO VALIDATE MESSAGE: roomId is required
        this.sendNotification(message.roomId)
        break
      case 'report':
        // TODO VALIDATE MESSAGE: roomId is required
        participant.sendMessage('report', { data: this.reportRoom(message.roomId) })
        break
      case 'list':
        participant.sendMessage('list', { data: this.listRooms() })
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
    function detach() {
      if (participant) {
        if (participant.online()) {
          participant.sendRaw('bye')
          participant.disconnect()
        }
      }
    }
    socket.on('close', () => {
      this.lastActivity = new Date()
      this.log(`${sessionId} disconnected`)
      detach()
    })

    socket.on('error', error => {
      this.lastActivity = new Date()
      this.log(`${sessionId} throws error: ${error} and left the room`)
      detach()
    })
  }
}

module.exports = ApiController

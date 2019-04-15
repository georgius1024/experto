class RoomParticipant {
  constructor(id, name, role, socket) {
    this.id = id
    this.name = name
    this.role = role
    this.socket = socket
    this.publications = {}
    this.subscriptions = {}
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
      name: this.name,
      role: this.role,
      online: this.online(),
      socketReadyState: Boolean(this.socket) && this.decodeSocketState(this.socket.readyState),
      publications: Object.keys(this.publications),
      subscriptions: Object.keys(this.subscriptions)
    }
  }

  decodeSocketState(state) {
    switch (state) {
    case 0:
      return 'connecting'
    case 1:
      return 'open'
    case 2:
      return 'closing'
    case 3:
      return 'closed'
    default:
      return '#' + state
    }
  }

  connect(socket) {
    this.socket = socket
  }

  disconnect() {
    if (this.online) {
      this.socket.close()
    }
    this.socket = null
  }

  online() {
    return this.socket && this.socket.readyState === 1
  }

  sendRaw(data) {
    if (this.online()) {
      this.socket.send(data)
    } else {
      this.error('offline')
    }
  }

  sendMessage(id, payload) {
    this.sendRaw(JSON.stringify({ id, ...payload }))
  }

  sendMessageInChannel(id, channel, payload) {
    this.sendRaw(JSON.stringify({ id, channel, ...payload }))
  }
}

module.exports = RoomParticipant

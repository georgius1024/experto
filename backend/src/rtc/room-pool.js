const ms = require('ms')
const roomsDb = require('../db/rooms-db')
const RoomController = require('./room-controller')
const logger = require('../classes/logger')

class RoomPool {
  constructor(ttl = '1 week') {
    this.pool = {}
    this.index = {}
    this.ttl = ttl

    setInterval(() => {
      this.checkTimeout()
    }, 1000)
    this.sync()
  }

  async sync() {
    const rooms = await roomsDb.all()
    const roomsToDelete = { ...this.pool }
    rooms.forEach(room => {
      delete roomsToDelete[room._id]
      this.attach(room)
    })
    const keys = Object.keys(roomsToDelete)
    keys.forEach(id => this.detach(id))
    this.rebuildIndex()
    this.log('Synchronized')
  }

  checkTimeout() {
    const deleted = false
    const old = new Date().valueOf() - ms(this.ttl)
    const keys = Object.keys(this.pool)
    for (let id of keys) {
      if (this.pool[id].lastActivity < old) {
        this.log(`Timedout room '${id}'`)
        this.detach(id)
        deleted = true
      }
    }
    if (deleted) {
      this.rebuildIndex()
    }
  }

  rebuildIndex() {
    this.index = {}
    const keys = Object.keys(this.pool)
    keys.forEach(id => {
      const room = this.pool[id].room
      this.index[room.presenterCode] = {
        role: 'presenter',
        name: room.presenterName,
        id
      }
      this.index[room.listenerCode] = {
        role: 'listener',
        name: room.listenerName,
        id
      }
      this.index[room.guestCode] = {
        role: 'guest',
        name: 'Гость',
        id
      }
    })
  }

  report() {
    const keys = Object.keys(this.pool)
    return keys.map(id => this.pool[id].report())
  }

  attach(room) {
    if (!this.pool[room._id]) {
      const controller = new RoomController(room)
      this.pool[room._id] = controller
    } else {
      const controller = this.pool[room._id]
      controller.update(room)
    }
  }

  find(code) {
    if (this.index[code]) {
      const { id, name, role } = this.index[code]
      const controller = this.pool[id]
      return { controller, name, role }
    } else {
      return {}
    }
  }

  get(id) {
    return this.pool[id]
  }

  async detach(id) {
    if (!this.pool[id]) {
      throw new Error(`Room #${id} not exists in pool`)
    }
    this.pool[id].shutdown()
    delete this.pool[id]
    await roomsDb.destroy(id)
    this.log(`Detached room '${id}'`)
  }

  log(message) {
    logger.trace(`Pool: ${message}`)
  }
}

module.exports = RoomPool

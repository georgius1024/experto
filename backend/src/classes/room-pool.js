const ms = require('ms')
const RoomController = require('./room-controller')

class RoomPool {
  constructor(ttl = '1 week') {
    this.pool = {}
    this.ttl = ttl

    setInterval(() => {
      this.checkTimeout()
    }, 1000)
  }

  checkTimeout() {
    const old = new Date().valueOf() - ms(this.ttl)
    const keys = Object.keys(this.pool)
    for (let id of keys) {
      if (this.pool[id].lastActivity < old) {
        this.log(`Timedout room '${id}'`)
        this.detach(id)
      }
    }
  }

  report() {
    const keys = Object.keys(this.pool)
    return keys.map(key => this.pool[key].report())
  }

  attach(room, id) {
    if (this.pool[id]) {
      throw new Error(`Room #${id} already exists in pool`)
    }
    this.pool[id] = room
    this.log(`Attached room '${id}'`)
  }

  get(id) {
    return this.pool[id]
  }

  detach(id) {
    if (!this.pool[id]) {
      throw new Error(`Room #${id} not exists in pool`)
    }
    this.pool[id].shutdown()
    delete this.pool[id]
    this.log(`Detached room '${id}'`)
  }

  log(message) {
    console.log(`Pool: ${message}`)
  }
}

module.exports = RoomPool

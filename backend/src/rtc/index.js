const ws = require('ws')
const logger = require('../classes/logger')
const RoomPool = require('./room-pool')
const pool = new RoomPool(process.env.ROOM_IDLE_TIME || '1d')
const uuid = require('uuid/v4')

const { getKurentoClient$ } = require('./kurento-calls')

function serve(server) {
  const socketServer = new ws.Server({
    server
  })

  socketServer.on('connection', function connection(socket, request) {
    function sendError(message) {
      logger.error(`RTC: Connection rejected with message "${message}"`)
      socket.send(message)
      socket.close()
    }
    const [, code] = request.url.split('/')
    if (!code) {
      return sendError('empty code')
    }
    const { controller, name, role } = pool.find(code)
    if (!controller) {
      return sendError('wrong code: ' + code)
    }
    logger.trace(`RTC: Accepted connection to ${controller.room.roomName} for ${role} ${name}`)
    controller.join(socket, uuid(), role, name)
  })
}

function init() {
  getKurentoClient$(process.env.MEDIA_API_URL)
    .then(() => {
      logger.info('RTC: Media server connected')
    })
    .catch(logger.error)
}

module.exports = { serve, init, pool }

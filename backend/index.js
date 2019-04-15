require('dotenv').config()
const dns = require('dns')
const fs = require('fs')
const https = require('https')
const os = require('os')

const uuidv4 = require('uuid/v4')
const Koa = require('koa')
const cors = require('@koa/cors')
const serve = require('koa-static')
const bodyParser = require('koa-bodyparser')

const errorHandler = require('./src/error-handler')
const router = require('./src/router')
const ApiController = require('./src/classes/api-controller')
const RoomPool = require('./src/classes/room-pool')
const experts = require('./src/db/experts')
const { getKurentoClient$ } = require('./src/utils/kurento-calls')
const app = new Koa()
const ws = require('ws')
const Rtc = new RoomPool('1d')
const Api = new ApiController(Rtc)
app.use(serve('public'))
app.use(bodyParser())
app.use(cors())
errorHandler(app)
router(app, Rtc)

const port = process.env.APP_LISTEN_PORT || 5781

const options = {
  key: fs.readFileSync('./keys/server.key'),
  cert: fs.readFileSync('./keys/server.crt')
}

const server = https.createServer(options, app.callback()).listen(port)

dns.lookup(os.hostname(), function(error, addr) {
  if (error) {
    console.log('DNS lookup failed with error: ' + error)
  } else {
    console.log('Server running at https://' + addr + ':' + port)
  }
})

const socketServer = new ws.Server({
  server
})

socketServer.on('connection', function connection(socket, request) {
  function sendError(message) {
    console.error(`Connection rejected with message "${message}"`)
    socket.send(message)
    socket.close()
  }
  const [, endpoint, roomCode, registrationCode] = request.url.split('/')
  if (endpoint === 'api') {
    const expert = experts.findById(roomCode)
    if (expert) {
      console.log(`Accepted ${endpoint} connection from ${expert.name}`)
      Api.join(socket, uuidv4(), expert.name, expert.id)
    } else {
      return sendError('wrong auth code: ' + roomCode)
    }
  } else if (endpoint === 'rtc') {
    let controller = Rtc.get(roomCode)
    if (!controller) {
      return sendError('wrong room: ' + roomCode)
    }
    if (!controller.registrations) {
      return sendError('wrong room: nobody is registered')
    }
    const roles = Object.keys(controller.registrations)
    const role = roles.find(role => controller.registrations[role].code === registrationCode)
    if (!role) {
      return sendError('wrong registration code: ' + registrationCode)
    }
    const registration = controller.registrations[role]
    console.log(`Accepted ${endpoint} connection to ${roomCode} for ${role} ${registration.name}`)
    controller.join(socket, uuidv4(), role, registration.name || 'Гость')
  } else {
    return sendError('wrong endpoint: ' + endpoint)
  }
})

getKurentoClient$(process.env.MEDIA_API_URL)
  .then(() => {
    console.log('Media server connected')
  })
  .catch(console.error)

module.exports = server

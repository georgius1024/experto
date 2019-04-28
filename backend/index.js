/**
 * Created by georgius on 18.07.2018.
 */
require('dotenv').config()
const https = require('https')
const fs = require('fs')
const dns = require('dns')
const os = require('os')
const Koa = require('koa')
const app = new Koa()
const serve = require('koa-static')
const cors = require('@koa/cors')
const koaBody = require('koa-body')
const compress = require('koa-compress')
const passport = require('koa-passport')
const logger = require('./src/classes/logger')
const RTC = require('./src/rtc')
// Bootstrap application
const routes = require('./src/routes')

// Error catcher
app.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    ctx.status = err.status || 500
    ctx.body = {
      status: 'error',
      message: err.message
    }
    ctx.app.emit('error', err, ctx)
  }
})

app.on('error', error => {
  if (error.message === 'Authentication Error') {
    logger.error(error.message)
  } else if (error.message.includes('Route not found')) {
    logger.error(error.message)
  } else {
    logger.error(error)
  }
})

// Global middleware
app.use(koaBody({ multipart: true }))
app.use(cors())
app.use(compress())
app.use(passport.initialize())

// Controllers
app.use(routes)

// Static
app.use(serve('public'))

// 404 handler
app.use(async ctx => {
  ctx.throw(404, 'Route not found for ' + ctx.method + ' ' + ctx.href)
})

const options = {
  key: fs.readFileSync(process.env.SSL_KEY || './keys/server.key'),
  cert: fs.readFileSync(process.env.SSL_CERT || './keys/server.crt')
}

const port = process.env.APP_LISTEN_PORT || 3000
const server = https.createServer(options, app.callback()).listen(port)

dns.lookup(os.hostname(), function(err, addr) {
  logger.info(
    `${process.env.APP_NAME} now running at ${'https://' + addr + ':' + port}`
  )
})

RTC.init()
RTC.serve(server)
module.exports = server

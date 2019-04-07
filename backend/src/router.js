const Router = require('koa-router')
const router = new Router()
const { genericResponse, errorResponse } = require('./utils/responses')
// the only "normal" http route is /inspect, but it works only in development mode
function routing(app, Rtc) {
  router.get('/inspect', (ctx, next) => {
    if (process.env.NODE_ENV === 'development') {
      return genericResponse(ctx, Rtc.report())
    }
    return errorResponse(ctx, 'Route not found', 404) // in production
  })
  app.use(router.routes()).use(router.allowedMethods())
}

module.exports = routing

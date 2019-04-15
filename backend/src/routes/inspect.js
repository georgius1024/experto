const Router = require('koa-router')
const { pool } = require('../rtc')
const Response = require('../classes/response')
const router = new Router()

router.get('/', (ctx, next) => {
  if (process.env.NODE_ENV === 'development') {
    return Response.generic(ctx, pool.report())
  }
  return Response.error(ctx, 'Route not found', 404) // in production
})

module.exports = router

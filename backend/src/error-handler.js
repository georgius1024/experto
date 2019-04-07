// Error catcher
const { errorResponse } = require('./responses')
function errorHandler(app) {
  app.use(async (ctx, next) => {
    try {
      await next()
    } catch (err) {
      return errorResponse(ctx, err.message, err.status || 500)
      ctx.app.emit('error', err, ctx)
    }
  })

  app.on('error', err => {
    if (process.env.NODE_ENV === 'development') {
      console.log('='.repeat(40))
      console.error(err.message)
      console.table(err.stack)
      console.log('='.repeat(40))
    }
  })
}

module.exports = errorHandler

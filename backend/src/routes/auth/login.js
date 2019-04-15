/**
 * Created by georgius on 18.07.2018.
 */

const Router = require('koa-router')
const passport = require('koa-passport')
const { generateTokens, publicProfile } = require('../../classes/auth')
const logger = require('../../classes/logger')
const Response = require('../../classes/response')

const router = new Router()

router.post('/', async (ctx, next) => {
  ctx.request.body.password = true
  return passport.authenticate('local', async (err, user) => {
    if (!user) {
      logger.trace(err)
      return Response.error(ctx, err || 'Требуется секретный код', 403)
    } else {
      try {
        const userData = publicProfile(user)
        logger.trace('user #%s logged in', user._id)
        const auth = await generateTokens(userData)
        return Response.authorized(ctx, userData, auth, 'Мы ждали Вас, ' + userData.name)
      } catch (e) {
        logger.error(e)
        return Response.error(ctx, e.message)
      }
    }
  })(ctx, next)
})

module.exports = router

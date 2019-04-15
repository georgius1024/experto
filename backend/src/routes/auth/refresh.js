/**
 * Created by georgius on 18.07.2018.
 */

const Router = require('koa-router')
const {generateTokens, publicProfile} = require('../../classes/auth')
const logger = require('../../classes/logger')
const usersDb = require('../../db/users-db')
const tokensDb = require('../../db/tokens-db')
const Response = require('../../classes/response')

const router = new Router()

router.post('/', async (ctx, next) => {
  const token = await tokensDb.findByToken(ctx.request.body.token)
  if (token) {
    tokensDb.destroy(token._id)
    const user = await usersDb.get(token.user_id)
    if (user) {
      logger.error('user #%s refreshed token', user.id)
      const userData = publicProfile(user)
      const auth = await generateTokens(userData)
      return Response.authorized(ctx, userData, auth)
    } else {
      logger.error('Wrong refresh token', token)
      return Response.error(ctx, 'Невозможно обновить токен, залогиньтесь, пожалуйста', 401)
    }
  } else {
    logger.error('Wrong refresh request', ctx.request.body)
    return Response.error(ctx, 'Невозможно обновить токен, перелогиньтесь, пожалуйста', 401)
  }
})

module.exports = router

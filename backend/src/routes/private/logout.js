/**
 * Created by georgius on 18.07.2018.
 */

const Router = require('koa-router')
const _get = require('lodash.get')
const usersDb = require('../../db/users-db')
const tokensDb = require('../../db/tokens-db')
const logger = require('../../classes/logger')
const Response = require('../../classes/response')

const router = new Router()
router.get('/', async (ctx) => {
  const userId = _get(ctx, 'state.token._id', 0)
  const user = await usersDb.get(userId)
  if (!user) {
    return Response.notFound(ctx)
  } else {
    await tokensDb.destroyTokensOfUser(userId)
    logger.debug('user #%s logged out', userId)
    // Frontend должен удалить главный токен сам
    return Response.message(ctx, `До новых встреч, ${user.name}`, 203) //
  }
})

module.exports = router

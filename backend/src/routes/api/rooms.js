/**
 * Created by georgius on 12.04.2019.
 */

const Router = require('koa-router')
const _pick = require('lodash.pick')
const _get = require('lodash.get')
const router = new Router()
const uuid = require('uuid/v4')
const roomsDb = require('../../db/rooms-db')
const Response = require('../../classes/response')
const logger = require('../../classes/logger')
const { pool } = require('../../rtc')

router.get('/', async (ctx, next) => {
  const userId = _get(ctx, 'state.token._id', 0)
  const rooms = await roomsDb.all()
  const data = rooms.filter(r => r.presenterId === userId)
  const meta = {
    total: data.length,
    from: 0,
    to: data.length - 1
  }
  return Response.list(ctx, data, meta)
})

router.get('/:_id', async ctx => {
  const userId = _get(ctx, 'state.token._id', 0)
  const room = await roomsDb.get(ctx.params._id)
  if (!room) {
    return Response.notFound(ctx)
  }
  if (room.presenterId !== userId) {
    return Response.forbidden(ctx)
  }
  return Response.show(ctx, room)
})

router.post('/', async ctx => {
  const userId = _get(ctx, 'state.token._id', 0)
  const userName = _get(ctx, 'state.token.name')
  try {
    const fields = _pick(ctx.request.body, ['roomName', 'listenerName', 'listenerEmail', 'date'])
    fields.presenterId = userId
    fields.presenterName = userName
    fields.presenterCode = uuid()
    fields.listenerCode = uuid()
    fields.guestCode = uuid()
    const validation = roomsDb.validRoom(fields)
    if (validation === true) {
      const instance = await roomsDb.create(fields)
      pool.sync()
      return Response.created(ctx, instance, 'Комната создана')
    } else {
      return Response.error(ctx, validation, 422)
    }
  } catch (error) {
    logger.error(error)
    return Response.error(ctx, error.message)
  }
})

router.put('/:_id', async ctx => {
  const userId = _get(ctx, 'state.token._id', 0)
  try {
    const room = await roomsDb.get(ctx.params._id)
    if (!room) {
      return Response.notFound(ctx)
    }
    if (room.presenterId !== userId) {
      return Response.forbidden(ctx)
    }
    const fields = _pick(ctx.request.body, ['roomName', 'listenerName', 'listenerEmail', 'date'])
    const combined = { ...room, ...fields }

    const validation = roomsDb.validRoom(combined)
    if (validation === true) {
      await roomsDb.update(combined)
      pool.sync()
      return Response.updated(ctx, combined, 'Комната обновлена')
    } else {
      return Response.error(ctx, validation, 422)
    }
  } catch (error) {
    logger.error(error)
    return Response.error(ctx, error.message)
  }
})

router.delete('/:_id', async ctx => {
  const userId = _get(ctx, 'state.token._id', 0)
  try {
    const room = await roomsDb.get(ctx.params._id)
    if (!room) {
      return Response.notFound(ctx)
    }
    if (room.presenterId !== userId) {
      return Response.forbidden(ctx)
    }
    await roomsDb.destroy(ctx.params._id)
    pool.sync()
    return Response.deleted(ctx, 'Комната удалена')
  } catch (error) {
    logger.error(error)
    return Response.error(ctx, error.message)
  }
})

module.exports = router

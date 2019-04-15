/**
 * Created by georgius on 12.04.19.
 */

const Router = require('koa-router')

const root = new Router()

const AuthGuard = require('../middleware/auth')

// Inspect
const inspect = new Router()
useFile(inspect, '', './inspect')
root.use('/inspect', inspect.routes())

// Auth
const auth = new Router()
useFile(auth, '/login', './auth/login')
useFile(auth, '/refresh', './auth/refresh')
root.use('/auth', auth.routes())

// Profile
const profile = new Router()
profile.use(AuthGuard)
useFile(profile, '/logout', './private/logout')
root.use('/private', profile.routes())

// Api
const api = new Router()
api.use(AuthGuard)
useFile(api, '/rooms', './api/rooms')
root.use('/api', api.routes())

module.exports = root.routes()

function useFile(parent, path, fileName) {
  const router = require(fileName)
  parent.use(path, router.routes(), router.allowedMethods())
}

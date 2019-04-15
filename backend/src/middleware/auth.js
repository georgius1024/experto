/**
 * Created by georgius on 20.07.18.
 */
const jwt = require('koa-jwt')
module.exports = jwt({
  secret: process.env.APP_KEY || 'secret',
  debug: process.env.MODE === 'development',
  key: 'token'
})

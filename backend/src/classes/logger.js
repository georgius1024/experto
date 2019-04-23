/**
 * Created by georgius on 20.07.18.
 */
const options = {
  level: process.env.NODE_ENV === 'production' ? 'info' : 'trace',
}
if (process.env.NODE_ENV !== 'production') {
  options.prettyPrint = { colorize: true }
}
const Logger = require('pino')(options)
module.exports = Logger
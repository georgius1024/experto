const development = {
  rtcEndPoint: process.env.REACT_APP_RTC_ENDPOINT || 'wss://127.0.0.1:3500',
  logLevel: 'debug'
}

const production = { ...development, ...{ logLevel: 'warn' } }
export default (process.env.NODE_ENV === 'production'
  ? production
  : development)

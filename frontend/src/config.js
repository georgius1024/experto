const development = {
  rtcEndPoint: 'wss://127.0.0.1:3500',
  logLevel: 'debug'
}

const production = {
  rtcEndPoint: 'wss://' + window.location.host,
  logLevel: 'warn'
}

export default (process.env.NODE_ENV === 'production' ? production : development)

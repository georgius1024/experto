const development = {
  apiEndPoint: 'https://127.0.0.1:3500',
  rtcEndPoint: 'wss://127.0.0.1:3500',
  public: 'http://localhost:3000',
  logLevel: 'debug'
}

const production = {
  apiEndPoint: 'https://' + window.location.host,
  rtcEndPoint: 'wss://' + window.location.host,
  public: 'https://' + window.location.host,
  logLevel: 'warn'
}

export default (process.env.NODE_ENV === 'production' ? production : development)

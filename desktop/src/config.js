const development = {
  apiEndPoint: process.env.REACT_APP_API_ENDPOINT || 'https://127.0.0.1:3500',
  rtcEndPoint: process.env.REACT_APP_RTC_ENDPOINT || 'wss://127.0.0.1:3500',
  public: (process.env.REACT_APP_API_ENDPOINT || 'https://127.0.0.1:3500') + '/#',
  logLevel: 'debug'
}

const production = { ...development, ...{ logLevel: 'warn' } }
export default (process.env.NODE_ENV === 'production' ? production : development)

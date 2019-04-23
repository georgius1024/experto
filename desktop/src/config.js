const development = {
  apiEndPoint: 'https://127.0.0.1:3500',
  rtcEndPoint: 'wss://127.0.0.1:3500',
  logLevel: 'debug'
}

const production = {
  apiEndPoint: 'https://expert.vep.ru',
  rtcEndPoint: 'wss://expert.vep.ru',
  logLevel: 'warn'
}

export default (process.env.NODE_ENV === 'production' ? production : development)

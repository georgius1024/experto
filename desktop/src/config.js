const development = {
  apiEndPoint: 'https://127.0.0.1:3500',
  rtcEndPoint: 'wss://127.0.0.1:3500',
  public: 'https://127.0.0.1:3000/#',
  logLevel: 'debug'
}

const production = {
  apiEndPoint: 'https://expert.vep.ru',
  rtcEndPoint: 'wss://expert.vep.ru:3421',
  public: 'https://expert.vep.ru/#',
  logLevel: 'warn'
}

export default (process.env.NODE_ENV === 'production' ? production : development)

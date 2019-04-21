/**
 * Created by georgius on 23.07.18.
 */
const Email = require('email-templates')
const nodemailer = require('nodemailer')
const moment = require('moment-timezone')
const path = require('path')

const smtpConfig = {
  driver: 'smtp',
  pool: true,
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT || 25,
  secure: Boolean(process.env.MAIL_SECURE),
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD
  },
  ignoreTLS: Boolean(process.env.MAIL_IGNORE_TLS),
  requireTLS: Boolean(process.env.MAIL_REQUIRE_TLS),
  tls: {
    rejectUnauthorized: false
  },
  maxConnections: process.env.MAIL_MAX_CONNECTIONS || 5, // Размер пула по умолчанию:
  maxMessages: process.env.MAIL_MAX_MESSAGES || 100, // 5 сокетов по 100 сообщений
  rateDelta: process.env.MAIL_RATE_DELTA || 2000, // За 2 секунды
  rateLimit: process.env.MAIL_RATE_LIMIT || 1, // Отправить 1 сообщение
  connectionTimeout: (process.env.MAIL_TIMEOUT || 0) * 1000 || 2 * 60 * 1000, // how many milliseconds to wait for the connection to establish
  greetingTimeout: (process.env.MAIL_TIMEOUT || 0) * 1000 || 30 * 1000 // how many milliseconds to wait for the greeting
}

const Mailer = new Email({
  message: {
    from: process.env.MAIL_FROM_NAME + ' <' + process.env.MAIL_FROM_ADDRESS + '>'
  },
  juice: true,
  juiceResources: {
    preserveImportant: true,
    webResources: {
      relativeTo: path.resolve('assets')
    }
  },
  send: process.env.NODE_ENV === 'production',
  preview: ['development', 'test'].includes(process.env.NODE_ENV),
  transport: nodemailer.createTransport(smtpConfig)
})

const sendMail = async (recipient, template, locals) => {
  locals.APP_NAME = process.env.APP_NAME || 'APP_NAME'
  return await Mailer.send({
    template,
    message: {
      to: recipient
    },
    locals
  }).then(res => {
    Mailer.lastMessage = res.originalMessage
  })
}

async function expertNotificationMessage(expert) {
  const locals = { ...expert }
  return await sendMail(expert.email, 'expert', locals)
}

async function listenertNotificationMessage(expert, room) {
  const locals = { ...expert, ...room }
  locals.actionUrl = process.env.APP_PUBLIC_URL + '/room/' + room.listenerCode
  locals.planned = moment(room.date)
    .tz('Europe/Moscow')
    .format('DD.MM.YYYY HH:mm')
  return await sendMail(room.listenerEmail, 'listener', locals)
}

module.exports = {
  Mailer,
  sendMail,
  listenertNotificationMessage,
  expertNotificationMessage
}

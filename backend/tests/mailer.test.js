/**
 * Created by georgius on 11.08.18.
 */
'use strict'
const chai = require('chai')
const {
  Mailer,
  listenertNotificationMessage,
  expertNotificationMessage
} = require('../src/classes/mailer')

const assert = chai.assert
chai.should()

describe('Mailer class', async function() {
  this.slow(200)
  const userCode = '3ba0e79d-01e9-49b6-88f6-204cff69e254'
  const userName = 'Fake user'
  const userEmail = 'fff848585858@5959689.com'

  let user

  before(async () => {
    Mailer.config.send = false
    Mailer.config.preview = false
  })

  it('can send invite message', async () => {
    Mailer.lastMessage = null
    const user = {
      name: userName,
      email: userEmail,
      code: userCode
    }
    const room = {
      roomName: 'r1',
      listenerNamer: 'l1',
      listenerEmail: '1@2',
      listenerCode: '123'
    }

    await listenertNotificationMessage(user, room)
    assert.isOk(Mailer.lastMessage)
  })

  it('can send expert message', async () => {
    Mailer.lastMessage = null
    const user = {
      name: userName,
      email: userEmail,
      code: userCode
    }

    await expertNotificationMessage(user)
    assert.isOk(Mailer.lastMessage)
  })
})

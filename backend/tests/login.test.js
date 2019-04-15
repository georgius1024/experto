/**
 * Created by georgius on 11.08.18.
 */
'use strict'
require('dotenv').config()
const chai = require('chai')
let chaiHttp = require('chai-http')
const usersDb = require('../src/db/users-db')
const tokensDb = require('../src/db/tokens-db')
const server = require('../index.js')

chai.use(chaiHttp)
const assert = chai.assert

describe('login', async () => {
  let userCode
  const userName = 'Login-test'
  const userEmail = 'presenter@5959689.com'
  const wrongCode = '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`'

  async function createUser () {
    // Создаем пользователя для проверки входа
    const registration = {
      name: userName,
      email: userEmail,
    }
    user = await usersDb.create(registration)
    userCode = user.code
  }

  async function clearUser () {
    const user = await usersDb.findByCode(userCode)
    if (user) {
      await usersDb.destroy(user._id)
      await tokensDb.destroyTokensOfUser(user._id)
    }
    usersDb.$datastore.remove({name: userName})
  }
  let requester, user

  before(async () => {
    requester = chai.request(server).keepOpen()

    await clearUser()
    await createUser()
  })

  it('Can not login traditional way with wrong code', async () => {
    const response = await requester
      .post('/auth/login')
      .type('form')
      .send({
        code: wrongCode
      })
    assert.equal(response.status, 404)
  })

  it('Can login traditional way with correct code', async () => {
    const response = await requester
      .post('/auth/login')
      .type('form')
      .send({
        code: userCode
      })
    assert.equal(response.status, 200)
    assert.isObject(response.body)
    assert.equal(response.body.status, 'success')
    assert.include(response.body.message, userName)
    assert.equal(response.body.data.id, user.id)
    assert.isObject(response.body.auth)
    assert.isOk(response.body.auth.accessToken)
    assert.isOk(response.body.auth.refreshToken)
    // Проверка на создание токена
    const token = await tokensDb.findByToken(response.body.auth.refreshToken)
    assert.equal(token.user_id, user._id)
  })

  after(async () => {
    requester.close()
    await clearUser()
  })
})

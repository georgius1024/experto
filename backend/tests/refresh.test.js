/**
 * Created by georgius on 15.11.18.
 */
'use strict'
const chai = require('chai')
let chaiHttp = require('chai-http')
const uuidv1 = require('uuid/v1')
const usersDb = require('../src/db/users-db')
const tokensDb = require('../src/db/tokens-db')
const { deleteTokens } = require('../src/classes/auth')
const server = require('../index.js')

chai.use(chaiHttp)
const assert = chai.assert

describe('refresh', async () => {
  const wrongToken = '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'
  let userCode
  const userName = 'Refresh-Test'
  const userEmail = 'presenter@5959689.com'

  async function createUser () {
    // Создаем пользователя для проверки входа
    const registration = {
      name: userName,
      email: userEmail,
    }
    user = await usersDb.create(registration)
    userCode = user.code
  }

  async function loginUser () {
    const response = await requester
    .post('/auth/login')
    .type('form')
    .send({
      code: userCode
    })
    assert.equal(response.status, 200)
    assert.equal(response.body.data.id, user.id)
    assert.isObject(response.body.auth)
    assert.isOk(response.body.auth.accessToken)
    accessToken = response.body.auth.accessToken
    refreshToken = response.body.auth.refreshToken
  }

  async function clearUser () {
    const user = await usersDb.findByCode(userCode)
    if (user) {
      await usersDb.destroy(user._id)
      await tokensDb.destroyTokensOfUser(user._id)
    }
    usersDb.$datastore.remove({name: userName})
  }


  let requester, user, accessToken, refreshToken
  before(async () => {
    requester = chai.request(server).keepOpen()
    await clearUser()
    await createUser()
    await loginUser()
  })

  it('Can not refresh with invalid token', async () => {
    const response = await requester
      .post('/auth/refresh')
      .type('form')
      .send({
        token: wrongToken
      })
    assert.equal(response.status, 401)
    assert.equal(response.body.message, 'Невозможно обновить токен, перелогиньтесь, пожалуйста')
  })

  it('Can not refresh with invalid user', async () => {
    const wrongUser = 2e9
    await deleteTokens(wrongUser)
    await tokensDb.create({
      user_id: wrongUser,
      token: wrongToken
    })

    const response = await requester
      .post('/auth/refresh')
      .type('form')
      .send({
        token: wrongToken
      })

    assert.equal(response.status, 401)
    assert.equal(response.body.message, 'Невозможно обновить токен, залогиньтесь, пожалуйста')
    await deleteTokens(wrongUser)
  })

  it('Can refresh with valid token', async () => {
    const response = await requester
      .post('/auth/refresh')
      .type('form')
      .send({
        token: refreshToken
      })

    assert.equal(response.status, 200)
    assert.isObject(response.body)
    assert.isObject(response.body.auth)
    assert.equal(response.body.status, 'success')

    // Новые токены
    assert.notEqual(accessToken, response.body.auth.accessToken)
    assert.notEqual(refreshToken, response.body.auth.refreshToken)

    // Проверка на отсутствие старого токена
    const oldToken = await tokensDb.findByToken(refreshToken)
    assert.isNotOk(oldToken)

    // Проверка на наличие нового токена
    const newToken = await tokensDb.findByToken(response.body.auth.refreshToken)
    assert.isOk(newToken)
  })

  after(async () => {
    requester.close()
    await clearUser()
  })
})

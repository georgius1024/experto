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

describe('logout', async () => {
  let requester, user, accessToken, refreshToken

  let userCode
  const userName = 'Logout-Test'
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


  before(async () => {
    requester = chai.request(server).keepOpen()
    await clearUser()
    await createUser()
    await loginUser()
  })

  it('Can not logout when not logged in', async () => {
    const response = await requester.get('/private/logout')
    assert.equal(response.status, 401)
  })

  it('Can logout when logged in', async () => {
    const response = await requester
    .get('/private/logout')
    .set('Authorization', 'Bearer ' + accessToken)
    assert.equal(response.status, 203)
    assert.isObject(response.body)
    assert.equal(response.body.status, 'success')
    assert.include(response.body.message, userName)

    // Проверка на отсутствие токена
    const oldToken = await tokensDb.findByToken(refreshToken)
    assert.isNotOk(oldToken)
  })

  after(async () => {
    requester.close()
    await clearUser()
  })
})

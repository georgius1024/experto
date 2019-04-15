/**
 * Created by georgius on 12.04.19.
 */
'use strict'
const chai = require('chai')
let chaiHttp = require('chai-http')
const roomsDb = require('../src/db/rooms-db')
const usersDb = require('../src/db/users-db')
const tokensDb = require('../src/db/tokens-db')
const server = require('../index.js')


chai.use(chaiHttp)
const assert = chai.assert

describe('Rooms CRUD', async () => {

  const roomName = 'Best room Ever'
  const listenerName = 'Best room Ever'
  const listenerEmail = 'listener@5959689.com'

  let userCode
  const userName = 'Room-Test'
  const userEmail = 'presenter@5959689.com'

  let requester, user, room, response, accessToken

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
  }

  async function clearUser () {
    const user = await usersDb.findByCode(userCode)
    if (user) {
      await usersDb.destroy(user._id)
      await tokensDb.destroyTokensOfUser(user._id)
    }
    usersDb.$datastore.remove({name: userName})
  }

  async function clearRoom () {
    await roomsDb.$datastore.remove({roomName})
  }

  before(async () => {
    requester = chai.request(server).keepOpen()
    await clearUser()
    await clearRoom()
    await createUser()
    await loginUser()
  })

  it('Data is initialized', () => {
    assert.isOk(user)
    assert.isOk(accessToken)
  })

  it('Can not get rooms without credentials', async () => {
    response = await requester
    .get('/api/rooms' )
    assert.equal(response.status, 401)
  })

  it('Can not get rooms with proper credentials', async () => {
    response = await requester
    .get('/api/rooms' )
    .set('Authorization', 'Bearer ' + accessToken)
    assert.notEqual(response.status, 401)
  })

  it('Can create room', async () => {
    const sampleData = {
      roomName,
      listenerName,
      listenerEmail
    }
    response = await requester
    .post('/api/rooms' )
    .set('Authorization', 'Bearer ' + accessToken)
    .send(sampleData)
    assert.equal(response.status, 201)
    assert.equal(response.body.status, 'success')
    assert.equal(response.body.message,'Комната создана')
    assert.isObject(response.body.data)
    assert.isOk(response.body.data._id)
    room = response.body.data

  })
  it('can read room', async () => {
    response = await requester
    .get('/api/rooms/' + room._id)
    .set('Authorization', 'Bearer ' + accessToken)
    assert.equal(response.status, 200)
    assert.equal(response.body.status, 'success')
    assert.isObject(response.body.data)
    assert.deepEqual(response.body.data, room)
  })
  it('can list rooms', async () => {
    response = await requester
    .get('/api/rooms')
    .set('Authorization', 'Bearer ' + accessToken)
    assert.equal(response.status, 200)
    assert.equal(response.body.status, 'success')
    assert.isArray(response.body.data)
    assert.isObject(response.body.meta)
    assert.deepEqual(response.body.data[0], room)
    assert.deepEqual(response.body.meta, {total: 1, from : 0, to: 0})
  })

  it ('can find room by listener code', async () => {
    const instance = await roomsDb.findByListenerCode(room.listenerCode)
    assert.isObject(instance)
    assert.deepEqual(instance, room)
  })

  it ('can find room by guest code', async () => {
    const instance = await roomsDb.findByGuestCode(room.guestCode)
    assert.isObject(instance)
    assert.deepEqual(instance, room)
  })

  it('can update room', async () => {
    const sampleData = {
      roomName,
      listenerName,
      listenerEmail
    }
    sampleData.listenerName = '['  + sampleData.listenerName + ']'
    response = await requester
    .put('/api/rooms/' + room._id)
    .set('Authorization', 'Bearer ' + accessToken)
    .send(sampleData)
    assert.equal(response.status, 202)
    assert.equal(response.body.status, 'success')
    assert.equal(response.body.message,'Комната обновлена')
    assert.deepEqual(response.body.data.listenerName, sampleData.listenerName)

    response = await requester
    .get('/api/rooms/' + room._id)
    .set('Authorization', 'Bearer ' + accessToken)
    assert.deepEqual(response.body.data.listenerName, sampleData.listenerName)

  })
  it('can destroy room', async () => {
    response = await requester
    .delete('/api/rooms/' + room._id)
    .set('Authorization', 'Bearer ' + accessToken)
    assert.equal(response.status, 200)
    assert.equal(response.body.status, 'success')
    assert.equal(response.body.message,'Комната удалена')
  })


  after(async () => {
    requester.close()
    await clearUser()
    await clearRoom()
  })
})

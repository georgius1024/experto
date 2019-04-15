/**
 * Created by georgius on 11.08.18.
 */
'use strict'
const assert = require('chai').assert
const usersDb = require('../src/db/users-db')
const tokensDb = require('../src/db/tokens-db')

describe('DB working', async () => {
  it('user db', async function() {
    const user = await usersDb.all()
    assert.isOk(user)
  })
  it('token db', async function() {
    const tokens = await tokensDb.all()
    assert.isOk(tokens)
  })
})

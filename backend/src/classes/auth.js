/**
 * Created by georgius on 19.07.18.
 */
const passport = require('koa-passport')
const LocalStrategy = require('passport-local').Strategy
const ms = require('ms')
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const uuidv1 = require('uuid/v1');
const _pick = require('lodash.pick')
const usersDb = require('../db/users-db')
const tokensDb = require('../db/tokens-db')
const path = require('path')

const accessTokenTtl = ms(process.env.ACCESS_TOKEN_TTL || '1 day')
const refreshTokenTtl = ms(process.env.REFRESH_TOKEN_TTL || '180 days')
const secret = process.env.APP_KEY || 'secret'


const generateTokens = async (user, opts = {}) => {
  try {
    const accessTokenId = uuidv1();
    const refreshTokenId = uuidv1();

    const accessTokenPayload = {...user, jti: accessTokenId }
    const refreshTokenPayload = { jti: refreshTokenId }

    const refreshTokenOpts = {...opts, expiresIn: refreshTokenTtl}

    const accessTokenOpts = {...opts, expiresIn: accessTokenTtl}

    const refreshToken = await jwt.sign(refreshTokenPayload, secret, refreshTokenOpts);
    const accessToken = await jwt.sign(accessTokenPayload, secret, accessTokenOpts);
    await tokensDb.create({
      user_id: user._id,
      token: refreshToken
    })
    return Promise.resolve({
      accessToken,
      refreshToken
    });

  } catch(e) {
    return Promise.reject(e)
  }
}

const publicProfile = (user) => {
  const fields = _pick(user, ['_id', 'name', 'email', 'code'])
  return fields
}

const deleteTokens = async (id) => {
  await tokensDb.destroyTokensOfUser(id)
}


const localStartegyOptions = {
  usernameField: 'code',
  session: false
}

passport.use(new LocalStrategy(localStartegyOptions,
  async (username, password, done) => {
    const user = await usersDb.findByCode(username)
    if (user) {
      return done(null, user)
    } else {
      return done('Неправильно введен секретный код')
    }
  })
)

module.exports = {
  generateTokens,
  deleteTokens,
  publicProfile
}
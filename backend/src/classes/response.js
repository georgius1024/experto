/**
 * Created by georgius on 20.07.18.
 */
const _get = require('lodash.get')

function error (ctx, message = 'General failure', status = 500) {
  ctx.status = status
  ctx.body = {
    'status': 'error',
    'message': message
  }
}

function message (ctx, message, status = 200) {
  ctx.status = status
  ctx.body = {
    'status': 'success',
    'message': message
  }
}

function generic (ctx, data, message = '', status = 200) {
  ctx.status = status
  ctx.body = {
    'status': 'success',
    'data': data,
    'message': message ? message : undefined
  }
}

function created (ctx, data, message = 'Объект создан', status = 201) {
  return generic(ctx, data, message, status)
}

function updated (ctx, data, message = 'Объект обновлен', status = 202) {
  return generic(ctx, data, message, status)
}

function deleted (ctx, message = 'Объект удален', status = 200) {
  return generic(ctx, undefined, message, status)
}

function show (ctx, data) {
  return generic(ctx, data)
}

function list (ctx, data, meta) {
  ctx.status = 200
  ctx.body = {
    'status': 'success',
    meta,
    data
  }
}

function validation (ctx, errors, message = '') {
  let errorMessage = message || _get(errors, '0.message') || _get(errors, '0.error')
  ctx.status = 422
  ctx.body = {
    'status': 'error',
    errors,
    message: errorMessage
  }
}

function customValidation (ctx, field, message) {

  ctx.status = 422
  ctx.body = {
    'status': 'error',
    errors: [{
      message: message,
      validation: 'custom',
      field
    }],
    message
  }
}

function forbidden (ctx) {
  return error(ctx, 'Недостаточный уровень доступа', 403)
}

function notFound (ctx) {
  return error(ctx, 'Объект не найден', 404)
}

function unauthorized (ctx, message = 'Недоступно без авторизации') {
  return error(ctx, message, 401)
}

function authorized (ctx, data, auth, message) {

  ctx.status = 200
  ctx.body = {
    'status': 'success',
    data,
    auth,
    message
  }
}

module.exports = {
  error,
  message,
  generic,
  created,
  updated,
  deleted,
  show,
  list,
  validation,
  customValidation,
  forbidden,
  notFound,
  unauthorized,
  authorized
}

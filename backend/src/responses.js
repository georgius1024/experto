function errorResponse(ctx, message = 'General failure', status = 500) {
  ctx.status = status
  ctx.body = {
    status: 'error',
    message: message
  }
}

function messageResponse(ctx, message, status = 200) {
  ctx.status = status
  ctx.body = {
    status: 'success',
    message: message
  }
}

function genericResponse(ctx, data, message = '', status = 200) {
  ctx.status = status
  ctx.body = {
    status: 'success',
    data: data,
    message: message ? message : undefined
  }
}

module.exports = {
  errorResponse,
  messageResponse,
  genericResponse
}

require('chai').should()
const Response = require('../src/classes/response')
describe('response.js', () => {
  it('really works', () => {
    let context = {}
    Response.error(context)
    context.should.be.deep.equal({ status: 500,
      body: { status: 'error', message: 'General failure' } }
    )
    context = {}
    Response.message(context, 10)
    context.should.be.deep.equal({ status: 200,
      body: { status: 'success', message: 10 } }
    )
    context = {}
    Response.generic(context, 10, 20)
    context.should.be.deep.equal({ status: 200,
      body: { status: 'success', data: 10, message: 20 } }
    )
    context = {}
    Response.created(context, 10, 20)
    context.should.be.deep.equal({ status: 201,
      body: { status: 'success', data: 10, message: 20 } }
    )
    context = {}
    Response.updated(context, 10, 20)
    context.should.be.deep.equal({ status: 202,
      body: { status: 'success', data: 10, message: 20 } }
    )
    context = {}
    Response.deleted(context, 20)
    context.should.be.deep.equal({ status: 200,
      body: { status: 'success', data: undefined, message: 20 } }
    )
    context = {}
    Response.show(context, 10)
    context.should.be.deep.equal({ status: 200,
      body: { status: 'success', data: 10, message: undefined } }
    )

    context = {}
    Response.list(context, 10, 20)
    context.should.be.deep.equal({ status: 200,
      body: { status: 'success', data: 10, meta: 20 } }
    )
    context = {}
    Response.validation(context, [{
      message: 'login-error',
      field: 'login'
    }])
    context.should.be.deep.equal({ status: 422,
      body: { status: 'error', errors: [{
        message: 'login-error',
        field: 'login'
      }], message: 'login-error'} }
    )
    context = {}
    Response.customValidation(context, 'login', 'login-error')
    context.should.be.deep.equal({status: 422,
      body: {
        'status': 'error',
        errors: [{
          message: 'login-error',
          validation: 'custom',
          field: 'login'
        }],
        message: 'login-error'
      }})
    context = {}
    Response.forbidden(context)
    context.should.be.deep.equal({ status: 403,
      body: { status: 'error', message: 'Недостаточный уровень доступа' } }
    )
    context = {}
    Response.notFound(context)
    context.should.be.deep.equal({ status: 404,
      body: { status: 'error', message: 'Объект не найден' } }
    )
    context = {}
    Response.unauthorized(context)
    context.should.be.deep.equal({ status: 401,
      body: { status: 'error', message: 'Недоступно без авторизации' } }
    )
    context = {}
    Response.authorized(context, 10, 20, 30)
    context.should.be.deep.equal({ status: 200,
      body: {
        'status': 'success',
        data: 10,
        auth: 20,
        message: 30
      } }
    )

  })
})

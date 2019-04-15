const Datastore = require('nedb-promises')
const path = require('path')
const uuid = require('uuid/v4')

let datastore = Datastore.create(path.resolve(__dirname, '../../storage/users.db'))

function validEmail(email) {
  return (
    email &&
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      email
    )
  )
}

function validExpert(data) {
  if (!data.name) {
    return 'Нет имени'
  }
  if (!data.email) {
    return 'Нет email'
  }
  if (!validEmail(data.email)) {
    return 'Недопустимый email'
  }
  return true
}

function create(data) {
  data.code = uuid()
  return datastore.insert(data)
}

function update(data) {
  const _id = data._id
  return datastore.update({ _id }, data)
}

function destroy(_id) {
  return datastore.remove({ _id })
}

function all() {
  return datastore.find({})
}

function get(_id) {
  return datastore.findOne({ _id })
}

function findByCode(code) {
  return datastore.findOne({ code })
}

function findByEmail(email) {
  return datastore.findOne({ email })
}

module.exports = {
  $datastore: datastore,
  create,
  update,
  destroy,
  all,
  get,
  findByCode,
  findByEmail,
  validEmail,
  validExpert
}

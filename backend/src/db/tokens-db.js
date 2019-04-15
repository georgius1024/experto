const Datastore = require('nedb-promises')
const path = require('path')

let datastore = Datastore.create(path.resolve(__dirname, '../../storage/tokens.db'))

function create(data) {
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

function findByToken(token) {
  return datastore.findOne({ token })
}

function destroyTokensOfUser(user_id) {
  return datastore.remove({ user_id })
}


module.exports = {
  create,
  update,
  destroy,
  all,
  get,
  findByToken,
  destroyTokensOfUser
}

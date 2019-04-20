const Datastore = require('nedb-promises')
const path = require('path')

let datastore = Datastore.create(path.resolve(__dirname, '../../storage/rooms.db'))

function validEmail(email) {
  return (
    email &&
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      email
    )
  )
}

function validRoom(data) {
  if (!data.roomName) {
    return 'Нет имени комнаты'
  }
  if (!data.listenerEmail) {
    return 'Нет email слушателя'
  }
  if (!data.listenerName) {
    return 'Нет имени слушателя'
  }
  if (!data.date) {
    return 'Нет даты встречи'
  }
  if (!validEmail(data.listenerEmail)) {
    return 'Недопустимый email слушателя'
  }
  return true
}

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

function updateLastActivity(_id) {
  return datastore.update({ _id }, { $set: { lastActivity: new Date() } })
}

module.exports = {
  $datastore: datastore,
  create,
  update,
  destroy,
  all,
  get,
  updateLastActivity,
  validRoom
}

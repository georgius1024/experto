const fs = require('fs')
const path = require('path')
const uuidv4 = require('uuid/v4')
const dbPath = path.resolve(__dirname, '../../storage/experts.json')
let experts = []
function load() {
  if (!fs.existsSync(dbPath)) {
    return
  }
  try {
    experts = JSON.parse(fs.readFileSync(dbPath))
  } catch (error) {
    experts = []
    console.log(error.message)
  }
}
function validEmail(email) {
  return (
    email &&
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      email
    )
  )
}

function save() {
  fs.writeFileSync(dbPath, JSON.stringify(experts, null, '  '))
}

function validExpert(data) {
  if (!data.name) {
    return 'Name is required'
  }
  if (!data.email) {
    return 'Email is required'
  }
  if (!validEmail(data.email)) {
    return 'Email must be valid'
  }
  return true
}

function create(data) {
  const valid = validExpert(data)
  if (valid !== true) {
    throw new Error(valid)
  }
  data.id = uuidv4()
  experts.push(data)
  save()
  data.id
}

function update(data) {
  const valid = validExpert(data)
  if (valid !== true) {
    throw new Error(valid)
  }
  experts = experts.map(e => (e.id === data.id ? data : e))
  save()
}

function destroy(id) {
  experts = experts.filter(e => e.id !== id)
  save()
}

function all() {
  load()
  return [...experts]
}

function findById(id) {
  load()
  const expert = experts.find(e => e.id === id)
  return expert
}

module.exports = {
  create,
  update,
  destroy,
  all,
  findById,
  validEmail
}

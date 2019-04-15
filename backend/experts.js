require('dotenv').config()
const inquirer = require('inquirer')
const usersDb = require('./src/db/users-db')
const chalk = require('chalk')
const {Mailer, expertNotificationMessage} = require('./src/classes/mailer')
const _padEnd = require('lodash.padend')

function showBanner () {
  console.clear()
  console.log(chalk.green('   ╔═══════════════════════════════════╗'))
  console.log(chalk.green('   ║ Experte Credo: вместо тысячи слов ║'))
  console.log(chalk.green('   ║              · · ·                ║'))
  console.log(chalk.green('   ║   Управление списком экспертов    ║'))
  console.log(chalk.green('   ╚═══════════════════════════════════╝'))
  console.log()
}

const limit = 10

async function createExpert () {
  const newExpert = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Введите имя эксперта:',
      validate: value => {
        return Boolean(value)
      }
    },
    {
      type: 'input',
      name: 'email',
      message: 'Введите адрес электронной почты:',
      validate: value => {
        if (! usersDb.validEmail(value)) {
          return 'Введите валидный адрес электронной почты'
        }
        return true
      }
    }
  ])
  await usersDb.create(newExpert)
}

async function viewExpert (expert) {
  console.log('   ┌' + '─'.repeat(77) + '┐')
  console.log('   │ Имя:   ', _padEnd(expert.name.slice(0, 65), 67), '│')
  console.log('   │ Email: ', _padEnd(expert.email.slice(0, 65), 67), '│')
  console.log('   │ Код:   ', chalk.yellow(_padEnd(expert.code.slice(0, 65), 67)), '│')
  console.log('   └' + '─'.repeat(77) + '┘')
  const choices = ['Правка', 'Удаление', 'Уведомление', 'Выход']
  const choice = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Выберите действие',
      choices
    }
  ])
  switch (choice.action) {
    case 'Правка':
      return await updateExpert(expert)
    case 'Удаление':
      return await deleteExpert(expert)
    case 'Уведомление':
      Mailer.config.send = true
      Mailer.config.preview = false
      console.log('Отправляется уведомление...')
      return await expertNotificationMessage(expert)
  }
}

async function updateExpert (expert) {
  const updatedExpert = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Введите имя эксперта:',
      default: expert.name,
      validate: value => {
        return Boolean(value)
      }
    },
    {
      type: 'input',
      name: 'email',
      message: 'Введите адрес электронной почты:',
      default: expert.email,
      validate: value => {
        if (! usersDb.validEmail(value)) {
          return 'Введите валидный адрес электронной почты'
        }
        return true
      }
    }
  ])
  await usersDb.update({...expert, ...updatedExpert})
}

async function deleteExpert (expert) {
  const answer = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      default: false,
      message: 'Подтвердите удаление эксперта:'
    }
  ])
  if (answer.confirm) {
    await usersDb.destroy(expert._id)
  }
}

async function main () {
  async function buildChoices () {
    const list = await usersDb.all()
    const choices = list.map(expert => {
      return {
        name: expert.name,
        value: expert._id,
        short: expert.name
      }
    })
    if (choices.length < limit) {
      choices.push({
        name: 'Добавить нового эксперта',
        value: 'create',
        short: 'создать'
      })
    }
    choices.push(new inquirer.Separator())
    choices.push({
      name: 'Выход',
      value: 'exit',
      short: 'выход'
    })
    return choices
  }

  while (true) {
    showBanner()
    const result = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Выберите эксперта или действие',
        choices: await buildChoices()
      }
    ])
    if (result.action === 'exit') {
      console.clear()
      process.exit(0)
    } else if (result.action === 'create') {
      await createExpert()
    } else {
      const expert = await usersDb.get(result.action)
      if (expert) {
        await viewExpert(expert)
      }
    }
  }
}

main()

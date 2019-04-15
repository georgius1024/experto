var inquirer = require('inquirer')
const experts = require('./db/experts')
const limit = 10

async function main() {
  let list = experts.all()
  const choices = () => {
    const choices = list.map(expert => {
      return {
        name: expert.name,
        value: expert.id,
        short: expert.name
      }
    })
    if (choices.length < limit) {
      choices.push({
        name: 'Создать нового',
        value: 'create',
        short: 'создать'
      })
    }
    choices.push(new inquirer.Separator())
    if (choices.length < limit) {
      choices.push({
        name: 'Выход',
        value: 'exit',
        short: 'выход'
      })
    }
    return choices
  }

  while (true) {
    const result = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        default: choices[0],
        message: 'Выберите эксперта',
        choices
      }
    ])
    if (result.action === 'exit') {
      break
    } else if (result.action === 'create') {
      await createExpert()
      list = experts.all()
    } else {
      const expert = experts.findById(result.action)
      if (expert) {
        await viewExpert(expert)
        list = experts.all()
      }
    }
  }
}

async function createExpert() {
  const newExpert = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Введите имя эксперта',
      validate: value => {
        return Boolean(value)
      }
    },
    {
      type: 'input',
      name: 'email',
      message: 'Введите адрес электронной почты',
      validate: value => {
        if (!experts.validEmail(value)) {
          return 'Введите валидный адрес электронной почты'
        }
        return true
      }
    }
  ])
  experts.create(newExpert)
}

async function viewExpert(expert) {
  const shift = ' '.repeat(3)
  console.log(shift, '-'.repeat(50))
  console.log(shift, 'Имя: ', expert.name)
  console.log(shift, 'Email: ', expert.email)
  console.log(shift, 'Код: ', expert.id)
  console.log(shift, '-'.repeat(50))
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
    return console.log('Отправка уведомления на', expert.email)
  }
}

async function updateExpert(expert) {
  const updatedExpert = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Введите имя эксперта',
      default: expert.name,
      validate: value => {
        return Boolean(value)
      }
    },
    {
      type: 'input',
      name: 'email',
      message: 'Введите адрес электронной почты',
      default: expert.email,
      validate: value => {
        if (!experts.validEmail(value)) {
          return 'Введите валидный адрес электронной почты'
        }
        return true
      }
    }
  ])
  experts.update({ ...expert, ...updatedExpert })
}

async function deleteExpert(expert) {
  const answer = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      default: false,
      message: 'Подтвердите удаление эксперта'
    }
  ])
  if (answer.confirm) {
    experts.destroy(expert.id)
  }
}

module.exports = main

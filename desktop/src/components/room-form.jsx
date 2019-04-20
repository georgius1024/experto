import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { Prompt } from 'react-router'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'

const roomModel = {
  _id: 'new',
  roomName: '',
  listenerName: '',
  listenerEmail: '',
  date: ''
}

class RoomForm extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      initial: roomModel,
      model: roomModel,
      errors: {},
      errorCount: 0
    }
    this.onChange = this.onChange.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
    this.onCancel = this.onCancel.bind(this)
    this.formIsDirty = this.formIsDirty.bind(this)
  }

  componentDidMount() {
    const newModel = { ...roomModel, ...this.props.model }
    this.setState({
      initial: newModel,
      model: newModel
    })
  }

  componentDidUpdate(prevProps) {
    if (prevProps.model !== this.props.model) {
      const newModel = { ...roomModel, ...this.props.model }
      this.setState({
        initial: newModel,
        model: newModel
      })
    }
  }
  formIsDirty() {
    let dirty = false
    Object.keys(this.state.model).forEach(field => {
      if (this.state.model[field] !== this.state.initial[field]) {
        dirty = true
      }
    })
    return dirty
  }

  onChange(event) {
    const field = event.target.name
    const value = event.target.value
    const model = { ...this.state.model }
    model[field] = value
    this.setState(
      {
        model: model
      },
      () => this.validate(field)
    )
  }

  valid(field) {
    const value = this.state.model[field]
    if (!value) {
      return 'Обязательное значение'
    }
    switch (field) {
    case 'listenerEmail':
      if (
        !/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
          value
        )
      ) {
        return 'Введите правильный e-mail'
      }
      break
    default:
    }
    return true
  }

  validate(field) {
    const valid = this.valid(field)
    const errors = { ...this.state.errors }
    if (valid === true) {
      delete errors[field]
    } else {
      errors[field] = valid
    }
    this.setState({
      errors,
      errorCount: Object.keys(errors).length
    })
  }

  validateAll() {
    const errors = {}
    Object.keys(this.state.model).forEach(field => {
      const valid = this.valid(field)
      if (valid !== true) {
        errors[field] = valid
      }
    })
    const errorCount = Object.keys(errors).length
    this.setState({
      errors,
      errorCount
    })
    return errorCount
  }

  onSubmit(event) {
    event.preventDefault()
    if (this.validateAll() === 0) {
      this.setState({
        initial: { ...this.state.model }
      })
      this.props.onSubmit(this.state.model)
    }
  }

  onCancel() {
    this.props.onCancel()
  }

  render() {
    const model = this.state.model
    const errors = this.state.errors
    const errorCount = this.state.errorCount
    const readOnly = this.props.readOnly
    const plainText = this.props.plainText
    const hasSubmitButton = Boolean(this.props.onSubmit)
    const hasCancelButton = Boolean(this.props.onCancel)
    const formIsDirty = this.formIsDirty()
    return (
      <Form onSubmit={this.onSubmit}>
        <Form.Group>
          <Form.Label>Время встречи</Form.Label>
          <Form.Control
            type="datetime-local"
            name="date"
            plaintext={plainText}
            readOnly={readOnly}
            value={model['date']}
            onChange={this.onChange}
            placeholder="Выберите время встречи"
            required
          />
          <div className="error-text">{errors['date']}</div>
        </Form.Group>
        <Form.Group>
          <Form.Label>Название комнаты</Form.Label>
          <Form.Control
            name="roomName"
            value={model['roomName']}
            plaintext={plainText}
            readOnly={readOnly}
            onChange={this.onChange}
            type="text"
            maxLength="40"
            placeholder="Введите название"
            required
          />
          <div className="error-text">{errors['roomName']}</div>
        </Form.Group>

        <Form.Group>
          <Form.Label>Слушатель</Form.Label>
          <Form.Control
            name="listenerName"
            value={model['listenerName']}
            plaintext={plainText}
            readOnly={readOnly}
            onChange={this.onChange}
            type="text"
            maxLength="40"
            placeholder="Введите ФИО"
            required
          />
          <div className="error-text">{errors['listenerName']}</div>
        </Form.Group>

        <Form.Group>
          <Form.Label>Email слушателя</Form.Label>
          <Form.Control
            name="listenerEmail"
            value={model['listenerEmail']}
            plaintext={plainText}
            readOnly={readOnly}
            onChange={this.onChange}
            type="email"
            placeholder="Введите email"
            required
          />
          <div className="error-text">{errors['listenerEmail']}</div>
        </Form.Group>
        <div className="text-right">
          {hasSubmitButton && (
            <Button variant="primary" disabled={errorCount} type="submit" className="w-10em mr-4">
              Сохранить
            </Button>
          )}
          {hasCancelButton && (
            <Button variant="secondary" onClick={this.onCancel} type="button" className="w-10em">
              Отмена
            </Button>
          )}
        </div>
        <Prompt when={formIsDirty} message="Точно-точно, прямо точно?" />
      </Form>
    )
  }
}

RoomForm.propTypes = {
  model: PropTypes.object,
  readOnly: PropTypes.bool,
  plainText: PropTypes.bool,
  onSubmit: PropTypes.any,
  onCancel: PropTypes.any
}

export { RoomForm, roomModel }

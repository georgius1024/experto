import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import './AppointmentForm.scss'
class Appointment extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      form: {
        roomName: '',
        personName: '',
        personEmail: ''
      },
      errors: {},
      errorCount: 0
    }
    this.onChange = this.onChange.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
  }

  componentDidMount() {
    this.setState(
      {
        form: { ...this.state.form, ...this.props.model }
      },
      () => this.validate()
    )
  }

  componentDidUpdate(prevProps) {
    if (prevProps.model !== this.props.model) {
      this.setState(
        {
          form: { ...this.state.form, ...this.props.model }
        },
        () => this.validate()
      )
    }
  }

  onChange(event) {
    const field = event.target.name
    const value = event.target.value
    const form = { ...this.state.form }
    form[field] = value
    this.setState(
      {
        form
      },
      () => this.validate()
    )
  }

  validate() {
    const errors = {}
    Object.keys(this.state.form).forEach(field => {
      if (field !== 'roomId') {
        const value = this.state.form[field]
        errors[field] = Boolean(value) || 'Обязательное значение'
        if (!errors[field] && field === 'personEmail') {
          errors[field] =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
              value
            ) || 'Неверный E-mail'
        }
        if (typeof errors[field] === 'boolean') {
          delete errors[field]
        }
      }
    })
    this.setState({
      errors,
      errorCount: Object.keys(errors).length
    })
  }

  onSubmit(event) {
    event.preventDefault()
    if (this.state.errorCount === 0) {
      this.props.onSubmit(this.state.form)
    }
  }

  render() {
    const form = this.state.form
    const errors = this.state.errors
    const errorCount = this.state.errorCount
    const readOnly = this.props.readOnly
    return (
      <Form onSubmit={this.onSubmit}>
        <Form.Group>
          <Form.Label>Название встречи</Form.Label>
          <Form.Control
            plaintext={readOnly}
            readOnly={readOnly}
            name="roomName"
            value={form['roomName']}
            onChange={this.onChange}
            type="text"
            maxLength="40"
            placeholder="Введите название"
          />
          <div className="error-text">{errors['roomName']}</div>
        </Form.Group>

        <Form.Group>
          <Form.Label>Участник</Form.Label>
          <Form.Control
            plaintext={readOnly}
            readOnly={readOnly}
            name="personName"
            value={form['personName']}
            onChange={this.onChange}
            type="text"
            maxLength="40"
            placeholder="Введите ФИО"
          />
          <div className="error-text">{errors['personName']}</div>
        </Form.Group>

        <Form.Group>
          <Form.Label>Email</Form.Label>
          <Form.Control
            plaintext={readOnly}
            readOnly={readOnly}
            name="personEmail"
            value={form['personEmail']}
            onChange={this.onChange}
            type="email"
            placeholder="Введите email"
          />
          <div className="error-text">{errors['personEmail']}</div>
        </Form.Group>

        {readOnly ? null : (
          <Button variant="primary" disabled={errorCount} type="submit">
            Сохранить
          </Button>
        )}
        {this.props.onCancel ? (
          <Button variant="secondary" onClick={this.props.onCancel} type="button" className="float-right">
            Отмена
          </Button>
        ) : null}
      </Form>
    )
  }
}

Appointment.propTypes = {
  readOnly: PropTypes.bool,
  model: PropTypes.object,
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func
}

export default Appointment

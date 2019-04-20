import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'

import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'

import actions from '../store/actions'
import Api from '../api'

const storageKey = 'registration-code'

class Register extends PureComponent {
  constructor(props) {
    super(props)
    this.doRegister = this.doRegister.bind(this)
    this.updateRegistrationCode = this.updateRegistrationCode.bind(this)
    this.state = {
      registrationCode: localStorage.getItem(storageKey) || ''
    }
  }
  componentDidUpdate() {
    this.redirectIfRegistered()
  }
  redirectIfRegistered() {
    if (this.props.registered) {
      this.props.history.push('/')
    }
  }
  updateRegistrationCode({ target: { value } }) {
    this.setState({
      registrationCode: value
    })
  }
  doRegister() {
    localStorage.setItem(storageKey, this.state.registrationCode)
    const code = String(this.state.registrationCode)
      .split('\n')
      .map(e => e.trim())
      .filter(e => Boolean(e))
      .join('')
    Api.post('auth/login', { code }).subscribe(({ data: body }) => {
      this.props.register({
        name: body.data.name,
        accessToken: body.auth.accessToken,
        refreshToken: body.auth.refreshToken
      })
    })
  }
  render() {
    return (
      <div className="v-layout">
        <div className="col-lg-6 col-md-8">
          <Card>
            <Card.Header>Регистрация эксперта</Card.Header>
            <Card.Body>
              <Form className="card-text">
                <Form.Group>
                  <Form.Label>Регистрационный код</Form.Label>
                  <Form.Control
                    placeholder="Введите код"
                    value={this.state.registrationCode}
                    onChange={this.updateRegistrationCode}
                  />
                </Form.Group>
              </Form>
              <p className="text-muted">Откройте присланное Вам письмо и найдите в нем свой регистрационный код.</p>
              <footer className="text-center">
                <Button variant="primary" className="w-10em" onClick={this.doRegister}>
                  Дальше
                </Button>
              </footer>
            </Card.Body>
          </Card>
        </div>
      </div>
    )
  }
}

Register.propTypes = {
  registration: PropTypes.object,
  registered: PropTypes.bool,
  register: PropTypes.func,
  history: PropTypes.object
}

const mapStateToProps = state => {
  return {
    registration: state.registration,
    registered: Boolean(state.registration.accessToken)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    register: payload => dispatch(actions.register(payload))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(Register))

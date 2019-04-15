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
        <Card>
          <Card.Header>Register your app</Card.Header>
          <Card.Body>
            <Form className="card-text">
              <Form.Group>
                <Form.Label>Enter your registration code</Form.Label>
                <Form.Control
                  as="textarea"
                  rows="4"
                  placeholder="Enter registration code"
                  value={this.state.registrationCode}
                  onChange={this.updateRegistrationCode}
                />
              </Form.Group>
            </Form>
            <footer>
              <Button variant="primary" onClick={this.doRegister}>
              Register
              </Button>
            </footer>
          </Card.Body>
        </Card>
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

import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'

import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'

class Register extends PureComponent {
  constructor(props) {
    super(props)
    this.doRegister = this.doRegister.bind(this)
    this.updateRegistrationCode = this.updateRegistrationCode.bind(this)
    this.state = {
      registrationCode: ''
    }
  }
  updateRegistrationCode({ target: { value } }) {
    this.setState({
      registrationCode: value
    })
  }
  doRegister() {
    this.props.history.push('/room/' + this.state.registrationCode)
  }
  render() {
    return (
      <div className="v-layout">
        <Card>
          <Card.Header>Enter code</Card.Header>
          <Card.Body>
            <Form className="card-text">
              <Form.Group>
                <Form.Label>Enter your code</Form.Label>
                <Form.Control
                  placeholder="Enter code"
                  value={this.state.registrationCode}
                  onChange={this.updateRegistrationCode}
                />
              </Form.Group>
            </Form>
            <footer>
              <Button variant="primary" onClick={this.doRegister}>
                Enter
              </Button>
            </footer>
          </Card.Body>
        </Card>
      </div>
    )
  }
}

Register.propTypes = {
  history: PropTypes.object
}

export default withRouter(Register)

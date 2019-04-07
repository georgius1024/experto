import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Redirect, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import actions from '../store/actions'
import AppointmentForm from '../Components/AppointmentForm'
/* eslint-disable no-script-url*/
class UpdateAppointment extends Component {
  render() {
    const onSubmit = formData => {
      this.props.appointmentUpdate(formData)
      this.props.controlSocket.sendMessage('update-appointment', formData)
    }
    const onCancel = () => {
      this.props.history.push('/')
    }

    if (!this.props.appointment.roomId) {
      return <Redirect to="/create" />
    } else {
      return (
        <div className="card mt-5">
          <div className="card-body">
            <h5 className="card-title">Редактирование встречи</h5>
            <div className="card-text">
              <AppointmentForm
                readOnly={false}
                model={this.props.appointment}
                onSubmit={onSubmit}
                onCancel={onCancel}
              />
            </div>
          </div>
        </div>
      )
    }
  }
}

UpdateAppointment.propTypes = {
  controlSocket: PropTypes.object,
  appointment: PropTypes.object,
  appointmentUpdate: PropTypes.func,
  history: PropTypes.object
}

const mapStateToProps = state => {
  return {
    appointment: state.appointment,
    controlSocket: state.controlSocket
  }
}

const mapDispatchToProps = dispatch => {
  return {
    appointmentUpdate: payload => dispatch(actions.appointmentUpdate(payload))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(UpdateAppointment))

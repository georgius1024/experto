import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import ListGroup from 'react-bootstrap/ListGroup'

class AppointmentsList extends PureComponent {
  constructor(props) {
    super(props)
    this.subscription = null
    this.state = {
      rooms: []
    }
  }

  componentDidMount() {
    this.listen()
  }

  componentDidUpdate() {
    this.listen()
  }
  componentWillUnmount() {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }

  listen() {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
    if (this.props.controlSocket) {
      this.subscription = this.props.controlSocket.message$.subscribe(message => {
        switch (message.id) {
        case 'list':
          this.setState({
            rooms: message.data
          })
          break
        default:
        }
      })
    }
  }
  selectRoom(id) {
    this.props.controlSocket.sendMessage('report', { roomId: id })
  }
  render() {
    return (
      <ListGroup as="ul">
        {this.state.rooms.map(({ name, id }) => {
          const selectRoom = () => this.selectRoom(id)
          const selected = id === this.props.appointment.roomId
          return (
            <ListGroup.Item as="li" active={selected} key={id} onClick={selectRoom}>
              {id} {name}
            </ListGroup.Item>
          )
        })}
      </ListGroup>
    )
  }
}

AppointmentsList.propTypes = {
  controlSocket: PropTypes.object,
  appointment: PropTypes.object
}

const mapStateToProps = state => {
  return {
    appointment: state.appointment,
    controlSocket: state.controlSocket
  }
}

export default connect(mapStateToProps)(AppointmentsList)

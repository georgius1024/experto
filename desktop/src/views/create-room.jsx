import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import Card from 'react-bootstrap/Card'
import { RoomForm, roomModel } from '../components/room-form'
import Api from '../api'

class CreateRoom extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      model: { ...roomModel }
    }
    this.onSubmit = this.onSubmit.bind(this)
    this.onCancel = this.onCancel.bind(this)
  }

  onSubmit(model) {
    Api.post('api/rooms', model).subscribe(response => {
      this.onCancel()
    })
  }

  onCancel() {
    this.props.history.push('/')
  }

  render() {
    const first = this.props.match.path.includes('first')
    return (
      <div className="v-layout">
        <Card>
          <Card.Header>Создание новой комнаты</Card.Header>
          <Card.Body>
            <RoomForm onCancel={!first && this.onCancel} onSubmit={this.onSubmit} model={this.state.model} />
          </Card.Body>
        </Card>
      </div>
    )
  }
}

CreateRoom.propTypes = {
  history: PropTypes.object,
  match: PropTypes.object
}

export default withRouter(CreateRoom)

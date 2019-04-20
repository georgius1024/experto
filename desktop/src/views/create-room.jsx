import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import Card from 'react-bootstrap/Card'
import { RoomForm, roomModel } from '../components/room-form'
import DefaultLayout from '../layouts/default'
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
      <DefaultLayout>
        <div className="col-lg-6 offset-lg-3 col-md-8 offset-md-2">
          <Card>
            <Card.Header className="bg-primary text-white">Создание новой встречи</Card.Header>
            <Card.Body>
              <RoomForm onCancel={!first && this.onCancel} onSubmit={this.onSubmit} model={this.state.model} />
            </Card.Body>
          </Card>
        </div>
      </DefaultLayout>
    )
  }
}

CreateRoom.propTypes = {
  history: PropTypes.object,
  match: PropTypes.object
}

export default withRouter(CreateRoom)

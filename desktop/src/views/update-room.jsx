import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import Card from 'react-bootstrap/Card'
import { RoomForm, roomModel } from '../components/room-form'
import DefaultLayout from '../layouts/default'
import Api from '../api'

class UpdateRoom extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      model: { ...roomModel }
    }
    this.onSubmit = this.onSubmit.bind(this)
    this.onCancel = this.onCancel.bind(this)
  }
  componentDidMount() {
    this.fetch()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.id !== this.roomId()) {
      this.fetch()
    }
  }

  roomId() {
    return this.props.match.params.id
  }

  fetch() {
    Api.get('api/rooms/' + this.roomId()).subscribe(({ data: body }) => {
      this.setState({
        model: body.data
      })
    })
  }

  onSubmit(model) {
    Api.put('api/rooms/' + this.roomId(), model).subscribe(response => {
      this.onCancel()
    })
  }

  onCancel() {
    this.props.history.push('/')
  }

  render() {
    return (
      <DefaultLayout>
        <div className="col-lg-6 offset-lg-3 col-md-8 offset-md-2">
          <Card>
            <Card.Header className="bg-primary text-white">Редактирование встречи</Card.Header>
            <Card.Body>
              <RoomForm onCancel={this.onCancel} onSubmit={this.onSubmit} model={this.state.model} />
            </Card.Body>
          </Card>
        </div>
      </DefaultLayout>
    )
  }
}

UpdateRoom.propTypes = {
  history: PropTypes.object,
  match: PropTypes.object
}

export default withRouter(UpdateRoom)

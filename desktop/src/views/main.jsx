import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import actions from '../store/actions'
import Api from '../api'
import { RoomForm } from '../components/room-form'
import RoomList from '../components/room-list'
import ConfirmDialog from '../components/confirm-dialog'
import config from '../config'
const key = 'last-selected-room'

class Main extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      rooms: [],
      selectedRoom: localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)) : null,
      confirmDelete: false
    }
    this.doUnregister = this.doUnregister.bind(this)
    this.onSelect = this.onSelect.bind(this)
    this.onCreate = this.onCreate.bind(this)
    this.onUpdate = this.onUpdate.bind(this)
    this.onDelete = this.onDelete.bind(this)
    this.onConfirmDelete = this.onConfirmDelete.bind(this)
    this.onCancelDelete = this.onCancelDelete.bind(this)
    this.onStart = this.onStart.bind(this)
  }
  componentDidMount() {
    this.fetch()
  }
  componentDidUpdate() {
    // this.fetch()
  }
  fetch() {
    Api.get('api/rooms').subscribe(({ data: body }) => {
      const rooms = body.data
      this.setState({
        rooms
      })
      if (!rooms.length) {
        return this.props.history.push('/create-first')
      }
      const selectedId = this.state.selectedRoom && this.state.selectedRoom._id
      if (rooms.length) {
        this.setState({
          selectedRoom: rooms.find(r => r._id === selectedId) || rooms[0]
        })
      }
    })
  }
  doUnregister() {
    Api.get('private/logout').subscribe(() => this.props.unregister())
  }
  onSelect(room) {
    localStorage.setItem(key, JSON.stringify(room))
    this.setState({
      selectedRoom: room
    })
  }
  onCreate() {
    this.props.history.push('/create')
  }
  onUpdate() {
    this.props.history.push('/update/' + this.state.selectedRoom._id)
  }
  onDelete() {
    this.setState({
      confirmDelete: true
    })
  }
  onConfirmDelete() {
    Api.delete('api/rooms/' + this.state.selectedRoom._id).subscribe(response => {
      this.setState(
        {
          selectedRoom: null,
          confirmDelete: false
        },
        () => this.fetch()
      )
    })
  }
  onCancelDelete() {
    this.setState({
      confirmDelete: false
    })
  }
  onStart() {
    this.props.history.push('/start/' + this.state.selectedRoom.presenterCode)
  }
  selectedRoom() {
    if (!this.state.selectedRoom) {
      return null
    }
    return (
      <Card className="mb-5">
        <Card.Body>
          <RoomForm model={this.state.selectedRoom} readOnly={true} />
          <p>
            <a
              href={config.public + '/room/' + this.state.selectedRoom.listenerCode}
              target="_blank"
              rel="noopener noreferrer"
            >
              Ссылка для слушателя
            </a>
          </p>
          <p>
            <a
              href={config.public + '/room/' + this.state.selectedRoom.guestCode}
              target="_blank"
              rel="noopener noreferrer"
            >
              Ссылка для гостя
            </a>
          </p>
          <hr className="my-3" />
          <Button variant="primary" onClick={this.onStart}>
            Начать встречу
          </Button>
          <Button variant="secondary" onClick={this.onCreate} className="ml-3">
            Создать
          </Button>
          <Button variant="secondary" onClick={this.onUpdate} className="ml-3">
            Редактировать
          </Button>
          <Button variant="danger" onClick={this.onDelete} className="float-right">
            Удалить
          </Button>
        </Card.Body>
      </Card>
    )
  }
  render() {
    return (
      <>
        <nav className="navbar navbar-light bg-light mb-5">
          <a href="#/" className="navbar-brand mb-0 h1">
            <span className="ml-2">APP-X</span>
          </a>
          <span>
            {this.props.registered && (
              <>
                {this.props.registration.name}
                <button className="btn btn-link ml-2" onClick={this.doUnregister}>
                  <i className="fas fa-sign-out-alt mr-1" />
                  Выйти
                </button>
              </>
            )}
            {!this.props.registered && <span>Not logged</span>}
          </span>
        </nav>
        {this.selectedRoom()}
        {this.state.rooms.length && (
          <RoomList rooms={this.state.rooms} selected={this.state.selectedRoom} onSelect={this.onSelect} />
        )}
        <ConfirmDialog
          active={this.state.confirmDelete}
          caption={'Подтверждение'}
          body={'Подтвердите удаление комнаты'}
          onConfirm={this.onConfirmDelete}
          onCancel={this.onCancelDelete}
        />
      </>
    )
  }
}

Main.propTypes = {
  registration: PropTypes.object,
  registered: PropTypes.bool,
  unregister: PropTypes.func,
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
    unregister: payload => dispatch(actions.unregister(payload))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(Main))

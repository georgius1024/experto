import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import 'moment/locale/ru'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import Pagination from 'react-bootstrap/Pagination'
import Button from 'react-bootstrap/Button'
import CopyInput from '../components/copy-input'
import actions from '../store/actions'
import Api from '../api'
import ConfirmDialog from '../components/confirm-dialog'
import { message } from '../notification'
import config from '../config'
const key = 'last-selected-room'
moment.locale('ru')

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
    this.onMoveNext = this.onMoveNext.bind(this)
    this.onMovePrev = this.onMovePrev.bind(this)
  }
  componentDidMount() {
    this.fetch()
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
  canMoveNext() {
    const selectedId = this.state.selectedRoom && this.state.selectedRoom._id
    const rooms = this.state.rooms
    const current = rooms.findIndex(e => e._id === selectedId)
    return current < rooms.length - 1
  }
  onMoveNext() {
    const selectedId = this.state.selectedRoom && this.state.selectedRoom._id
    const rooms = this.state.rooms
    const current = rooms.findIndex(e => e._id === selectedId)
    if (current < rooms.length - 1) {
      this.setState({
        selectedRoom: rooms[current + 1]
      })
    }
  }
  canMovePrev() {
    const selectedId = this.state.selectedRoom && this.state.selectedRoom._id
    const rooms = this.state.rooms
    const current = rooms.findIndex(e => e._id === selectedId)
    return current > 0
  }
  onMovePrev() {
    const selectedId = this.state.selectedRoom && this.state.selectedRoom._id
    const rooms = this.state.rooms
    const current = rooms.findIndex(e => e._id === selectedId)
    if (current > 0) {
      this.setState({
        selectedRoom: rooms[current - 1]
      })
    }
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
    const room = this.state.selectedRoom

    return (
      <div className="p-5">
        <h1>{room.roomName}</h1>
        <dl className="row mt-3">
          <dt className="col-sm-3 pb-2">Время</dt>
          <dd className="col-sm-9">
            {moment(room.date).format('MM.DD.YY HH:mm')}
            <span className="text-muted ml-2">({moment(room.date).fromNow()})</span>
          </dd>
          <dt className="col-sm-3 pt-2">Слушатель</dt>
          <dd className="col-sm-9">
            <CopyInput value={room.listenerName} />
          </dd>
          <dt className="col-sm-3 pt-2">Ссылка для слушателя</dt>
          <dd className="col-sm-9">
            <CopyInput value={config.public + '/room/' + this.state.selectedRoom.listenerCode} />
          </dd>
          <dt className="col-sm-3 pt-2">Ссылка для гостя</dt>
          <dd className="col-sm-9">
            <CopyInput value={config.public + '/room/' + this.state.selectedRoom.guestCode} />
          </dd>
        </dl>
        <hr className="my-3" />
        <div className="d-flex">
          <Pagination className="m-0">
            <Pagination.Prev onClick={this.onMovePrev} disabled={!this.canMovePrev()} />
            <Pagination.Next onClick={this.onMoveNext} disabled={!this.canMoveNext()} />
          </Pagination>
          <Button variant="primary" className="ml-2 w-10em" onClick={this.onStart}>
            <i className="fa fa-video" /> Начать
          </Button>
          <Button variant="primary" className="ml-3">
            <i className="fa fa-envelope ml-2" /> Пригласить
          </Button>

          <Button variant="secondary" onClick={this.onCreate} className="ml-3 w-10em">
            Создать
          </Button>
          <Button variant="secondary" onClick={this.onUpdate} className="ml-3 w-10em">
            Редактировать
          </Button>

          <Button variant="danger" onClick={this.onDelete} className="ml-3 w-10em">
            Удалить
          </Button>
        </div>
      </div>
    )
  }
  render() {
    return (
      <>
        {this.selectedRoom()}
        <ConfirmDialog
          active={this.state.confirmDelete}
          caption={'Подтверждение'}
          body={'Подтвердите удаление встречи'}
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

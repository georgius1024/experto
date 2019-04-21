import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import 'moment/locale/ru'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import Button from 'react-bootstrap/Button'
import NavigationBar from '../components/main-nav-bar'
import CopyInput from '../components/copy-input'
import actions from '../store/actions'
import Api from '../api'
import ConfirmDialog from '../components/confirm-dialog'
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
    this.onSelect = this.onSelect.bind(this)
    this.onCreate = this.onCreate.bind(this)
    this.onUpdate = this.onUpdate.bind(this)
    this.onDelete = this.onDelete.bind(this)
    this.onNotifyListener = this.onNotifyListeber.bind(this)
    this.onConfirmDelete = this.onConfirmDelete.bind(this)
    this.onCancelDelete = this.onCancelDelete.bind(this)
    this.onStart = this.onStart.bind(this)
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
  onNotifyListeber() {
    Api.post('api/rooms/notification/' + this.state.selectedRoom._id).subscribe(() => this.fetch())
  }
  onStart() {
    const code = this.state.selectedRoom.presenterCode
    this.props.history.push('/start/' + code)
    /*
    const electron = window.require('electron')
    electron.remote.process.createPopupWindow(code)
    */
    /*
    this.props.history.push('/start/' + this.state.selectedRoom.presenterCode)
    */
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
          {this.state.selectedRoom.notificationSent && (
            <>
              <dt className="col-sm-3  pb-2 mt-2">Приглашение</dt>
              <dd className="col-sm-9">
                Отправлено {moment(room.notificationSent).format('MM.DD.YY HH:mm')}
                <span className="text-muted ml-2">({moment(room.notificationSent).fromNow()})</span>
                <Button variant="link" onClick={this.onNotifyListener} size="sm" className="ml-3 mb-1">
                  <i className="fa fa-envelope ml-2" /> Отправить повторно
                </Button>
              </dd>
            </>
          )}
          {!this.state.selectedRoom.notificationSent && (
            <>
              <dt className="col-sm-3 pb-2 mt-2">Приглашение</dt>
              <dd className="col-sm-9">
                Не было отправлено
                <Button variant="link" onClick={this.onNotifyListener} size="sm" className="ml-3 mb-1">
                  <i className="fa fa-envelope ml-2" /> Отправить сейчас
                </Button>
              </dd>
            </>
          )}
        </dl>
        <Button variant="primary" onClick={this.onStart}>
          <i className="fa fa-video mr-2" /> Начать встречу
        </Button>

        <hr className="my-3" />
        <NavigationBar
          rooms={this.state.rooms}
          selectedRoom={this.state.selectedRoom}
          onSelect={this.onSelect}
          onCreate={this.onCreate}
          onUpdate={this.onUpdate}
          onDelete={this.onDelete}
        />
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
  history: PropTypes.object,
  location: PropTypes.object
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

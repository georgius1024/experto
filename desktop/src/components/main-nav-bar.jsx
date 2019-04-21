import React, { memo } from 'react'
import PropTypes from 'prop-types'
import ButtonToolbar from 'react-bootstrap/ButtonToolbar'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Button from 'react-bootstrap/Button'
import Dropdown from 'react-bootstrap/Dropdown'
import styles from './main-nav-bar.module.scss'
function NavigationBar({ rooms, selectedRoom, onSelect, onCreate, onUpdate, onDelete }) {
  if (!rooms.length) {
    return null
  }
  const selectedId = () => selectedRoom && selectedRoom._id

  const currentRoomIndex = () => {
    return rooms.findIndex(e => e._id === selectedId())
  }

  const canMoveNext = () => {
    return currentRoomIndex() < rooms.length - 1
  }

  const onMoveNext = () => {
    if (canMoveNext()) {
      onSelect(rooms[currentRoomIndex() + 1])
    }
  }

  const canMovePrev = () => {
    return currentRoomIndex() > 0
  }

  const onMovePrev = () => {
    if (canMovePrev()) {
      onSelect(rooms[currentRoomIndex() - 1])
    }
  }
  return (
    <ButtonToolbar>
      <Dropdown as={ButtonGroup} className="mr-2">
        <Button onClick={onMovePrev} disabled={!canMovePrev()}>
          <i className="fa fa-caret-left" />
        </Button>
        <Button>{`${currentRoomIndex() + 1} / ${rooms.length}`}</Button>
        <Dropdown.Toggle split className={styles.split} />
        <Dropdown.Menu>
          {rooms.map(room => {
            const select = e => {
              e.preventDefault()
              onSelect(room)
            }
            return (
              <Dropdown.Item href="#" onClick={select} key={room._id}>
                {room.roomName}
              </Dropdown.Item>
            )
          })}
        </Dropdown.Menu>
        <Button onClick={onMoveNext} disabled={!canMoveNext()}>
          <i className="fa fa-caret-right" />
        </Button>
      </Dropdown>
      <ButtonGroup className="mr-2">
        <Button variant="primary" className="w-10em" onClick={onCreate}>
          Создать
        </Button>
        <Button variant="primary" className="w-10em" onClick={onUpdate}>
          Редактировать
        </Button>
        <Button variant="danger" className="w-10em" onClick={onDelete}>
          Удалить
        </Button>
      </ButtonGroup>
    </ButtonToolbar>
  )
}

NavigationBar.propTypes = {
  rooms: PropTypes.array,
  selectedRoom: PropTypes.object,
  onSelect: PropTypes.func,
  onCreate: PropTypes.func,
  onUpdate: PropTypes.func,
  onDelete: PropTypes.func
}

export default memo(NavigationBar)

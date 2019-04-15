import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import ListGroup from 'react-bootstrap/ListGroup'

class RoomList extends PureComponent {
  constructor(props) {
    super(props)
    this.onSelect = this.onSelect.bind(this)
  }
  onSelect(room) {
    this.props.onSelect(room)
  }
  render() {
    const selectedId = this.props.selected && this.props.selected._id
    return (
      <ListGroup as="ul">
        {this.props.rooms.map(room => {
          const selectRoom = () => this.onSelect(room)
          const selected = room._id === selectedId
          return (
            <ListGroup.Item className="no-user-select handle-cursor" as="li" active={selected} key={room._id} onClick={selectRoom}>
              {room.roomName}, {room.listenerName}
            </ListGroup.Item>
          )
        })}
      </ListGroup>
    )
  }
}

RoomList.propTypes = {
  rooms: PropTypes.array,
  selected: PropTypes.object,
  onSelect: PropTypes.func,
}

export default RoomList

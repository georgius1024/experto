import React, { memo } from 'react'
import PropTypes from 'prop-types'
import ListGroup from 'react-bootstrap/ListGroup'
import moment from 'moment-timezone'

function ChatList({ messages, reverse }) {
  const history = messages.map(({ message, from, at }, index) => {
    const time = moment(at).format('HH:mm:ss')
    const key = moment(at).valueOf() + '.' + index
    return (
      <ListGroup.Item key={key}>
        <div>
          <b>
            {time} - {from}
          </b>
        </div>
        <div>{message}</div>
      </ListGroup.Item>
    )
  })
  if (reverse) {
    history.reverse()
  }
  return (
    <>
      <ListGroup>{history}</ListGroup>
    </>
  )
}
ChatList.propTypes = {
  messages: PropTypes.array,
  reverse: PropTypes.bool
}

export default memo(ChatList)

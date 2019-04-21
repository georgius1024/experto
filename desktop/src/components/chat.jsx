import React, { memo, useState } from 'react'
import ListGroup from 'react-bootstrap/ListGroup'
import Form from 'react-bootstrap/Form'
import moment from 'moment-timezone'

function Chat({ messages, onPostMessage }) {
  const [message, setMessage] = useState('')
  function onSubmit(event) {
    event.preventDefault()
    onPostMessage(message)
    setMessage('')
  }
  function onChange(event) {
    setMessage(event.target.value)
  }

  const history = messages.map(({ message, from, at }) => {
    const time = moment(at).format('HH:mm:ss')
    return (
      <ListGroup.Item key={time}>
        <p>
          <b>
            {time} - {from}
          </b>
        </p>
        <p>{message}</p>
      </ListGroup.Item>
    )
  })
  const form = (
    <Form onSubmit={onSubmit}>
      <Form.Group>
        <Form.Control type="text" placeholder="Введите сообщение" value={message} onChange={onChange} />
      </Form.Group>
    </Form>
  )
  return (
    <>
      <ListGroup>{history}</ListGroup>
      {form}
    </>
  )
}

export default memo(Chat)

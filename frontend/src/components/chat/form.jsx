import React, { memo, useState } from 'react'
import PropTypes from 'prop-types'
import Form from 'react-bootstrap/Form'

function ChatForm({ onPostMessage }) {
  const [message, setMessage] = useState('')
  function onSubmit(event) {
    event.preventDefault()
    onPostMessage(message)
    setMessage('')
  }

  function onChange(event) {
    setMessage(event.target.value)
  }

  return (
    <Form onSubmit={onSubmit}>
      <Form.Group>
        <Form.Control type="text" placeholder="Чат" value={message} onChange={onChange} />
      </Form.Group>
    </Form>
  )
}
ChatForm.propTypes = {
  onPostMessage: PropTypes.func
}
export default memo(ChatForm)

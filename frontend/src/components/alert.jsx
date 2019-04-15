/*
 Show alert message when Api throws error
*/

import React, { memo, useState, useEffect } from 'react'
import Api from '../api'
import Alert from 'react-bootstrap/Alert'

function AlertComponent() {
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  function dismiss() {
    setMessage('')
    setError('')
  }

  useEffect(() => {
    const errorSubscription = Api.error$.subscribe(error => {
      setError(error.toString())
      setTimeout(dismiss, 3000)
    })
    const messageSubscription = Api.message$.subscribe(message => {
      setMessage(message.toString())
      setTimeout(dismiss, 3000)
    })
    return function cleanup() {
      errorSubscription.unsubscribe()
      messageSubscription.unsubscribe()
    }
  }, [])
  if (error) {
    return (
      <Alert dismissible variant="danger" onClose={dismiss}>
        {error}
      </Alert>
    )
  } else if (message) {
    return (
      <Alert dismissible variant="info" onClose={dismiss}>
        {message}
      </Alert>
    )
  } else {
    return null
  }
}

export function alert(message) {
  Api.message$.next(message)
}
export function error(message) {
  Api.error$.next(message)
}

export default memo(AlertComponent)

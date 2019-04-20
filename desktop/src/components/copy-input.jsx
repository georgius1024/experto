import React, { memo } from 'react'
import copyToClipboard from '../utils/copy-to-clipboard'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'

export default memo(function({ value }) {
  const style = { width: 'calc(100% - 60px)' }
  return (
    <>
      <Button variant="link" onClick={copyToClipboard(value)} className="float-right">
        <i className="fa fa-copy" />
      </Button>
      <Form.Control readOnly={true} value={value} plaintext={true} style={style} />
    </>
  )
})

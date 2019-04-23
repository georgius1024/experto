import React, { memo } from 'react'
import PropTypes from 'prop-types'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
function ConfirmDialog({ active, caption, body, onConfirm, onCancel, confirmButton, cancelButton }) {
  const hasConfirmButton = Boolean(onConfirm)
  const hasCancelButton = Boolean(onCancel)
  return (
    <Modal show={active} backdrop="static" centered>
      {caption && (
        <Modal.Header>
          <Modal.Title>{caption}</Modal.Title>
        </Modal.Header>
      )}
      <Modal.Body>{body}</Modal.Body>
      <Modal.Footer>
        {hasConfirmButton && (
          <Button variant="primary" onClick={onConfirm} className="w-10em">
            {confirmButton || 'Подтвердить'}
          </Button>
        )}
        {hasCancelButton && (
          <Button variant="secondary" onClick={onCancel} className="w-10em">
            {cancelButton || 'Отмена'}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  )
}

ConfirmDialog.propTypes = {
  active: PropTypes.bool,
  caption: PropTypes.string,
  body: PropTypes.string, 
  onConfirm: PropTypes.func, 
  onCancel: PropTypes.func, 
  confirmButton: PropTypes.string,
  cancelButton: PropTypes.string,
}

export default memo(ConfirmDialog)

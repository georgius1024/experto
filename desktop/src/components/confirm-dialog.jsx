import React, { memo } from 'react'
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
          <Button variant="primary" onClick={onConfirm}>
            {confirmButton || 'Подтвердить'}
          </Button>
        )}
        {hasCancelButton && (
          <Button variant="secondary" onClick={onCancel}>
            {cancelButton || 'Отмена'}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  )
}

export default memo(ConfirmDialog)

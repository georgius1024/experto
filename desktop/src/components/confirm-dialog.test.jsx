import React from 'react'
import renderer from 'react-test-renderer'
import ConfirmDialog from './confirm-dialog'
describe('ConfirmDialog component', () => {
  test('it matches the snapshot', () => {
    const component = renderer.create(
      <ConfirmDialog
        active={false}
        caption="caption"
        body="body"
        onConfirm={() => {}}
        onCancel={() => {}}
        confirmButton="OK"
        cancelButton="Cancel"
      />
    )
    expect(component.toJSON()).toMatchSnapshot()
  })
})

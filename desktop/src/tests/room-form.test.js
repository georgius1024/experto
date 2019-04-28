import React from 'react'
import renderer from 'react-test-renderer'
import { RoomForm as Component } from '../components/room-form'
import { MemoryRouter } from 'react-router-dom'
describe('Room-form component', () => {
  test('it matches the snapshot', () => {
    const component = renderer.create(
      <MemoryRouter>
        <Component />
      </MemoryRouter>
    )
    expect(component.toJSON()).toMatchSnapshot()
  })
})

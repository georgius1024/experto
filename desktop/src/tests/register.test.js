import React from 'react'
import renderer from 'react-test-renderer'
import { MemoryRouter } from 'react-router-dom'
import View from '../views/register'
describe('Register view', () => {
  test('it matches the snapshot', () => {
    const view = renderer.create(
      <MemoryRouter>
        <View />
      </MemoryRouter>
    )
    expect(view.toJSON()).toMatchSnapshot()
  })
})

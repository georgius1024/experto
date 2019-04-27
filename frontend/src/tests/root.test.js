import React from 'react'
import renderer from 'react-test-renderer'
import View from '../views/root'
describe('Root view', () => {
  test('it matches the snapshot', () => {
    const view = renderer.create(<View />)
    expect(view.toJSON()).toMatchSnapshot()
  })
})

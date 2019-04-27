import React from 'react'
import renderer from 'react-test-renderer'
import View from './root'
describe('Root view', () => {
  test('it matches the snapshot', () => {
    const view = renderer.create(<View />)
    expect(view.toJSON()).toMatchSnapshot()
  })
})

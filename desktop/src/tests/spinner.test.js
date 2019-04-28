import React from 'react'
import renderer from 'react-test-renderer'
import Component from '../components/spinner'
describe('Spinner component', () => {
  test('it matches the snapshot', () => {
    const component = renderer.create(<Component />)
    expect(component.toJSON()).toMatchSnapshot()
  })
})

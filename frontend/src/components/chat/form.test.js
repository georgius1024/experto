import React from 'react'
import renderer from 'react-test-renderer'
import ChatForm from './form'
describe('ChatForm component', () => {
  test('it matches the snapshot', () => {
    const component = renderer.create(<ChatForm />)
    expect(component.toJSON()).toMatchSnapshot()
  })
})

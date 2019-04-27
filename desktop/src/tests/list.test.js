import React from 'react'
import renderer from 'react-test-renderer'
import ChatList from '../components/chat/list'
describe('ChatList component', () => {
  test('it matches the snapshot', () => {
    const messages = [
      {
        from: 'me',
        at: '1995-12-17T03:24:00',
        message: 'hello'
      }
    ]
    const component = renderer.create(<ChatList messages={messages} />)
    expect(component.toJSON()).toMatchSnapshot()
  })
})

import React from 'react'
import renderer from 'react-test-renderer'
import Component from '../components/main-nav-bar'
import { Provider } from 'react-redux'
import store from '../store'
import { MemoryRouter } from 'react-router-dom'
describe('Main-nav-bar component', () => {
  test('it matches the snapshot', () => {
    const component = renderer.create(
      <Provider store={store}>
        <MemoryRouter>
          <Component rooms={[]} selectedRoom={null} />
        </MemoryRouter>
      </Provider>
    )
    expect(component.toJSON()).toMatchSnapshot()
  })
})

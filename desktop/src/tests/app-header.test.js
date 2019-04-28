import React from 'react'
import renderer from 'react-test-renderer'
import Component from '../components/app-header'
import { Provider } from 'react-redux'
import store from '../store'
import { MemoryRouter } from 'react-router-dom'
describe('App header component', () => {
  test('it matches the snapshot', () => {
    const component = renderer.create(
      <Provider store={store}>
        <MemoryRouter>
          <Component />
        </MemoryRouter>
      </Provider>
    )
    expect(component.toJSON()).toMatchSnapshot()
  })
})

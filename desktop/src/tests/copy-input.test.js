import React from 'react'
import renderer from 'react-test-renderer'
import Component from '../components/copy-input'
import { Provider } from 'react-redux'
import store from '../store'
import { MemoryRouter } from 'react-router-dom'
describe('Copy-input component', () => {
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

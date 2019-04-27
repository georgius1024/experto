import React from 'react'
import renderer from 'react-test-renderer'
import { Provider } from 'react-redux'
import store from '../store'
import { MemoryRouter } from 'react-router-dom'
import View from '../views/main'
describe('Main view', () => {
  test('it matches the snapshot', () => {
    const view = renderer.create(
      <Provider store={store}>
        <MemoryRouter>
          <View />
        </MemoryRouter>
      </Provider>
    )
    expect(view.toJSON()).toMatchSnapshot()
  })
})

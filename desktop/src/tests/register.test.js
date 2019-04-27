import React from 'react'
import { Provider } from 'react-redux'
import store from '../store'
import renderer from 'react-test-renderer'
import { MemoryRouter } from 'react-router-dom'
import View from '../views/register'
describe('Register view', () => {
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

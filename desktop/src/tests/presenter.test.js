import React from 'react'
import renderer from 'react-test-renderer'
import { Provider } from 'react-redux'
import store from '../store'
import { MemoryRouter } from 'react-router-dom'

window.require = function() {}
describe('Presenter view', () => {
  test('it matches the snapshot', () => {
    window.require = function() {}
    const View = require('../views/presenter').default
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

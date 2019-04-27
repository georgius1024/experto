import React from 'react'
import ReactDOM from 'react-dom'
import App from '../App'
import renderer from 'react-test-renderer'

describe('App', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div')
    ReactDOM.render(<App />, div)
    ReactDOM.unmountComponentAtNode(div)
  })
  test('it matches the snapshot', () => {
    const view = renderer.create(<App />)
    expect(view.toJSON()).toMatchSnapshot()
  })
})

import React, { memo } from 'react'
import Navbar from 'react-bootstrap/Navbar'
import NavDropdown from 'react-bootstrap/NavDropdown'
import Nav from 'react-bootstrap/Nav'
import { withRouter } from 'react-router'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import actions from '../store/actions'

function AppHeader({ authenticated, history, expertName, unregister }) {
  function logout() {
    unregister()
    history.push('/')
  }
  function goMain(e) {
    e.preventDefault()
    history.push('/')
  }
  const brand = (
    <Navbar.Brand href="#" onClick={goMain}>
      Experto Crede
    </Navbar.Brand>
  )
  if (!authenticated) {
    return (
      <Navbar variant="dark" bg="primary" sticky="top">
        {brand}
        <Navbar.Text className="ml-auto mr-2">Эксперт не зарегистрирован</Navbar.Text>
      </Navbar>
    )
  } else {
    return (
      <Navbar variant="dark" bg="primary" sticky="top" expand="md" className="app-bar">
        {brand}
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ml-auto mr-2">
            <NavDropdown title={expertName} className="private-section">
              <NavDropdown.Item onClick={logout}>Выйти</NavDropdown.Item>
            </NavDropdown>{' '}
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    )
  }
}

AppHeader.propTypes = {
  authenticated: PropTypes.bool,
  expertName: PropTypes.string,
  history: PropTypes.object
}

const mapStateToProps = state => {
  return {
    authenticated: Boolean(state.registration.accessToken),
    expertName: state.registration.name
  }
}

const mapDispatchToProps = dispatch => {
  return {
    unregister: () => dispatch(actions.unregister())
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(memo(AppHeader)))

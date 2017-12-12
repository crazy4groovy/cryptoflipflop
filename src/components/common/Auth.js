import PropTypes from 'prop-types'
import React from 'react'
import { Button, FormControl, FormGroup, Glyphicon } from 'react-bootstrap'
import { auth } from '../../api/firebase'

class component extends React.Component {
  static propTypes = {
    setUid: PropTypes.func.isRequired,
    setName: PropTypes.func.isRequired,
    name: PropTypes.string
  }

  static defaultProps = {
    name: ''
  }

  state = {
    isLoggedIn: false,
    email: '',
    password: ''
  }

  doSignOut = async () => {
    const data = await auth().signOut()
    console.log('signout', data)

    this.props.setUid(null)
    this.props.setName(null)
    this.setState({
      isLoggedIn: false,
      email: '',
      password: ''
    })
  }

  authDataCb = async data => {
    if (!data) {
      console.error(data)
      return
    }

    await this.props.setUid(data.uid)
    this.setState({
      isLoggedIn: true,
      email: '',
      password: ''
    })
  }

  doSignIn = () =>
    auth()
      .signInWithEmailAndPassword(this.state.email, this.state.password)
      .then(this.authDataCb)
      .catch(err => alert(err.message || err))

  doSignUp = () => {
    const name = prompt('Please enter your account name:', this.state.email)
    return auth()
      .createUserWithEmailAndPassword(this.state.email, this.state.password)
      .then(this.authDataCb)
      .then(() => alert("Welcome! Have fun, and please don't forget your password!"))
      .then(() => this.props.setName(name))
      .catch(err => {
        alert(err.message || err)
        this.props.setUid(null)
        this.props.setName(null)
        this.setState({ isLoggedIn: false })
      })
  }

  render() {
    if (!this.state.isLoggedIn) {
      const disableActions = !(this.state.email && this.state.password)

      return (
        <div style={{ color: 'white' }}>
          <Glyphicon className="pulse animated infinite" glyph="chevron-right" />{' '}
          <FormGroup>
            <FormControl
              onChange={e => this.setState({ email: e.target.value })}
              onKeyDown={e => {
                if (e.key === 'Enter' && !disableActions) {
                  this.doSignUp()
                }
              }}
              autoFocus
              placeholder="your e-mail"
              type="text"
              value={this.state.email}
            />{' '}
            <FormControl
              onChange={e => this.setState({ password: e.target.value })}
              onKeyDown={e => {
                if (e.key === 'Enter' && !disableActions) {
                  this.doSignIn()
                }
              }}
              placeholder="password"
              type="password"
              value={this.state.password}
            />
          </FormGroup>{' '}
          <Button bsStyle="primary" onClick={this.doSignUp} disabled={disableActions}>
            Sign Up
          </Button>{' '}
          <Button bsStyle="warning" onClick={this.doSignIn} disabled={disableActions}>
            Sign In
          </Button>
        </div>
      )
    }

    return (
      <div>
        <span>Account: {this.props.name}</span>{' '}
        <Button bsStyle="warning" onClick={this.doSignOut}>
          Sign Out
        </Button>
      </div>
    )
  }
}

export default component

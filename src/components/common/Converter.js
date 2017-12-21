import PropTypes from 'prop-types'
import React, { Fragment } from 'react'
import { Col, ControlLabel, FormControl, FormGroup, Glyphicon, Row } from 'react-bootstrap'

class component extends React.Component {
  state = {
    isVisible: false
  }

  handleToggleVisible = () => this.setState({ isVisible: !this.state.isVisible })

  render() {
    const { fromValue, options, onChangeFrom, onChangeTo, rate, toValue } = this.props

    return (
      <Fragment>
        <h2 style={{ display: 'inline' }}>
          <a onClick={this.handleToggleVisible}>Quick Rate Converter</a>&nbsp;
        </h2>
        <Glyphicon glyph="chevron-down" />
        {this.state.isVisible && (
          <Fragment>
            <Row style={{ marginTop: '1em' }}>
              <Col sm={12}>
                <FormGroup controlId="fromCurrency">
                  <ControlLabel>From:</ControlLabel>
                  <FormControl
                    componentClass="select"
                    onChange={e => false && onChangeFrom(e.target.value)}
                    value={fromValue}
                    disabled
                  >
                    {options.filter(o => o.key !== toValue)}
                  </FormControl>
                </FormGroup>
              </Col>
            </Row>

            <Row>
              <Col sm={12}>
                <FormGroup controlId="toCurrency">
                  <ControlLabel>To:</ControlLabel>
                  <FormControl componentClass="select" onChange={e => onChangeTo(e.target.value)} value={toValue}>
                    {options.filter(o => o.key !== fromValue)}
                  </FormControl>
                </FormGroup>
              </Col>
            </Row>

            <Row>
              <Col sm={12}>
                <h3>
                  {rate && (
                    <div>
                      Ratio = <span className="digits">1</span> ({fromValue}) : <span className="digits">{rate}</span> ({toValue})
                    </div>
                  )}
                </h3>
              </Col>
            </Row>
          </Fragment>
        )}
      </Fragment>
    )
  }
}

component.propTypes = {
  fromValue: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
  onChangeFrom: PropTypes.func.isRequired,
  onChangeTo: PropTypes.func.isRequired,
  rate: PropTypes.string.isRequired,
  toValue: PropTypes.string
}
component.defaultProps = {
  toValue: ''
}

export default component

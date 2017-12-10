import React from 'react'
import { Button, Col, ControlLabel, FormControl, FormGroup, Grid, Jumbotron, Navbar, Row } from 'react-bootstrap'

import coins, { marketInfo } from '../api/coins'

class App extends React.Component {
  state = {
    coins: null,
    marketInfo: null,
    selectedCurrency: {
      from: 'BTC',
      to: ''
    }
  }

  fetchCoins = () => coins().then(coins => this.setState({ coins }))

  fetchMarketInfo = () => marketInfo().then(marketInfo => this.setState({ marketInfo }))

  exchangeTo = symbol =>
    this.state.marketInfo
      ? (this.state.marketInfo.find(info => info.pair === `${this.state.selectedCurrency.from}_${symbol}`) || {}).rate
      : null

  componentDidMount() {
    this.fetchCoins()
    this.fetchMarketInfo()
  }

  render() {
    const rate =
      this.state.selectedCurrency.from && this.state.selectedCurrency.to && this.state.marketInfo
        ? (
            this.state.marketInfo.find(
              info => info.pair === `${this.state.selectedCurrency.from}_${this.state.selectedCurrency.to}`
            ) || {}
          ).rate
        : ''

    const options = this.state.coins
      ? Object.keys(this.state.coins).reduce(
          (arr, currency) => {
            const coin = this.state.coins[currency]
            const option = (
              <option key={currency} value={coin.symbol}>
                {coin.name} ({coin.symbol})
              </option>
            )
            arr.push(option)
            return arr
          },
          [<option key="" value="" />]
        )
      : []

    return (
      <div>
        <Navbar inverse fixedTop>
          <Grid>
            <Navbar.Header>
              <Navbar.Brand>
                <a href="/">Crypto Flip Flop</a>
              </Navbar.Brand>
              <Navbar.Toggle />
            </Navbar.Header>
          </Grid>
        </Navbar>
        <Jumbotron>
          <Grid>
            <h1>Crypto Flip Flop</h1>
            {/* <p>
              <Button
                bsStyle="success"
                bsSize="large"
                href="http://react-bootstrap.github.io/components.html"
                target="_blank"
              >
                View React Bootstrap Docs
              </Button>
            </p> */}

            <h2>Currency Convert</h2>
            <Row>
              <Col sm={4}>
                <FormGroup controlId="fromCurrency">
                  <ControlLabel>From:</ControlLabel>
                  <FormControl
                    componentClass="select"
                    placeholder=""
                    onChange={e =>
                      this.setState({
                        selectedCurrency: { ...this.state.selectedCurrency, from: e.target.value }
                      })
                    }
                    value={this.state.selectedCurrency.from}
                  >
                    {options.filter(o => o.key !== this.state.selectedCurrency.to)}
                  </FormControl>
                </FormGroup>
              </Col>
            </Row>

            <Row>
              <Col sm={4}>
                <FormGroup controlId="toCurrency">
                  <ControlLabel>To:</ControlLabel>
                  <FormControl
                    componentClass="select"
                    placeholder=""
                    onChange={e =>
                      this.setState({
                        selectedCurrency: { ...this.state.selectedCurrency, to: e.target.value }
                      })
                    }
                    value={this.state.selectedCurrency.to}
                  >
                    {options.filter(o => o.key !== this.state.selectedCurrency.from)}
                  </FormControl>
                </FormGroup>
              </Col>
            </Row>

            <Row>
              <Col sm={6}>
                <h3>{rate && `Ratio = 1 : ${rate}`}</h3>
              </Col>
            </Row>

            <h2>Coins</h2>
            {this.state.coins &&
              Object.keys(this.state.coins).map(currency => {
                const coin = this.state.coins[currency]
                const exchangeRate = this.exchangeTo(coin.symbol)

                return (
                  <Row key={currency}>
                    <Col sm={2}>
                      <img src={coin.imageSmall || coin.image} />&nbsp;
                      {coin.name} ({coin.symbol})&nbsp;
                    </Col>
                    <Col sm={10}>
                      {exchangeRate && (
                        <Button bsStyle="success" bsSize="small" href="#" sm="6">
                          {exchangeRate}
                        </Button>
                      )}
                    </Col>
                  </Row>
                )
              })}
          </Grid>
        </Jumbotron>
      </div>
    )
  }
}

export default App

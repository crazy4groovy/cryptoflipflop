import React from 'react'
import { Button, Col, Glyphicon, Grid, Jumbotron, Navbar, Row } from 'react-bootstrap'

import coins, { marketInfo } from '../api/coins'
import { db, timestamp } from '../api/firebase.js'

import './App.css'
import Auth from './common/Auth'
import Converter from './common/Converter'

let txsRef
function txsSorter(a, b) {
  if (a.timestamp < b.timestamp) return 1
  if (a.timestamp > b.timestamp) return -1
  return 0
}

const defaultAccount = Object.freeze({
  amount: 100,
  currency: 'BTC',
  role: 'user'
})

class App extends React.Component {
  state = {
    account: defaultAccount,
    txs: null,
    coins: null,
    marketInfo: null,
    selectedCurrency: {
      from: 'BTC',
      to: ''
    }
  }

  fetchCoins = () => coins().then(coins => this.setState({ coins }))

  fetchMarketInfo = () => marketInfo().then(marketInfo => this.setState({ marketInfo }))

  fetchTxsListener = () => {
    txsRef && txsRef.off()
    this.setState({ txs: null })

    console.log('UID', this.state.account.uid)
    if (!this.state.account.uid) return

    txsRef = db.ref(`txs/${this.state.account.uid}`)
    txsRef.on('value', snapshot => {
      const val = snapshot.val() || []
      const txs = Object.keys(val)
        .map(k => val[k])
        .sort(txsSorter)
      const lastTx = txs[0]

      if (lastTx) {
        const account = {
          ...this.state.account,
          amount: lastTx.toAmount,
          currency: lastTx.toCurrency
        }
        this.setState({ account })
        const selectedCurrency = {
          from: lastTx.toCurrency,
          to: ''
        }
        this.setState({ selectedCurrency })
      }
      this.setState({ txs })
    })
  }

  updateUser = user => {
    if (!this.state.account.uid) return Promise.resolve()

    const userScrubbed = {
      ...user,
      id: undefined
    }
    console.log('update user', JSON.stringify(userScrubbed))
    return db.ref(`users/${this.state.account.uid}`).update(user)
  }

  getUser = () => {
    const uid = this.state.account.uid
    console.log('uid getUser', uid)
    if (!uid) return Promise.resolve()

    return db
      .ref(`users/${uid}`)
      .once('value')
      .then(snapshot => {
        const account = snapshot.val() || {}
        console.log('user', account)
        account.uid = uid
        this.setState({
          account: {
            ...this.state.account,
            ...account
          }
        })
      })
  }

  doExchangeTo = symbol => {
    if (!symbol) return
    if (!this.state.account.uid) {
      alert('Please sign in, or sign up as a new user')
      return
    }

    const txsRef = db.ref(`txs/${this.state.account.uid}`)
    const rate = this.exchangeRateFor(symbol)
    const tx = {
      fromAmount: this.state.account.amount,
      fromCurrency: this.state.selectedCurrency.from,
      rate,
      toAmount: this.state.account.amount * rate,
      toCurrency: symbol,
      timestamp: timestamp
    }
    txsRef.push(tx)
  }

  rateFudge = 1.01 // slightly less transaction cost

  exchangeRateFor = symbol =>
    this.state.marketInfo
      ? (this.state.marketInfo.find(info => info.pair === `${this.state.selectedCurrency.from}_${symbol}`) || {}).rate *
        this.rateFudge
      : null

  setUid = async uid => {
    console.log('set UID', uid)
    uid ? this.setState({ account: { ...this.state.account, uid } }) : this.setState({ account: defaultAccount })
    this.fetchTxsListener()
    await this.updateUser({
      loggedInOn: timestamp
    })
    return this.getUser()
  }

  setName = name => {
    this.setState({ account: { ...this.state.account, name } })

    return this.updateUser({
      name,
      signedUpOn: timestamp,
      role: 'user'
    })
  }

  coinRefreshMs = 5 * 60 * 1000

  componentDidMount() {
    const fetchData = () => {
      this.fetchCoins()
      this.fetchMarketInfo()
    }
    fetchData()
    setInterval(fetchData, this.coinRefreshMs)
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
          <Navbar.Header>
            <Navbar.Brand>
              <span>CryptoFlipFlop.com</span>
              <a
                target="_blank"
                href="https://coinmarketcap.com/"
                style={{ color: '#ddd', paddingLeft: '1em', fontSize: '.7em' }}
              >
                Coin charts
              </a>
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
          <Navbar.Collapse>
            <Navbar.Form pullRight>
              <Auth setUid={this.setUid} setName={this.setName} name={this.state.account.name} />
            </Navbar.Form>
          </Navbar.Collapse>
        </Navbar>

        <Grid style={{ marginTop: '5em' }}>
          <Jumbotron>
            <h1 style={{ textAlign: 'center' }}>Crypto Flip/Flop</h1>
            <h2 style={{ textAlign: 'center' }}>A Learner's Exchange -- Can you trade beyond 100 BTC?</h2>
            {this.state.txs === null && <h3 style={{ textAlign: 'center' }}>This simulator has no fiat currency.</h3>}
            {this.state.txs === null && (
              <h3 style={{ textAlign: 'center' }}>
                The object of the game is simple: gain coins by trading your (over-valued) coins for other
                (under-valued) coins, as the market ebbs and flows.
              </h3>
            )}
            {this.state.txs === null && (
              <h3 style={{ textAlign: 'center' }}>
                Small transaction fees apply, which are more costly for uncommon coins.
              </h3>
            )}
          </Jumbotron>
        </Grid>

        <Grid>
          {this.state.txs !== null && <h3>Total Trades: {this.state.txs.length}</h3>}
          {this.state.account.amount && (
            <h3>
              Total Coins: {this.state.account.amount} ({this.state.account.currency})
            </h3>
          )}

          <hr />

          <Row>
            <Col sm={6} className="section-box">
              <Converter
                fromValue={this.state.selectedCurrency.from}
                toValue={this.state.selectedCurrency.to}
                onChangeFrom={from =>
                  this.setState({
                    selectedCurrency: { ...this.state.selectedCurrency, from }
                  })
                }
                onChangeTo={to =>
                  this.setState({
                    selectedCurrency: { ...this.state.selectedCurrency, to }
                  })
                }
                options={options}
                rate={rate}
              />
            </Col>
          </Row>

          <hr />

          <h2>Trade from {this.state.selectedCurrency.from || '?'} to...</h2>
          <Row>
            <Col sm={3}>
              <h4>Name</h4>
            </Col>
            <Col sm={9}>
              <h4>
                # of Coins <Glyphicon glyph="share-alt" />
              </h4>
            </Col>
          </Row>
          {this.state.coins &&
            Object.keys(this.state.coins)
              .filter(currency => this.exchangeRateFor(this.state.coins[currency].symbol))
              .map(currency => {
                const coin = this.state.coins[currency]
                const exchangeRate = this.exchangeRateFor(coin.symbol)
                const buttonLabel = this.state.account.amount ? this.state.account.amount * exchangeRate : '?'

                return (
                  <Row key={currency} className="currency-row">
                    <Col xs={6} sm={3}>
                      <img alt="coin logo" src={coin.imageSmall || coin.image} /> ({coin.symbol}) {coin.name}
                    </Col>
                    <Col xs={6} sm={9}>
                      {exchangeRate ? (
                        <Button bsStyle="success" bsSize="small" sm={6} onClick={() => this.doExchangeTo(coin.symbol)}>
                          Trade for{' '}
                          <span>
                            {buttonLabel} {currency}
                          </span>{' '}
                          coins <Glyphicon glyph="share-alt" />
                        </Button>
                      ) : (
                        'No exchange rate'
                      )}
                    </Col>
                  </Row>
                )
              })}
          <Row className="footer">
            <Col sm={12}>Data refreshes every 5 minutes.</Col>
          </Row>
        </Grid>
      </div>
    )
  }
}

export default App

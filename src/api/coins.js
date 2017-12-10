// @flow

const asJson = data => data.json()

export default () => fetch('https://cors.shapeshift.io/getcoins/').then(asJson)
export const marketInfo = () => fetch('https://cors.shapeshift.io/marketinfo/').then(asJson)

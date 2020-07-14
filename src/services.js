import stagingOnboard from 'bnc-onboard-staging'
import stagingNotify from 'bnc-notify-staging'
import Notify from 'bnc-notify'
import Onboard from 'bnc-onboard'

const networkId = 4
const rpcUrl = 'https://rinkeby.infura.io/v3/d5e29c9b9a9d4116a7348113f57770a8'
const apiUrl = process.env.REACT_APP_API_URL
const staging = process.env.REACT_APP_STAGING
const dappId = '12153f55-f29e-4f11-aa07-90f10da5d778'

export function initOnboard(subscriptions) {
  const onboard = staging ? stagingOnboard : Onboard
  return onboard({
    dappId,
    hideBranding: false,
    networkId,
    apiUrl,
    // darkMode: true,
    subscriptions,
    walletSelect: {
      wallets: [
        { walletName: 'metamask' },
        {
          walletName: 'trezor',
          appUrl: 'https://reactdemo.blocknative.com',
          email: 'aaron@blocknative.com',
          rpcUrl
        },
        {
          walletName: 'ledger',
          rpcUrl
        },
        { walletName: 'dapper' },
        { walletName: 'coinbase' },
        { walletName: 'status' },
        { walletName: 'walletLink', rpcUrl },
        {
          walletName: 'portis',
          apiKey: 'b2b7586f-2b1e-4c30-a7fb-c2d1533b153b'
        },
        { walletName: 'fortmatic', apiKey: 'pk_test_886ADCAB855632AA' },
        { walletName: 'unilogin' },
        { walletName: 'torus' },
        { walletName: 'squarelink', apiKey: '87288b677f8cfb09a986' },
        { walletName: 'authereum', disableNotifications: true },
        { walletName: 'trust', rpcUrl },
        {
          walletName: 'walletConnect',
          infuraKey: 'd5e29c9b9a9d4116a7348113f57770a8'
          // rpc: {
          //   [networkId]: rpcUrl,
          // },
        },
        { walletName: 'opera' },
        { walletName: 'operaTouch' },
        { walletName: 'imToken', rpcUrl }
      ]
    },
    walletCheck: [
      { checkName: 'derivationPath' },
      { checkName: 'connect' },
      { checkName: 'accounts' },
      { checkName: 'network' },
      { checkName: 'balance', minimumBalance: '100000' }
    ]
  })
}

export function initNotify() {
  const notify = staging ? stagingNotify : Notify
  return notify({
    dappId,
    networkId,
    apiUrl
  })
}

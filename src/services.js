import stagingOnboard from 'bnc-onboard-staging'
import stagingNotify from 'bnc-notify-staging'
import Notify from 'bnc-notify'
import Onboard from 'bnc-onboard'

const networkId = 56
// const rpcUrl = 'https://rinkeby.infura.io/v3/cea9deb6467748b0b81b920b005c10c1'
const apiUrl = process.env.REACT_APP_API_URL
const staging = process.env.REACT_APP_STAGING
const dappId = '12153f55-f29e-4f11-aa07-90f10da5d778'
// const infuraKey = 'cea9deb6467748b0b81b920b005c10c1'

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
          walletName: 'walletConnect',
          preferred: true,
          rpc: { '56': 'https://bsc-dataseed1.defibit.io/' },
          bridge: 'https://bridge.walletconnect.org',
        },
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
    apiUrl,
    onerror: error => console.log(`Notify error: ${error.message}`)
  })
}

import blocknativeLogo from './icons/blocknative-logo'
import blocknativeIcon from './icons/blocknative-icon'

import { init } from '@web3-onboard/react'
import injectedModule from '@web3-onboard/injected-wallets'
import trezorModule from '@web3-onboard/trezor'
import ledgerModule from '@web3-onboard/ledger'
import walletConnectModule from '@web3-onboard/walletconnect'
import coinbaseModule from '@web3-onboard/coinbase'
import portisModule from '@web3-onboard/portis'
import magicModule from '@web3-onboard/magic'
import fortmaticModule from '@web3-onboard/fortmatic'
import torusModule from '@web3-onboard/torus'
import keepkeyModule from '@web3-onboard/keepkey'
import gnosisModule from '@web3-onboard/gnosis'
import web3authModule from '@web3-onboard/web3auth'
import sequenceModule from '@web3-onboard/sequence'
import tallyModule from '@web3-onboard/tallyho'
import enkryptModule from '@web3-onboard/enkrypt'
import mewWalletModule from '@web3-onboard/mew-wallet'
import uauthModule from '@web3-onboard/uauth'
import trustModule from '@web3-onboard/trust'
import frontierModule from '@web3-onboard/frontier'
import transactionPreviewModule from '@web3-onboard/transaction-preview'
import gas from '@web3-onboard/gas'

// Replace with your DApp's Infura ID
const INFURA_ID = 'cea9deb6467748b0b81b920b005c10c1'
export const infuraRPC = `https://mainnet.infura.io/v3/${INFURA_ID}`

const dappId = '7ed5f4aa-fb90-4124-8ef9-f69e3e8e666d'

const injected = injectedModule()
const coinbase = coinbaseModule()
const walletConnect = walletConnectModule()

const portis = portisModule({
  apiKey: 'b2b7586f-2b1e-4c30-a7fb-c2d1533b153b'
})

const fortmatic = fortmaticModule({
  apiKey: 'pk_test_886ADCAB855632AA'
})

const torus = torusModule()
const ledger = ledgerModule()
const keepkey = keepkeyModule()
const gnosis = gnosisModule()
const sequence = sequenceModule()
const tally = tallyModule()
const trust = trustModule()
const frontier = frontierModule()

const trezorOptions = {
  email: 'test@test.com',
  appUrl: 'https://www.blocknative.com'
}

const trezor = trezorModule(trezorOptions)

const magic = magicModule({
  // Example api key, may need to be updated when max hits reached
  // Get one to test with for free from https://magic.link/
  apiKey: 'pk_live_02207D744E81C2BA',
  userEmail: localStorage.getItem('magicUserEmail')
})

const web3auth = web3authModule({
  clientId:
    'DJuUOKvmNnlzy6ruVgeWYWIMKLRyYtjYa9Y10VCeJzWZcygDlrYLyXsBQjpJ2hxlBO9dnl8t9GmAC2qOP5vnIGo'
})

const uauthOptions = {
  clientID: '2d14b025-cb94-44b9-85ac-ce2397e6f10b',
  redirectUri: window.location.href,
  scope:
    'openid wallet email:optional humanity_check:optional profile:optional social:optional'
}
const uauth = uauthModule(uauthOptions)
const enkrypt = enkryptModule()
const mewWallet = mewWalletModule()

const transactionPreview = transactionPreviewModule({
  requireTransactionApproval:true
})

export const initWeb3Onboard = init({
  apiKey: dappId,
  transactionPreview,
  theme: 'dark',
  wallets: [
    injected,
    ledger,
    coinbase,
    trezor,
    uauth,
    trust,
    walletConnect,
    tally,
    enkrypt,
    mewWallet,
    web3auth,
    gnosis,
    magic,
    fortmatic,
    keepkey,
    portis,
    torus,
    sequence,
    frontier
  ],
  chains: [
    {
      id: '0x1',
      token: 'ETH',
      label: 'Ethereum',
      rpcUrl: infuraRPC
    },
    {
      id: '0x5',
      token: 'ETH',
      label: 'Goerli',
      rpcUrl: `https://goerli.infura.io/v3/${INFURA_ID}`
    },
    {
      id: '0x13881',
      token: 'MATIC',
      label: 'Polygon - Mumbai',
      rpcUrl: 'https://matic-mumbai.chainstacklabs.com	'
    },
    {
      id: '0x38',
      token: 'BNB',
      label: 'Binance',
      rpcUrl: 'https://bsc-dataseed.binance.org/'
    },
    {
      id: '0x89',
      token: 'MATIC',
      label: 'Polygon',
      rpcUrl: 'https://matic-mainnet.chainstacklabs.com'
    },
    {
      id: '0xfa',
      token: 'FTM',
      label: 'Fantom',
      rpcUrl: 'https://rpc.ftm.tools/'
    },
    {
      id: 10,
      token: 'OETH',
      label: 'Optimism',
      rpcUrl: 'https://mainnet.optimism.io'
    },
    {
      id: 42161,
      token: 'ARB-ETH',
      label: 'Arbitrum',
      rpcUrl: 'https://rpc.ankr.com/arbitrum'
    }
  ],
  appMetadata: {
    name: 'Blocknative Web3-Onboard',
    description: 'Demo app for Web3-Onboard',
    recommendedInjectedWallets: [
      { name: 'Coinbase', url: 'https://wallet.coinbase.com/' },
      { name: 'MetaMask', url: 'https://metamask.io' }
    ],
    agreement: {
      version: '1.0.0',
      termsUrl: 'https://www.blocknative.com/terms-conditions',
      privacyUrl: 'https://www.blocknative.com/privacy-policy'
    },
    gettingStartedGuide: 'https://blocknative.com',
    explore: 'https://blocknative.com'
  },
  accountCenter: {
    desktop: {
      position: 'topRight',
      enabled: true,
      minimal: false
    }
  },
})

// subscribe to a single chain for estimates using the default poll rate of 5 secs
// API key is optional and if provided allows for faster poll rates
export const ethMainnetGasBlockPrices = gas.stream({
  chains: ['0x1'],
  // apiKey: dappId,
  endpoint: 'blockPrices'
})


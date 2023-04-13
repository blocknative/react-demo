import blocknativeIcon from './icons/blocknative-icon'

import { init } from '@web3-onboard/react'
import injectedModule from '@web3-onboard/injected-wallets'
import trezorModule from '@web3-onboard/trezor'
import ledgerModule from '@web3-onboard/ledger'
import walletConnectModule from '@web3-onboard/walletconnect'
import coinbaseModule from '@web3-onboard/coinbase'
import gas from '@web3-onboard/gas'
import transactionPreviewModule from '@web3-onboard/transaction-preview'

// Replace with your DApp's Infura ID
const INFURA_ID = 'cea9deb6467748b0b81b920b005c10c1'
export const infuraRPC = `https://mainnet.infura.io/v3/${INFURA_ID}`


const injected = injectedModule()
const coinbase = coinbaseModule()
const walletConnect = walletConnectModule()
const ledger = ledgerModule()

const trezorOptions = {
  email: 'test@test.com',
  appUrl: 'https://www.blocknative.com'
}
const trezor = trezorModule(trezorOptions)

const transactionPreview = transactionPreviewModule({
  requireTransactionApproval:true
})

const apiKey = '7ed5f4aa-fb90-4124-8ef9-f69e3e8e666d'


export const initWeb3Onboard = init({
  transactionPreview,
  apiKey,
  wallets: [injected, ledger, coinbase, trezor, walletConnect],
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
    icon: blocknativeIcon,
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
  }
})

// subscribe to a single chain for estimates using the default poll rate of 5 secs
// API key is optional and if provided allows for faster poll rates
export const ethMainnetGasBlockPrices = gas.stream({
  chains: ['0x1'],
  // apiKey: dappId,
  endpoint: 'blockPrices'
})

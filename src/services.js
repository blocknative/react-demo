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

// Replace with your DApp's Infura ID
const INFURA_ID = 'cea9deb6467748b0b81b920b005c10c1'

const dappId = '1730eff0-9d50-4382-a3fe-89f0d34a2070'

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

export const initWeb3Onboard = init({
  wallets: [
    injected,
    ledger,
    coinbase,
    trezor,
    walletConnect,
    web3auth,
    gnosis,
    magic,
    fortmatic,
    keepkey,
    portis,
    torus
  ],
  chains: [
    {
      id: '0x1',
      token: 'ETH',
      label: 'Ethereum',
      rpcUrl: `https://mainnet.infura.io/v3/${INFURA_ID}`
    },
    {
      id: '0x3',
      token: 'tROP',
      label: 'Ropsten',
      rpcUrl: `https://ropsten.infura.io/v3/${INFURA_ID}`
    },
    {
      id: '0x4',
      token: 'rETH',
      label: 'Rinkeby',
      rpcUrl: `https://rinkeby.infura.io/v3/${INFURA_ID}`
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
    }
  ],
  appMetadata: {
    name: 'Blocknative Web3-Onboard',
    icon: blocknativeIcon,
    logo: blocknativeLogo,
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
  // example customizing copy
  i18n: {
    es: {
      connect: {
        selectingWallet: {
          header: 'Carteras disponibles',
          sidebar: {
            heading: 'Comenzar',
            subheading: 'Conecta tu monedero',
            paragraph:
              'Conectar su billetera es como “iniciar sesión” en Web3. Seleccione su billetera de las opciones para comenzar.'
          }
        }
      },
      accountCenter: {
        connectAnotherWallet: 'Conectar otro monedero',
        disconnectAllWallets: 'Desconectar todos los monederos',
        currentNetwork: 'Red actual',
        appInfo: 'Información de la aplicación',
        learnMore: 'Aprende más',
        gettingStartedGuide: 'Guía de introducción',
        smartContracts: 'Contrato(s) inteligente',
        explore: 'Explorar',
        backToApp: 'Volver a dapp',
        poweredBy: 'Funciona con',
        addAccount: 'Añadir cuenta',
        setPrimaryAccount: 'Establecer cuenta principal',
        disconnectWallet: 'Desconectar Wallet'
      }
    }
  },
  apiKey: dappId,
  notify: {
    transactionHandler: transaction => {
      console.log({ transaction })
      if (transaction.eventCode === 'txPool') {
        return {
          // autoDismiss set to zero will persist the notification until the user excuses it
          autoDismiss: 0,
          // message: `Your transaction is pending, click <a href="https://rinkeby.etherscan.io/tx/${transaction.hash}" rel="noopener noreferrer" target="_blank">here</a> for more info.`,
          // or you could use onClick for when someone clicks on the notification itself
          onClick: () =>
            window.open(`https://rinkeby.etherscan.io/tx/${transaction.hash}`)
        }
      }
    }
  }
})

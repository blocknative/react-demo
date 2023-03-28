import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import VConsole from 'vconsole'
import {
  initWeb3Onboard,
  ethMainnetGasBlockPrices,
  infuraRPC
} from './services'
import {
  useAccountCenter,
  useConnectWallet,
  useNotifications,
  useSetChain,
  useWallets,
  useSetLocale
} from '@web3-onboard/react'
import './App.css'
import Header from './views/Header/Header.js'
import Footer from './views/Footer/Footer.js'

if (window.innerWidth < 700) {
  new VConsole()
}

let provider

const App = () => {
  const [{ wallet }, connect, disconnect, updateBalances, setWalletModules] =
    useConnectWallet()
  const [{ chains, connectedChain, settingChain }, setChain] = useSetChain()
  const [notifications, customNotification, updateNotify] = useNotifications()
  const connectedWallets = useWallets()
  const updateAccountCenter = useAccountCenter()
  const updateLocale = useSetLocale()

  const [web3Onboard, setWeb3Onboard] = useState(null)

  const [bnGasPrices, setBNGasPrices] = useState('')
  const [rpcInfuraGasPrices, setRPCInfuraGasPrices] = useState('')
  const [toAddress, setToAddress] = useState('')
  const [tradeAmount, setTradeAmount] = useState('')
  // default test transaction to Goerli
  const [toChain, setToChain] = useState('0x5')
  const [accountCenterPosition, setAccountCenterPosition] = useState('topRight')
  const [notifyPosition, setNotifyPosition] = useState('topRight')
  const [locale, setLocale] = useState('en')
  const [accountCenterSize, setAccountCenterSize] = useState('normal')

  useEffect(() => {
    setWeb3Onboard(initWeb3Onboard)
  }, [])

  useEffect(() => {
    console.log(notifications)
  }, [notifications])

  useEffect(() => {
    if (!connectedWallets.length) return

    const connectedWalletsLabelArray = connectedWallets.map(
      ({ label }) => label
    )
    // Check for Magic Wallet user session
    if (connectedWalletsLabelArray.includes('Magic Wallet')) {
      const [magicWalletProvider] = connectedWallets.filter(
        provider => provider.label === 'Magic Wallet'
      )
      async function setMagicUser() {
        try {
          const { email } =
            await magicWalletProvider.instance.user.getMetadata()
          const magicUserEmail = localStorage.getItem('magicUserEmail')
          if (!magicUserEmail || magicUserEmail !== email)
            localStorage.setItem('magicUserEmail', email)
        } catch (err) {
          throw err
        }
      }
      setMagicUser()
    }
  }, [connectedWallets, wallet])

  useEffect(() => {
    if (!wallet?.provider) {
      provider = null
    } else {
      provider = new ethers.providers.Web3Provider(wallet.provider, 'any')
    }
  }, [wallet])

  useEffect(() => {
    ethMainnetGasBlockPrices.subscribe(estimates => {
      setBNGasPrices(estimates[0].blockPrices[0].estimatedPrices)
    })
  }, [])

  useEffect(() => {
    async function getEtherGasFromRPC() {
      const customHttpProvider = new ethers.providers.JsonRpcProvider(infuraRPC)
      const fee = await customHttpProvider.getFeeData()
      const cleanFees = {
        price: ethers.utils.formatUnits(fee.gasPrice, 'gwei'),
        maxPriorityFeePerGas: ethers.utils.formatUnits(
          fee.maxPriorityFeePerGas,
          'gwei'
        ),
        maxFeePerGas: ethers.utils.formatUnits(fee.maxFeePerGas, 'gwei')
      }
      setRPCInfuraGasPrices(cleanFees)
    }
    getEtherGasFromRPC()
  }, [bnGasPrices])

  const gasView = gasObj => {
    return Object.keys(gasObj)
      .filter(prop => prop !== 'price')
      .map(key => (
        <section value={key} key={key}>
          {key} : {gasObj[key]}
        </section>
      ))
  }

  const gasDiff = bnGas => {
    const priFeeDiff =
      rpcInfuraGasPrices.maxPriorityFeePerGas - bnGas.maxPriorityFeePerGas
    const maxFeeDiff = rpcInfuraGasPrices.maxFeePerGas - bnGas.maxFeePerGas
    return priFeeDiff + maxFeeDiff
  }

  const readyToTransact = async () => {
    if (!wallet) {
      const walletSelected = await connect()
      if (!walletSelected) return false
    }
    // prompt user to switch to Goerli for test
    await setChain({ chainId: toChain })

    return true
  }

  const gweiToWeiHex = gwei => {
    return `0x${(gwei * 1e9).toString(16)}`
  }

  const sendHash = async () => {
    if (!toAddress) {
      alert('An Ethereum address to send Eth to is required.')
      return
    }

    const signer = provider.getUncheckedSigner()

    // To set gas using the Web3-Onboard Gas package(support Eth Mainnet and Polygon)
    // define desired confidence for transaction inclusion in block and set in transaction
    // const bnGasForTransaction = bnGasPrices.find(gas => gas.confidence === 90)

    const rc = await signer.sendTransaction({
      to: toAddress,
      value: 1000000000000000

      // This will set the transaction gas based on desired confidence
      // maxPriorityFeePerGas: gweiToWeiHex(
      //   bnGasForTransaction.maxPriorityFeePerGas
      // ),
      // maxFeePerGas: gweiToWeiHex(bnGasForTransaction.maxFeePerGas)
    })
    console.log(rc)
  }

  const sendTransaction = async () => {
    if (!toAddress) {
      alert('An Ethereum address to send Eth to is required.')
    }
    const balanceValue = Object.values(wallet.accounts[0].balance)[0]

    const signer = provider.getUncheckedSigner()

    const txDetails = {
      to: toAddress,
      value: 1000000000000000
    }

    const sendTransaction = () => {
      return signer.sendTransaction(txDetails).then(tx => tx.hash)
    }

    const gasPrice = () => provider.getGasPrice().then(res => res.toString())

    const estimateGas = () => {
      return provider.estimateGas(txDetails).then(res => res.toString())
    }
    console.log(estimateGas)

    // convert to hook when available
    const transactionHash =
      await web3Onboard.state.actions.preflightNotifications({
        sendTransaction,
        gasPrice,
        estimateGas,
        balance: balanceValue,
        txDetails: txDetails
      })
    console.log(transactionHash)
  }

  const approveTokenForSwap = async () => {
    const signer = provider.getSigner()

    const CONTRACT_ADDRESS = '0x7a250d5630b4cf539739df2c5dacb4c659f2488d'
    const erc20_interface = [
      'function approve(address _spender, uint256 _value) public returns (bool success)',
      'function transferFrom(address sender, address recipient, uint256 amount) external returns (bool)',
      'function balanceOf(address owner) view returns (uint256)'
    ]

    const oneInch = '0x111111111117dc0aa78b770fa6a738034120c302'
    let approveTxData
    const erc20_contract = new ethers.Contract(oneInch, erc20_interface)
    const tokenAmount = ethers.BigNumber.from(`${tradeAmount}000000000000000000`)

    approveTxData = await erc20_contract.populateTransaction.approve(
      CONTRACT_ADDRESS,
      tokenAmount
    )

    const popTransaction = await signer.populateTransaction(approveTxData)
    console.log(popTransaction)
    await signer.sendUncheckedTransaction({ ...popTransaction, value: 0 })
  }

  const swapTokens = async () => {

    const signer = provider.getSigner()

    const addressFrom = wallet?.accounts[0]?.address

    const CONTRACT_ADDRESS = '0x7a250d5630b4cf539739df2c5dacb4c659f2488d'

    const uniswapV2router_interface = [
      'function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)'
    ]

    const weth = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
    const oneInch = '0x111111111117dc0aa78b770fa6a738034120c302'
    let swapTxData
    const swapContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      uniswapV2router_interface
    )
    const tokenAmount = ethers.BigNumber.from(`${tradeAmount}00000000000000000`)

    const amountOutMin = 0
    const amountOutMinHex = ethers.BigNumber.from(amountOutMin.toString())._hex

    const path = [oneInch, weth]
    const deadline = Math.floor(Date.now() / 1000) + 60 * 1 // 1 minutes from the current Unix time

    const inputAmountHex = tokenAmount.toHexString()

    swapTxData = await swapContract.populateTransaction.swapExactTokensForETH(
      inputAmountHex,
      amountOutMinHex,
      path,
      addressFrom,
      deadline
    )
    const uniswapV2Router = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'

    console.log(swapTxData)
    const popTransaction = await signer.populateTransaction({...swapTxData, type:0})
    console.log(popTransaction)
    await signer.sendTransaction({
      ...popTransaction,
      from: addressFrom,
      to: uniswapV2Router,
      value: 0
    })
  }

  const renderNotifySettings = () => {
    if (window.innerWidth < 425) {
      return (
        <div className={'conditional-ui-settings'}>
          <h3>Notify Mobile Positioning</h3>
          <button
            className={`bn-demo-button ${
              notifyPosition === 'topRight'
                ? 'selected-toggle-btn'
                : 'unselected-toggle-btn'
            }`}
            onClick={() => {
              setNotifyPosition('topRight')
              updateNotify({ position: 'topRight' })
            }}
          >
            Top
          </button>
          <button
            className={`bn-demo-button ${
              notifyPosition === 'bottomRight'
                ? 'selected-toggle-btn'
                : 'unselected-toggle-btn'
            }`}
            onClick={() => {
              setNotifyPosition('bottomRight')
              updateNotify({ position: 'bottomRight' })
            }}
          >
            Bottom
          </button>
        </div>
      )
    }
    return (
      <div className={'conditional-ui-settings'}>
        {' '}
        <h3>Notify Positioning</h3>
        <button
          className={`bn-demo-button ${
            notifyPosition === 'topLeft'
              ? 'selected-toggle-btn'
              : 'unselected-toggle-btn'
          }`}
          onClick={() => {
            setNotifyPosition('topLeft')
            updateNotify({ position: 'topLeft' })
          }}
        >
          Top Left
        </button>
        <button
          className={`bn-demo-button ${
            notifyPosition === 'topRight'
              ? 'selected-toggle-btn'
              : 'unselected-toggle-btn'
          }`}
          onClick={() => {
            setNotifyPosition('topRight')
            updateNotify({ position: 'topRight' })
          }}
        >
          Top Right
        </button>
        <button
          className={`bn-demo-button ${
            notifyPosition === 'bottomRight'
              ? 'selected-toggle-btn'
              : 'unselected-toggle-btn'
          }`}
          onClick={() => {
            setNotifyPosition('bottomRight')
            updateNotify({ position: 'bottomRight' })
          }}
        >
          Bottom Right
        </button>
        <button
          className={`bn-demo-button ${
            notifyPosition === 'bottomLeft'
              ? 'selected-toggle-btn'
              : 'unselected-toggle-btn'
          }`}
          onClick={() => {
            setNotifyPosition('bottomLeft')
            updateNotify({ position: 'bottomLeft' })
          }}
        >
          Bottom Left
        </button>
      </div>
    )
  }
  const renderAccountCenterSettings = () => {
    if (window.innerWidth < 425) {
      return (
        <div className={'conditional-ui-settings'}>
          <h3>Account Center Mobile Positioning</h3>
          <button
            className={`bn-demo-button ${
              accountCenterPosition === 'topRight'
                ? 'selected-toggle-btn'
                : 'unselected-toggle-btn'
            }`}
            onClick={() => {
              setAccountCenterPosition('topRight')
              updateAccountCenter({
                position: 'topRight'
              })
            }}
          >
            Top
          </button>
          <button
            className={`bn-demo-button ${
              accountCenterPosition === 'bottomRight'
                ? 'selected-toggle-btn'
                : 'unselected-toggle-btn'
            }`}
            onClick={() => {
              setAccountCenterPosition('bottomRight')
              updateAccountCenter({
                position: 'bottomRight'
              })
            }}
          >
            Bottom
          </button>
        </div>
      )
    }
    return (
      <div className={'conditional-ui-settings'}>
        {' '}
        <h3>Account Center Positioning</h3>
        <button
          className={`bn-demo-button ${
            accountCenterPosition === 'topLeft'
              ? 'selected-toggle-btn'
              : 'unselected-toggle-btn'
          }`}
          onClick={() => {
            setAccountCenterPosition('topLeft')
            updateAccountCenter({
              position: 'topLeft'
            })
          }}
        >
          Top Left
        </button>
        <button
          className={`bn-demo-button ${
            accountCenterPosition === 'topRight'
              ? 'selected-toggle-btn'
              : 'unselected-toggle-btn'
          }`}
          onClick={() => {
            setAccountCenterPosition('topRight')
            updateAccountCenter({
              position: 'topRight'
            })
          }}
        >
          Top Right
        </button>
        <button
          className={`bn-demo-button ${
            accountCenterPosition === 'bottomRight'
              ? 'selected-toggle-btn'
              : 'unselected-toggle-btn'
          }`}
          onClick={() => {
            setAccountCenterPosition('bottomRight')
            updateAccountCenter({
              position: 'bottomRight'
            })
          }}
        >
          Bottom Right
        </button>
        <button
          className={`bn-demo-button ${
            accountCenterPosition === 'bottomLeft'
              ? 'selected-toggle-btn'
              : 'unselected-toggle-btn'
          }`}
          onClick={() => {
            setAccountCenterPosition('bottomLeft')
            updateAccountCenter({
              position: 'bottomLeft'
            })
          }}
        >
          Bottom Left
        </button>
      </div>
    )
  }

  if (!web3Onboard) return <div>Loading...</div>

  return (
    <main>
      <Header
        connectedChain={wallet ? connectedChain : null}
        address={wallet?.accounts[0]?.address}
        balance={wallet?.accounts[0]?.balance}
        ens={wallet?.accounts[0]?.ens}
      />
      <section className="main">
        <div className="main-content">
          <div className="vertical-main-container">
            <div className="container onboard">
              <h2>Onboarding Users with Web3-Onboard</h2>
              {wallet && (
                <div className="network-select">
                  <label>Switch Chains</label>
                  {settingChain ? (
                    <span>Switching Chains...</span>
                  ) : (
                    <select
                      className="chain-select"
                      onChange={({ target: { value } }) =>
                        setChain({ chainId: value })
                      }
                      value={connectedChain?.id}
                    >
                      {chains.map(({ id, label }) => {
                        return (
                          <option value={id} key={id}>
                            {label}
                          </option>
                        )
                      })}
                    </select>
                  )}
                </div>
              )}
              <div className="account-center-actions">
                <div>
                  {!wallet && (
                    <button
                      className="bn-demo-button"
                      onClick={async () => {
                        const walletsConnected = await connect()
                        console.log('connected wallets: ', walletsConnected)
                      }}
                    >
                      Select a Wallet
                    </button>
                  )}

                  {wallet && (
                    <button
                      className="bn-demo-button"
                      onClick={async () => {
                        const walletsConnected = await connect()
                        console.log('connected wallets: ', walletsConnected)
                      }}
                    >
                      Connect Another Wallet
                    </button>
                  )}

                  {wallet && (
                    <button
                      className="bn-demo-button"
                      onClick={async () => {
                        const walletsConnected = await disconnect(wallet)
                        console.log('connected wallets: ', walletsConnected)
                        window.localStorage.removeItem('connectedWallets')
                      }}
                    >
                      Reset Wallet State
                    </button>
                  )}
                  {wallet && wallet?.dashboard && (
                    <button
                      className="bn-demo-button"
                      onClick={wallet?.dashboard}
                    >
                      Open Wallet Dashboard
                    </button>
                  )}
                  {wallet &&
                    wallet?.type === 'hardware' &&
                    wallet.accounts[0].address && (
                      <button
                        className="bn-demo-button"
                        onClick={web3Onboard.accountSelect}
                      >
                        Switch Account
                      </button>
                    )}
                </div>
                <div>
                  {wallet && (
                    // If providing a DAppId w/ Notifications enabled within the
                    // onboard initialization balances are updated automatically
                    <button
                      className="bn-demo-button"
                      onClick={() => updateBalances}
                    >
                      Update Balances
                    </button>
                  )}
                  {wallet && (
                    <button
                      className="bn-demo-button"
                      onClick={e => {
                        updateLocale(locale === 'es' ? 'en' : 'es')
                        setLocale(locale === 'es' ? 'en' : 'es')
                        updateAccountCenter({ expanded: true })
                        e.stopPropagation()
                      }}
                    >
                      Set Locale To {locale === 'es' ? 'English' : 'Spanish'}
                    </button>
                  )}
                  {wallet && (
                    <button
                      className="bn-demo-button"
                      onClick={e => {
                        setAccountCenterSize(prevState => {
                          return prevState === 'minimal'
                            ? 'normal'
                            : prevState === 'normal'
                            ? 'expanded'
                            : 'minimal'
                        })
                        updateAccountCenter(
                          accountCenterSize === 'minimal'
                            ? { minimal: false }
                            : accountCenterSize === 'normal'
                            ? { minimal: true, expanded: true }
                            : { minimal: true, expanded: false }
                        )
                        e.stopPropagation()
                      }}
                    >
                      Set Account Center To{' '}
                      {accountCenterSize === 'minimal'
                        ? 'Collapsed'
                        : accountCenterSize === 'normal'
                        ? 'Expanded'
                        : 'Minimal'}
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="container notify">
              <h2>Transaction Preview Example</h2>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  marginBottom: '1rem'
                }}
              >
                <div style={{ marginBottom: '1rem' }}>
                  <label>
                    Swap
                    <input
                      type="number"
                      style={{
                        padding: '0.5rem',
                        border: 'none',
                        borderRadius: '10px',
                        marginLeft: '0.5rem',
                        width: '2rem'
                      }}
                      onChange={e => setTradeAmount(e.target.value)}
                    ></input>{' '}
                    1inch tokens for ETH:
                  </label>
                </div>
                <div
                  className={'send-transaction-container'}
                  style={{ margin: 'auto' }}
                >
                  <button
                    className="bn-demo-button"
                    onClick={async () => {
                      swapTokens()
                    }}
                  >
                    Swap
                  </button>
                </div>
              </div>
            </div>
            <div className="container notify">
              <h2>Transaction Notifications with Notify</h2>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  marginBottom: '1rem'
                }}
              >
                <div style={{ marginBottom: '1rem' }}>
                  <label>
                    Send 0.001{' '}
                    <select
                      onChange={({ target: { value } }) => setToChain(value)}
                      value={toChain}
                    >
                      {chains.map(({ id, label }) => {
                        if (
                          label === 'Goerli' ||
                          label === 'Polygon - Mumbai'
                        ) {
                          return (
                            <option value={id} key={id}>
                              {label}
                            </option>
                          )
                        }
                        return null
                      })}
                    </select>{' '}
                    Test Eth to:
                  </label>
                  <input
                    type="text"
                    style={{
                      padding: '0.5rem',
                      border: 'none',
                      borderRadius: '10px',
                      marginLeft: '0.5rem',
                      width: '18rem'
                    }}
                    value={toAddress}
                    placeholder="address"
                    onChange={e => setToAddress(e.target.value)}
                  />
                </div>
                <div className={'send-transaction-container'}>
                  <button
                    className="bn-demo-button"
                    onClick={async () => {
                      const ready = await readyToTransact()
                      if (!ready) return
                      sendHash()
                    }}
                  >
                    Send
                  </button>
                  with in-flight notifications
                </div>
                <div className={'send-transaction-container'}>
                  <button
                    className="bn-demo-button"
                    onClick={async () => {
                      const ready = await readyToTransact()
                      if (!ready) return
                      sendTransaction()
                    }}
                  >
                    Send
                  </button>
                  with pre-flight and in-flight notifications
                </div>
              </div>
              <div>
                <button
                  className="bn-demo-button"
                  onClick={() => {
                    const { update, dismiss } = customNotification({
                      eventCode: 'dbUpdate',
                      type: 'hint',
                      message: 'Custom hint notification created by the dapp',
                      onClick: () => window.open(`https://www.blocknative.com`)
                    })
                    // Update your notification example below
                    // setTimeout(
                    //   () =>
                    //     update({
                    //       eventCode: 'dbUpdateSuccess',
                    //       message: 'Hint notification reason resolved!',
                    //       type: 'success',
                    //       autoDismiss: 5000
                    //     }),
                    //   4000
                    // )
                    setTimeout(
                      () =>
                        // use the dismiss method returned or add an autoDismiss prop to the notification
                        dismiss(),
                      4000
                    )
                  }}
                >
                  Custom Hint Notification
                </button>
              </div>
            </div>
          </div>
          <div className="container ui-settings">{renderNotifySettings()}</div>
          <div className="container ui-settings">
            {renderAccountCenterSettings()}
          </div>
        </div>
        {bnGasPrices && (
          <div className="bn-gas-container">
            Web3-Onboard Gas Package Mainnet Pricing
            <div className="bn-gas">
              {bnGasPrices.map(conf => {
                return (
                  <div className="gas-container" key={conf.confidence}>
                    {gasView(conf)}
                    {rpcInfuraGasPrices && (
                      <section>gwei saved : {gasDiff(conf).toFixed(3)}</section>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
        {rpcInfuraGasPrices && (
          <div className="rpc-gas-container">
            Ethers.js Mainnet Gas Pricing
            <div className="gas-container rpc-gas">
              {gasView(rpcInfuraGasPrices)}
            </div>
          </div>
        )}
      </section>
      <Footer />
    </main>
  )
}

export default App

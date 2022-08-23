import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import VConsole from 'vconsole'
import { initWeb3Onboard } from './services'
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

const internalTransferABI = [
  {
    inputs: [
      {
        internalType: 'address payable',
        name: 'to',
        type: 'address'
      }
    ],
    name: 'internalTransfer',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  }
]

let internalTransferContract

const App = () => {
  const [{ wallet }, connect, disconnect, updateBalances, setWalletModules] =
    useConnectWallet()
  const [{ chains, connectedChain, settingChain }, setChain] = useSetChain()
  const [notifications, customNotification, updateNotify] = useNotifications()
  const connectedWallets = useWallets()
  const updateAccountCenter = useAccountCenter()
  const updateLocale = useSetLocale()

  const [web3Onboard, setWeb3Onboard] = useState(null)

  const [toAddress, setToAddress] = useState('')
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
    window.localStorage.setItem(
      'connectedWallets',
      JSON.stringify(connectedWalletsLabelArray)
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

      internalTransferContract = new ethers.Contract(
        '0xb8c12850827ded46b9ded8c1b6373da0c4d60370',
        internalTransferABI,
        provider.getUncheckedSigner()
      )
    }
  }, [wallet])

  useEffect(() => {
    const previouslyConnectedWallets = JSON.parse(
      window.localStorage.getItem('connectedWallets')
    )

    if (previouslyConnectedWallets?.length) {
      async function setWalletFromLocalStorage() {
        const walletConnected = await connect({
          autoSelect: previouslyConnectedWallets[0]
        })
        console.log('connected wallets: ', walletConnected)
      }
      setWalletFromLocalStorage()
    }
  }, [connect])

  const readyToTransact = async () => {
    if (!wallet) {
      const walletSelected = await connect()
      if (!walletSelected) return false
    }
    // prompt user to switch to Rinkeby for test
    await setChain({ chainId: '0x4' })

    return true
  }

  const sendHash = async () => {
    if (!toAddress) {
      alert('An Ethereum address to send Eth to is required.')
      return
    }

    const signer = provider.getUncheckedSigner()

    await signer.sendTransaction({
      to: toAddress,
      value: 1000000000000000
    })
  }

  const sendInternalTransaction = async () => {
    if (!toAddress) {
      alert('An Ethereum address to send Eth to is required.')
      return
    }

    await internalTransferContract.internalTransfer(toAddress, {
      value: 1000000000000000
    })
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
                  <label>Send 0.001 Rinkeby Eth to:</label>
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
                <div className={'send-transaction-container'}>
                  <button
                    className="bn-demo-button"
                    onClick={async () => {
                      const ready = await readyToTransact()
                      if (!ready) return
                      sendInternalTransaction()
                    }}
                  >
                    Send
                  </button>
                  via an internal transaction
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
      </section>
      <Footer />
    </main>
  )
}

export default App

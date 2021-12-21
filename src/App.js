import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import VConsole from 'vconsole'
import { initOnboard, initNotify } from './services'
import networkEnum from './networkEnum'
import BNLogo from './icons/blocknative-logo-dark.svg'
import avatarPlaceholder from './icons/avatar-placeholder.png'
import Footer from './views/Footer/Footer.js'
import './App.css'

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
  const [address, setAddress] = useState(null)
  const [ens, setEns] = useState(null)
  const [network, setNetwork] = useState(null)
  const [balance, setBalance] = useState(null)
  const [wallet, setWallet] = useState({})

  const [onboard, setOnboard] = useState(null)
  const [notify, setNotify] = useState(null)

  const [darkMode, setDarkMode] = useState(false)
  const [desktopPosition, setDesktopPosition] = useState('bottomRight')
  const [mobilePosition, setMobilePosition] = useState('top')

  const [toAddress, setToAddress] = useState('')

  useEffect(() => {
    const onboard = initOnboard({
      address: setAddress,
      ens: setEns,
      network: setNetwork,
      balance: setBalance,
      wallet: wallet => {
        if (wallet.provider) {
          setWallet(wallet)

          provider = new ethers.providers.Web3Provider(wallet.provider, 'any')

          internalTransferContract = new ethers.Contract(
            '0xb8c12850827ded46b9ded8c1b6373da0c4d60370',
            internalTransferABI,
            provider.getUncheckedSigner()
          )

          window.localStorage.setItem('selectedWallet', wallet.name)
        } else {
          provider = null
          setWallet({})
        }
      }
    })

    setOnboard(onboard)

    setNotify(initNotify())
  }, [])

  useEffect(() => {
    const previouslySelectedWallet =
      window.localStorage.getItem('selectedWallet')

    if (previouslySelectedWallet && onboard) {
      onboard.walletSelect(previouslySelectedWallet)
    }
  }, [onboard])

  const readyToTransact = async () => {
    if (!provider) {
      const walletSelected = await onboard.walletSelect()
      if (!walletSelected) return false
    }

    const ready = await onboard.walletCheck()
    return ready
  }

  const sendHash = async () => {
    if (!toAddress) {
      alert('An Ethereum address to send Eth to is required.')
      return
    }

    const signer = provider.getUncheckedSigner()

    const { hash } = await signer.sendTransaction({
      to: toAddress,
      value: 1000000000000000
    })

    const { emitter } = notify.hash(hash)

    emitter.on('txPool', transaction => {
      return {
        // message: `Your transaction is pending, click <a href="https://rinkeby.etherscan.io/tx/${transaction.hash}" rel="noopener noreferrer" target="_blank">here</a> for more info.`,
        // or you could use onclick for when someone clicks on the notification itself
        onclick: () =>
          window.open(`https://rinkeby.etherscan.io/tx/${transaction.hash}`)
      }
    })

    emitter.on('txSent', console.log)
    emitter.on('txConfirmed', console.log)
    emitter.on('txSpeedUp', console.log)
    emitter.on('txCancel', console.log)
    emitter.on('txFailed', console.log)
  }

  const sendInternalTransaction = async () => {
    if (!toAddress) {
      alert('An Ethereum address to send Eth to is required.')
      return
    }

    const { hash } = await internalTransferContract.internalTransfer(
      toAddress,
      {
        value: 1000000000000000
      }
    )

    const { emitter } = notify.hash(hash)

    emitter.on('txSent', console.log)
    emitter.on('txPool', console.log)
    emitter.on('txConfirmed', console.log)
    emitter.on('txSpeedUp', console.log)
    emitter.on('txCancel', console.log)
    emitter.on('txFailed', console.log)
  }

  const sendTransaction = async () => {
    if (!toAddress) {
      alert('An Ethereum address to send Eth to is required.')
    }

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

    const { emitter } = await notify.transaction({
      sendTransaction,
      gasPrice,
      estimateGas,
      balance: onboard.getState().balance,
      txDetails
    })

    emitter.on('txRequest', console.log)
    emitter.on('nsfFail', console.log)
    emitter.on('txRepeat', console.log)
    emitter.on('txAwaitingApproval', console.log)
    emitter.on('txConfirmReminder', console.log)
    emitter.on('txSendFail', console.log)
    emitter.on('txError', console.log)
    emitter.on('txUnderPriced', console.log)
    emitter.on('txSent', console.log)
    emitter.on('txPool', console.log)
    emitter.on('txConfirmed', console.log)
    emitter.on('txSpeedUp', console.log)
    emitter.on('txCancel', console.log)
    emitter.on('txFailed', console.log)
  }

  const renderDeviceSettings = () => {
    if (window.innerWidth < 700) {
      return (
        <div className={'conditional-ui-settings'}>
          <h3>Notify Mobile Positioning</h3>
          <button
            className={`bn-demo-button ${
              mobilePosition === 'top'
                ? 'selected-toggle-btn'
                : 'unselected-toggle-btn'
            }`}
            onClick={() => {
              setMobilePosition('top')
              notify.config({ mobilePosition: 'top' })
            }}
          >
            Top
          </button>
          <button
            className={`bn-demo-button ${
              mobilePosition === 'bottom'
                ? 'selected-toggle-btn'
                : 'unselected-toggle-btn'
            }`}
            onClick={() => {
              setMobilePosition('bottom')
              notify.config({ mobilePosition: 'bottom' })
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
        <h3>Notify Desktop Positioning</h3>
        <button
          className={`bn-demo-button ${
            desktopPosition === 'topLeft'
              ? 'selected-toggle-btn'
              : 'unselected-toggle-btn'
          }`}
          onClick={() => {
            setDesktopPosition('topLeft')
            notify.config({ desktopPosition: 'topLeft' })
          }}
        >
          Top Left
        </button>
        <button
          className={`bn-demo-button ${
            desktopPosition === 'topRight'
              ? 'selected-toggle-btn'
              : 'unselected-toggle-btn'
          }`}
          onClick={() => {
            setDesktopPosition('topRight')
            notify.config({ desktopPosition: 'topRight' })
          }}
        >
          Top Right
        </button>
        <button
          className={`bn-demo-button ${
            desktopPosition === 'bottomRight'
              ? 'selected-toggle-btn'
              : 'unselected-toggle-btn'
          }`}
          onClick={() => {
            setDesktopPosition('bottomRight')
            notify.config({ desktopPosition: 'bottomRight' })
          }}
        >
          Bottom Right
        </button>
        <button
          className={`bn-demo-button ${
            desktopPosition === 'bottomLeft'
              ? 'selected-toggle-btn'
              : 'unselected-toggle-btn'
          }`}
          onClick={() => {
            setDesktopPosition('bottomLeft')
            notify.config({ desktopPosition: 'bottomLeft' })
          }}
        >
          Bottom Left
        </button>
      </div>
    )
  }

  if (!onboard || !notify) return <div>Loading...</div>

  return (
    <main>
      <header className="user-info-container">
      <a className='bn-logo-link'
          href="https://www.blocknative.com/"
          target="_blank"
          rel="noopener noreferrer"
          title="Blocknative Site">
          <img className="bn-logo-demo" src={BNLogo} alt="Block Native Logo" />
        </a>
        <div className="user-info">
          {ens?.name ? (
            <span>
              <img
                className="user-avatar"
                src={ens.avatar ? ens.avatar : avatarPlaceholder}
                alt="avatar"
              ></img>
              <div
                style={{
                  marginLeft: '10px'
                }}
              >
                {ens.name}
              </div>
            </span>
          ) : (
            address && <span className="user-address">{address}</span>
          )}
          {balance != null && (
            <span>
              {Number(balance) > 0 ? balance / 1000000000000000000 : balance}{' '}
              ETH
            </span>
          )}
          {network && (
            <span>{networkEnum?.[Number(network)] || 'local'} Network</span>
          )}
        </div>
      </header>
      <section className="main">
        <div className="main-content">
          <div className="vertical-main-container">
            <div className="container onboard">
              <h2>Onboarding Users with Onboard</h2>
              <div>
                {!wallet.provider && (
                  <button
                    className="bn-demo-button"
                    onClick={() => {
                      onboard.walletSelect()
                    }}
                  >
                    Select a Wallet
                  </button>
                )}

                {wallet.provider && (
                  <button
                    className="bn-demo-button"
                    onClick={onboard.walletCheck}
                  >
                    Wallet Checks
                  </button>
                )}

                {wallet.provider && (
                  <button
                    className="bn-demo-button"
                    onClick={onboard.walletSelect}
                  >
                    Switch Wallets
                  </button>
                )}

                {wallet.provider && (
                  <button
                    className="bn-demo-button"
                    onClick={onboard.walletReset}
                  >
                    Reset Wallet State
                  </button>
                )}
                {wallet.provider && wallet.dashboard && (
                  <button className="bn-demo-button" onClick={wallet.dashboard}>
                    Open Wallet Dashboard
                  </button>
                )}
                {wallet.provider && wallet.type === 'hardware' && address && (
                  <button
                    className="bn-demo-button"
                    onClick={onboard.accountSelect}
                  >
                    Switch Account
                  </button>
                )}
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
                  via a internal transaction
                </div>
              </div>
              <div>
                <button
                  className="bn-demo-button"
                  onClick={async () => {
                    if (!address) {
                      await readyToTransact()
                    }

                    address && notify.account(address)
                  }}
                >
                  Watch Current Account
                </button>
                <button
                  className="bn-demo-button"
                  onClick={async () => {
                    if (!address) {
                      await readyToTransact()
                    }

                    address && notify.unsubscribe(address)
                  }}
                >
                  Un-watch Current Account
                </button>
                <button
                  className="bn-demo-button"
                  onClick={() => {
                    const { update } = notify.notification({
                      eventCode: 'dbUpdate',
                      type: 'pending',
                      message:
                        'This is a custom notification triggered by the dapp'
                    })
                    setTimeout(
                      () =>
                        update({
                          eventCode: 'dbUpdateSuccess',
                          message: 'Updated status for custom notification',
                          type: 'success'
                        }),
                      4000
                    )
                  }}
                >
                  Custom Notification
                </button>
              </div>
            </div>
          </div>
          <div className="container ui-settings">
            <h3>Onboard / Notify UI Settings</h3>
            <button
              className={`bn-demo-button ${
                darkMode ? 'selected-toggle-btn' : 'unselected-toggle-btn'
              }`}
              onClick={() => {
                setDarkMode(true)
                notify.config({ darkMode: true })
                onboard.config({ darkMode: true })
              }}
            >
              Dark Mode
            </button>
            <button
              className={`bn-demo-button ${
                !darkMode ? 'selected-toggle-btn' : 'unselected-toggle-btn'
              }`}
              onClick={() => {
                setDarkMode(false)
                notify.config({ darkMode: false })
                onboard.config({ darkMode: false })
              }}
            >
              Light Mode
            </button>

            {renderDeviceSettings()}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}

export default App

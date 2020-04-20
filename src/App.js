import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import getSigner from './signer'
import { initOnboard, initNotify } from './services'
import { version, dependencies } from '../package.json'
import VConsole from 'vconsole'

import './App.css'

const staging = process.env.REACT_APP_STAGING

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

function App() {
  const [address, setAddress] = useState(null)
  const [network, setNetwork] = useState(null)
  const [balance, setBalance] = useState(null)
  const [wallet, setWallet] = useState(false)

  const [onboard, setOnboard] = useState(null)
  const [notify, setNotify] = useState(null)

  const [darkMode, setDarkMode] = useState(false)
  const [desktopPosition, setDesktopPosition] = useState('bottomRight')
  const [mobilePosition, setMobilePosition] = useState('top')

  const [toAddress, setToAddress] = useState('')

  useEffect(() => {
    const onboard = initOnboard({
      address: setAddress,
      network: setNetwork,
      balance: setBalance,
      wallet: wallet => {
        if (wallet.provider) {
          setWallet(wallet)

          const ethersProvider = new ethers.providers.Web3Provider(
            wallet.provider
          )

          provider = ethersProvider

          internalTransferContract = new ethers.Contract(
            '0xb8c12850827ded46b9ded8c1b6373da0c4d60370',
            internalTransferABI,
            getSigner(ethersProvider)
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
    const previouslySelectedWallet = window.localStorage.getItem(
      'selectedWallet'
    )

    if (previouslySelectedWallet && onboard) {
      onboard.walletSelect(previouslySelectedWallet)
    }
  }, [onboard])

  async function readyToTransact() {
    if (!provider) {
      const walletSelected = await onboard.walletSelect()
      if (!walletSelected) return false
    }

    const ready = await onboard.walletCheck()
    return ready
  }

  async function sendHash() {
    if (!toAddress) {
      alert('An Ethereum address to send Eth to is required.')
      return
    }

    const signer = getSigner(provider)

    const { hash } = await signer.sendTransaction({
      to: toAddress,
      value: 1000000000000000
    })

    const { emitter } = notify.hash(hash)

    emitter.on('txSent', console.log)
    emitter.on('txPool', console.log)
    emitter.on('txConfirmed', console.log)
    emitter.on('txSpeedUp', console.log)
    emitter.on('txCancel', console.log)
    emitter.on('txFailed', console.log)

    // emitter.on("all", event => {
    //   console.log("ALLLLLLL", event)
    // })
  }

  async function sendInternalTransaction() {
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

  async function sendTransaction() {
    if (!toAddress) {
      alert('An Ethereum address to send Eth to is required.')
    }

    const signer = getSigner(provider)

    const txDetails = {
      to: toAddress,
      value: 1000000000000000
    }

    const sendTransaction = () =>
      signer.sendTransaction(txDetails).then(tx => tx.hash)

    const gasPrice = () => provider.getGasPrice().then(res => res.toString())

    const estimateGas = () =>
      provider.estimateGas(txDetails).then(res => res.toString())

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

  return onboard && notify ? (
    <main>
      <header className="user-info">
        {address && <span>{address}</span>}
        {balance != null && (
          <span>
            {Number(balance) > 0 ? balance / 1000000000000000000 : balance} ETH
          </span>
        )}
        {network && <span>{networkName(network)} network</span>}
      </header>
      <section className="main">
        <div className="container">
          <h2>Onboarding Users with Onboard.js</h2>
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
              <button className="bn-demo-button" onClick={onboard.walletCheck}>
                Wallet Checks
              </button>
            )}

            {wallet.provider && (
              <button className="bn-demo-button" onClick={onboard.walletSelect}>
                Switch Wallets
              </button>
            )}

            {wallet.provider && (
              <button className="bn-demo-button" onClick={onboard.walletReset}>
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
        <div className="container">
          <h2>Transaction Notifications with Notify.js</h2>
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
            <div>
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
            <div>
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
            <div>
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
                  message: 'This is a custom notification triggered by the dapp'
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
        <div className="container">
          <h3>UI Settings</h3>
          <button
            className="bn-demo-button"
            style={{
              background: darkMode ? '#ab47bc' : 'white',
              color: darkMode ? 'white' : '#4a90e2'
            }}
            onClick={() => {
              setDarkMode(true)
              notify.config({ darkMode: true })
              onboard.config({ darkMode: true })
            }}
          >
            Dark Mode
          </button>
          <button
            className="bn-demo-button"
            style={{
              background: !darkMode ? '#ab47bc' : 'white',
              color: !darkMode ? 'white' : '#4a90e2'
            }}
            onClick={() => {
              setDarkMode(false)
              notify.config({ darkMode: false })
              onboard.config({ darkMode: false })
            }}
          >
            Light Mode
          </button>
          <h3>Desktop Positioning</h3>
          <button
            className="bn-demo-button"
            style={{
              background: desktopPosition === 'topLeft' ? '#ab47bc' : 'white',
              color: desktopPosition === 'topLeft' ? 'white' : '#4a90e2'
            }}
            onClick={() => {
              setDesktopPosition('topLeft')
              notify.config({ desktopPosition: 'topLeft' })
            }}
          >
            Top Left
          </button>
          <button
            className="bn-demo-button"
            style={{
              background: desktopPosition === 'topRight' ? '#ab47bc' : 'white',
              color: desktopPosition === 'topRight' ? 'white' : '#4a90e2'
            }}
            onClick={() => {
              setDesktopPosition('topRight')
              notify.config({ desktopPosition: 'topRight' })
            }}
          >
            Top Right
          </button>
          <button
            className="bn-demo-button"
            style={{
              background:
                desktopPosition === 'bottomRight' ? '#ab47bc' : 'white',
              color: desktopPosition === 'bottomRight' ? 'white' : '#4a90e2'
            }}
            onClick={() => {
              setDesktopPosition('bottomRight')
              notify.config({ desktopPosition: 'bottomRight' })
            }}
          >
            Bottom Right
          </button>
          <button
            className="bn-demo-button"
            style={{
              background:
                desktopPosition === 'bottomLeft' ? '#ab47bc' : 'white',
              color: desktopPosition === 'bottomLeft' ? 'white' : '#4a90e2'
            }}
            onClick={() => {
              setDesktopPosition('bottomLeft')
              notify.config({ desktopPosition: 'bottomLeft' })
            }}
          >
            Bottom Left
          </button>
          <h3>Mobile Positioning</h3>
          <button
            className="bn-demo-button"
            style={{
              background: mobilePosition === 'top' ? '#ab47bc' : 'white',
              color: mobilePosition === 'top' ? 'white' : '#4a90e2'
            }}
            onClick={() => {
              setMobilePosition('top')
              notify.config({ mobilePosition: 'top' })
            }}
          >
            Top
          </button>
          <button
            className="bn-demo-button"
            style={{
              background: mobilePosition === 'bottom' ? '#ab47bc' : 'white',
              color: mobilePosition === 'bottom' ? 'white' : '#4a90e2'
            }}
            onClick={() => {
              setMobilePosition('bottom')
              notify.config({ mobilePosition: 'bottom' })
            }}
          >
            Bottom
          </button>
        </div>
      </section>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          bottom: '1rem',
          left: '1rem'
        }}
      >
        <span>
          React Demo version: <i>{staging ? 'NEXT' : version}</i>
        </span>
        <span>
          Onboard.js version:{' '}
          <i>{staging ? 'NEXT' : dependencies['bnc-onboard'].slice(1)}</i>
        </span>
        <span>
          Notify.js version:{' '}
          <i>{staging ? 'NEXT' : dependencies['bnc-notify'].slice(1)}</i>
        </span>
      </div>
    </main>
  ) : (
    <div>Loading...</div>
  )
}

function networkName(id) {
  switch (Number(id)) {
    case 1:
      return 'main'
    case 3:
      return 'ropsten'
    case 4:
      return 'rinkeby'
    case 5:
      return 'goerli'
    case 42:
      return 'kovan'
    case 'localhost':
      return 'localhost'
    default:
      return 'local'
  }
}

export default App

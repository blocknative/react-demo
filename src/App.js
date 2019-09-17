import React, { useState, useEffect } from "react"
import { ethers } from "ethers"
import getSigner from "./signer"
import { initOnboard, initNotify } from "./services"

import "./app.css"

let provider

function App() {
  const [address, setAddress] = useState(null)
  const [network, setNetwork] = useState(null)
  const [balance, setBalance] = useState(null)

  const [onboard, setOnboard] = useState(null)
  const [notify, setNotify] = useState(null)

  useEffect(() => {
    setOnboard(
      initOnboard({
        address: setAddress,
        network: setNetwork,
        balance: setBalance,
        provider: p => {
          if (p) {
            provider = new ethers.providers.Web3Provider(p)
          }
        }
      })
    )

    setNotify(initNotify())
  }, [])

  async function readyToTransact() {
    if (!provider) {
      const walletSelected = await onboard.selectWallet()
      if (!walletSelected) return false
    }

    const readyToTransact = await onboard.prepareWallet()
    if (!readyToTransact) return false

    return true
  }

  async function sendHash() {
    const signer = getSigner(provider)

    const { hash } = await signer.sendTransaction({
      to: "0x6A4C1Fc1137C47707a931934c76d884454Ed2915",
      value: 100000000000000
    })

    const emitter = notify.hash(hash)
  }

  async function sendTransaction() {
    const txDetails = {
      to: "0x6A4C1Fc1137C47707a931934c76d884454Ed2915",
      value: 10000
    }

    const signer = getSigner(provider)

    const sendTransaction = () => signer.sendTransaction(txDetails)
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
  }

  return onboard && notify ? (
    <main>
      <section className="container">
        <h2>Onboard</h2>
        <div>
          <button className="bn-demo-button" onClick={onboard.selectWallet}>
            Select Wallet
          </button>

          <button className="bn-demo-button" onClick={onboard.prepareWallet}>
            Prepare Wallet
          </button>
        </div>
      </section>
      <section className="container">
        <h2>Notify</h2>
        <div>
          <button
            className="bn-demo-button"
            onClick={async () => {
              const ready = await readyToTransact()
              if (!ready) return
              sendHash()
            }}
          >
            Hash
          </button>
          <button
            className="bn-demo-button"
            onClick={async () => {
              const ready = await readyToTransact()
              if (!ready) return
              sendTransaction()
            }}
          >
            Transaction
          </button>
          <button
            className="bn-demo-button"
            onClick={async () => {
              if (!provider) {
                const walletSelected = await onboard.selectWallet()
                if (!walletSelected) return false
              }
              notify.account(onboard.getState().address)
            }}
          >
            Watch Current Account
          </button>
        </div>
      </section>
      <section className="container">
        <h2>UI Settings</h2>
        <button
          className="bn-demo-button"
          onClick={() => {
            notify.config({ darkMode: true })
            onboard.config({ darkMode: true })
          }}
        >
          Dark Mode
        </button>
        <button
          className="bn-demo-button"
          onClick={() => {
            notify.config({ darkMode: false })
            onboard.config({ darkMode: false })
          }}
        >
          Light Mode
        </button>
      </section>
      <aside className="user-info">
        {address && <span>{address}</span>}
        {balance != null && (
          <span>
            {balance > 0 ? balance / 1000000000000000000 : balance}
            ETH
          </span>
        )}
        {network && <span>{networkName(network)}</span>}
      </aside>
    </main>
  ) : (
    <div>Loading...</div>
  )
}

function networkName(id) {
  switch (Number(id)) {
    case 1:
      return "main"
    case 3:
      return "ropsten"
    case 4:
      return "rinkeby"
    case 5:
      return "goerli"
    case 42:
      return "kovan"
    case "localhost":
      return "localhost"
    default:
      return "local"
  }
}

export default App

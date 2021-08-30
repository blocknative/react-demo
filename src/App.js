import React, { useState, useEffect } from 'react'

import { ethers } from 'ethers'
import VConsole from 'vconsole'
import getSigner from './signer'
import { initOnboard, initNotify } from './services'
import { version, dependencies } from '../package.json'
import avatarPlaceholder from './avatar-placeholder.png'
import {
  web3Accounts,
  web3Enable,
  web3AccountsSubscribe,
  web3FromSource

} from '@polkadot/extension-dapp';

import { ApiPromise, WsProvider } from '@polkadot/api';

import {
  Connection,
  PublicKey,
  Transaction,
  clusterApiUrl,
  SystemProgram
} from "@solana/web3.js";

import './App.css'

const staging = process.env.REACT_APP_STAGING

if (window.innerWidth < 700) {
  new VConsole()
}

let provider = {
  ETHEREUM: null,
  SOLANA: null,
  POLKADOT: null
}

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
  const [ens, setEns] = useState(null)
  const [asset, setAsset] = useState(null)
  const [network, setNetwork] = useState(null)
  const [balance, setBalance] = useState(null)
  const [wallet, setWallet] = useState({})
  //const [phantom, setPhantom] = useState(null)
  //const [polkadot, setPolkadot] = useState(null)

  const [ethereum, setEthereum] = useState(null)
  const [notify, setNotify] = useState(null)

  const [darkMode, setDarkMode] = useState(false)
  const [desktopPosition, setDesktopPosition] = useState('bottomRight')
  const [mobilePosition, setMobilePosition] = useState('top')

  const [toAddress, setToAddress] = useState('')

  useEffect(() => {
    const ethereum = initOnboard({
      address: setAddress,
      ens: setEns,
      network: setNetwork,
      balance: setBalance,
      wallet: wallet => {
        if (wallet.provider) {
          setWallet(wallet)

          const ethersProvider = new ethers.providers.Web3Provider(
            wallet.provider
          )

          provider.ETHEREUM = ethersProvider
          setAsset('ETH')

          internalTransferContract = new ethers.Contract(
            '0xb8c12850827ded46b9ded8c1b6373da0c4d60370',
            internalTransferABI,
            getSigner(ethersProvider)
          )

          window.localStorage.setItem('selectedWallet', wallet.name)
        } else {
          provider.ETHEREUM = null
          setWallet({})
        }
      }
    })

    setEthereum(ethereum)

    setNotify(initNotify())
  }, [])

  useEffect(() => {
    const previouslySelectedWallet = window.localStorage.getItem(
      'selectedWallet'
    )

    if (previouslySelectedWallet && ethereum) {
      ethereum.walletSelect(previouslySelectedWallet)
    }
  }, [ethereum])

  const getSolanaProvider = () => {
    if ("solana" in window) {
      const provider = window.solana;
      if (provider.isPhantom) {
        return provider;
      }
    }
    window.open("https://phantom.app/", "_blank");
  };


  const polkadot = async () => {
    // useEffect does not play nice w/ await/async. Ruined my life.
    if (!!!provider.POLKADOT) {
      setBalance(0)
      let extensions = await web3Enable('React Demo')
      if (extensions.length === 0) {
        // this means no web3 wallet is there or the user denied connecting * sad face *
        return
      }

      // set the polkadot provider
      provider.POLKADOT = extensions[0]
      let allAccounts = await web3Accounts()

      // get and set the Polkadot address
      provider.POLKADOT.address = allAccounts[0].address
      setAddress(provider.POLKADOT.address)

      // for use during signing a new transaction
      provider.POLKADOT.account = allAccounts[0]

      setAsset('DOT')
      setNetwork(7)
      const wsProvider = new WsProvider('wss://rpc.polkadot.io');
      const api = await ApiPromise.create({ provider: wsProvider })
      const data = await api.query.system.account(provider.POLKADOT.address)

      console.dir('Polkadot account information')
      setBalance(0)
      setBalance(Number(data.data.free) * 10e7)
      return
    }
  }

  const phantom = async () => {
    const NETWORK = clusterApiUrl('mainnet-beta')
    if ("solana" in window) {
      window.solana.connect()
      window.solana.on("connect", async () => {
        console.log("connected to phantom wallet")
        let address = window.solana.publicKey.toString()
        setAddress(address)
        provider.SOLANA = getSolanaProvider()
        provider.SOLANA.connection = new Connection("https://api.mainnet-beta.solana.com")
        console.dir(provider.SOLANA)
        setNetwork(6)
        setAsset('SOL')
        if (!!address) {
          let balance = await provider.SOLANA.connection.getBalance(window.solana.publicKey)
          setBalance(balance * 10e8)
        }
      })

    }
  }


  const createSolanaTransaction = async () => {
    if (!provider.SOLANA.publicKey) {
      return
    }
    let balance = await(provider.SOLANA.connection.getBalance(provider.SOLANA.publicKey))
    console.dir(balance)
    let transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: provider.SOLANA.publicKey,
        toPubkey: provider.SOLANA.publicKey,
        lamports: 1
      })
    )
    transaction.feePayer = provider.SOLANA.publicKey;
    console.log("Getting recent blockhash");
    let blockhash = (await provider.SOLANA.connection.getRecentBlockhash()).blockhash
    transaction.recentBlockhash = blockhash
    return transaction
  }

  const sendPolkadotTransaction = async () => {
    const wsProvider = new WsProvider('wss://rpc.polkadot.io');
    const api = await ApiPromise.create({ provider: wsProvider });
    const transferExtrinsic = api.tx.balances.transfer(provider.POLKADOT.address, 1)
    const injector = await web3FromSource(provider.POLKADOT.account.meta.source);
    let notified = null

    // Because of the polkadot call back pattern on the signAndSend, need to send something out pre-flight
    const notificationObject = {
      eventCode: 'polkadotTxBuilding',
      type: 'pending',
      message: `Building your transaction`
    }

    const { update } = notify.notification(notificationObject)

    transferExtrinsic.signAndSend(provider.POLKADOT.address, { signer: injector.signer }, ({ status }) => {
      update({
        eventCode: 'polkadotTxPending',
        type: 'pending',
        message: "Sending to the network with " +  "<a href='https://polkascan.io/polkadot/transaction/" + status.hash.toString() + "' target='_blank'>here</a>"
      })

      if (status.isInBlock) {
        console.log(`Completed at block hash #${status.asInBlock.toString()}`);
        update({
          eventCode: 'polkadotTxComplete',
          type: 'success',
          message: "Transaction competed " +  "<a href='https://polkascan.io/polkadot/transaction/" + status.hash.toString() + "' target='_blank'>here</a>"
        })
      } else {
        console.log(`Current status: ${status.type}`);
      }
    }).catch((error: any) => {
      console.log(':( transaction failed', error);
    });
  }

  const sendSolanaTransaction = async () => {
    const transaction = await createSolanaTransaction()
    if (transaction) {
      try {
        let signed = await provider.SOLANA.signTransaction(transaction)
        console.log("Got signature, submitting transaction")
        let signature = await provider.SOLANA.connection.sendRawTransaction(signed.serialize())
        console.log(
          "Submitted transaction " + signature + ", awaiting confirmation"
        );
        const { update } = notify.notification({
          eventCode: 'solanaTxPending',
          type: 'pending',
          message: "Transaction sent to Solana mainnet using phantom app " + "<a href='https://solanabeach.io/transaction/" + signature + "' target='_blank'>here</a>"
        })

        await provider.SOLANA.connection.confirmTransaction(signature)
        update({
          eventCode: 'solanaTxSuccess',
          message: "Transaction confirmed on solana " + "<a href='https://solanabeach.io/transaction/" + signature + "' target='_blank'>here</a>",
          type: 'success'
        })
        console.log("Transaction " + signature + " confirmed")
      } catch (e) {
        console.warn(e);
        console.log("Error: " + e.message)
        console.log("Error: " + e.message)
      }
    }
  };

  const resetPhantom = async() => {
    window.solana.disconnect()
    provider.SOLANA = null
    setAddress('')
    setNetwork('')
    setBalance(null)
    setAsset(null)
  }

  const resetPolkadot = async() => {
    provider.POLKADOT = null
    setAddress('')
    setNetwork('')
    setBalance(null)
    setAsset(null)
    let unsubscribe; // this is the function of type `() => void` that should be called to unsubscribe

    // we subscribe to any account change and log the new list.
    // note that `web3AccountsSubscribe` returns the function to unsubscribe
    unsubscribe = await web3AccountsSubscribe(( injectedAccounts ) => {
      injectedAccounts.map(( accounts ) => {
        console.log(accounts.address);
      })
    });

    // don't forget to unsubscribe when needed, e.g when unmounting a component
    unsubscribe && unsubscribe();
  }

  const readyToTransact = async() => {
    if (!provider.ETHEREUM) {
      const walletSelected = await ethereum.walletSelect()
      if (!walletSelected) return false
    }

    const ready = await ethereum.walletCheck()
    return ready
  }

  const sendHash = async() => {
    if (!toAddress) {
      alert('An Ethereum address to send Eth to is required.')
      return
    }

    const signer = getSigner(provider.ETHEREUM)

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

  const sendInternalTransaction = async() => {
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

  const sendTransaction = async() => {
    if (!toAddress) {
      alert('An Ethereum address to send Eth to is required.')
      return
    }

    const signer = getSigner(provider.ETHEREUM)

    const txDetails = {
      to: toAddress,
      value: 1000000000000000
    }

    const sendTransaction = () =>
      signer.sendTransaction(txDetails).then(tx => tx.hash)

    const gasPrice = () => provider.ETHEREUM.getGasPrice().then(res => res.toString())

    const estimateGas = () =>
      provider.ETHEREUM.estimateGas(txDetails).then(res => res.toString())

    const { emitter } = await notify.transaction({
      sendTransaction,
      gasPrice,
      estimateGas,
      balance: ethereum.getState().balance,
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

  return ethereum && notify ? (
    <main>
      <header className="user-info">
        {ens && ens.name ? (
          <span>
            <img
              className="user-avatar"
              src={ens.avatar ? ens.avatar : avatarPlaceholder}
              alt="avatar"
            ></img>
            <div style={{
              marginLeft: '10px'
            }}>{ens.name}</div>
          </span>
        ) : (
          address && <span>{address}</span>
        )}
        {balance != null && (
          <div>
          <span>
            {(Number(balance).toFixed(2) > 0 ? (balance / 1000000000000000000).toFixed(2) : balance.toFixed(2)) + ' ' + asset}
          </span>
          </div>
        )}
        {network && <span>{networkName(network)} network</span>}
      </header>
      <section className="main">
        <div className="container">
          <h2>Connect with Ethereum</h2>
          <div>
            {!wallet.provider && (
              <button
                className="bn-demo-button"
                onClick={() => {
                  ethereum.walletSelect()
                }}
              >
                Select a Wallet
              </button>
            )}

            {wallet.provider && (
              <button className="bn-demo-button" onClick={ethereum.walletCheck}>
                Wallet Checks
              </button>
            )}

            {wallet.provider && (
              <button className="bn-demo-button" onClick={ethereum.walletSelect}>
                Switch Wallets
              </button>
            )}

            {wallet.provider && (
              <button className="bn-demo-button" onClick={ethereum.walletReset}>
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
                onClick={ethereum.accountSelect}
              >
                Switch Account
              </button>
            )}
          </div>
          <h2>Connect with Solana</h2>
          <div>

            {!provider.SOLANA && (
              <button
                className="bn-demo-button"
                onClick={phantom}
              >
                Select a Wallet
              </button>
            )}

            {!!provider.SOLANA && (
              <button
                className="bn-demo-button"
                onClick={resetPhantom}
              >
                Disconnect Phantom
              </button>
            )}

          </div>
          <h2>Connect with Polkadot</h2>
          <div>

            {!provider.POLKADOT && (
              <button
                className="bn-demo-button"
                onClick={polkadot}
              >
                Select a Wallet
              </button>
            )}

            {!!provider.POLKADOT &&(
              <button
                className="bn-demo-button"
                onClick={resetPolkadot}
              >
                Disconnect Polkadot
              </button>
            )}

          </div>

        </div>
        <div className="container" style={{width: '70%'}}>
          <div className="container" style={{minWidth: '400px', maxWidth: '500px'}}>
            <div>
              {!provider.ETHEREUM && !provider.SOLANA && !provider.POLKADOT &&(
                <h2>Please select a provider</h2>
              )}
            </div>
            {!!provider.ETHEREUM && (
              <div>
                <h2>Transaction Notifications with Notify</h2>
                <div style={{
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
            )}
            {!!provider.SOLANA && (
              <div>
                <h2>Transaction Notifications with Phantom</h2>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  marginBottom: '1rem'
                }}
                >
                  <div style={{ marginBottom: '1rem' }}>
                    <label>Send 0.001 Solana to:</label>
                    <input
                      type="text"
                      style={{
                        padding: '0.5rem',
                        border: 'none',
                        borderRadius: '10px',
                        marginLeft: '0.5rem',
                        width: '18rem'
                      }}
                      value={!!provider.SOLANA ? provider.SOLANA.publicKey?.toBase58() : ''}
                      placeholder="address"
                      onChange={e => setToAddress(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <button
                    className="bn-demo-button"
                    onClick={async () => {
                      const ready = await sendSolanaTransaction()
                      if (!ready) return
                    }}
                  >
                    Send
                  </button>
                </div>
              </div>
            )}
            {!!provider.POLKADOT && (
              <div>
                <h2>Transaction Notifications with Polkadot</h2>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  marginBottom: '1rem'
                }}
                >
                  <div style={{ marginBottom: '1rem' }}>
                    <label>Send 0.001 DOT to:</label>
                    <input
                      type="text"
                      style={{
                        padding: '0.5rem',
                        border: 'none',
                        borderRadius: '10px',
                        marginLeft: '0.5rem',
                        width: '18rem'
                      }}
                      value={!!provider.POLKADOT ? address : ''}
                      placeholder="address"
                      onChange={e => setToAddress(e.target.value)}
                    />
                    <div>
                      <button
                        className="bn-demo-button"
                        onClick={async () => {
                          const ready = await sendPolkadotTransaction()
                          if (!ready) return
                        }}
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
              ethereum.config({ darkMode: true })
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
              ethereum.config({ darkMode: false })
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
          Onboard version:{' '}
          <i>{staging ? 'NEXT' : dependencies['bnc-onboard'].slice(1)}</i>
        </span>
        <span>
          Notify version:{' '}
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
    case 6:
      return 'solana mainnet-beta'
    case 7:
      return 'polkadot relay chain'
    case 42:
      return 'kovan'
    case 100:
      return 'xdai'
    case 'localhost':
      return 'localhost'
    default:
      return 'local'
  }
}

export default App

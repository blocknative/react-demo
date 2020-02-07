import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import getSigner from "./signer";
import { initOnboard, initNotify } from "./services";

import "./App.css";

function App() {
  const [address, setAddress] = useState(null);
  const [network, setNetwork] = useState(null);
  const [balance, setBalance] = useState(null);

  const [onboard, setOnboard] = useState(null);
  const [notify, setNotify] = useState(null);
  const [provider, setProvider] = useState(null);

  const [darkMode, setDarkMode] = useState(false);
  const [desktopPosition, setDesktopPosition] = useState("bottomRight");
  const [mobilePosition, setMobilePosition] = useState("top");

  useEffect(() => {
    const onboard = initOnboard({
      address: setAddress,
      network: setNetwork,
      balance: setBalance,
      wallet: wallet => {
        if (wallet.provider) {
          setProvider(new ethers.providers.Web3Provider(wallet.provider));
          window.localStorage.setItem("selectedWallet", wallet.name);
        } else {
          setProvider(null);
        }
      }
    });

    setOnboard(onboard);

    setNotify(initNotify());
  }, []);

  useEffect(() => {
    const previouslySelectedWallet = window.localStorage.getItem(
      "selectedWallet"
    );

    if (previouslySelectedWallet && onboard) {
      onboard.walletSelect(previouslySelectedWallet);
    }
  }, [onboard]);

  async function readyToTransact() {
    if (!provider) {
      const walletSelected = await onboard.walletSelect();
      if (!walletSelected) return false;
    }

    const readyToTransact = await onboard.walletCheck();
    if (!readyToTransact) return false;

    return true;
  }

  async function sendHash() {
    const signer = getSigner(provider);
    const { hash } = await signer.sendTransaction({
      to: "0x6A4C1Fc1137C47707a931934c76d884454Ed2915",
      value: 100000
    });
    const { emitter } = notify.hash(hash);

    emitter.on("txSent", console.log);
    emitter.on("txPool", console.log);
    emitter.on("txConfirmed", console.log);
    emitter.on("txSpeedUp", console.log);
    emitter.on("txCancel", console.log);
    emitter.on("txFailed", console.log);

    // emitter.on("all", event => {
    //   console.log("ALLLLLLL", event)
    // })
  }

  async function sendTransaction() {
    const txDetails = {
      to: "0x6A4C1Fc1137C47707a931934c76d884454Ed2915",
      value: 10000
    };

    const signer = getSigner(provider);

    const sendTransaction = () =>
      signer.sendTransaction(txDetails).then(tx => tx.hash);

    const gasPrice = () => provider.getGasPrice().then(res => res.toString());

    const estimateGas = () =>
      provider.estimateGas(txDetails).then(res => res.toString());

    const { emitter, result } = await notify.transaction({
      sendTransaction,
      gasPrice,
      estimateGas,
      balance: onboard.getState().balance,
      txDetails
    });

    emitter.on("txRequest", console.log);
    emitter.on("nsfFail", console.log);
    emitter.on("txRepeat", console.log);
    emitter.on("txAwaitingApproval", console.log);
    emitter.on("txConfirmReminder", console.log);
    emitter.on("txSendFail", console.log);
    emitter.on("txError", console.log);
    emitter.on("txUnderPriced", console.log);
    emitter.on("txSent", console.log);
    emitter.on("txPool", console.log);
    emitter.on("txConfirmed", console.log);
    emitter.on("txSpeedUp", console.log);
    emitter.on("txCancel", console.log);
    emitter.on("txFailed", console.log);
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
          <h2>Onboard</h2>
          <div>
            {!provider && (
              <button className="bn-demo-button" onClick={onboard.walletSelect}>
                Wallet Select
              </button>
            )}

            {provider && (
              <button className="bn-demo-button" onClick={onboard.walletCheck}>
                Wallet Check
              </button>
            )}

            {provider && (
              <button className="bn-demo-button" onClick={onboard.walletSelect}>
                Change Wallet
              </button>
            )}

            {provider && (
              <button className="bn-demo-button" onClick={onboard.walletReset}>
                Reset Wallet
              </button>
            )}
          </div>
        </div>
        <div className="container">
          <h2>Notify</h2>
          <div>
            <button
              className="bn-demo-button"
              onClick={async () => {
                const ready = await readyToTransact();
                if (!ready) return;
                sendHash();
              }}
            >
              Hash
            </button>
            <button
              className="bn-demo-button"
              onClick={async () => {
                const ready = await readyToTransact();
                if (!ready) return;
                sendTransaction();
              }}
            >
              Transaction
            </button>
            <button
              className="bn-demo-button"
              onClick={async () => {
                if (!address) {
                 await readyToTransact()
                }
                
                address && notify.account(address);
              }}
            >
              Watch Address
            </button>
            <button
              className="bn-demo-button"
              onClick={() => {
                const { update } = notify.notification({
                  eventCode: "dbUpdate",
                  type: "pending",
                  message: "This is a custom notification triggered by the dapp"
                });
                setTimeout(
                  () =>
                    update({
                      eventCode: "dbUpdateSuccess",
                      message: "Updated status for custom notification",
                      type: "success"
                    }),
                  4000
                );
              }}
            >
              Custom Notification
            </button>
          </div>
        </div>
        <div className="container">
          <h2>UI Settings</h2>
          <button
            className="bn-demo-button"
            style={{
              background: darkMode ? "#ab47bc" : "white",
              color: darkMode ? "white" : "#4a90e2"
            }}
            onClick={() => {
              setDarkMode(true);
              notify.config({ darkMode: true });
              onboard.config({ darkMode: true });
            }}
          >
            Dark Mode
          </button>
          <button
            className="bn-demo-button"
            style={{
              background: !darkMode ? "#ab47bc" : "white",
              color: !darkMode ? "white" : "#4a90e2"
            }}
            onClick={() => {
              setDarkMode(false);
              notify.config({ darkMode: false });
              onboard.config({ darkMode: false });
            }}
          >
            Light Mode
          </button>
          <h3>Desktop Positioning</h3>
          <button
            className="bn-demo-button"
            style={{
              background: desktopPosition === "topLeft" ? "#ab47bc" : "white",
              color: desktopPosition === "topLeft" ? "white" : "#4a90e2"
            }}
            onClick={() => {
              setDesktopPosition("topLeft");
              notify.config({ desktopPosition: "topLeft" });
            }}
          >
            Top Left
          </button>
          <button
            className="bn-demo-button"
            style={{
              background: desktopPosition === "topRight" ? "#ab47bc" : "white",
              color: desktopPosition === "topRight" ? "white" : "#4a90e2"
            }}
            onClick={() => {
              setDesktopPosition("topRight");
              notify.config({ desktopPosition: "topRight" });
            }}
          >
            Top Right
          </button>
          <button
            className="bn-demo-button"
            style={{
              background:
                desktopPosition === "bottomRight" ? "#ab47bc" : "white",
              color: desktopPosition === "bottomRight" ? "white" : "#4a90e2"
            }}
            onClick={() => {
              setDesktopPosition("bottomRight");
              notify.config({ desktopPosition: "bottomRight" });
            }}
          >
            Bottom Right
          </button>
          <button
            className="bn-demo-button"
            style={{
              background:
                desktopPosition === "bottomLeft" ? "#ab47bc" : "white",
              color: desktopPosition === "bottomLeft" ? "white" : "#4a90e2"
            }}
            onClick={() => {
              setDesktopPosition("bottomLeft");
              notify.config({ desktopPosition: "bottomLeft" });
            }}
          >
            Bottom Left
          </button>
          <h3>Mobile Positioning</h3>
          <button
            className="bn-demo-button"
            style={{
              background: mobilePosition === "top" ? "#ab47bc" : "white",
              color: mobilePosition === "top" ? "white" : "#4a90e2"
            }}
            onClick={() => {
              setMobilePosition("top");
              notify.config({ mobilePosition: "top" });
            }}
          >
            Top
          </button>
          <button
            className="bn-demo-button"
            style={{
              background: mobilePosition === "bottom" ? "#ab47bc" : "white",
              color: mobilePosition === "bottom" ? "white" : "#4a90e2"
            }}
            onClick={() => {
              setMobilePosition("bottom");
              notify.config({ mobilePosition: "bottom" });
            }}
          >
            Bottom
          </button>
        </div>
      </section>
    </main>
  ) : (
    <div>Loading...</div>
  );
}

function networkName(id) {
  switch (Number(id)) {
    case 1:
      return "main";
    case 3:
      return "ropsten";
    case 4:
      return "rinkeby";
    case 5:
      return "goerli";
    case 42:
      return "kovan";
    case "localhost":
      return "localhost";
    default:
      return "local";
  }
}

export default App;

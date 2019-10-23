import notify from "bnc-notify"
import onboard from "bnc-onboard"

const { modules, init } = onboard

const NETWORK_ID = 4

export function initOnboard(subscriptions) {
  return init({
    dappId: "12153f55-f29e-4f11-aa07-90f10da5d778",
    networkId: NETWORK_ID,
    subscriptions,
    modules: {
      walletSelect: modules.select.defaults({
        fortmaticInit: { apiKey: "pk_test_886ADCAB855632AA" },
        portisInit: { apiKey: "d7d72646-709a-45ab-aa43-8de5307ae0df" },
        walletConnectInit: { infuraKey: "19ac568d0464497a9451cf9f388de2c3" },
        squarelinkInit: {apiKey: '87288b677f8cfb09a986', networkId: NETWORK_ID},
        networkId: NETWORK_ID
      }),
      walletReady: modules.ready.defaults({
        networkId: NETWORK_ID,
        minimumBalance: '100000'
      })
    }
  })
}

export function initNotify() {
  return notify({
    dappId: "12153f55-f29e-4f11-aa07-90f10da5d778",
    networkId: 4
  })
}

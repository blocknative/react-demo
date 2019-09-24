import notify from "bn-notify"
import onboard from "bn-onboard"
import { initModules as initOnboarding } from "bn-onboarding-modules"
import { initModules as initWallets } from "bn-wallet-modules"

export function initOnboard(subscriptions) {
  return onboard({
    dappId: "12153f55-f29e-4f11-aa07-90f10da5d778",
    networkId: 4,
    subscriptions,
    modules: {
      selectWallet: initWallets({
        fortmaticInit: { apiKey: "pk_test_886ADCAB855632AA" },
        portisInit: { apiKey: "d7d72646-709a-45ab-aa43-8de5307ae0df" },
        walletConnectInit: { infuraKey: "19ac568d0464497a9451cf9f388de2c3" },
        networkId: 4
      }),
      prepareWallet: initOnboarding({
        networkId: 4,
        minimumBalance: "20000000000000000"
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

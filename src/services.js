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
        trezorInit: {
          email: "aaron@flexdapps.com",
          appUrl: "https://flexdapps.com",
          apiKey: "d5e29c9b9a9d4116a7348113f57770a8"
        },
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

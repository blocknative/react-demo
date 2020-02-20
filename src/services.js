import notify from "bnc-notify";
import onboard from "bnc-onboard";

const networkId = 4;

export function initOnboard(subscriptions) {
  return onboard({
    dappId: "12153f55-f29e-4f11-aa07-90f10da5d778",
    networkId,
    subscriptions,
    walletSelect: {
      wallets: [
        { walletName: "metamask" },
        {
          walletName: "trezor",
          appUrl: "https://reactdemo.blocknative.com",
          email: "aaron@blocknative.com",
          rpcUrl:
            "https://rinkeby.infura.io/v3/d5e29c9b9a9d4116a7348113f57770a8"
        },
        {
          walletName: "ledger",
          rpcUrl:
            "https://rinkeby.infura.io/v3/d5e29c9b9a9d4116a7348113f57770a8"
        },
        { walletName: "dapper" },
        { walletName: "coinbase" },
        { walletName: "status" },
        {
          walletName: "portis",
          apiKey: "d7d72646-709a-45ab-aa43-8de5307ae0df"
        },
        { walletName: "fortmatic", apiKey: "pk_test_886ADCAB855632AA" },
        { walletName: "torus" },
        { walletName: "squarelink", apiKey: "87288b677f8cfb09a986" },
        { walletName: "authereum", disableNotifications: true },
        { walletName: "trust" },
        {
          walletName: "walletConnect",
          infuraKey: "d5e29c9b9a9d4116a7348113f57770a8"
        },
        { walletName: "opera" },
        { walletName: "operaTouch" }
      ]
    },
    walletCheck: [
      { checkName: "connect" },
      { checkName: "accounts" },
      { checkName: "network" },
      { checkName: "balance", minimumBalance: "100000" }
    ]
  });
}

export function initNotify() {
  return notify({
    dappId: "12153f55-f29e-4f11-aa07-90f10da5d778",
    networkId
  });
}

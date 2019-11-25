import notify from "bnc-notify";
import onboard from "bnc-onboard";
// import tokenBalance from "./tokenBalance";

const networkId = 4;

export function initOnboard(subscriptions) {
  return onboard({
    dappId: "12153f55-f29e-4f11-aa07-90f10da5d778",
    networkId,
    subscriptions,
    walletSelect: {
      wallets: [
        { walletName: "metamask" },
        { walletName: "dapper" },
        { walletName: "coinbase" },
        {
          walletName: "portis",
          apiKey: "d7d72646-709a-45ab-aa43-8de5307ae0df"
        },
        { walletName: "fortmatic", apiKey: "pk_test_886ADCAB855632AA" },
        { walletName: "squarelink", apiKey: "87288b677f8cfb09a986" },
        { walletName: "authereum" },
        { walletName: "trust" },
        {
          walletName: "walletConnect",
          infuraKey: "d5e29c9b9a9d4116a7348113f57770a8"
        }
      ]
    },
    walletCheck: [
      { checkName: "connect" },
      { checkName: "network" },
      { checkName: "balance", minimumBalance: "100000" }
      // tokenBalance({
      //   tokenAddress: "0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359",
      //   tokenName: "Sai",
      //   minimumBalance: 5
      // })
    ]
  });
}

export function initNotify() {
  return notify({
    dappId: "12153f55-f29e-4f11-aa07-90f10da5d778",
    networkId: 4,
    darkMode: true
  });
}

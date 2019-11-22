import notify from "bnc-notify";
import onboard, { modules } from "bnc-onboard";

const networkId = 4;

export function initOnboard(subscriptions) {
  const wallets = modules.select([
    { name: "metamask" },
    { name: "dapper" },
    { name: "coinbase" },
    {
      name: "portis",
      apiKey: "d7d72646-709a-45ab-aa43-8de5307ae0df",
      networkId
    },
    { name: "fortmatic", apiKey: "pk_test_886ADCAB855632AA", networkId },
    { name: "squarelink", apiKey: "87288b677f8cfb09a986", networkId },
    { name: "authereum", networkId },
    { name: "trust" },
    {
      name: "walletConnect",
      infuraKey: "d5e29c9b9a9d4116a7348113f57770a8",
      networkId
    }
  ]);

  const walletChecks = modules.check([
    { name: "connect" },
    { name: "network", networkId },
    { name: "balance", minimumBalance: "100000000" }
  ]);

  return onboard({
    dappId: "12153f55-f29e-4f11-aa07-90f10da5d778",
    networkId,
    subscriptions,
    modules: {
      walletSelect: {
        heading: "Select a Wallet",
        description: "Please select a wallet to connect to this dapp:",
        wallets
      },
      walletCheck: walletChecks
    }
  });
}

export function initNotify() {
  return notify({
    dappId: "12153f55-f29e-4f11-aa07-90f10da5d778",
    networkId: 4,
    darkMode: true
  });
}

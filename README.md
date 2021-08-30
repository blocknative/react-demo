# React Demo

A repository to demonstrate a basic integration of the following wallets:
- Ethereum with [Onboard](https://github.com/blocknative/onboard) and [Notify](https://github.com/blocknative/onboard) into a React project.
- Solana with [Phantom Wallet](https://phantom.app/)
- Polkadot with [Polkadot.JS](https://polkadot.js.org/extension/) extension

![](/public/img/ethereum.png)
![](/public/img/polkadot.png)
![](/public/img/phantom.png)

## Getting started

**Note: Before starting ensure you've downloaded Metamask, PolkadotJS extenstion and Phantom Wallet**

Clone the repo:

```bash
git clone https://github.com/masonicgit/react-demo.git
```

Navigate to the project directory:

```bash
cd react-demo
```

Install the dependencies:

```bash
yarn
```

Start the development server:

```bash
yarn start
```

The project will be running on [localhost:3000](http://localhost:3000)

### SSL
Some wallets require that the website within which it runs be using a https 
connection. If you are testing one of these wallets, Ledger is one, then you have
two options:
 1. Setup a valid certificate for localhost using [this guide](https://www.freecodecamp.org/news/how-to-set-up-https-locally-with-create-react-app/).
 2. Allow invalid certificates for resources loaded from localhost by navigating here within a chrome based browser: [chrome://flags/#allow-insecure-localhost](chrome://flags/#allow-insecure-localhost)

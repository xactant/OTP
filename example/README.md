# One Time Pad Consumer Example
This application provides an example demonstrating how to read a base64 encoded
WASM file from and Ethereum contract and then load and execute that WASM file.

This example is setup to load the One Time Pad (OTP) application from a target
Enthereum contract and presents the user with a form that will demonstrate
encrypting and decrypting text.

## Prerequisites

1. Node: https://nodejs.org/en/download/
2. NPM: https://www.npmjs.com/get-npm
3. Truffle: https://truffleframework.com/docs/truffle/getting-started/installation
4. Ganache: https://truffleframework.com/ganache
5. The OTP Contract deployed locally on Ganache (see project https://github.com/xactant/OTP/tree/master/loader)
6. MetaMask installed in your favorite browser with a reference to the first
account listed in Ganache.

Note:
```
If you are using Windows you may need to run Truffle commands in PowerShell.
```

## Installation
1. Open a command window (On Windows you may need to use PowerShell)
2. Navigate to the folder the project was deployed to and execute:
  ```
  npm install
  ```
3. Make sure that the truffle-config.js and truffle.js files contain the same
port that Ganache is using.
4. Open your favorite browser and run MetaMask making sure you are referencing
the first account listed in Ganache.
5. Start the application by running the following command:
  ```
  npm run dev
  ```
6. If the application started properly and was able to access the OTP contract
deployed on Ganache the form header should contain the number 110 which is
defined in otpci.js as the application version, the account address, and the
OTP Instance definition. The WASM may take a second to load, esp. if you have
deployed to a test chain. If the `encrypt` button does not respond right away
check the console log. The application spits out a bunch of logging messages
when it loads the WASM assembly. If those are present you should be good to go.

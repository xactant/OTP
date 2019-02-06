# One Time Pad WASM Loader
This project provides a limited demo showing how to load a WASM assembling into
an Ethereum Contract.

## Prerequisites

1. Node: https://nodejs.org/en/download/
2. NPM: https://www.npmjs.com/get-npm
3. Truffle: https://truffleframework.com/docs/truffle/getting-started/installation
4. Ganache: https://truffleframework.com/ganache
5. The OTP Contract deployed locally on Ganache (see project https://github.com/xactant/OTP/edit/master/contract)
6. MetaMask installed in your favorite browser with a reference to the first
account listed in Ganache.

Note:
```
If you are using Windows you may need to run Truffle commands in PowerShell.
```

## installation
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
defined in otpci.js as the application version.

## Upload a WASM Assembly
1. Click on `choose file` and choose the sample base64 encoded WASM data
located in the data folder of the project.
2. In the version text box enter the version number shown in the form header.
3. Block size determines how big each block uploaded to the contract should be.
4. Start is the index of location in the source file (based on Block Size) to
upload next.
5. Clicking on the `load` button uploads the next block. MetaMask should show
a pop-up asking you to confirm the charge (remember this should be pointing to
  Ganache and so costs only play ETH). If successful a message will be
  displayed that the block was uploaded and verified.
6. Repeat number 5 until the whole file has been uploaded.

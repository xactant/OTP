# One Time Pad Application Contract

This truffle project defines a set of Solidity contracts that enable the
decentralized distribution of a WASM application in a manner that allows the
developer to incur the cost of deployment while enabling end users to consume /
execute the deployed WASM application free of charge.

The OTP contract defines a means to deploy versioned instances of a an
application. This means that the contract may contain version 1 of an
application with a status of PROD and then contain a version 2 with a status of
BETA.

The versioning mechanism is very simple allowing version to be added but not
edited (other than updating the status of the instance.) Once a version is
added and the owner begins adding WASM sections the owner should not attempt to
add WASM sections for a previous version.

Note:
```
This first version of the contract does not block an owner from accidently
overlapping WASM blocks from different version.
```

## Prerequisites

1. Node: https://nodejs.org/en/download/
2. NPM: https://www.npmjs.com/get-npm
3. Truffle: https://truffleframework.com/docs/truffle/getting-started/installation
4. Ganache: https://truffleframework.com/ganache

Note:
```
If you are using Windows you may need to run Truffle commands in PowerShell.
```

## Test

Once the prerequisites are installed test the project. Within a command window
navigate to the project folder and the execute the following command:
```
truffle test
```

## Deploy Contract to Ganache
Start the Ganache application. Open a command window (or PowerShell in
Windows) and navigate to the project location. Run the following Truffle
command:
```
truffle migrate --compile-all --reset --network ganache
```

To deploy a WASM application please see the sample application: (Loader){https://github.com/xactant/OTP/tree/master/loader}

To execute a WASM application deployed to the contract please see the sample
application: (Example){https://github.com/xactant/OTP/tree/master/loader}

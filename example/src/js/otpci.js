

OtpCI = {
  web3Provider: null,
  contracts: {},
  account: 0x0,
  accountBalance: 0.00,
  otpAppVersion: '110',
  wasmData: new Observable(),
  workingOtpDef: new Observable(),
  init: function() {
    return OtpCI.initWeb3();
  },

  /// Set up the web3 provider
  initWeb3: function() {
    // Initialize web3 and set the provider to the testRPC.
    if (typeof web3 !== 'undefined') {
      OtpCI.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // set the provider you want from Web3.providers
      OtpCI.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(OtpCI.web3Provider);
    }

    OtpCI.displayAccountInfo();

    return OtpCI.initContract();
  },

  /// Establish a connection to the OTP contract and then load the current
  /// OTP WASM application binary from the contract.
  initContract: function() {
      $.getJSON('Otp.json', function(otpArtifact) {
        // Get the necessary contract artifact file and use it to instantiate a truffle contract abstraction.
        OtpCI.contracts.Otp = TruffleContract(otpArtifact);

        // Set the provider for our contract.
        OtpCI.contracts.Otp.setProvider(OtpCI.web3Provider);

        // Retrieve the article from the smart contract
        return OtpCI.loadWasmData();
      });
  },

  /// Display the Ethereum Wallet Account being used
  displayAccountInfo: function() {
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        OtpCI.account = account;
        //$("#account").text(account);
        web3.eth.getBalance(account, function(err, balance) {
          if (err === null) {
            OtpCI.accountBalance = web3.fromWei(balance, "ether");
            //$("#accountBalance").text(web3.fromWei(balance, "ether") + " ETH");
          }
        });
      }
    });
  },
  /// Load the individual sections of the base64 encoded WASM binary and
  /// assemble into a single string.
  loadWasmData: function() {
    var otpInstance;

    // Obtain contact instance.
    OtpCI.contracts.Otp.deployed().then(function(instance) {
      otpInstance = instance;
      // REtrieve the OTP description data from the contract.
      return instance.getOtpInstance(OtpCI.otpAppVersion);
    }).then(function(otpDef) {
        var startIndex = parseInt(otpDef[3]);
        var endIndex = parseInt(otpDef[4]);
        var size = endIndex - startIndex;
        var promises = [];

        // Broadcast working OTP Definition
        OtpCI.workingOtpDef.setValue(otpDef);

        for (var i = 0; i < size; i++) {
          // Call contract method to retrieve a single wasm section and
          // add to promises array.
          promises.push(OtpCI.loadWasmDatum(otpInstance, i, startIndex + i));
        }

        // Return a promise that will resolve only when all sections have
        // completed loading.
        return Promise.all(promises);
    }).then(function(results) {
      var b64Data = [];

      for(var i = 0; i < results.length; i++) {
        b64Data[results[i].index] = results[i].datum;
      }

      var h = '';
      for(var i = 0; i < results.length; i++) {
        h = h + b64Data[i];
      }

      OtpCI.wasmData.setValue (h);

      return Promise.resolve(h);
    });
  },
  loadWasmDatum: function(inst, index, dataIndex) {
    return inst.getDataum(OtpCI.otpAppVersion, dataIndex)
      .then(function(result){
        return {index: index, datum: result};
      });
  }
};

OtpCI.init();

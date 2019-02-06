/// ==========================================================================
/// MODULE: OTP Contract Interface
/// DESCRIPTION: Defines methods that asychronously connect to the OTP Contract
/// (provided a web3 provider is available) and then attempts to load the OTP
/// WASM from the contract.
///
/// Copyright 2019 by Xactant 42
/// Permission is hereby granted, free of charge, to any person obtaining a
/// copy of this software and associated documentation files (the "Software"),
/// to deal in the Software without restriction, including without limitation
/// the rights to use, copy, modify, merge, publish, distribute, sublicense,
/// and/or sell copies of the Software, and to permit persons to whom the
/// Software is furnished to do so, subject to the following conditions:
///  1. The origin of this source code must not be misrepresented; you must not
///     claim that you wrote the original source code. If you use this source code
///     in a product, an acknowledgment in the product documentation would be
///     appreciated but is not required.
///  2. Altered source versions must be plainly marked as such, and must not be
///     misrepresented as being the original source code.
///  3. This notice may not be removed or altered from any source distribution.
///
/// The above copyright notice and this permission notice shall be included in
/// all copies or substantial portions of the Software.
///
/// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
/// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
/// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
/// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
/// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
/// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
/// DEALINGS IN THE SOFTWARE.
/// ==========================================================================

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

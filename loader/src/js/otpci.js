/// ==========================================================================
/// MODULE: OTP Contract Interface
/// DESCRIPTION:  This module provides a simple method for uploading a base64
/// encoded WASM assembly a block at a time. Once a section is uploaded the
/// application attempts to check that the block was uploaded.
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
  otpAppVersion: '110',
  init: function() {
    return OtpCI.initWeb3();
  },

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

  displayAccountInfo: function() {
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        OtpCI.account = account;
        $("#account").text(account);
        web3.eth.getBalance(account, function(err, balance) {
          if (err === null) {
            $("#accountBalance").text(web3.fromWei(balance, "ether") + " ETH");
          }
        });
      }
    });
  },

  initContract: function() {
    $.getJSON('Otp.json', function(otpArtifact) {
      // Get the necessary contract artifact file and use it to instantiate a truffle contract abstraction.
      OtpCI.contracts.Otp = TruffleContract(otpArtifact);

      // Set the provider for our contract.
      OtpCI.contracts.Otp.setProvider(OtpCI.web3Provider);

      // Retrieve the article from the smart contract
      return OtpCI.createVersion();
    });
  },

  createVersion: function () {
    var otpInstance;
    OtpCI.contracts.Otp.deployed().then(function(instance) {
      otpInstance = instance;
      return otpInstance.getInstanceCount();
    }).then(function(count) {
      console.log("Instance foud: " + count);
      if (count < 1) {
        console.log('No instances found, creating one.')
        return otpInstance.defineOtpInstance(OtpCI.otpAppVersion, 0x3d5ea9cbfd84167f73f07832e55dd216);
      }
      else {
        // The app version exists so do nothing
        return Promise.resolve(1);
      }
    }).then(function(){
      return OtpCI.reloadVersion();
    });

  },
  /// Add a section and verify section was added.
  addDatum: function (version, datum, verifyTarget) {
    var otpInstance;
    var size = 0;
    var lastIndex = 0;

    // Datum cannot be empty
    if (datum.length == 0) {
      console.log('Datum was empty and connt be added.');
      verifyTarget.innerHTML = 'Not Added - empty datum provided.';
      return;
    }
    console.log("Adding: " + datum);
    OtpCI.contracts.Otp.deployed().then(function(instance) {
      otpInstance = instance;
      // Add datum to contract
      return otpInstance.addDatum(version, datum);
    }).then(function() {
      // Retrieve update app instance.
      return otpInstance.getOtpInstance(OtpCI.otpAppVersion);
    }).then(function (result) {
      var startIndex = parseInt(result[3]);
      lastIndex = parseInt(result[4]);
      size = lastIndex - startIndex;
      var targetIndex = lastIndex - 1;
      // Get last datum added to contract.
      return otpInstance.getDataum(OtpCI.otpAppVersion, targetIndex)
        .then(function(result){
          // Compare original to received.
          var msg = 'Could not varify add.';

          if (result == datum) {
            msg = 'Added and verified [' + size + ' @ ' + lastIndex + ']';
          }

          verifyTarget.innerHTML = msg;

        });
    }).catch(function(err) {
      console.log(err);
    });
  },
  reloadVersion: function() {
    // refresh account information because the balance may have changed
    OtpCI.displayAccountInfo();

    OtpCI.contracts.Otp.deployed().then(function(instance) {
      return instance.getOtpInstance(OtpCI.otpAppVersion);
    }).then(function(article) {

      // Retrieve and fill the article template
      var articleTemplate = $('#articleTemplate');
      articleTemplate.find('.panel-title').text(article[0]);
      articleTemplate.find('.article-status').text(article[2]);
      articleTemplate.find('.article-start').text(article[3]);
      articleTemplate.find('.article-end').text(article[4]);
      articleTemplate.find('.article-checksum').text(article[5]);

      // add this new article
    //  articlesRow.append(articleTemplate.html());
      return Promise.resolve(1);
    }).catch(function(err) {
      console.log(err.message);
    });
  },
  loadWasmData: function() {
    var otpInstance;

    OtpCI.contracts.Otp.deployed().then(function(instance) {
      otpInstance = instance;

      return instance.getOtpInstance(OtpCI.otpAppVersion);
    }).then(function(otpDef) {

        var startIndex = parseInt(otpDef[3]);
        var endIndex = parseInt(otpDef[4]);
        var size = endIndex - startIndex;
        var b64Data = [];
        var promises = [];

        for (var i = 0; i < size; i++) {
          b64Data.push('');
          promises.push(OtpCI.loadWasmDatum(otpInstance, i, startIndex + i));
        }

        return Promise.all(promises).then(function(results) {
          console.log('promise done');

          for(var i = 0; i < results.length; i++) {
            b64Data[results[i].index] = results[i].datum;
          }

          var h = '';
          for(var i = 0; i < results.length; i++) {
            h = h + b64Data[i];
          }

          $('#wasmData').html(h);

        });
    });

  },
  loadWasmDatum: function(inst, index, dataIndex) {
    return inst.getDataum(OtpCI.otpAppVersion, dataIndex)
      .then(function(result){
        return {index: index, datum: result};
      });
  }
/*
  sellArticle: function() {
    // retrieve details of the article
    var _article_name = $("#article_name").val();
    var _description = $("#article_description").val();
    var _price = web3.toWei(parseInt($("#article_price").val() || 0), "ether");

    if ((_article_name.trim() == '') || (_price == 0)) {
      // nothing to sell
      return false;
    }

    App.contracts.ChainList.deployed().then(function(instance) {
      return instance.sellArticle(_article_name, _description, _price, {
        from: App.account,
        gas: 500000
      });
    }).then(function(result) {

    }).catch(function(err) {
      console.error(err);
    });
  },

  // Listen for events raised from the contract
  listenToEvents: function() {
    App.contracts.ChainList.deployed().then(function(instance) {
      instance.sellArticleEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        $("#events").append('<li class="list-group-item">' + event.args._name + ' is for sale' + '</li>');
        App.reloadArticles();
      });
    });
  },*/
};

$(function() {
  $(window).load(function() {
    OtpCI.init();
  });
});

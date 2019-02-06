App = {
  web3Provider: null,
  contracts: {},
  account: 0x0,
  otpAppVersion: '110',
  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // Initialize web3 and set the provider to the testRPC.
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // set the provider you want from Web3.providers
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    App.displayAccountInfo();
    return App.initContract();
  },

  displayAccountInfo: function() {
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
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
      App.contracts.Otp = TruffleContract(otpArtifact);

      // Set the provider for our contract.
      App.contracts.Otp.setProvider(App.web3Provider);

      // Retrieve the article from the smart contract
      return App.createVersion();
    });
  },

  createVersion: function () {
    var otpInstance;
    App.contracts.Otp.deployed().then(function(instance) {
      otpInstance = instance;
      return otpInstance.getInstanceCount();
    }).then(function(count) {
      console.log("Instance foud: " + count);
      if (count < 1) {
        console.log('No instances found, creating one.')
        return otpInstance.defineOtpInstance(App.otpAppVersion, 0x3d5ea9cbfd84167f73f07832e55dd216);
      }
      else {
        console.log('Doing nothing.');
        return Promise.resolve(1);
      }
    }).then(function() {
      return App.reloadVersion(); //.loadWasmData(); //
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
    App.contracts.Otp.deployed().then(function(instance) {
      otpInstance = instance;
      // Add datum to contract
      return otpInstance.addDatum(version, datum);
    }).then(function() {
      // Retrieve update app instance.
      return otpInstance.getOtpInstance(App.otpAppVersion);
    }).then(function (result) {
      var startIndex = parseInt(result[3]);
      lastIndex = parseInt(result[4]);
      size = lastIndex - startIndex;
      var targetIndex = lastIndex - 1;
      // Get last datum added to contract.
      return otpInstance.getDataum(App.otpAppVersion, targetIndex)
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
    App.displayAccountInfo();

    App.contracts.Otp.deployed().then(function(instance) {
      return instance.getOtpInstance(App.otpAppVersion);
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

    App.contracts.Otp.deployed().then(function(instance) {
      otpInstance = instance;

      return instance.getOtpInstance(App.otpAppVersion);
    }).then(function(otpDef) {

        var startIndex = parseInt(otpDef[3]);
        var endIndex = parseInt(otpDef[4]);
        var size = endIndex - startIndex;
        var b64Data = [];
        var promises = [];

        for (var i = 0; i < size; i++) {
          b64Data.push('');
          promises.push(App.loadWasmDatum(otpInstance, i, startIndex + i));
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
    return inst.getDataum(App.otpAppVersion, dataIndex)
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
    App.init();
  });
});

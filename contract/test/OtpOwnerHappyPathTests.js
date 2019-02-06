/// ==========================================================================
/// MODULE: OTP Contract Test Suite
/// DESCRIPTION:  This module provides unit tests that can be run to ensure 
/// the contract is functioning in an expected manner.
///
/// Copyright 2019 by Xactant 42
/// Permission is hereby granted, free of charge, to any person obtaining a
/// copy of this software and associated documentation files (the "Software"),
/// to deal in the Software without restriction, including without limitation
/// the rights to use, copy, modify, merge, publish, distribute, sublicense,
/// and/or sell copies of the Software, and to permit persons to whom the
/// Software is furnished to do so, subject to the following conditions:
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

// COntract to test
var Otp = artifacts.require("./Otp.sol");

// Test Suite
contract ('Otp', function (accounts) {
  var otpInstance;
  var owner = accounts[0];
  var instanceStatus = {
    wasm_status_alpha: 0,
    wasm_status_beta: 1,
    wasm_status_prod: 2,
    wasm_status_deprecated: 3,
    wasm_status_retired: 4
  };

  var appVersion1 = {
    version: 100,
    instanceStatus: instanceStatus.wasm_status_alpha,
    startIndex: 0,
    endIndex: 4,
    checksum: 1234567
  };

  var appVersion2 = {
    version: 101,
    instanceStatus: instanceStatus.wasm_status_alpha,
    startIndex: 4,
    endIndex: 6,
    checksum: 1234567
  };

  var data1 = [
    'Mary had a little lamb ',
    'its fleece was white as snow. ',
    'And everywhere that Mary went ',
    'the lamb was sure to go.'
  ];

  var data2 = [
    'When your power comes from others, on approval, ',
    'you are their slave. TOBIAS WOLFF, Old School'
  ];

  it ('should create new instance', function () {
    return Otp.deployed().then(function(instance) {
      console.log("instance returned");
      otpInstance = instance;
      return otpInstance.defineOtpInstance(appVersion1.version, appVersion1.checksum, {from: owner});
    }).then(function(data) {
      console.log("OTP Instance defined.");
      return otpInstance.getOtpInstance(appVersion1.version);
    }).then(function(data) {
      assert.equal(data[0], appVersion1.version, "version must be " + appVersion1.version);
      assert.equal(data[1], instanceStatus.wasm_status_alpha, "instance status should default to " + instanceStatus.wasm_status_alpha);
      assert.equal(data[3], 0, "start index should default to 0");
      assert.equal(data[4], 0, "end index should default to 0");
      assert.equal(data[5], appVersion1.checksum, "version must be " + appVersion1.checksum);
    }).catch(function(err) { console.log(err); });
  });

  it ('should add data', function () {
    return Otp.deployed().then(function(instance) {
      otpInstance = instance;
      return otpInstance.addDatum(appVersion1.version, data1[0], {from: owner});
    }).then(function(data) {
      return otpInstance.addDatum(appVersion1.version, data1[1], {from: owner});
    }).then(function(data) {
      return otpInstance.addDatum(appVersion1.version, data1[2], {from: owner});
    }).then(function(data) {
      return otpInstance.addDatum(appVersion1.version, data1[3], {from: owner});
    }).then(function(data) {
      return otpInstance.getOtpInstance(appVersion1.version);
    }).then(function(data) {
      assert.equal(data[0], appVersion1.version, "version must be " + appVersion1.version);
      assert.equal(data[1], instanceStatus.wasm_status_alpha, "instance status should default to " + instanceStatus.wasm_status_alpha);
      assert.equal(data[3], 0, "start index should default to 0");
      assert.equal(data[4], 4, "end index should default to 4");
      assert.equal(data[5], appVersion1.checksum, "version must be " + appVersion1.checksum);
    }).catch(function(err) { console.log(err); });
  });


});

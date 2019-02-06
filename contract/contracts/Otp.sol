pragma solidity >=0.4.22 <0.6.0;
/// ==========================================================================
/// MODULE: OTP Ethereum Contract
/// DESCRIPTION: Defines a Solidity contract that provides a means to host
/// versioned instances of the One Time Pad web assembly application
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

/// ---------------------------------------------------------------------------
/// The Ownable contract defines a base contract that defines ownership
/// contraints for descendant contracts.
/// ---------------------------------------------------------------------------
contract Ownable {
  address public owner;

  // The Ownable constructor sets the original `owner` of the contract to
  // the sender account.
  constructor () {
    owner = msg.sender;
  }

  // Define a method access modifier that throws an exception f called by
  // any account other than the owner.
  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  // Enables the current owner to transfer control of the contract to a
  // newOwner.
  // @param newOwner The address to transfer ownership to.
  function transferOwnership(address newOwner) onlyOwner {
    if (newOwner != address(0)) {
      owner = newOwner;
    }
  }
}

/// ---------------------------------------------------------------------------
/// Otp This contract provides a means to host versioned instances of the
/// one time pad web assembly application
/// ---------------------------------------------------------------------------
contract Otp is Ownable {
  // WASM Instance Statuses
  uint16 wasm_status_alpha = 0;
  uint16 wasm_status_beta = 1;
  uint16 wasm_status_prod = 2;
  uint16 wasm_status_deprecated = 3;
  uint16 wasm_status_retired = 4;

  // Define a structure to hold a single section of a wasm application
  // instance. Since WASM binary instances are genreally larger than
  // can be handled in a single transaction the WASM instance is broken into
  // sections and stored as seperate strings.
  // DEV NOTE does this need a structure? Other than the string are there
  // other data points that shoul be defined per WASM section?
  // DEV NOTE if no other data point needed consider putting string Array
  // in OtpInstance instead.
  struct WasmData {
      string datum ;
  }

  // OtpInstance defines a reference to an Otp wasm version.
  struct OtpInstance {
    // Application version
    uint16 version;
    // Value to indicate publish status of version.
    uint16 instanceStatus;
    // Index in the wasm code array of the first section of this version.
    uint256 startIndex;
    // Index in the was code array of the finalsection associated with this
    // version.
    uint256 endIndex;
    // MD5 checksum of the reconstituted base64 formated WASM assembly.
    // Included so that consumer can make sure the WASM has not been
    // tampered with. This value should match published checksum and
    // MD5 checksum of reconstituted WASM assembly.
    uint256 checksum;
  }

  // Array to hold all published OTP instances
  OtpInstance[] otpInstances;

  // Array to hold all known WASM sections
  WasmData[] wasmData;

  // --------------------------------------------------------------------------
  // Internal / Private methods
  // --------------------------------------------------------------------------
  /// Returns instance index based on application version. Defaults to 0.
  /// Consuming methods must perform version check against matching
  /// instance if this is not the expected behavior.
  /// @param _version Version of target application.
  function getOtpInstanceIndexByVersion (uint32 _version) internal view
    returns (uint256) {
    uint256 otpIndex = 0;
    uint256 i = 0;

    // Find application Instance
    for(i = 0; i < otpInstances.length; i++) {
        if (_version == otpInstances[i].version) {
            otpIndex = i;
            break;
        }
    }

    return otpIndex;
  }

  // --------------------------------------------------------------------------
  // Public owner methods
  // --------------------------------------------------------------------------
  /// OWNER ONLY: Creates an OTP Application instances and adds it to
  /// internal storage.
  /// @param _version Version of target application.
  /// @param _checksum The MD5 checksum of the associated WASM binary formated
  ///       in base64.
  function defineOtpInstance(uint16 _version, uint256 _checksum)
    public onlyOwner {
    OtpInstance memory otp = OtpInstance({
        version: _version,
        instanceStatus: wasm_status_alpha,
        startIndex: 0,
        endIndex: 0,
        checksum: _checksum
    });

    otpInstances.push(otp);
  }

  /// OWNER ONLY: Adds a section of a base64 encoded WASM assembly to the
  /// WASM array and updates associated application version. Can only
  /// update ALPHA and BETA versions.
  /// @param _version Version of target application.
  /// @param _section A section of a WASM binary in base64 format.
  function addDatum(uint16 _version, string _section) public onlyOwner {
    uint256 otpIndex;

    // _section cannot be empty
    require (bytes(_section).length > 0);
    // Retrieve the instance index for the specified version.
    otpIndex = getOtpInstanceIndexByVersion(_version);
    // Default index 0 returned if version not found so make sure specified
    // version matches instance version.
    require (otpInstances[otpIndex].version == _version);
    // Can only update alpha and beta
    require (otpInstances[otpIndex].instanceStatus <= wasm_status_beta);

    // New instance, set startIndex to end of data array
    if (otpInstances[otpIndex].endIndex == 0 && wasmData.length > 0) {
        otpInstances[otpIndex].startIndex = wasmData.length;
        otpInstances[otpIndex].endIndex = wasmData.length;
    }

    // Create struct element for new section
    WasmData memory wd = WasmData({
        datum: _section
    });

    // Add section to wasm section array.
    wasmData.push(wd);

    // Update the endIndex of the associated instance.
    otpInstances[otpIndex].endIndex = otpInstances[otpIndex].endIndex + 1;
  }

  /// OWNER ONLY: Exables owner to update the status of the specified
  /// WASM application.
  /// @param _version Version of target application.
  /// @param _statusCode New status code of the target app version
  function updateOtpInstanceStatus(uint16 _version, uint16 _statusCode)
    public onlyOwner {
    uint256 otpIndex;

    // Status code must be a know status code.
    require (_statusCode >= wasm_status_alpha && _statusCode <= wasm_status_retired);

    // DEV NOTE should status codes be one way - meaning the update can be
    // from a lower status (beta to prod) but not from higher to lower
    // (deprecated to prod)?

    // Retrieve the instance index for the specified version.
    otpIndex = getOtpInstanceIndexByVersion(_version);
    // Default index 0 returned if version not found so make sure specified
    // version matches instance version.
    require (otpInstances[otpIndex].version == _version);

    // Update the status of the specified application instance.
    otpInstances[otpIndex].instanceStatus = _statusCode;
  }

  // --------------------------------------------------------------------------
  // Public methods
  // --------------------------------------------------------------------------
  /// Returns the specified WASM section for the specified instance version
  /// @param _version Version of target application.
  /// @param _index Section index in the WASM data array in relation to
  ///       instance startIndex.
  function getDataum(uint16 _version, uint256 _index) public view
    returns(string) {
    uint256 otpIndex;
    uint256 index;
    string memory result = "";

    // Index must be greater or equal to 0.
    assert(_index >= 0);

    // Retrieve the instance index for the specified version.
    otpIndex = getOtpInstanceIndexByVersion(_version);
    // Default index 0 returned if version not found so make sure specified
    // version matches instance version.
    require (otpInstances[otpIndex].version == _version);

    // Datum index is OTP instance startIndex + index value.
    index = otpInstances[otpIndex].startIndex + _index;

    // Make sure that the target index is less than the OTP instance's endIndex.
    if(index < otpInstances[otpIndex].endIndex) {
      result = wasmData[index].datum;
    }

    return result;
  }

  /// Returns the Otp Instance specified by version.
  /// @param _version Version of target application.
  function getOtpInstance(uint16 _version) public view
    returns(uint16 _appVersion,
            uint16 _instanceStatus,
            string _statusText,
            uint256 _startIndex,
            uint256 _endIndex,
            uint256 _checkum) {
    string memory statusText = "UNKNOWN";
    uint256 otpIndex;

    // Retrieve the instance index for the specified version.
    otpIndex = getOtpInstanceIndexByVersion(_version);

    // Default index 0 returned if version not found so make sure specified
    // version matches instance version.
    require (otpInstances[otpIndex].version == _version);

    // Create a human readable status text.
    if (wasm_status_alpha == otpInstances[otpIndex].instanceStatus) {
        statusText = "ALPHA";
    }
    else if (wasm_status_beta == otpInstances[otpIndex].instanceStatus) {
        statusText = "BETA";
    }
    else if (wasm_status_prod == otpInstances[otpIndex].instanceStatus) {
        statusText = "PROD";
    }
    else if (wasm_status_deprecated == otpInstances[otpIndex].instanceStatus) {
        statusText = "DEPRECATED";
    }
    else if (wasm_status_retired == otpInstances[otpIndex].instanceStatus) {
        statusText = "DEAD";
    }

    // return instance data
    return (otpInstances[otpIndex].version,
            otpInstances[otpIndex].instanceStatus,
            statusText,
            otpInstances[otpIndex].startIndex,
            otpInstances[otpIndex].endIndex,
            otpInstances[otpIndex].checksum);
  }

  /// Returns the number of available versions
  function getInstanceCount () public view returns(uint256 _count) {
    return otpInstances.length;
  }

  /// Returns the version of the OTP instance by index.
  /// @param _index Target instance index.
  function getInstanceVersionByIndex(uint256 _index) public view
    returns (uint16) {
    // Index must be less than the length of the array.
    require (_index < otpInstances.length);

    return otpInstances[_index].version;
  }

  /// Returns the version of the newest procudtion version. Zero returned
  /// if no production version found.
  function getLatestProductionVersion() public view
    returns (uint16) {
    uint256 index;
    uint16 prodInstanceVersion = 0;

    // Find the latest production version by status by traversing the
    // backwards.
    for (index = otpInstances.length - 1; index >= 0; index++) {
      if (otpInstances[index].instanceStatus == wasm_status_prod) {
        prodInstanceVersion = otpInstances[index].version;
        break;
      }
    }

    return prodInstanceVersion;
  }
}

# One Time Pad (OTP)
In today's world privacy, especially of communications between individuals, can be difficult to acheive. Many mobile communication solutions rely upon a centralized server, run by a third party to host / distribute encrypted data and keys. This situation may seem okay in many first world countries where some level of rule of law still exists. However there are many places in the world where individuals cannot rely on an unknown third party to deny access to governing or nefarious entities. Additionally the communication with central servers can be easily blocked. Device to device communication is an option but there are places in the world where authorities routinely check citizen's devices via random device scans designed to look for applications the governing body deems illegal.

The solution is a memory resident application, hosted in a decentralized manner that enables a user to encrypt / decrypt communications. As a WASM application, hosted in an Ethereum contract, the One Time Pad application provides a solution to this problem.

This project group contains three projects that (1) define the OTP WASM Assembly, (2) demonstrate how a base64 encoded version of the WASM can be loaded into and hosted in an Ehtereum contract and (3) demonstrate how to access and execute the hosted WASM.

The example applications provide a Proof of Concept demonstrating how a WASM application can be hosted in a decentralized manner. By using WASM the __cost of executing the state change on the contract is incurred by the developer__. However, since reads are free, users can freely access the application. This example uses Ethereum as Ethereum is the most mature smart contract environment. However there is no reason why other smart contract environments such as Cardano, Lisk, could be used.

```
 Copyright 2019 by Xactant 42
 Permission is hereby granted, free of charge, to any person obtaining a
 copy of this software and associated documentation files (the "Software"),
 to deal in the Software without restriction, including without limitation
 the rights to use, copy, modify, merge, publish, distribute, sublicense,
 and/or sell copies of the Software, and to permit persons to whom the
 Software is furnished to do so, subject to the following conditions:
   1. The origin of this source code must not be misrepresented; you must not
      claim that you wrote the original source code. If you use this source code
      in a product, an acknowledgment in the product documentation would be
      appreciated but is not required.
   2. Altered source versions must be plainly marked as such, and must not be
      misrepresented as being the original source code.
   3. This notice may not be removed or altered from any source distribution.

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 DEALINGS IN THE SOFTWARE.
```

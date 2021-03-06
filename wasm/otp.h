/// ==========================================================================
/// MODULE: otp.h
/// DESCRIPTION:  Header file for the OTP application - defines the
/// application's interface.
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
#ifndef OTP_HPP
#define OTP_HPP

#include <string>

using std::string;
using std::vector;

class Otp {
  private:
    string name;

    string vecToString(vector<unsigned char> v);
    unsigned char encryptByte (unsigned char c, unsigned char k);
    unsigned char decryptByte (unsigned char c, unsigned char k);
  public:
    Otp (string n);
    string encrypt (string text, string key);
    string decrypt (string text, string key);
};

#endif

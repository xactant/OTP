/// ==========================================================================
/// MODULE: otp.cc
/// DESCRIPTION:  This application provides methods for encrypting or decrypting
/// UTF8 text using a one time pad key. Each bit or character of the plaintext
/// is encrypted by combining it with the corresponding bit or character from
/// the pad using modular addition. Encrypted text is returned as a base64
/// encoded string.
///
/// While this is plain C++ code it is meant to be compile into Web Assembly
/// (WASM) using EMSCRIPTEN.
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
#include <iostream>
#include <string>
#include <vector>
#include <algorithm>
#include "otp.h"
#include "emscripten/bind.h"
#include "base64/base64.h"

using namespace emscripten;
using namespace std;

Otp::Otp(string n) : name(n) {}


unsigned char Otp::encryptByte (unsigned char c, unsigned char k)
{
  int x = (int)c + (int)k;

  if (x > 0xff)
  {
    x = x - 0xff;
  }

  return x;
}

unsigned char Otp::decryptByte (unsigned char c, unsigned char k)
{
  int x = (int)c;

  x = x - (int)k;

  if (x < 0)
  {
    x = x + 0xff;
  }

  return x;
}

string Otp::vecToString(vector<unsigned char> vect)
{
  string resp = "";

  for (auto v = vect.cbegin(); v != vect.cend(); v++)
  {
    resp += *v;
  }

  return resp;
}

string Otp::encrypt (string text, string key)
{
  vector<unsigned char> textVec(text.begin(), text.end());
  vector<unsigned char> keyVec(key.begin(), key.end());
  vector<unsigned char> data;
  int keyIndex = 0;

  for(int i = 0; i < textVec.size(); i++)
  {
    int x = encryptByte(textVec[i], keyVec[keyIndex]);

    keyIndex++;

    if(keyIndex > keyVec.size() - 1) {
      keyIndex = 0;
    }

    data.push_back((unsigned char)x);
  }

  return base64_encode(data.data() , data.size());
}

string Otp::decrypt (string text, string key)
{
  string enc = base64_decode(text);

  vector<unsigned char> textVec(enc.begin(), enc.end());
  vector<unsigned char> keyVec(key.begin(), key.end());
  vector<unsigned char> data;
  int keyIndex = 0;

  for(int i = 0; i < textVec.size(); i++)
  {
    int x = decryptByte(textVec[i], keyVec[keyIndex]);
    keyIndex++;

    if(keyIndex > keyVec.size() - 1) {
      keyIndex = 0;
    }

		data.push_back((unsigned char)x);
  }

  return vecToString(data);
}

EMSCRIPTEN_BINDINGS (c) {
  class_<Otp>("Otp")
    .constructor<string>()
    .function("encrypt", &Otp::encrypt)
    .function("decrypt", &Otp::decrypt);
}

# One Time Pad Encrypt / Decryption
This projects defines a C++ application that provides functionality to encrypt
and decrypt data. The OTP application uses modular addition to combine (or
de-combine in the case of decryption) the target text with the supplied key.

from Wikipedia: https://en.wikipedia.org/wiki/One-time_pad
In cryptography, the one-time pad (OTP) is an encryption technique that cannot
be cracked, but requires the use of a one-time pre-shared key the same size as,
or longer than, the message being sent. In this technique, a plaintext is
paired with a random secret key (also referred to as a one-time pad). Then,
each bit or character of the plaintext is encrypted by combining it with the
corresponding bit or character from the pad using modular addition. If the key
is (1) truly random, (2) at least as long as the plaintext, (3) never reused
in whole or in part, and (4) kept completely secret, then the resulting
ciphertext will be impossible to decrypt or break.

## Prerequisites
1. Emscripten: https://emscripten.org/

## Building
1. Navigate to the folder the project was deployed to
2. Run the following command:
```
emcc --bind -Oz otp.cc base64/base64.cc -o otp.js -s WASM=1 -s NO_EXIT_RUNTIME=1 -s "EXTRA_EXPORTED_RUNTIME_METHODS=['addOnPostRun']"
```
This command will compile the C++ code into a WASM assembly and generate a javascript file that can be used to load and provide an interface to the WASM application.
3. Use your favorite webserver (lite-server, SimpleHTTPServer, etc.) to run the included sample web application

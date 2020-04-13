c:\emsdk\emsdk_env.bat
emsdk activate latest
emcc --bind -Oz otp.cc base64/base64.cc -o otp.js -s WASM=1 -s NO_EXIT_RUNTIME=1 -s "EXTRA_EXPORTED_RUNTIME_METHODS=['addOnPostRun']"

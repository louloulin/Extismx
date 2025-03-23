# Extism C/C++ Plugin Development Kit (PDK)

This directory contains the C and C++ implementation of the Extism Plugin Development Kit (PDK), which enables developers to create Extism plugins using C and C++.

## Requirements

- [Emscripten](https://emscripten.org/docs/getting_started/downloads.html) for compiling to WebAssembly
- [CMake](https://cmake.org/download/) 3.10 or later
- A C/C++ compiler (for native builds)
- [Node.js](https://nodejs.org/) (for testing)

## Directory Structure

- `extism_pdk.h` - The core PDK header file for C and C++
- `hello_plugin.c` - A sample Hello World plugin in C
- `hello_plugin.cpp` - A sample Hello World plugin in C++
- `CMakeLists.txt` - CMake configuration file
- `Makefile` - Build automation
- `plugin.json` - Plugin manifest
- `test_plugin.js` - Test script for the plugins

## Quick Start

To build the sample Hello World plugins:

```bash
# Set up Emscripten (if not already done)
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh
export EMSDK=/path/to/emsdk  # Replace with your actual path

# Build the plugins
cd src/cpp-pdk
make

# This will produce hello_cpp.wasm and hello_c.wasm
```

## Creating Your Own Plugin

### C Plugin

1. Create a new C file for your plugin (e.g., `my_plugin.c`)
2. Include the Extism PDK header:

```c
#include "extism_pdk.h"
#include <stdlib.h>
#include <string.h>
```

3. Implement your plugin function:

```c
int32_t my_function() {
    // Get input
    uint64_t input_len = extism_input_length();
    uint8_t* input_buf = (uint8_t*)malloc(input_len + 1);
    extism_input_load_u8(0, input_len, input_buf);
    input_buf[input_len] = '\0';
    
    // Your logic here
    
    // Set output
    const char* result = "{\"result\":\"success\"}";
    extism_output_set((const uint8_t*)result, strlen(result));
    
    // Clean up
    free(input_buf);
    
    return 0;
}
```

### C++ Plugin

1. Create a new C++ file for your plugin (e.g., `my_plugin.cpp`)
2. Include the Extism PDK header:

```cpp
#include "extism_pdk.h"
#include <string>

// Use the Extism namespace
using namespace extism;
```

3. Implement your plugin function:

```cpp
extern "C" {
    int32_t my_function() {
        try {
            // Get input
            std::string input = Host::input_string();
            
            // Your logic here
            
            // Set output
            Host::output_string("{\"result\":\"success\"}");
            
            return 0;
        } catch (const std::exception& e) {
            Host::error(std::string("Error: ") + e.what());
            return 1;
        }
    }
}
```

4. Update the CMakeLists.txt to include your new plugin
5. Update plugin.json to describe your plugin's interface

## API Reference

### C API Functions

- `extism_input_length()` - Get the length of the plugin input
- `extism_input_load_u8()` - Load input bytes into a buffer
- `extism_output_set()` - Set the plugin output
- `extism_error_set()` - Set an error message
- `extism_alloc()` - Allocate memory in the Extism runtime
- `extism_free()` - Free memory in the Extism runtime
- `extism_log_info()`, `extism_log_debug()`, etc. - Log messages
- `extism_http_request()` - Make an HTTP request

### C++ API Classes

- `extism::Host` - Static methods for interacting with the Extism host
- `extism::Memory` - Memory management in the Extism runtime
- `extism::HttpRequest`/`extism::HttpResponse` - HTTP functionality

## Building for WebAssembly

The PDK uses Emscripten to compile C/C++ code to WebAssembly. The build process is handled by CMake and the provided Makefile.

When building your plugin, make sure:

1. You have Emscripten installed and activated
2. The `EMSDK` environment variable is set to your Emscripten installation directory
3. You've exported all necessary functions using `extern "C"` (for C++) or without name mangling (for C)

## Additional Resources

- [Extism Documentation](https://extism.org/docs)
- [Emscripten Documentation](https://emscripten.org/docs/index.html)
- [WebAssembly Documentation](https://webassembly.org/) 
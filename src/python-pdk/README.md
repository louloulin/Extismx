# Extism Python Plugin Development Kit (PDK)

This is the Python implementation of the Extism Plugin Development Kit, which allows you to create Extism plugins using the Python programming language.

## Requirements

To build plugins with this PDK, you need:

- Python 3.7 or later
- A WebAssembly compiler for Python (such as Pyodide, Emscripten, or Javy)

Note: Compiling Python to WebAssembly is still an evolving area. This PDK provides the interface but requires additional tooling for the actual compilation step.

## Installation

1. Install a suitable WebAssembly compilation toolchain for Python:
   - [Pyodide](https://pyodide.org/)
   - [Emscripten](https://emscripten.org/)
   - [Javy](https://github.com/bytecodealliance/javy) (for JavaScript, can be adapted)

2. Clone this repository or copy the PDK files to your project.

## Usage

### 1. Create a new plugin

Create a new Python file for your plugin:

```python
from extism_pdk import host

def my_function():
    # Get input
    input_text = host.get_input_string()
    
    # Do something with the input
    
    # Set output
    host.set_output_string("Hello, " + input_text)
    
    return 0  # Success
```

### 2. Build your plugin

Use your chosen WebAssembly compiler to compile your plugin. The specific commands will depend on the compiler you're using.

For example, with a hypothetical Pyodide-based tool:

```bash
pyodide-build my_plugin.py -o my_plugin.wasm
```

### 3. Use your plugin

You can use your plugin with the Extism host SDK in various programming languages or with the Extism CLI:

```bash
extism call my_plugin.wasm my_function --input "World"
```

## API Reference

The Python PDK provides a `Host` class with the following methods:

### Input/Output

- `get_input() -> bytes`: Get the raw input bytes
- `get_input_string() -> str`: Get the input as a string
- `get_input_json() -> Any`: Parse the input as JSON into a Python object
- `set_output(data: bytes) -> None`: Set the raw output bytes
- `set_output_string(data: str) -> None`: Set the output as a string
- `set_output_json(data: Any) -> None`: Set a Python object as JSON output
- `set_error(error: str) -> None`: Set an error message

### Logging

- `log_info(message: str) -> None`: Log an info message
- `log_debug(message: str) -> None`: Log a debug message
- `log_warn(message: str) -> None`: Log a warning message
- `log_error(message: str) -> None`: Log an error message

### HTTP

- `http_request(url: str, method: str = "GET", headers: Optional[Dict[str, str]] = None, body: Optional[str] = None) -> Dict[str, Any]`: Make an HTTP request

### Configuration and Variables

- `get_config(key: str) -> str`: Get a configuration value
- `get_var(key: str) -> str`: Get a variable value
- `set_var(key: str, value: str) -> bool`: Set a variable value

## Example Plugins

See the `hello_plugin.py` file for a simple example plugin.

## WebAssembly Compilation Options

Here are some options for compiling Python to WebAssembly:

### Pyodide

[Pyodide](https://pyodide.org/) is a Python distribution for the browser and Node.js based on WebAssembly. While it's primarily focused on running Python in browsers, its underlying technology can be adapted to create standalone WASM modules.

### Emscripten

[Emscripten](https://emscripten.org/) is a complete compiler toolchain to WebAssembly. It can be used to compile Python to WebAssembly, though this approach requires more complex setup.

### CPython + WASI

The Python team is working on [WASI support for CPython](https://github.com/python/cpython/issues/93819), which would allow Python to be compiled to WebAssembly with WASI support.

### MicroPython for WebAssembly

[MicroPython](https://micropython.org/) has some experimental WebAssembly support that could be leveraged for creating plugins.

## License

MIT 
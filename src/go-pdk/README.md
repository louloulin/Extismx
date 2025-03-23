# Extism Go Plugin Development Kit (PDK)

This is the Go implementation of the Extism Plugin Development Kit, which allows you to create Extism plugins using the Go programming language.

## Requirements

To build plugins with this PDK, you need:

- [TinyGo](https://tinygo.org/) 0.30.0 or later
- Go 1.19 or later

TinyGo is used to compile Go code to WebAssembly for use in Extism plugins.

## Installation

1. Install TinyGo following the [official instructions](https://tinygo.org/getting-started/install/).

2. Clone this repository or copy the PDK files to your project.

## Usage

### 1. Create a new plugin

Create a new Go file for your plugin:

```go
package main

import (
	"github.com/extism/extism-plugins/go-pdk/extism_pdk"
)

//export my_function
func my_function() int32 {
	host := extism_pdk.CreateHost()
	
	// Get input
	input := host.GetInputString()
	
	// Do something with the input
	
	// Set output
	host.SetOutputString("Hello, " + input)
	
	return 0 // Success
}

// This function is required for Go plugins
func main() {}
```

### 2. Build your plugin

Use TinyGo to compile your plugin:

```bash
tinygo build -o my_plugin.wasm -target wasi my_plugin.go
```

Or use the provided Makefile:

```bash
make hello
```

### 3. Use your plugin

You can use your plugin with the Extism host SDK in various programming languages or with the Extism CLI:

```bash
extism call my_plugin.wasm my_function --input "World"
```

## API Reference

The Go PDK provides a `Host` interface with the following methods:

### Input/Output

- `GetInput() []byte`: Get the raw input bytes
- `GetInputString() string`: Get the input as a string
- `GetInputJSON(v interface{}) error`: Parse the input as JSON into a Go struct
- `SetOutput(data []byte) error`: Set the raw output bytes
- `SetOutputString(s string) error`: Set the output as a string
- `SetOutputJSON(v interface{}) error`: Set a Go struct as JSON output
- `SetError(msg string) error`: Set an error message

### Logging

- `LogInfo(msg string)`: Log an info message
- `LogDebug(msg string)`: Log a debug message
- `LogWarn(msg string)`: Log a warning message
- `LogError(msg string)`: Log an error message

### HTTP

- `HTTP(req HTTPRequest) (*HTTPResponse, error)`: Make an HTTP request

### Configuration and Variables

- `GetConfig(key string) string`: Get a configuration value
- `GetVar(key string) string`: Get a variable value
- `SetVar(key string, value string) bool`: Set a variable value

## Example Plugins

See the `hello_plugin.go` file for a simple example plugin.

## License

MIT 
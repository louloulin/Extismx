# Extism Rust Plugin Development Kit (PDK)

This directory contains the Rust implementation of the Extism Plugin Development Kit (PDK), which enables developers to create Extism plugins using Rust.

## Requirements

- [Rust](https://www.rust-lang.org/tools/install) 1.60 or later
- [Cargo](https://doc.rust-lang.org/cargo/getting-started/installation.html)
- [wasm-pack](https://rustwasm.github.io/wasm-pack/installer/) (optional, for advanced builds)

## Directory Structure

- `extism_pdk.rs` - The core PDK implementation for Rust
- `hello_plugin.rs` - A sample Hello World plugin
- `Cargo.toml` - Dependency and build configuration
- `Makefile` - Build automation
- `plugin.json` - Plugin manifest

## Quick Start

To build the sample Hello World plugin:

```bash
# Build the plugin
make

# This will produce hello.wasm
```

## Creating Your Own Plugin

1. Create a new Rust file for your plugin (e.g., `my_plugin.rs`)
2. Import the Extism PDK:

```rust
mod extism_pdk;
use extism_pdk::{Host, export_plugin};
```

3. Define your input and output types using Serde:

```rust
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
struct MyInput {
    // Your input fields here
}

#[derive(Serialize)]
struct MyOutput {
    // Your output fields here
}
```

4. Implement your plugin function:

```rust
fn my_function_impl() -> Result<MyOutput, String> {
    // Parse input
    let input = Host::input_json::<MyInput>()?;
    
    // Your logic here
    
    // Return output
    Ok(MyOutput { /* your output */ })
}
```

5. Export your function using the provided macro:

```rust
export_plugin! {
    fn my_function() -> MyOutput {
        my_function_impl()
    }
}
```

6. Update your Cargo.toml to point to your plugin file
7. Update plugin.json to describe your plugin's interface

## API Reference

### Host Functions

- `Host::input()` - Get the raw input bytes
- `Host::input_string()` - Get the input as a UTF-8 string
- `Host::input_json()` - Parse the input as JSON
- `Host::output()` - Set the output bytes
- `Host::output_string()` - Set the output as a string
- `Host::output_json()` - Set the output as JSON
- `Host::error()` - Set an error message
- `Host::config()` - Get a configuration value
- `Host::log_info()`, `Host::log_debug()`, etc. - Log messages
- `Host::http_request()` - Make an HTTP request

### Memory Management

The `Memory` struct provides safe access to the Extism memory system:

- `Memory::new()` - Allocate memory
- `Memory::store()` - Store data in memory
- `Memory::load()` - Load data from memory
- `Memory::from_string()` - Create memory from a string
- `Memory::to_string()` - Convert memory to a string

## Additional Resources

- [Extism Documentation](https://extism.org/docs)
- [Rust WebAssembly Book](https://rustwasm.github.io/docs/book/)
- [Serde Documentation](https://serde.rs/) 
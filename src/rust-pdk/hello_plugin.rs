//! Extism Hello World Plugin (Rust)
//! 
//! This is a simple "Hello World" plugin implemented in Rust.

use serde::{Deserialize, Serialize};

// Import the Extism PDK
mod extism_pdk;
use extism_pdk::{Host, export_plugin};

/// Input structure for the hello function
#[derive(Deserialize)]
struct HelloInput {
    name: String,
}

/// Output structure for the hello function
#[derive(Serialize)]
struct HelloOutput {
    greeting: String,
}

/// Hello function implementation
fn hello_impl() -> Result<HelloOutput, String> {
    // Log the function call
    Host::log_debug("Hello function called");

    // Parse the input JSON
    let input = match Host::input_string() {
        Ok(s) if s.is_empty() => HelloInput { name: "World".to_string() },
        Ok(s) => match serde_json::from_str::<HelloInput>(&s) {
            Ok(input) => input,
            Err(_) => HelloInput { name: s },
        },
        Err(e) => return Err(format!("Failed to read input: {}", e)),
    };

    // Create the greeting
    let greeting = format!("Hello, {}!", input.name);
    
    // Log the greeting 
    Host::log_info(&format!("Created greeting: {}", greeting));
    
    // Return the output
    Ok(HelloOutput { greeting })
}

// Export the hello function
export_plugin! {
    fn hello() -> HelloOutput {
        hello_impl()
    }
} 
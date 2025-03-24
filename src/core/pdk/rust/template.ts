/**
 * Rust plugin template generator
 */
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';

import { TemplateGenerator } from '../common/template';
import { PDKError } from '../../errors/pdk';
import { PluginManifest } from '../common/types';

const execAsync = promisify(exec);
const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);

/**
 * Rust template options
 */
export interface RustTemplateOptions {
  /**
   * Rust toolchain to use (e.g. "stable", "nightly")
   */
  rustToolchain?: string;
  
  /**
   * Whether to include example tests
   */
  includeTests?: boolean;
  
  /**
   * Whether to use wasm-bindgen
   */
  useWasmBindgen?: boolean;
  
  /**
   * Whether to use wasm-pack
   */
  useWasmPack?: boolean;
  
  /**
   * Additional dependencies to include in Cargo.toml
   */
  additionalDependencies?: Record<string, string>;
  
  /**
   * Use advanced API features
   */
  useAdvancedApi?: boolean;
  
  /**
   * Initialize git repository
   */
  initGit?: boolean;
  
  /**
   * Author name
   */
  author?: string;
  
  /**
   * Author email
   */
  authorEmail?: string;
}

/**
 * Rust plugin template generator
 */
export class RustTemplateGenerator extends TemplateGenerator {
  /**
   * Default Rust template options
   */
  private defaultRustOptions: RustTemplateOptions = {
    rustToolchain: 'stable',
    includeTests: true,
    useWasmBindgen: true,
    useWasmPack: false,
    useAdvancedApi: false,
    initGit: true
  };

  /**
   * Rust template options
   */
  private rustOptions: RustTemplateOptions;

  /**
   * Constructor
   * 
   * @param options - Template options
   */
  constructor(options?: RustTemplateOptions) {
    super(options);
    this.rustOptions = { ...this.defaultRustOptions, ...options };
  }

  /**
   * Create a Rust plugin project
   * 
   * @param projectPath - Path where to create the project
   * @param name - Plugin name
   * @param description - Plugin description
   * @returns Promise resolving when the project is created
   */
  async generate(projectPath: string, name: string, description?: string): Promise<void> {
    try {
      // Create project directory
      await mkdirAsync(projectPath, { recursive: true });
      
      // Create project structure
      await this.createProjectStructure(projectPath, name, description);
      
      // Initialize git repository
      if (this.rustOptions.initGit) {
        try {
          await execAsync('git init', { cwd: projectPath });
          
          // Create .gitignore file
          await this.createGitignore(projectPath);
        } catch (error) {
          console.warn(`Failed to initialize git repository: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
      
      // Check if Rust is installed and install dependencies
      try {
        await execAsync('rustc --version');
        
        // Check if wasm target is installed
        const { stdout: targets } = await execAsync('rustup target list --installed');
        if (!targets.includes('wasm32-unknown-unknown')) {
          console.log('Installing wasm32-unknown-unknown target...');
          await execAsync('rustup target add wasm32-unknown-unknown');
        }
        
        // Check if cargo-generate is installed (for advanced templates)
        if (this.rustOptions.useAdvancedApi) {
          try {
            await execAsync('cargo generate --version');
          } catch (err) {
            console.log('Installing cargo-generate...');
            await execAsync('cargo install cargo-generate');
          }
        }
      } catch (error) {
        console.warn(`Failed to check Rust installation: ${error instanceof Error ? error.message : String(error)}`);
        console.warn('Please make sure Rust is installed. Visit https://rustup.rs for installation instructions.');
      }
      
      console.log(`Rust plugin project created at ${projectPath}`);
    } catch (error) {
      throw PDKError.buildFailed(`Failed to generate Rust project: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Create the project structure
   * 
   * @param projectPath - Project path
   * @param name - Plugin name
   * @param description - Plugin description
   */
  private async createProjectStructure(
    projectPath: string,
    name: string,
    description?: string
  ): Promise<void> {
    // Create src directory
    const srcDir = path.join(projectPath, 'src');
    await mkdirAsync(srcDir, { recursive: true });
    
    // Create README.md
    await this.createReadme(projectPath, name, description);
    
    // Create Cargo.toml
    await this.createCargoToml(projectPath, name, description);
    
    // Create src/lib.rs
    await this.createLibRs(srcDir, name);
    
    // Create build.rs
    await this.createBuildRs(projectPath);
    
    // Create tests if enabled
    if (this.rustOptions.includeTests) {
      await this.createTests(projectPath, name);
    }
  }

  /**
   * Create README.md file
   * 
   * @param projectPath - Project path
   * @param name - Plugin name
   * @param description - Plugin description
   */
  private async createReadme(
    projectPath: string,
    name: string,
    description?: string
  ): Promise<void> {
    const content = `# ${name}

${description || 'A Rust plugin for the plugin registry.'}

## Development

### Setup

1. Clone this repository
2. Make sure Rust is installed (https://rustup.rs)
3. Install WebAssembly target:
   \`\`\`
   rustup target add wasm32-unknown-unknown
   \`\`\`

### Build

To build the plugin:

\`\`\`
cargo build --target wasm32-unknown-unknown --release
\`\`\`

### Test

To run tests:

\`\`\`
cargo test
\`\`\`

## License

This project is licensed under the MIT License - see LICENSE file for details.
`;

    await writeFileAsync(path.join(projectPath, 'README.md'), content);
  }

  /**
   * Create Cargo.toml file
   * 
   * @param projectPath - Project path
   * @param name - Plugin name
   * @param description - Plugin description
   */
  private async createCargoToml(
    projectPath: string,
    name: string,
    description?: string
  ): Promise<void> {
    const normalizedName = name.replace(/[^a-zA-Z0-9_-]/g, '-').toLowerCase();
    
    // Basic dependencies
    const dependencies: Record<string, string | { features?: string[], version?: string }> = {
      'wasm-bindgen': '0.2',
      'serde': { features: ['derive'], version: '1.0' },
      'serde_json': '1.0'
    };
    
    // Add additional dependencies
    if (this.rustOptions.additionalDependencies) {
      Object.assign(dependencies, this.rustOptions.additionalDependencies);
    }
    
    // Format dependencies for Cargo.toml
    const formattedDependencies = Object.entries(dependencies)
      .map(([dep, version]) => {
        if (typeof version === 'string') {
          return `${dep} = "${version}"`;
        } else {
          const features = version.features ? `features = [${version.features.map(f => `"${f}"`).join(', ')}]` : '';
          const ver = version.version ? `version = "${version.version}"` : '';
          return `${dep} = { ${features}${features && ver ? ', ' : ''}${ver} }`;
        }
      })
      .join('\n');
    
    const content = `[package]
name = "${normalizedName}"
version = "0.1.0"
edition = "2021"
authors = ["${this.rustOptions.author || 'Plugin Author'} <${this.rustOptions.authorEmail || 'author@example.com'}>"]
description = "${description || 'A Rust plugin for the plugin registry'}"
license = "MIT"

[lib]
crate-type = ["cdylib"]

[dependencies]
${formattedDependencies}

[profile.release]
opt-level = 3
lto = true
codegen-units = 1
`;

    await writeFileAsync(path.join(projectPath, 'Cargo.toml'), content);
  }

  /**
   * Create src/lib.rs file
   * 
   * @param srcDir - Source directory
   * @param name - Plugin name
   */
  private async createLibRs(srcDir: string, name: string): Promise<void> {
    const normalizedName = name.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
    
    const content = this.rustOptions.useAdvancedApi 
      ? this.createAdvancedLibRs(normalizedName)
      : this.createBasicLibRs(normalizedName);
    
    await writeFileAsync(path.join(srcDir, 'lib.rs'), content);
  }

  /**
   * Create build.rs file
   * 
   * @param projectPath - Project path
   */
  private async createBuildRs(projectPath: string): Promise<void> {
    const content = `fn main() {
    // Make sure the build script runs again if the Cargo.toml changes
    println!("cargo:rerun-if-changed=Cargo.toml");

    // Make sure we update when files change
    println!("cargo:rerun-if-changed=src/");
}
`;

    await writeFileAsync(path.join(projectPath, 'build.rs'), content);
  }

  /**
   * Create basic lib.rs content
   * 
   * @param normalizedName - Normalized plugin name
   */
  private createBasicLibRs(normalizedName: string): string {
    return `use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

// A macro to provide println!-style syntax for console.log
macro_rules! console_log {
    ($($t:tt)*) => (log(&format!($($t)*)))
}

#[derive(Serialize, Deserialize)]
struct Input {
    tool: String,
    args: serde_json::Value,
}

#[derive(Serialize, Deserialize)]
struct Response {
    status: String,
    data: serde_json::Value,
}

#[derive(Serialize, Deserialize)]
struct ErrorResponse {
    status: String,
    error: String,
}

struct Plugin {
    name: String,
}

impl Plugin {
    fn new() -> Self {
        Self {
            name: "${normalizedName}".to_string(),
        }
    }

    fn greet(&self, name: &str) -> String {
        format!("Hello, {}! Welcome to the {} plugin.", name, self.name)
    }

    fn add(&self, a: f64, b: f64) -> f64 {
        a + b
    }

    fn invoke_tool(&self, tool_name: &str, args: &serde_json::Value) -> Result<serde_json::Value, String> {
        match tool_name {
            "greet" => {
                if let Some(name) = args.get("name").and_then(|n| n.as_str()) {
                    Ok(self.greet(name).into())
                } else {
                    Err("Missing required parameter: name".to_string())
                }
            },
            "add" => {
                let a = args.get("a").and_then(|a| a.as_f64()).unwrap_or(0.0);
                let b = args.get("b").and_then(|b| b.as_f64()).unwrap_or(0.0);
                Ok(self.add(a, b).into())
            },
            _ => Err(format!("Unknown tool: {}", tool_name))
        }
    }
}

#[wasm_bindgen]
pub fn run(input_json: &str) -> String {
    let plugin = Plugin::new();
    
    match serde_json::from_str::<Input>(input_json) {
        Ok(input) => {
            match plugin.invoke_tool(&input.tool, &input.args) {
                Ok(result) => {
                    let response = Response {
                        status: "success".to_string(),
                        data: result,
                    };
                    serde_json::to_string(&response).unwrap_or_else(|e| {
                        let err_response = ErrorResponse {
                            status: "error".to_string(),
                            error: format!("Failed to serialize response: {}", e),
                        };
                        serde_json::to_string(&err_response).unwrap_or_else(|_| {
                            r#"{"status":"error","error":"Failed to serialize error response"}"#.to_string()
                        })
                    })
                },
                Err(err) => {
                    let err_response = ErrorResponse {
                        status: "error".to_string(),
                        error: err,
                    };
                    serde_json::to_string(&err_response).unwrap_or_else(|_| {
                        r#"{"status":"error","error":"Failed to serialize error response"}"#.to_string()
                    })
                }
            }
        },
        Err(e) => {
            let err_response = ErrorResponse {
                status: "error".to_string(),
                error: format!("Invalid input JSON: {}", e),
            };
            serde_json::to_string(&err_response).unwrap_or_else(|_| {
                r#"{"status":"error","error":"Failed to serialize error response"}"#.to_string()
            })
        }
    }
}
`;
  }

  /**
   * Create advanced lib.rs content
   * 
   * @param normalizedName - Normalized plugin name
   */
  private createAdvancedLibRs(normalizedName: string): string {
    return `//! Plugin implementation for ${normalizedName}
use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};
use std::collections::HashMap;

// Console logging
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

// A macro to provide println!-style syntax for console.log
macro_rules! console_log {
    ($($t:tt)*) => (log(&format!($($t)*)))
}

// Input type for the plugin
#[derive(Serialize, Deserialize)]
struct Input {
    tool: String,
    args: serde_json::Value,
}

// Successful response
#[derive(Serialize, Deserialize)]
struct Response {
    status: String,
    data: serde_json::Value,
}

// Error response
#[derive(Serialize, Deserialize)]
struct ErrorResponse {
    status: String,
    error: String,
}

// Plugin tool type definition
type ToolFn = fn(&Plugin, &serde_json::Value) -> Result<serde_json::Value, String>;

// Main plugin struct
struct Plugin {
    name: String,
    tools: HashMap<String, ToolFn>,
}

impl Plugin {
    // Create a new plugin instance
    fn new() -> Self {
        let mut tools = HashMap::new();
        tools.insert("greet".to_string(), Plugin::greet as ToolFn);
        tools.insert("add".to_string(), Plugin::add as ToolFn);
        
        Self {
            name: "${normalizedName}".to_string(),
            tools,
        }
    }

    // Greet tool implementation
    fn greet(&self, args: &serde_json::Value) -> Result<serde_json::Value, String> {
        let name = args.get("name")
            .and_then(|n| n.as_str())
            .ok_or_else(|| "Missing required parameter: name".to_string())?;
            
        let greeting = format!("Hello, {}! Welcome to the {} plugin.", name, self.name);
        Ok(serde_json::Value::String(greeting))
    }

    // Add tool implementation
    fn add(&self, args: &serde_json::Value) -> Result<serde_json::Value, String> {
        let a = args.get("a")
            .and_then(|a| a.as_f64())
            .ok_or_else(|| "Missing or invalid parameter: a".to_string())?;
            
        let b = args.get("b")
            .and_then(|b| b.as_f64())
            .ok_or_else(|| "Missing or invalid parameter: b".to_string())?;
            
        Ok(serde_json::Value::Number(serde_json::Number::from_f64(a + b).unwrap()))
    }

    // Invoke a tool by name
    fn invoke_tool(&self, tool_name: &str, args: &serde_json::Value) -> Result<serde_json::Value, String> {
        match self.tools.get(tool_name) {
            Some(tool_fn) => tool_fn(self, args),
            None => Err(format!("Unknown tool: {}", tool_name))
        }
    }
}

// Format a successful response
fn format_success(data: serde_json::Value) -> String {
    let response = Response {
        status: "success".to_string(),
        data,
    };
    
    serde_json::to_string(&response).unwrap_or_else(|e| {
        format_error(format!("Failed to serialize response: {}", e))
    })
}

// Format an error response
fn format_error(error: String) -> String {
    let err_response = ErrorResponse {
        status: "error".to_string(),
        error,
    };
    
    serde_json::to_string(&err_response).unwrap_or_else(|_| {
        r#"{"status":"error","error":"Failed to serialize error response"}"#.to_string()
    })
}

// Main entry point for the plugin
#[wasm_bindgen]
pub fn run(input_json: &str) -> String {
    // Create plugin instance
    let plugin = Plugin::new();
    
    // Parse input JSON
    let input: Input = match serde_json::from_str(input_json) {
        Ok(input) => input,
        Err(e) => return format_error(format!("Invalid input JSON: {}", e))
    };
    
    // Invoke tool and format response
    match plugin.invoke_tool(&input.tool, &input.args) {
        Ok(result) => format_success(result),
        Err(err) => format_error(err)
    }
}

// Tests module
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_greet() {
        let plugin = Plugin::new();
        let args = serde_json::json!({
            "name": "Tester"
        });
        
        let result = plugin.greet(&args).unwrap();
        let greeting = result.as_str().unwrap();
        
        assert!(greeting.contains("Hello, Tester"));
        assert!(greeting.contains(&plugin.name));
    }

    #[test]
    fn test_add() {
        let plugin = Plugin::new();
        let args = serde_json::json!({
            "a": 5,
            "b": 7
        });
        
        let result = plugin.add(&args).unwrap();
        let sum = result.as_f64().unwrap();
        
        assert_eq!(sum, 12.0);
    }

    #[test]
    fn test_invoke_tool() {
        let plugin = Plugin::new();
        
        // Test greet tool
        let greet_result = plugin.invoke_tool("greet", &serde_json::json!({
            "name": "Tester"
        })).unwrap();
        
        assert!(greet_result.as_str().unwrap().contains("Hello, Tester"));
        
        // Test add tool
        let add_result = plugin.invoke_tool("add", &serde_json::json!({
            "a": 5,
            "b": 7
        })).unwrap();
        
        assert_eq!(add_result.as_f64().unwrap(), 12.0);
        
        // Test unknown tool
        let unknown_result = plugin.invoke_tool("unknown", &serde_json::json!({}));
        assert!(unknown_result.is_err());
    }
}
`;
  }

  /**
   * Create tests
   * 
   * @param projectPath - Project path
   * @param name - Plugin name
   */
  private async createTests(projectPath: string, name: string): Promise<void> {
    // Create tests directory
    const testsDir = path.join(projectPath, 'tests');
    await mkdirAsync(testsDir, { recursive: true });
    
    // Create integration test file
    const integrationTestContent = `//! Integration tests for the plugin
use serde_json::json;
use ${name.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase()}::run;

#[test]
fn test_greet_tool() {
    let input = json!({
        "tool": "greet",
        "args": {
            "name": "Integration Test"
        }
    });
    
    let result = run(&input.to_string());
    let parsed: serde_json::Value = serde_json::from_str(&result).unwrap();
    
    assert_eq!(parsed["status"], "success");
    assert!(parsed["data"].as_str().unwrap().contains("Hello, Integration Test"));
}

#[test]
fn test_add_tool() {
    let input = json!({
        "tool": "add",
        "args": {
            "a": 10,
            "b": 20
        }
    });
    
    let result = run(&input.to_string());
    let parsed: serde_json::Value = serde_json::from_str(&result).unwrap();
    
    assert_eq!(parsed["status"], "success");
    assert_eq!(parsed["data"], 30);
}

#[test]
fn test_invalid_tool() {
    let input = json!({
        "tool": "invalid_tool",
        "args": {}
    });
    
    let result = run(&input.to_string());
    let parsed: serde_json::Value = serde_json::from_str(&result).unwrap();
    
    assert_eq!(parsed["status"], "error");
    assert!(parsed["error"].as_str().unwrap().contains("Unknown tool"));
}

#[test]
fn test_invalid_input() {
    let result = run("not a valid json");
    let parsed: serde_json::Value = serde_json::from_str(&result).unwrap();
    
    assert_eq!(parsed["status"], "error");
    assert!(parsed["error"].as_str().unwrap().contains("Invalid input JSON"));
}
`;

    await writeFileAsync(path.join(testsDir, 'integration_test.rs'), integrationTestContent);
  }

  /**
   * Create .gitignore file
   * 
   * @param projectPath - Project path
   */
  private async createGitignore(projectPath: string): Promise<void> {
    const content = `# Generated by Cargo
/target/

# Remove Cargo.lock from gitignore if creating an executable, keep it for libraries
Cargo.lock

# These are backup files generated by rustfmt
**/*.rs.bk

# WASM artifacts
*.wasm
*.wat

# IDE
.idea/
.vscode/
*.swp
*.swo

# Generated bindings
/bindings/
`;

    await writeFileAsync(path.join(projectPath, '.gitignore'), content);
  }
} 
/**
 * Go plugin template generator implementation
 */
import * as fs from 'fs/promises';
import * as path from 'path';

import { TemplateGenerator, TemplateOptions } from '../common/template';
import { PDKError, PDKErrorCode } from '../../errors/pdk';

/**
 * Options specific to Go plugin template generation
 */
export interface GoTemplateOptions extends TemplateOptions {
  /**
   * Whether to use Go modules
   */
  useGoModules?: boolean;
  
  /**
   * Go module name
   */
  moduleName?: string;
  
  /**
   * Whether to add example tests
   */
  addExampleTests?: boolean;
  
  /**
   * Whether to include Makefile
   */
  includeMakefile?: boolean;
  
  /**
   * Go version to use
   */
  goVersion?: string;
  
  /**
   * Whether to use TinyGo
   */
  useTinyGo?: boolean;
}

/**
 * Go plugin template generator
 */
export class GoTemplateGenerator extends TemplateGenerator {
  /**
   * Default Go template options
   */
  private defaultGoOptions: GoTemplateOptions = {
    useGoModules: true,
    addExampleTests: true,
    includeMakefile: true,
    goVersion: '1.20',
    useTinyGo: true
  };

  /**
   * Constructor
   * 
   * @param options - Template options
   */
  constructor(options?: GoTemplateOptions) {
    super(options);
    this.options = { ...this.defaultGoOptions, ...options };
  }

  /**
   * Get Go-specific template options
   */
  get goOptions(): GoTemplateOptions {
    return this.options as GoTemplateOptions;
  }

  /**
   * Generate a new Go plugin project
   * 
   * @param projectPath - Path where to create the project
   * @param name - Project name
   * @param description - Project description
   */
  async generate(projectPath: string, name: string, description?: string): Promise<void> {
    try {
      // Create project directory if it doesn't exist
      await fs.mkdir(projectPath, { recursive: true });
      
      // Set default module name if not provided
      if (!this.goOptions.moduleName) {
        this.goOptions.moduleName = `github.com/user/${name.replace(/[^a-zA-Z0-9]/g, '-')}`;
      }
      
      // Generate go.mod file
      if (this.goOptions.useGoModules) {
        await this.generateGoMod(projectPath);
      }
      
      // Generate main.go file
      await this.generateMainGo(projectPath);
      
      // Generate plugin.go file
      await this.generatePluginGo(projectPath, name, description);
      
      // Generate example tests
      if (this.goOptions.addExampleTests) {
        await this.generateTests(projectPath);
      }
      
      // Generate Makefile
      if (this.goOptions.includeMakefile) {
        await this.generateMakefile(projectPath, name);
      }
      
      // Generate README.md
      await this.generateReadme(projectPath, name, description);
      
      // Initialize git repository if requested
      if (this.goOptions.initGit) {
        try {
          await fs.access(path.join(projectPath, '.git'));
        } catch {
          try {
            const { exec } = require('child_process');
            const util = require('util');
            const execAsync = util.promisify(exec);
            await execAsync('git init', { cwd: projectPath });
            
            // Create .gitignore
            const gitignore = `# Go specific
*.exe
*.exe~
*.dll
*.so
*.dylib
*.test
*.out
*.wasm

# Project specific
/dist
/build

# IDE specific
.idea/
.vscode/
*.swp
*.swo
`;
            await fs.writeFile(path.join(projectPath, '.gitignore'), gitignore);
          } catch (gitError) {
            // Git initialization failed but it's not critical, just log it
            console.warn(`Git initialization failed: ${gitError}`);
          }
        }
      }
    } catch (error) {
      if (error instanceof PDKError) {
        throw error;
      }
      
      throw new PDKError(
        `Failed to generate Go plugin template: ${error instanceof Error ? error.message : String(error)}`,
        PDKErrorCode.TEMPLATE_GENERATION_FAILED
      );
    }
  }

  /**
   * Generate go.mod file
   */
  private async generateGoMod(projectPath: string): Promise<void> {
    const content = `module ${this.goOptions.moduleName}

go ${this.goOptions.goVersion}

require (
	github.com/extism/go-pdk v0.0.0-latest
)
`;
    
    await fs.writeFile(path.join(projectPath, 'go.mod'), content);
  }

  /**
   * Generate main.go file
   */
  private async generateMainGo(projectPath: string): Promise<void> {
    const content = `package main

import (
	"github.com/extism/go-pdk"
)

//export greet
func greet() int32 {
	// Get the input
	input := pdk.Input()

	// Process the input (in this case, we just return it as is)
	output := input

	// Set the output
	mem := pdk.AllocateString(string(output))
	pdk.OutputMemory(mem)

	return 0
}

func main() {}
`;
    
    await fs.writeFile(path.join(projectPath, 'main.go'), content);
  }

  /**
   * Generate plugin.go file
   */
  private async generatePluginGo(projectPath: string, name: string, description?: string): Promise<void> {
    const content = `package main

import (
	"github.com/extism/go-pdk"
)

// Plugin information
const (
	PluginName        = "${name}"
	PluginVersion     = "0.1.0"
	PluginDescription = "${description || ''}"
)

//export get_plugin_info
func getPluginInfo() int32 {
	info := map[string]string{
		"name":        PluginName,
		"version":     PluginVersion,
		"description": PluginDescription,
	}

	jsonInfo, err := pdk.Json.Marshal(info)
	if err != nil {
		pdk.Log(pdk.LogError, "Failed to marshal plugin info: "+err.Error())
		return 1
	}

	mem := pdk.AllocateString(string(jsonInfo))
	pdk.OutputMemory(mem)
	return 0
}

//export initialize
func initialize() int32 {
	// You can put initialization code here
	pdk.Log(pdk.LogInfo, "Plugin initialized")
	return 0
}
`;
    
    await fs.writeFile(path.join(projectPath, 'plugin.go'), content);
  }

  /**
   * Generate example tests
   */
  private async generateTests(projectPath: string): Promise<void> {
    const content = `package main

import (
	"testing"
)

func TestGreet(t *testing.T) {
	// This is a placeholder for real tests
	// In a real test, you would use the Extism host library to test your plugin
	t.Log("Placeholder for greet test")
}

func TestGetPluginInfo(t *testing.T) {
	// This is a placeholder for real tests
	// In a real test, you would use the Extism host library to test your plugin
	t.Log("Placeholder for getPluginInfo test")
}
`;
    
    await fs.writeFile(path.join(projectPath, 'main_test.go'), content);
  }

  /**
   * Generate Makefile
   */
  private async generateMakefile(projectPath: string, name: string): Promise<void> {
    let content: string;
    
    if (this.goOptions.useTinyGo) {
      content = `.PHONY: build clean test

NAME = ${name}

build:
	tinygo build -o plugin.wasm -target=wasm .

build-release:
	tinygo build -o plugin.wasm -target=wasm -opt=2 .

test:
	go test -v ./...

clean:
	rm -f plugin.wasm
`;
    } else {
      content = `.PHONY: build clean test

NAME = ${name}

build:
	GOOS=js GOARCH=wasm go build -o plugin.wasm .

build-release:
	GOOS=js GOARCH=wasm go build -ldflags="-s -w" -o plugin.wasm .

test:
	go test -v ./...

clean:
	rm -f plugin.wasm
`;
    }
    
    await fs.writeFile(path.join(projectPath, 'Makefile'), content);
  }

  /**
   * Generate README.md
   */
  private async generateReadme(projectPath: string, name: string, description?: string): Promise<void> {
    const content = `# ${name}

${description || 'A Go plugin for Extism.'}

## Requirements

- Go ${this.goOptions.goVersion} or later
${this.goOptions.useTinyGo ? '- TinyGo (recommended for smaller builds)\n' : ''}
- Extism PDK for Go

## Building

You can build the plugin using the provided Makefile:

\`\`\`sh
make build
\`\`\`

This will create a \`plugin.wasm\` file that you can use with the Extism runtime.

## Testing

To run the tests:

\`\`\`sh
make test
\`\`\`

## Functions

### greet

A simple function that echoes back the input.

### getPluginInfo

Returns information about the plugin including its name, version, and description.

## Usage

You can use this plugin with any Extism host SDK.

`;
    
    await fs.writeFile(path.join(projectPath, 'README.md'), content);
  }
} 